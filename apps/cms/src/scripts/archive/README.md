# Archived one-off scripts

Historical migrations, patches, and targeted reseeds that have **already been
applied to the production database**. They are kept for reference (they document
how the schema and content got to their current state) and remain runnable with
`ts-node --transpile-only`, but they are excluded from `type-check` and should
**not be re-run against production**.

Categories:

- `migrate-*` — one-time DDL fixes (table creation, column retypes, drops).
  The two migrations that stayed active because they are operational tools live
  one level up: `migrate-missing-columns.ts` (the Payload v2 `push:false`
  schema-drift procedure) and `migrate-slug-indexes.ts` (wired to
  `npm run db:migrate:slug-indexes`).
- `patch-* / fix-* / update-* / rebrand-* / normalize-*` — one-time content or
  schema corrections.
- `seed-*-only / seed-*-final / reseed-* / seed-feed-images / seed-episode-thumbs /
seed-missing-analysis-images` — targeted reseeds superseded by the main seeds
  in `../` (`seed.ts` and the topic seeds).
- `*.js / *.cts` files — the oldest batch, predating the TypeScript convention.

If you need to write a new migration, copy the pattern from
`../migrate-missing-columns.ts` (idempotent `ALTER TABLE … IF NOT EXISTS`,
direct Neon endpoint) and keep it in `../` until it has run in production, then
move it here.
