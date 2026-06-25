---
status: issues_found
area: CMS API & Security Core
files_reviewed: 14
findings: { critical: 1, warning: 8, info: 6, total: 15 }
---

# AREA 1 — CMS API & Security Core Review

Scope: `apps/cms` custom REST endpoints, Express server bootstrap, Payload config,
TOTP 2FA, Resend email, Postgres rate-limit store, MT5 proxy/cache/sync.

Reviewed files: `endpoints/index.ts`, `server.ts`, `payload.config.ts`, `auth/totp.ts`,
`auth/totp.mock.ts`, `components/TwoFactorLoginField.tsx`, `email/resend.ts`,
`email/transport.ts`, `email/transport.mock.ts`, `email/escapeHtml.ts`,
`rateLimit/postgresStore.ts`, `cache/mt5Cache.ts`, `jobs/mt5Sync.ts`,
`globals/SiteSettings.ts` + `collections/Users.ts` (cross-ref).

Overall the security posture is unusually careful for this layer: timing-safe token
compare, salted IP hashing, server-side input validation with length caps, HTML
escaping on all email interpolation, parameterized SQL in the rate-limit store,
graceful MT5 fallback, and `overrideAccess` reads scoped to admin-only fields. The
findings below are the residual gaps.

---

### [CRITICAL] Admin login lockout (brute-force protection) is disabled by overriding `auth` without `maxLoginAttempts`

**File:** `apps/cms/src/collections/Users.ts:18-36`

**What's wrong:** The `Users` collection sets `auth: { forgotPassword: {...} }` — an
object — but never specifies `maxLoginAttempts` / `lockTime`. In Payload v2, those
account-lockout defaults (`maxLoginAttempts: 5`, `lockTime: 600000`) are applied by
`sanitizeCollection` **only when `auth` is `true` / left at defaults**; once you pass
an explicit auth-options object the unspecified numeric fields are taken as provided
(i.e. `maxLoginAttempts` is `undefined` → falsy → lockout disabled). The result is
that the admin login endpoint (`POST /api/users/login`) has **no account lockout**:
an attacker can brute-force admin passwords at the full request rate. The custom
Postgres rate limiter is **not** applied to Payload's built-in `/api/users/login`
route (it is only attached to the custom `/api/...` endpoints in `endpoints/index.ts`),
so there is no compensating throttle either. For a forex broker admin panel guarding
PII (newsletter subscribers, contact submissions, IP hashes) this is a real, exploitable
weakening of a core auth control.

> Note: confirm the exact default-merge behavior against the pinned `payload@^2` version
> before shipping the fix — but in either case explicitly setting the values is correct
> and removes the ambiguity.

**Impact:** Unlimited online password-guessing against admin accounts; 2FA only helps
for users who have enrolled (enrolment is optional — `totpEnabled` defaults to `false`),
so non-2FA admins are fully exposed.

**Fix:** Set the lockout explicitly, and add a rate limiter to the login route.

```ts
// Users.ts
auth: {
  maxLoginAttempts: 5,
  lockTime: 10 * 60 * 1000, // 10 minutes
  forgotPassword: { /* ... */ },
},
```

```ts
// endpoints/index.ts — throttle the built-in login endpoint too
const loginLimiter = makeLimiter(10, 'login');
app.post('/api/users/login', loginLimiter, (_req, _res, next) => next());
```

---

### [WARNING] Education gate returns the raw public file URL — the "gate" is bypassable and the captured email is optional

**File:** `apps/cms/src/endpoints/index.ts:875-879`

**What's wrong:** `/api/education/gate` validates the email format and upserts a pending
subscriber, then returns `content.pdfFile.url` — the **public, unsigned Media URL**. The
comment acknowledges "In production this would be a short-lived signed R2 URL," but as
written: (a) any well-formed email (e.g. `a@a.a`) unlocks the file — no confirmation
required; (b) the returned URL is the same static asset path that the Media collection
serves publicly, so the file is reachable without ever calling the gate; (c) `contentId`
is enumerable, so an attacker can script harvesting of every gated asset URL. The
`isGated` / `status==='published'` checks bound this to published gated content only,
which is why this is a WARNING rather than critical — but the lead-capture control is
effectively cosmetic today.

**Impact:** Gated lead-magnet PDFs are downloadable without providing a real/owned email;
lead capture can be trivially polluted or skipped.

**Fix:** Serve gated PDFs only via a signed, short-TTL URL (R2 presign / a tokenized
CMS download route) and make Media for gated content non-public; do not return a
durable asset path from the gate. Until R2 is wired (NE-027), at minimum route the
download through a one-time signed token rather than the bare `pdfFile.url`.

---

### [WARNING] Rate limiting is IP-keyed under `trust proxy: 1`, so spoofed `X-Forwarded-For` can bypass limits behind a multi-hop edge (Cloudflare → Railway)

**File:** `apps/cms/src/server.ts:15` (+ all limiters in `endpoints/index.ts:115-125`)

**What's wrong:** `app.set('trust proxy', 1)` tells Express to trust exactly one proxy
hop and derive `req.ip` from the **second-to-last** entry of `X-Forwarded-For`. The
documented deployment puts the CMS behind Cloudflare _and_ the platform proxy
(Railway/EC2) — i.e. potentially **two** trusted hops. If the real hop count is greater
than 1, a client-supplied `X-Forwarded-For` value lands in the position Express reads,
letting an attacker rotate the apparent IP on every request and defeat every limiter
(`contact` 3/min, `newsletter`/`partners`/`education` 5/min, `webinar` 10/min). All of
those endpoints write rows to Postgres (`contact-submissions`, `newsletter-subscribers`,
`webinar-registrations`) and trigger Resend emails, so a bypass enables DB/email flooding.

**Impact:** Rate-limit bypass → submission spam, email-send abuse (Resend quota/cost),
and consent-record pollution.

**Fix:** Set `trust proxy` to the **actual** number of hops for the target environment
(e.g. `2` behind Cloudflare→Railway), or pin to the known proxy via a CIDR list, and
prefer a trusted edge header (Cloudflare's `CF-Connecting-IP`) for the rate-limit key:

```ts
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 2));
// or, when behind Cloudflare, key the limiter on CF-Connecting-IP:
rateLimit({
  /* ... */ keyGenerator: (req) => (req.header('cf-connecting-ip') ?? req.ip) as string,
});
```

---

### [WARNING] TOTP verification has no replay/anti-reuse window control and no rate limiting — codes are reusable within their validity step

**File:** `apps/cms/src/auth/totp.ts:82, 128, 159`

**What's wrong:** All three `authenticator.verify(...)` calls use otplib defaults with
no `window` hardening and, more importantly, **no single-use enforcement**: a 6-digit
TOTP captured (shoulder-surf, proxy, reused login form submit) stays valid for the whole
30-second step and can be replayed for multiple `enforceTotpOnLogin` attempts. There is
also no throttle on `/2fa/verify`, `/2fa/disable`, or the login OTP check, so the 6-digit
space can be guessed online (combined with the disabled account lockout above, this is a
realistic 2FA-bypass avenue: ~1e6 codes, no lockout). 2FA codes should be one-time.

**Impact:** Replayable / online-guessable second factor weakens the 2FA control it is
meant to provide.

**Fix:** Record the last-accepted TOTP step (or last code hash) on the user and reject
reuse; pin `authenticator.options = { window: 1 }` for clock skew only; and apply a
strict limiter to the 2FA + login routes. Example anti-replay:

```ts
const step = Math.floor(Date.now() / 30000);
if (user.totpLastStep === step) throw new Error('Code already used.');
// on success: await req.payload.update({ ..., data: { totpLastStep: step } });
```

---

### [WARNING] Newsletter "already subscribed" / education-gate / unsubscribe responses are an unauthenticated email-enumeration oracle

**File:** `apps/cms/src/endpoints/index.ts:486-488` (subscribe) and `822-873` (gate)

**What's wrong:** `POST /api/newsletter/subscribe` returns the distinct message
`"You are already subscribed."` only when a record with `status === 'subscribed'`
exists, versus `"Please check your email…"` otherwise. That difference lets an
unauthenticated caller test whether any given email is a confirmed subscriber (the
unsubscribe path was correctly hardened to a uniform response at line 720-722, but
subscribe was not). The education-gate path similarly branches observably on whether the
email already exists (it only sends a confirmation for new emails). For a broker, the
subscriber list is a marketing asset and a privacy concern.

**Impact:** Membership/email enumeration of the subscriber base by an anonymous attacker.

**Fix:** Return a single generic success message for subscribe regardless of prior state
(still short-circuit the DB work internally), matching the uniform-response pattern
already used by `/unsubscribe`.

---

### [WARNING] `mt5Sync` background job can wedge permanently if the first tick throws synchronously before scheduling the next run

**File:** `apps/cms/src/jobs/mt5Sync.ts:210-216`

**What's wrong:** `run()` awaits `runSync()` and only then calls
`setTimeout(run, nextMs)`. `runSync` is largely try/wrapped, but the scheduling line is
_outside_ any catch: if `runSync` rejects (e.g. an unexpected throw from
`payload.findGlobal` before its try, or any non-caught path), the rejection propagates
out of the `async run`, **no next tick is scheduled**, and the sync job dies silently for
the remainder of the process lifetime (no live MT5 data refresh, stale `mt5:instruments:all`
cache). There is no `.catch` on the initial `setTimeout(run, 5000)` either, so the
unhandled rejection is invisible apart from a process-level warning.

**Impact:** A single unexpected error permanently stops background price syncing until a
full CMS restart; degraded/stale market data with no self-recovery.

**Fix:** Wrap the body and always reschedule in `finally`:

```ts
const run = async (): Promise<void> => {
  let nextMs = DEFAULT_INTERVAL_MS;
  try {
    nextMs = await runSync(payload);
  } catch (err) {
    payload.logger.error({ err }, 'mt5Sync: tick threw');
  } finally {
    setTimeout(run, nextMs);
  }
};
setTimeout(run, 5_000);
```

---

### [WARNING] `nodemailer` SMTP transport is constructed and `transport.verify()` is fired at module-import time — Resend API key handling + cold-start error noise / no admin bundle guarantee

**File:** `apps/cms/src/email/transport.ts:19-55`

**What's wrong:** Two issues. (1) The transport is created at import with
`pass: process.env.RESEND_API_KEY ?? ''` — when the key is unset in a non-prod
environment this silently builds a transport authenticating with an empty password and
(unless `SKIP_SMTP_VERIFY`/test) immediately opens an SMTP socket and logs at import
time, which runs as a side effect of merely importing the config. (2) The whole module
is server-only and depends on the webpack alias in `payload.config.ts` to keep
`nodemailer` out of the browser bundle; that alias is correct today, but the import-time
`transport.verify()` side effect means any accidental server-side import path eagerly
dials SMTP. Side-effectful module init for a network/credentialed client is fragile.

**Impact:** Cold-start latency + error log spam where port 465 is blocked; empty-credential
transport in misconfigured envs; import-time network side effect.

**Fix:** Lazily construct the transport on first send (mirror `resend.ts`'s `getClient()`
lazy pattern), and gate the `verify()` call behind an explicit opt-in rather than running
it as an import side effect.

---

### [WARNING] MT5 proxy trusts admin-supplied `mt5ApiEndpoint` as a fetch target with no scheme/host allow-listing (SSRF surface via a compromised/over-privileged admin)

**File:** `apps/cms/src/endpoints/index.ts:208-216, 392-404`; field at `globals/SiteSettings.ts:30-41`

**What's wrong:** The bridge base URL comes from `settings.mt5ApiEndpoint` (a free-text
SiteSettings field with no `validate`) and is fed into `new URL(...)` + `fetch` with the
`mt5ApiKey` bearer attached. Because this is a public, unauthenticated endpoint
(`GET /api/mt5/instruments`) that performs the outbound fetch, any actor who can set that
field — a compromised admin session, a CSRF/stored-config tamper, or an over-broad role —
turns the CMS into an SSRF relay (e.g. `http://169.254.169.254/...`, internal services),
and the configured bearer token is sent to that attacker-chosen host. The blast radius is
gated by admin access, hence WARNING, but the field has zero validation and the token is
forwarded to whatever host is configured.

**Impact:** SSRF / internal-network reachability and bearer-token exfiltration if the
SiteSettings value is ever attacker-influenced.

**Fix:** Validate `mt5ApiEndpoint` with an allow-list (https only, host in a configured
set) at the field level, and re-validate scheme/host server-side before `fetch`:

```ts
{ name: 'mt5ApiEndpoint', type: 'text', validate: (v) => {
    if (!v) return true;
    try { const u = new URL(v);
      return u.protocol === 'https:' ? true : 'Must be an https URL'; }
    catch { return 'Must be a valid URL'; } } }
```

---

### [INFO] `safeTokenCompare` is correct but length-comparison still short-circuits on mismatched length

**File:** `apps/cms/src/endpoints/index.ts:68-77`

**What's wrong:** `a.length === b.length && timingSafeEqual(...)` leaks token _length_
via timing (length check returns before the constant-time compare). For the health token
this is negligible (length is not secret). Noted for completeness; the construction is
otherwise correct and `timingSafeEqual` is used properly.

**Fix:** Acceptable as-is for these tokens. If you want strict length-hiding, hash both
sides to a fixed width before comparing: `timingSafeEqual(sha256(a), sha256(b))`.

---

### [INFO] `escapeHtml` does not encode for HTML-attribute/URL contexts; relies on callers escaping URLs into `href`

**File:** `apps/cms/src/email/escapeHtml.ts:6-13` (used in `resend.ts`, `Users.ts`)

**What's wrong:** The helper escapes the five HTML metacharacters — correct for element
text and double-quoted attribute values, which is how it is used (`href="${escaped}"`,
all attributes double-quoted). It does **not** percent-encode URLs, so a malformed
`confirmUrl`/`unsubscribeUrl` containing `"` is neutralized (quote → `&quot;`), but a
`javascript:`-scheme value would survive intact. In practice these URLs are built from
controlled env vars + UUID tokens, so this is informational. Keep all interpolations
inside double-quoted attributes (they currently are).

**Fix:** None required given current usage; if user-influenced URLs ever reach these
templates, validate the scheme (`https:`/`http:`) before interpolation.

---

### [INFO] Postgres rate-limit store: `init()` overwrites `windowMs`, and there is no expired-row cleanup (table grows unbounded)

**File:** `apps/cms/src/rateLimit/postgresStore.ts:39-41, 47-65`

**What's wrong:** Queries are correctly parameterized (no injection) and the upsert is
atomic. Two minor notes: (1) every limiter shares one store class instance per prefix and
`init()` sets `windowMs` from options — fine here since all limiters use the same window,
but a per-limiter window would be silently coupled. (2) Rows are only ever reset on the
next `increment` for the same key; keys that go idle are never deleted, so
`rate_limit_hits` accumulates one row per distinct (prefix, IP) forever. Functionally
harmless (counts reset on expiry) but the table grows without bound.

**Fix:** Add a periodic `DELETE FROM rate_limit_hits WHERE expires_at < now()` (cron or
on store init), e.g. every few minutes.

---

### [INFO] `MT5_FETCH_TIMEOUT_MS` etc. parsed via `Number(...)` with no NaN guard

**File:** `apps/cms/src/endpoints/index.ts:42-47`; `jobs/mt5Sync.ts:6`

**What's wrong:** `Number(process.env.X ?? default)` returns `NaN` if the env var is set
to a non-numeric string (e.g. `RATE_LIMIT_WINDOW_MS=fast`). `NaN` then flows into
`windowMs`/`setTimeout`, where `setTimeout(fn, NaN)` behaves like `0` and `rateLimit`
windowMs of `NaN` disables effective limiting. Defaults via `??` only cover _unset_, not
_malformed_. Low likelihood (operator error) but silent.

**Fix:** Validate after parsing: `const n = Number(raw); if (!Number.isFinite(n)) use default;`.

---

### [INFO] `/api/newsletter/confirm` welcome/sync side effects run on every confirm hit, and `confirmToken` lookup is not constant-time

**File:** `apps/cms/src/endpoints/index.ts:586-663`

**What's wrong:** Token format is validated (`/^[0-9a-f-]{36}$/`) and the DB lookup is by
`confirmToken`. The token is a UUIDv4 (122 bits entropy) so enumeration is infeasible —
hence informational — but the lookup is a normal indexed equality (DB-timing dependent,
not constant-time). Also the welcome email + audience sync fire on the confirm request
path; both are correctly wrapped non-fatal. No action needed beyond awareness.

**Fix:** None required; UUID entropy makes timing immaterial here.

---

### [INFO] Contact/partners store `email` exactly as received (validated by regex) — acceptable, but no normalization

**File:** `apps/cms/src/endpoints/index.ts:930-942, 1022-1034`

**What's wrong:** `email` is persisted raw (not lowercased/trimmed) after passing
`EMAIL_PATTERN`. The regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) forbids whitespace and is
sufficient to prevent CRLF/header injection into the Resend `to`/`replyTo` fields (and
Resend uses an HTTP API, not raw SMTP, so header injection is not reachable regardless).
Informational only: inconsistent casing vs the newsletter collection (which lowercases).

**Fix:** Optional — `.trim().toLowerCase()` the stored email for consistency.

---

## Verification notes (checked, NOT findings)

- **SQL injection (rate-limit store):** all queries parameterized (`$1`/`$2`) — clean.
- **Payload `where` filters:** built from validated/typed values, run through Payload's
  query layer (parameterized) — no NoSQL/SQL injection in endpoint queries.
- **HTML email injection:** every user-supplied interpolation (`name`, `email`, `subject`,
  `message`, `webinarTitle`, partner k/v) is `escapeHtml`-wrapped — clean.
- **Open redirect (`/newsletter/confirm`, `/unsubscribe` GET):** redirect target host is
  compared against `FRONTEND_URL` host; `javascript:`/foreign hosts fall through to JSON — safe.
- **Health endpoint:** token-gated with timing-safe compare; 401 when token unset — correct.
- **Secret exposure:** `mt5ApiKey`/`totpSecret`/`totpTempSecret` have `read` access denied;
  `overrideAccess` reads are server-side only and never serialized to clients — correct.
- **IP PII:** raw IPs are never stored; salted SHA-256 only (prod-enforced salt) — correct.
- **CORS/CSRF:** restricted to `FRONTEND_URL` (single origin) in `payload.config.ts` — correct.
- **`push:false` drift, `rate_limit_hits` out-of-schema, totp.mock alias, admin-only 403s:**
  intentional per project notes — excluded.
