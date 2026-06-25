---
status: issues_found
scope: full codebase (apps/web, apps/cms, apps/mt5-service, packages/*)
review_type: full-codebase security + bug + quality review
depth: standard (per-area, parallel)
reviewed: 2026-06-18
files_reviewed: ~95 source files across 4 areas
findings:
  critical: 3
  warning: 16
  info: 18
  total: 37 # 41 raw findings before merging cross-area duplicates
areas:
  - code-review/01-cms-api-security.md # CMS API & Security Core
  - code-review/02-cms-data-collections.md # CMS Collections & Migrations
  - code-review/03-web-frontend.md # Web Frontend (Next.js)
  - code-review/04-packages-mt5.md # Shared UI & MT5 Service
---

# NewEra365 — Full Codebase Review

Reviewed the whole monorepo for bugs, logic errors, and security concerns using four
parallel focused passes. This file is the consolidated master; per-area detail (with
fixes and code snippets for every finding) lives in `01-`…`04-*.md`.

**Note on scope:** This repo is not a GSD phase project (`.planning/` absent), so the
review covered the entire codebase rather than a single phase diff. The ~80 `loading.tsx`
skeletons and `*Demo.tsx` scaffolds were intentionally excluded (presentational, no
security surface). Auth pages (`/register`, `/login`) are owned by the client CRM and out
of scope. The MT5 mock data was treated as intentional (NE-003).

## Headline

The frontend and the CMS's hand-written security primitives are genuinely solid
(parameterized SQL, timing-safe health-token compare, salted IP hashing, HTML-escaped
email templates, restricted admin CORS, no client secret leaks, no `dangerouslySetInnerHTML`
on untrusted input). **The real risk is in Payload access control**: the public REST API
exposes data the frontend only _appears_ to gate. Three issues share one root cause —
`read: () => true` plus public file URLs — and together they let an anonymous visitor read
unpublished/embargoed content and harvest every "gated" lead-magnet PDF without submitting
the form. On a regulated broker site that publishes embargoed market analysis and versioned
legal pages, that is the finding to fix first.

---

## CRITICAL (3) — fix before launch

### CR-1 · Unpublished / draft / embargoed content readable via public REST API

**Where:** `apps/cms/src/collections/LegalPages.ts:15` and 10 more content collections —
`ResearchReports.ts:12`, `Promotions.ts:13`, `EducationContent.ts:13`, `BlogPosts.ts:12`,
`News.ts:12`, `MarketAnalysis.ts:12`, `Careers.ts:12`, `Webinars.ts:12`, `AnalystCalls.ts:11`,
`IBContent.ts:14`.
All declare `access.read: () => true`. The frontend filters by `status`, but Payload's REST
API is internet-reachable and ignores that — `GET /api/market-analysis?locale=en` returns
**draft and embargoed** documents to anyone. For a broker this leaks embargoed research,
unannounced promotions, and unpublished/superseded legal versions.
**Fix:** anonymous read should return `{ status: { equals: 'published' } }`; authenticated
(`req.user`) read returns everything. Apply to all 11 collections.

### CR-2 · "Gated" PDF / lead-capture wall is fully bypassable

**Where:** `apps/cms/src/collections/Media.ts:8`, `ResearchReports.ts` (reportFile),
`EducationContent.ts` (pdfFile), and the gate endpoint `apps/cms/src/endpoints/index.ts:875-879`.
Public reads expose the file `url` regardless of the `isGated` flag, and the gate endpoint
returns the raw public URL on any well-formed email. `contentId` is enumerable, so all gated
ebooks/reports are harvestable without ever submitting the form — the email wall is cosmetic.
**Fix:** add field-level `access.read` that hides the file unless `req.user` or `isGated===false`;
serve gated assets through short-lived signed URLs (R2 is already planned, NE-027) instead of
permanent public URLs.

### CR-3 · Admin panel open to unlimited password brute-force

**Where:** `apps/cms/src/collections/Users.ts:18-36`.
The `auth` object is set without `maxLoginAttempts` / `lockTime`, so account lockout is
effectively off, and Payload's built-in `POST /api/users/login` is **not** covered by the
custom Postgres rate limiter (limiters are attached only to the custom `/api/...` routes).
Compounded by optional, replayable, unthrottled TOTP (see WR-2), this is a practical
online brute-force path to the admin panel that guards all subscriber/contact PII.
**Fix:** set `auth.maxLoginAttempts: 5`, `auth.lockTime: 600000`, and attach a rate limiter
to the login route. Verify against the pinned Payload v2 version's default-merge semantics.

---

## WARNING (16) — real bugs / hardening gaps

### Security & abuse

- **WR-1 · IP rate limits trivially bypassable** — `apps/cms/src/server.ts:15` sets
  `trust proxy: 1`, but the documented edge is Cloudflare→Railway (2 hops). Clients can spoof
  `X-Forwarded-For` to defeat every IP limiter (contact, newsletter, webinar, partners,
  education) → submission/email flooding. Fix: set the real hop count or key limits on
  `CF-Connecting-IP`.
- **WR-2 · TOTP replay + unthrottled OTP** — `apps/cms/src/auth/totp.ts:82,128,159`. Codes
  have no single-use enforcement and the 2FA/login OTP routes aren't throttled. Fix: record
  last-accepted step, `window: 1`, throttle the routes.
- **WR-3 · SSRF + bearer-token exfil via `mt5ApiEndpoint`** —
  `apps/cms/src/endpoints/index.ts:208-216,392-404` fetches the admin-set
  `SiteSettings.mt5ApiEndpoint` (no scheme/host validation) with the bearer token attached.
  Fix: validate `https://` + host allow-list on the field and re-check server-side before fetch.
- **WR-4 · Subscriber email-enumeration oracle** — `apps/cms/src/endpoints/index.ts:486-488`
  returns a distinct "already subscribed" message. Fix: return one generic success regardless
  of prior state.
- **WR-5 · Predictable committed admin credentials** — `apps/cms/src/scripts/ensure-admin.ts:26-27`
  (also `seed.ts:24-25`) ships `admin@newera365.com` / `Admin123!` as a fallback and **resets
  the password to it on every run**, against the shared prod `DATABASE_URL`. Fix: require the
  password from env (no default) and refuse to run when `NODE_ENV=production`.
- **WR-6 · Unvalidated CMS URLs rendered into `href`/`src` (stored-XSS vector)** —
  `packages/ui/src/components/RichText.tsx:122-132,144-151` plus `AwardsPage:194`,
  `MediaPressPage:124/151/256`, `PlatformPage:284`, `ResearchPage:522`, `TrustStrip:45`,
  `WebinarsPage:240`, `Footer:246`. A `javascript:`/`data:` URL stored in the CMS executes on
  click. Fix: add a shared `safeUrl()` helper allowlisting `https?:|mailto:|tel:|/|#` and apply
  to every CMS-derived URL.
- **WR-7 · MT5 service: wildcard CORS + skippable auth** — `apps/mt5-service/src/index.ts:33`
  uses `cors()` (`*`) and the internal-token middleware is skipped entirely when its env var is
  unset. Fix: origin allowlist; treat a missing `MT5_INTERNAL_API_TOKEN` as a hard failure in prod.

### Reliability & correctness

- **WR-8 · CMS fetches have no timeout** — `apps/web/src/lib/cms.ts:439,461`. A hung
  Neon-backed CMS stalls every SSR render (`getSiteSettings` runs in the root layout). Fix:
  `signal: AbortSignal.timeout(8000)` so a hang falls into the existing catch.
- **WR-9 · Background MT5 sync dies permanently on one throw** —
  `apps/cms/src/jobs/mt5Sync.ts:210-216` schedules the next tick only after `runSync` resolves,
  outside any catch. Fix: reschedule in a `finally` with try/catch.
- **WR-10 · Email transport built + `verify()` as import-time side effect** —
  `apps/cms/src/email/transport.ts:19-55` dials SMTP on any server import and builds an
  empty-credential transport when misconfigured. Fix: construct lazily on first send; gate
  `verify()` behind opt-in.
- **WR-11 · Legal-version archiving can unpublish the wrong document** —
  `apps/cms/src/hooks/index.ts:24-55` scopes demotion by `req.locale`, but `status` is a
  non-localized shared column, so publishing one locale can unpublish another locale's doc.
  Fix: make `status` localized or drop the locale scoping.

### Config & build

- **WR-12 · No prod assertion for `NEXT_PUBLIC_CMS_URL` → silent `localhost:3001` fallback** —
  `apps/web/next.config.mjs:73` bakes localhost into the CSP `connect-src` (blocking all client
  fetches under `upgrade-insecure-requests`), and the four public forms
  (`ContactPage:99`, `NewsletterPage:25`, `EbooksPage:52`, `WebinarsPage:24-27`) POST leads to
  the **visitor's own machine**. Fix: throw at build time when the var is unset in production.
- **WR-13 · Prod CSP allows `script-src 'unsafe-inline'`** — `apps/web/next.config.mjs:56`
  (NE-028), no nonce. Removes XSS defense-in-depth. Fix: nonce-based script-src.
- **WR-14 · Migration 004 is non-idempotent** —
  `apps/cms/migrations/004_rename_enum_columns_to_camelcase.sql:6-10` uses bare `RENAME COLUMN`,
  which errors on re-run and aborts the batch, breaking the repo's "safe to re-run" contract.
  Fix: guard with `DO $$ … IF EXISTS(information_schema.columns…) …`.
- **WR-15 · Direct-endpoint host derivation can target the wrong host** —
  `apps/cms/src/scripts/migrate-missing-columns.ts:20-25` (and `migrate-ib-steps-array-id.ts`)
  does `replace(/-pooler\./, '.')`, a silent no-op if the substring is absent → DDL against the
  pooler/wrong host. Fix: assert the host changed, or require an explicit `DATABASE_URL_DIRECT`.
- **WR-16 · Article detail routes never 404** —
  `apps/web/src/app/[locale]/blog/[slug]/page.tsx:43-56` (also `research/[slug]`, `guides/[slug]`)
  return HTTP 200 with thin generic content for any slug → unbounded indexable soft-404s. Fix:
  `notFound()` for unknown slugs, or `robots: { index: false }` on the fallback.

---

## INFO (18) — quality / minor hardening

| ID   | Location                                                     | Note                                                                                                                      |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| I-1  | `endpoints/index.ts:68-77`                                   | `safeTokenCompare` short-circuits on length mismatch (leaks token length via timing; negligible for health token)         |
| I-2  | `email/escapeHtml.ts:6-13`                                   | Escapes 5 metachars only; won't neutralize a `javascript:` scheme if user URLs ever reach templates                       |
| I-3  | `rateLimit/postgresStore.ts:39-65`                           | Idle keys never deleted → `rate_limit_hits` grows unbounded; add periodic `DELETE WHERE expires_at < now()`               |
| I-4  | `endpoints/index.ts:42-47`, `jobs/mt5Sync.ts:6`              | `Number(env ?? default)` yields `NaN` for malformed env → silently disables limiting/timing; guard with `Number.isFinite` |
| I-5  | `endpoints/index.ts:586-663`                                 | `/newsletter/confirm` token lookup not constant-time (immaterial given 122-bit UUID token)                                |
| I-6  | `endpoints/index.ts:930-942,1022-1034`                       | contact/partners persist email raw (no trim/lowercase) vs newsletter which normalizes                                     |
| I-7  | `scripts/apply-schema.mjs:149-166`                           | Swallows non-benign DDL errors and exits 0; should track failures and `exit(1)`                                           |
| I-8  | `collections/Webinars.ts:36-48`                              | `zoomRegistrationLink`/`zoomWebinarId` returned by public read (UI-hidden only) — confirm intent                          |
| I-9  | `collections/_fields.ts:24-49`                               | `slugField` has no length cap before the unique index; truncate ~80 chars                                                 |
| I-10 | `apps/web/vercel.json:12`, `vercel.json:12`                  | Deprecated `X-XSS-Protection: 1; mode=block` + duplicate header files; set `0` / consolidate                              |
| I-11 | `markets/[category]/page.tsx:23-25`, `platform/[slug]:14-16` | `generateStaticParams` omits `locale` (inconsistent with blog/research/guides) → loses per-locale SSG                     |
| I-12 | `lib/cms.ts:437`                                             | Collection `slug` interpolated unescaped into URL path (no exploit today); `encodeURIComponent` for defense-in-depth      |
| I-13 | `lib/cms.ts:441,461`                                         | `res.json()` cast straight to `T` with no shape validation though `zod` is a dep                                          |
| I-14 | `lib/cms.ts:496-502`                                         | `slugToTitle` applies English Title Case to Arabic fallback titles                                                        |
| I-15 | `TradingViewWidget.tsx:51-86`                                | `buildConfig` spreads caller `symbol`/`config` into embed script (safe today; allowlist if dynamic)                       |
| I-16 | `LanguageToggle.tsx:31`                                      | `NEXT_LOCALE` cookie set without `Secure` (non-sensitive; hygiene)                                                        |
| I-17 | `RichText.tsx:52,64,183-187`                                 | Heading anchor IDs are pure text slugs → duplicate DOM `id`s / broken ToC anchors                                         |
| I-18 | `AuthModal.tsx:51-57`                                        | `aria-modal` dialog lacks focus trap / initial focus (a11y)                                                               |

---

## Verified clean (negative results worth knowing)

The reviewers confirmed (not assumed) the absence of common vulnerabilities:

- **No XSS on untrusted input** — the only `dangerouslySetInnerHTML` is a static hardcoded
  JSON-LD object in `[locale]/layout.tsx:140`; `packages/ui` has none. (CMS URLs in `href` are
  WR-6, a separate, lesser vector.)
- **No client secret leaks** — every `NEXT_PUBLIC_*` read is genuinely public; `MT5_SERVICE_URL`
  is server-only; no hardcoded API keys in client code.
- **No SQL injection** — all migration/DDL/seed SQL uses static literals; the rate-limit store
  and runtime queries are parameterized.
- **PII collections are correctly locked** — `ContactSubmissions`, `NewsletterSubscribers`,
  `WebinarRegistrations`, `Users`, and `SiteSettings` secret fields all enforce auth.
- **Email templates** are HTML-escaped; the health token uses `timingSafeEqual`; IP addresses
  are salted-hashed; admin CORS is restricted; every `target="_blank"` already has
  `rel="noopener noreferrer"`.

## Suggested fix order

1. **CR-1, CR-2** (one change set — publish-status read access + field-level file gating). Highest impact, contained to `apps/cms/src/collections/*`.
2. **CR-3 + WR-1 + WR-2** (admin-auth hardening: lockout + login rate-limit + TOTP replay/throttle).
3. **WR-5** (drop committed default admin password) — quick, high value.
4. **WR-6** (`safeUrl()` helper) and **WR-12** (build-time env assertion) — small, broad blast radius.
5. Remaining warnings, then info batch.
