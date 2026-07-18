# @newera365/cms

Payload CMS **v2** on a standalone Express server (NOT the Next-embedded v3 pattern; not serverless-compatible). PostgreSQL via Neon. Port 3001; boot takes 20 to 40 s (schema round-trip against Neon).

Key files:

- `src/payload.config.ts`: collections registry, native localization (`en`/`ar`, fallback), CORS/CSRF allowlists (`CORS_ORIGINS`).
- `src/collections/` (24) + `src/globals/SiteSettings.ts`. Shared field helpers in `src/collections/_fields.ts` (`seoFields`, `slugField()`).
- `src/endpoints/index.ts`: every custom REST endpoint (contact, newsletter double opt-in, education gate, partner apply, webinar register, MT5 proxy, health). DB-first, then best-effort email; per-IP rate limits via `src/rateLimit/postgresStore.ts` (its `rate_limit_hits` table lives outside Payload's schema, so drizzle offers to drop it on dev schema pushes: accept, it is transient data).
- `src/email/transport.ts` + `mailer.ts`: ZeptoMail over HTTPS in prod (Railway blocks SMTP ports); with `SMTP_PASS` unset in dev every email is logged as `[email:json]` instead of sent.
- `src/scripts/`: active seeds + `migrate-missing-columns.ts` (see below). `src/scripts/archive/`: one-offs already applied to prod, reference only.
- `migrations/`: numbered SQL; only 001 auto-runs on boot (`RUN_MIGRATIONS_ON_START`).

**The schema-drift rule (the most important thing in this file):** the Postgres adapter runs `push: false`. A new collection field does NOT create its column, and reads then 500 (`column X does not exist`). Add an idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS` to `src/scripts/migrate-missing-columns.ts`, run it (`npx ts-node --transpile-only src/scripts/migrate-missing-columns.ts`, uses the DIRECT Neon endpoint), then deploy. Removing a column: deploy the CMS without the field FIRST, then drop. Conventions: snake_case columns, `<table>_locales` locale tables (single underscore), varchar ids on array tables.

After collection changes: `npm run generate:types`, then re-add the `@ts-ignore` the generator strips from `src/payload-types.ts`.

Admin-only collections (403 anonymous): `users`, `newsletter-subscribers`, `webinar-registrations`, `contact-submissions`.
