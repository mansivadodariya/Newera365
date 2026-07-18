# Graph Report - web  (2026-07-16)

## Corpus Check
- 66 files · ~298,598 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 351 nodes · 481 edges · 33 communities (31 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb3bf83f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)
1. `getSiteSettings()` - 18 edges
2. `getInstruments()` - 11 edges
3. `slugToTitle()` - 9 edges
4. `getEducationContent()` - 9 edges
5. `scripts` - 8 edges
6. `getResearchArticles()` - 8 edges
7. `getBlogPosts()` - 8 edges
8. `getGuides()` - 8 edges
9. `compilerOptions` - 8 edges
10. `CmsMedia` - 7 edges

## Surprising Connections (you probably didn't know these)
- `generateStaticParams()` --calls--> `getNews()`  [INFERRED]
  src/app/[locale]/daily-news/[slug]/page.tsx → src/lib/cms.ts
- `generateStaticParams()` --calls--> `getBlogPosts()`  [INFERRED]
  src/app/[locale]/education/blog/[slug]/page.tsx → src/lib/cms.ts
- `generateStaticParams()` --calls--> `getGuides()`  [INFERRED]
  src/app/[locale]/guides/[slug]/page.tsx → src/lib/cms.ts
- `GuideDetailRoute()` --calls--> `getGuideBySlug()`  [INFERRED]
  src/app/[locale]/guides/[slug]/page.tsx → src/lib/cms.ts
- `HomePage()` --calls--> `getSiteSettings()`  [EXTRACTED]
  src/app/[locale]/page.tsx → src/lib/cms.ts

## Import Cycles
- None detected.

## Communities (33 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (34): AboutRoute(), metadata, AccountsRoute(), CareersRoute(), metadata, IBRoute(), CmsAccountType, CmsAnalystCall (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (35): BASE, entry(), sitemap(), STATIC_PATHS, GuidesRoute(), metadata, CmsResearchReport, fetchBySlug() (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (15): EbooksRoute(), metadata, EducationRoute(), metadata, GlossaryRoute(), metadata, CmsEducationContent, CmsMedia (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (16): Analytics(), CookieConsent(), PageFade(), RouteChrome(), { Link, redirect, usePathname, useRouter, getPathname }, routing, BASE, cairo (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (23): dependencies, @flaticon/flaticon-uicons, @newera365/types, @newera365/ui, next, next-intl, next-themes, react (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (11): Category, CATEGORY_META, MarketCategoryRoute(), Props, VALID_CATEGORIES, FeesRoute(), CmsInstrument, getInstruments() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (15): AnalystChartRoute(), FundingRoute(), metadata, CmsFaq, CmsPaymentMethod, fetchGlobal(), getAnalystCalls(), getFaqs() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, eslint, eslint-config-next, gsap, @newera365/config, postcss, rimraf (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): compilerOptions, allowJs, incremental, jsx, lib, noEmit, paths, plugins (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (13): d, __dirname, height, landNoAntarctica, MARKETS, outPath, path, points (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (10): ar, arFlat, arKeys, en, enFlat, enKeys, errors, fs (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (17): AMAX, GAMMA, GREEN_L, hsl2rgb(), hue2rgb(), IMAGES, K, LMIN (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (5): LegalRoute(), metadata, Props, CmsLegalPage, getLegalPages()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (9): buildSvg(), candles, KEYS, path, prevClose, rand, sharp, THEMES (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.50
Nodes (3): Captured (real brand marks, sourced from each brand's official favicon), Partner logos, Still name-only (want a proper logo)

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, installCommand, outputDirectory

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): cmsUrl, nextConfig, withNextIntl

## Knowledge Gaps
- **144 isolated node(s):** `withNextIntl`, `cmsUrl`, `nextConfig`, `name`, `version` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSiteSettings()` connect `Community 6` to `Community 0`, `Community 2`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `getInstruments()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `slugToTitle()` (e.g. with `generateMetadata()` and `generateMetadata()`) actually correct?**
  _`slugToTitle()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `withNextIntl`, `cmsUrl`, `nextConfig` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0797979797979798 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._