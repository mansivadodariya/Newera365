'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RichText, readingMinutes } from '../primitives/RichText';
import type { SlateNode } from '../primitives/RichText';
import { ReadingProgress } from '../motion/ReadingProgress';
import { ScrollReveal } from '../motion/ScrollReveal';

export interface RelatedInstrument {
  id: number;
  name: string;
  symbol: string;
  assetClass: string;
  spread?: number | null;
}

export interface ArticleDetailData {
  title: string;
  category: string;
  author?: string | null;
  authorRole?: string | null;
  date?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  body?: SlateNode[] | null;
  chartEmbed?: string | null;
  relatedInstruments?: RelatedInstrument[] | null;
}

export interface RelatedArticle {
  slug: string;
  category?: string | null;
  title: string;
  image?: string | null;
  /** Optional explicit pill color; derived from `category` via CAT_COLORS when absent. */
  catColor?: string;
}

const CAT_COLORS: Record<string, string> = {
  MACRO: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  STRATEGY: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  ANALYSIS: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  EDUCATION: 'bg-accent/10 text-accent',
  'MARKET-NEWS': 'bg-[#F59E0B]/15 text-[#F59E0B]',
  TUTORIALS: 'bg-accent/10 text-accent',
  'COMPANY-UPDATES': 'bg-[#3B82F6]/15 text-[#3B82F6]',
  FOREX: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  COMMODITIES: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  INDICES: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  CRYPTO: 'bg-[#06B6D4]/15 text-[#06B6D4]',
  COMPANY: 'bg-accent/10 text-accent',
  REGULATION: 'bg-[#EF4444]/15 text-[#EF4444]',
};

interface ResearchDetailPageProps {
  slug?: string;
  article: ArticleDetailData;
  relatedArticles?: RelatedArticle[] | null;
  basePath?: string;
}

export function ResearchDetailPage({
  slug: _slug,
  article,
  relatedArticles,
  basePath = 'research',
}: ResearchDetailPageProps) {
  const locale = useLocale();
  const t = useTranslations('researchDetail');
  const isAr = locale === 'ar';
  const contentRef = useRef<HTMLDivElement>(null);

  const related = relatedArticles ?? [];
  const hasBody = Boolean(article.body && article.body.length > 0);
  const category = (article.category ?? '').toUpperCase();
  const catColor = CAT_COLORS[category] ?? 'bg-accent/10 text-accent';
  const dateLocale = isAr ? 'ar-AE' : 'en-US';
  const date = article.date
    ? new Date(article.date).toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  const minutes = readingMinutes(article.body);
  const readTime = minutes != null ? (isAr ? `${minutes} دقائق` : `${minutes} min read`) : null;

  return (
    <>
      <ReadingProgress targetRef={contentRef} />
      {/* Breadcrumb */}
      <section className="bg-transparent px-5 pb-0 pt-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/${basePath}`}
              className="font-body text-muted hover:text-foreground text-[12px] transition-colors"
            >
              {basePath === 'education/blog'
                ? t('backBlog')
                : basePath === 'daily-news'
                  ? t('backNews')
                  : t('backResearch')}
            </Link>
            {category && (
              <>
                <span className="text-muted text-[12px]">/</span>
                <span className="font-body text-muted text-[12px]">
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Readable content region — the reading-progress bar tracks from the article
          title through the end of the body (breadcrumb, related and CTA excluded). */}
      <div ref={contentRef}>
        {/* Hero */}
        <section className="px-5 pb-6 pt-4">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="mb-3 flex items-center gap-2">
              {category && (
                <span
                  className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${catColor}`}
                >
                  {category}
                </span>
              )}
              {(date || readTime) && (
                <span className="font-body text-muted text-[11px]">
                  {[date, readTime].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <h1 className="text-foreground text-headline mb-3 font-sans">{article.title}</h1>
            {article.author && (
              <p className="font-body text-muted text-[13px]">
                {isAr ? 'بقلم' : 'By'}{' '}
                <span className="text-foreground font-medium">{article.author}</span>
                {article.authorRole ? ` · ${article.authorRole}` : ''}
              </p>
            )}
          </div>
        </section>

        {/* Hero image (CMS featured image only — no placeholder graphic) */}
        {article.image && (
          <section className="px-5 pb-8">
            <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
              <div className="aspect-[16/9] overflow-hidden rounded-[18px] md:aspect-[2/1]">
                <img
                  src={article.image}
                  alt={article.imageAlt ?? article.title}
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero-green-chart.jpg';
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* Article body (CMS rich text only) */}
        {hasBody && (
          <section className="px-5 pb-10">
            <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
              <RichText content={article.body} />

              {/* Share */}
              <div className="dark:border-border mt-8 flex items-center justify-between border-t border-[#e5e7eb] pt-5">
                <span className="font-body text-muted text-[12px]">{t('shareLabel')}</span>
                <div className="flex gap-3">
                  {['X', 'in', 'link'].map((s) => (
                    <button
                      key={s}
                      className="border-border text-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-medium transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Related instruments — shown when the article has relatedInstruments from CMS */}
      {article.relatedInstruments && article.relatedInstruments.length > 0 && (
        <section className="px-5 pb-6 pt-2">
          <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <p className="text-foreground mb-3 font-sans text-[15px] font-semibold">
              {t('relatedMarkets')}
            </p>
            <div className="flex flex-wrap gap-2">
              {article.relatedInstruments.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/${locale}/markets/${inst.assetClass}`}
                  className="border-border hover:border-accent bg-surface flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
                >
                  <span className="text-foreground font-sans text-[13px] font-semibold">
                    {inst.symbol}
                  </span>
                  <span className="font-body text-muted text-[11px]">{inst.name}</span>
                  {inst.spread != null && (
                    <span className="text-accent font-mono text-[10px]">{inst.spread} pip</span>
                  )}
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Related articles — only real CMS items, section hidden when there are none */}
      {related.length > 0 && (
        <section className="bg-surface px-5 pb-10 pt-8">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <ScrollReveal>
              <p className="text-foreground mb-5 font-sans text-[18px] font-semibold">
                {t('keepReading')}
              </p>
            </ScrollReveal>
            <div className="dark:divide-border flex flex-col divide-y divide-[#e5e7eb] xl:grid xl:grid-cols-3 xl:gap-[14px] xl:divide-y-0">
              {related.map((art, artIndex) => {
                const catLabel = (art.category ?? '').toUpperCase();
                const pillColor =
                  art.catColor ?? CAT_COLORS[catLabel] ?? 'bg-accent/10 text-accent';
                return (
                  <ScrollReveal key={art.slug} index={artIndex}>
                    <Link
                      href={`/${locale}/${basePath}/${art.slug}`}
                      className="group flex items-center justify-between gap-4 py-4 xl:flex-col xl:items-start xl:gap-3 xl:py-0"
                    >
                      {/* Desktop: cover thumbnail (CMS image, gradient fallback); image zooms + gains an inner shadow on hover (client-approved article-card override) */}
                      <div className="relative hidden after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_10px_30px_-6px_rgba(0,0,0,0.5)] after:transition-opacity after:duration-300 after:content-[''] motion-safe:group-hover:after:opacity-100 xl:block xl:h-[140px] xl:w-full xl:overflow-hidden xl:rounded-[12px] xl:bg-gradient-to-br xl:from-[#0d2b1a] xl:via-[#0a1f12] xl:to-[#111111]">
                        <img
                          src={art.image || '/images/hero-green-chart.jpg'}
                          alt={art.title}
                          onError={(e) => {
                            e.currentTarget.src = '/images/hero-green-chart.jpg';
                          }}
                          className="h-full w-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="min-w-0 flex-1 xl:w-full xl:flex-none">
                        {catLabel && (
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className={`font-body rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.08em] ${pillColor}`}
                            >
                              {catLabel}
                            </span>
                          </div>
                        )}
                        <p className="text-foreground group-hover:text-accent font-sans text-[13px] font-semibold leading-[1.35] transition-colors xl:text-[14px]">
                          {art.title}
                        </p>
                      </div>
                      <svg
                        width="7"
                        height="12"
                        viewBox="0 0 7 12"
                        fill="none"
                        className="text-muted group-hover:text-accent flex-shrink-0 transition-colors xl:hidden rtl:-scale-x-100"
                      >
                        <path
                          d="M1 1L6 6L1 11"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="text-headline mb-3 font-sans text-white">
            {t('tradeHeading')}
            <br />
            {t('tradeSubheading')}
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            {t('tradeDesc')}
          </p>
        </ScrollReveal>
      </section>
    </>
  );
}
