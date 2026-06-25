# NewEra365 — Developer Setup & Run Guide

Project reference: **CSL-NE365-2026-Q2** | Target launch: July 2026

---

## Prerequisites

| Tool    | Minimum version | Notes              |
| ------- | --------------- | ------------------ |
| Node.js | 20 LTS          | `node -v` to check |
| npm     | 10+             | Comes with Node 20 |
| Git     | any             | —                  |

No Docker or local Postgres needed — the database is Neon (serverless PostgreSQL, cloud-hosted). Credentials are shared by the team.

---

## 1. Clone & Install

```bash
git clone <repo-url> newera365-app
cd newera365-app
npm install
```

`npm install` runs once from the repo root and installs all three apps and shared packages via npm workspaces.

---

## 2. Environment Variables

Each app has a `.env.example`. Copy it to `.env` and fill in real values.

### apps/cms — Payload CMS (port 3001)

```bash
cp apps/cms/.env.example apps/cms/.env
```

Edit `apps/cms/.env`:

```env
# Payload
PAYLOAD_SECRET=any-long-random-string-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PORT=3001

# Neon PostgreSQL (get connection string from Neon dashboard)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# CORS — allow the Next.js frontend
FRONTEND_URL=http://localhost:3000

# Cloudflare R2 — leave blank locally (media uploads use local disk)
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_PUBLIC_URL=https://media.newera365.com

# Redis — not required locally
REDIS_URL=

# Mailchimp — required only for newsletter endpoints (NE-043)
MAILCHIMP_API_KEY=
MAILCHIMP_AUDIENCE_ID=

# Zoom — required only for webinar registration endpoints (NE-033)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
```

> **`PAYLOAD_SECRET`** — any random string, used to sign JWTs. Never commit real values.
> **`DATABASE_URL`** — obtain from the Neon project dashboard or from the team lead.

---

### apps/web — Next.js frontend (port 3000)

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CMS_URL=http://localhost:3001
MT5_SERVICE_URL=http://localhost:4000

# Leave blank locally — not required until NE-026 / NE-039
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_PUBLIC_SALESIQ_WIDGET_CODE=
```

---

### apps/mt5-service — MT5 bridge (port 4000)

```bash
cp apps/mt5-service/.env.example apps/mt5-service/.env
```

Edit `apps/mt5-service/.env`:

```env
PORT=4000

# Real MT5 credentials — Day 1-3 blocker (NE-003).
# Leave blank to run in static-fallback mode (usesMT5Data: false).
MT5_HOST=
MT5_PORT=
MT5_LOGIN=
MT5_PASSWORD=
```

When MT5 credentials are absent, the service reads from `src/data/fallback.json` and every response includes `"usesMT5Data": false`. The UI must show a "static data" notice in this case.

---

## 3. First-Time CMS Setup

On the very first run, Payload creates all database tables automatically. No manual migration step is needed.

> **If the CMS was previously run with a different schema** (e.g. after a collection rewrite), the drizzle schema-sync may prompt interactively. In that case, wipe the database first:
>
> ```bash
> node scripts/db-reset.mjs
> ```
>
> This drops all tables and enums so Payload can recreate them cleanly.

After the CMS starts, open **http://localhost:3001/admin** in your browser. On first visit, Payload shows a "Create first user" screen — that user becomes the super-admin.

---

## 4. Run Commands

All commands are run from the **repo root** unless noted.

### Development (all apps together)

```bash
npm run dev
```

Starts all three apps in parallel via Turborepo:

| App                 | URL                         |
| ------------------- | --------------------------- |
| Web (Next.js)       | http://localhost:3000       |
| CMS (Payload admin) | http://localhost:3001/admin |
| MT5 service         | http://localhost:4000       |

---

### Run a single app

```bash
npm run dev --workspace=@newera365/web          # Next.js frontend
npm run dev --workspace=@newera365/cms           # Payload CMS
npm run dev --workspace=@newera365/mt5-service   # MT5 bridge
```

---

### Production build

```bash
npm run build
```

Builds all workspaces in dependency order (Turborepo handles caching).

---

### Linting & type checking

```bash
npm run lint          # ESLint across all workspaces
npm run type-check    # tsc --noEmit across all workspaces
npm run format        # Prettier write (auto-fixes formatting)
```

Run lint and type-check before opening a PR — CI will fail if either fails.

---

### After editing CMS collections

```bash
npm run generate:types --workspace=@newera365/cms
```

Regenerates `apps/cms/src/payload-types.ts`. Commit the updated file alongside any collection changes.

---

### Database reset (dev only)

```bash
node scripts/db-reset.mjs
```

Drops all tables and enums from the configured Neon database. **Do not run against staging or production.**

---

## 5. Project Structure

```
newera365-app/
├── apps/
│   ├── web/            # Next.js 14 App Router — all pages under src/app/[locale]/
│   ├── cms/            # Payload CMS v2 — Express server, 16 collections
│   └── mt5-service/    # Express — MT5 Manager API bridge / static fallback
├── packages/
│   ├── types/          # Shared TS types (locales, MT5Response, InstrumentSpec)
│   ├── ui/             # Shared React components consumed by apps/web
│   └── config/         # Shared ESLint + Tailwind presets
├── docs/
│   └── CMS_API.md      # Full CMS REST API reference (all endpoints + response shapes)
├── scripts/
│   └── db-reset.mjs    # Dev utility — wipe Neon schema
├── CLAUDE.md           # Architecture reference for Claude Code
└── GUIDE.md            # This file
```

---

## 6. CMS Collections at a Glance

| Group          | Collections                                                    |
| -------------- | -------------------------------------------------------------- |
| Administration | Users, Media                                                   |
| Editorial      | BlogPosts, MarketAnalysis, News, ResearchReports, AnalystCalls |
| Education      | EducationContent, Webinars, WebinarRegistrations               |
| Trading Data   | ProductsInstruments, AccountTypes                              |
| Trading        | PaymentMethods, Promotions, IBContent                          |
| Support        | FAQs, ContactSubmissions                                       |
| Marketing      | NewsletterSubscribers                                          |
| Company        | Careers, TeamMembers, Awards, MediaPress                       |
| Compliance     | LegalPages                                                     |

**Localization model:** native Payload localization is used (`locales: ['en', 'ar']`, `defaultLocale: 'en'`, `fallback: true`). Each document holds all locales; locale-aware fields carry `localized: true`. Slug fields are non-localized and globally unique (one document per slug across all locales). The frontend selects a locale with `?locale=en` / `?locale=ar` on Payload's REST API.

---

## 7. CI / Git Workflow

- **Pre-commit hook** (Husky + lint-staged): Prettier runs automatically on staged files.
- **CI pipeline** (`.github/workflows/ci.yml`): runs `lint → type-check → build` on every push to `main` or `staging`.
- Ticket references follow the pattern `NE-0xx` — include the ticket number in commit messages and code comments for deferred work.

---

## 8. Key Gotchas

| #   | Gotcha                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Payload is v2**, not v3. The CMS runs on Express — it is not Next.js-embedded and cannot run on Vercel serverless.                                                                                                                                                     |
| 2   | **Arabic is a first-class locale** — every template needs a full RTL layout flip, not just `dir="rtl"`.                                                                                                                                                                  |
| 3   | **MT5 data may be static.** Always check `usesMT5Data` on responses from `/api/mt5/instruments`. Show a static-data notice when `false`. The global switch lives in Site Settings → MT5 Integration; per-instrument overrides are on each Products & Instruments record. |
| 4   | **Auth pages are out of scope** — `/register`, `/login`, `/demo-account` are handled by the client's CRM team.                                                                                                                                                           |
| 5   | **R2 cloud storage** is wired in Phase 3 (NE-027). Until then, uploaded files are stored in `apps/cms/media/` on local disk.                                                                                                                                             |
| 6   | **Arabic translations** in `apps/web/messages/ar.json` are `__AR__` stubs. Real copy is supplied by the client.                                                                                                                                                          |
| 7   | **CMS users are admin-only.** There is no editor role — all CMS accounts have full admin access.                                                                                                                                                                         |

---

## 9. Deployment (reference)

| Component    | Host                                                |
| ------------ | --------------------------------------------------- |
| apps/web     | Vercel                                              |
| apps/cms     | EC2 / Railway (Payload v2 is not Vercel-compatible) |
| Database     | Neon (serverless PostgreSQL)                        |
| File storage | Cloudflare R2 (Phase 3)                             |
| CI           | GitHub Actions                                      |
