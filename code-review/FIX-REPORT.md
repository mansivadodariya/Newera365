---
status: fixes_applied
source: code-review/REVIEW.md
verified: type-check 7/7 green · lint 7/7 (only pre-existing UI unused-var warnings) · i18n parity OK
committed: false # working tree already had 178 uncommitted files on main — left for user to review/commit
fixed: 20 # 2 critical full + 1 critical partial + 12 warning + 5 info
deferred: 17 # need infra (R2), schema change, or a product decision
date: 2026-06-18
---

# Audit-Fix Report — NewEra365

Fixes for findings in [REVIEW.md](REVIEW.md). I did **not** auto-commit: the working tree
already had 178 uncommitted files on `main`, so atomic per-finding commits would have
entangled pre-existing work. Every change below is in the working tree, verified by
`npm run type-check` (7/7 green) and `npm run lint` (7/7; only pre-existing unused-var
warnings in untouched UI files; the web i18n parity check passed).

## Fixed (20)

| ID                   | Fix                                                                                                                                                                                                                                                                                                                     | Files                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **CR-1**             | Public REST reads now constrained to publishable status via a new `publicReadWhere()` access factory — **per-collection** values (`published` / `active` / `open` / not-`cancelled`), since the 18 content collections use 4 different status vocabularies. Admins & server-side Local API (overrideAccess) unaffected. | `_fields.ts` + 18 collections                      |
| **CR-2** _(partial)_ | Education **ebook** `pdfFile` withheld from anonymous REST when gated (`gatedUploadRead` field access); the gate endpoint still serves it via Local API. Research `reportFile` + signed URLs deferred (see below).                                                                                                      | `_fields.ts`, `EducationContent.ts`                |
| **CR-3**             | Admin login lockout enabled (`maxLoginAttempts: 5`, `lockTime: 10m`).                                                                                                                                                                                                                                                   | `Users.ts`                                         |
| **WR-1**             | `trust proxy` now `TRUST_PROXY_HOPS`-configurable + NaN-guarded (set to real CF→Railway hop count to stop XFF spoofing).                                                                                                                                                                                                | `server.ts`                                        |
| **WR-3**             | `mt5ApiEndpoint` validated (`safeMt5Endpoint`: http(s) only + optional `MT5_ALLOWED_HOSTS` allow-list) before fetching with the bearer token.                                                                                                                                                                           | `endpoints/index.ts`                               |
| **WR-4**             | Newsletter "already subscribed" now returns the **same** generic message as a fresh subscribe — no enumeration oracle.                                                                                                                                                                                                  | `endpoints/index.ts`                               |
| **WR-5**             | `ensure-admin` no longer ships `Admin123!`; requires `SEED_ADMIN_PASS` and refuses to run when `NODE_ENV=production`.                                                                                                                                                                                                   | `ensure-admin.ts`                                  |
| **WR-6** _(core)_    | New `safeUrl()` allow-list sanitiser (blocks `javascript:`/`data:` etc.) applied to RichText link `href` + image `src` — the real stored-XSS surface. Helper exported for the remaining admin-set-URL components.                                                                                                       | `lib/safeUrl.ts` (new), `index.ts`, `RichText.tsx` |
| **WR-7**             | mt5-service: missing `MT5_INTERNAL_API_TOKEN` is now a hard boot failure in production; CORS restrictable via `MT5_CORS_ORIGIN` allow-list.                                                                                                                                                                             | `mt5-service/index.ts`                             |
| **WR-8**             | CMS fetches now use `AbortSignal.timeout(8s)` so a hung CMS can't stall SSR.                                                                                                                                                                                                                                            | `lib/cms.ts`                                       |
| **WR-9**             | MT5 sync loop reschedules in a `try/finally` — one throw can no longer permanently halt it.                                                                                                                                                                                                                             | `jobs/mt5Sync.ts`                                  |
| **WR-10**            | SMTP `verify()` no longer fires at import (opt-in via `SMTP_VERIFY_ON_START`) — no eager cold-start dial.                                                                                                                                                                                                               | `email/transport.ts`                               |
| **WR-12**            | Production build now **throws** if `NEXT_PUBLIC_CMS_URL` is unset (CI/Vercel set it) — kills the silent `localhost:3001` fallback in CSP `connect-src` **and** in the 4 public form POST targets.                                                                                                                       | `next.config.mjs`                                  |
| **WR-14**            | Migration 004 is idempotent (`DO $$ … IF EXISTS … RENAME`).                                                                                                                                                                                                                                                             | `migrations/004_*.sql`                             |
| **WR-15**            | Direct-endpoint derivation prefers `DATABASE_URL_DIRECT` and warns when the `-pooler` strip is a silent no-op.                                                                                                                                                                                                          | `migrate-missing-columns.ts`                       |
| **I-3**              | `rate_limit_hits` rows purged on a 10-min timer (unbounded-growth fix).                                                                                                                                                                                                                                                 | `postgresStore.ts`                                 |
| **I-4**              | NaN-safe numeric env parsing (`numEnv`) so a malformed value can't silently disable a limiter/timeout.                                                                                                                                                                                                                  | `endpoints/index.ts`, `mt5Sync.ts`                 |
| **I-7**              | `apply-schema.mjs` exits non-zero when statements fail.                                                                                                                                                                                                                                                                 | `apply-schema.mjs`                                 |
| **I-9**              | Slug length capped at 80 chars.                                                                                                                                                                                                                                                                                         | `_fields.ts`                                       |
| **I-12**             | Collection segment `encodeURIComponent`-d in `fetchCollection`.                                                                                                                                                                                                                                                         | `lib/cms.ts`                                       |

> **Heads-up on CR-1 (verify before deploy):** these are access-control changes on a live
> site. They behave correctly by construction (anon REST sees only publishable docs; admin
> panel & server endpoints use overrideAccess and are unaffected), but they can't be
> runtime-verified here because the CMS needs a live Neon DB. Smoke-test each public listing
> (esp. promotions, careers, webinars, FAQs) against a running CMS before shipping.

## Deferred — need infra, schema, or a product decision (17)

| ID                                      | Why not auto-fixed                                                                                                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CR-2** (research + real fix)          | Proper fix = short-lived **signed R2 URLs** (NE-027, not yet wired). Research `reportFile` has no server-side gate endpoint, so gating it would break downloads — needs a companion `/api/research/gate` first. |
| **WR-2**                                | TOTP single-use/replay needs a new "last-used step" DB column (schema migration) + login-route throttling.                                                                                                      |
| **WR-11**                               | Legal-version archiving by locale vs. non-localized `status` is a data-model decision (per-locale legal versions or one live version?).                                                                         |
| **WR-13**                               | Nonce-based CSP (drop `script-src 'unsafe-inline'`) is architectural — needs nonce plumbing through `Analytics.tsx`/layout (NE-028).                                                                            |
| **WR-16**                               | Article soft-404 is an **intentional** V1 static-fallback; "404 vs noindex" is a product call. Recommend `robots: { index: false }` on the fallback.                                                            |
| **WR-6** (remainder)                    | Apply the new `safeUrl()` to the 7 admin-set-URL components (AwardsPage, MediaPressPage, PlatformPage, ResearchPage, TrustStrip, WebinarsPage, Footer) — mechanical; helper is exported.                        |
| **I-1,2,5,6,8,10,11,13,14,15,16,17,18** | Low-value / cosmetic (e.g. I-14 Arabic casing is a no-op on Arabic script; I-6 normalization is purely cosmetic per the reviewer) or need a decision (I-8 Zoom-link visibility).                                |

## Next steps

- Smoke-test public pages against a running CMS (CR-1).
- When R2 lands (NE-027): finish CR-2 (signed URLs + research gate).
- Set `TRUST_PROXY_HOPS`, `MT5_ALLOWED_HOSTS`, `MT5_CORS_ORIGIN`, `MT5_INTERNAL_API_TOKEN` in prod env.
