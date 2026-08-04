const rawCmsUrl = (process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001')
  .trim()
  .replace(/\/+$/, '');
const CMS_URL = rawCmsUrl
  ? rawCmsUrl.startsWith('http://') || rawCmsUrl.startsWith('https://')
    ? rawCmsUrl
    : `https://${rawCmsUrl}`
  : 'http://localhost:3001';

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
// Collection types — locale/translationKey removed (native Payload localization)
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
  featuredImage?: CmsMedia | number | null;
  body?: SlateNode[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface CmsInstrument {
  id: number;
  name: string;
  symbol: string;
  mt5Symbol?: string | null;
  tvSymbol?: string | null;
  assetClass: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  spread?: number | null;
  leverage?: string | null;
  tradingHours?: string | null;
  minTradeSize?: number | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
  // Specification fields (always present regardless of MT5 toggle)
  contractSize?: number | null;
  pipValue?: number | null;
  tickSize?: number | null;
  marginRequirement?: number | null;
  // Manual overnight swaps (points/day; shown when MT5 sync is off or as published values)
  swapLong?: number | null;
  swapShort?: number | null;
  // Spread comparator fields
  spreadIndustry?: number | null;
  spreadStandard?: number | null;
  spreadRaw?: number | null;
  spreadVip?: number | null;
  // Calculator swap rates (static published rates)
  swapRateLong?: number | null;
  swapRateShort?: number | null;
}

export interface CmsAccountType {
  id: number;
  name: string;
  nameAr?: string | null;
  badge?: 'free' | 'popular' | 'value' | 'pro' | 'islamic' | null;
  minDeposit: number;
  spreadFrom: string;
  spreadFromNumeric?: number | null;
  leverage: string;
  platforms: ('mt5' | 'web-trader' | 'mobile')[];
  commission?: string | null;
  features?: { value: string; id?: string | null }[] | null;
  featuresAr?: string | null;
  isPopular?: boolean | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
}

export interface CmsBlogPost {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate?: string | null;
  createdAt?: string | null;
  category: 'market-news' | 'analysis' | 'tutorials' | 'company-updates';
  author?: string | null;
  excerpt?: string | null;
  featuredImage?: CmsMedia | number | null;
  body: SlateNode[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface CmsMarketAnalysis {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  editorialCategory?: 'macro' | 'strategy' | 'analysis' | 'education' | null;
  analyst?: string | null;
  featuredImage?: CmsMedia | number | null;
  body: SlateNode[];
  chartEmbed?: string | null;
  relatedInstruments?: CmsInstrument[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
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
}

// Resolved variant passed to the UI — reportFile URL already extracted
export interface CmsResearchReportItem {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  publishedDate: string;
  isGated?: boolean | null;
  reportUrl: string | null;
  thumbnailUrl?: string | null;
}

export interface CmsEducationContent {
  id: number;
  title: string;
  slug: string;
  contentType: 'video' | 'audio' | 'ebook' | 'guide' | 'glossary';
  status: 'draft' | 'published';
  isGated?: boolean | null;
  isFeatured?: boolean | null;
  videoEmbed?: string | null;
  audioFile?: CmsMedia | number | null;
  pdfFile?: CmsMedia | number | null;
  glossaryTerm?: string | null;
  alphabeticalIndex?: string | null;
  glossaryCategory?: string | null;
  mediaCategory?: string | null;
  body?: SlateNode[] | null;
  thumbnail?: CmsMedia | number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
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
}

export interface CmsAward {
  id: number;
  title: string;
  slug: string;
  date: string;
  description?: string | null;
  awardCategory?: string | null;
  logo?: CmsMedia | number | null;
  externalUrl?: string | null;
  sortOrder?: number | null;
  status: 'draft' | 'published';
}

export interface CmsMilestone {
  id: number;
  year: string;
  label: string;
  description?: string | null;
  sortOrder?: number | null;
  status: 'draft' | 'published';
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
}

export interface CmsArticle {
  id: number;
  slug: string;
  title: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  editorialCategory?: 'macro' | 'strategy' | 'analysis' | 'education' | null;
  /** Raw CMS category — drives data-driven, case-insensitive filter tabs. */
  category?: string | null;
  analyst?: string | null;
  publishedDate: string;
  status: 'draft' | 'published';
  thumbnailUrl?: string | null;
  summary?: string | null;
  /** Rich-text body — carried so listings can compute a real reading time. */
  body?: SlateNode[] | null;
  /** When set, the listing card links to this external URL instead of an internal detail page. */
  externalUrl?: string | null;
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
  whatsappNumber?: string | null;
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
  analystInitials?: string | null;
  analystName?: string | null;
  analystTitle?: string | null;
  analystUpdated?: string | null;
  analystCommentaryEn?: string | null;
  analystCommentaryAr?: string | null;
  // Social proof (client feedback #5)
  socialProofHeadlineEn?: string | null;
  socialProofHeadlineAr?: string | null;
  ratingValue?: string | null;
  ratingCountEn?: string | null;
  ratingCountAr?: string | null;
  testimonials?:
    | {
        quoteEn: string;
        quoteAr: string;
        authorName: string;
        authorRoleEn?: string | null;
        authorRoleAr?: string | null;
        rating?: number | null;
        avatarUrl?: string | null;
        id?: string | null;
      }[]
    | null;
  // Footer company & regulation (client feedback #6)
  regulatoryDisclosureEn?: string | null;
  regulatoryDisclosureAr?: string | null;
  companyRegistrationEn?: string | null;
  companyRegistrationAr?: string | null;
  // Homepage USP metrics ("Why Newera" band)
  uspMetrics?:
    | {
        valueEn: string;
        valueAr: string;
        titleEn: string;
        titleAr: string;
        descEn: string;
        descAr: string;
        id?: string | null;
      }[]
    | null;
  // Partners / infrastructure wall
  partners?:
    | {
        groupKey: string;
        name: string;
        logoType?: string | null;
        logoFilename?: string | null;
        id?: string | null;
      }[]
    | null;
  // Homepage newsletter teaser (Monday Briefing) — feedback #19
  nlHeadlineEn?: string | null;
  nlHeadlineAr?: string | null;
  nlHeadlineAccentEn?: string | null;
  nlHeadlineAccentAr?: string | null;
  nlSubtitleEn?: string | null;
  nlSubtitleAr?: string | null;
  nlMetricValue?: string | null;
  nlMetricLabelEn?: string | null;
  nlMetricLabelAr?: string | null;
  nlIssueMetaEn?: string | null;
  nlIssueMetaAr?: string | null;
  nlLeadHeadlineEn?: string | null;
  nlLeadHeadlineAr?: string | null;
  nlFxHeadEn?: string | null;
  nlFxHeadAr?: string | null;
  nlCmdHeadEn?: string | null;
  nlCmdHeadAr?: string | null;
  nlMacroHeadEn?: string | null;
  nlMacroHeadAr?: string | null;
  nlCategories?:
    | {
        cadenceEn?: string | null;
        cadenceAr?: string | null;
        titleEn?: string | null;
        titleAr?: string | null;
        descEn?: string | null;
        descAr?: string | null;
        id?: string | null;
      }[]
    | null;
  // Page stat callouts
  aboutManifestoStatValue?: string | null;
  fundingWithdrawalStatValue?: string | null;
  supportPromiseStats?:
    | { valueEn: string; valueAr: string; labelEn: string; labelAr: string; id?: string | null }[]
    | null;
  webTraderSpecs?:
    | { valueEn: string; valueAr: string; labelEn: string; labelAr: string; id?: string | null }[]
    | null;
}

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

export interface CmsPaymentMethod {
  id: number;
  name: string;
  nameAr?: string | null;
  methodType: 'card' | 'bank' | 'ewallet' | 'crypto' | 'local';
  depositTime?: string | null;
  withdrawalTime?: string | null;
  minDeposit?: string | null;
  fee?: string | null;
  notes?: string | null;
  // Banner-style brand image (480×300) shown on the desktop card. Optional —
  // the funding page falls back to a bundled static cover when unset.
  logo?: CmsMedia | number | null;
  status: 'active' | 'inactive';
  sortOrder?: number | null;
}

// ---------------------------------------------------------------------------
// IB / Partners page content
// ---------------------------------------------------------------------------

export interface CmsIBContent {
  id: number;
  slug: string;
  heroSubtitle?: string | null;
  ibDescription?: string | null;
  affiliateDescription?: string | null;
  whiteLabelDescription?: string | null;
  ibTag?: string | null;
  ibRateDisplay?: string | null;
  ibPayoutsFrequency?: string | null;
  ibMinimum?: string | null;
  affiliateTag?: string | null;
  affiliateCpaMax?: string | null;
  affiliateCookieDays?: string | null;
  affiliateMinCpa?: string | null;
  wlTag?: string | null;
  wlSetupTime?: string | null;
  wlSpreadMarkup?: string | null;
  wlTechStack?: string | null;
  heroStat1Value?: string | null;
  heroStat2Value?: string | null;
  heroStat3Value?: string | null;
  heroStat4Value?: string | null;
  incomeLadder?:
    | {
        balanceLabel: string;
        minBalance: number;
        incomeValue: string;
        isTopSlab?: boolean | null;
        id?: string | null;
      }[]
    | null;
  rebateTables?:
    | {
        instrumentNameEn: string;
        instrumentNameAr: string;
        rows?: { spread: string; commission: string; rebate: string; id?: string | null }[] | null;
        id?: string | null;
      }[]
    | null;
  ftdCap?: string | null;
  ftdMinLots?: string | null;
  steps?: { stepTitle: string; stepDescription: string; id?: string | null }[] | null;
  ctaHeading?: string | null;
  ctaSubtitle?: string | null;
  status: 'draft' | 'published';
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export interface CmsPromotion {
  id: number;
  slug: string;
  title: string;
  valueDisplay?: string | null;
  tag?: string | null;
  tagColor?: string | null;
  description?: string | null;
  terms?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isHighlighted?: boolean | null;
  sortOrder?: number | null;
  activeFrom?: string | null;
  activeTo?: string | null;
  status: 'active' | 'inactive';
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

// locale is passed as a Payload native locale param (?locale=en/ar)
// rather than a where-clause filter — requires native localization in the CMS.
export async function fetchCollection<T>(
  slug: string,
  params: Record<string, string> = {},
  locale?: string,
): Promise<PaginatedResponse<T>> {
  const allParams = locale ? { ...params, locale } : params;
  const qs = new URLSearchParams(allParams).toString();
  // Encode the collection segment for defence-in-depth (callers pass literals today).
  const url = `${CMS_URL}/api/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`;
  try {
    // 8s timeout so a hung CMS (Neon cold start / outage) can't stall SSR forever (NE WR-8).
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8_000),
    } as RequestInit);
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
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });
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
  const data = await fetchCollection<T>(
    collection,
    {
      'where[slug][equals]': slug,
      depth: '1',
      limit: '1',
      ...extraParams,
    },
    locale,
  );
  return data.docs[0] ?? null;
}

// Humanize a slug into a Title Case string. Used as a metadata fallback on
// detail routes: when the CMS has no matching document the page still renders
// generic fallback content, so a slug-derived <title> is more useful for SEO
// and sharing than the bare site default. e.g. "ecb-rate-decision" → "Ecb Rate Decision".
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Products / Instruments
// ---------------------------------------------------------------------------

export async function getInstruments(
  assetClass?: string,
  limit = 50,
  locale?: string,
): Promise<CmsInstrument[]> {
  const params: Record<string, string> = {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: String(limit),
  };
  if (assetClass) params['where[assetClass][equals]'] = assetClass;
  const data = await fetchCollection<CmsInstrument>('products-instruments', params, locale);
  return data.docs;
}

// ---------------------------------------------------------------------------
// Account Types (language-neutral — no locale param)
// ---------------------------------------------------------------------------

export async function getAccountTypes(locale?: string): Promise<CmsAccountType[]> {
  const data = await fetchCollection<CmsAccountType>(
    'account-types',
    {
      'where[status][equals]': 'active',
      sort: 'sortOrder',
      limit: '10',
    },
    locale,
  );
  return data.docs;
}

// ---------------------------------------------------------------------------
// Market Analysis
// ---------------------------------------------------------------------------

export async function getResearchArticles(locale: string, limit = 10): Promise<CmsArticle[]> {
  const data = await fetchCollection<CmsMarketAnalysis>(
    'market-analysis',
    {
      'where[status][equals]': 'published',
      sort: '-publishedDate',
      depth: '1',
      limit: String(limit),
    },
    locale,
  );
  return data.docs.map((a) => {
    const img = a.featuredImage;
    const thumbnailUrl = img && typeof img !== 'number' ? ((img as CmsMedia).url ?? null) : null;
    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      assetCategory: a.assetCategory,
      editorialCategory: a.editorialCategory ?? null,
      // Research filter tabs key off editorialCategory, falling back to asset class.
      category: a.editorialCategory ?? a.assetCategory,
      analyst: a.analyst ?? null,
      publishedDate: a.publishedDate,
      status: a.status,
      thumbnailUrl,
      summary: null,
      body: a.body ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Site Settings (global — locale-neutral, bilingual fields inside)
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<CmsSiteSettings | null> {
  return fetchGlobal<CmsSiteSettings>('site-settings');
}

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export async function getBlogPosts(locale: string, limit = 10): Promise<CmsArticle[]> {
  const data = await fetchCollection<CmsBlogPost>(
    'blog-posts',
    {
      'where[status][equals]': 'published',
      sort: '-publishedDate',
      depth: '1',
      limit: String(limit),
    },
    locale,
  );
  return data.docs.map((post) => {
    const img = post.featuredImage;
    const thumbnailUrl = img && typeof img !== 'number' ? ((img as CmsMedia).url ?? null) : null;
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      // Blog posts have no asset class; tabs use the real CMS `category` below.
      assetCategory: 'forex',
      category: post.category,
      analyst: post.author ?? null,
      publishedDate: post.publishedDate ?? post.createdAt ?? '',
      status: post.status,
      thumbnailUrl,
      summary: post.excerpt ?? null,
      body: post.body ?? null,
    };
  });
}

export async function getBlogPostBySlug(slug: string, locale: string): Promise<CmsBlogPost | null> {
  return fetchBySlug<CmsBlogPost>('blog-posts', slug, locale);
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

// True when a Slate richtext value contains at least one non-empty text node.
// An "empty" Payload richText field still serializes as a single blank paragraph,
// so a plain length check would report false positives.
function richTextHasContent(nodes?: SlateNode[] | null): boolean {
  if (!Array.isArray(nodes)) return false;
  const hasText = (node: SlateNode): boolean => {
    if (typeof node.text === 'string' && node.text.trim() !== '') return true;
    return Array.isArray(node.children) ? node.children.some(hasText) : false;
  };
  return nodes.some(hasText);
}

export async function getNews(locale: string, limit = 20): Promise<CmsArticle[]> {
  const data = await fetchCollection<CmsNews>(
    'news',
    {
      'where[status][equals]': 'published',
      sort: '-publishedDate',
      depth: '1',
      limit: String(limit),
    },
    locale,
  );
  return data.docs.map((n) => {
    const img = n.featuredImage;
    const thumbnailUrl = img && typeof img !== 'number' ? ((img as CmsMedia).url ?? null) : null;
    // Body-less news items are pointers to an external story — link the card
    // straight to the source instead of an internal page with placeholder prose.
    const externalUrl = !richTextHasContent(n.body) && n.sourceUrl ? n.sourceUrl : null;
    return {
      id: n.id,
      slug: n.slug,
      title: n.headline,
      // News has no asset class; the filter tabs use the real CMS `category` below.
      assetCategory: 'forex',
      category: n.category,
      analyst: n.source ?? null,
      publishedDate: n.publishedDate,
      status: n.status,
      thumbnailUrl,
      summary: null,
      body: n.body ?? null,
      externalUrl,
    };
  });
}

export async function getNewsBySlug(slug: string, locale: string): Promise<CmsNews | null> {
  return fetchBySlug<CmsNews>('news', slug, locale);
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
// Awards
// ---------------------------------------------------------------------------

export async function getAwards(locale: string): Promise<CmsAward[]> {
  const data = await fetchCollection<CmsAward>(
    'awards',
    {
      'where[status][equals]': 'published',
      sort: 'sortOrder',
      limit: '20',
    },
    locale,
  );
  return data.docs;
}

export async function getMilestones(locale: string): Promise<CmsMilestone[]> {
  const data = await fetchCollection<CmsMilestone>(
    'company-milestones',
    {
      'where[status][equals]': 'published',
      sort: 'sortOrder',
      limit: '50',
    },
    locale,
  );
  return data.docs;
}

// ---------------------------------------------------------------------------
// Careers — status is 'open'/'closed' (not 'active')
// ---------------------------------------------------------------------------

export async function getCareers(locale?: string): Promise<CmsCareer[]> {
  const data = await fetchCollection<CmsCareer>(
    'careers',
    {
      'where[status][equals]': 'open',
      sort: 'sortOrder,title',
      limit: '100',
    },
    locale,
  );
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
  const data = await fetchCollection<CmsEducationContent>('education-content', params, locale);
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
  const data = await fetchCollection<CmsFaq>(
    'faqs',
    {
      'where[status][equals]': 'active',
      sort: 'sortOrder',
      limit: '200',
    },
    locale,
  );
  return data.docs;
}

// ---------------------------------------------------------------------------
// Legal Pages
// ---------------------------------------------------------------------------

export async function getLegalPages(locale: string): Promise<CmsLegalPage[]> {
  const data = await fetchCollection<CmsLegalPage>(
    'legal-pages',
    {
      'where[status][equals]': 'published',
      sort: 'pageType',
      limit: '20',
    },
    locale,
  );
  return data.docs;
}

// ---------------------------------------------------------------------------
// Payment Methods — locale-aware after localized fields were added
// ---------------------------------------------------------------------------

export async function getPaymentMethods(locale?: string): Promise<CmsPaymentMethod[]> {
  const data = await fetchCollection<CmsPaymentMethod>(
    'payment-methods',
    {
      'where[status][equals]': 'active',
      sort: 'sortOrder',
      // depth 1 so the `logo` upload resolves to a media object with `.url`
      // (the funding page maps it onto the desktop cover banner).
      depth: '1',
      limit: '50',
    },
    locale,
  );
  return data.docs;
}

// ---------------------------------------------------------------------------
// Webinars
// ---------------------------------------------------------------------------

export async function getWebinars(locale?: string, status?: string): Promise<CmsWebinar[]> {
  const params: Record<string, string> = {
    sort: '-scheduledAt',
    limit: '50',
  };
  if (status) {
    params['where[status][equals]'] = status;
  } else {
    params['where[status][not_equals]'] = 'cancelled';
  }
  const data = await fetchCollection<CmsWebinar>('webinars', params, locale);
  return data.docs;
}

// ---------------------------------------------------------------------------
// Research Reports
// ---------------------------------------------------------------------------

export async function getResearchReports(locale?: string): Promise<CmsResearchReport[]> {
  const data = await fetchCollection<CmsResearchReport>(
    'research-reports',
    {
      'where[status][equals]': 'published',
      sort: '-publishedDate',
      depth: '1',
      limit: '20',
    },
    locale,
  );
  return data.docs;
}

// ---------------------------------------------------------------------------
// IB / Partners page content
// ---------------------------------------------------------------------------

export async function getIBContent(locale: string): Promise<CmsIBContent | null> {
  // Fetch the first published IB content document — no slug hardcoding.
  const data = await fetchCollection<CmsIBContent>(
    'ib-content',
    {
      'where[status][equals]': 'published',
      limit: '1',
    },
    locale,
  );
  return data.docs[0] ?? null;
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export async function getPromotions(locale?: string): Promise<CmsPromotion[]> {
  const now = new Date().toISOString();
  const data = await fetchCollection<CmsPromotion>(
    'promotions',
    {
      'where[and][0][status][equals]': 'active',
      // activeTo is null (evergreen) OR activeTo >= now
      'where[and][1][or][0][activeTo][exists]': 'false',
      'where[and][1][or][1][activeTo][greater_than_equal]': now,
      // activeFrom is null (evergreen) OR activeFrom <= now
      'where[and][2][or][0][activeFrom][exists]': 'false',
      'where[and][2][or][1][activeFrom][less_than_equal]': now,
      sort: 'sortOrder',
      limit: '50',
    },
    locale,
  );
  // Sort by offer-end date ascending; evergreen promos (no activeTo) sort last.
  return [...data.docs].sort((a, b) => {
    const ta = a.activeTo ? new Date(a.activeTo).getTime() : Infinity;
    const tb = b.activeTo ? new Date(b.activeTo).getTime() : Infinity;
    return ta - tb;
  });
}

// ---------------------------------------------------------------------------
// Media & Press
// ---------------------------------------------------------------------------

export interface CmsMediaPressItem {
  id: number;
  headline: string;
  publication: string;
  publicationAr?: string | null;
  date: string;
  url?: string | null;
  excerpt?: string | null;
  logo?: CmsMedia | number | null;
  isFeatured?: boolean | null;
  sortOrder?: number | null;
  status: 'published' | 'draft';
}

// ---------------------------------------------------------------------------
// Analyst Calls
// ---------------------------------------------------------------------------

export interface CmsAnalystCall {
  id: number;
  symbol: string;
  tvSymbol: string;
  currentPrice: string;
  targetPrice: string;
  confidence: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  category: 'Majors' | 'Crosses' | 'Commodities' | 'Crypto';
  sparkPoints?: string | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
}

export async function getAnalystCalls(): Promise<CmsAnalystCall[]> {
  const data = await fetchCollection<CmsAnalystCall>('analyst-calls', {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: '20',
  });
  return data.docs;
}

export async function getMediaPressItems(locale: string): Promise<CmsMediaPressItem[]> {
  const data = await fetchCollection<CmsMediaPressItem>(
    'media-press',
    {
      'where[status][equals]': 'published',
      sort: 'sortOrder',
      depth: '1',
      limit: '100',
    },
    locale,
  );
  return data.docs;
}
