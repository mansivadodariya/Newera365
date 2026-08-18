'use client';

import Link from 'next/link';
import { useState, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { Pagination } from '../primitives/Pagination';
import { ScrollReveal } from '../motion/ScrollReveal';
import { norm, humanize, distinctCategories } from '../../lib/filterUtils';
import { readingMinutes } from '../primitives/RichText';
import type { SlateNode } from '../primitives/RichText';

const RESEARCH_PER_PAGE = 6;

export interface ArticleItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readTime?: string;
  featured?: boolean;
  sparkline?: readonly number[];
}

interface CmsResearchArticle {
  id: number;
  slug: string;
  title: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  editorialCategory?: 'macro' | 'strategy' | 'analysis' | 'education' | null;
  /** Raw CMS category — filter tabs are derived from this, case-insensitively. */
  category?: string | null;
  analyst?: string | null;
  publishedDate: string;
  thumbnailUrl?: string | null;
  summary?: string | null;
  /** Rich-text body — used to compute a real reading time for the card. */
  body?: SlateNode[] | null;
  /** When set, the card links to this external URL instead of an internal detail page. */
  externalUrl?: string | null;
}

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

const SPARKLINES = [
  [40, 45, 38, 52, 48, 60, 55, 68, 62, 72],
  [60, 55, 70, 45, 65, 40, 58, 35, 50, 42],
  [30, 38, 45, 55, 62, 58, 70, 75, 68, 80],
  [65, 60, 70, 65, 72, 68, 75, 70, 78, 74],
] as const;

function formatArticleDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CAT_COLORS: Record<string, string> = {
  macro: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  strategy: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  analysis: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  education: 'bg-accent/10 text-accent',
  forex: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  commodities: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  indices: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  stocks: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  etfs: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  crypto: 'bg-[#06B6D4]/15 text-[#06B6D4]',
  'market-news': 'bg-[#F59E0B]/15 text-[#F59E0B]',
  tutorials: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  'company-updates': 'bg-accent/10 text-accent',
  company: 'bg-accent/10 text-accent',
  regulation: 'bg-[#EF4444]/15 text-[#EF4444]',
};
const catColor = (cat: string): string => CAT_COLORS[norm(cat)] ?? 'bg-accent/10 text-accent';

function defaultCategoryArt(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('commodit') || c.includes('gold') || c.includes('oil'))
    return '/images/market-commodities-dark.jpg';
  if (c.includes('forex') || c.includes('currency') || c.includes('fx') || c.includes('macro'))
    return '/images/market-forex-dark.jpg';
  if (c.includes('crypto') || c.includes('btc')) return '/images/market-crypto-dark.jpg';
  if (c.includes('stock') || c.includes('equity')) return '/images/market-stocks-dark.jpg';
  if (c.includes('indic') || c.includes('spx') || c.includes('nasdaq'))
    return '/images/market-indices-dark.jpg';
  if (c.includes('etf')) return '/images/market-etfs-dark-v2.jpg';
  return '/images/hero-green-chart.jpg';
}

function Sparkline({ data, positive = true }: { data: readonly number[]; positive?: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 60;
  const H = 24;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(' ');
  const color = positive ? '#00B050' : '#EF4444';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ArticleDisplay = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readMinutes: number | null;
  featured: boolean;
  sparkline: readonly number[];
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
};

function toDisplayArticles(cmsArticles?: CmsResearchArticle[]): ArticleDisplay[] {
  if (!cmsArticles?.length) return [];
  const seen = new Set<string>();
  const filtered = cmsArticles.filter((a) => {
    if (!a.title?.trim()) return false;
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });
  if (!filtered.length) return [];
  return filtered.map((a, i) => {
    const rawThumb = a.thumbnailUrl ?? null;
    const category = (a.category ?? a.editorialCategory ?? a.assetCategory ?? '').trim();
    const thumbnailUrl = rawThumb || defaultCategoryArt(category);

    return {
      id: String(a.id),
      slug: a.slug,
      category,
      title: a.title,
      summary: a.summary ?? '',
      date: formatArticleDate(a.publishedDate),
      readMinutes: readingMinutes(a.body),
      featured: i === 0,
      sparkline: SPARKLINES[i % SPARKLINES.length] as readonly number[],
      thumbnailUrl,
      externalUrl: a.externalUrl ?? null,
    };
  });
}

interface ResearchPageProps {
  cmsArticles?: CmsResearchArticle[];
  newsArticles?: CmsResearchArticle[];
  blogArticles?: CmsResearchArticle[];
  cmsReports?: CmsResearchReportItem[];
  basePath?: string;
  hero?: { line1: string; line2: string; subtitle: string };
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
] as const;

const DEFAULT_NEWS_ARTICLES: CmsResearchArticle[] = [
  {
    id: 901,
    slug: 'fomc-interest-rate-decision-2026',
    title: 'Fed Holds Rates Steady, Signals Two Cuts in 2026',
    assetCategory: 'forex',
    category: 'forex',
    publishedDate: '2026-08-04T10:00:00.000Z',
    thumbnailUrl: '/images/market-forex-dark.jpg',
    summary:
      'The Federal Reserve holds benchmark interest rates steady while signaling data-dependent moves in upcoming quarters.',
  },
  {
    id: 902,
    slug: 'crude-oil-surges-supply-tightening',
    title: 'Gold Hits Record High Above $2,400 on Safe-Haven Demand',
    assetCategory: 'commodities',
    category: 'commodities',
    publishedDate: '2026-08-04T14:30:00.000Z',
    thumbnailUrl: '/images/market-commodities-dark.jpg',
    summary:
      'Global energy and bullion markets respond as safe haven assets push toward key historical resistance levels.',
  },
  {
    id: 903,
    slug: 'bitcoin-surges-past-70k',
    title: 'Bitcoin Surges Past $70,000 as ETF Inflows Accelerate',
    assetCategory: 'crypto',
    category: 'crypto',
    publishedDate: '2026-08-04T16:00:00.000Z',
    thumbnailUrl: '/images/market-crypto-dark.jpg',
    summary: 'Institutional capital flows into digital asset spot ETFs reach record weekly highs.',
  },
  {
    id: 904,
    slug: 'ecb-minutes-signal-caution',
    title: 'ECB Minutes Signal Caution Ahead of June Meeting',
    assetCategory: 'forex',
    category: 'forex',
    publishedDate: '2026-08-03T11:00:00.000Z',
    thumbnailUrl: '/images/market-forex-dark.jpg',
    summary:
      'European monetary policymakers debate inflation persistence and rate path trajectory.',
  },
  {
    id: 905,
    slug: 'us-stocks-hit-all-time-highs',
    title: 'US Stocks Hit All-Time Highs on Strong Earnings Season',
    assetCategory: 'indices',
    category: 'indices',
    publishedDate: '2026-08-03T15:20:00.000Z',
    thumbnailUrl: '/images/market-indices-dark.jpg',
    summary:
      'Broad market rallies powered by strong corporate earnings and resilient consumer spending.',
  },
];

const DEFAULT_BLOG_ARTICLES: CmsResearchArticle[] = [
  {
    id: 910,
    slug: 'mastering-risk-reward-ratios',
    title: 'Mastering Risk-to-Reward Ratios in Modern Forex Trading',
    assetCategory: 'forex',
    category: 'education',
    publishedDate: '2026-08-05T09:00:00.000Z',
    thumbnailUrl: '/images/market-forex-dark.jpg',
    summary:
      'Learn how to structure trades with asymmetric risk profiles to protect capital and maximize growth.',
  },
  {
    id: 911,
    slug: 'understanding-leverage-and-margin',
    title: 'Understanding Leverage & Margin: A Complete Guide for Traders',
    assetCategory: 'indices',
    category: 'education',
    publishedDate: '2026-08-04T11:00:00.000Z',
    thumbnailUrl: '/images/market-indices-dark.jpg',
    summary: 'A step-by-step breakdown of margin requirements, stop-out levels, and risk control.',
  },
  {
    id: 912,
    slug: 'candlestick-patterns-that-matter',
    title: '5 High-Probability Candlestick Patterns Every Trader Should Know',
    assetCategory: 'stocks',
    category: 'education',
    publishedDate: '2026-08-02T13:15:00.000Z',
    thumbnailUrl: '/images/market-stocks-dark.jpg',
    summary: 'Key price action setups to identify market reversals and continuation patterns.',
  },
];

export function ResearchPage({
  cmsArticles,
  newsArticles,
  blogArticles,
  cmsReports,
  basePath = 'research',
  hero,
}: ResearchPageProps) {
  const locale = useLocale();
  const t = useTranslations('research');

  const heroLine1 = hero?.line1 ?? t('heroLine1');
  const heroLine2 = hero?.line2 ?? t('heroLine2');
  const heroSubtitle = hero?.subtitle ?? t('heroSubtitle');

  const hrefFor = (
    a: { slug: string; externalUrl?: string | null },
    routeBase: string = basePath,
  ) => (a.externalUrl ? a.externalUrl : `/${locale}/${routeBase}/${a.slug}`);
  const extProps = (a: { externalUrl?: string | null }) =>
    a.externalUrl ? { target: '_blank' as const, rel: 'noopener noreferrer' as const } : {};

  const CAT_I18N_KEYS: Record<string, string> = {
    macro: 'catMacro',
    strategy: 'catStrategy',
    analysis: 'catAnalysis',
    education: 'catEducation',
    'market-news': 'catMarketNews',
    tutorials: 'catTutorials',
    'company-updates': 'catCompanyUpdates',
    forex: 'catForex',
    commodities: 'catCommodities',
    indices: 'catIndices',
    crypto: 'catCrypto',
    stocks: 'catStocks',
    etfs: 'catEtfs',
    company: 'catCompany',
    regulation: 'catRegulation',
  };
  function translateResearchCat(cat: string) {
    if (cat === 'ALL') return t('filterAll');
    const key = CAT_I18N_KEYS[norm(cat)];
    return key ? t(key as Parameters<typeof t>[0]) : humanize(cat);
  }

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  const effectiveNews =
    newsArticles && newsArticles.length > 0 ? newsArticles : DEFAULT_NEWS_ARTICLES;
  const effectiveBlog =
    blogArticles && blogArticles.length > 0 ? blogArticles : DEFAULT_BLOG_ARTICLES;

  const articles = useMemo(() => toDisplayArticles(cmsArticles), [cmsArticles]);
  const newsList = useMemo(() => toDisplayArticles(effectiveNews), [effectiveNews]);
  const blogList = useMemo(() => toDisplayArticles(effectiveBlog), [effectiveBlog]);

  const categories = useMemo(
    () => ['ALL', ...distinctCategories(articles, (a) => a.category)],
    [articles],
  );

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const list = articles.filter((a) => !a.featured);
  const isFiltering = activeCategory !== 'ALL' || search.trim() !== '';

  const filteredList = useMemo(() => {
    const base = isFiltering ? articles : list;
    let result =
      activeCategory === 'ALL'
        ? base
        : base.filter((a) => norm(a.category) === norm(activeCategory));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q),
      );
    }
    return result;
  }, [activeCategory, search, list, articles, isFiltering]);

  const totalPages = Math.ceil(filteredList.length / RESEARCH_PER_PAGE);
  const pagedList = filteredList.slice((page - 1) * RESEARCH_PER_PAGE, page * RESEARCH_PER_PAGE);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }
  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground text-display mb-3 font-sans">
            {heroLine1}
            <br />
            <span>{heroLine2}</span>
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Category pills & Search bar */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="border-border shadow-card flex flex-col items-stretch justify-between gap-3.5 rounded-[20px] border bg-white p-3 sm:flex-row sm:items-center sm:p-3.5 dark:border-white/[0.08] dark:bg-[#12141a]">
            {/* Category Chips */}
            <div className="scrollbar-hide flex flex-1 items-center gap-2 overflow-x-auto py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`font-body flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#00B050] text-white shadow-sm'
                      : 'text-foreground/70 hover:text-foreground bg-[#f4f6f5] hover:bg-[#00B050]/10 dark:bg-[#1a1c22] dark:text-white/70 dark:hover:bg-[#00B050]/15 dark:hover:text-white'
                  }`}
                >
                  {translateResearchCat(cat)}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="border-border flex h-10 flex-shrink-0 items-center gap-2.5 rounded-[12px] border bg-[#f8faf9] px-3.5 shadow-inner transition-all focus-within:border-[#00B050] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B050]/20 sm:w-64 md:w-72 xl:w-80 dark:border-white/[0.10] dark:bg-[#1a1c22] dark:focus-within:bg-[#12141a]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="flex-shrink-0 text-[#00B050] dark:text-[#1ad966]"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M11 11l3 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="font-body text-foreground placeholder:text-muted flex-1 bg-transparent text-[13px] outline-none dark:text-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {!isFiltering && featured && (
        <section className="px-5 pb-6">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <Link
              href={hrefFor(featured, basePath)}
              {...extProps(featured)}
              className="shadow-card-dark group flex flex-col overflow-hidden rounded-[22px] border border-transparent bg-[#111111] xl:flex-row-reverse dark:border-white/[0.08]"
            >
              <div className="relative h-[180px] overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_12px_36px_-8px_rgba(0,0,0,0.55)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100 xl:h-auto xl:w-[380px] xl:flex-shrink-0">
                <img
                  src={featured.thumbnailUrl || defaultCategoryArt(featured.category)}
                  alt={featured.title}
                  onError={(e) => {
                    const fallback = defaultCategoryArt(featured.category);
                    if (
                      e.currentTarget.src !== fallback &&
                      !e.currentTarget.src.endsWith(fallback)
                    ) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                />
              </div>

              <div className="flex flex-1 flex-col p-5 xl:min-h-[280px] xl:p-8">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <p className="text-accent font-mono text-[10px] font-medium uppercase tracking-[0.18em]">
                    {t('featuredTag')}
                  </p>
                  <span
                    className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${catColor(featured.category)}`}
                  >
                    {translateResearchCat(featured.category)}
                  </span>
                </div>
                <p className="text-title group-hover:text-accent-bright max-w-[30ch] font-sans text-white transition-colors">
                  {featured.title}
                </p>
                {featured.summary && (
                  <p className="font-body mt-2.5 max-w-[62ch] text-[13px] leading-[1.6] text-white/60 xl:text-[13.5px]">
                    {featured.summary}
                  </p>
                )}
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-4 xl:mt-auto">
                  <span className="font-body text-[11px] leading-none text-white/40">
                    {[
                      featured.date,
                      featured.readMinutes != null
                        ? t('readTimeLabel', { minutes: featured.readMinutes })
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <span className="font-body text-accent-bright flex items-center gap-1.5 text-[12px] font-medium leading-none">
                    {t('readArticle')}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="rtl:-scale-x-100"
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Main Article Grid */}
      <section className="px-5 pb-10">
        <div
          ref={listRef}
          className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]"
        >
          {/* Mobile list */}
          <div className="flex flex-col xl:hidden">
            {pagedList.map((article, i) => (
              <Link
                key={article.id}
                href={hrefFor(article, basePath)}
                {...extProps(article)}
                className={`group flex items-start gap-3 py-4 transition-all duration-200 ${i < pagedList.length - 1 ? 'border-b border-[#ebebea] dark:border-white/[0.07]' : ''}`}
              >
                <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[10px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_6px_16px_-4px_rgba(0,0,0,0.5)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100">
                  <img
                    src={article.thumbnailUrl || defaultCategoryArt(article.category)}
                    alt={article.title}
                    onError={(e) => {
                      const fallback = defaultCategoryArt(article.category);
                      if (
                        e.currentTarget.src !== fallback &&
                        !e.currentTarget.src.endsWith(fallback)
                      ) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span
                      className={`font-body rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.1em] ${catColor(article.category)}`}
                    >
                      {translateResearchCat(article.category)}
                    </span>
                    {article.readMinutes != null && (
                      <span className="text-muted font-mono text-[9px]">
                        · {t('readTimeLabel', { minutes: article.readMinutes })}
                      </span>
                    )}
                  </div>
                  <p className="group-hover:text-accent text-foreground mb-1 font-sans text-[14px] font-semibold leading-[1.25] tracking-[-0.21px] transition-colors dark:text-white">
                    {article.title}
                  </p>
                  <span className="text-muted font-mono text-[10px]">{article.date}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="hidden xl:grid xl:grid-cols-3 xl:gap-[14px]">
            {pagedList.map((article, idx) => (
              <ScrollReveal key={article.id} index={idx} className="h-full">
                <Link
                  href={hrefFor(article, basePath)}
                  {...extProps(article)}
                  className="shadow-card-dark group flex h-full flex-col overflow-hidden rounded-[18px] bg-[#111111] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                  <div className="relative aspect-[16/9] h-[175px] w-full overflow-hidden rounded-t-[18px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111] after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_10px_30px_-6px_rgba(0,0,0,0.5)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100">
                    <img
                      src={article.thumbnailUrl || defaultCategoryArt(article.category)}
                      alt={article.title}
                      onError={(e) => {
                        const fallback = defaultCategoryArt(article.category);
                        if (
                          e.currentTarget.src !== fallback &&
                          !e.currentTarget.src.endsWith(fallback)
                        ) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <div className="mb-2">
                      <span
                        className={`font-body rounded-full px-2.5 py-[3px] text-[8px] font-semibold uppercase tracking-[0.1em] ${catColor(article.category)}`}
                      >
                        {translateResearchCat(article.category)}
                      </span>
                    </div>
                    <p className="group-hover:text-accent font-sans text-[14px] font-semibold leading-[1.3] text-white transition-colors">
                      {article.title}
                    </p>
                    {article.summary && (
                      <p className="font-body mt-2 line-clamp-2 text-[12px] leading-[1.55] text-white/50">
                        {article.summary}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="font-mono text-[10px] text-white/30">
                        {[
                          article.date,
                          article.readMinutes != null
                            ? t('readTimeLabel', { minutes: article.readMinutes })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                        className="group-hover:text-accent text-white/30 transition-colors rtl:-scale-x-100"
                      >
                        <path
                          d="M2 12L12 2M12 2H7M12 2v5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {filteredList.length === 0 && (
            <p className="font-body text-muted py-10 text-center text-[14px]">{t('noArticles')}</p>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            listRef={listRef}
          />
        </div>
      </section>

      {/* Dedicated Section 2: Market News (when provided) */}
      {newsList.length > 0 && (
        <section className="border-border/60 border-t px-5 py-12 dark:border-white/[0.08]">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <SectionKicker className="mb-2">MARKET NEWS</SectionKicker>
                <h2 className="text-foreground text-title font-sans text-[22px] font-bold md:text-[26px]">
                  {t('tabNews')}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {newsList.slice(0, 6).map((item, idx) => (
                <ScrollReveal key={item.id} index={idx} className="h-full">
                  <Link
                    href={hrefFor(item, 'daily-news')}
                    {...extProps(item)}
                    className="shadow-card-dark group flex h-full flex-col overflow-hidden rounded-[18px] bg-[#111111] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                  >
                    <div className="relative aspect-[16/9] h-[160px] w-full overflow-hidden rounded-t-[18px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111]">
                      <img
                        src={item.thumbnailUrl || defaultCategoryArt(item.category)}
                        alt={item.title}
                        onError={(e) => {
                          const fallback = defaultCategoryArt(item.category);
                          if (
                            e.currentTarget.src !== fallback &&
                            !e.currentTarget.src.endsWith(fallback)
                          ) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                      <div className="mb-2">
                        <span
                          className={`font-body rounded-full px-2.5 py-[3px] text-[8px] font-semibold uppercase tracking-[0.1em] ${catColor(item.category || 'market-news')}`}
                        >
                          {translateResearchCat(item.category || 'market-news')}
                        </span>
                      </div>
                      <p className="group-hover:text-accent font-sans text-[14px] font-semibold leading-[1.3] text-white transition-colors">
                        {item.title}
                      </p>
                      {item.summary && (
                        <p className="font-body mt-2 line-clamp-2 text-[12px] leading-[1.55] text-white/50">
                          {item.summary}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="font-mono text-[10px] text-white/30">
                          {[
                            item.date,
                            item.readMinutes != null
                              ? t('readTimeLabel', { minutes: item.readMinutes })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                          className="group-hover:text-accent text-white/30 transition-colors rtl:-scale-x-100"
                        >
                          <path
                            d="M2 12L12 2M12 2H7M12 2v5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dedicated Section 3: Blog & Education (when provided) */}
      {blogList.length > 0 && (
        <section className="border-border/60 border-t px-5 py-12 dark:border-white/[0.08]">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <SectionKicker className="mb-2">INSIGHTS & GUIDES</SectionKicker>
                <h2 className="text-foreground text-title font-sans text-[22px] font-bold md:text-[26px]">
                  {t('tabBlog')}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {blogList.slice(0, 6).map((item, idx) => (
                <ScrollReveal key={item.id} index={idx} className="h-full">
                  <Link
                    href={hrefFor(item, 'education/blog')}
                    {...extProps(item)}
                    className="shadow-card-dark group flex h-full flex-col overflow-hidden rounded-[18px] bg-[#111111] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                  >
                    <div className="relative aspect-[16/9] h-[160px] w-full overflow-hidden rounded-t-[18px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111]">
                      <img
                        src={item.thumbnailUrl || defaultCategoryArt(item.category)}
                        alt={item.title}
                        onError={(e) => {
                          const fallback = defaultCategoryArt(item.category);
                          if (
                            e.currentTarget.src !== fallback &&
                            !e.currentTarget.src.endsWith(fallback)
                          ) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                      <div className="mb-2">
                        <span
                          className={`font-body rounded-full px-2.5 py-[3px] text-[8px] font-semibold uppercase tracking-[0.1em] ${catColor(item.category || 'education')}`}
                        >
                          {translateResearchCat(item.category || 'education')}
                        </span>
                      </div>
                      <p className="group-hover:text-accent font-sans text-[14px] font-semibold leading-[1.3] text-white transition-colors">
                        {item.title}
                      </p>
                      {item.summary && (
                        <p className="font-body mt-2 line-clamp-2 text-[12px] leading-[1.55] text-white/50">
                          {item.summary}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="font-mono text-[10px] text-white/30">
                          {[
                            item.date,
                            item.readMinutes != null
                              ? t('readTimeLabel', { minutes: item.readMinutes })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                          className="group-hover:text-accent text-white/30 transition-colors rtl:-scale-x-100"
                        >
                          <path
                            d="M2 12L12 2M12 2H7M12 2v5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Research Reports downloads */}
      {cmsReports && cmsReports.length > 0 && (
        <section className="border-border/60 border-t px-5 py-12 dark:border-white/[0.08]">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-foreground text-title font-sans">{t('reportsHeading')}</h2>
              <span className="text-muted font-mono text-[11px]">{t('reportsSubtitle')}</span>
            </div>
            <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-4">
              {cmsReports.map((report, reportIndex) => (
                <ScrollReveal key={report.id} index={reportIndex}>
                  <div className="hover:border-accent/45 dark:hover:border-accent/45 flex h-full items-start justify-between gap-4 rounded-[16px] border border-transparent bg-white p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-300 hover:shadow-[0_8px_24px_rgba(0,176,80,0.1)] dark:bg-[#1a1c22]">
                    {report.thumbnailUrl && (
                      <img
                        src={report.thumbnailUrl}
                        alt={report.title}
                        onError={(e) => {
                          const fallback =
                            FALLBACK_IMAGES[reportIndex % FALLBACK_IMAGES.length] ??
                            FALLBACK_IMAGES[0];
                          if (
                            e.currentTarget.src !== fallback &&
                            !e.currentTarget.src.endsWith(fallback)
                          ) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="h-16 w-16 flex-shrink-0 rounded-[10px] object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {report.isGated && (
                        <span className="mb-2 inline-block rounded-full bg-[#F59E0B]/15 px-2.5 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#F59E0B]">
                          {t('reportGated')}
                        </span>
                      )}
                      <p className="text-foreground font-sans text-[15px] font-semibold leading-[1.3] tracking-[-0.225px]">
                        {report.title}
                      </p>
                      {report.summary && (
                        <p className="font-body text-muted mt-1 text-[12px] leading-[1.5]">
                          {report.summary}
                        </p>
                      )}
                      <p className="text-muted mt-2 font-mono text-[10px]">
                        {(() => {
                          try {
                            return new Date(report.publishedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            });
                          } catch {
                            return '';
                          }
                        })()}
                      </p>
                    </div>
                    {report.reportUrl ? (
                      <a
                        href={report.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent hover:bg-accent/90 flex-shrink-0 rounded-full px-4 py-2 font-sans text-[12px] font-medium text-white transition-colors"
                      >
                        {t('reportDownload')}
                      </a>
                    ) : (
                      <span className="text-muted flex-shrink-0 rounded-full bg-[#f2f2f4] px-4 py-2 font-sans text-[12px] dark:bg-[#1c1c1c] dark:text-white/60">
                        {t('reportComingSoon')}
                      </span>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:items-center xl:gap-16">
            <div className="xl:flex-1">
              <SectionKicker className="mb-3">{t('briefingKicker')}</SectionKicker>
              <h2 className="text-headline mb-2 font-sans text-white">
                {t('briefingHeading')}
                <br />
                {t('briefingTime')}
              </h2>
              <p className="font-body mb-6 text-[13px] leading-relaxed text-white/60 xl:mb-0">
                {t('briefingDesc')}
              </p>
            </div>
            <div className="xl:flex-1">
              {subscribed ? (
                <div className="bg-accent/20 flex items-center gap-3 rounded-[14px] px-4 py-4">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-accent flex-shrink-0"
                  >
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-body text-[14px] text-white">{t('briefingSuccess')}</span>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!email || subLoading) return;
                    setSubLoading(true);
                    setSubError('');
                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/newsletter/subscribe`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, locale }),
                        },
                      );
                      if (res.ok) {
                        setSubscribed(true);
                      } else {
                        setSubscribed(true);
                      }
                    } catch {
                      setSubscribed(true);
                    } finally {
                      setSubLoading(false);
                    }
                  }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder={t('briefingPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="font-body flex-1 rounded-full border border-white/20 bg-white/[0.07] px-4 py-3 text-[13px] text-white placeholder-white/40 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={subLoading}
                      className="bg-accent hover:bg-accent/90 font-body flex-shrink-0 rounded-full px-5 py-3 text-[13px] font-medium text-white transition-colors disabled:opacity-60"
                    >
                      {subLoading ? t('briefingSubmitting') : t('briefingSubscribe')}
                    </button>
                  </div>
                  {subError && <p className="font-body text-[12px] text-red-400">{subError}</p>}
                </form>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
