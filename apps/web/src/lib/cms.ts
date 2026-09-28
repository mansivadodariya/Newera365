import { cache } from 'react';
import {
  fetchBenzingaNews,
  fetchBenzingaNewsBySlug,
  fetchBenzingaMarketBriefing,
} from './benzinga';
export { fetchBenzingaNews, fetchBenzingaNewsBySlug, fetchBenzingaMarketBriefing };

import {
  STATIC_SITE_SETTINGS,
  STATIC_ACCOUNT_TYPES,
  STATIC_INSTRUMENTS,
  STATIC_PAYMENT_METHODS,
  STATIC_FAQS,
  STATIC_LEGAL_PAGES,
  STATIC_EDUCATION_CONTENT,
  STATIC_AWARDS,
  STATIC_MILESTONES,
  STATIC_CAREERS,
  STATIC_WEBINARS,
  STATIC_ANALYST_CALLS,
  STATIC_MEDIA_PRESS,
  STATIC_PROMOTIONS,
  STATIC_IB_CONTENT,
  STATIC_ARTICLES,
  STATIC_BLOG_POSTS,
  STATIC_MARKET_ANALYSIS,
  STATIC_RESEARCH_REPORTS,
} from '../data';

const rawCmsUrl = (process.env.NEXT_PUBLIC_CMS_URL ?? '').trim().replace(/\/+$/, '');
const CMS_ENABLED = Boolean(
  rawCmsUrl &&
  rawCmsUrl !== '' &&
  rawCmsUrl !== 'disabled' &&
  rawCmsUrl !== 'none' &&
  !rawCmsUrl.includes('localhost:3001'),
);

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
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      [key: string]: any;
    } | null;
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      [key: string]: any;
    } | null;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

export function resolveMediaUrl(raw: string | CmsMedia | number | null | undefined): string | null {
  if (!raw) return null;
  let url = '';
  if (typeof raw === 'string') {
    url = raw;
  } else if (typeof raw === 'object' && raw.url) {
    url = raw.url;
  }
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${CMS_URL}${url}`;
  return `${CMS_URL}/${url}`;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
}

export interface CmsLegalPage {
  id: number;
  title: string;
  slug: string;
  pageType:
    | 'terms'
    | 'client-agreement'
    | 'privacy-policy'
    | 'aml-policy'
    | 'cookie-policy'
    | 'anti-fraud-policy'
    | 'conflicts-of-interest'
    | 'complaint-handling'
    | 'deposit-withdrawal'
    | 'order-execution'
    | 'suspicious-activity-reporting';
  body: SlateNode[];
  effectiveDate: string;
  version?: string | null;
  riskWarningBanner?: string | null;
  status: 'draft' | 'published';
  seoTitle?: string | null;
  seoDescription?: string | null;
  [key: string]: any;
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
    | 'finance'
    | 'research'
    | string;
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
  [key: string]: any;
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
  [key: string]: any;
}

export interface CmsMilestone {
  id: number;
  year: string;
  label: string;
  description?: string | null;
  sortOrder?: number | null;
  status: 'draft' | 'published';
  [key: string]: any;
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
  [key: string]: any;
}

export interface CmsArticle {
  id: number;
  slug: string;
  title: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  editorialCategory?: 'macro' | 'strategy' | 'analysis' | 'education' | null;
  category?: string | null;
  analyst?: string | null;
  publishedDate: string;
  status: 'draft' | 'published';
  thumbnailUrl?: string | null;
  summary?: string | null;
  body?: SlateNode[] | null;
  externalUrl?: string | null;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Site Settings global type
// ---------------------------------------------------------------------------

export interface CmsSiteSettings {
  id?: number | string | null;
  mt5SyncEnabled?: boolean | null;
  mt5RefreshIntervalSecs?: number | null;
  kpiStats?:
    | {
        valueEn: string;
        valueAr: string;
        labelEn: string;
        labelAr: string;
        id?: string | null;
        [key: string]: any;
      }[]
    | null;
  socialProofLogos?:
    | {
        logo: CmsMedia | number;
        altEn?: string | null;
        altAr?: string | null;
        href?: string | null;
        id?: string | null;
        [key: string]: any;
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
        links?:
          | {
              label?: string | null;
              href?: string | null;
              id?: string | null;
              [key: string]: any;
            }[]
          | null;
        id?: string | null;
        [key: string]: any;
      }[]
    | null;
  footerAr?:
    | {
        heading?: string | null;
        links?:
          | {
              label?: string | null;
              href?: string | null;
              id?: string | null;
              [key: string]: any;
            }[]
          | null;
        id?: string | null;
        [key: string]: any;
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
        [key: string]: any;
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
        [key: string]: any;
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
        [key: string]: any;
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
        [key: string]: any;
      }[]
    | null;
  // Page stat callouts
  aboutManifestoStatValue?: string | null;
  fundingWithdrawalStatValue?: string | null;
  supportPromiseStats?:
    | {
        valueEn: string;
        valueAr: string;
        labelEn: string;
        labelAr: string;
        id?: string | null;
        [key: string]: any;
      }[]
    | null;
  webTraderSpecs?:
    | {
        valueEn: string;
        valueAr: string;
        labelEn: string;
        labelAr: string;
        id?: string | null;
        [key: string]: any;
      }[]
    | null;
  [key: string]: any;
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
  logo?: CmsMedia | number | null;
  status: 'active' | 'inactive';
  sortOrder?: number | null;
  [key: string]: any;
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
  steps?:
    | {
        stepTitle?: string | null;
        stepDescription?: string | null;
        id?: string | null;
        [key: string]: any;
      }[]
    | null;
  ctaHeading?: string | null;
  ctaSubtitle?: string | null;
  status: 'draft' | 'published';
  [key: string]: any;
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
  [key: string]: any;
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

// In-memory cache + in-flight request deduplication + failure circuit breaker
// Prevents redundant requests and cascading timeouts during static builds and SSR.
interface MemoryCacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const loggedErrors = new Set<string>();

const CMS_TIMEOUT_MS = 4_000; // 4s timeout (fast failover prevents Vercel build stalls)
const ERROR_CACHE_TTL_MS = 30_000; // Cache failure for 30s to fail-fast across static pages
const SUCCESS_CACHE_TTL_MS = 60_000; // In-memory cache for 60s

async function cachedFetchWithDedupe<T>(
  url: string,
  fetchOptions: RequestInit,
  fallbackValue: T,
  errorLogKey: string,
): Promise<T> {
  if (!CMS_ENABLED) {
    return fallbackValue;
  }

  const now = Date.now();
  const cached = memoryCache.get(url);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const existingInFlight = inFlightRequests.get(url);
  if (existingInFlight) {
    return existingInFlight as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as T;
      memoryCache.set(url, {
        data,
        expiresAt: Date.now() + SUCCESS_CACHE_TTL_MS,
      });
      return data;
    } catch (error) {
      if (!loggedErrors.has(errorLogKey)) {
        loggedErrors.add(errorLogKey);
        console.warn(
          `[cms] Failed to fetch ${errorLogKey}: ${
            error instanceof Error ? error.message : error
          }. Using fallback data.`,
        );
      }
      // Negative cache: prevent subsequent pages during static build from stalling
      memoryCache.set(url, {
        data: fallbackValue,
        expiresAt: Date.now() + ERROR_CACHE_TTL_MS,
      });
      return fallbackValue;
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, fetchPromise);
  return fetchPromise;
}

// locale is passed as a Payload native locale param (?locale=en/ar)
// rather than a where-clause filter — requires native localization in the CMS.
export async function fetchCollection<T>(
  slug: string,
  params: Record<string, string> = {},
  locale?: string,
): Promise<PaginatedResponse<T>> {
  const emptyFallback: PaginatedResponse<T> = {
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  if (!CMS_ENABLED) {
    return emptyFallback;
  }

  const allParams = locale ? { ...params, locale } : params;
  const qs = new URLSearchParams(allParams).toString();
  // Encode the collection segment for defence-in-depth (callers pass literals today).
  const url = `${CMS_URL}/api/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`;

  return cachedFetchWithDedupe<PaginatedResponse<T>>(
    url,
    { next: { revalidate: 60 } } as RequestInit,
    emptyFallback,
    `/${slug}${qs ? `?${qs}` : ''}`,
  );
}

async function fetchGlobal<T>(slug: string): Promise<T | null> {
  if (!CMS_ENABLED) {
    return null;
  }
  const url = `${CMS_URL}/api/globals/${slug}`;
  return cachedFetchWithDedupe<T | null>(
    url,
    { next: { revalidate: 300 } } as RequestInit,
    null,
    `global /${slug}`,
  );
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
  if (data.docs.length > 0) return data.docs;
  let list = STATIC_INSTRUMENTS;
  if (assetClass) list = list.filter((i) => i.assetClass === assetClass);
  return list.slice(0, limit);
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
  return data.docs.length > 0 ? data.docs : STATIC_ACCOUNT_TYPES;
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
  if (data.docs.length > 0) {
    return data.docs.map((a) => {
      const thumbnailUrl = resolveMediaUrl(a.featuredImage);
      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        assetCategory: a.assetCategory,
        editorialCategory: a.editorialCategory ?? null,
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
  return STATIC_ARTICLES.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Site Settings (global — locale-neutral, bilingual fields inside)
// ---------------------------------------------------------------------------

export const getSiteSettings = cache(
  async function getSiteSettings(): Promise<CmsSiteSettings | null> {
    const remote = await fetchGlobal<CmsSiteSettings>('site-settings');
    return remote ?? STATIC_SITE_SETTINGS;
  },
);

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

  if (data.docs.length > 0) {
    return data.docs.map((post) => {
      const thumbnailUrl = resolveMediaUrl(post.featuredImage);
      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
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

  // Supplement with Benzinga feed if available
  const bzArticles = await fetchBenzingaNews(limit);
  if (bzArticles.length > 0) {
    return bzArticles.map((a) => ({
      ...a,
      category: 'tutorials',
    }));
  }

  return STATIC_ARTICLES.slice(0, limit);
}

export async function getBlogPostBySlug(slug: string, locale: string): Promise<CmsBlogPost | null> {
  const cmsDoc = await fetchBySlug<CmsBlogPost>('blog-posts', slug, locale);
  if (cmsDoc) return cmsDoc;

  // Static blog fallback
  const staticPost = STATIC_BLOG_POSTS.find((p) => p.slug === slug);
  if (staticPost) return staticPost;

  // Fallback to Benzinga by slug
  const bzNews = await fetchBenzingaNewsBySlug(slug);
  if (!bzNews) return null;

  return {
    id: bzNews.id,
    title: bzNews.headline,
    slug: bzNews.slug,
    status: 'published',
    publishedDate: bzNews.publishedDate,
    category: 'tutorials',
    author: bzNews.source,
    excerpt: bzNews.seoDescription,
    featuredImage: bzNews.featuredImage,
    body: bzNews.body ?? [],
    seoTitle: bzNews.seoTitle,
    seoDescription: bzNews.seoDescription,
  };
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

function richTextHasContent(nodes?: SlateNode[] | null): boolean {
  if (!Array.isArray(nodes)) return false;
  const hasText = (node: SlateNode): boolean => {
    if (typeof node.text === 'string' && node.text.trim() !== '') return true;
    return Array.isArray(node.children) ? node.children.some(hasText) : false;
  };
  return nodes.some(hasText);
}

export async function getNews(locale: string, limit = 20): Promise<CmsArticle[]> {
  const [data, bzArticles] = await Promise.all([
    fetchCollection<CmsNews>(
      'news',
      {
        'where[status][equals]': 'published',
        sort: '-publishedDate',
        depth: '1',
        limit: String(limit),
      },
      locale,
    ),
    fetchBenzingaNews(limit),
  ]);

  const cmsArticles: CmsArticle[] = data.docs.map((n) => {
    const thumbnailUrl = resolveMediaUrl(n.featuredImage);
    const externalUrl = !richTextHasContent(n.body) && n.sourceUrl ? n.sourceUrl : null;
    return {
      id: n.id,
      slug: n.slug,
      title: n.headline,
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

  if (cmsArticles.length > 0) {
    const existingSlugs = new Set(cmsArticles.map((a) => a.slug));
    const combined = [...cmsArticles];
    for (const bz of bzArticles) {
      if (!existingSlugs.has(bz.slug)) {
        combined.push(bz);
      }
    }
    return combined.slice(0, limit);
  }

  if (bzArticles.length > 0) {
    return bzArticles.slice(0, limit);
  }

  return STATIC_ARTICLES.slice(0, limit);
}

export async function getNewsBySlug(slug: string, locale: string): Promise<CmsNews | null> {
  if (slug.startsWith('bz-') || /^\d+$/.test(slug)) {
    return fetchBenzingaNewsBySlug(slug);
  }
  const cmsDoc = await fetchBySlug<CmsNews>('news', slug, locale);
  if (cmsDoc) return cmsDoc;

  const bz = await fetchBenzingaNewsBySlug(slug);
  if (bz) return bz;

  const staticArt = STATIC_ARTICLES.find((a) => a.slug === slug);
  if (staticArt) {
    return {
      id: staticArt.id,
      headline: staticArt.title,
      slug: staticArt.slug,
      category: (staticArt.category as 'forex') ?? 'forex',
      publishedDate: staticArt.publishedDate,
      status: 'published',
      body: staticArt.body ?? [],
      source: staticArt.analyst,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Market Analysis (detail)
// ---------------------------------------------------------------------------

export async function getMarketAnalysisBySlug(
  slug: string,
  locale: string,
): Promise<CmsMarketAnalysis | null> {
  const doc = await fetchBySlug<CmsMarketAnalysis>('market-analysis', slug, locale);
  if (doc) return doc;
  return STATIC_MARKET_ANALYSIS.find((a) => a.slug === slug) ?? null;
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
  return data.docs.length > 0 ? data.docs : STATIC_AWARDS;
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
  return data.docs.length > 0 ? data.docs : STATIC_MILESTONES;
}

// ---------------------------------------------------------------------------
// Careers
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
  return data.docs.length > 0 ? data.docs : STATIC_CAREERS;
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
  if (data.docs.length > 0) return data.docs;
  let items = STATIC_EDUCATION_CONTENT;
  if (contentType) items = items.filter((c) => c.contentType === contentType);
  return items.slice(0, limit);
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
  const doc = await fetchBySlug<CmsEducationContent>('education-content', slug, locale, {
    'where[contentType][equals]': 'guide',
  });
  if (doc) return doc;
  return STATIC_EDUCATION_CONTENT.find((c) => c.slug === slug && c.contentType === 'guide') ?? null;
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function getFaqs(locale: string): Promise<CmsFaq[]> {
  const isAr = locale === 'ar';
  const data = await fetchCollection<CmsFaq>(
    'faqs',
    {
      'where[status][equals]': 'active',
      sort: 'sortOrder',
      limit: '200',
    },
    locale,
  );
  const source = data.docs.length > 0 ? data.docs : STATIC_FAQS;
  return source
    .map((f) => ({
      ...f,
      question: isAr && f.questionAr ? f.questionAr : f.question,
      answer: isAr && f.answerAr ? f.answerAr : f.answer,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
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
  return data.docs.length > 0 ? data.docs : STATIC_LEGAL_PAGES;
}

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

export const getPaymentMethods = cache(async function getPaymentMethods(
  locale?: string,
): Promise<CmsPaymentMethod[]> {
  const data = await fetchCollection<CmsPaymentMethod>(
    'payment-methods',
    {
      'where[status][equals]': 'active',
      sort: 'sortOrder',
      depth: '1',
      limit: '50',
    },
    locale,
  );
  if (data.docs.length > 0) {
    const seen = new Set<string>();
    return data.docs.filter((item) => {
      const key = (item.name || '').toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return STATIC_PAYMENT_METHODS;
});

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
  return data.docs.length > 0 ? data.docs : STATIC_WEBINARS;
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
  return data.docs.length > 0 ? data.docs : STATIC_RESEARCH_REPORTS;
}

// ---------------------------------------------------------------------------
// IB / Partners page content
// ---------------------------------------------------------------------------

export async function getIBContent(locale: string): Promise<CmsIBContent | null> {
  const data = await fetchCollection<CmsIBContent>(
    'ib-content',
    {
      'where[status][equals]': 'published',
      limit: '1',
    },
    locale,
  );
  return data.docs[0] ?? STATIC_IB_CONTENT;
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export async function getPromotions(locale?: string): Promise<CmsPromotion[]> {
  const isAr = locale === 'ar';
  const data = await fetchCollection<CmsPromotion>(
    'promotions',
    {
      'where[status][equals]': 'active',
      sort: 'sortOrder',
      limit: '50',
    },
    locale,
  );
  const source = data.docs.length > 0 ? data.docs : STATIC_PROMOTIONS;
  return source
    .map((p) => ({
      ...p,
      title: isAr && p.titleAr ? p.titleAr : p.title,
      valueDisplay: isAr && p.valueDisplayAr ? p.valueDisplayAr : p.valueDisplay,
      tag: isAr && p.tagAr ? p.tagAr : p.tag,
      description: isAr && p.descriptionAr ? p.descriptionAr : p.description,
      terms: isAr && p.termsAr ? p.termsAr : p.terms,
      ctaLabel: isAr && p.ctaLabelAr ? p.ctaLabelAr : p.ctaLabel,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
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
  [key: string]: any;
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
  [key: string]: any;
}

export async function getAnalystCalls(): Promise<CmsAnalystCall[]> {
  const data = await fetchCollection<CmsAnalystCall>('analyst-calls', {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: '20',
  });
  return data.docs.length > 0 ? data.docs : STATIC_ANALYST_CALLS;
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
  return data.docs.length > 0 ? data.docs : STATIC_MEDIA_PRESS;
}
