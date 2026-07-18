# Newera365

Forex/CFD broker website — `newera365.com`. Reference: **CSL-NE365-2026-Q2** (CodeSquareLabs). Target launch: July 2026.

## Monorepo layout

| Workspace          | Purpose                                                         |
| ------------------ | --------------------------------------------------------------- |
| `apps/web`         | Next.js 14 App Router frontend — EN (LTR) + AR (RTL), 51 routes |
| `apps/cms`         | Payload CMS v2 + Express — PostgreSQL (Neon), media on R2       |
| `apps/mt5-service` | Mock MT5 Manager API bridge — live spreads/swaps/specs          |
| `packages/ui`      | Shared React component library                                  |
| `packages/types`   | Shared TypeScript types + locale constants                      |
| `packages/config`  | Shared ESLint + Tailwind presets                                |

## Getting started

```bash
npm install
cp apps/web/.env.example apps/web/.env
cp apps/cms/.env.example apps/cms/.env
cp apps/mt5-service/.env.example apps/mt5-service/.env
npm run dev
```

## Scripts

- `npm run dev` — run all apps in dev mode (Turborepo)
- `npm run build` / `lint` / `type-check` / `test` — pipelined across workspaces
- `npm run format` — Prettier across the repo

See [CLAUDE.md](./CLAUDE.md) for architecture details.
