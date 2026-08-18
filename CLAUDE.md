# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Newera365.com — website for a forex/CFD broker. Reference **CSL-NE365-2026-Q2** (CodeSquareLabs), target launch July 2026. Bilingual: English (LTR, default) + Arabic (RTL).

## Commands

Run from the repo root — Turborepo pipelines tasks across all workspaces.

```bash
npm install                 # install all workspaces (Node 22+ required; engine-strict is on)
npm run dev                 # run web + cms + mt5-service together
npm run build               # build all (CI runs this)
npm run lint                # ESLint across workspaces (web lint also runs check-i18n)
npm run type-check          # tsc --noEmit across workspaces
npm run format              # Prettier write across the repo
```

Single workspace:

```bash
npm run dev --workspace=@newera365/web
npm run dev --workspace=@newera365/cms
npm run dev --workspace=@newera365/mt5-service
```

CMS-specific:

```bash
npm run generate:types --workspace=@newera365/cms   # regenerate payload-types.ts after editing collections
npm run db:migrate:slug-indexes --workspace=@newera365/cms  # apply slug+locale compound index migration
```

Dev ports: web `3000`, cms `3001`, mt5-service `4000`.

**CMS startup is slow (~20–40 s)** — the `@payloadcms/db-postgres` adapter runs a drizzle schema push against Neon on every boot, which requires many round trips over the internet. Wait for `CMS server listening on http://localhost:3001` before hitting endpoints.

There is no test runner wired up — `npm run test` is a no-op until test tooling is added.

## Architecture

npm workspaces + Turborepo monorepo. Three apps, three shared packages.

### `apps/web` — Next.js 14 frontend

App Router. All pages live under `src/app/[locale]/`; `[locale]` is `en` or `ar`. Internationalization is **next-intl v3**: `src/i18n/routing.ts` (locale list, `localePrefix: 'always'`), `src/i18n/request.ts` (per-request messages loader). Translation strings are in `messages/en.json` and `messages/ar.json`; `ar.json` holds `__AR__`-prefixed stubs until the client provides real Arabic copy. The i18n check script (`scripts/check-i18n.js`) enforces matching key sets and no `__AR__` stubs — it runs inside `npm run lint` and fails CI on untranslated placeholders.

### `apps/cms` — Payload CMS v2 + Express

Config: `src/payload.config.ts`. Server entry: `src/server.ts`. Database: PostgreSQL via `@payloadcms/db-postgres` (Neon). **24 collections** in `src/collections/`: Users, Media, BlogPosts, MarketAnalysis, News, ResearchReports, AnalystCalls, EducationContent, Webinars, WebinarRegistrations, ProductsInstruments, AccountTypes, PaymentMethods, Promotions, IBContent, FAQs, ContactSubmissions, NewsletterSubscribers, Careers, TeamMembers, Awards, CompanyMilestones, MediaPress, LegalPages — plus a `SiteSettings` global in `src/globals/`. (The legacy `CompanyContent` collection was removed — `Awards` and `MediaPress` cover its awards/press content, which the frontend actually reads.) `CompanyMilestones` (`company-milestones`) backs the /company/about journey timeline; localized `label`/`description`, non-localized `year`/`sortOrder`; tables created via `migrate-company-milestones-table.ts`, seeded EN+AR via `seed-milestones-only.ts`.

Custom non-CMS REST endpoints are all implemented in `src/endpoints/index.ts`:

| Endpoint                             | Auth / limits                                                     |
| ------------------------------------ | ----------------------------------------------------------------- |
| `GET /api/health`                    | `x-health-token` header required (`HEALTH_CHECK_TOKEN` env var)   |
| `GET /api/mt5/instruments[/:symbol]` | Public; falls back to CMS data when MT5 service is down           |
| `POST /api/newsletter/subscribe`     | 5 req/min/IP                                                      |
| `GET /api/newsletter/confirm`        | Token from confirmation email                                     |
| `POST /api/newsletter/unsubscribe`   | 5 req/min/IP                                                      |
| `GET /api/newsletter/unsubscribe`    | Token-based; links from email footers                             |
| `POST /api/education/gate`           | 5 req/min/IP; validates `contentId` exists in `education-content` |
| `POST /api/contact`                  | 3 req/min/IP                                                      |
| `POST /api/partners/apply`           | 5 req/min/IP                                                      |
| `POST /api/webinars/register`        | 10 req/min/IP; creates `webinar-registrations` record             |

Rate limiting is backed by a Postgres table `rate_limit_hits` (created by `src/rateLimit/postgresStore.ts`, outside Payload's schema). On CMS restarts, drizzle schema push will prompt to drop this unknown table — type `y` to accept (it's transient rate-limit data, not content).

### `apps/mt5-service` — Mock MT5 bridge

Standalone Express service on port 4000. `src/manager.ts` simulates live prices (±0.02% bid/ask jitter) from static tables in `src/data/fallback.json`. The real MT5 Manager API client is a TODO (`NE-003`). The CMS proxy gracefully falls back to CMS manual data when this service is unreachable.

### `packages/types` — shared TypeScript types

`src/locales.ts` — single source of truth for `LOCALES`, `RTL_LOCALES`, `dir()`, `isRtl()`. `src/mt5.ts` — `InstrumentSpec` and `MT5Response<T>` wrapper.

### `packages/ui` — shared React components

Consumed by `apps/web` (listed in `next.config.mjs` `transpilePackages`).

### `packages/config` — shared ESLint + Tailwind presets

Brand tokens are placeholders pending Gate 2 design handoff (NE-024).

## Conventions & gotchas

**Localization model** — Payload's native `localization` config is used (`locales: ['en', 'ar']`, `defaultLocale: 'en'`, `fallback: true`). Each locale-aware field carries `localized: true`; non-text fields (dates, numbers, images, enums) are not localized. The frontend passes `?locale=en` or `?locale=ar` to Payload's REST API — no `where[locale]` filter needed. Slug fields are non-localized and globally unique (one document per slug, all locales on that document). Shared field helpers (`seoFields`, `slugField()`) live in `src/collections/_fields.ts`; `localizationFields` is a deprecated no-op export kept for compile compat. `deriveAlphabeticalIndex` and `archivePreviousLegalVersion` are the only active collection hooks (`src/hooks/index.ts`).

**MT5 fallback pattern** — all MT5 data is wrapped in `MT5Response<T>` (`packages/types/src/mt5.ts`). When `usesMT5Data: false` or `source: 'cms-fallback'`, the bridge was unreachable or overridden and the UI must show a static-data notice. The dual-toggle logic (`mt5SyncEnabled` global master switch + per-instrument `usesMT5Data` field) lives entirely in the CMS endpoint.

**`generate:types` strips a required `@ts-ignore`** — after running `npm run generate:types --workspace=@newera365/cms`, re-add the `@ts-ignore` comment that the generator removes from `apps/cms/src/payload-types.ts` or `tsc` type-check will fail.

**Schema drift (`push: false`)** — because the postgres adapter runs with `push: false`, fields added to a collection after its initial migration do **not** create their DB columns automatically, and every read of that collection then 500s (`column X does not exist`). Backfill missing columns by adding idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS` entries to `apps/cms/src/scripts/migrate-missing-columns.ts` and running it (`ts-node --transpile-only src/scripts/migrate-missing-columns.ts` from `apps/cms`; it connects to the **direct** Neon endpoint for DDL). The drizzle adapter (`@payloadcms/db-postgres@0.8.10`) expects **snake_case** columns on main/array tables and **single-underscore** locale tables (`<table>_locales`, e.g. `ib_content_locales`, `promotions_locales`). (A few empty **double-underscore** `__locales` tables existed as stale artifacts of an abandoned migration; they were dropped — do not target them.)

**Resolved — `ib_content` array tables (was NE-0xx):** the `ib_content_steps` table had been provisioned with an `integer` `id`, but Payload v2 assigns **varchar** ids to array rows, so creating/saving an IB document **with `steps`** failed (`invalid input syntax for type integer`). Fixed via `apps/cms/src/scripts/migrate-ib-steps-array-id.ts` (idempotent, transactional, direct Neon endpoint): retyped `ib_content_steps.id` and the live `ib_content_steps_locales._parent_id` to `varchar`, recreated the FK, and dropped the stale empty `ib_content__locales` / `ib_content_steps__locales` duplicates. `seed-ib-only.ts` now seeds the full EN+AR `steps` array (reusing the EN array-row ids in the AR patch so the localized rows aren't recreated), and `/trade/ib` renders the CMS steps in both locales. All IB fields, including steps, are now CMS-managed.

**Payload is v2**, not v3 — APIs differ significantly. Do not use the Next.js-embedded CMS pattern; the CMS runs on a standalone Express server and is not Vercel-serverless compatible.

**Arabic is a first-class locale** — every component and template must include a full RTL layout flip, not just `dir="rtl"`. Use `dir()` / `isRtl()` from `@newera365/types`.

**Admin-only collections** — `newsletter-subscribers`, `webinar-registrations`, and `users` return 403 to unauthenticated Payload REST API calls by design.

**Auth pages** (`/register`, `/login`, `/demo-account`) are out of scope — handled by the client's CRM team.

**Work tickets** — deferred work is tagged `NE-0xx` in comments; reference the ticket when noting blockers.

## Design language

**`DESIGN.md` at the repo root is the primary, binding reference for ANY design or styling change to any section or page — read it before touching UI.** Non-negotiables: semantic fluid type tokens (`text-display/-headline/-body/…` in `packages/config/tailwind-preset.js`) instead of per-component px sizes; light mode is green-tinted paper + white bordered cards (never white-on-white or gray fills); dark closers use the `.ink-band` utility (never `bg-black`/blue-gray gradients); `.text-sheen` only on oversized metrics on ink; **animation must serve its purpose — cards never levitate on hover** (definition via border/shadow; movement only for arrows, fills, live ticks; buttons press with `active:scale`); every string ships EN + real AR; RTL via logical utilities.

## Deployment

| Component             | Platform                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Frontend (`apps/web`) | Vercel (primary). Cloudflare Workers is a maintained standby (OpenNext, see docs/LAUNCH.md appendix) |
| CMS (`apps/cms`)      | Railway                                                                                              |
| Database              | Neon (serverless PostgreSQL, client's account)                                                       |
| Media / gated PDFs    | Cloudflare R2 — wired via `@payloadcms/plugin-cloud-storage` in Phase 3 (NE-027)                     |

CI: lint → type-check → build on push to `main`/`staging` (`.github/workflows/ci.yml`, Node 22). CD is manual only (`.github/workflows/deploy.yml`, workflow_dispatch). Husky pre-commit runs Prettier via lint-staged. Operational procedures live in `docs/LAUNCH.md`; onboarding lives in `docs/WALKTHROUGH.md`.

Required env vars are validated on CMS startup: `PAYLOAD_SECRET` (warn in dev, error in prod), `FRONTEND_URL`, `SMTP_PASS` (the ZeptoMail Send Mail Token), `EMAIL_FROM`, `CONSENT_IP_SALT` (all error in prod only). `HEALTH_CHECK_TOKEN` must be set to a non-empty value or the `/api/health` endpoint will always return 401.

Email is sent via **ZeptoMail SMTP** (Zoho's transactional service) through a single nodemailer transport in `apps/cms/src/email/transport.ts` (`sendMail()` helper), which also backs Payload's built-in forgot-password flow. The senders live in `apps/cms/src/email/mailer.ts`. Configure with `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER` (literal `emailapikey`)/`SMTP_PASS` (Send Mail Token) + `EMAIL_FROM` (on the verified domain). With `SMTP_PASS` unset in dev, nodemailer's `jsonTransport` logs emails instead of sending. Set `SKIP_SMTP_VERIFY=true` if the host blocks SMTP ports.

## Completed Frontend Pages

All components live in `packages/ui/src/components/{pages,sections,chrome,primitives,motion,market}/` (role-based folders, see `packages/ui/README.md`) and are exported from `packages/ui/src/index.ts`; non-component helpers live in `packages/ui/src/lib/`. Routes are thin wrappers in `apps/web/src/app/[locale]/`. One-off CMS scripts that have already run against prod live in `apps/cms/src/scripts/archive/` (excluded from lint/type-check; do not re-run).

> **IA consolidation (2026-07-08/09), read this before trusting the route tables below.** The header was clubbed from 9 tabs to **5**: Trade, Markets, Platform, **Education** (a 3-column mega-panel absorbing the old Research + Tools groups), **Company** (absorbing Legal & Support). Eleven routes were merged and permanent-redirected (see `redirects()` in `apps/web/next.config.mjs`): the three calculator pages (`/tools/pivot|profit|fibonacci`) fold into **`/tools`** (6-tab `TraderToolsPage`, calculators are embeddable `PivotCalculator`/`ProfitCalculator`/`FibonacciCalculator`); `/education/audio` + `/education/webinars` fold into **`/education/media`** (`WebinarsSection`); `/company/awards` + `/company/media-press` become **`/company/recognition`** (`RecognitionPage`, an editorial ledger); `/faqs` + `/contact` become **`/support`** (`SupportPage`, search-first FAQ accordion, human-escalation seam, contact form with POST `/api/contact` intact); `/daily-news` + `/education/blog` listings fold into **`/research`** (client `useState` Analysis/News/Blog feed tabs; detail routes `/research/[slug]`, `/daily-news/[slug]`, `/education/blog/[slug]` all still resolve). Design revamp added homepage `TwoPathsSection`, a seamless press marquee (now `PartnersSection`; the old `TrustStripDemo` was deleted in the 2026-07-18 dead-code pass), `ScrollReveal`/`CountUp`/`TiltReveal` motion primitives, and a testimonial carousel. See DESIGN.md §8 for the Life system and card taxonomy. Copy rule: no em/en dashes anywhere (EN + AR). The tables below still name some pre-merge routes; the merged targets above win.

### Trade

| Component      | Route               | Notes                                                                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AccountsPage` | `/trade/accounts`   | Account type comparison cards (Standard, Raw, VIP); Raw column highlighted — same component as what was previously referenced as `AccountComparisonPage` |
| `FundingPage`  | `/trade/funding`    | Payment methods                                                                                                                                          |
| `FeesPage`     | `/trade/fees`       | Fee table                                                                                                                                                |
| `PromoPage`    | `/trade/promotions` | Promo cards with gradients                                                                                                                               |
| `IBPage`       | `/trade/ib`         | IB registration with SVG earnings chart                                                                                                                  |

### Markets

| Component            | Route                 | Notes             |
| -------------------- | --------------------- | ----------------- |
| `MarketCategoryPage` | `/markets/[category]` | Per-category page |

> The standalone `/markets/instruments` route was removed; instrument specs now live within `/markets/[category]`. The old path 308-redirects to `/markets/forex` (see `redirects()` in `apps/web/next.config.mjs`) so it no longer soft-404s. `InstrumentsPage.tsx` is retained only for its `InstrumentItem` type (imported by `MarketCategoryPage`).

### Platform

| Component       | Route              | Notes                                    |
| --------------- | ------------------ | ---------------------------------------- |
| `PlatformPage`  | `/platform/[slug]` | Platform feature pages                   |
| `WebTraderPage` | (embedded)         | Web Trader with fallback disclaimer card |

### Education

| Component          | Route              | Notes                                                |
| ------------------ | ------------------ | ---------------------------------------------------- |
| `EducationHubPage` | `/education`       | Featured articles (divider-row layout) + video cards |
| `MediaListingPage` | `/education/media` | Video listing with dark green gradient thumbnails    |
| `EbooksPage`       | `/ebooks`          | Gated ebook downloads                                |
| `GlossaryPage`     | `/glossary`        | A-Z search + category chips                          |
| `GuidesPage`       | `/guides`          | Guide listing                                        |
| `GuideDetailPage`  | `/guides/[slug]`   | Guide detail prose                                   |

### Research & Tools

| Component              | Route                      | Notes                                                                                      |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| `ResearchPage`         | `/research` + `/blog`      | "Notes from the trading floor" article listing                                             |
| `ResearchDetailPage`   | `/research/[slug]`         | Article detail with SVG chart hero                                                         |
| `TraderToolsPage`      | `/tools`                   | Margin/Pip/Swap calculator; all `.toLocaleString('en-US')` to avoid SSR hydration mismatch |
| `SpreadComparatorPage` | `/tools/spread-comparator` | Instrument tabs, spread bars, annual saving panel                                          |
| `EconomicCalendarPage` | `/tools/calendar`          | Filter by impact + currency; 3-dot impact visualization                                    |
| `AnalystChartPage`     | `/research/analyst-chart`  | Featured price + SVG chart + analyst commentary                                            |
| `LiveWatchlistPage`    | `/tools/watchlist`         | Dark table, tab filter (Indices/Futures/Bonds/Forex)                                       |

### Company

| Component     | Route              | Notes                                              |
| ------------- | ------------------ | -------------------------------------------------- |
| `AboutPage`   | `/company/about`   | CEO quote card, timeline, team grid, explore links |
| `CareersPage` | `/company/careers` | Stats, values, job listing with department filter  |

### Support & Legal

| Component        | Route         | Notes                                                                        |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| `FaqPage`        | `/faqs`       | Search + category tabs + popular questions                                   |
| `ContactPage`    | `/contact`    | 2 channel cards (Email/Call), department dropdown form, Three Cities section |
| `LegalPage`      | `/legal`      | 5-document selector, ToC, prose sections                                     |
| `NewsletterPage` | `/newsletter` | "The Monday Briefing" subscribe form, social proof                           |

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
