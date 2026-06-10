'use client';

export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant } from './components/Button';

export { SectionKicker } from './components/SectionKicker';

export { ToastProvider, useToast } from './components/ToastProvider';

export { Header } from './components/Header';
export { LanguageToggle } from './components/LanguageToggle';
export { RiskBanner } from './components/RiskBanner';
export { TrustStrip } from './components/TrustStrip';
export type { TrustLogo } from './components/TrustStrip';
export { MobileMenu } from './components/MobileMenu';
export { TickerStrip } from './components/TickerStrip';
export type { TickerItem } from './components/TickerStrip';
export { TradingViewTicker } from './components/TradingViewTicker';
export { Footer } from './components/Footer';
export type { CmsFooterColumn, CmsSocialLinks } from './components/Footer';

export { NewsSection } from './components/NewsSection';
export type { NewsSectionItem } from './components/NewsSection';

export { HeroSection } from './components/HeroSection';
export { StatsSection } from './components/StatsSection';
export type { CmsKpiStat } from './components/StatsSection';
export { CountUp } from './components/CountUp';
export { MarketsSection } from './components/MarketsSection';
export { FeaturesSection } from './components/FeaturesSection';
export { ThreeStepsSection } from './components/ThreeStepsSection';
export { CtaBanner } from './components/CtaBanner';
export { SmartCtaBanner } from './components/SmartCtaBanner';
export { HomePageSkeleton } from './components/HomePageSkeleton';
export { ArbitrageSection } from './components/ArbitrageSection';

export { AccountsPage } from './components/AccountsPage';
export { FundingPage } from './components/FundingPage';
export type { CmsPaymentMethodItem } from './components/FundingPage';
export { FeesPage } from './components/FeesPage';
export type { CmsSpreadRow } from './components/FeesPage';
export { InstrumentsPage } from './components/InstrumentsPage';
export type { InstrumentItem } from './components/InstrumentsPage';
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
export type { CmsTeamMemberItem, CmsAwardItem } from './components/AboutPage';
export { LegalPage } from './components/LegalPage';
export type { CmsLegalDocument } from './components/LegalPage';

export { IBPage } from './components/IBPage';
export type { IBCmsContent } from './components/IBPage';
export { EducationHubPage } from './components/EducationHubPage';
export type { CmsEducationItem } from './components/EducationHubPage';
export { MediaListingPage } from './components/MediaListingPage';
export type { CmsWebinarItem, CmsVideoItem } from './components/MediaListingPage';
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
export type { ArticleDetailData, RelatedInstrument } from './components/ResearchDetailPage';
export { TraderToolsPage } from './components/TraderToolsPage';
export type { CmsCalculatorInstrument } from './components/TraderToolsPage';
export { SpreadComparatorPage } from './components/SpreadComparatorPage';
export type { CmsSpreadInstrument } from './components/SpreadComparatorPage';
export { EconomicCalendarPage } from './components/EconomicCalendarPage';
export { AnalystChartPage } from './components/AnalystChartPage';
export { LiveWatchlistPage } from './components/LiveWatchlistPage';
export { NewsletterPage } from './components/NewsletterPage';
export { LiveChatPage } from './components/LiveChatPage';
export { CareersPage } from './components/CareersPage';
export type { CmsJobItem } from './components/CareersPage';

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
export { MarketPageSkeleton } from './components/MarketPageSkeleton';
export { PlatformPageSkeleton } from './components/PlatformPageSkeleton';
export { EducationHubSkeleton } from './components/EducationHubSkeleton';
export { ArticleDetailSkeleton } from './components/ArticleDetailSkeleton';
export { ResearchListSkeleton } from './components/ResearchListSkeleton';
export { ToolsPageSkeleton } from './components/ToolsPageSkeleton';
export { CompanyPageSkeleton } from './components/CompanyPageSkeleton';
export { SupportPageSkeleton } from './components/SupportPageSkeleton';
export { AiCrmSkeleton } from './components/AiCrmSkeleton';
