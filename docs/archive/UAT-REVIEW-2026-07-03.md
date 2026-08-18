# NewEra365 — Pre-Production UAT Review

**Date:** 2026-07-03
**Reviewer:** Client-style full walkthrough (web + CMS)
**Environment:** Local production build (`next start`) on port 3000, CMS (`ts-node src/server.ts`) on port 3001 against the **live Neon production database**, MT5 mock on 4000.
**Scope:** All 150 routes (73 EN + 73 AR + extras), both themes, desktop + mobile, all public forms, CMS admin, custom REST endpoints, SEO metadata, media integrity.

---

## Verdict

The site is in **good shape for launch** — content, layout, bilingual copy, forms, and CMS wiring are all working. **One CRITICAL security item must be fixed before go-live**, plus a handful of SEO/polish items that are safe to launch with but should be scheduled.

- **150/150 pages return HTTP 200** — zero broken routes.
- **Zero broken images** across every page (checked live DOM + raw HTML).
- **Zero content leaks** — no `TEST`, `lorem ipsum`, `__AR__`, `undefined`, or `NaN` anywhere.
- **Forms verified end-to-end** — contact → CMS record, newsletter → pending subscriber + confirmation flow, rate limiting active.

---

## 🔴 CRITICAL — must fix before production

### C1. Default admin credentials are live on the production database

- **What:** Logged into the CMS admin at `/admin` on the **live Neon prod DB** using `admin@newera365.com` / `Admin123!`.
- **Why it's critical:** These exact credentials are committed in `apps/cms/src/scripts/seed.ts` and `seed-ib-only.ts`. Anyone with repo access (or who guesses a common default) has full admin control of the production CMS — all content, all submissions, all subscriber PII.
- **Compounding factor:** Admin login lockout / `maxLoginAttempts` is disabled (see `code-review/01-cms-api-security.md`), so there's no brute-force throttle either.
- **Fix before launch:**
  1. Change the production admin password to a strong, unique value (and ideally rename the admin email).
  2. Remove the hardcoded `password: 'Admin123!'` fallback from `seed.ts` / `seed-ib-only.ts` (the newer `ensure-admin.ts` already requires `SEED_ADMIN_PASS` — make all seed scripts follow that pattern).
  3. Rotate anyway on the assumption the old password is compromised.

---

## 🟠 HIGH — verify before production

### H1. `PAYLOAD_SECRET` is the placeholder value

- **What:** CMS boots with `⚠️ PAYLOAD_SECRET is still the placeholder value "change-me-in-production"`. Admin JWTs are signed with a publicly-known string → session tokens can be forged.
- **Note:** This is the local `.env`. **Action: confirm the Railway production env has a real `PAYLOAD_SECRET`** (`openssl rand -hex 32`). Per `CLAUDE.md` this errors in prod, so it may already be set on Railway — but it must be verified, and once rotated, all existing admin sessions should be invalidated.

---

## 🟡 MEDIUM — schedule, safe to launch with

### M1. Arabic pages serve English SEO metadata

- **What:** ~12 static Arabic marketing/listing pages render **English `<title>`** tags, e.g.:
  - `/ar/trade/funding` → `Funding & Withdrawals`
  - `/ar/education` → `Education Hub`
  - `/ar/glossary` → `Trading Glossary`
  - `/ar/company/about` → `About Us`
  - `/ar/contact` → `Contact Us`
  - `/ar/legal` → `Legal Documents`
  - also: `/ar/trade/promotions`, `/ar/education/media`, `/ar/ebooks`, `/ar/guides`, `/ar/company/awards`, `/ar/company/media-press`
- Additionally **16 AR pages have English `<meta name="description">`**.
- **Important:** The **on-page content (H1, body) is correctly Arabic** — this is only the `<head>` metadata. CMS-driven detail pages (blog/research/guide articles) _do_ localize their titles correctly; the gap is in the static routes' `generateMetadata` using hardcoded English strings for both locales.
- **Impact:** Weakens Arabic-language SEO / social sharing. No user-visible page defect.

### M2. Soft-404s return HTTP 200

- **What:** Non-existent slugs under `/education/blog`, `/research`, `/daily-news`, `/guides`, `/markets`, `/platform` render a "not found" UI but with **HTTP 200**, not 404. Only a fully unrouted path (`/en/totally-bogus-page`) returns a true 404.
- **Mitigated by:** These pages correctly emit `noindex`, so search engines won't index them.
- **Impact:** Low — cosmetic for crawlers/uptime monitors. A true `notFound()` status on missing CMS docs would be cleaner but is a known ISR tradeoff.

---

## 🟢 LOW — housekeeping / polish

### L1. Homepage + tools cluster share the generic default `<title>`

- Pages using the fallback `NewEra365 — Forex & CFD Trading` instead of a page-specific title:
  `/tools`, `/tools/calendar`, `/tools/fibonacci`, `/tools/pivot`, `/tools/profit`, `/tools/watchlist`, `/tools/spread-comparator`, `/platform/mt5`, `/platform/webtrader`, `/research/analyst-chart`, `/live-chat`. (Homepage `/en` using the brand title is fine.)
- **Impact:** Minor SEO — these utility pages have no unique title/description. Content/company/markets pages all have proper titles.

### L2. Two orphan media files 404 in the library

- `newera dark theme logo-1.jpg` (id 551) and `COURTSIDE PADEL_CREAM.png` (id 548) return 404 — DB rows exist but the files are missing from the media dir.
- **Not referenced by any collection and not shown anywhere on the site** — leftover manual test uploads. Delete the two rows in the CMS media library. Zero user-facing impact.

---

## ✅ Verified working (no action)

| Area              | Result                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Routing           | 150/150 pages HTTP 200; `/`→`/en`, legacy `/blog`, `/markets/instruments`, `/platform/mobile`, `/tools/ai-crm` all redirect correctly |
| Images            | 0 broken across all pages; press logos, market tiles, payment logos, article/blog covers all load                                     |
| Bilingual content | Full EN + AR body/H1 translation on every page; RTL layout correct on `/ar`                                                           |
| Theme             | Dark/light toggle works and persists (localStorage); no blank-on-load                                                                 |
| Mobile (375px)    | No horizontal overflow on any route; hamburger accordion menu works; wide tables scroll within their container                        |
| Contact form      | Submits → creates `contact-submissions` record in CMS; success state shown ("Message received")                                       |
| Newsletter        | Subscribe → `pending` subscriber row + confirmation-email path (jsonTransport in dev)                                                 |
| Rate limiting     | Contact endpoint returns 429 on 4th request/min as designed                                                                           |
| Custom endpoints  | `/api/health` 401 without token / 200 with; `/api/mt5/instruments` 200 (cms-fallback, 31 instruments)                                 |
| CMS admin         | Login works; all 24 collections + Site Settings global render across 6 nav groups                                                     |
| CMS collections   | All 20 public collections return 200 with real data; 4 admin-only collections correctly 403                                           |
| MT5 data notice   | Markets & Watchlist correctly show "Indicative prices — not for trading" (bridge in fallback, as expected pre-integration)            |
| Calculators       | Profit/margin/pip tools compute reactively; no NaN/hydration errors                                                                   |

### Checked and NOT a problem

- **AR payment method / instrument names in Latin script** (Skrill, Neteller, ETF names, GMT trading hours) — these are correctly brand/proper names; the localized `nameAr` fields hold proper Arabic. Not a translation bug.
- **`/ar/newsletter` had a momentary empty title** during a stale-ISR window — self-healed on revalidation (title + H1 render correctly). Confirmed transient, not a defect.

---

## Pre-launch checklist (actionable)

- [ ] **C1** — Rotate production CMS admin password; remove `Admin123!` fallback from `seed.ts` / `seed-ib-only.ts`.
- [ ] **H1** — Confirm Railway prod `PAYLOAD_SECRET` is a real 32-byte secret (not the placeholder).
- [ ] **M1** — Localize `generateMetadata` titles/descriptions for the ~12 static AR pages (schedule; not a launch blocker).
- [ ] **M2 / L1 / L2** — Backlog: true 404 status on missing docs, per-page titles for tools cluster, delete 2 orphan media rows.
