---
status: issues_found
area: 'Web Frontend (Next.js)'
files_reviewed:
  - apps/web/next.config.mjs
  - apps/web/vercel.json
  - vercel.json
  - apps/web/src/middleware.ts
  - apps/web/src/i18n/routing.ts
  - apps/web/src/i18n/request.ts
  - apps/web/src/lib/cms.ts
  - apps/web/src/lib/utils.ts
  - apps/web/src/app/layout.tsx
  - apps/web/src/app/[locale]/layout.tsx
  - apps/web/src/components/Analytics.tsx
  - apps/web/src/components/CookieConsent.tsx
  - apps/web/src/components/RouteChrome.tsx
  - apps/web/src/components/PageFade.tsx
  - apps/web/src/app/sitemap.ts
  - apps/web/src/app/robots.ts
  - apps/web/src/app/[locale]/error.tsx
  - apps/web/src/app/[locale]/not-found.tsx
  - apps/web/src/app/not-found.tsx
  - apps/web/src/app/[locale]/blog/[slug]/page.tsx
  - apps/web/src/app/[locale]/research/[slug]/page.tsx
  - apps/web/src/app/[locale]/guides/[slug]/page.tsx
  - apps/web/src/app/[locale]/platform/[slug]/page.tsx
  - apps/web/src/app/[locale]/markets/[category]/page.tsx
  - apps/web/src/app/[locale]/newsletter/page.tsx
  - apps/web/src/app/[locale]/contact/page.tsx
findings:
  critical: 0
  warning: 4
  info: 5
  total: 9
---

# Area 3: Web Frontend (Next.js) — Security & Bug Review

## Summary

Reviewed the Next.js 14 web app: security headers/CSP, middleware, i18n, the CMS
data-fetch layer, root layouts, analytics/consent, sitemap/robots, error pages,
and a representative set of dynamic routes.

**No CRITICAL findings.** The high-risk surfaces are clean:

- **No XSS via `dangerouslySetInnerHTML`.** The only use is a static, hardcoded
  JSON-LD object in `[locale]/layout.tsx` (no CMS/user input). `packages/ui` has
  **zero** `dangerouslySetInnerHTML` usages. The `chartEmbed` and `videoEmbed`
  raw-string CMS fields are **never rendered as HTML** — `chartEmbed` is declared
  in `ResearchDetailPage`'s prop type but never consumed, and `videoEmbed` is
  used only as an `href`. CMS Slate richtext renders through React elements, not
  raw HTML.
- **No secret leaked to the client.** Every `NEXT_PUBLIC_*` read is a genuinely
  public value (`CMS_URL`, `SITE_URL`, `GA_ID`, `META_PIXEL_ID`). The MT5
  service URL used server-side (`MT5_SERVICE_URL`) is _not_ `NEXT_PUBLIC_`.
  `.env.local` is gitignored, untracked, and contains only localhost values.
- **No open redirect.** The middleware fallback redirect is path-only against
  `request.url` as base — same-origin by construction.
- **Strong baseline CSP + HSTS** are present in `next.config.mjs` with good
  `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors`.

Remaining findings are robustness/hardening (missing fetch timeouts, a
build-time CSP fallback that can poison prod, an acknowledged `'unsafe-inline'`
script-src) and code-quality/consistency items.

---

## Warnings

### [WARNING] cms.ts — CMS fetches have no timeout; a hung CMS stalls SSR render

**File:** `apps/web/src/lib/cms.ts:439` (also `:461`)

`fetchCollection` and `fetchGlobal` call `fetch(url, { next: { revalidate: 60 } })`
with **no `AbortSignal` / timeout**. Every page that fetches CMS data
(`getSiteSettings()` runs in the root `[locale]/layout.tsx`, so this is on
**every** page) depends on this. The project's own `CLAUDE.md` notes the CMS is
Neon-backed and can take 20–40s to respond after a cold boot, and the whole
fetch layer is designed around "the CMS may be down." A _down_ host fails fast,
but a _hung / slow-loris_ host (TCP connect succeeds, response never completes)
leaves the `fetch` pending. During SSR/ISR revalidation this ties up the render
with no upper bound, degrading availability of otherwise-static pages.

**Impact:** Slow/hung CMS → hung server renders → page TTFB blowout or worker
exhaustion. Defeats the intended graceful-degradation design.

**Fix:** Add a bounded timeout and treat it as the existing error path:

```ts
const res = await fetch(url, {
  next: { revalidate: 60 },
  signal: AbortSignal.timeout(8000), // 8s ceiling; falls into catch → empty docs
});
```

Apply to both `fetchCollection` and `fetchGlobal`.

---

### [WARNING] next.config.mjs — `connect-src` build-time fallback can ship `localhost` CSP to prod

**File:** `apps/web/next.config.mjs:73`

```js
`connect-src 'self' ${(process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001').trim()}...`;
```

`headers()` is evaluated **at build time on the build host**. If
`NEXT_PUBLIC_CMS_URL` is not present in the Vercel build environment, the
production CSP hard-codes `http://localhost:3001` into `connect-src`. Combined
with the `upgrade-insecure-requests` directive added in prod (line 78), the
browser will block all XHR/fetch to the real CMS, breaking client-side data
loads — and the failure is silent and easy to miss because SSR data still works.
The same unguarded `|| 'http://localhost:3001'` default also lives in
`cms.ts:1`, so a missing env var degrades quietly rather than failing loudly.

**Impact:** A single missing build-time env var ships a broken/incorrect
Content-Security-Policy to production with no build error.

**Fix:** Fail the build (or at least warn loudly) when `NEXT_PUBLIC_CMS_URL` is
unset in production instead of silently substituting localhost:

```js
const CMS_ORIGIN = process.env.NEXT_PUBLIC_CMS_URL?.trim();
if (!isDev && !CMS_ORIGIN) throw new Error('NEXT_PUBLIC_CMS_URL must be set in production');
```

---

### [WARNING] next.config.mjs — production CSP allows `script-src 'unsafe-inline'` (no nonce)

**File:** `apps/web/next.config.mjs:56`

The production `script-src` includes `'unsafe-inline'`. On a broker site that
handles user-submitted data (contact, newsletter, partner applications) and
loads third-party analytics, an inline-script allowance is the single biggest
gap in an otherwise solid CSP: any HTML-injection foothold becomes script
execution. This is acknowledged in-code (ticket NE-028, "tighten to a nonce
strategy post-launch"), and a nonce is genuinely awkward here because
`Analytics.tsx` injects inline GA4/Meta-Pixel bootstrap scripts. Flagging so it
is not lost: shipping a forex/CFD site to production with `'unsafe-inline'`
scripts is a real residual XSS-amplification risk, not a cosmetic one.

**Impact:** Removes CSP's defense-in-depth against script injection; any future
reflected/stored HTML-injection bug escalates straight to XSS.

**Fix (post-launch, as ticketed):** Move to a nonce-based `script-src` using
Next.js middleware-generated nonces, and pass the nonce to the `next/script`
tags in `Analytics.tsx`. Until then, ensure no route ever reflects unescaped
input into the document.

---

### [WARNING] Detail routes return HTTP 200 with thin/generic content for arbitrary slugs

**File:** `apps/web/src/app/[locale]/blog/[slug]/page.tsx:43-56`
(same pattern: `research/[slug]/page.tsx:42-67`, `guides/[slug]/page.tsx:42-47`)

These routes deliberately do **not** call `notFound()` when the CMS has no
matching document — they render generic fallback article/guide content and set
a `<title>` derived from the raw slug (`slugToTitle(params.slug)`). Because
`[slug]` is a catch-all for any string, every URL like
`/en/blog/anything-at-all`, `/en/research/zzz`, `/en/guides/foo` returns
**HTTP 200** with near-empty content instead of a 404.

The XSS angle is clean (Next.js escapes the slug in `<title>`), so this is not a
security finding — but it is a real correctness/SEO defect: unlimited indexable
soft-404 pages with duplicate boilerplate, which search engines penalize, and it
masks genuinely broken internal links. The comments say this is intentional ("so
links resolve to a real page instead of 404-ing"), but that trade-off is
questionable for unbounded arbitrary input.

**Impact:** Unbounded thin-content soft-404s (SEO/duplicate-content penalty);
broken links never surface as 404s.

**Fix:** Render the fallback only for a known/allowlisted set, or call
`notFound()` when `post`/`analysis`/`item` is null and the slug is not in
`generateStaticParams`. At minimum, mark fallback pages
`robots: { index: false }` in `generateMetadata` when no CMS doc is found.

---

## Info

### [INFO] vercel.json files ship deprecated `X-XSS-Protection` and duplicate weaker headers

**File:** `apps/web/vercel.json:12` and `vercel.json:12`

Both `vercel.json` files set `X-XSS-Protection: 1; mode=block`. This header is
deprecated and OWASP recommends `0`, because the legacy browser XSS auditor it
enables has itself caused information-disclosure/XSS issues. The strong headers
(CSP, HSTS, Permissions-Policy, Referrer-Policy) live only in
`next.config.mjs#headers()`, which Next applies at runtime on Vercel — so these
`vercel.json` header blocks are redundant and weaker-looking but do **not**
remove the Next-applied protections. Two near-identical `vercel.json` files
(root + `apps/web`) is also a maintenance trap.

**Fix:** Either drop the header from `vercel.json` (let `next.config.mjs` own
all security headers) or change the value to `0`. Consolidate to a single
`vercel.json`.

### [INFO] Inconsistent `generateStaticParams` locale handling across dynamic routes

**File:** `apps/web/src/app/[locale]/markets/[category]/page.tsx:23-25`,
`platform/[slug]/page.tsx:14-16`

`markets/[category]` and `platform/[slug]` return params **without** `locale`,
while `blog`/`research`/`guides` `[slug]` routes return `LOCALES.flatMap(...)`
with locale. With `localePrefix: 'always'`, the former are not pre-rendered per
locale and fall back to on-demand rendering. Functionally fine (the `notFound()`
guards are correct), but the inconsistency is confusing and loses some
build-time pre-rendering.

**Fix:** Make all dynamic routes emit `{ locale, ...}` pairs from
`generateStaticParams` for consistency and full SSG coverage.

### [INFO] `fetchCollection` path segment is interpolated unescaped (no current exploit)

**File:** `apps/web/src/lib/cms.ts:437`

`const url = ` ${CMS_URL}/api/${slug}...`;` interpolates `slug` (the
collection name) directly into the URL path. Every current caller passes a
hardcoded literal (`'news'`, `'blog-posts'`, …) and all user-derived values
(document slugs) go through `URLSearchParams` (`where[slug][equals]`), which is
properly encoded — so there is **no SSRF/injection today**. Noting for
defense-in-depth: the helper would be unsafe if a future caller passed a
user-controlled collection name.

**Fix:** Optionally `encodeURIComponent(slug)` the path segment, or assert
`slug` against a known collection allowlist.

### [INFO] CMS responses are cast to `T` with no shape validation

**File:** `apps/web/src/lib/cms.ts:441,461`

`return res.json()` is cast straight to `PaginatedResponse<T>` / `T` with no
runtime validation. `zod` is already a dependency (`apps/web/package.json`).
Malformed CMS payloads (e.g. a proxy returning an HTML error page with a 200)
would surface as downstream `undefined` access rather than a clean fallback —
though `res.json()` parse errors are caught and degrade to empty docs, so impact
is low.

**Fix:** Validate the paginated envelope with a small `zod` schema (or at least
check `Array.isArray(json.docs)`) before returning.

### [INFO] `slugToTitle` is locale-blind (English-style Title Case applied to AR routes)

**File:** `apps/web/src/lib/cms.ts:496-502`

`slugToTitle` upper-cases the first character of each hyphen-segment. On the
Arabic fallback metadata path (`blog/research/guides [slug]` when no CMS doc),
this produces an English-ASCII title even under `/ar`. Cosmetic SEO/metadata
nit, not a bug.

**Fix:** Skip casing for `ar`, or only use `slugToTitle` on the `en` fallback.

---

_Reviewer: Claude (gsd-code-reviewer) — Area 3 of 4_
_Depth: deep (cross-file: cms.ts → pages → packages/ui sinks traced)_
