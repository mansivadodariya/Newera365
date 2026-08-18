# Master Prompt — CMS Pages & Integration Audit (NewEra365)

> Paste this whole block as the first message of a fresh Claude Code session in
> `D:\NewEra365\newera365-app`. It is self-contained and assumes no prior context.

---

## ROLE

You are auditing the **entire CMS-managed surface** of the NewEra365 forex/CFD broker
site (ref `CSL-NE365-2026-Q2`). This is a pre-launch, no-room-for-error pass: every
field a content editor can touch must reach the right page, in both locales (English
LTR + Arabic RTL), with correct fallback behaviour when the CMS or MT5 bridge is down.
Treat every unverified assumption as a defect to be proven, not a fact to be trusted.

You are a **read-first auditor**. Do NOT change code until the audit report is
complete and I have approved a fix list. Produce findings, then wait.

## GROUND RULES

1. **graphify first.** `graphify-out/graph.json` exists. Before reading source, run
   `graphify query "<question>"`, `graphify explain "<concept>"`, or
   `graphify path "<A>" "<B>"` to scope. Read raw files only to confirm specific lines.
   Pass this same rule to any subagent you spawn.
2. **Evidence per claim.** Every finding cites `file:line`. No "looks fine" — show the
   field flowing from collection → fetch helper → component → rendered output, or show
   where it breaks.
3. **Both locales, always.** A page that works in `en` but not `ar` (missing RTL flip,
   `__AR__` stub leaking, untranslated label, broken `dir()`) is a defect.
4. **Fallback is a feature.** When CMS returns `[]` or MT5 is unreachable, the page must
   degrade gracefully (static notice, empty-state, never a crash or blank screen).
   `fetchCollection` swallows errors and returns empty docs — verify each consumer
   handles the empty case.
5. **Severity tag every finding:** `P0` (data loss / crash / wrong-locale content shipped),
   `P1` (field not rendered / fallback missing / broken link), `P2` (cosmetic / a11y /
   perf), `P3` (nice-to-have).

## SYSTEM MAP (verify, don't trust)

- **Web** `apps/web` — Next.js 14 App Router, routes under `src/app/[locale]/`
  (`en`|`ar`), next-intl v3. Pages are thin wrappers; UI lives in `packages/ui`.
- **CMS** `apps/cms` — Payload v2 on Express (port 3001), Postgres/Neon. Collections in
  `src/collections/`, `SiteSettings` global in `src/globals/`, custom REST in
  `src/endpoints/index.ts`. Native Payload localization (`locale=en|ar`, `fallback:true`).
- **Integration layer** — `apps/web/src/lib/cms.ts` is the single bridge. All web→CMS
  reads go through `fetchCollection` / `fetchGlobal` / `fetchBySlug` (60s/300s
  `revalidate`, `NEXT_PUBLIC_CMS_URL`, default `http://localhost:3001`).
- **MT5** `apps/mt5-service` (port 4000) — mock bridge; CMS proxies and falls back to
  manual CMS instrument data when down. Dual toggle: `mt5SyncEnabled` global +
  per-instrument `usesMT5Data`.

## STEP 1 — Build the collection ↔ fetcher ↔ page matrix

For **every** exported fetch function in `apps/web/src/lib/cms.ts`, produce a row:

| Fetch fn | Collection slug | Consuming route(s) | UI component | Locale-aware? | Status filter | Sort | Empty-state handling |

Cover at minimum these fetchers/collections (confirm none are missing):
`getLatestNews`(news), `getInstruments`(products-instruments), `getAccountTypes`(account-types),
`getResearchArticles`/`getMarketAnalysisBySlug`(market-analysis), `getBlogPosts`/`getBlogPostBySlug`(blog-posts),
`getResearchReports`(research-reports), `getEducationContent`/`getGlossaryTerms`/`getGuides`/`getGuideBySlug`(education-content),
`getFaqs`(faqs), `getLegalPages`(legal-pages), `getCareers`(careers), `getTeamMembers`(team-members),
`getAwards`(awards), `getWebinars`(webinars), `getPaymentMethods`(payment-methods),
`getIBContent`(ib-content), `getPromotions`(promotions), `getMediaPressItems`(media-press),
`getAnalystCalls`(analyst-calls), `getSiteSettings`(site-settings global).

The 34 CMS-consuming routes are (confirm the list is current):
`markets/[category]`, `trade/{ib,accounts,fees,funding,promotions}`, `tools/{profit,spread-comparator,page}`,
`education/{audio,webinars,media,page}`, `research/{analyst-chart,[slug],page}`, `guides/{[slug],page}`,
`blog/{[slug],page}`, `glossary`, `company/{media-press,awards,about,careers}`, `legal`, `faqs`, `ebooks`,
`daily-news`, `contact`, `platform/[slug]`, `[locale]/page` (home), `[locale]/layout` (nav/footer/risk banner),
`sitemap.ts`.

## STEP 2 — Field-completeness audit (per collection)

For each collection, diff three things and report every gap:

1. Fields **defined** in `apps/cms/src/collections/*.ts`.
2. Fields **typed** in the `Cms*` interfaces in `cms.ts`.
3. Fields **actually rendered** by the consuming component in `packages/ui`.

Flag: (a) defined-but-never-rendered fields (dead content the editor will fill in vain);
(b) rendered-but-not-typed fields (silent `any`/drift); (c) `localized: true` mismatches —
a field localized in the collection but fetched without a `locale` param, or vice-versa;
(d) `seoFields` (`seoTitle`/`seoDescription`) defined but not wired into the route's
`generateMetadata`.

## STEP 3 — Localization correctness

- Confirm each locale-aware fetcher passes `locale` through to `fetchCollection`.
  Note known intentional exceptions and verify they're still intended:
  `getAccountTypes` carries `nameAr`/`featuresAr` sibling fields; `getAnalystCalls`
  takes no locale (analyst-calls global content).
- For each rendered string, confirm Arabic is real copy, not an `__AR__` stub. Run the
  i18n gate: `npm run lint` (runs `scripts/check-i18n.js`) and report failures.
- For each page, confirm full RTL flip (layout mirror, not just `dir="rtl"`), using
  `dir()`/`isRtl()` from `@newera365/types`.
- Check `SiteSettings` bilingual pairs (`*En`/`*Ar`: kpiStats, nav, footer, riskBanner,
  analystCommentary, contactAddress, supportHours) — verify the layout picks the right
  side per locale.

## STEP 4 — Fallback & failure modes

- `fetchCollection` returns empty docs on any non-200/throw. For each consumer, prove the
  empty array renders a sensible state (not a crash, not an infinite skeleton).
- MT5: trace `mt5SyncEnabled` + per-instrument `usesMT5Data` through the CMS endpoint and
  into `markets/[category]` / instrument tables. Confirm the `MT5Response<T>` "static-data
  notice" surfaces when `usesMT5Data:false` or `source:'cms-fallback'`.
- `fetchBySlug` returns `null` on miss — confirm `[slug]` detail routes (blog, research,
  guides) render `notFound()`/static fallback, not a null-deref.
- Media: `featuredImage`/`thumbnail`/`reportFile` resolve at `depth=1` to `CmsMedia` OR
  stay a numeric id. Confirm every consumer guards `typeof img !== 'number'` before
  reading `.url` (the `getBlogPosts` mapper is the reference pattern).

## STEP 5 — Known drift to investigate (do not assume resolved)

- **Collection count drift:** CLAUDE.md claims "17 collections" but `cms.ts` references
  ~20 slugs (incl. awards, payment-methods, ib-content, promotions, media-press,
  analyst-calls). Reconcile `cms.ts` slugs against actual files in
  `apps/cms/src/collections/` — flag any fetched slug with no collection, or any
  collection with no reader.
- **Deleted instruments route:** `markets/instruments/page.tsx` was deleted (git status),
  yet CLAUDE.md still documents `InstrumentsPage` at `/markets/instruments`. Confirm no
  nav link, sitemap entry, or internal `<Link>` still points there (dead route → 404).
- **Custom endpoints** in `apps/cms/src/endpoints/index.ts` (newsletter confirm/unsubscribe,
  education gate, contact, partners/apply, webinars/register, mt5/instruments, health):
  confirm each web form posts to the right path with the right shape, handles rate-limit
  429s, and shows success/error UI in both locales.

## STEP 6 — Build & type integrity

Run and report (don't fix yet):

- `npm run type-check` — note: after `generate:types` the generator strips a required
  `@ts-ignore` in `apps/cms/src/payload-types.ts`; if type-check fails there, that's the
  cause, flag it.
- `npm run lint` (includes i18n check).
- `npm run build` if time permits, or at least confirm no route imports a deleted module.

## STEP 7 — Live verification (preview tools)

Start the dev server (`preview_start`) and for a representative page per collection type
(home, markets category, a blog detail, research listing, fees, IB, legal, faqs,
careers, contact form): load `en` and `ar`, capture `preview_console_logs` +
`preview_network` for `[cms]` fetch errors, `preview_snapshot` for content presence,
and `preview_screenshot` for the RTL flip. Test the contact + newsletter forms
end-to-end against the CMS endpoints. Never ask me to check manually — verify and attach
proof.

## DELIVERABLE

A single report with:

1. The Step-1 matrix (collection ↔ fetcher ↔ page).
2. A findings table: `Severity | Area | file:line | What's wrong | Evidence | Suggested fix`.
3. A "verified correct" list (so I know what was actually checked, not skipped).
4. A prioritized fix plan (P0→P3) — but make NO code changes until I approve it.

Begin with Step 1. Work methodically; if the audit is large, spawn read-only `Explore`
subagents per area (each told to use graphify first) and consolidate their findings.
