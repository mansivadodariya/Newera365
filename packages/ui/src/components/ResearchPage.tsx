'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

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

type Category = 'ALL' | 'MACRO' | 'STRATEGY' | 'EDUCATION' | 'ANALYSIS';

const CATEGORIES: Category[] = ['ALL', 'MACRO', 'STRATEGY', 'ANALYSIS', 'EDUCATION'];

interface CmsResearchArticle {
  id: number;
  slug: string;
  title: string;
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  analyst?: string | null;
  publishedDate: string;
  thumbnailUrl?: string | null;
  summary?: string | null;
}

export interface CmsResearchReportItem {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  publishedDate: string;
  isGated?: boolean | null;
  reportUrl: string | null;
}

const ASSET_TO_CATEGORY: Record<string, Exclude<Category, 'ALL'>> = {
  forex: 'MACRO',
  commodities: 'ANALYSIS',
  indices: 'MACRO',
  stocks: 'ANALYSIS',
  etfs: 'STRATEGY',
  crypto: 'ANALYSIS',
};

const SPARKLINES = [
  [40, 45, 38, 52, 48, 60, 55, 68, 62, 72],
  [60, 55, 70, 45, 65, 40, 58, 35, 50, 42],
  [30, 38, 45, 55, 62, 58, 70, 75, 68, 80],
  [65, 60, 70, 65, 72, 68, 75, 70, 78, 74],
] as const;

function formatArticleDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const CAT_COLORS: Record<string, string> = {
  MACRO: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  STRATEGY: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  ANALYSIS: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  EDUCATION: 'bg-accent/10 text-accent',
};

const ARTICLES = [
  {
    id: 'dollar-frankfurt',
    slug: 'dollar-move-starts-frankfurt',
    category: 'MACRO' as Category,
    title: "Why the dollar's next move starts in Frankfurt, not Washington",
    summary:
      "ECB policy divergence is widening the EUR/USD range. Here's the headline number that actually matters.",
    date: 'May 26',
    readTime: '6 min',
    featured: true,
    sparkline: [40, 45, 38, 52, 48, 60, 55, 68, 62, 72],
  },
  {
    id: 'volatility-trap',
    slug: 'volatility-trap-three-setups',
    category: 'STRATEGY' as Category,
    title: 'The volatility trap: three setups professional traders avoid',
    summary: 'High ATR is not the same as edge. Most retail traders confuse the two.',
    date: 'May 23',
    readTime: '8 min',
    featured: false,
    sparkline: [60, 55, 70, 45, 65, 40, 58, 35, 50, 42],
  },
  {
    id: 'gold-momentum',
    slug: 'gold-1400-momentum-or-top',
    category: 'ANALYSIS' as Category,
    title: 'Gold at $2,400 — momentum or top? Reading the COT report',
    summary:
      'Positioning data shows institutional longs at 18-month highs but the futures curve is flattening fast.',
    date: 'May 21',
    readTime: '5 min',
    featured: false,
    sparkline: [30, 38, 45, 55, 62, 58, 70, 75, 68, 80],
  },
  {
    id: 'slippage-guide',
    slug: 'traders-guide-understanding-slippage',
    category: 'EDUCATION' as Category,
    title: "A trader's guide to understanding slippage",
    summary: 'Why your fill price differs from your order price, and how to minimise the gap.',
    date: 'May 19',
    readTime: '4 min',
    featured: false,
    sparkline: [50, 52, 48, 55, 53, 56, 54, 58, 55, 60],
  },
  {
    id: 'pip-swap-calculators',
    slug: 'pip-swap-calculators-on-mobile',
    category: 'EDUCATION' as Category,
    title: 'How free pip & swap calculators on mobile can mislead you',
    summary:
      'Built-in calculator apps bake in assumptions your broker does not use. Check the math.',
    date: 'May 16',
    readTime: '3 min',
    featured: false,
    sparkline: [65, 60, 70, 65, 72, 68, 75, 70, 78, 74],
  },
  {
    id: 'ecb-rate',
    slug: 'ecb-rate-decision-what-traders-missed',
    category: 'MACRO' as Category,
    title: 'The ECB rate decision and what the market priced wrong',
    summary:
      'EUR/JPY had the largest single-session move of Q2. Here is a breakdown from the desk.',
    date: 'May 14',
    readTime: '7 min',
    featured: false,
    sparkline: [45, 50, 55, 52, 60, 65, 58, 70, 66, 72],
  },
] as const;

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
  category: Exclude<Category, 'ALL'>;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  featured: boolean;
  sparkline: readonly number[];
  thumbnailUrl?: string | null;
};

function toDisplayArticles(cmsArticles?: CmsResearchArticle[]): ArticleDisplay[] {
  if (!cmsArticles?.length) {
    return ARTICLES as unknown as ArticleDisplay[];
  }
  const seen = new Set<string>();
  const filtered = cmsArticles.filter((a) => {
    if (!a.title?.trim()) return false;
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });
  if (!filtered.length) return ARTICLES as unknown as ArticleDisplay[];
  return filtered.map((a, i) => ({
    id: String(a.id),
    slug: a.slug,
    category: (ASSET_TO_CATEGORY[a.assetCategory] ?? 'ANALYSIS') as Exclude<Category, 'ALL'>,
    title: a.title,
    summary: a.summary ?? '',
    date: formatArticleDate(a.publishedDate),
    readTime: '5 min',
    featured: i === 0,
    sparkline: SPARKLINES[i % SPARKLINES.length] as readonly number[],
    thumbnailUrl: a.thumbnailUrl ?? null,
  }));
}

interface ResearchPageProps {
  cmsArticles?: CmsResearchArticle[];
  cmsReports?: CmsResearchReportItem[];
  basePath?: string;
}

export function ResearchPage({
  cmsArticles,
  cmsReports,
  basePath = 'research',
}: ResearchPageProps) {
  const locale = useLocale();
  const t = useTranslations('research');
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const articles = useMemo(() => toDisplayArticles(cmsArticles), [cmsArticles]);

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const list = articles.filter((a) => !a.featured);

  const filteredList = useMemo(
    () =>
      activeCategory === 'ALL'
        ? list
        : list.filter((a) => a.category.toUpperCase() === activeCategory),
    [activeCategory, list],
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.08] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <section className="px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-body flex-shrink-0 rounded-full px-[14px] py-[8px] text-[13px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#111] text-white dark:bg-white dark:text-[#111]'
                    : 'bg-[#f2f2f4] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22]'
                }`}
              >
                {cat === 'ALL' ? t('filterAll') : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured article */}
      {activeCategory === 'ALL' && featured && (
        <section className="px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <Link
              href={`/${locale}/${basePath}/${featured.slug}`}
              className="shadow-card-dark group flex flex-col overflow-hidden rounded-[22px] bg-[#111111]"
            >
              {/* Thumbnail */}
              <div className="relative h-[180px] overflow-hidden bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111]">
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="w-full">
                    <svg width="100%" height="50" viewBox="0 0 280 50" preserveAspectRatio="none">
                      <polyline
                        points="0,40 30,35 60,42 90,28 120,32 150,18 180,22 210,10 240,15 280,5"
                        fill="none"
                        stroke="#00B050"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polygon
                        points="0,40 30,35 60,42 90,28 120,32 150,18 180,22 210,10 240,15 280,5 280,50 0,50"
                        fill="url(#featGradient)"
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="featGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00B050" />
                          <stop offset="100%" stopColor="#00B050" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="absolute left-4 top-4">
                  <span
                    className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${CAT_COLORS[featured.category.toUpperCase()] ?? 'bg-accent/10 text-accent'}`}
                  >
                    {featured.category}
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <p className="group-hover:text-accent mb-2 font-sans text-[18px] font-semibold leading-[1.25] text-white transition-colors">
                  {featured.title}
                </p>
                {featured.summary && (
                  <p className="font-body mb-4 text-[13px] leading-[1.55] text-white/60">
                    {featured.summary}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] text-white/40">
                    {featured.date} · {featured.readTime} read
                  </span>
                  <span className="font-body text-accent flex items-center gap-1.5 text-[12px] font-medium">
                    {t('readArticle')}
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
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

      {/* Article list — white cards matching Figma */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-3 xl:gap-6">
            {filteredList.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/${basePath}/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-[18px] bg-white p-[18px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0px_8px_24px_rgba(0,0,0,0.1)] dark:bg-[#1a1c22]"
              >
                {/* Thumbnail — CMS image if available, SVG sparkline fallback */}
                <div className="relative mb-[14px] flex h-[120px] w-full items-end overflow-hidden rounded-[12px] bg-gradient-to-br from-[#f4f4f2] to-[#e8e8e5] p-3 dark:from-[#1c1c1c] dark:to-[#111]">
                  {article.thumbnailUrl ? (
                    <img
                      src={article.thumbnailUrl}
                      alt={article.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Sparkline data={article.sparkline} positive />
                  )}
                </div>

                {/* Meta: category + readTime */}
                <div className="mb-[14px] flex items-center gap-[8px]">
                  <span className="rounded-full bg-[rgba(0,176,80,0.1)] px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px] text-[#00b050]">
                    {article.category}
                  </span>
                  <span className="font-mono text-[10px] text-[#6b7280]">
                    {article.readTime} read
                  </span>
                </div>

                {/* Title */}
                <p className="text-foreground group-hover:text-accent mb-[14px] font-sans text-[17px] font-semibold leading-[1.22] tracking-[-0.255px] transition-colors">
                  {article.title}
                </p>

                {article.summary && (
                  <p className="font-body mb-[14px] text-[13px] leading-[1.5] text-[#6b7280]">
                    {article.summary}
                  </p>
                )}

                {/* Footer: date + arrow */}
                <div className="mt-auto h-px bg-[rgba(17,17,17,0.08)] dark:bg-white/[0.08]" />
                <div className="mt-[14px] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#6b7280]">{article.date}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-muted group-hover:text-accent transition-colors"
                    aria-hidden="true"
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
              </Link>
            ))}
          </div>

          {filteredList.length === 0 && (
            <p className="font-body text-muted py-10 text-center text-[14px]">{t('noArticles')}</p>
          )}

          {/* Load more — bg-[#fafaf9] rounded pill matching Figma */}
          <div className="mt-6 flex items-center justify-center gap-[8px] rounded-[14px] bg-[#fafaf9] px-[14px] py-[14px] dark:bg-[#1a1c22]">
            <button className="font-body text-foreground text-[13px] font-medium">
              {t('loadMore')}
            </button>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-[#6b7280]"
              aria-hidden="true"
            >
              <path
                d="M7 2.5v9M3 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Research Reports downloads */}
      {cmsReports && cmsReports.length > 0 && (
        <section className="px-5 pb-10">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-foreground font-sans text-[22px] font-semibold leading-tight tracking-[-0.33px]">
                {t('reportsHeading')}
              </h2>
              <span className="font-mono text-[11px] text-[#6b7280]">{t('reportsSubtitle')}</span>
            </div>
            <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-4">
              {cmsReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between gap-4 rounded-[16px] bg-white p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] dark:bg-[#1a1c22]"
                >
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
                      <p className="font-body mt-1 text-[12px] leading-[1.5] text-[#6b7280]">
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
                    <span className="text-muted flex-shrink-0 rounded-full bg-[#f2f2f4] px-4 py-2 font-sans text-[12px] dark:bg-[#1c1c1c] dark:text-[#9ca3af]">
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
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:items-center xl:gap-16">
            {/* Left: heading */}
            <div className="xl:flex-1">
              <SectionKicker className="mb-3 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
                {t('briefingKicker')}
              </SectionKicker>
              <h2 className="mb-2 font-sans text-[28px] font-semibold leading-[1.1] text-white">
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email) setSubscribed(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder={t('briefingPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="font-body focus:border-accent flex-1 rounded-full border border-white/20 bg-white/[0.07] px-4 py-3 text-[13px] text-white placeholder-white/40 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent/90 font-body flex-shrink-0 rounded-full px-5 py-3 text-[13px] font-medium text-white transition-colors"
                  >
                    {t('briefingSubscribe')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
