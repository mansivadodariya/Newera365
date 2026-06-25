// NOTE: This barrel must NOT be a Client Component. A `'use client'` directive
// here forces EVERY re-exported component into the client bundle, even pure
// server/presentational ones — which is what inflated First Load JS. Each
// component declares its own `'use client'` when it needs one.

export { safeUrl } from './lib/safeUrl';

export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant } from './components/Button';

export { SectionKicker } from './components/SectionKicker';

export { ToastProvider, useToast } from './components/ToastProvider';

export { AuthModal } from './components/AuthModal';
export type { AuthModalType } from './components/AuthModal';
export { LanguageToggle } from './components/LanguageToggle';
export { RiskBanner } from './components/RiskBanner';

// ── Landing redesign DEMO components (isolated; not used by live pages) ──
export { HeaderDemo } from './components/HeaderDemo';
export { MobileMenuDemo } from './components/MobileMenuDemo';
export { HeroSectionDemo } from './components/HeroSectionDemo';
export { HeroChartCard } from './components/HeroChartCard';
export { RevealDemo } from './components/RevealDemo';
export { TrustStripDemo } from './components/TrustStripDemo';
export type { TrustLogo } from './components/TrustStripDemo';
export { TestimonialsSection } from './components/TestimonialsSection';
export type { TestimonialItem, TestimonialsSectionProps } from './components/TestimonialsSection';
export { StatsSectionDemo } from './components/StatsSectionDemo';
export type { CmsKpiStat } from './components/StatsSectionDemo';
export { MarketsSectionDemo } from './components/MarketsSectionDemo';
export { ThreeStepsSectionDemo } from './components/ThreeStepsSectionDemo';
export { CtaBannerDemo } from './components/CtaBannerDemo';
export { TickerStrip } from './components/TickerStrip';
export type { TickerItem } from './components/TickerStrip';
export { TradingViewTicker } from './components/TradingViewTicker';
export { Footer } from './components/Footer';
export type { CmsFooterColumn, CmsSocialLinks } from './components/Footer';

export { StatsSectionClient } from './components/StatsSectionClient';
export { CountUp } from './components/CountUp';
export { MarketsSectionGrid } from './components/MarketsSectionGrid';
export type { MarketItem } from './components/MarketsSectionGrid';
export { FeaturesSection } from './components/FeaturesSection';
export { CtaBanner } from './components/CtaBanner';
export { SmartCtaBanner } from './components/SmartCtaBanner';
export { HomePageSkeleton } from './components/HomePageSkeleton';
export { ArbitrageSection } from './components/ArbitrageSection';

export { AccountsPage } from './components/AccountsPage';
export { FundingPage } from './components/FundingPage';
export type { CmsPaymentMethodItem } from './components/FundingPage';
export { FeesPage } from './components/FeesPage';
export type { CmsSpreadRow } from './components/FeesPage';
export { PlatformPage } from './components/PlatformPage';
export type { CmsPlatformDownloads } from './components/PlatformPage';
export { WebTraderPage } from './components/WebTraderPage';
export { PromoPage } from './components/PromoPage';
export type { CmsPromoItem } from './components/PromoPage';
export { MarketCategoryPage } from './components/MarketCategoryPage';
export type { MarketCategoryPageProps } from './components/MarketCategoryPage';
export { FaqPage } from './components/FaqPage';
export type { CmsFaqItem } from './components/FaqPage';
export { ContactPage } from './components/ContactPage';
export type { CmsContactDetails } from './components/ContactPage';
export { AboutPage } from './components/AboutPage';
export type { CmsTeamMemberItem, CmsAwardItem, CmsMilestoneItem } from './components/AboutPage';
export { LegalPage } from './components/LegalPage';
export type { CmsLegalDocument } from './components/LegalPage';

export { IBPage } from './components/IBPage';
export type { IBCmsContent } from './components/IBPage';
export { EducationHubPage } from './components/EducationHubPage';
export type { CmsEducationItem } from './components/EducationHubPage';
export { MediaListingPage } from './components/MediaListingPage';
export type { CmsWebinarItem, CmsVideoItem } from './components/MediaListingPage';
export { WebinarsPage } from './components/WebinarsPage';
export type { WebinarItem } from './components/WebinarsPage';
export { EbooksPage } from './components/EbooksPage';
export type { CmsEbookItem } from './components/EbooksPage';
export { GlossaryPage } from './components/GlossaryPage';
export type { CmsGlossaryTerm } from './components/GlossaryPage';
export { GuidesPage } from './components/GuidesPage';
export type { CmsGuide } from './components/GuidesPage';
export { GuideDetailPage } from './components/GuideDetailPage';
export type { GuideDetailProps, CmsGuideDetail } from './components/GuideDetailPage';

export { ResearchPage } from './components/ResearchPage';
export type { ArticleItem, CmsResearchReportItem } from './components/ResearchPage';
export { ResearchDetailPage } from './components/ResearchDetailPage';
export type {
  ArticleDetailData,
  RelatedArticle,
  RelatedInstrument,
} from './components/ResearchDetailPage';
export { TraderToolsPage } from './components/TraderToolsPage';
export type { CmsCalculatorInstrument } from './components/TraderToolsPage';
export { SpreadComparatorPage } from './components/SpreadComparatorPage';
export type { CmsSpreadInstrument } from './components/SpreadComparatorPage';
export { EconomicCalendarPage } from './components/EconomicCalendarPage';
export { AnalystChartPage } from './components/AnalystChartPage';
export type { CmsAnalystCallItem, CmsAnalystProfile } from './components/AnalystChartPage';
export { LiveWatchlistPage } from './components/LiveWatchlistPage';
export { NewsletterPage } from './components/NewsletterPage';
export { LiveChatPage } from './components/LiveChatPage';
export { CareersPage } from './components/CareersPage';
export type { CmsJobItem } from './components/CareersPage';
export { Pagination } from './components/Pagination';

export { RichText, extractHeadings } from './components/RichText';
export type { SlateNode } from './components/RichText';

export { TradingViewWidget } from './components/TradingViewWidget';
export type { WidgetType, TradingViewWidgetProps } from './components/TradingViewWidget';

export { PivotCalculatorPage } from './components/PivotCalculatorPage';
export { ProfitCalculatorPage } from './components/ProfitCalculatorPage';
export { FibonacciCalculatorPage } from './components/FibonacciCalculatorPage';
export { AiCrmPage } from './components/AiCrmPage';
export { AwardsPage } from './components/AwardsPage';
export type { AwardCardItem } from './components/AwardsPage';
export { MediaPressPage } from './components/MediaPressPage';
export type { MediaPressItem } from './components/MediaPressPage';

// Skeleton building blocks
export {
  Pulse,
  DarkPulse,
  HeroSkeleton,
  CardGridSkeleton,
  TableSkeleton,
  ArticleListSkeleton,
  TabRowSkeleton,
  FormSkeleton,
  CtaBannerSkeleton,
  StatsGridSkeleton,
} from './components/SkeletonBlocks';

// Per-page skeletons
export { TradePageSkeleton } from './components/TradePageSkeleton';
export { FundingPageSkeleton } from './components/FundingPageSkeleton';
export { PromoPageSkeleton } from './components/PromoPageSkeleton';
export { FeesPageSkeleton } from './components/FeesPageSkeleton';
export { IBPageSkeleton } from './components/IBPageSkeleton';
export { MarketPageSkeleton } from './components/MarketPageSkeleton';
export { PlatformPageSkeleton } from './components/PlatformPageSkeleton';
export { EducationHubSkeleton } from './components/EducationHubSkeleton';
export { EbooksSkeleton } from './components/EbooksSkeleton';
export { MediaListingSkeleton } from './components/MediaListingSkeleton';
export { GuidesSkeleton } from './components/GuidesSkeleton';
export { WebinarsSkeleton } from './components/WebinarsSkeleton';
export { ArticleDetailSkeleton } from './components/ArticleDetailSkeleton';
export { ResearchListSkeleton } from './components/ResearchListSkeleton';
export { AnalystChartSkeleton } from './components/AnalystChartSkeleton';
export { ToolsPageSkeleton } from './components/ToolsPageSkeleton';
export { AboutPageSkeleton } from './components/AboutPageSkeleton';
export { AwardsPageSkeleton } from './components/AwardsPageSkeleton';
export { CareersPageSkeleton } from './components/CareersPageSkeleton';
export { MediaPressPageSkeleton } from './components/MediaPressPageSkeleton';
export { SupportPageSkeleton } from './components/SupportPageSkeleton';
export { AiCrmSkeleton } from './components/AiCrmSkeleton';
export { LegalPageSkeleton } from './components/LegalPageSkeleton';
export { ContactPageSkeleton } from './components/ContactPageSkeleton';
export { LiveChatPageSkeleton } from './components/LiveChatPageSkeleton';
export { NewsletterPageSkeleton } from './components/NewsletterPageSkeleton';
export { WatchlistSkeleton } from './components/WatchlistSkeleton';
export { CalendarSkeleton } from './components/CalendarSkeleton';
export { GlossarySkeleton } from './components/GlossarySkeleton';
