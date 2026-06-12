<!-- converted from NewEra365_CMS_API_Reference.docx -->

NewEra365
CMS API Reference
Content Management System Integration Guide

NewEra365 Development Team
June 2026
Project Reference: CSL-NE365-2026-Q2

# 1. Overview

## 1.1 Architecture

NewEra365.com uses Payload CMS v2 running as a standalone Express server on port 3001. The frontend (Next.js 14, App Router) fetches data from the CMS via Payload's REST API. The CMS is NOT embedded in Next.js - it runs separately and is not Vercel-serverless compatible.

Core fetch helpers in cms.ts:

- fetchCollection<T>(slug, params, locale?) - paginated collection fetch, 60s ISR cache
- fetchGlobal<T>(slug) - global document fetch, 300s ISR cache
- fetchBySlug<T>(collection, slug, locale, extraParams?) - single-document slug lookup

## 1.2 Localization

Payload native localization is enabled with two locales: en (default) and ar. To fetch Arabic content, pass ?locale=ar as a query parameter. The frontend does this automatically by threading params.locale from the route segment into each CMS helper.

## 1.3 Authentication

All content collections use access: { read: () => true } - no authentication needed for GET requests. The following collections return 403 to unauthenticated requests:

- newsletter-subscribers (admin CRM data)
- webinar-registrations (admin CRM data)
- users (admin only)

# 2. Collection Endpoints

The following sections describe each Payload CMS collection, its REST endpoint, the frontend pages that consume it, and its localization configuration.

2.1. news

### Breaking news and market updates (homepage ticker + news feed)

Query Parameters:

- where[status][equals]=published
- sort=-publishedDate
- limit=4
- locale=en|ar

Localized fields: headline, body
Non-localized fields: slug, source, sourceUrl, publishedDate, category

2.2. blog-posts

### Editorial blog articles - market news, analysis, tutorials, company updates

Query Parameters:

- where[status][equals]=published
- sort=-publishedDate
- locale=en|ar
- where[slug][equals]=<slug> (detail)
- depth=1 (detail, resolves media)

Localized fields: title, author, excerpt, body
Non-localized fields: slug, category, publishedDate, featuredImage

Note: The category field (market-news, analysis, tutorials, company-updates) is mapped to display categories (MACRO, ANALYSIS, STRATEGY) via BLOG_CAT_TO_ASSET lookup in cms.ts.

2.3. market-analysis

### Technical market analysis from the trading desk (Research page)

Query Parameters:

- where[status][equals]=published
- sort=-publishedDate
- locale=en|ar

Localized fields: title, analyst, body
Non-localized fields: slug, assetCategory, publishedDate, chartEmbed, relatedInstruments

2.4. education-content

### Multi-type education hub: guides, ebooks, glossary terms, videos

Query Parameters:

- where[status][equals]=published
- where[contentType][equals]=<type>
- sort=-updatedAt
- locale=en|ar
- limit=500 for glossary

Localized fields: title, glossaryTerm, alphabeticalIndex, body
Non-localized fields: slug, contentType, isGated, videoEmbed, pdfFile, thumbnail

Note: Hook: beforeChange -> deriveAlphabeticalIndex auto-sets the alphabeticalIndex field from the first character of glossaryTerm. Supports both Latin and Arabic scripts.

2.5. webinars

### Upcoming and recorded webinar sessions shown on the education media page

Query Parameters:

- where[status][not_equals]=cancelled (default)
- sort=-scheduledAt
- limit=50
- locale=en|ar

Localized fields: title, speakerBio
Non-localized fields: slug, speaker, scheduledAt, timezone, status, zoomRegistrationLink, zoomWebinarId, replayUrl, thumbnail

Note: Status values: upcoming, live, completed, cancelled. Display mapping: upcoming/live -> LIVE tab, completed -> EDUCATION tab with replay link.

2.6. faqs

### Frequently asked questions grouped by category

Query Parameters:

- where[status][equals]=active
- sort=sortOrder
- limit=200
- locale=en|ar

Localized fields: question, answer (Slate richtext)
Non-localized fields: category, sortOrder

2.7. legal-pages

### Legal documents: terms, privacy policy, risk disclosure, AML, cookie policy

Query Parameters:

- where[status][equals]=published
- sort=pageType
- limit=20
- locale=en|ar

Localized fields: title, body (Slate richtext), riskWarningBanner
Non-localized fields: slug, pageType, effectiveDate, version

Note: Hook: afterChange -> archivePreviousLegalVersion. Enforces only one published document per pageType+locale. Previous version auto-demoted to draft.

2.8. careers

### Open job listings for the Careers page

Query Parameters:

- where[status][equals]=open
- sort=sortOrder,title
- limit=100
- locale=en|ar

Localized fields: title, location, summary, body
Non-localized fields: slug, department, employmentType, publishedDate, applyUrl

2.9. team-members

### Executive team profiles for the About page

Query Parameters:

- where[status][equals]=active
- sort=sortOrder
- limit=50
- locale=en|ar

Localized fields: name, role, bio
Non-localized fields: slug, photo, sortOrder

2.10. awards

### Industry awards and recognition shown on the About page

Query Parameters:

- where[status][equals]=published
- sort=sortOrder
- limit=20
- locale=en|ar

Localized fields: title, description
Non-localized fields: slug, date, logo, externalUrl, sortOrder

Note: Fetched in parallel with team-members on the About page.

2.11. promotions

### Trading promotion cards on the Promotions page

Query Parameters:

- where[status][equals]=active
- sort=sortOrder
- limit=50
- locale=en|ar

Localized fields: title, tag, description, terms, ctaLabel, ctaHref
Non-localized fields: slug, tagColor, isHighlighted, sortOrder

2.12. products-instruments

### Trading instrument specifications: spreads, leverage, trading hours

Query Parameters:

- where[status][equals]=active
- sort=sortOrder
- where[assetClass][equals]=<class> (optional)
- limit=50
- NO locale param (language-neutral)

Localized fields: None - all fields are language-neutral
Non-localized fields: symbol, name, assetClass, spread, leverage, tradingHours, minTradeSize, sortOrder

Note: Asset classes: forex, commodities, indices, stocks, etfs, crypto. Instruments have a usesMT5Data flag; live price fields are updated by the MT5 bridge service.

2.13. account-types

### Trading account tier cards (Standard, Raw, VIP)

Query Parameters:

- where[status][equals]=active
- sort=sortOrder
- limit=3
- NO locale param

Localized fields: None - all fields are language-neutral
Non-localized fields: name, minDeposit, spreadFrom, leverage, platforms, commission, features, isPopular

2.14. payment-methods

### Deposit and withdrawal method cards on the Funding page

Query Parameters:

- where[status][equals]=active
- sort=sortOrder
- limit=50
- locale=en|ar

Localized fields: depositTime, withdrawalTime, minDeposit, fee, notes
Non-localized fields: name, methodType, logo, sortOrder

Note: Text description fields were made locale-aware to support Arabic translations (e.g., "Instant" / "فوري", "1-3 business days" / "1-3 أيام عمل").

2.15. research-reports

### Gated PDF research reports (collection exists, frontend page not yet implemented)

Query Parameters:

- No frontend calls currently

Localized fields: title, summary
Non-localized fields: slug, reportFile, thumbnail, isGated, publishedDate

Note: The collection and schema are ready. Frontend page implementation is deferred.

2.16. company-content

### Awards and press mentions (section: awards | press)

Query Parameters:

- section=awards|press filter (when implemented)

Localized fields: title, description, body
Non-localized fields: slug, section, date, externalUrl, logo, sortOrder

# 3. Global Endpoints

Globals are singleton documents (one per site) accessible via /api/globals/<slug>. Unlike collections, globals do not have pagination.

## 3.1 site-settings

The site-settings global stores configuration used across all pages, including navigation, footer, social links, contact details, risk banners, KPI stats, and MT5 sync settings.

Key fields and their frontend usage:

Note: Site settings uses a manual bilingual pattern (paired En/Ar fields) rather than Payload native localization. This is because Payload v2 globals require extra configuration for per-locale REST requests.

# 4. Custom REST Endpoints

All custom endpoints are implemented in apps/cms/src/endpoints/index.ts. These endpoints augment Payload's auto-generated CRUD API with business-logic routes.

### 4.1 GET /api/health

### 4.2 GET /api/mt5/instruments

### 4.3 POST /api/newsletter/subscribe

### 4.4 GET /api/newsletter/confirm

### 4.5 POST/GET /api/newsletter/unsubscribe

### 4.6 POST /api/education/gate

### 4.7 POST /api/contact

### 4.8 POST /api/partners/apply

### 4.9 POST /api/webinars/register

# 5. Localization Guide

## 5.1 Locale Flow

When a user visits /ar/blog, locale flows from the URL through the full request lifecycle:

## 5.2 Two Types of Translated Text

## 5.3 RTL Support

Arabic is RTL. The layout sets html[dir] using dir() from @newera365/types:

## 5.4 Intentionally Non-Localized Collections

These collections store language-neutral data and should NOT receive a locale parameter:

- products-instruments - numeric specs (spreads, leverage), symbols, enum values
- account-types - trading specs, commission rates, feature lists
- payment-methods (name, methodType, logo) - brand names and logos are global

# 6. Data Flow Summary

The following table lists every frontend route, the CMS collections it queries, the helper functions used, and whether locale is passed.

## 6.1 Pages Without CMS Integration

The following pages are functional / tool pages that do not fetch CMS data. Their content is either hardcoded in the component or fetched from the MT5 service directly:

- /tools/\* - All calculators (Fibonacci, Pivot, Profit, Spread Comparator)
- /tools/watchlist - Live prices from MT5 service
- /tools/calendar - Economic calendar (external data)
- /tools/analyst-chart - Analyst chart (hardcoded)
- /trade/ib - Introducing Broker page (hardcoded)
- /live-chat - Chat widget only
- /newsletter - Subscription form only (uses POST /api/newsletter/subscribe)

# 7. Seed Data

## 7.1 Running the Seed Script

Demo data (EN + AR) for all collections can be loaded via the seed script. The CMS must be running on port 3001 and an admin account must already exist.

## 7.2 Collections Seeded

The seed script creates demo records in EN then patches each document with AR translations:

# 8. Environment & Deployment

## 8.1 Required Environment Variables

| CMS Version                                                 | Payload CMS v2 (Express + PostgreSQL/Neon)                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------- |
| Dev Base URL                                                | http://localhost:3001                                                                                                                                                                                                                           |
| Env Variable                                                | NEXT_PUBLIC_CMS_URL                                                                                                                                                                                                                             |
| Frontend Utility                                            | apps/web/src/lib/cms.ts                                                                                                                                                                                                                         |
| Locales                                                     | en (English, LTR default), ar (Arabic, RTL)                                                                                                                                                                                                     |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Default Locale                                              | en                                                                                                                                                                                                                                              |
| Fallback                                                    | true - missing AR translations fall back to EN                                                                                                                                                                                                  |
| URL Pattern                                                 | /en/... and /ar/... (always-prefix mode)                                                                                                                                                                                                        |
| Endpoint                                                    | GET /api/news                                                                                                                                                                                                                                   |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Breaking news and market updates (homepage ticker + news feed)                                                                                                                                                                                  |
| Page(s)                                                     | /[locale]/ (home)                                                                                                                                                                                                                               |
| CMS helper(s)                                               | getLatestNews(locale, limit=4)                                                                                                                                                                                                                  |
| Endpoint                                                    | GET /api/blog-posts                                                                                                                                                                                                                             |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Editorial blog articles - market news, analysis, tutorials, company updates                                                                                                                                                                     |
| Page(s)                                                     | /[locale]/blog (listing), /[locale]/blog/[slug] (detail)                                                                                                                                                                                        |
| CMS helper(s)                                               | getBlogPosts(locale, limit=10), getBlogPostBySlug(slug, locale)                                                                                                                                                                                 |
| Endpoint                                                    | GET /api/market-analysis                                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Technical market analysis from the trading desk (Research page)                                                                                                                                                                                 |
| Page(s)                                                     | /[locale]/research (listing), /[locale]/research/[slug] (detail)                                                                                                                                                                                |
| CMS helper(s)                                               | getResearchArticles(locale, limit=10), getMarketAnalysisBySlug(slug, locale)                                                                                                                                                                    |
| Endpoint                                                    | GET /api/education-content                                                                                                                                                                                                                      |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Multi-type education hub: guides, ebooks, glossary terms, videos                                                                                                                                                                                |
| Page(s)                                                     | /education (hub), /guides (listing), /guides/[slug] (detail), /ebooks, /glossary                                                                                                                                                                |
| CMS helper(s)                                               | getEducationContent(contentType?, locale?, limit=50), getGuides, getGuideBySlug, getGlossaryTerms                                                                                                                                               |
| Endpoint                                                    | GET /api/webinars                                                                                                                                                                                                                               |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Upcoming and recorded webinar sessions shown on the education media page                                                                                                                                                                        |
| Page(s)                                                     | /[locale]/education/media                                                                                                                                                                                                                       |
| CMS helper(s)                                               | getWebinars(locale?, status?)                                                                                                                                                                                                                   |
| Endpoint                                                    | GET /api/faqs                                                                                                                                                                                                                                   |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Frequently asked questions grouped by category                                                                                                                                                                                                  |
| Page(s)                                                     | /[locale]/faqs                                                                                                                                                                                                                                  |
| CMS helper(s)                                               | getFaqs(locale)                                                                                                                                                                                                                                 |
| Endpoint                                                    | GET /api/legal-pages                                                                                                                                                                                                                            |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Legal documents: terms, privacy policy, risk disclosure, AML, cookie policy                                                                                                                                                                     |
| Page(s)                                                     | /[locale]/legal                                                                                                                                                                                                                                 |
| CMS helper(s)                                               | getLegalPages(locale)                                                                                                                                                                                                                           |
| Endpoint                                                    | GET /api/careers                                                                                                                                                                                                                                |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Open job listings for the Careers page                                                                                                                                                                                                          |
| Page(s)                                                     | /[locale]/company/careers                                                                                                                                                                                                                       |
| CMS helper(s)                                               | getCareers(locale?)                                                                                                                                                                                                                             |
| Endpoint                                                    | GET /api/team-members                                                                                                                                                                                                                           |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Executive team profiles for the About page                                                                                                                                                                                                      |
| Page(s)                                                     | /[locale]/company/about                                                                                                                                                                                                                         |
| CMS helper(s)                                               | getTeamMembers(locale)                                                                                                                                                                                                                          |
| Endpoint                                                    | GET /api/awards                                                                                                                                                                                                                                 |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Industry awards and recognition shown on the About page                                                                                                                                                                                         |
| Page(s)                                                     | /[locale]/company/about                                                                                                                                                                                                                         |
| CMS helper(s)                                               | getAwards(locale)                                                                                                                                                                                                                               |
| Endpoint                                                    | GET /api/promotions                                                                                                                                                                                                                             |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Trading promotion cards on the Promotions page                                                                                                                                                                                                  |
| Page(s)                                                     | /[locale]/trade/promotions                                                                                                                                                                                                                      |
| CMS helper(s)                                               | getPromotions(locale?)                                                                                                                                                                                                                          |
| Endpoint                                                    | GET /api/products-instruments                                                                                                                                                                                                                   |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Trading instrument specifications: spreads, leverage, trading hours                                                                                                                                                                             |
| Page(s)                                                     | /markets/instruments, /markets/[category] (6 pages), /trade/fees                                                                                                                                                                                |
| CMS helper(s)                                               | getInstruments(assetClass?, limit=50)                                                                                                                                                                                                           |
| Endpoint                                                    | GET /api/account-types                                                                                                                                                                                                                          |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Trading account tier cards (Standard, Raw, VIP)                                                                                                                                                                                                 |
| Page(s)                                                     | /[locale]/trade/accounts                                                                                                                                                                                                                        |
| CMS helper(s)                                               | getAccountTypes()                                                                                                                                                                                                                               |
| Endpoint                                                    | GET /api/payment-methods                                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Deposit and withdrawal method cards on the Funding page                                                                                                                                                                                         |
| Page(s)                                                     | /[locale]/trade/funding                                                                                                                                                                                                                         |
| CMS helper(s)                                               | getPaymentMethods(locale?)                                                                                                                                                                                                                      |
| Endpoint                                                    | GET /api/research-reports                                                                                                                                                                                                                       |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Gated PDF research reports (collection exists, frontend page not yet implemented)                                                                                                                                                               |
| Page(s)                                                     | NOT YET WIRED - deferred (NE-0xx)                                                                                                                                                                                                               |
| CMS helper(s)                                               | None yet                                                                                                                                                                                                                                        |
| Endpoint                                                    | GET /api/company-content                                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Purpose                                                     | Awards and press mentions (section: awards                                                                                                                                                                                                      | press)                         |
| Page(s)                                                     | Not currently wired to a frontend page                                                                                                                                                                                                          |
| CMS helper(s)                                               | None yet                                                                                                                                                                                                                                        |
| Endpoint                                                    | GET /api/globals/site-settings                                                                                                                                                                                                                  |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Cache TTL                                                   | 300 seconds (5 minutes)                                                                                                                                                                                                                         |
| CMS helper                                                  | getSiteSettings()                                                                                                                                                                                                                               |
| Locale param                                                | None - uses paired En/Ar fields (e.g., contactAddressEn / contactAddressAr)                                                                                                                                                                     |
| Field                                                       | Frontend Usage                                                                                                                                                                                                                                  |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| kpiStats (valueEn/valueAr, labelEn/labelAr)                 | Homepage stats section (StatsSection)                                                                                                                                                                                                           |
| socialProofLogos                                            | Homepage trust strip                                                                                                                                                                                                                            |
| downloadMt5Windows/Mac/iOS/Android                          | Platform pages download buttons                                                                                                                                                                                                                 |
| downloadWebTrader                                           | Web Trader platform page                                                                                                                                                                                                                        |
| contactEmail, contactEmailCompliance, contactPhone          | Contact page channel cards                                                                                                                                                                                                                      |
| contactAddressEn / contactAddressAr                         | Contact page (locale-branched in component)                                                                                                                                                                                                     |
| supportHoursEn / supportHoursAr                             | Contact page support hours                                                                                                                                                                                                                      |
| navEn / navAr                                               | Header navigation links                                                                                                                                                                                                                         |
| footerEn / footerAr                                         | Footer link column groups                                                                                                                                                                                                                       |
| riskBannerEnabled, riskBannerEn/Ar                          | Risk banner shown on all pages                                                                                                                                                                                                                  |
| riskDisclaimerEn / riskDisclaimerAr                         | Footer legal disclaimer text                                                                                                                                                                                                                    |
| socialFacebook/X/LinkedIn/Instagram/YouTube/Telegram/TikTok | Footer social icon links                                                                                                                                                                                                                        |
| mt5SyncEnabled                                              | Master switch for MT5 live data sync                                                                                                                                                                                                            |
| mt5RefreshIntervalSecs                                      | MT5 sync polling interval                                                                                                                                                                                                                       |
| Method / Path                                               | GET /api/health                                                                                                                                                                                                                                 |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | x-health-token header (must match HEALTH_CHECK_TOKEN env var)                                                                                                                                                                                   |
| Rate Limit                                                  | None                                                                                                                                                                                                                                            |
| Request Body                                                | None                                                                                                                                                                                                                                            |
| Purpose                                                     | Health check for load balancer / uptime monitoring. Returns { status: "ok", timestamp: "..." }                                                                                                                                                  |
| Method / Path                                               | GET /api/mt5/instruments (also /:symbol)                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public (no auth required)                                                                                                                                                                                                                       |
| Rate Limit                                                  | None                                                                                                                                                                                                                                            |
| Request Body                                                | None                                                                                                                                                                                                                                            |
| Purpose                                                     | Live instrument prices from MT5 bridge service on port 4000. Falls back to CMS data when MT5 service is unreachable. Returns MT5Response<InstrumentSpec[]>. When usesMT5Data: false or source: cms-fallback, the UI shows a static-data notice. |
| Method / Path                                               | POST /api/newsletter/subscribe                                                                                                                                                                                                                  |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public                                                                                                                                                                                                                                          |
| Rate Limit                                                  | 5 req/min/IP                                                                                                                                                                                                                                    |
| Request Body                                                | { email: string, consent: boolean }                                                                                                                                                                                                             |
| Purpose                                                     | Newsletter sign-up for The Monday Briefing. Sends a double opt-in confirmation email via Resend.                                                                                                                                                |
| Method / Path                                               | GET /api/newsletter/confirm?token=<tok>                                                                                                                                                                                                         |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Token from confirmation email                                                                                                                                                                                                                   |
| Rate Limit                                                  | None                                                                                                                                                                                                                                            |
| Request Body                                                | None                                                                                                                                                                                                                                            |
| Purpose                                                     | Double opt-in confirmation. Activates the newsletter subscription.                                                                                                                                                                              |
| Method / Path                                               | POST / GET /api/newsletter/unsubscribe                                                                                                                                                                                                          |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public (GET uses token from email footer)                                                                                                                                                                                                       |
| Rate Limit                                                  | 5 req/min/IP (POST only)                                                                                                                                                                                                                        |
| Request Body                                                | { email: string } (POST)                                                                                                                                                                                                                        |
| Purpose                                                     | Unsubscribe flow. POST = form submission, GET = one-click unsubscribe link from email footers.                                                                                                                                                  |
| Method / Path                                               | POST /api/education/gate                                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public                                                                                                                                                                                                                                          |
| Rate Limit                                                  | 5 req/min/IP                                                                                                                                                                                                                                    |
| Request Body                                                | { contentId: string, email: string }                                                                                                                                                                                                            |
| Purpose                                                     | Email-gated content access for ebooks and premium guides. Validates that contentId exists in education-content collection before granting download link.                                                                                        |
| Method / Path                                               | POST /api/contact                                                                                                                                                                                                                               |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public                                                                                                                                                                                                                                          |
| Rate Limit                                                  | 3 req/min/IP                                                                                                                                                                                                                                    |
| Request Body                                                | { name, email, department, message }                                                                                                                                                                                                            |
| Purpose                                                     | Contact form submission. Routes message to appropriate department email via Resend.                                                                                                                                                             |
| Method / Path                                               | POST /api/partners/apply                                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public                                                                                                                                                                                                                                          |
| Rate Limit                                                  | 5 req/min/IP                                                                                                                                                                                                                                    |
| Request Body                                                | { name, email, partnerType, website }                                                                                                                                                                                                           |
| Purpose                                                     | IB / affiliate / white-label partner application. Sends notification to the partnerships team.                                                                                                                                                  |
| Method / Path                                               | POST /api/webinars/register                                                                                                                                                                                                                     |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Auth                                                        | Public                                                                                                                                                                                                                                          |
| Rate Limit                                                  | 10 req/min/IP                                                                                                                                                                                                                                   |
| Request Body                                                | { webinarId: string, name: string, email: string }                                                                                                                                                                                              |
| Purpose                                                     | Zoom webinar registration. Creates a webinar-registrations record in the CMS and registers the user with the Zoom API using the webinar's zoomWebinarId.                                                                                        |
| 1. URL                                                      | /ar/blog                                                                                                                                                                                                                                        |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| 2. Layout                                                   | params.locale = "ar" -> setRequestLocale("ar")                                                                                                                                                                                                  |
| 3. Page server                                              | getBlogPosts("ar")                                                                                                                                                                                                                              |
| 4. cms.ts                                                   | fetchCollection("blog-posts", params, "ar")                                                                                                                                                                                                     |
| 5. Payload REST                                             | GET /api/blog-posts?locale=ar&...                                                                                                                                                                                                               |
| 6. Payload                                                  | Returns Arabic field values for localized fields                                                                                                                                                                                                |
| 7. Component                                                | useTranslations() for UI strings; CMS data for content                                                                                                                                                                                          |
| Type                                                        | Source                                                                                                                                                                                                                                          | Example                        |
| ---                                                         | ---                                                                                                                                                                                                                                             | ---                            |
| UI strings (labels, buttons, nav)                           | messages/en.json and messages/ar.json via next-intl                                                                                                                                                                                             | "Browse guides", "Apply now"   |
| Content text (articles, FAQs, team bios)                    | CMS via ?locale=ar query param                                                                                                                                                                                                                  | Article titles, FAQ answers    |
| Helper                                                      | dir(locale) -> "ltr"                                                                                                                                                                                                                            | "rtl"                          |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Source                                                      | packages/types/src/locales.ts                                                                                                                                                                                                                   |
| HTML output                                                 | <html lang="ar" dir="rtl">                                                                                                                                                                                                                      |
| Page Route                                                  | CMS Collection(s)                                                                                                                                                                                                                               | Helper Function(s)             | Locale                |
| ---                                                         | ---                                                                                                                                                                                                                                             | ---                            | ---                   |
| / (home)                                                    | news, globals/site-settings                                                                                                                                                                                                                     | getLatestNews, getSiteSettings | Yes (news)            |
| /blog                                                       | blog-posts                                                                                                                                                                                                                                      | getBlogPosts                   | Yes                   |
| /blog/[slug]                                                | blog-posts                                                                                                                                                                                                                                      | getBlogPostBySlug              | Yes                   |
| /research                                                   | market-analysis                                                                                                                                                                                                                                 | getResearchArticles            | Yes                   |
| /research/[slug]                                            | market-analysis                                                                                                                                                                                                                                 | getMarketAnalysisBySlug        | Yes                   |
| /education                                                  | education-content                                                                                                                                                                                                                               | getEducationContent            | Yes                   |
| /education/media                                            | webinars                                                                                                                                                                                                                                        | getWebinars                    | Yes                   |
| /ebooks                                                     | education-content                                                                                                                                                                                                                               | getEducationContent (ebook)    | Yes                   |
| /guides                                                     | education-content                                                                                                                                                                                                                               | getGuides                      | Yes                   |
| /guides/[slug]                                              | education-content                                                                                                                                                                                                                               | getGuideBySlug                 | Yes                   |
| /glossary                                                   | education-content                                                                                                                                                                                                                               | getGlossaryTerms               | Yes                   |
| /faqs                                                       | faqs                                                                                                                                                                                                                                            | getFaqs                        | Yes                   |
| /legal                                                      | legal-pages                                                                                                                                                                                                                                     | getLegalPages                  | Yes                   |
| /company/about                                              | team-members, awards                                                                                                                                                                                                                            | getTeamMembers, getAwards      | Yes                   |
| /company/careers                                            | careers                                                                                                                                                                                                                                         | getCareers                     | Yes                   |
| /trade/accounts                                             | account-types                                                                                                                                                                                                                                   | getAccountTypes                | No                    |
| /trade/funding                                              | payment-methods                                                                                                                                                                                                                                 | getPaymentMethods              | Yes                   |
| /trade/fees                                                 | products-instruments                                                                                                                                                                                                                            | getInstruments                 | No                    |
| /trade/promotions                                           | promotions                                                                                                                                                                                                                                      | getPromotions                  | Yes                   |
| /markets/instruments                                        | products-instruments                                                                                                                                                                                                                            | getInstruments                 | No                    |
| /markets/[category]                                         | products-instruments                                                                                                                                                                                                                            | getInstruments(assetClass)     | No                    |
| /platform/[slug]                                            | globals/site-settings                                                                                                                                                                                                                           | getSiteSettings                | No (bilingual fields) |
| All pages (layout)                                          | globals/site-settings                                                                                                                                                                                                                           | getSiteSettings                | No (bilingual fields) |
| Script location                                             | apps/cms/src/scripts/seed.ts                                                                                                                                                                                                                    |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Run command                                                 | node -r ts-node/register apps/cms/src/scripts/seed.ts                                                                                                                                                                                           |
| Admin credentials                                           | SEED_ADMIN_EMAIL / SEED_ADMIN_PASS env vars                                                                                                                                                                                                     |
| Default credentials                                         | admin@newera365.com / Admin123!                                                                                                                                                                                                                 |
| Collection                                                  | Records (EN + AR)                                                                                                                                                                                                                               |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| site-settings (global)                                      | KPI stats, contact info, risk banners, nav/footer                                                                                                                                                                                               |
| account-types                                               | 3 accounts: Standard, Raw, VIP                                                                                                                                                                                                                  |
| payment-methods                                             | 5 methods with EN + AR time/fee descriptions                                                                                                                                                                                                    |
| products-instruments                                        | 19 instruments across all 6 asset classes                                                                                                                                                                                                       |
| faqs                                                        | 10 Q&A pairs across 6 categories                                                                                                                                                                                                                |
| blog-posts                                                  | 3 market articles (EUR/USD, Gold, NFP guide)                                                                                                                                                                                                    |
| market-analysis                                             | 2 technical analyses (EUR/USD, Gold)                                                                                                                                                                                                            |
| news                                                        | 5 breaking news items                                                                                                                                                                                                                           |
| legal-pages                                                 | 3 documents: terms, privacy policy, risk disclosure                                                                                                                                                                                             |
| team-members                                                | 4 leadership profiles                                                                                                                                                                                                                           |
| awards                                                      | 3 industry awards                                                                                                                                                                                                                               |
| promotions                                                  | 3 trading promotions                                                                                                                                                                                                                            |
| education-content (guides)                                  | 3 guides: Forex intro, MT5 guide, Risk management                                                                                                                                                                                               |
| education-content (glossary)                                | 5 terms: Pip, Spread, Leverage, Margin, Stop Loss                                                                                                                                                                                               |
| careers                                                     | 3 job listings (Engineering, Sales, Support)                                                                                                                                                                                                    |
| webinars                                                    | 4 sessions (2 upcoming, 2 completed with replay)                                                                                                                                                                                                |
| Component                                                   | Platform / Notes                                                                                                                                                                                                                                |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| Frontend (apps/web)                                         | Vercel - Next.js 14 App Router                                                                                                                                                                                                                  |
| CMS (apps/cms)                                              | EC2 / Railway - standalone Express server                                                                                                                                                                                                       |
| Database                                                    | Neon (serverless PostgreSQL)                                                                                                                                                                                                                    |
| Media / gated PDFs                                          | Cloudflare R2 via @payloadcms/plugin-cloud-storage (Phase 3, NE-027)                                                                                                                                                                            |
| MT5 bridge (apps/mt5-service)                               | Port 4000 - mock bridge; real MT5 Manager API is NE-003                                                                                                                                                                                         |
| CI/CD                                                       | GitHub Actions: lint -> type-check -> build on push to main/staging                                                                                                                                                                             |
| Variable                                                    | Purpose                                                                                                                                                                                                                                         |
| ---                                                         | ---                                                                                                                                                                                                                                             |
| PAYLOAD_SECRET                                              | JWT signing secret (warn in dev, error in prod if placeholder)                                                                                                                                                                                  |
| FRONTEND_URL                                                | Allowed CORS origin for the CMS admin                                                                                                                                                                                                           |
| RESEND_API_KEY                                              | Transactional email (newsletter, contact form)                                                                                                                                                                                                  |
| EMAIL_FROM                                                  | Sender address for outbound emails                                                                                                                                                                                                              |
| CONSENT_IP_SALT                                             | HMAC salt for newsletter consent IP hashing                                                                                                                                                                                                     |
| HEALTH_CHECK_TOKEN                                          | Auth token for GET /api/health endpoint                                                                                                                                                                                                         |
| NEXT_PUBLIC_CMS_URL                                         | Frontend -> CMS base URL (web app)                                                                                                                                                                                                              |
