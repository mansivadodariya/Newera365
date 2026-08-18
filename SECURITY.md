# Security Notes — NewEra365 Monorepo

## Known Vulnerabilities (npm audit)

`npm audit` reports ~29 vulnerabilities. Most are unfixable without a Payload v3 upgrade.
This document classifies each by exploitability so the team can triage correctly.

---

### Fixed in this codebase

| Package                   | CVE / Advisory                            | Fix applied                                    |
| ------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `nodemailer` ≤ 8.0.4      | GHSA-\*                                   | Direct dep updated to `^8.0.7` in `apps/cms`   |
| `qs` ≤ 6.14.1 (top-level) | GHSA-w7fw-mjwx-w883 / GHSA-6rw7-vpxm-498p | Root `overrides.qs: ^6.15.2` in `package.json` |

---

### Unfixable without Payload v3 upgrade

Payload v2 bundles its own copies of `express`, `qs`, `body-parser`, `compression`,
`nodemailer`, `file-type`, and `webpack` inside its own `node_modules`. These cannot
be overridden by workspace-level `overrides` because npm does not penetrate nested
package boundaries. The only fix is upgrading to Payload v3 (a major breaking change).

**Plan: Post-July-2026 launch, migrate the CMS to Payload v3.** See the follow-up
work item in the project tracker.

| Package                             | Severity | Runtime?                  | Advisory                                  | Notes                                                                                                                      |
| ----------------------------------- | -------- | ------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `qs` inside `payload/node_modules/` | High     | Yes                       | GHSA-w7fw-mjwx-w883                       | DoS via array parsing in body parsing. Mitigated by Cloudflare WAF rate-limiting + Payload's own 50 MB body limit.         |
| `file-type` 13–21.3                 | Moderate | Yes                       | GHSA-5v7r-6r5c-r473                       | Infinite loop on malformed ASF uploads. Mitigated: Media collection's `mimeTypes` list excludes audio/video/ASF.           |
| `nodemailer` 6.9.15 (Payload's dep) | —        | No (email send path only) | —                                         | Payload's own nodemailer dep is at 6.9.15. Our code uses 8.0.7.                                                            |
| `compression`                       | Moderate | Yes                       | GHSA-\*                                   | HTTP compression middleware in Payload. No known public exploit chain.                                                     |
| `body-parser` (via `payload`)       | Moderate | Yes                       | qs dependency                             | Inherited from Payload's express bundle. Same qs mitigations apply.                                                        |
| `drizzle-orm` < 0.45.2              | High     | **No**                    | GHSA-gpj5-g38j-94v9                       | SQL injection — but only in `drizzle-kit` CLI tooling used at migration time, not at runtime. Never exposed to user input. |
| `ajv` 7–8.17.1                      | Moderate | **No**                    | GHSA-2g4f-4pwh-qvx6                       | ReDoS in webpack config validation. Build-time only.                                                                       |
| `esbuild` ≤ 0.24.2                  | Moderate | **No**                    | GHSA-67mh-4wv8-2f99                       | Dev server exposure. Only triggers when webpack dev server is running. Not relevant in production.                         |
| `webpack` 5–5.104.0                 | Moderate | **No**                    | GHSA-8fgc-7cc6-rx7x / GHSA-38r7-794h-5758 | buildHttp SSRF. Requires `buildHttp` plugin config, which is not enabled here. Build-time only.                            |
| `serialize-javascript` ≤ 7.0.4      | High     | **No**                    | GHSA-5c6j-r48x-rmvq                       | RCE via crafted input during webpack minification. Build-time only. No user input reaches minification.                    |

---

### Runtime mitigations in place (Cloudflare WAF, already planned)

- **Rate limiting**: Cloudflare WAF rules limit request rates globally, reducing DoS
  exposure from the `qs` / `body-parser` vulnerabilities.
- **File type restriction**: Media collection `mimeTypes` whitelist prevents ASF/video
  uploads that could trigger the `file-type` infinite loop.
- **Body size**: Payload's default body limit (50 MB) bounds payload amplification.

---

### Slug / locale compound uniqueness (DB migration)

Application-layer slug uniqueness (`uniqueSlugPerLocale` hook) is complemented by
Postgres-level `CREATE UNIQUE INDEX` on `(slug, locale)` for all 10 locale-aware
collections. Run once after the initial schema is applied:

```bash
npm run db:migrate:slug-indexes -w apps/cms
```

SQL file: [`apps/cms/migrations/001_slug_locale_unique_indexes.sql`](apps/cms/migrations/001_slug_locale_unique_indexes.sql)

This migration also runs automatically on server startup (`apps/cms/src/server.ts`,
guarded by `RUN_MIGRATIONS_ON_START`, default ON in production). It is idempotent
(`CREATE INDEX IF NOT EXISTS`) and non-fatal — a failure logs and the server still
boots, because the `uniqueSlugPerLocale` application hook enforces uniqueness too.

---

### Operational caveats (not yet hardened)

#### Media storage is ephemeral

The `Media` collection writes uploads to the container filesystem
(`apps/cms/src/collections/Media.ts`, `staticDir: 'media'`). On Railway the
container filesystem is **ephemeral** — every deploy/restart wipes all uploaded
images, PDFs, and audio. **Do not rely on CMS-uploaded media surviving a deploy
until durable storage is wired.**

- **Durable fix (preferred):** Cloudflare R2 via `@payloadcms/plugin-cloud-storage`
  (NE-027), once R2 credentials are provisioned. Env scaffolding (`R2_*`) is already
  in `.env.example`.
- **Interim fix (no external creds):** mount a Railway **persistent volume** at the
  media directory so uploads survive deploys. This needs a one-time volume setup in
  the Railway dashboard and is not configured in code yet.

#### Database connection pool

`apps/cms/src/payload.config.ts` caps the Postgres pool at `max: 5` to stay within
Neon's free/starter connection limits. Under concurrent admin + API load this can be
tight. When on a paid Neon tier, raise `max` to ~10–15 and re-test.

---

### Smoke-test checklist (Resend / forgot-password)

Once `RESEND_API_KEY` and `EMAIL_FROM` are set in the CMS environment:

1. Start CMS: `npm run dev -w apps/cms`
2. Navigate to `/admin/forgot` in the Payload admin panel.
3. Submit a valid admin email — confirm a "Delivered" event in the Resend dashboard.
4. Click the reset link, set a new password, log back in.
5. Verify the token expires after 1 hour (Payload's default).
