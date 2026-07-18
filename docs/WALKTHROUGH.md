# Newera365 codebase walkthrough

The onboarding document for developers taking over this codebase. It explains what the system is, how the pieces connect, how to run and change it safely, and where the sharp edges are. It is a **living document**: see section 14 for the maintenance rules.

Companion documents: [LAUNCH.md](./LAUNCH.md) (deploy, launch day, operations), [EMAIL.md](./EMAIL.md) (email system deep dive), [../DESIGN.md](../DESIGN.md) (the binding design language), [../SECURITY.md](../SECURITY.md) (dependency posture), per-app READMEs.

---

## 1. What this is

**Newera365.com**: the marketing and content site for a forex/CFD broker (Newera Capital Markets Pty Ltd, Reg. No. 2024/447619/07). Bilingual English (LTR, default) and Arabic (RTL, first-class, not an afterthought). Auth pages (register/login/demo) are out of scope: they are handled by the client's CRM team; the site's account CTAs open an informational modal only.

npm workspaces + Turborepo monorepo, three apps and three packages:

| Workspace          | What it is                                                                                 | Port |
| ------------------ | ------------------------------------------------------------------------------------------ | ---- |
| `apps/web`         | Next.js 14 App Router frontend (next-intl v3 for en/ar)                                    | 3000 |
| `apps/cms`         | Payload CMS **v2** on a standalone Express server, PostgreSQL via Neon                     | 3001 |
| `apps/mt5-service` | Mock MT5 price bridge (Express). The real MT5 Manager API integration is an open TODO      | 4000 |
| `packages/ui`      | Every React component, consumed as source (no build step). See its README for the map      |      |
| `packages/types`   | Shared TS types: locales single-source-of-truth (`dir()`, `isRtl()`), MT5 response wrapper |      |
| `packages/config`  | Shared ESLint + Tailwind presets (`tailwind-preset.js` holds the semantic type tokens)     |      |

Production: web on **Vercel**, CMS on **Railway**, DB on **Neon** (client's account), email via **ZeptoMail**. Cloudflare Workers is a maintained standby for the web app. Details in LAUNCH.md.

## 2. Repo map

```
newera365-app/
  apps/
    web/                  Next.js frontend
      src/app/[locale]/   every route (locale-prefixed, en|ar)
      src/lib/cms.ts      THE integration layer: all CMS fetching (section 4)
      messages/{en,ar}.json  UI strings (section 9)
      next.config.mjs     redirects (IA consolidation), CSP headers, image hosts
    cms/
      src/payload.config.ts   Payload v2 config (localization, collections, CORS)
      src/collections/        24 collections + src/globals/SiteSettings.ts
      src/endpoints/index.ts  ALL custom REST endpoints (forms, MT5 proxy, health)
      src/email/              transport.ts (ZeptoMail/jsonTransport) + mailer.ts (senders)
      src/scripts/            active seeds and operational migrations
      src/scripts/archive/    one-offs already applied to prod (reference only)
      migrations/             numbered SQL migrations (only 001 auto-runs)
    mt5-service/          mock bridge; src/data/fallback.json price tables
  packages/
    ui/src/components/{pages,sections,chrome,primitives,motion,market}/
    ui/src/lib/           non-component helpers
  docs/                   this file, LAUNCH.md, EMAIL.md, archive/ (dated history)
  .github/workflows/      ci.yml (auto), deploy.yml (manual dispatch only)
```

## 3. Local development

Prerequisites: **Node 22+** (`engine-strict` is on; the Cloudflare adapter refuses Node 20), npm 10+, and env files per app (`copy .env.example` and fill in; the CMS needs a real `DATABASE_URL` since content lives in Neon, there is no local database).

```bash
npm install          # once, from the repo root
npm run dev          # web + cms + mt5-service together (turbo)
# or per app:
npm run dev --workspace=@newera365/cms
npm run dev --workspace=@newera365/web
```

Two hard rules, both learned the hard way:

1. **Never run two web dev servers.** They share `.next/` and corrupt it (spurious 404s/500s). If that happens: kill all dev servers, delete `apps/web/.next`, start ONE.
2. **Never run a production build while a dev server is running.** Same corruption. Stop servers, then `npm run build`.

Boot order matters: start the CMS first and wait for `CMS server listening on http://localhost:3001` (20 to 40 s: the Postgres adapter does a schema round-trip against Neon on every boot). The frontend renders **silent-empty** without the CMS (section 4), so a page full of empty sections usually means the CMS is not up yet, not that the code is broken.

Verification commands (CI runs exactly these):

```bash
npm run lint         # ESLint everywhere; web lint also runs the i18n key check
npm run type-check   # tsc --noEmit across workspaces
npm run build        # full production build
```

Turbo caches aggressively; when a result looks stale, add `--force` (`npx turbo run build --force`). There is no test runner wired up: `npm run test` is a no-op. The repeatable functional checklist in section 13 is the current regression net.

## 4. How the frontend gets content

Everything goes through [apps/web/src/lib/cms.ts](../apps/web/src/lib/cms.ts):

- `fetchCollection(slug, params, locale)` → `GET {NEXT_PUBLIC_CMS_URL}/api/{slug}?locale=…`
- `fetchGlobal(slug)` → `GET /api/globals/{slug}`
- `fetchBySlug(collection, slug, locale)` → detail fetch (`where[slug][equals]`, depth 1)

Key properties:

- **ISR**: collections revalidate every 60 s, globals every 300 s. New content appears within about a minute in production without a redeploy. New COMPONENTS still need a redeploy.
- **8-second timeout** per request so a hung CMS cannot stall server rendering.
- **Silent-empty error model**: on any failure the helpers log to the server console and return empty results (`docs: []` / `null`). Pages render their shell with empty sections instead of crashing. The trade-offs you must know:
  - A down CMS and an unseeded collection look identical in the browser.
  - HTTP 200 is NOT proof of health. Any monitoring probe must assert a known content string (see LAUNCH.md).
  - When a page looks empty, check the CMS first, then the collection's data, and only then the code.
- Locale flows through Payload's native localization: `?locale=en|ar` with fallback to EN for untranslated fields. Slugs are non-localized and globally unique (one document per slug, both locales on it).

### Route → data map

| Route (`/[locale]/…`)                                  | Reads                                                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                    | `site-settings` global + client-side MT5 poll (section 7)                                                                                |
| `/trade/accounts`                                      | `account-types`                                                                                                                          |
| `/trade/funding`                                       | `payment-methods`, `site-settings`                                                                                                       |
| `/trade/fees`                                          | `products-instruments`                                                                                                                   |
| `/trade/promotions`                                    | `promotions`                                                                                                                             |
| `/trade/ib`                                            | `ib-content`                                                                                                                             |
| `/markets/[category]`                                  | `products-instruments`, `site-settings`                                                                                                  |
| `/platform/[slug]`                                     | `site-settings` (valid slugs: `mt5`, `metatrader-5`, `webtrader`, `tools`)                                                               |
| `/education`                                           | `education-content`, `webinars`                                                                                                          |
| `/education/media`                                     | `education-content`, `webinars`                                                                                                          |
| `/ebooks` `/glossary` `/guides` `/guides/[slug]`       | all `education-content`, discriminated by `contentType` (`ebook` / `glossary` / `guide`). Seeding this one collection feeds four routes. |
| `/education/blog/[slug]`                               | `blog-posts`                                                                                                                             |
| `/daily-news/[slug]`                                   | `news`                                                                                                                                   |
| `/research`                                            | `market-analysis`, `news`, `blog-posts`, `research-reports` (tabbed feed)                                                                |
| `/research/[slug]`                                     | `market-analysis`                                                                                                                        |
| `/research/analyst-chart`                              | `analyst-calls`, `site-settings`                                                                                                         |
| `/tools` `/tools/spread-comparator` `/tools/watchlist` | `products-instruments`                                                                                                                   |
| `/tools/calendar`                                      | static/client only                                                                                                                       |
| `/support`                                             | `faqs`, `site-settings`                                                                                                                  |
| `/legal`                                               | `legal-pages`                                                                                                                            |
| `/company/about`                                       | `site-settings`, `company-milestones`                                                                                                    |
| `/newsletter` `/ai-crm`                                | static/client only                                                                                                                       |

Redirect notes: eleven legacy routes 308-redirect after the 2026-07 IA consolidation (see `redirects()` in `next.config.mjs`). `/company/careers` and `/company/recognition` are **temporarily hidden** with `permanent: false` redirects (client request); delete those two entries to re-enable the pages, the code is intact.

## 5. Collections inventory

24 collections + 1 global. Content-facing: BlogPosts, MarketAnalysis, News, ResearchReports, AnalystCalls, EducationContent, Webinars, ProductsInstruments, AccountTypes, PaymentMethods, Promotions, IBContent, FAQs, Careers, TeamMembers (currently unused by any route), Awards, CompanyMilestones, MediaPress, LegalPages. Form-backed (admin-only reads, 403 to anonymous REST): ContactSubmissions, NewsletterSubscribers, WebinarRegistrations, Users. Plus Media, and the SiteSettings global (hero, footer, testimonials, social proof, MT5 master switch, risk disclaimer).

## 6. Forms pipeline

Seven submission points on the frontend, five custom endpoints on the CMS (all in `src/endpoints/index.ts`). Behavior: **persist to Postgres first, then send email best-effort** (an email failure never loses a lead). All are rate-limited per IP against a `rate_limit_hits` table.

| Form (component)                                                    | Endpoint                         | Limit/min | Persists to                                                                                           |
| ------------------------------------------------------------------- | -------------------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| Contact (`SupportPage`)                                             | `POST /api/contact`              | 3         | `contact-submissions`                                                                                 |
| Newsletter (4 embeds: home, `/newsletter`, research, education hub) | `POST /api/newsletter/subscribe` | 5         | `newsletter-subscribers` (double opt-in, `status: pending` until the emailed confirm link is clicked) |
| Ebook gate (`EbooksPage`)                                           | `POST /api/education/gate`       | 5         | (returns the download URL; signed R2 URL in prod)                                                     |
| Partner apply (`IBPage`)                                            | `POST /api/partners/apply`       | 5         | `contact-submissions` with subject "Partnership Application"                                          |
| Webinar register (`WebinarsSection`)                                | `POST /api/webinars/register`    | 10        | `webinar-registrations` (dedupes on email + webinar)                                                  |

Dev email behavior: with `SMTP_PASS` unset, the transport switches to jsonTransport and each would-be email is printed to the CMS console as `[email:json] …` with the full message JSON. Nothing is sent. Set `SMTP_PASS` (the ZeptoMail Send Mail Token) to send for real. Invalid payloads return 400 with a message; all endpoints validate server-side regardless of client validation.

One production footgun: **`NEXT_PUBLIC_CMS_URL` is inlined at build time.** Eight client components fall back to `http://localhost:3001` when it is missing. If a production build runs without it, every form and the live ticker silently target localhost while the site otherwise looks fine. Always confirm the env var is present in the deploy environment before building.

## 7. MT5 data

All live-price data is wrapped in `MT5Response<T>` (`packages/types/src/mt5.ts`) with a `source` field. The CMS endpoint `GET /api/mt5/instruments` decides what to serve:

1. `mt5SyncEnabled` in SiteSettings is the master switch. OFF → `source: "cms-global-override"`, CMS manual data (this is the current production state).
2. Per-instrument `usesMT5Data: false` → `cms-manual` for that instrument.
3. Bridge unreachable → `cms-fallback`.

The only frontend consumer is the homepage markets grid (`LiveSpark` polls once per interval). Degradation is deliberately invisible: on failure the tile keeps its static CMS number and simply shows no live spark. The mock bridge (`apps/mt5-service`) simulates ±0.02% jitter from static tables and guards all routes (including `/health`) with an internal token. Real MT5 Manager connectivity is an open item: the Manager API bindings are Windows-only native libraries; the documented alternative is MT5's HTTP Web API (design approved, not built).

## 8. Editing content (Payload admin)

Admin panel: `{cms-url}/admin`. Locale switcher is top-right in a document: edit EN, switch to AR, translate the localized fields. Non-text fields (numbers, dates, images, toggles) are shared between locales.

**The one dangerous gotcha: schema drift.** The Postgres adapter runs with `push: false` in production. Adding a field to a collection does NOT create its database column; every read of that collection then 500s with `column X does not exist`. Procedure for any new field:

1. Add the field to the collection config.
2. Add an idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS` entry to `apps/cms/src/scripts/migrate-missing-columns.ts`.
3. Run it from `apps/cms`: `npx ts-node --transpile-only src/scripts/migrate-missing-columns.ts` (it connects to the DIRECT Neon endpoint for DDL).
4. Deploy the CMS. (When REMOVING a column: deploy the CMS without the field FIRST, then drop the column, otherwise Payload's select-all queries 500.)

Column conventions the adapter expects: snake_case on main/array tables, single-underscore locale tables (`<table>_locales`). Array rows have varchar ids.

After changing collections, regenerate types: `npm run generate:types --workspace=@newera365/cms`, then re-add the `@ts-ignore` the generator strips from `payload-types.ts` (type-check fails otherwise).

Seeding: `npm run seed` is the full seed; topic seeds live in `src/scripts/` (`seed-markets-instruments`, `seed-testimonials`, …). `src/scripts/archive/` holds one-offs already applied to production, do not re-run them (its README explains the categories).

## 9. Languages and the design system

- UI strings live in `apps/web/messages/en.json` + `ar.json`. The key sets must match and `ar.json` must contain REAL Arabic (`scripts/check-i18n.js` fails lint/CI on missing keys or `__AR__` stubs). CMS content is localized in Payload per section 8.
- RTL is done with logical Tailwind utilities (`ms-/me-/ps-/pe-`), `rtl:-scale-x-100` on directional arrows, `dir="ltr"` + `w-fit` on Latin metric strings. Never physical left/right utilities in new code.
- **[DESIGN.md](../DESIGN.md) is binding for any visual change.** The short version: semantic type tokens (not px), green-only hover language, `.ink-band` dark closers (never `bg-black`), cards never levitate on hover, all motion reduced-motion-safe and never gating visibility, no em or en dashes in any copy. Read it before touching UI; section 8 there defines the motion primitives (`ScrollReveal`, `CountUp`, `SectionKicker`, `.list-dim`) and the card taxonomy.

## 10. Deployment (summary; LAUNCH.md is the operational doc)

| Component     | Platform              | Notes                                                                                                                       |
| ------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| web           | Vercel (primary)      | install command MUST be `npm ci`; env vars must have no trailing whitespace; `NEXT_PUBLIC_CMS_URL` required AT BUILD TIME   |
| web (standby) | Cloudflare Workers    | OpenNext adapter pinned 1.15.1; see LAUNCH.md appendix                                                                      |
| cms           | Railway               | `railway up` from repo root or the manual GitHub workflow; media files need the mounted volume (`MEDIA_DIR`) until R2 lands |
| db            | Neon (client account) | direct endpoint for DDL scripts, pooled for the app                                                                         |
| email         | ZeptoMail             | via HTTP API because Railway blocks SMTP ports                                                                              |

CI (`ci.yml`): lint, type-check, build on every push to main/staging, Node 22, dummy env. CD (`deploy.yml`): **manual dispatch only** by deliberate choice. Local green does not guarantee CI green (turbo cache, local env files): check the Actions tab after pushing.

## 11. Operations quick reference

Active scripts (all others live in `src/scripts/archive/`):

| Command (workspace @newera365/cms)               | Purpose                                      |
| ------------------------------------------------ | -------------------------------------------- |
| `npm run seed`                                   | full content seed                            |
| `npm run seed:admin`                             | ensure an admin user exists                  |
| `npm run patch:arabic`                           | AR content patch pass                        |
| `npm run email:verify`                           | send a test email through the live transport |
| `npm run db:migrate:slug-indexes`                | slug+locale compound indexes                 |
| `ts-node src/scripts/migrate-missing-columns.ts` | the schema-drift tool (section 8)            |

Health: `GET /api/health` with header `x-health-token: {HEALTH_CHECK_TOKEN}` (401 without it; the env var must be non-empty or the endpoint always 401s).

## 12. Known issues and launch gaps (live tracker)

| #   | Item                                                                                                                                                                                       | Owner              | Status                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------------- |
| 1   | `riskDisclaimer` empty in SiteSettings (display is wired; text is a legal/compliance deliverable)                                                                                          | Client legal       | Blocker before launch |
| 2   | GA / Meta Pixel IDs not set (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`)                                                                                                             | Client             | Pre-launch            |
| 3   | og:image / social share image not designed                                                                                                                                                 | Dev + client brand | Pre-launch            |
| 4   | Bot protection (Turnstile) not yet on the 4 public form endpoints; keys exist in env schema                                                                                                | Dev                | Next sprint           |
| 5   | Monitoring: needs an uptime probe that asserts a CONTENT string (section 4) plus a CMS health probe                                                                                        | Client infra       | Pre-launch            |
| 6   | Geo-blocking decision (which jurisdictions to restrict)                                                                                                                                    | Client compliance  | Decision needed       |
| 7   | newera365.com still serves the legacy PHP site; DNS cutover is a launch-day step (LAUNCH.md)                                                                                               | Client DNS         | Launch day            |
| 8   | `mt5SyncEnabled` is OFF: production serves manual CMS prices. Real MT5 connectivity unbuilt (section 7)                                                                                    | Client + dev       | Post-launch decision  |
| 9   | Short value-field AR==EN leaks (e.g. account leverage strings, funding method names render EN under /ar). Known, scoped, deferred re-localization                                          | Dev                | Deferred              |
| 10  | Newsletter reader-count stat renders "0+" when the SiteSettings stat is unseeded                                                                                                           | Content            | Verify seed           |
| 11  | `team-members` collection exists but no route reads it (About team section was removed). Either re-add a consumer or drop the collection at the next schema change                         | Dev                | Housekeeping          |
| 12  | Old Neon endpoint (ep-round-bar…) and its credentials should be deleted/rotated after the soak period                                                                                      | Client             | Housekeeping          |
| 13  | CMS custom domain undecided: production uses the bare Railway URL. Binding cms.newera365.com would change `NEXT_PUBLIC_CMS_URL`, `PAYLOAD_PUBLIC_SERVER_URL`, and the image remotePatterns | Client + dev       | Decision needed       |
| 14  | Legacy URL redirect map: the old PHP site at newera365.com has indexed URLs; no 301 map exists yet (SEO risk at cutover). Inventory legacy URLs before launch day                          | Client + dev       | Pre-launch            |
| 15  | Media on Railway volume (wipes on redeploy without the mounted volume); Cloudflare R2 is the real fix (NE-027). Accepted risk vs blocker call is the client's                              | Client             | Decision needed       |
| 16  | Gated ebook PDFs are an email wall, not access control (the returned URL is public). Needs explicit client sign-off                                                                        | Client             | Decision needed       |

## 13. Functional test checklist (repeatable)

The scripted route matrix used for the pre-handoff audit asserts, for every route in the section-4 table, that the page returns 200 AND contains a real string from its mapped CMS collection (both locales; AR also asserts `dir="rtl"` and Arabic glyphs). Forms: one valid submission per unique endpoint verified three ways (success UI, DB row, `[email:json]` log line), one invalid submission per endpoint expecting 400, respecting the per-IP limits in section 6. Degradation: stop the CMS and confirm pages render their shell without crashing; stop mt5-service and confirm the homepage grid degrades invisibly.

Last full pass: 2026-07-18, all green (31/31 EN, 31/31 AR, 5/5 forms, degradation confirmed). Re-run it after any change to `cms.ts`, the endpoints, or the route structure.

## 14. Maintaining this document

- Update the affected section **in the same commit/PR** as the behavior change. A doc that lags the code is worse than no doc.
- The tracker in section 12 is the single list of known gaps: close items there, do not fork new lists.
- Keep it in-repo markdown on purpose: it versions with the code, diffs in review, and survives tool migrations.
- Append a row here when you make a substantial change:

| Date       | Change                                                | Author                             |
| ---------- | ----------------------------------------------------- | ---------------------------------- |
| 2026-07-18 | Initial version, written during the pre-handoff audit | Claude (pre-handoff audit session) |
