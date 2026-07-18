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
  /** Estimated reading minutes from the body; null when the doc has no body (e.g. external news). */
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
  return filtered.map((a, i) => ({
    id: String(a.id),
    slug: a.slug,
    category: (a.category ?? a.editorialCategory ?? a.assetCategory ?? '').trim(),
    title: a.title,
    summary: a.summary ?? '',
    date: formatArticleDate(a.publishedDate),
    readMinutes: readingMinutes(a.body),
    featured: i === 0,
    sparkline: SPARKLINES[i % SPARKLINES.length] as readonly number[],
    thumbnailUrl: a.thumbnailUrl ?? null,
    externalUrl: a.externalUrl ?? null,
  }));
}

interface ResearchPageProps {
  cmsArticles?: CmsResearchArticle[];
  /** News feed (renders under the "News" source tab; detail links resolve to /daily-news/[slug]). */
  newsArticles?: CmsResearchArticle[];
  /** Blog feed (renders under the "Blog" source tab; detail links resolve to /education/blog/[slug]). */
  blogArticles?: CmsResearchArticle[];
  cmsReports?: CmsResearchReportItem[];
  basePath?: string;
  /** Optional hero copy override (e.g. /daily-news supplies its own localized strings). */
  hero?: { line1: string; line2: string; subtitle: string };
}

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

  // When a caller supplies extra feeds (the merged /research desk), the page shows
  // Analysis / News / Blog source tabs; each feed keeps its own detail route.
  const hasFeeds = Boolean(newsArticles || blogArticles);
  const [contentTab, setContentTab] = useState<'analysis' | 'news' | 'blog'>('analysis');
  const detailBase =
    contentTab === 'news' ? 'daily-news' : contentTab === 'blog' ? 'education/blog' : basePath;

  // Hero copy defaults to the research namespace, but callers (e.g. /daily-news)
  // can supply their own localized strings.
  const heroLine1 = hero?.line1 ?? t('heroLine1');
  const heroLine2 = hero?.line2 ?? t('heroLine2');
  const heroSubtitle = hero?.subtitle ?? t('heroSubtitle');

  // A card links to its external source when one is provided (news items are
  // often pointers to the original story); otherwise to the internal detail page.
  const hrefFor = (a: { slug: string; externalUrl?: string | null }) =>
    a.externalUrl ? a.externalUrl : `/${locale}/${detailBase}/${a.slug}`;
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

  const activeSource =
    contentTab === 'news' ? newsArticles : contentTab === 'blog' ? blogArticles : cmsArticles;
  const articles = useMemo(() => toDisplayArticles(activeSource), [activeSource]);

  // Tabs reflect the real CMS categories present (case-insensitive), never a
  // hardcoded list — so /education/blog, /research and /daily-news each show their own.
  const categories = useMemo(
    () => ['ALL', ...distinctCategories(articles, (a) => a.category)],
    [articles],
  );

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const list = articles.filter((a) => !a.featured);
  // The featured article is only surfaced as the hero in the default (no filter,
  // no search) view. Once a category tab or search is active we hide the hero and
  // match across ALL articles — otherwise the newest item would be silently
  // dropped from its own category's results, making the filter look broken.
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

  function handleContentTab(tab: 'analysis' | 'news' | 'blog') {
    setContentTab(tab);
    setActiveCategory('ALL');
    setSearch('');
    setPage(1);
  }
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

      {/* Content source tabs — Analysis / News / Blog (merged insights desk) */}
      {hasFeeds && (
        <section className="px-5 pb-1 pt-1">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="border-border relative inline-grid grid-cols-3 rounded-[12px] border bg-[#f2f2f4] p-1 dark:border-white/[0.08] dark:bg-[#1a1c22]">
              {/* Sliding active-tab indicator: transforms between the three feeds
                  (snaps under reduced motion). Physical translateX is mirrored in
                  RTL so it tracks the logical-start tab. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1 start-1 rounded-[9px] bg-white shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-[#2a2d36]"
                style={{
                  width: 'calc((100% - 0.5rem) / 3)',
                  transform: `translateX(${
                    ['analysis', 'news', 'blog'].indexOf(contentTab) *
                    (locale === 'ar' ? -100 : 100)
                  }%)`,
                }}
              />
              {(
                [
                  { id: 'analysis', label: t('tabAnalysis') },
                  { id: 'news', label: t('tabNews') },
                  { id: 'blog', label: t('tabBlog') },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleContentTab(s.id)}
                  className={`font-body relative z-10 rounded-[9px] px-4 py-2 text-center text-[13px] font-medium transition-colors ${
                    contentTab === s.id
                      ? 'text-foreground dark:text-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search bar */}
      <section className="px-5 pb-4">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="dark:bg-surface flex items-center gap-2.5 rounded-[12px] bg-[#f2f2f4] px-3.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="text-muted flex-shrink-0"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="font-body text-foreground placeholder:text-muted w-full bg-transparent py-3 text-[13px] outline-none"
            />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="px-5 pb-4">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`font-body flex-shrink-0 rounded-full px-[14px] py-[8px] text-[13px] font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-accent text-white'
                    : 'text-muted hover:bg-accent/[0.10] dark:hover:bg-accent/[0.15] bg-[#f2f2f4] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:text-white/80'
                }`}
              >
                {translateResearchCat(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured article — only in the default view (no category filter, no search) */}
      {!isFiltering && featured && (
        <section className="px-5 pb-6">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            {/* Mobile: image on top. Desktop: content start-side, image capped
                at a fixed end-side column (flex-row-reverse keeps the DOM
                image-first for the mobile stack while placing it at the
                inline end on xl — correct in RTL too). */}
            <Link
              href={hrefFor(featured)}
              {...extProps(featured)}
              className="shadow-card-dark group flex flex-col overflow-hidden rounded-[22px] border border-transparent bg-[#111111] xl:flex-row-reverse dark:border-white/[0.08]"
            >
              {/* Thumbnail — real CMS cover image when present; image zooms + gains an inner shadow on hover (client-approved article-card override) */}
              <div className="relative h-[180px] overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_12px_36px_-8px_rgba(0,0,0,0.55)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100 xl:h-auto xl:w-[380px] xl:flex-shrink-0">
                {featured.thumbnailUrl ? (
                  <img
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111] transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
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

      {/* Article list */}
      <section className="px-5 pb-10">
        <div
          ref={listRef}
          className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]"
        >
          {/* Mobile: horizontal row list */}
          <div className="flex flex-col xl:hidden">
            {pagedList.map((article, i) => (
              <Link
                key={article.id}
                href={hrefFor(article)}
                {...extProps(article)}
                className={`group flex items-start gap-3 py-4 transition-all duration-200 ${i < pagedList.length - 1 ? 'border-b border-[#ebebea] dark:border-white/[0.07]' : ''}`}
              >
                <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[10px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_6px_16px_-4px_rgba(0,0,0,0.5)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100">
                  {article.thumbnailUrl ? (
                    <img
                      src={article.thumbnailUrl}
                      alt={article.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full items-end p-1.5 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]">
                      <Sparkline data={article.sparkline} positive />
                    </div>
                  )}
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

          {/* Desktop: vertical card grid — staggered scroll reveal, cards come alive on hover */}
          <div className="hidden xl:grid xl:grid-cols-3 xl:gap-[14px]">
            {pagedList.map((article, idx) => (
              <ScrollReveal key={article.id} index={idx} className="h-full">
                <Link
                  href={hrefFor(article)}
                  {...extProps(article)}
                  className="shadow-card-dark group flex h-full flex-col overflow-hidden rounded-[18px] bg-[#111111] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                  {/* Thumbnail — image zooms + gains an inner shadow on hover (client-approved article-card override) */}
                  <div className="relative h-[140px] overflow-hidden bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111] after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_10px_30px_-6px_rgba(0,0,0,0.5)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100">
                    {article.thumbnailUrl ? (
                      <img
                        src={article.thumbnailUrl}
                        alt={article.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-end p-3 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]">
                        <svg
                          width="100%"
                          height="44"
                          viewBox="0 0 200 44"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            points={article.sparkline
                              .map((v, i) => {
                                const max = Math.max(...(article.sparkline as unknown as number[]));
                                const min = Math.min(...(article.sparkline as unknown as number[]));
                                const range = max - min || 1;
                                return `${(i / (article.sparkline.length - 1)) * 200},${44 - ((v - min) / range) * 38}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke="#00B050"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Content */}
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

      {/* Research Reports downloads — analysis desk only */}
      {contentTab === 'analysis' && cmsReports && cmsReports.length > 0 && (
        <section className="px-5 pb-10">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-foreground text-title font-sans">{t('reportsHeading')}</h2>
              <span className="text-muted font-mono text-[11px]">{t('reportsSubtitle')}</span>
            </div>
            <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-4">
              {cmsReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between gap-4 rounded-[16px] bg-white p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_16px_40px_-16px_rgba(8,19,12,0.18)] motion-safe:hover:-translate-y-1 dark:bg-[#1a1c22]"
                >
                  {report.thumbnailUrl && (
                    <img
                      src={report.thumbnailUrl}
                      alt={report.title}
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:items-center xl:gap-16">
            {/* Left: heading */}
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
            {/* Right: form */}
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
                        const data = (await res.json().catch(() => ({}))) as {
                          error?: string;
                          errors?: { message?: string }[];
                        };
                        setSubError(data.errors?.[0]?.message ?? data.error ?? t('briefingError'));
                      }
                    } catch {
                      setSubError(t('briefingError'));
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
        </div>
      </section>
    </>
  );
}
