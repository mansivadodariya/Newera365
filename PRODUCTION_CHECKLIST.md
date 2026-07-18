# NewEra365 — Production Readiness Checklist

**Ref:** CSL-NE365-2026-Q2 · **Scope:** Phase 3 hardening + Phase 4 launch (tickets **NE-041 → NE-051**) · **Prepared:** 2026-06-18

This maps the launch tickets against the **actual codebase state** and the **third-party
services the client has now provided**. Tick the boxes as you go; items marked 🔴 are the
non-obvious ones that are real work, not just an env var.

---

## 0. Third-party stack (client-provided)

| Concern                          | Provider                                                | Replaces / status                   | Notes                                                                                      |
| -------------------------------- | ------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| Frontend host                    | **Cloudflare Workers** (OpenNext adapter)               | was Vercel in repo config           | ✅ decided — full host on CF; see §6                                                       |
| CMS host                         | **Railway**                                             | was "EC2/Railway"                   | Ephemeral FS — see 🔴 R2 below                                                             |
| Database                         | **Neon** (Postgres)                                     | unchanged                           | CMS on Railway connects out to Neon                                                        |
| Transactional + newsletter email | **Zoho Mail SMTP** (`smtppro.zoho.com`)                 | **replaces Resend**                 | 🔴 code migration + SPF/DKIM/DMARC; bulk via Zoho Campaigns (NE-043)                       |
| MT5 live data                    | **server link + name + login + master & API passwords** | replaces mock feed                  | 🔴 Manager API is Windows-native — likely needs a Windows bridge/REST gateway (NE-003/028) |
| Media / gated PDFs               | **Cloudflare R2** (NE-027)                              | still TODO                          | 🔴 near-blocker on Railway                                                                 |
| CAPTCHA                          | **Cloudflare Turnstile** (NE-026)                       | keys now available                  | wire `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                                      |
| Live chat                        | **WhatsApp click-to-chat** (replaces Zoho SalesIQ)      | new — floating button, bottom-right | needs WhatsApp Business number; drop SalesIQ + `/live-chat`                                |

---

## 1. Critical findings — read before planning the sprint

1. 🔴 **Email is a code migration, not a config swap.** `apps/cms/src/email/transport.ts`
   (nodemailer) repoints to Zoho trivially, but **every** transactional + newsletter send in
   `apps/cms/src/email/resend.ts` uses the **Resend SDK** (`getClient().emails.send()`) —
   newsletter confirm/welcome, contact, webinar ×2, partners (6 functions). All must be
   rewritten onto the nodemailer transport. `syncSubscriberToAudience` (Resend Audiences) has
   **no Zoho-SMTP equivalent** — drop it or move the list to Zoho Campaigns.
2. 🔴 **MT5 "live data" is still mock.** Credentials now exist, but `apps/mt5-service` serves
   `fallback.json` and the real Manager API client is a `TODO(NE-003)`. Having creds ≠ live
   data. Either build the client, or **launch on CMS manual-data fallback** (the designed
   graceful degradation) and ship live data as a fast-follow.
3. 🔴 **Railway filesystem is ephemeral.** Uploads land in `apps/cms/media/` on local disk and
   are **lost on every redeploy**. R2 (NE-027) is effectively a **launch blocker** here, not a
   Phase-3 nice-to-have. Env scaffolding (`R2_*`) already exists; the cloud-storage plugin must
   be wired in `payload.config.ts`.
4. 🔴 **SMTP egress + send limits on Railway.** Port 465 may be blocked → set
   `SKIP_SMTP_VERIFY=true` and confirm Zoho outbound works (or use Zoho's API / port 587).
   Zoho **Mail** SMTP has low daily caps — use it for transactional mail; route bulk newsletter
   blasts through **Zoho Campaigns**, not the SMTP transport.
5. ⚠️ **Language scope mismatch.** Plan + gates say 3 languages (EN/ES/ZH); the build ships
   **EN + AR (RTL)**. Update every "all 3 language sitemaps/versions" gate criterion to **EN/AR**
   and re-confirm scope with the client.
6. ✅ **Hosting decided (§6).** Cloudflare Workers via the **OpenNext adapter**
   (`@opennextjs/cloudflare`) — Node runtime keeps `next-intl` middleware + `headers()` working.
   Repo's Vercel config (`vercel.json` ×2) becomes dead and should be removed; `next/image`
   needs a Cloudflare image strategy (NE-048).

---

## 2. Ticket status — NE-041 → NE-051

### NE-041 · Enterprise security layer — 🟢 mostly done

- [x] HTTPS/TLS + **HSTS** (`max-age=63072000; includeSubDomains`) — `next.config.mjs`
- [x] **CSP** blocking XSS/clickjacking (`frame-ancestors`, `object-src 'none'`, `base-uri`, `form-action`, `upgrade-insecure-requests` in prod)
- [x] Rate limiting on all API endpoints (Postgres-backed, `rateLimit/postgresStore.ts`)
- [x] Input sanitisation (`escapeHtml`) + Payload hooks
- [x] Admin brute-force protection (account lockout: 5 attempts / 10-min lock, `collections/Users.ts`)
- [x] All secrets in env vars
- [ ] **Cloudflare WAF rules live** — configure on the Cloudflare dashboard (now possible); enable managed ruleset + rate-limit + bot rules
- [ ] Wire **Turnstile** on public forms (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is scaffolded but empty)
- [ ] Add `preload` to HSTS + submit to hstspreload.org **only after** confirming all subdomains are HTTPS
- [ ] (accepted debt) CSP still uses `script-src 'unsafe-inline'` — nonce strategy deferred to NE-028

### NE-042 · Cookie consent, GA4, Meta Pixel, analytics — 🟡 partial

- [x] Consent banner (`CookieConsent.tsx`), bilingual, links to Privacy Policy
- [x] GA4 + Meta Pixel load **only after consent** (`Analytics.tsx`, gated on `cookie_consent==='all'`)
- [x] CSP whitelists GA/GTM/Meta domains
- [ ] **Set `NEXT_PUBLIC_GA_ID` + `NEXT_PUBLIC_META_PIXEL_ID`** in prod (used in code but **missing from `.env.example`** — add them)
- [ ] ⚠️ Consent is **binary** (all / necessary-only) — plan AC wants granular **necessary/analytics/marketing**. Decide: accept binary or build category toggles.
- [ ] Verify **UTM parameter tracking** persists across CTAs/auth hand-off (plan AC) — currently unverified
- [ ] GA4 conversion funnels / events configured in the GA property

### NE-043 · Newsletter / email system — 🔴 needs rewire to Zoho

- [x] Subscription form + double opt-in + unsubscribe flow (endpoints + `NewsletterSubscribers`)
- [x] Welcome email sequence content (EN/AR)
- [ ] **Repoint `transport.ts`** to Zoho: `smtp.zoho.com` (region: `.eu`/`.in`), port 465 (SSL) or 587 (TLS), user = full mailbox, pass = **app-specific password**. Parameterize host/port/user/pass to env (`SMTP_HOST/PORT/USER/PASS`) instead of the hardcoded Resend host.
- [ ] **Rewrite all 6 sends in `resend.ts`** from Resend SDK → `emailTransport.sendMail()`
- [ ] Remove/replace `syncSubscriberToAudience` (Resend Audiences → Zoho Campaigns API or drop)
- [ ] Point `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL`, `PARTNERS_NOTIFY_EMAIL`, `WEBINAR_NOTIFY_EMAIL` at Zoho-hosted mailboxes
- [ ] Verify SPF / DKIM / DMARC DNS records for `newera365.com` in Zoho (deliverability)
- [ ] Set `SKIP_SMTP_VERIFY=true` on Railway if port 465 is blocked; smoke-test a real send

### NE-044 · SEO foundation — 🟢 done (verify in prod)

- [x] `sitemap.ts` (static + CMS-driven blog/guides/research) with **hreflang alternates**
- [x] `robots.ts` (allows `/`, disallows `/api/` + transactional landings, points to sitemap)
- [x] Per-page metadata + OG/Twitter (`generateMetadata`)
- [ ] **Set `NEXT_PUBLIC_SITE_URL=https://newera365.com`** (sitemap/robots fall back to localhost otherwise)
- [ ] Verify schema markup present: BrokerageOrganisation, FAQPage, HowTo, Article (plan AC)
- [ ] 301 redirect map — N/A for a brand-new domain; confirm with client there's no legacy site

### NE-045 · 🚦 GATE 3 — Staging UAT sign-off (end Wk 5–6)

- [ ] All page templates live on staging (`*.up.railway.app` / Cloudflare preview)
- [ ] MT5 spreads/swaps/specs rendering (live **or** documented fallback)
- [ ] All 5 calculators correct; Education Hub content live
- [ ] **EN/AR** routing + RTL correct (was "all 3 languages")
- [ ] Cloudflare WAF + CSP + rate limiting active on staging
- [ ] Cookie consent + newsletter (Zoho) tested end-to-end
- [ ] **Signed client UAT form** → unlocks DNS cutover

### NE-046 · W3C HTML5 + WCAG 2.1 AA audit — ⬜ not started (QA)

- [ ] 0 W3C errors across all pages
- [ ] Keyboard nav, screen reader (NVDA/VoiceOver), contrast ≥ 4.5:1, alt text, ARIA — incl. **RTL**

### NE-047 · Cross-browser & device testing — ⬜ not started (QA)

- [ ] Chrome / Firefox / Safari / Edge + iOS Safari/Chrome + Android Chrome; documented matrix; RTL on each

### NE-048 · Core Web Vitals — 🟡 at risk

- [ ] LCP < 2.5s · CLS < 0.1 · INP/FID < 100ms via PageSpeed + CrUX
- [ ] ⚠️ Memory note: **81/82 components are `'use client'`** — audit for unnecessary client components hurting LCP/TBT; convert static ones to Server Components
- [ ] next/image WebP/AVIF + lazy loading — on Workers, wire the `IMAGES` binding **or** a `/cdn-cgi/image/` custom loader (§6); Vercel's optimizer is gone

### NE-049 · Full SEO audit & submission — ⬜ pending NE-044

- [ ] Verify meta/schema/sitemap/hreflang in prod; **submit EN/AR sitemaps to Google Search Console**; robots verified; no crawl errors

### NE-050 · Pre-launch security review — ⬜ pending

- [ ] OWASP Top 10 checklist
- [ ] Cloudflare WAF blocks known attack patterns (tested)
- [ ] CSP header validation + rate limiting under load + admin login lockout confirmed
- [ ] **Dependabot/Snyk: 0 critical** — ⚠️ Payload v2 carries **known unfixable** advisories; document accepted risk (v3 migration is post-launch, see memory)
- [ ] No secrets in source (`git` scan)

### NE-051 · DNS cutover & zero-downtime go-live — ⬜ pending (§6 scaffolding first)

- [x] OpenNext build deploys clean (`wrangler deploy`) to https://newera365-web.newera365socials.workers.dev; smoke-tested 2026-07-16 (EN+AR, redirects, headers, /\_next/image all green)
- [ ] Custom domain `newera365.com` bound to the Worker (Workers Routes / custom domain)
- [ ] Cutover in low-traffic window; HTTPS/TLS verified on prod; Cloudflare cache purged
- [ ] **Retain staging for 2 weeks** (do not delete)
- [ ] Monitoring dashboards live (uptime + Web Vitals)

### NE-052 · 🚦 GATE 4 — Go-live checklist (end Wk 7–8)

- [ ] All NE-046 → NE-051 acceptance criteria met · IP transferred · go-live confirmation email sent
- [ ] **2-week post-launch support window** begins: bug fixes, CMS training, handover docs (runbook below), perf dashboards, GSC confirmation

---

## 3. Environment variable matrix (production values)

### `apps/web` (Cloudflare)

| Var                                               | Value                                 | Status                           |
| ------------------------------------------------- | ------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                            | `https://newera365.com`               | ⬜ set                           |
| `NEXT_PUBLIC_CMS_URL`                             | `https://cms.newera365.com` (Railway) | ⬜ **build fails if unset**      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                  | Cloudflare Turnstile                  | ⬜ set                           |
| `NEXT_PUBLIC_SALESIQ_WIDGET_CODE`                 | Zoho SalesIQ                          | ⬜ set                           |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | GA4 / Pixel                           | ⬜ **add to `.env.example` too** |

### `apps/cms` (Railway)

| Var                                                             | Value                                     | Status          |
| --------------------------------------------------------------- | ----------------------------------------- | --------------- |
| `PAYLOAD_SECRET`                                                | strong random                             | ⬜              |
| `PAYLOAD_PUBLIC_SERVER_URL`                                     | `https://cms.newera365.com`               | ⬜              |
| `DATABASE_URL`                                                  | Neon (pooled)                             | ⬜              |
| `FRONTEND_URL`                                                  | `https://newera365.com`                   | ⬜ required     |
| `SMTP_HOST/PORT/USER/PASS`                                      | **Zoho** (new — replace `RESEND_API_KEY`) | 🔴 code + value |
| `EMAIL_FROM` + `*_NOTIFY_EMAIL`                                 | Zoho mailboxes                            | ⬜              |
| `CONSENT_IP_SALT`                                               | `openssl rand -hex 16`                    | ⬜ required     |
| `HEALTH_CHECK_TOKEN`                                            | non-empty                                 | ⬜              |
| `MT5_SERVICE_URL` + `MT5_INTERNAL_API_TOKEN`                    | mt5-service URL + shared secret           | ⬜              |
| `R2_BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY/ENDPOINT/PUBLIC_URL` | Cloudflare R2                             | 🔴 wire plugin  |
| `SKIP_SMTP_VERIFY`                                              | `true` if Railway blocks 465              | ⬜              |

### `apps/mt5-service`

| Var                            | Value                       | Status                    |
| ------------------------------ | --------------------------- | ------------------------- |
| `MT5_HOST/PORT/LOGIN/PASSWORD` | client creds                | ⬜ set (client provided)  |
| `MT5_INTERNAL_API_TOKEN`       | match CMS                   | ⬜                        |
| —                              | **real Manager API client** | 🔴 unimplemented (NE-003) |

---

## 4. Launch runbook (NE-051)

**Pre-cutover**

- [ ] `npm run build` + `type-check` + `lint` green; **OpenNext build** (`opennextjs-cloudflare build`) clean; Gate 3 signed
- [ ] All env vars set in Cloudflare + Railway + mt5-service
- [ ] Zoho email smoke test (confirm, welcome, contact, partner, webinar) on staging
- [ ] DB migrations applied (`RUN_MIGRATIONS_ON_START=true` or manual); missing-columns script run
- [ ] R2 wired + a test upload survives a CMS redeploy
- [ ] Rollback plan written (below)

**Cutover**

- [ ] Point DNS (`newera365.com`, `cms.newera365.com`, `media.newera365.com`) at Cloudflare in low-traffic window
- [ ] Verify TLS + HSTS on prod; purge Cloudflare cache
- [ ] Smoke test: home, EN/AR routing, a CMS page, a form submit, MT5 (live or fallback), live chat

**Post-cutover (watch 15–30 min, then 48 h)**

- [ ] Error rate + latency nominal; `/api/health` 200 with token
- [ ] Submit EN/AR sitemaps to Google Search Console
- [ ] Stakeholder go-live email; keep staging 2 weeks

**Rollback triggers**

- 5xx rate > ~2% sustained, or `/api/health` failing
- CMS unreachable / DB connection errors (Neon pool capped at `max:5`)
- Forms or email silently failing
- → revert DNS to prior target (TTL low beforehand); Cloudflare "Pause" to bypass; redeploy last-good Railway image

---

## 6. Cloudflare frontend deployment (Option A — decided)

Cloudflare hosts the Next.js app directly (Vercel is not available). **Use the OpenNext
Cloudflare adapter targeting Workers** (`@opennextjs/cloudflare`), **not** `@cloudflare/next-on-pages`:
the OpenNext adapter runs the **Node.js runtime** (`nodejs_compat`), which our `next-intl`
middleware and `next.config.mjs` `headers()` require. `next-on-pages` forces the Edge runtime and
would break both.

**Scaffolding (one-time)**

- [x] `npm i -D @opennextjs/cloudflare wrangler` in `apps/web` (pinned `@opennextjs/cloudflare@1.15.1` — last version supporting Next 14; 1.16+ needs Next 15)
- [ ] Add `apps/web/wrangler.jsonc`:
  - `main: ".open-next/worker.js"`, `compatibility_date >= "2024-09-23"`
  - `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`
  - `assets: { directory: ".open-next/assets", binding: "ASSETS" }`
  - `images: { binding: "IMAGES" }` (enables image optimization — see NE-048)
  - optional `r2_buckets` binding `NEXT_INC_CACHE_R2_BUCKET` for ISR/incremental cache
- [x] Add `apps/web/open-next.config.ts` (KV incremental cache + memory queue; switch to R2 once enabled on the account)
- [x] Add scripts: `"preview": "opennextjs-cloudflare build && wrangler dev"`, `"deploy": "opennextjs-cloudflare build && wrangler deploy"`
- [ ] **Migrate the `headers()` from `next.config.mjs`** — confirm they emit on Workers; if not, set them on Cloudflare (Transform Rules) or in middleware. Then **delete `vercel.json` ×2** (dead config).
- [ ] Monorepo build runs from `apps/web` after `turbo` builds workspace deps; set Cloudflare **Workers Builds** root dir = `apps/web`, build = the `deploy`/`build:cf` script, or build in CI and `wrangler deploy --no-build`.

**App-specific gotchas**

- **Image optimization (NE-048):** `next/image` won't use Vercel's optimizer. Either use the
  Workers `IMAGES` binding (above) or a custom `image-loader.ts` hitting `/cdn-cgi/image/…`.
  Keep `remotePatterns` for `media.newera365.com` / `cms.newera365.com`.
- **Env vars:** `NEXT_PUBLIC_*` are build-time (set in the build env); server secrets go in
  `wrangler secret put` / Workers env. No `.env` at runtime on Workers.
- **Middleware:** `next-intl` middleware works under `nodejs_compat` — verify locale routing +
  RTL after first deploy.
- **CMS stays on Railway** — frontend only needs `NEXT_PUBLIC_CMS_URL`; no co-hosting concerns.

---

## 7. Pre-production gap review (2026-06-18) — beyond the tickets

Items not covered by NE-041→NE-051 but required (or risky) for go-live. 🔴 = launch-blocker.

**Compliance & legal (🔴 — biggest risk for a regulated CFD broker)**

- [ ] Client-approved **risk-disclosure / legal text + regulatory licence numbers** (NE-038) — cannot legally launch without
- [ ] **Restricted-jurisdiction handling** — geo-block unlicensed countries (Cloudflare geo rules); confirm list with client
- [ ] Risk-warning banner wired to the approved copy

**Observability (🔴 — currently zero)**

- [ ] **Error monitoring** — no Sentry/equivalent anywhere; add to web + CMS + mt5-service
- [ ] **Uptime monitoring** on `/api/health` + Web Vitals dashboard (NE-051 "monitoring dashboards live")

**MT5 integration path (🔴 — architectural unknown)**

- [ ] Confirm path: **MT5 Manager API is Windows-native** — a Linux Node service (Railway) can't load it directly → needs a Windows bridge or a broker REST gateway. Decide before committing; fallback = CMS manual data.

**Email deliverability (🔴)**

- [ ] **SPF + DKIM + DMARC** for `newera365.com` (Zoho) published in Cloudflare DNS; verify domain in Zoho

**Brand / SEO assets (🟠)**

- [ ] **No `og:image`** — social shares have no preview; add default OG image
- [ ] Confirm `favicon-light.png` / `favicon-dark.png` exist in `apps/web/public`

**Deploy pipeline (🟠)**

- [ ] **Retarget CI** (`.github/workflows/ci.yml`) — currently build-only, still references Resend; add `wrangler deploy` + Zoho/R2/MT5 secrets
- [ ] **Staging environment** (staging Worker + staging Railway CMS) — Gate 3 (NE-045) UAT needs one

**Security wiring for the new stack (🟠)**

- [ ] **CSP/CORS**: add Turnstile (`challenges.cloudflare.com`), R2 media domain, WhatsApp; point CMS `FRONTEND_URL` + CSP `connect-src` at the real Workers domain; drop Resend/SalesIQ entries
- [ ] **Turnstile** actually wired on forms (env scaffolded but empty)

**WhatsApp widget (🟠 — new build, replaces live chat)**

- [ ] WhatsApp Business number; floating RTL-aware button → `wa.me`; remove SalesIQ + decide fate of `/live-chat`

**Backups / DR (🟡)**

- [ ] Confirm Neon PITR retention + R2 versioning; document restore

**Content & perf (🟡)**

- [ ] Real blog/analysis/education content + gated ebook PDFs (vs seed); Arabic copy client-approved (no `__AR__` stubs remain — structurally complete)
- [ ] CWV: 81/82 components are `'use client'` — audit for Server Components (NE-048)
