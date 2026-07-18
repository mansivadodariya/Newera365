# LAUNCH-RUNBOOK.md

Handoff cutover for Newera365. Covers the two owner/infrastructure changes that
must be done by a human with account access: **Neon database → company account**
and **frontend → Cloudflare**. Written 2026-07-15 against the audited-green state
(CI passing on `main`, HEAD `efcbd9a`).

> Scope note: this is the _cutover_ runbook. General content/config readiness
> lives in `PRODUCTION_CHECKLIST.md`. Do the pre-cutover checklist below first.

---

## 0. Current topology (before cutover)

| Component           | Where it runs today                                                         | Notes                                                                            |
| ------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Frontend `apps/web` | **Vercel** (`newera365-app.vercel.app`)                                     | Stays here for client review; moves to Cloudflare at handoff                     |
| CMS `apps/cms`      | **Railway** (`cms-production-e103…`, Pro acct `newera365socials@gmail.com`) | No change planned                                                                |
| Database            | **Neon** — personal account (`ep-round-bar-apsu8d1v`)                       | → move to company Neon org                                                       |
| Media / gated PDFs  | **Railway volume** via `MEDIA_DIR`, served through the CMS                  | R2 scoped but NOT wired (`NE-027`); `R2_*` env vars unused, plugin not installed |
| MT5                 | Mock service (`apps/mt5-service`)                                           | Real Manager API still `NE-003`                                                  |

Two independent moves. **Do Neon first, verify, then Cloudflare** — never both in
the same window (you want one variable at a time if something breaks).

---

## 1. Pre-cutover checklist (finish before touching infra)

- [ ] **Delete audit test rows** from Neon (created during the 2026-07-15 audit):
  ```sql
  DELETE FROM contact_submissions    WHERE email LIKE '%newera365.test%';
  DELETE FROM newsletter_subscribers WHERE email LIKE '%newera365.test%';
  DELETE FROM webinar_registrations  WHERE email LIKE '%newera365.test%';
  ```
- [ ] **CTA links** wired (live-account / demo / sales) — the client's CRM URLs.
- [ ] **FAQ content** decision (currently 10; client-feedback audit wanted 20).
- [ ] **Careers + Recognition** — decide re-enable vs keep hidden. To re-enable,
      delete the two `permanent:false` redirects in `apps/web/next.config.mjs`
      (block dated `2026-07-09`). The `awards`/`media-press` → `recognition`
      redirects then resolve directly, no other change needed.
- [ ] `npm run build` green locally, CI green on `main`.
- [ ] Take a Neon backup/branch (see 2.1) as a rollback point.

---

## 2. Part A — Neon database → company account

Goal: the company owns the Neon project; production keeps working throughout.
Two methods. **Method 1 (project transfer) is strongly preferred** — the
connection string is preserved, so no app redeploy is even required.

### 2.1 Safety net first (either method)

In the Neon console, create a **branch** of the current project (instant copy-on-write
snapshot) named `pre-handoff-2026-07-15`. This is your rollback point. Also confirm
you have the current `DATABASE_URL` + `DATABASE_URL_DIRECT` saved somewhere safe.

### 2.2 Method 1 — Native project transfer (preferred)

Neon supports transferring a project between organizations without changing its
endpoints.

1. Company creates/_has_ a Neon **Organization** (not just a personal account).
2. You (current owner) → Neon console → the project → **Settings → Transfer** →
   transfer to the company org. (If the console doesn't expose org-to-org
   transfer for your plan, use Neon support or Method 2.)
3. Because the project ID and hostnames don't change, **`DATABASE_URL` stays
   identical** → Railway CMS and any build-time consumers need **no env change**.
4. Verify (see 2.4). Rotate credentials afterward (2.5).

### 2.3 Method 2 — Dump & restore into a new company-owned project

Use if transfer isn't available.

1. Company creates a new Neon project in their org → note its **direct**
   (non-pooler) connection string as `NEW_DIRECT`.
2. Dump from old, restore to new (run from a machine with `pg_dump`/`pg_restore`,
   Postgres 16 client to match Neon):

   ```bash
   # From the OLD direct (non-pooler) URL:
   pg_dump --no-owner --no-privileges -Fc \
     "postgresql://…OLD_DIRECT…/neondb?sslmode=require" -f newera.dump

   # Into the NEW project's direct URL:
   pg_restore --no-owner --no-privileges --clean --if-exists \
     -d "postgresql://…NEW_DIRECT…/neondb?sslmode=require" newera.dump
   ```

   Notes:
   - Use the **`-pooler`-less** host for both dump and restore (DDL over the pooler
     is flaky — same reason the CMS migration scripts prefer `DATABASE_URL_DIRECT`).
   - `rate_limit_hits` (transient) and any `*_locales` tables come along fine; the
     dump is schema+data, so Payload's `push:false` expectations hold.

3. Repoint env everywhere (2.6) to the new pooler URL, then verify (2.4).

### 2.4 Verification (run after either method)

CMS must be pointing at the (possibly new) DB. From a shell:

```bash
# Health (needs the token)
curl -s -H "x-health-token: $HEALTH_CHECK_TOKEN" https://<cms-host>/api/health

# Data present + counts non-zero (spot a few)
for c in blog-posts products-instruments account-types faqs; do
  curl -s "https://<cms-host>/api/$c?locale=en&limit=0" | grep -o '"totalDocs":[0-9]*'
done
```

Expected (baseline from 2026-07-15 audit): blog-posts 11, products-instruments 31,
account-types 4, faqs 10. Then load the live site and confirm pages render.

### 2.5 Rotate credentials (do NOT skip on a handoff)

The personal account's connection string is now known to the previous owner. In
Neon, **reset the role password / rotate the connection string**, then update
`DATABASE_URL` + `DATABASE_URL_DIRECT` in Railway (CMS) and redeploy. Rotating
`PAYLOAD_SECRET` is optional but recommended if the account is fully changing hands
(note: rotating it invalidates existing admin login sessions — users re-login; it
does **not** affect content).

### 2.6 Env locations to update (Method 2 or after rotation)

| Var                   | Where         | Notes                                      |
| --------------------- | ------------- | ------------------------------------------ |
| `DATABASE_URL`        | Railway (CMS) | pooler URL                                 |
| `DATABASE_URL_DIRECT` | Railway (CMS) | non-pooler; used by migration/seed scripts |

`apps/web` does **not** talk to the DB directly (only to the CMS REST API), so no
web-side DB env exists to change.

---

## 3. Part B — Frontend → Cloudflare

Today: Vercel. Target: Cloudflare Workers via the **OpenNext Cloudflare adapter**
(`@opennextjs/cloudflare`) — this is the supported path for a Next.js 14 App
Router app on Workers. Budget this as its own focused effort; it is not a
flip-a-switch move.

### 3.1 Known friction (plan for these, from this app specifically)

- **`next.config.mjs` `redirects()` + `images` remotePatterns** — supported by
  OpenNext, but re-verify all 13 redirects (IA merges + the temporary
  careers/recognition ones) resolve on Workers.
- **ISR** (`revalidate 60` collections / `300` globals) — OpenNext maps ISR to a
  cache backend (R2 or Workers KV). You must configure an incremental cache
  binding or ISR silently degrades to no-cache. Decide R2 vs KV.
- **`next-intl` middleware** (`localePrefix: 'always'`) runs as a Worker — verify
  `/` → `/en` and `/ar` RTL still work post-deploy.
- **Image Optimization** — Vercel's `/_next/image` optimizer isn't on Workers;
  OpenNext uses its own. Media is served from the **Railway volume via the CMS**
  (not R2 — see topology). Confirm the CMS media host is in `images.remotePatterns`
  and consider a Cloudflare cache rule in front of the Railway `/media/*` origin for
  edge caching, or serve pre-sized images to avoid a second optimizer hop.
- **`transpilePackages`** (`@newera365/ui`, `@newera365/types`) — monorepo build
  must run from repo root; ensure the Cloudflare build command targets the web
  workspace with workspaces installed.

### 3.2 Steps (outline)

1. `npm i -D @opennextjs/cloudflare wrangler` in `apps/web`.
2. Add `open-next.config.ts` + `wrangler.toml` (name, compat date, `nodejs_compat`
   flag, incremental cache binding → R2 bucket or KV namespace).
3. Build: `npx opennextjs-cloudflare build` (wraps `next build`).
4. Preview locally: `npx opennextjs-cloudflare preview` — smoke-test EN/AR,
   a CMS-backed page, an API-driven form.
5. `npx wrangler deploy` to a `*.workers.dev` staging first.
6. Point DNS (the production domain) at the Worker once staging passes.

### 3.3 Env vars to recreate on Cloudflare (Workers → Vars/Secrets)

All are read at build and/or runtime; set them in the Cloudflare project, not just
locally.
| Var | Purpose |
| --- | ------- |
| `NEXT_PUBLIC_CMS_URL` | CMS REST base — **must be the Railway HTTPS URL**, not localhost |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL (sitemap, SEO, OG) |
| `NEXT_PUBLIC_GA_ID` | analytics (if used) |
| `NEXT_PUBLIC_META_PIXEL_ID` | pixel (if used) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (if wired) |

> Gotcha carried from Vercel notes: env values must be **clean** (no trailing
> `\n`) and the CMS URL must be the public Railway host. A localhost value here is
> the classic silent-empty-site cause.

### 3.4 CORS — update the CMS

The CMS allow-lists origins via `CORS_ORIGINS` (multi-origin) + `FRONTEND_URL`.
When the site's origin changes to the Cloudflare/production domain, add it to
`CORS_ORIGINS` on Railway and redeploy the CMS, or forms/fetches will fail CORS.

### 3.5 Cutover & rollback

- Deploy to Workers staging, verify (section 4), then switch DNS.
- **Rollback**: Vercel deployment stays live until DNS is confirmed on Cloudflare;
  if anything breaks, point DNS back to Vercel. Keep the Vercel project until the
  Cloudflare deploy has soaked for a few days.

---

## 4. Post-cutover verification (both parts)

Re-run the 2026-07-15 audit checks against the **production** hosts:

1. **CI/build** green.
2. **CMS API** — `totalDocs` non-zero for blog-posts/products-instruments/account-types/faqs, EN + AR; admin collections still 403 unauth.
3. **Routes** — homepage + a page per nav tab return 200, EN + AR; `dir=rtl` on `/ar`.
4. **Forms** — one live POST each: newsletter, contact, webinar-register → 200
   (use a real inbox you control, then delete the row). Confirm the confirmation
   email actually arrives (ZeptoMail via `SMTP_PASS` — Railway blocks SMTP ports,
   so it goes over the ZeptoMail HTTP API; verify that path still works from the
   CMS host).
5. **CMS → frontend** — edit one field in the admin, confirm it appears on the
   live site within the ISR window (≤60 s collections / ≤300 s globals), then
   revert.
6. **Media** — a CMS image and a gated PDF load over the production domain. Media
   is served from the Railway volume through the CMS (`MEDIA_DIR`); **confirm the
   prod volume is mounted and `MEDIA_DIR` points at it** — an unmounted volume means
   a redeploy wipes uploads while DB rows survive (→ 404s). Note gated PDFs return a
   public path (email-wall, not access control) — acceptable if the client agrees.
7. **Console** — 0 client-side errors on the homepage.

---

## 5. Order of operations (tl;dr)

1. Pre-cutover checklist (§1) — content, CTAs, delete test rows, backup branch.
2. Neon transfer (§2) → rotate creds → verify → soak.
3. Cloudflare build + staging (§3) → verify → DNS switch → keep Vercel as rollback.
4. Full post-cutover verification (§4).
5. Decommission Vercel + personal Neon access once soaked.
