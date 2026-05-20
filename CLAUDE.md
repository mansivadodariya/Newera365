# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NewEra365.com — website for a forex/CFD broker. Reference **CSL-NE365-2026-Q2** (CodeSquareLabs), target launch July 2026. Bilingual: English (LTR, default) + Arabic (RTL). The scaffold is an early skeleton — most of the 51 routes, the MT5 bridge, and the custom API endpoints are not yet implemented.

## Commands

Run from the repo root — Turborepo pipelines tasks across all workspaces.

```bash
npm install                 # install all workspaces
npm run dev                 # run web + cms + mt5-service together
npm run build               # build all (CI runs this)
npm run lint                # ESLint across workspaces
npm run type-check          # tsc --noEmit across workspaces
npm run format              # Prettier write across the repo
```

Single workspace: `npm run dev --workspace=@newera365/web` (or `@newera365/cms`, `@newera365/mt5-service`). There is no test runner wired up yet — `npm run test` is a no-op until test tooling is added.

CMS-specific: `npm run generate:types --workspace=@newera365/cms` regenerates `apps/cms/src/payload-types.ts` after editing collections.

Dev ports: web `3000`, cms `3001`, mt5-service `4000`.

## Architecture

npm workspaces + Turborepo monorepo. Three apps, three shared packages.

- **`apps/web`** — Next.js 14 App Router frontend. All pages live under `src/app/[locale]/`; `[locale]` is `en` or `ar`. Internationalization is **next-intl v3**: `src/i18n/routing.ts` (locale list, always-prefix), `src/i18n/request.ts` (per-request messages loader), `src/middleware.ts` (locale negotiation). Translation strings are in `messages/en.json` and `messages/ar.json` — `ar.json` currently holds `__AR__`-prefixed stubs; the client supplies real Arabic copy. The `[locale]/layout.tsx` sets `<html dir>` via `dir()` from `@newera365/types`.

- **`apps/cms`** — Payload CMS **v2** (not v3) running on a custom Express server (`src/server.ts`). Config is `src/payload.config.ts`. Database is PostgreSQL via `@payloadcms/db-postgres` (Neon in production). **16 collections** in `src/collections/` (Users, Media, BlogPosts, MarketAnalysis, News, ResearchReports, EducationContent, Webinars, ProductsInstruments, AccountTypes, FAQs, NewsletterSubscribers, Careers, LegalPages, CompanyContent, TeamMembers) grouped in the admin under Administration / Editorial / Education / Trading Data / Support / Marketing / Company / Compliance, plus a `SiteSettings` global in `src/globals/`. Custom non-CMS REST routes (`/api/mt5/*`, `/api/newsletter/*`, `/api/contact`, etc.) are registered in `src/endpoints/index.ts` — most are `501` stubs awaiting Phase 3.

  **Localization model**: Payload's native `localization` is intentionally **not** used. Each locale-aware collection stores **one document per locale**, carrying an explicit required `locale` select (`en`/`ar`) and a `translationKey` UUID that links the EN/AR counterparts. `(slug, locale)` must be unique. Shared field helpers live in `src/collections/_fields.ts` (`seoFields`, `localizationFields`, `slugField()`). Shared collection hooks live in `src/hooks/`: `ensureTranslationKey` (auto-fills the UUID on create), `uniqueSlugPerLocale(slug)` (hook-enforced compound uniqueness — Payload v2 has no compound-unique index), `deriveAlphabeticalIndex` (EducationContent glossary A-Z key), `archivePreviousLegalVersion` (LegalPages — only one published version per `pageType`+`locale`). Run `npm run generate:types --workspace=@newera365/cms` after editing any collection.

- **`apps/mt5-service`** — standalone Express service mocking the MT5 Manager API (live spreads, swaps, instrument specs). `src/manager.ts` serves static tables from `src/data/fallback.json` whenever MT5 credentials are absent.

- **`packages/types`** — shared TS types. `src/locales.ts` is the single source of truth for locales (`LOCALES`, `RTL_LOCALES`, `dir()`, `isRtl()`). `src/mt5.ts` defines `InstrumentSpec` and the `MT5Response<T>` wrapper.

- **`packages/ui`** — shared React components (consumed by `apps/web`; listed in its `transpilePackages`).

- **`packages/config`** — shared ESLint preset (`eslint-preset.js`) and Tailwind preset (`tailwind-preset.js`, holds placeholder brand tokens — finalize after the Gate 2 design handoff, NE-024).

## Conventions & gotchas

- **MT5 fallback pattern**: any data that originates from the MT5 bridge is wrapped in `MT5Response<T>`. When `usesMT5Data` is `false`, the bridge fell back to static tables and the UI must show a static-data / "last updated" notice. Real MT5 credentials are a Day 1-3 blocker (NE-003) — do not assume live data is available.
- **Payload is v2**, not v3 — APIs differ significantly. Do not use the Next.js-embedded CMS pattern; the CMS is a separate Express app and cannot run on Vercel serverless.
- **Arabic requires a full RTL layout flip** for every template, not just `dir="rtl"`. Treat AR as a first-class locale in every component.
- Auth pages (`/register`, `/login`, `/demo-account`) are **out of scope** — handled by the client's CRM team.
- Work is ticket-tracked as `NE-0xx`; reference the relevant ticket in comments for deferred work.

## Deployment

Frontend → Vercel. CMS → EC2/Railway (Payload v2 is not Vercel-serverless compatible). Database → Neon. File storage → Cloudflare R2 (wired into Payload via `@payloadcms/plugin-cloud-storage` in Phase 3, NE-027). CI (`.github/workflows/ci.yml`) runs lint → type-check → build on push to `main`/`staging`. Husky pre-commit runs Prettier via lint-staged.
