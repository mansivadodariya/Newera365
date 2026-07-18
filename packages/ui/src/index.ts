// NOTE: This barrel must NOT be a Client Component. A `'use client'` directive
// here forces EVERY re-exported component into the client bundle, even pure
// server/presentational ones — which is what inflated First Load JS. Each
// component declares its own `'use client'` when it needs one.
//
// Layout mirrors the folder taxonomy (see packages/ui/README.md):
//   lib/        non-component helpers and data modules
//   motion/     the "Life" motion primitives (DESIGN.md §8)
//   primitives/ small reusable UI building blocks
//   chrome/     site shell: header, footer, banners, overlays
//   sections/   homepage and reusable page sections
//   market/     live-market data widgets (TradingView, MT5 spark)
//   pages/      full route-level page components

// ── lib ──────────────────────────────────────────────────────────────────────
export { safeUrl } from './lib/safeUrl';

// ── motion ───────────────────────────────────────────────────────────────────
export { CountUp } from './components/motion/CountUp';
export { RevealDemo } from './components/motion/RevealDemo';

// ── primitives ───────────────────────────────────────────────────────────────
export { SectionKicker } from './components/primitives/SectionKicker';
export { Spotlight } from './components/primitives/Spotlight';
export { Pagination } from './components/primitives/Pagination';
export { RichText, extractHeadings } from './components/primitives/RichText';
export type { SlateNode } from './components/primitives/RichText';

// ── chrome (site shell) ──────────────────────────────────────────────────────
export { HeaderDemo } from './components/chrome/HeaderDemo';
export { MobileMenuDemo } from './components/chrome/MobileMenuDemo';
export { Footer } from './components/chrome/Footer';
export type { CmsFooterColumn, CmsSocialLinks } from './components/chrome/Footer';
export { ToastProvider, useToast } from './components/chrome/ToastProvider';
export { AuthModal } from './components/chrome/AuthModal';
export type { AuthModalType } from './components/chrome/AuthModal';
export { LanguageToggle } from './components/chrome/LanguageToggle';
export { RiskBanner } from './components/chrome/RiskBanner';
export { TopLoadingBar } from './components/chrome/TopLoadingBar';
export { StickyCtaBar } from './components/chrome/StickyCtaBar';
export { FloatingContactWidget } from './components/chrome/FloatingContactWidget';
export type { FloatingContactWidgetProps } from './components/chrome/FloatingContactWidget';

// ── sections (homepage + reusable bands; the "Demo" suffix is historical —
//    these were promoted from the landing redesign to the live site) ──────────
export { HeroSectionDemo } from './components/sections/HeroSectionDemo';
export { TestimonialsSection } from './components/sections/TestimonialsSection';
export type {
  TestimonialItem,
  TestimonialsSectionProps,
} from './components/sections/TestimonialsSection';
export { StatsSectionDemo } from './components/sections/StatsSectionDemo';
export type { CmsKpiStat } from './components/sections/StatsSectionDemo';
export { MarketsSectionDemo } from './components/sections/MarketsSectionDemo';
export { MarketsSectionGrid } from './components/sections/MarketsSectionGrid';
export type { MarketItem } from './components/sections/MarketsSectionGrid';
export { ThreeStepsSectionDemo } from './components/sections/ThreeStepsSectionDemo';
export { TwoPathsSection } from './components/sections/TwoPathsSection';
export { HomeNewsletterSection } from './components/sections/HomeNewsletterSection';
export type { HomeNewsletterContent } from './components/sections/HomeNewsletterSection';
export { PartnersSection } from './components/sections/PartnersSection';
export type { PartnerItem, PartnersSectionProps } from './components/sections/PartnersSection';
export { FeaturesSection } from './components/sections/FeaturesSection';
export type { CmsUspMetric, FeaturesSectionProps } from './components/sections/FeaturesSection';
export { ArbitrageSection } from './components/sections/ArbitrageSection';
export { FundingStripSection } from './components/sections/FundingStripSection';
export { CompareChecklistSection } from './components/sections/CompareChecklistSection';
export { SecurityTrustBand } from './components/sections/SecurityTrustBand';
export { CtaBanner } from './components/sections/CtaBanner';
export { CtaBannerDemo } from './components/sections/CtaBannerDemo';
export { SmartCtaBanner, NO_CTA_SUFFIXES } from './components/sections/SmartCtaBanner';
export type { WebinarItem } from './components/sections/WebinarsSection';

// ── market (live-data widgets) ───────────────────────────────────────────────
export { TradingViewTicker } from './components/market/TradingViewTicker';
export { TradingViewWidget } from './components/market/TradingViewWidget';
export type { WidgetType, TradingViewWidgetProps } from './components/market/TradingViewWidget';
export { LiveSpark } from './components/market/LiveSpark';
export type { LiveSparkProps } from './components/market/LiveSpark';

// ── pages (route-level components; routes in apps/web are thin wrappers) ─────
export { AccountsPage } from './components/pages/AccountsPage';
export { FundingPage } from './components/pages/FundingPage';
export type { CmsPaymentMethodItem } from './components/pages/FundingPage';
export { FeesPage } from './components/pages/FeesPage';
export type { CmsSpreadRow } from './components/pages/FeesPage';
export { PromoPage } from './components/pages/PromoPage';
export type { CmsPromoItem } from './components/pages/PromoPage';
export { IBPage } from './components/pages/IBPage';
export type { IBCmsContent } from './components/pages/IBPage';
export { MarketCategoryPage } from './components/pages/MarketCategoryPage';
export type { MarketCategoryPageProps } from './components/pages/MarketCategoryPage';
export { PlatformPage } from './components/pages/PlatformPage';
export type { CmsPlatformDownloads } from './components/pages/PlatformPage';
export { WebTraderPage } from './components/pages/WebTraderPage';
export type { CmsWebTraderSpec } from './components/pages/WebTraderPage';
export { EducationHubPage } from './components/pages/EducationHubPage';
export type { CmsEducationItem } from './components/pages/EducationHubPage';
export { MediaListingPage } from './components/pages/MediaListingPage';
export type { CmsVideoItem } from './components/pages/MediaListingPage';
export { EbooksPage } from './components/pages/EbooksPage';
export type { CmsEbookItem } from './components/pages/EbooksPage';
export { GlossaryPage } from './components/pages/GlossaryPage';
export type { CmsGlossaryTerm } from './components/pages/GlossaryPage';
export { GuidesPage } from './components/pages/GuidesPage';
export type { CmsGuide } from './components/pages/GuidesPage';
export { GuideDetailPage } from './components/pages/GuideDetailPage';
export type { GuideDetailProps, CmsGuideDetail } from './components/pages/GuideDetailPage';
export { ResearchPage } from './components/pages/ResearchPage';
export type { ArticleItem, CmsResearchReportItem } from './components/pages/ResearchPage';
export { ResearchDetailPage } from './components/pages/ResearchDetailPage';
export type {
  ArticleDetailData,
  RelatedArticle,
  RelatedInstrument,
} from './components/pages/ResearchDetailPage';
export { TraderToolsPage } from './components/pages/TraderToolsPage';
export type { CmsCalculatorInstrument } from './components/pages/TraderToolsPage';
export { SpreadComparatorPage } from './components/pages/SpreadComparatorPage';
export type { CmsSpreadInstrument } from './components/pages/SpreadComparatorPage';
export { EconomicCalendarPage } from './components/pages/EconomicCalendarPage';
export { AnalystChartPage } from './components/pages/AnalystChartPage';
export type { CmsAnalystCallItem, CmsAnalystProfile } from './components/pages/AnalystChartPage';
export { LiveWatchlistPage } from './components/pages/LiveWatchlistPage';
export { NewsletterPage } from './components/pages/NewsletterPage';
export { SupportPage } from './components/pages/SupportPage';
export type { CmsFaqItem, CmsContactDetails, CmsPromiseStat } from './components/pages/SupportPage';
export { LegalPage } from './components/pages/LegalPage';
export type { CmsLegalDocument } from './components/pages/LegalPage';
export { AboutPage } from './components/pages/AboutPage';
export type { CmsAwardItem, CmsMilestoneItem } from './components/pages/AboutPage';
export { CareersPage } from './components/pages/CareersPage';
export type { CmsJobItem } from './components/pages/CareersPage';
export { RecognitionPage } from './components/pages/RecognitionPage';
export type { AwardCardItem, MediaPressItem } from './components/pages/RecognitionPage';
export { AiCrmPage } from './components/pages/AiCrmPage';
