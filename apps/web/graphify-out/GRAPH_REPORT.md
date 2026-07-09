# Graph Report - web  (2026-07-08)

## Corpus Check
- 71 files · ~155,128 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 359 nodes · 490 edges · 37 communities (35 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `005104ec`
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
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)
1. `getSiteSettings()` - 14 edges
2. `getInstruments()` - 11 edges
3. `getEducationContent()` - 11 edges
4. `slugToTitle()` - 9 edges
5. `scripts` - 8 edges
6. `CmsMedia` - 8 edges
7. `getResearchArticles()` - 8 edges
8. `getBlogPosts()` - 8 edges
9. `getGuides()` - 8 edges
10. `compilerOptions` - 8 edges

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

## Communities (37 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): AccountsRoute(), CareersRoute(), metadata, IBRoute(), LegalRoute(), metadata, Props, CmsAccountType (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): BASE, entry(), sitemap(), STATIC_PATHS, BlogRoute(), DailyNewsRoute(), GuidesRoute(), metadata (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (15): AudioRoute(), metadata, EbooksRoute(), metadata, EducationRoute(), metadata, GlossaryRoute(), metadata (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (19): Analytics(), CookieConsent(), PageFade(), RouteChrome(), FundingRoute(), metadata, { Link, redirect, usePathname, useRouter, getPathname }, routing (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (12): dependencies, @flaticon/flaticon-uicons, @newera365/types, @newera365/ui, next, next-intl, next-themes, react (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (11): Category, CATEGORY_META, MarketCategoryRoute(), Props, VALID_CATEGORIES, FeesRoute(), CmsInstrument, getInstruments() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (10): AnalystChartRoute(), ContactRoute(), metadata, fetchGlobal(), getAnalystCalls(), getSiteSettings(), PlatformRoute(), PlatformSlug (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (26): devDependencies, autoprefixer, eslint, eslint-config-next, gsap, @newera365/config, postcss, rimraf (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): compilerOptions, allowJs, incremental, jsx, lib, noEmit, paths, plugins (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (12): AboutRoute(), mapTeamMember(), metadata, resolveUrl(), AwardsRoute(), metadata, CmsAward, CmsMilestone (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (10): ar, arFlat, arKeys, en, enFlat, enKeys, errors, fs (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (14): AMAX, GAMMA, hsl2rgb(), hue2rgb(), IMAGES, K, LMIN, LSPAN (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.23
Nodes (9): CmsResearchReport, getMarketAnalysisBySlug(), getResearchArticles(), getResearchReports(), ResearchRoute(), ResearchDetailRoute(), generateMetadata(), generateStaticParams() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (9): buildSvg(), candles, KEYS, path, prevClose, rand, sharp, THEMES (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): FaqsRoute(), metadata, Props, CmsFaq, getFaqs()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, installCommand, outputDirectory

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): cmsUrl, nextConfig, withNextIntl

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (4): CmsMediaPressItem, getMediaPressItems(), MediaPressRoute(), metadata

## Knowledge Gaps
- **132 isolated node(s):** `withNextIntl`, `cmsUrl`, `nextConfig`, `name`, `version` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSiteSettings()` connect `Community 6` to `Community 0`, `Community 2`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `getInstruments()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `withNextIntl`, `cmsUrl`, `nextConfig` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05697278911564626 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09047619047619047 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._