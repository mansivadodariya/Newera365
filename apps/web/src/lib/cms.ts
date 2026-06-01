const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Slate richtext node shape (matches Payload v2 Slate editor output)
// ---------------------------------------------------------------------------

export interface SlateNode {
  type?: string;
  children?: SlateNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  newTab?: boolean;
  value?: { url?: string; alt?: string; width?: number; height?: number };
  relationTo?: string;
}

// ---------------------------------------------------------------------------
// Media type (resolved at depth=1)
// ---------------------------------------------------------------------------

export interface CmsMedia {
  id: number;
  url: string;
  alt?: string | null;
  filename: string;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  sizes?: {
    thumbnail?: { url?: string | null; width?: number | null; height?: number | null } | null;
    card?: { url?: string | null; width?: number | null; height?: number | null } | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Existing collection types
// ---------------------------------------------------------------------------

export interface CmsNews {
  id: number;
  headline: string;
  slug: string;
  source?: string | null;
  sourceUrl?: string | null;
  publishedDate: string;
  category: 'forex' | 'commodities' | 'indices' | 'crypto' | 'company' | 'regulation';
  status: 'draft' | 'published';
  locale: 'en' | 'ar';
}

export interface CmsInstrument {
  id: number;
  name: string;
  symbol: string;
  mt5Symbol?: string | null;
  assetClass: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  spread?: number | null;
  leverage?: string | null;
  tradingHours?: string | null;
  minTradeSize?: number | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
}

export interface CmsAccountType {
  id: number;
  name: string;
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  platforms: ('mt5' | 'web-trader' | 'mobile')[];
  commission?: string | null;
  features?: { value: string; id?: string | null }[] | null;
  isPopular?: boolean | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
}

// ---------------------------------------------------------------------------
// New collection types
// ---------------------------------------------------------------------------

export interface CmsBlogPost {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate?: string | null;
  category: 'market-news' | 'analysis' | 'tutorials' | 'company-updates';
  author?: string | null;
  excerpt?: string | null;
  featuredImage?: CmsMedia | number | null;
  body: SlateNode[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsMarketAnalysis {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  analyst?: string | null;
  body: SlateNode[];
  chartEmbed?: string | null;
  relatedInstruments?: (CmsInstrument | number)[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsResearchReport {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate: string;
  summary?: string | null;
  reportFile: CmsMedia | number;
  thumbnail?: CmsMedia | number | null;
  isGated?: boolean | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsEducationContent {
  id: number;
  title: string;
  slug: string;
  contentType: 'video' | 'audio' | 'ebook' | 'guide' | 'glossary';
  status: 'draft' | 'published';
  isGated?: boolean | null;
  videoEmbed?: string | null;
  audioFile?: CmsMedia | number | null;
  pdfFile?: CmsMedia | number | null;
  glossaryTerm?: string | null;
  alphabeticalIndex?: string | null;
  body?: SlateNode[] | null;
  thumbnail?: CmsMedia | number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsFaq {
  id: number;
  question: string;
  answer: SlateNode[];
  category:
    | 'trading'
    | 'accounts'
    | 'deposits'
    | 'withdrawals'
    | 'platforms'
    | 'regulation'
    | 'general';
  sortOrder?: number | null;
  status: 'active' | 'inactive';
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsLegalPage {
  id: number;
  title: string;
  slug: string;
  pageType: 'terms' | 'privacy-policy' | 'risk-disclosure' | 'aml-policy' | 'cookie-policy';
  body: SlateNode[];
  effectiveDate: string;
  version?: string | null;
  riskWarningBanner?: string | null;
  status: 'draft' | 'published';
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsCareer {
  id: number;
  title: string;
  slug: string;
  department:
    | 'engineering'
    | 'design'
    | 'marketing'
    | 'sales'
    | 'operations'
    | 'compliance'
    | 'support'
    | 'finance';
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  summary?: string | null;
  body: SlateNode[];
  applyUrl?: string | null;
  publishedDate: string;
  sortOrder?: number | null;
  status: 'open' | 'closed';
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsTeamMember {
  id: number;
  name: string;
  slug: string;
  role: string;
  bio?: string | null;
  photo?: CmsMedia | number | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsAward {
  id: number;
  title: string;
  slug: string;
  date: string;
  description?: string | null;
  logo?: CmsMedia | number | null;
  externalUrl?: string | null;
  sortOrder?: number | null;
  status: 'draft' | 'published';
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

export interface CmsWebinar {
  id: number;
  title: string;
  slug: string;
  speaker: string;
  speakerBio?: string | null;
  scheduledAt: string;
  timezone?: string | null;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  zoomRegistrationLink?: string | null;
  zoomWebinarId?: string | null;
  replayUrl?: string | null;
  thumbnail?: CmsMedia | number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationKey?: string | null;
  locale: 'en' | 'ar';
}

// ---------------------------------------------------------------------------
// Site Settings global type
// ---------------------------------------------------------------------------

export interface CmsSiteSettings {
  mt5SyncEnabled?: boolean | null;
  mt5RefreshIntervalSecs?: number | null;
  kpiStats?:
    | {
        valueEn: string;
        valueAr: string;
        labelEn: string;
        labelAr: string;
        id?: string | null;
      }[]
    | null;
  socialProofLogos?:
    | {
        logo: CmsMedia | number;
        altEn?: string | null;
        altAr?: string | null;
        href?: string | null;
        id?: string | null;
      }[]
    | null;
  downloadMt5Windows?: string | null;
  downloadMt5Mac?: string | null;
  downloadMt5Ios?: string | null;
  downloadMt5Android?: string | null;
  downloadWebTrader?: string | null;
  contactEmail?: string | null;
  contactEmailCompliance?: string | null;
  contactPhone?: string | null;
  contactAddressEn?: string | null;
  contactAddressAr?: string | null;
  supportHoursEn?: string | null;
  supportHoursAr?: string | null;
  socialFacebook?: string | null;
  socialX?: string | null;
  socialLinkedIn?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  socialTelegram?: string | null;
  socialTiktok?: string | null;
  riskBannerEnabled?: boolean | null;
  riskBannerEn?: string | null;
  riskBannerAr?: string | null;
  navEn?: { label: string; href: string; id?: string | null }[] | null;
  navAr?: { label: string; href: string; id?: string | null }[] | null;
  footerEn?:
    | {
        heading?: string | null;
        links?: { label?: string | null; href?: string | null; id?: string | null }[] | null;
        id?: string | null;
      }[]
    | null;
  footerAr?:
    | {
        heading?: string | null;
        links?: { label?: string | null; href?: string | null; id?: string | null }[] | null;
        id?: string | null;
      }[]
    | null;
  riskDisclaimerEn?: string | null;
  riskDisclaimerAr?: string | null;
}

// ---------------------------------------------------------------------------
// Generic fetch helpers
// ---------------------------------------------------------------------------

interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

async function fetchCollection<T>(
  slug: string,
  params: Record<string, string> = {},
): Promise<PaginatedResponse<T>> {
  const qs = new URLSearchParams(params).toString();
  const url = `${CMS_URL}/api/${slug}${qs ? `?${qs}` : ''}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } } as RequestInit);
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch (error) {
    console.error(
      `[cms] Failed to fetch /${slug}:`,
      error instanceof Error ? error.message : error,
    );
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

async function fetchGlobal<T>(slug: string): Promise<T | null> {
  const url = `${CMS_URL}/api/globals/${slug}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch (error) {
    console.error(
      `[cms] Failed to fetch global /${slug}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function fetchBySlug<T>(
  collection: string,
  slug: string,
  locale: string,
  extraParams: Record<string, string> = {},
): Promise<T | null> {
  const data = await fetchCollection<T>(collection, {
    'where[slug][equals]': slug,
    'where[locale][equals]': locale,
    depth: '1',
    limit: '1',
    ...extraParams,
  });
  return data.docs[0] ?? null;
}

// ---------------------------------------------------------------------------
// News (existing)
// ---------------------------------------------------------------------------

export async function getLatestNews(locale: string, limit = 4): Promise<CmsNews[]> {
  const data = await fetchCollection<CmsNews>('news', {
    'where[status][equals]': 'published',
    'where[locale][equals]': locale,
    sort: '-publishedDate',
    limit: String(limit),
  });
  return data.docs;
}

// ---------------------------------------------------------------------------
// Products / Instruments (existing)
// ---------------------------------------------------------------------------

export async function getInstruments(assetClass?: string, limit = 50): Promise<CmsInstrument[]> {
  const params: Record<string, string> = {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: String(limit),
  };
  if (assetClass) params['where[assetClass][equals]'] = assetClass;
  const data = await fetchCollection<CmsInstrument>('products-instruments', params);
  return data.docs;
}

// ---------------------------------------------------------------------------
// Account Types (existing — was defined but unused)
// ---------------------------------------------------------------------------

export async function getAccountTypes(): Promise<CmsAccountType[]> {
  const data = await fetchCollection<CmsAccountType>('account-types', {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
  });
  return data.docs;
}

export interface CmsArticle {
  id: number;
  slug: string;
  title: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  analyst?: string | null;
  publishedDate: string;
  locale: 'en' | 'ar';
  status: 'draft' | 'published';
}

export async function getResearchArticles(locale: string, limit = 10): Promise<CmsArticle[]> {
  const data = await fetchCollection<CmsArticle>('market-analysis', {
    'where[status][equals]': 'published',
    'where[locale][equals]': locale,
    sort: '-publishedDate',
    limit: String(limit),
  });
  return data.docs;
}

// ---------------------------------------------------------------------------
// Site Settings (global)
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<CmsSiteSettings | null> {
  return fetchGlobal<CmsSiteSettings>('site-settings');
}

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export async function getBlogPostBySlug(slug: string, locale: string): Promise<CmsBlogPost | null> {
  return fetchBySlug<CmsBlogPost>('blog-posts', slug, locale);
}

// ---------------------------------------------------------------------------
// Market Analysis (detail)
// ---------------------------------------------------------------------------

export async function getMarketAnalysisBySlug(
  slug: string,
  locale: string,
): Promise<CmsMarketAnalysis | null> {
  return fetchBySlug<CmsMarketAnalysis>('market-analysis', slug, locale);
}

// ---------------------------------------------------------------------------
// Team Members & Awards
// ---------------------------------------------------------------------------

export async function getTeamMembers(locale: string): Promise<CmsTeamMember[]> {
  const data = await fetchCollection<CmsTeamMember>('team-members', {
    'where[status][equals]': 'active',
    'where[locale][equals]': locale,
    sort: 'sortOrder',
    limit: '50',
  });
  return data.docs;
}

export async function getAwards(locale: string): Promise<CmsAward[]> {
  const data = await fetchCollection<CmsAward>('company-content', {
    'where[contentType][equals]': 'award',
    'where[locale][equals]': locale,
    sort: 'sortOrder',
    limit: '20',
  });
  return data.docs;
}

// ---------------------------------------------------------------------------
// Careers
// ---------------------------------------------------------------------------

export async function getCareers(locale?: string): Promise<CmsCareer[]> {
  const params: Record<string, string> = {
    'where[status][equals]': 'active',
    sort: 'department,title',
    limit: '100',
  };
  if (locale) params['where[locale][equals]'] = locale;
  const data = await fetchCollection<CmsCareer>('careers', params);
  return data.docs;
}

// ---------------------------------------------------------------------------
// Education Content
// ---------------------------------------------------------------------------

export async function getEducationContent(
  contentType?: string,
  locale?: string,
  limit = 50,
): Promise<CmsEducationContent[]> {
  const params: Record<string, string> = {
    'where[status][equals]': 'published',
    sort: '-updatedAt',
    limit: String(limit),
  };
  if (contentType) params['where[contentType][equals]'] = contentType;
  if (locale) params['where[locale][equals]'] = locale;
  const data = await fetchCollection<CmsEducationContent>('education-content', params);
  return data.docs;
}

export async function getGlossaryTerms(locale: string): Promise<CmsEducationContent[]> {
  return getEducationContent('glossary', locale, 500);
}

export async function getGuides(locale: string): Promise<CmsEducationContent[]> {
  return getEducationContent('guide', locale, 100);
}

export async function getGuideBySlug(
  slug: string,
  locale: string,
): Promise<CmsEducationContent | null> {
  return fetchBySlug<CmsEducationContent>('education-content', slug, locale, {
    'where[contentType][equals]': 'guide',
  });
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function getFaqs(locale: string): Promise<CmsFaq[]> {
  const data = await fetchCollection<CmsFaq>('faqs', {
    'where[status][equals]': 'active',
    'where[locale][equals]': locale,
    sort: 'sortOrder',
    limit: '200',
  });
  return data.docs;
}

// ---------------------------------------------------------------------------
// Legal Pages
// ---------------------------------------------------------------------------

export async function getLegalPages(locale: string): Promise<CmsLegalPage[]> {
  const data = await fetchCollection<CmsLegalPage>('legal-pages', {
    'where[status][equals]': 'published',
    'where[locale][equals]': locale,
    sort: 'sortOrder',
    limit: '20',
  });
  return data.docs;
}

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

export interface CmsPaymentMethod {
  id: number;
  name: string;
  methodType: 'card' | 'bank-transfer' | 'e-wallet' | 'crypto';
  depositTime: string;
  withdrawalTime: string;
  minDeposit?: string | null;
  fee?: string | null;
  notes?: string | null;
  status: 'active' | 'inactive';
  sortOrder?: number | null;
}

export async function getPaymentMethods(): Promise<CmsPaymentMethod[]> {
  const data = await fetchCollection<CmsPaymentMethod>('payment-methods', {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: '50',
  });
  return data.docs;
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export interface CmsPromotion {
  id: number;
  slug: string;
  title: string;
  tag?: string | null;
  tagColor?: string | null;
  description?: string | null;
  terms?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isHighlighted?: boolean | null;
  status: 'active' | 'inactive';
  locale: 'en' | 'ar';
}

export async function getPromotions(locale?: string): Promise<CmsPromotion[]> {
  const params: Record<string, string> = {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: '50',
  };
  if (locale) params['where[locale][equals]'] = locale;
  const data = await fetchCollection<CmsPromotion>('promotions', params);
  return data.docs;
}
