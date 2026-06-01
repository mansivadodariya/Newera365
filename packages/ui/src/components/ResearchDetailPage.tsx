'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { RichText } from './RichText';
import type { SlateNode } from './RichText';

export interface ArticleDetailData {
  title: string;
  category: string;
  author?: string | null;
  authorRole?: string | null;
  date?: string | null;
  readTime?: string | null;
  body?: SlateNode[] | null;
  chartEmbed?: string | null;
}

const CAT_COLORS: Record<string, string> = {
  MACRO: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  STRATEGY: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  ANALYSIS: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  EDUCATION: 'bg-accent/10 text-accent',
  'MARKET-NEWS': 'bg-[#F59E0B]/15 text-[#F59E0B]',
  TUTORIALS: 'bg-accent/10 text-accent',
  'COMPANY-UPDATES': 'bg-[#3B82F6]/15 text-[#3B82F6]',
};

const RELATED = [
  {
    slug: 'gold-1400-momentum-or-top',
    category: 'ANALYSIS',
    catColor: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    title: 'Gold at $2,400 — momentum or top? Reading the COT report',
    readTime: '5 min',
  },
  {
    slug: 'ecb-rate-decision-what-traders-missed',
    category: 'MACRO',
    catColor: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    title: 'The ECB rate decision and what the market priced wrong',
    readTime: '7 min',
  },
  {
    slug: 'volatility-trap-three-setups',
    category: 'STRATEGY',
    catColor: 'bg-[#3B82F6]/15 text-[#3B82F6]',
    title: 'The volatility trap: three setups professional traders avoid',
    readTime: '8 min',
  },
] as const;

interface ResearchDetailPageProps {
  slug?: string;
  article?: ArticleDetailData | null;
  basePath?: string;
}

export function ResearchDetailPage({
  slug: _slug,
  article,
  basePath = 'research',
}: ResearchDetailPageProps) {
  const locale = useLocale();

  const title = article?.title ?? 'How the new era of central bank policy is reshaping FX.';
  const category = article?.category?.toUpperCase() ?? 'MACRO';
  const catColor = CAT_COLORS[category] ?? 'bg-accent/10 text-accent';
  const author = article?.author ?? 'Anya Morozova';
  const authorRole = article?.authorRole ?? 'Macro Desk';
  const date = article?.date
    ? new Date(article.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'May 26, 2025';
  const readTime = article?.readTime ?? '6 min';
  const hasCmsBody = article?.body && article.body.length > 0;

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-background px-5 pb-0 pt-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/${basePath}`}
              className="font-body text-muted hover:text-foreground text-[12px] transition-colors"
            >
              {basePath === 'blog' ? 'Blog' : 'Research'}
            </Link>
            <span className="text-muted text-[12px]">/</span>
            <span className="font-body text-muted text-[12px]">
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-background px-5 pb-6 pt-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${catColor}`}
            >
              {category}
            </span>
            <span className="font-body text-muted text-[11px]">
              {date} · {readTime} read
            </span>
          </div>
          <h1 className="text-foreground mb-3 font-sans text-[28px] font-semibold leading-[1.15] tracking-[-0.56px]">
            How the new era of central bank policy is reshaping FX.
          </h1>
          <p className="font-body text-muted text-[13px]">
            By <span className="text-foreground font-medium">{author}</span> · {authorRole}
          </p>
        </div>
      </section>

      {/* Hero chart */}
      <section className="bg-background px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1a10] to-[#111111] p-5">
            <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="articleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B050" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00B050" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points="0,80 40,70 80,75 120,55 160,60 200,35 240,40 280,20 300,15 300,100 0,100"
                fill="url(#articleGrad)"
              />
              <polyline
                points="0,80 40,70 80,75 120,55 160,60 200,35 240,40 280,20 300,15"
                fill="none"
                stroke="#00B050"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-body mt-2 text-[9px] uppercase tracking-[0.1em] text-white/40">
              EUR/USD · 6 month chart
            </p>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {hasCmsBody ? (
            <RichText content={article!.body} />
          ) : (
            <div className="prose-custom flex flex-col gap-5">
              <p className="font-body text-foreground text-[15px] leading-[1.7]">
                The post-pandemic playbook is being rewritten in real time. Here&apos;s how central
                banks are diverging, and what it means for the major currency pairs over the next
                nine months.
              </p>

              <h2 className="text-foreground font-sans text-[20px] font-semibold leading-[1.2]">
                A three-speed central bank story.
              </h2>

              {/* Pull quote */}
              <div className="border-accent border-l-2 pl-4">
                <p className="font-body text-foreground/80 text-[15px] italic leading-[1.6]">
                  &ldquo;By the time the Fed cuts, the trade is already priced in. The edge is in
                  positioning data — not the dot plot.&rdquo;
                </p>
              </div>

              <h2 className="text-foreground font-sans text-[20px] font-semibold leading-[1.2]">
                What is priced, what is not.
              </h2>

              <p className="font-body text-foreground text-[15px] leading-[1.7]">
                Raw futures data confirms cuts from the market two times in the next nine months for
                EUR. One next near the end of the day. That goes EURUSD to 1.0820 at one market —
                and historically it takes the EURUSD more time to recover policy expectations shift
                endlessly.
              </p>

              {/* Mini bar chart */}
              <div className="overflow-hidden rounded-[14px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
                <p className="font-body text-muted mb-3 text-[10px] uppercase tracking-[0.1em]">
                  Rate expectations · next 9 months
                </p>
                <div className="flex h-[60px] items-end gap-2">
                  {[
                    { label: 'USD', h: 30, color: '#3B82F6' },
                    { label: 'EUR', h: 65, color: '#F59E0B' },
                    { label: 'GBP', h: 45, color: '#8B5CF6' },
                    { label: 'JPY', h: 80, color: '#00B050' },
                    { label: 'AUD', h: 50, color: '#EF4444' },
                  ].map((b) => (
                    <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm"
                        style={{ height: b.h, backgroundColor: b.color, opacity: 0.8 }}
                      />
                      <span className="font-body text-muted text-[9px]">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-foreground font-sans text-[20px] font-semibold leading-[1.2]">
                Trading the divergence.
              </h2>

              <p className="font-body text-foreground text-[15px] leading-[1.7]">
                The cleanest expression for now is EUR/JPY. The ECB easing bias meets BoJ tightening
                on this pair, and one news item near the top of every EUR/JPY easing trigger. That
                goes EURUSD at 1.08 easing bias — and historically it takes the EURUSD move toward
                policy expectations shift.
              </p>

              {/* Risk warning */}
              <div className="flex gap-3 rounded-[14px] bg-[#FFF7ED] p-4 dark:bg-[#2a1a00]">
                <svg
                  className="mt-0.5 flex-shrink-0 text-[#F59E0B]"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 2L1 14h14L8 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6v4M8 11.5v.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="font-body text-[12px] leading-[1.55] text-[#92400E] dark:text-[#F59E0B]/80">
                  Trading leveraged products such as CFDs carries a high level of risk and may not
                  be suitable for all investors. You may lose more than your initial deposit. Past
                  performance is not indicative of future results.
                </p>
              </div>
            </div>
          )}

          {/* Share */}
          <div className="dark:border-border mt-8 flex items-center justify-between border-t border-[#e5e7eb] pt-5">
            <span className="font-body text-muted text-[12px]">Share this article</span>
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

      {/* Related articles */}
      <section className="dark:bg-background bg-surface px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="text-foreground mb-5 font-sans text-[18px] font-semibold">Keep reading.</p>
          <div className="dark:divide-border flex flex-col divide-y divide-[#e5e7eb]">
            {RELATED.map((art) => (
              <Link
                key={art.slug}
                href={`/${locale}/${basePath}/${art.slug}`}
                className="group flex items-center justify-between gap-4 py-4 xl:flex-col xl:items-start xl:gap-3 xl:px-6 xl:py-0 xl:first:pl-0 xl:last:pr-0"
              >
                {/* Desktop: dark thumbnail */}
                <div className="hidden xl:block xl:h-[140px] xl:w-full xl:overflow-hidden xl:rounded-[12px] xl:bg-gradient-to-br xl:from-[#0d2b1a] xl:via-[#0a1f12] xl:to-[#111111]" />
                <div className="min-w-0 flex-1 xl:w-full xl:flex-none">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`font-body rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.08em] ${art.catColor}`}
                    >
                      {art.category}
                    </span>
                    <span className="font-body text-muted text-[11px]">{art.readTime} read</span>
                  </div>
                  <p className="text-foreground group-hover:text-accent font-sans text-[13px] font-semibold leading-[1.35] transition-colors xl:text-[14px]">
                    {art.title}
                  </p>
                </div>
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  className="text-muted group-hover:text-accent flex-shrink-0 transition-colors xl:hidden"
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Trade what
            <br />
            you just read.
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Apply the analysis on a live or demo account — same execution, no risk on demo.
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent hover:bg-accent/90 font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Open account
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
