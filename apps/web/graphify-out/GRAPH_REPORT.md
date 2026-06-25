# Graph Report - web (2026-06-19)

## Corpus Check

- 111 files · ~79,168 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 414 nodes · 487 edges · 78 communities (76 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `babbdda1`
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)

1. `getSiteSettings()` - 14 edges
2. `getInstruments()` - 11 edges
3. `getEducationContent()` - 11 edges
4. `scripts` - 8 edges
5. `CmsMedia` - 8 edges
6. `getGuides()` - 8 edges
7. `compilerOptions` - 8 edges
8. `CmsEducationContent` - 7 edges
9. `slugToTitle()` - 7 edges
10. `getResearchArticles()` - 7 edges

## Surprising Connections (you probably didn't know these)

- `generateStaticParams()` --calls--> `getBlogPosts()` [INFERRED]
  src/app/[locale]/blog/[slug]/page.tsx → src/lib/cms.ts
- `BlogDetailRoute()` --calls--> `getBlogPostBySlug()` [INFERRED]
  src/app/[locale]/blog/[slug]/page.tsx → src/lib/cms.ts
- `generateStaticParams()` --calls--> `getGuides()` [INFERRED]
  src/app/[locale]/guides/[slug]/page.tsx → src/lib/cms.ts
- `GuideDetailRoute()` --calls--> `getGuideBySlug()` [INFERRED]
  src/app/[locale]/guides/[slug]/page.tsx → src/lib/cms.ts
- `PlatformRoute()` --calls--> `getSiteSettings()` [INFERRED]
  src/app/[locale]/platform/[slug]/page.tsx → src/lib/cms.ts

## Import Cycles

- None detected.

## Communities (78 total, 2 thin omitted)

### Community 0 - "Community 0"

Cohesion: 0.05
Nodes (36): AccountsRoute(), CareersRoute(), metadata, metadata, NEWS_CAT_TO_ASSET, FaqsRoute(), metadata, Props (+28 more)

### Community 1 - "Community 1"

Cohesion: 0.10
Nodes (25): BASE, entry(), sitemap(), STATIC_PATHS, BlogRoute(), GuidesRoute(), metadata, fetchBySlug() (+17 more)

### Community 2 - "Community 2"

Cohesion: 0.09
Nodes (19): AudioRoute(), metadata, EbooksRoute(), metadata, EducationRoute(), metadata, GlossaryRoute(), metadata (+11 more)

### Community 3 - "Community 3"

Cohesion: 0.11
Nodes (15): Analytics(), CookieConsent(), PageFade(), RouteChrome(), { Link, redirect, usePathname, useRouter, getPathname }, routing, BASE, inter (+7 more)

### Community 4 - "Community 4"

Cohesion: 0.09
Nodes (22): dependencies, @newera365/types, @newera365/ui, next, next-intl, next-themes, react, react-dom (+14 more)

### Community 5 - "Community 5"

Cohesion: 0.13
Nodes (11): Category, CATEGORY_META, MarketCategoryRoute(), Props, VALID_CATEGORIES, FeesRoute(), CmsInstrument, getInstruments() (+3 more)

### Community 6 - "Community 6"

Cohesion: 0.16
Nodes (12): AnalystChartRoute(), ContactRoute(), metadata, fetchGlobal(), getAnalystCalls(), getLatestNews(), getSiteSettings(), HomePage() (+4 more)

### Community 7 - "Community 7"

Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, eslint-config-next, gsap, @newera365/config, postcss, rimraf (+7 more)

### Community 8 - "Community 8"

Cohesion: 0.13
Nodes (14): compilerOptions, allowJs, incremental, jsx, lib, noEmit, paths, plugins (+6 more)

### Community 9 - "Community 9"

Cohesion: 0.21
Nodes (11): AboutRoute(), mapAward(), mapTeamMember(), metadata, resolveUrl(), AwardsRoute(), metadata, CmsAward (+3 more)

### Community 10 - "Community 10"

Cohesion: 0.17
Nodes (10): ar, arFlat, arKeys, en, enFlat, enKeys, errors, fs (+2 more)

### Community 12 - "Community 12"

Cohesion: 0.33
Nodes (5): LegalRoute(), metadata, Props, CmsLegalPage, getLegalPages()

### Community 13 - "Community 13"

Cohesion: 0.40
Nodes (4): CmsPromotion, getPromotions(), metadata, PromotionsRoute()

### Community 14 - "Community 14"

Cohesion: 0.40
Nodes (4): CmsWebinar, getWebinars(), metadata, WebinarsRoute()

### Community 15 - "Community 15"

Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, installCommand, outputDirectory

### Community 16 - "Community 16"

Cohesion: 0.50
Nodes (3): cmsUrl, nextConfig, withNextIntl

## Knowledge Gaps

- **114 isolated node(s):** `withNextIntl`, `cmsUrl`, `nextConfig`, `name`, `version` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `getSiteSettings()` connect `Community 6` to `Community 0`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `getInstruments()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `withNextIntl`, `cmsUrl`, `nextConfig` to the rest of the system?**
  _114 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05411764705882353 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09462365591397849 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
