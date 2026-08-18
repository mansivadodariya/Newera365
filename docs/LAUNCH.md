# LAUNCH.md

Consolidated launch and operations reference for Newera365.com. Ref CSL-NE365-2026-Q2.
This document supersedes `LAUNCH-RUNBOOK.md` and `PRODUCTION_CHECKLIST.md` (repo root),
merging their still current content as of 2026-07-18. It is written for the client dev
team taking over operations.

Baseline: CI green on `main`, content audit baseline 2026-07-15.

---

## 1. Production topology

| Component                     | Platform                                             | URL / identifier                                                              |
| ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Frontend `apps/web` (primary) | Vercel                                               | `newera365-app.vercel.app`, Vercel project `newera365-app`                    |
| Frontend (standby)            | Cloudflare Workers via OpenNext                      | `newera365-web.newera365socials.workers.dev`, see Appendix                    |
| CMS `apps/cms`                | Railway Pro (account `newera365socials@gmail.com`)   | `cms-production-e103.up.railway.app`                                          |
| Database                      | Neon serverless Postgres, client's account           | endpoint `ep-wandering-mode-auflfo8c`                                         |
| Old database project          | Neon, dev account leftover                           | endpoint `ep-round-bar`, scheduled for deletion after soak, do not use        |
| Media and gated PDFs          | Railway volume (`MEDIA_DIR`), served through the CMS | Cloudflare R2 is scoped but not wired (NE-027)                                |
| MT5 data                      | Mock bridge `apps/mt5-service`                       | Real Manager API client unimplemented (NE-003), CMS falls back to manual data |
| Transactional email           | ZeptoMail (Zoho) via HTTP API from the CMS           | Sender `no-reply@newera365.com`, verified domain                              |
| Public domain                 | `newera365.com` currently serves the legacy PHP site | DNS cutover to Vercel pending, see section 4                                  |
| CI/CD                         | GitHub Actions                                       | `ci.yml` (push CI), `deploy.yml` (manual dispatch CD)                         |

Notes:

- Vercel is the primary web deployment target. The Cloudflare Workers deployment is a
  maintained standby, verified working, and documented only in the Appendix.
- `apps/web` never talks to the database directly, only to the CMS REST API. There is
  no web side DB env var.
- The mock MT5 service is not deployed as a public production component. The CMS
  `/api/mt5/instruments` endpoint degrades gracefully to CMS manual data when the
  bridge is unreachable, and the UI shows a static data notice.

---

## 2. Environment variables

Names and purpose only. Never record values in the repo or in this file. All secrets
live in the platform env stores (Vercel project settings, Railway service variables).

### `apps/web` (set in Vercel, production environment)

All `NEXT_PUBLIC_*` values are baked in at build time. Changing one requires a redeploy.

| Var                              | Purpose                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CMS_URL`            | CMS REST base. Must be the public Railway HTTPS URL. A localhost or stale value is the classic cause of a silently empty site. |
| `NEXT_PUBLIC_SITE_URL`           | Canonical site URL, used by sitemap, robots, SEO metadata, OG tags. Falls back to localhost if unset.                          |
| `NEXT_PUBLIC_GA_ID`              | GA4 measurement ID. Value pending from client.                                                                                 |
| `NEXT_PUBLIC_META_PIXEL_ID`      | Meta Pixel ID. Value pending from client.                                                                                      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile. Scaffolded in code, not yet wired on forms.                                                              |

Gotchas:

- Env values must be clean, with no trailing newline. A past Vercel env value carried
  a trailing `\n` and broke requests.
- The Vercel install command must be `npm ci`, not `npm install` (monorepo lockfile).
- The canonical Vercel project deploys from the repo root (`vercel.json`: `npm ci` plus
  a turbo filter). `apps/web/.vercel` is a stale link, never deploy from inside `apps/web`.

### `apps/cms` (set in Railway service variables)

| Var                                                                                         | Purpose                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PAYLOAD_SECRET`                                                                            | Payload auth secret. Rotating it logs out admin sessions, content is unaffected.                                                                                                                                              |
| `PAYLOAD_PUBLIC_SERVER_URL`                                                                 | Public CMS URL, used in admin and generated links.                                                                                                                                                                            |
| `DATABASE_URL`                                                                              | Neon pooled connection string.                                                                                                                                                                                                |
| `DATABASE_URL_DIRECT`                                                                       | Neon direct (non pooler) connection. Used by migration and seed scripts, DDL over the pooler is unreliable.                                                                                                                   |
| `FRONTEND_URL`                                                                              | Primary site origin. Used for CORS and links in emails. Required in prod.                                                                                                                                                     |
| `CORS_ORIGINS`                                                                              | Comma separated additional allowed origins (multi origin allow list).                                                                                                                                                         |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER`                                                     | ZeptoMail connection settings. `SMTP_USER` is the literal string `emailapikey`.                                                                                                                                               |
| `SMTP_PASS`                                                                                 | The ZeptoMail Send Mail Token. Railway blocks SMTP ports, so `transport.ts` sends via the ZeptoMail HTTP API over 443 using this token. With `SMTP_PASS` unset in dev, emails are logged as JSON, not sent. Required in prod. |
| `EMAIL_FROM`                                                                                | Verified sender address on the ZeptoMail domain. Required in prod.                                                                                                                                                            |
| `CONTACT_NOTIFY_EMAIL` / `PARTNERS_NOTIFY_EMAIL` / `WEBINAR_NOTIFY_EMAIL`                   | Internal notification recipients for form submissions.                                                                                                                                                                        |
| `CONSENT_IP_SALT`                                                                           | Salt for hashing consent IP records. Required in prod.                                                                                                                                                                        |
| `HEALTH_CHECK_TOKEN`                                                                        | Token for `/api/health`. Must be non empty or the endpoint always returns 401.                                                                                                                                                |
| `MEDIA_DIR`                                                                                 | Path of the mounted Railway volume for uploads. See section 4 smoke check 6.                                                                                                                                                  |
| `MT5_SERVICE_URL` / `MT5_INTERNAL_API_TOKEN`                                                | Mock MT5 bridge URL and shared secret.                                                                                                                                                                                        |
| `SKIP_SMTP_VERIFY`                                                                          | Set `true` where the host blocks SMTP ports (Railway does).                                                                                                                                                                   |
| `R2_BUCKET` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_ENDPOINT` / `R2_PUBLIC_URL` | Scaffolded for Cloudflare R2 media storage. Unused until the cloud storage plugin is wired (NE-027).                                                                                                                          |

The CMS validates env on startup: in production it errors out if `PAYLOAD_SECRET`,
`FRONTEND_URL`, `SMTP_PASS`, `EMAIL_FROM`, or `CONSENT_IP_SALT` is missing.

### `apps/mt5-service`

| Var                                                    | Purpose                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `MT5_HOST` / `MT5_PORT` / `MT5_LOGIN` / `MT5_PASSWORD` | Client provided MT5 server credentials. Held but unused until the real Manager API client exists (NE-003). |
| `MT5_INTERNAL_API_TOKEN`                               | Shared secret, must match the CMS value.                                                                   |

---

## 3. Deploy procedures

### CI

`.github/workflows/ci.yml` runs lint, type-check, and build on push to `main` and
`staging`, on Node 22. There is no test runner wired up.

Always verify the actual GitHub Actions run is green after pushing. A green local
build does not prove CI: local `.env.local` and the turbo cache mask CI failures.

### CD is manual only

`.github/workflows/deploy.yml` is `workflow_dispatch` only. Auto deploy on push is
deliberately disabled: a commented `workflow_run` block in the file enables web auto
CD if uncommented (4 lines). The CMS stays manual by design, because every CMS boot
runs a drizzle schema push against Neon.

Required repo secrets (Settings, Secrets and variables, Actions):

- `VERCEL_TOKEN` (vercel.com, Account Settings, Tokens)
- `RAILWAY_TOKEN` (Railway project, Settings, Tokens, project token for the production env)

To dispatch: GitHub, Actions, Deploy, Run workflow, pick target `web`, `cms`, or `both`.

### Web (Vercel)

Option A, dashboard: Vercel, project `newera365-app`, Deployments, pick the latest
production deployment, Redeploy. Or promote any previous production deployment for an
instant rollback.

Option B, workflow dispatch: run the Deploy workflow with target `web`. It runs
`vercel deploy --prod --yes` with the pinned org and project IDs, identical to the
manual CLI flow below.

Option C, CLI from the repo root:

```bash
vercel --prod
```

Notes:

- ISR revalidation (60 s collections, 300 s globals) refreshes data only. New or
  changed components always require a redeploy.
- Never run a production build while a dev server is running on the same checkout,
  the shared `.next` directory corrupts.

### CMS (Railway)

Option A, CLI from the repo root (uses `railway.toml`, Dockerfile at
`apps/cms/Dockerfile`):

```bash
railway up --service cms --ci
```

`--ci` streams build logs and fails on build errors. Requires `railway login` or a
`RAILWAY_TOKEN` env var.

Option B, workflow dispatch: run the Deploy workflow with target `cms`.

Notes:

- CMS startup takes 20 to 40 s (drizzle schema push against Neon on every boot). Wait
  for `CMS server listening` before probing.
- Column drop ordering: if a field is removed from a collection config, redeploy the
  CMS first, then drop the Neon column. Payload selects all columns, so dropping the
  column before the redeploy 500s every read of that collection.
- New `SiteSettings` fields need a Railway redeploy (CMS) and then a Vercel redeploy
  (web) before they render on the site.
- Schema drift: the adapter runs with `push: false`, so fields added after a
  collection's initial migration do not create their columns. Backfill with idempotent
  entries in `apps/cms/src/scripts/migrate-missing-columns.ts` and run it from
  `apps/cms` with `ts-node --transpile-only src/scripts/migrate-missing-columns.ts`
  (connects to the direct Neon endpoint).

---

## 4. Launch day runbook

Context: `newera365.com` currently serves the legacy PHP site. Cutover means pointing
the apex and `www` DNS at Vercel. The database move to the client's Neon account is
already complete, so DNS is the only infrastructure change on launch day.

### Pre flight (finish days before the window)

- [ ] CI green on `main`, `npm run build` green locally.
- [ ] Env matrix (section 2) verified on Vercel and Railway. In particular set
      `NEXT_PUBLIC_SITE_URL=https://newera365.com` and redeploy web before cutover.
- [ ] CORS: `FRONTEND_URL` and `CORS_ORIGINS` on the CMS include
      `https://newera365.com` (and `www` if served), then redeploy the CMS. Without
      this, forms and client side fetches fail CORS the moment DNS flips.
- [ ] Delete audit test rows from Neon (created during the 2026-07-15 audit):

  ```sql
  DELETE FROM contact_submissions    WHERE email LIKE '%newera365.test%';
  DELETE FROM newsletter_subscribers WHERE email LIKE '%newera365.test%';
  DELETE FROM webinar_registrations  WHERE email LIKE '%newera365.test%';
  ```

- [ ] CTA links wired (live account, demo, sales): the client CRM URLs.
- [ ] Content decisions closed: FAQ count (10 live, client feedback asked for 20),
      Careers and Recognition re enable or keep hidden. To re enable, delete the two
      `permanent: false` redirects in `apps/web/next.config.mjs` (block dated
      2026-07-09), the `awards` and `media-press` redirects then resolve directly.
- [ ] Legacy URL map: inventory the old PHP site's indexed URLs. Any path with SEO
      value needs a redirect entry, otherwise it 404s after cutover. This is a known
      SEO risk, decide the list with the client.
- [ ] Neon safety branch: in the Neon console create a branch of the production
      project named `pre-cutover-<date>` (instant copy on write snapshot). This is
      the DB rollback point.
- [ ] Lower DNS TTL on the affected records to 300 s or less, at least 24 h ahead.
- [ ] Add `newera365.com` (and `www`) as domains on the Vercel project ahead of the
      window so certificates are issued and Vercel shows the exact DNS records.

### Cutover (low traffic window)

1. Set the DNS records at the DNS host to the values Vercel shows for the domain.
2. Wait for propagation, confirm TLS works on `https://newera365.com`.
3. Purge any CDN or proxy cache in front of the old site if one exists.

### Smoke checks after cutover

Run against the production domain.

1. Health endpoint:

   ```bash
   curl -s -H "x-health-token: $HEALTH_CHECK_TOKEN" https://cms-production-e103.up.railway.app/api/health
   ```

2. CMS data present, counts non zero (baseline from the 2026-07-15 audit:
   blog-posts 11, products-instruments 31, account-types 4, faqs 10):

   ```bash
   for c in blog-posts products-instruments account-types faqs; do
     curl -s "https://cms-production-e103.up.railway.app/api/$c?locale=en&limit=0" | grep -o '"totalDocs":[0-9]*'
   done
   ```

   Admin collections (`users`, `newsletter-subscribers`, `webinar-registrations`)
   must still return 403 unauthenticated.

3. Routes: homepage plus one page per nav tab return 200 in EN and AR, `dir="rtl"`
   present on `/ar`.
4. Forms: one live POST each for newsletter, contact, and webinar registration, using
   a real inbox you control. Confirm the confirmation email actually arrives (sent
   from the CMS via the ZeptoMail HTTP API). Delete the created rows afterwards.
5. CMS to frontend: edit one field in the admin, confirm it appears on the live site
   within the ISR window (up to 60 s for collections, 300 s for globals), then revert.
6. Media: a CMS image and a gated PDF load over the production domain. Confirm the
   Railway volume is mounted and `MEDIA_DIR` points at it. An unmounted volume means
   a redeploy wipes uploads while DB rows survive, leaving 404s. Note gated PDFs
   return a public path (email wall, not access control), acceptable only if the
   client has agreed.
7. Browser console: zero client side errors on the homepage.
8. Monitoring: the content probe (section 6) is live and passing against the
   production domain.
9. Submit EN and AR sitemaps to Google Search Console.

Watch actively for 15 to 30 minutes, then check error rate and latency over 48 h.

### Rollback

Triggers:

- Sustained 5xx rate above roughly 2 percent.
- `/api/health` failing, or CMS unreachable, or Neon connection errors (the CMS pool
  is capped at `max: 5`).
- Forms or email silently failing.

Actions:

- DNS level: revert the DNS records to the prior target. TTL was lowered in pre
  flight, so this takes effect quickly. The legacy PHP hosting stays untouched until
  soak completes, so reverting DNS restores the old site.
- App level (no DNS change): on Vercel, promote a previous production deployment
  (instant). On Railway, redeploy the last good image.
- Keep the previous hosting, the Vercel deployment history, and the Cloudflare
  standby available for at least 2 weeks after cutover.

---

## 5. Credential and account inventory

Reference only. No secret values here or anywhere in the repo.

| Account / credential                             | Holder today    | Notes                                                                                                     |
| ------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------- |
| GitHub repository and Actions secrets            | Agency          | Secrets `VERCEL_TOKEN`, `RAILWAY_TOKEN` power the Deploy workflow.                                        |
| Vercel project `newera365-app`                   | Agency          | Primary web hosting, production env vars live here.                                                       |
| Railway Pro account `newera365socials@gmail.com` | Agency          | CMS service, volume, and CMS env vars.                                                                    |
| Neon (client account)                            | Client          | Production DB, endpoint `ep-wandering-mode-auflfo8c`.                                                     |
| Neon (old dev account)                           | Agency          | Leftover project with endpoint `ep-round-bar`. Delete after soak, keep the pre cutover branch until then. |
| Cloudflare account (`newera365socials`)          | Agency          | Hosts the standby Worker. Would also host DNS, WAF, and Turnstile if adopted.                             |
| ZeptoMail (Zoho)                                 | Client / agency | Send Mail Token (`SMTP_PASS`), verified sending domain `newera365.com`.                                   |
| MT5 server credentials                           | Client          | Server link, manager login, master and API passwords. Stored in mt5-service env, unused until NE-003.     |

### Rotate at handoff

- Neon role password / connection string: the previous owner knows the current
  string. Rotate in the Neon console, then update `DATABASE_URL` and
  `DATABASE_URL_DIRECT` on Railway and redeploy the CMS.
- `PAYLOAD_SECRET`: recommended when the account changes hands. Invalidates existing
  admin login sessions (users log in again), does not affect content.
- `HEALTH_CHECK_TOKEN`: rotate, then update the monitoring probe with the new value.
- ZeptoMail Send Mail Token: rotate if the previous team had access, update
  `SMTP_PASS` on Railway.
- `VERCEL_TOKEN` and `RAILWAY_TOKEN` repo secrets: reissue from client owned
  accounts once the platform accounts are transferred.

---

## 6. Monitoring and health

### CMS health endpoint

```bash
curl -s -H "x-health-token: $HEALTH_CHECK_TOKEN" https://cms-production-e103.up.railway.app/api/health
```

`HEALTH_CHECK_TOKEN` must be set to a non empty value on the CMS, otherwise the
endpoint always returns 401 regardless of the header.

### Content probe rule (mandatory)

The uptime probe for the site must assert a known content string on the page, for
example a hero headline or the footer legal entity name. It must not pass on HTTP 200
alone. The frontend renders silently empty when the CMS is unreachable (statically
rendered shell with no data), so a 200 does not prove the site is healthy. Run two
probes: one string assertion against the site, one against the CMS health endpoint.

### CMS boot behavior

- Startup takes 20 to 40 s: the postgres adapter runs a drizzle schema push against
  Neon on every boot. Do not treat the deploy as failed, and do not probe, before the
  `CMS server listening` log line.
- On interactive restarts the schema push may prompt to drop the unknown
  `rate_limit_hits` table. Accept it, this is transient rate limit data created
  outside Payload's schema, not content.

### Current state

There is no error monitoring (no Sentry or equivalent on web, cms, or mt5-service)
and no uptime or Web Vitals dashboard configured yet. These are open handoff items,
tracked per section 7.

---

## 7. Known gaps at handoff

The live tracker for open items is section 12 of the walkover document. This section
is intentionally a pointer only, do not fork the list here.

---

## 8. Appendix: Cloudflare standby deployment

Status: maintained standby, not the primary. The primary web deployment is Vercel
(section 1). The standby was deployed and smoke tested on 2026-07-16 at
`https://newera365-web.newera365socials.workers.dev`: EN and AR routing, all
redirects, security headers, and `/_next/image` verified green. Use the standby only
if Vercel must be replaced, or as disaster recovery.

### What exists in the repo (`apps/web`)

- `@opennextjs/cloudflare` pinned at 1.15.1: the last adapter version supporting
  Next 14. 1.16 and later require Next 15, do not bump until the Next 15 migration.
- `wrangler.jsonc`: Worker config. Node runtime via `nodejs_compat` (required by the
  next-intl middleware and `next.config.mjs` `headers()`), plus
  `global_fetch_strictly_public`, the assets binding, and the images binding.
- `open-next.config.ts`: incremental cache on Workers KV with a memory queue. R2 was
  not enabled on the account (API error 10042), switch the incremental cache to R2
  once it is. Without a cache binding, ISR silently degrades to no cache.
- `scripts/patch-open-next-images.mjs`: post build patch for image handling, already
  wired into the npm scripts below.
- Env for the standby build is baked from `.env.production.local` at build time.
  There is no runtime `.env` on Workers: `NEXT_PUBLIC_*` values are compiled in, and
  server secrets would go through `wrangler secret put`.

### Commands (run from `apps/web`)

```bash
npm run preview   # opennextjs-cloudflare build, patch script, wrangler dev
npm run deploy    # opennextjs-cloudflare build, patch script, wrangler deploy
```

Never run these while a dev server is running on the same checkout, the shared
`.next` directory corrupts.

### Activation procedure

1. Confirm `apps/web/.env.production.local` carries the production values, in
   particular `NEXT_PUBLIC_CMS_URL` pointing at the Railway CMS and the correct
   `NEXT_PUBLIC_SITE_URL`.
2. `npm run deploy` from `apps/web`, verify at the `workers.dev` URL.
3. CORS: add the `workers.dev` origin (and the production domain, if it will be
   served from the Worker) to `CORS_ORIGINS` on the Railway CMS and redeploy the
   CMS. Until then, forms and client side fetches from the standby fail CORS. This
   is a known gap: the standby is currently deployed without its origin in
   `CORS_ORIGINS`.
4. Smoke test a form submission end to end (this exercises exactly the CORS path),
   plus EN and AR routing, a CMS backed page, and an image.
5. Bind the custom domain to the Worker (Workers routes or custom domain) and move
   DNS.
6. Roll back at any time by pointing DNS back at Vercel, the Vercel deployment stays
   live in parallel.

### Standby specific notes

- Verify `/` redirects to `/en` and `/ar` renders RTL after every standby deploy,
  the next-intl middleware runs as part of the Worker.
- Media is served from the Railway CMS either way, keep the CMS host in
  `images.remotePatterns` in `next.config.mjs`.
- The root `vercel.json` is live configuration for the primary deployment. Older
  advice to delete it (from the era when Cloudflare was assumed primary) is void.
