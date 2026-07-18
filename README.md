# Newera365

Marketing and content site for **Newera365.com**, a forex/CFD broker. Bilingual English + Arabic (full RTL). npm workspaces + Turborepo monorepo: a Next.js 14 frontend, a Payload CMS v2 backend, and a mock MT5 price service. Reference: CSL-NE365-2026-Q2 (CodeSquareLabs).

**New to this codebase? Start with [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md).** It covers the architecture, the content pipeline, local development, and every known sharp edge.

## Quick start

```bash
# Node 22+ required (engine-strict is on)
npm install
npm run dev     # web :3000, cms :3001, mt5-service :4000
```

Copy each app's `.env.example` to `.env` first; the CMS needs a real Neon `DATABASE_URL` (content lives in the shared database, there is no local one). Start the CMS first and wait for its listening line: the frontend renders empty without it.

## The map

| Path               | What                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `apps/web`         | Next.js 14 App Router frontend (next-intl, ISR against the CMS)     |
| `apps/cms`         | Payload CMS v2 + Express: 24 collections, custom form/MT5 endpoints |
| `apps/mt5-service` | Mock MT5 bridge (real Manager API integration is an open item)      |
| `packages/ui`      | All React components (see `packages/ui/README.md` for the taxonomy) |
| `packages/types`   | Shared types: locales, MT5 response wrapper                         |
| `packages/config`  | Shared ESLint + Tailwind presets (semantic type tokens)             |

## Documentation

| Doc                                        | Covers                                                              |
| ------------------------------------------ | ------------------------------------------------------------------- |
| [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md) | The onboarding walkthrough (start here)                             |
| [docs/LAUNCH.md](docs/LAUNCH.md)           | Deploy procedures, launch day, operations                           |
| [docs/EMAIL.md](docs/EMAIL.md)             | Email architecture (ZeptoMail, dev jsonTransport)                   |
| [DESIGN.md](DESIGN.md)                     | The binding design language ("Terminal Precision")                  |
| [SECURITY.md](SECURITY.md)                 | Dependency audit posture                                            |
| [GUIDE.md](GUIDE.md)                       | Original setup guide (superseded by the walkthrough for onboarding) |
| [CLAUDE.md](CLAUDE.md)                     | AI-assistant working notes for this repo                            |

## Everyday commands

```bash
npm run lint          # ESLint + i18n key check (fails on untranslated stubs)
npm run type-check    # tsc --noEmit everywhere
npm run build         # production build (never while a dev server runs)
npm run format        # Prettier
```

CI runs lint, type-check, and build on every push to `main`/`staging`. Deploys are manual (`.github/workflows/deploy.yml`, workflow_dispatch): see docs/LAUNCH.md.
