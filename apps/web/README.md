# @newera365/web

Next.js 14 App Router frontend. Every route lives under `src/app/[locale]/` (`en` | `ar`, always prefixed). Pages are thin wrappers: they fetch CMS data server-side and render page components from `@newera365/ui`.

Key files:

- `src/lib/cms.ts`: the whole CMS integration layer (fetch helpers, ISR 60s/300s, 8s timeout, silent-empty error model). Read WALKTHROUGH.md section 4 before changing it.
- `src/i18n/routing.ts` + `src/i18n/request.ts`: next-intl config (locale list, per-request message loading).
- `messages/en.json` / `messages/ar.json`: UI strings. `scripts/check-i18n.js` (runs inside `npm run lint`) fails on mismatched keys or `__AR__` stubs, so every string ships with real Arabic.
- `next.config.mjs`: the IA-consolidation redirects, CSP/security headers, allowed image hosts, and the startup guard that throws when `NEXT_PUBLIC_CMS_URL` is missing in production builds.
- `scripts/generate-world-map.mjs` + `scripts/data/countries-110m.json`: generates the About page focus-map SVG data (`packages/ui/src/lib/worldMapData.ts`).
- `scripts/patch-open-next-images.mjs`, `open-next.config.ts`, `wrangler.jsonc`: the Cloudflare standby deploy path (LAUNCH.md appendix).

Gotchas:

- `NEXT_PUBLIC_*` vars are inlined **at build time**. A prod build without `NEXT_PUBLIC_CMS_URL` silently points forms and the ticker at localhost.
- One dev server at a time; no prod build while dev runs (`.next/` corruption).
- Vercel install command must be `npm ci`.
