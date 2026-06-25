# NewEra365 site audit — loop state

Self-paced `/loop` audit of the whole stack: frontend (`apps/web`) + CMS backend
(`apps/cms`) + the integration seam (web reads Payload REST API per locale).

**Loop guardrails:** fix root causes with the smallest code change; rerun
`type-check` / `lint` / `build` after each fix; **ask before editing live CMS
records or deleting content**; stop when all pass, progress stalls for two
rounds, or an action needs approval.

## Per-item checklist (apply to every route × {en, ar})

1. Renders, no console errors.
2. Shows real CMS data, not fallback / hardcoded copy.
3. Every published CMS document surfaces somewhere on the frontend (parity).
4. Field values correct: dates real & plausible; no `__AR__`/lorem/placeholder;
   images resolve; `ar` differs from `en` where it should.
5. RTL flips correctly in `ar`.

## Audit surface

**Routes (43 page files):** ai-crm, blog, blog/[slug], company/{about,awards,careers,media-press},
contact, daily-news, ebooks, education/{audio,media,webinars,index}, faqs, glossary,
guides, guides/[slug], landing-demo, legal, live-chat, markets/[category], newsletter
(+confirmed/unsubscribed), home, platform/[slug], research, research/[slug],
research/analyst-chart, tools/{calendar,fibonacci,pivot,profit,spread-comparator,watchlist,ai-crm,index},
trade/{accounts,fees,funding,ib,promotions}.

**Collections (24 + SiteSettings global):** AccountTypes, AnalystCalls, Awards, BlogPosts,
Careers, CompanyMilestones, ContactSubmissions, EducationContent, FAQs, IBContent,
LegalPages, MarketAnalysis, Media, MediaPress, News, NewsletterSubscribers, PaymentMethods,
ProductsInstruments, Promotions, ResearchReports, TeamMembers, Users, WebinarRegistrations, Webinars.

## Findings log

### F1 — Blog/analysis "random date" — FIXED (iteration 1) ✅

**Reported by user.** Root cause chain:

- `apps/cms/src/collections/BlogPosts.ts` — `publishedDate` was optional with no default → admin-authored posts stored `null`.
- `apps/web/src/lib/cms.ts:655` — `publishedDate: post.publishedDate ?? new Date().toISOString()` substituted **current render time** for null dates → unstable / "random".
- `packages/ui/src/components/ResearchPage.tsx:65` — `formatArticleDate` had no invalid-date guard (`new Date(null)` → Unix epoch).

**Fix:** (1) added `defaultValue: () => new Date().toISOString()` to the collection field;
(2) frontend fallback now `?? post.createdAt ?? ''` (stable, added `createdAt` to `CmsBlogPost`);
(3) `formatArticleDate` guards empty/`NaN` dates.
**Evidence:** `type-check` 7/7 ✅, `lint` ✅ (ESLint clean + i18n en/ar match, no `__AR__`), `build` 4/4 ✅.
**Bug-class isolation (iter 3):** swept all date collections — BlogPosts was the ONLY one with
`publishedDate` _not required AND no default_; News/MarketAnalysis/ResearchReports are `required`
(can't be null), Careers has required+default. So F1 was the unique instance. Closed.
**Note:** existing live rows with `null publishedDate` now display `createdAt` (stable). Backfilling
real editorial dates into those rows is a **live-data mutation → needs approval** before doing it.
**CORRECTION (iter 5):** verified via CMS API — NO live blog post currently has a null date, so the
`new Date()` fallback is NOT currently firing. The today/tomorrow dates the user saw are the STORED
dates of the junk posts (see F5), shown correctly. F1's 3 code changes are retained as valid
_defensive_ hardening (prevent future null/unstable dates) but were not the cause of the observed
"random date" — F5 is.

### F2 — CMS→frontend parity (wiring level) — CLEAN (iteration 2) ✅

Counted slug references in `apps/web/src` for all 24 collections + SiteSettings.
All 19 content collections have ≥1 frontend consumer. Zero-ref collections are
write-only/admin/asset by design: `contact-submissions`, `newsletter-subscribers`,
`webinar-registrations`, `users` (admin/forms), `media` (consumed via upload relations).
**Caveat (needs running stack):** wiring ≠ every _document_ showing. Still to verify at
runtime: query `limit`s that could truncate (blog 10, research 20, news), `where` filters,
and silent fetch fallbacks. Tracked below.

### F3 — Build-time CMS fetch failure → silent empty pages — NOT A BUG (iter 3) ℹ️

Build log showed `[cms] Failed to fetch … ECONNREFUSED` for blog-posts/news/faqs/etc. — only
because no CMS ran during the local build. `fetchCollection` has an 8s timeout, catches errors,
and returns `{ docs: [], … }`; pages use ISR `next: { revalidate: 60 }` (globals 300s), so they
self-heal within 60s of first traffic once the CMS is reachable. No fix. **Optional hardening
(deferred, product call):** fail the production build loudly if CMS is unreachable, so an empty
deploy can't ship silently.

## Live deployment (user-provided)

- Frontend: https://newera365-app.vercel.app (locale-prefixed, `/en` `/ar`)
- CMS admin: https://cms-production-580a.up.railway.app/admin (media served from `/media/...`)
- NOTE: `newera365.com` is a SEPARATE legacy WordPress site, NOT this app.

### F4 — Live site audit — MOSTLY HEALTHY (iter 4) ✅

- **Route status:** all 42 static routes × {en, ar} → HTTP 200. No 404/500.
- **F1 confirmed live:** /en/blog renders Jun 21 (today, ×2) and Jun 22 (tomorrow, ×1) among
  seeded past dates → the `?? new Date()` null-date fallback firing. Validates user report.
  Remedy = F1 fix (applied in working tree, **NOT yet deployed**).
- **CMS images:** 14/14 cleanly-parsed Railway `/media` images → 200 (ephemeral-FS loss not
  currently manifesting). 1 ref `COURTSIDE PADEL_CREAM.png` had a space → spot-check (filename
  spaces are a hygiene smell); not found on /company/about, likely /company/awards.
- **Arabic + RTL:** /ar home, blog, about, faqs each have 26k+ Arabic codepoints and `dir="rtl"`.

### F5 — Junk test blog posts on PRODUCTION — NEEDS APPROVAL to fix (iter 5) ⚠️

CMS API source of truth: 13 published blog posts; 11 legit, **2 junk**:

- `wagwan` — title "wagwan" — date 2026-06-21 (today)
- `eee` — title "hey whats up" — date **2026-06-22 (FUTURE/invalid)**
  These are the real cause of the user-reported "random date" and are live, user-visible test content.
  **Dynamic-route crawl (iter 5):** blog/research/guides/platform [slug] pages all 200, h1 present,
  en/ar lengths differ (real localized content). platform = mt5 + webtrader only (mobile removed ✓).
  **CMS-wide data-quality scan (iter 5):** all 18 readable collections clean except blog F5.
  False positives dismissed: education "Pip" (forex term), milestone "New era" (real label).
  **Remediation = live-CMS-data mutation → BLOCKED on user approval.** Options: unpublish (status→draft,
  reversible) or delete `wagwan`+`eee`; at minimum fix `eee` future date. Likely needs admin UI or CMS
  credentials (Payload write API requires auth; I have none).

### F6 — More junk test data: FAQs — user deleting (iter 5) ⚠️

Deeper AR==EN check surfaced 2 junk FAQ entries the title-scan missed:

- faqs id=276 "seknlern"; id=275 "demo ques". Test content live on /faqs.
  COURTSIDE media ref: CLEARED (regex artifact, no real broken image).

### F7 — AR≠EN short-field leaks (known, deferred) ℹ️

Short value fields not translated to Arabic (AR==EN):

- `account-types.name` 4/4 (Professional, Swap-Free…); `payment-methods.name` 6/6 (Local bank transfer…).
- NOT a leak: `products-instruments.name` 20/20 identical is CORRECT (instrument names are universal).
  This is the previously-scoped re-localization work (invasive: per-field localization + reseed) — a
  dedicated task, not a loop fix. promotions.title / webinars.title properly translated ✓.

## COMPLETE JUNK INVENTORY (user deleting in admin UI)

- blog-posts id=131 `wagwan`, id=130 `eee` ("hey whats up", future-dated) — ✅ DELETED (verified, blog=11)
- faqs id=276 "seknlern", id=275 "demo ques" — ⚠️ STILL LIVE (verified via CMS API) — needs admin deletion
  False positives excluded: education "Pip/Spread/Margin/Leverage/Stop Loss", promo "Welcome Boost".

## ✅ AUDIT COMPLETE — loop concluded (iter 5)

Decisions: user deletes the 4 junk records in admin UI; F1 fix left in working tree (undeployed).
No autonomous work remains — outstanding items are user-actions (delete junk) or a separate scoped
project (F7 re-localization). Loop stopped (no further wakeup). Re-run `/loop` to re-verify after
junk deletion + F1 deploy.

### Final scorecard

- Code: type-check 7/7 ✅, lint ✅ (i18n en/ar match), build ✅
- CMS→frontend wiring parity: ✅ all content collections consumed
- Live routes: 42 × {en,ar} → 200 ✅; dynamic [slug] pages real localized content ✅
- CMS images (Railway /media): resolve ✅
- Arabic + RTL: rendering ✅
- Data quality: 4 junk records (F5/F6) → user deleting; AR short-field leaks (F7) → deferred project
- F1 blog-date hardening: fixed in working tree (defensive), undeployed

## Remaining queue (next iterations)

- [~] Run `lint` (incl. check-i18n) + `build` as full gate for F1 — running in bg (.audit/lint.log, .audit/build.log).
- [ ] Runtime parity: confirm no collection's published docs are hidden by `limit`/`where`/fallback (needs dev stack).
- [ ] Sweep other date-bearing collections for the same `?? new Date()` pattern (News, MarketAnalysis, ResearchReports, Careers).
- [ ] CMS→frontend parity: confirm every collection has a frontend consumer (start: AnalystCalls, CompanyMilestones, MediaPress, Awards, TeamMembers).
- [ ] Per-route render + data check (needs dev stack: web :3000 + cms :3001).
- [ ] `ar` vs `en` leak check (short value fields known to leak per prior audits).
- [ ] RTL flip spot-check on directional components.

## Iteration history

- **Iter 1 (2026-06-21):** Enumerated surface; root-caused & fixed F1 (blog date); type-check green.
