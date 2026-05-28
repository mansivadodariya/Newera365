'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Category = 'ALL' | 'MACRO' | 'STRATEGY' | 'EDUCATION' | 'ANALYSIS';

const CATEGORIES: Category[] = ['ALL', 'MACRO', 'STRATEGY', 'ANALYSIS', 'EDUCATION'];

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

export function ResearchPage() {
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featured = ARTICLES.find((a) => a.featured)!;
  const list = ARTICLES.filter((a) => !a.featured);

  const filteredList = useMemo(
    () => (activeCategory === 'ALL' ? list : list.filter((a) => a.category === activeCategory)),
    [activeCategory, list],
  );

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.08]">
            Notes from
            <br />
            the <span className="text-accent">trading floor.</span>
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            Market analysis, commentary and research from our trading desk and partners.
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <section className="dark:bg-background bg-white px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-accent text-white'
                    : 'text-muted bg-[#F2F2F4] hover:bg-[#e5e5e5] dark:bg-[#2a2a2a] dark:hover:bg-[#3a3a3a]'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured article */}
      {activeCategory === 'ALL' && (
        <section className="dark:bg-background bg-white px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <Link
              href={`/${locale}/research/${featured.slug}`}
              className="group flex flex-col overflow-hidden rounded-[22px] bg-[#111111]"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.14)' }}
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
                    className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${CAT_COLORS[featured.category]}`}
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
                <p className="font-body mb-4 text-[13px] leading-[1.55] text-white/60">
                  {featured.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] text-white/40">
                    {featured.date} · {featured.readTime} read
                  </span>
                  <span className="font-body text-accent flex items-center gap-1.5 text-[12px] font-medium">
                    Read article
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

      {/* Article list */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex flex-col divide-y divide-[#e5e7eb] dark:divide-[#2a2a2a]">
            {filteredList.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/research/${article.slug}`}
                className="group flex items-start gap-4 py-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`font-body rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.08em] ${CAT_COLORS[article.category]}`}
                    >
                      {article.category}
                    </span>
                    <span className="font-body text-muted text-[11px]">{article.date}</span>
                  </div>
                  <p className="text-foreground group-hover:text-accent mb-1 font-sans text-[14px] font-semibold leading-[1.35] transition-colors">
                    {article.title}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-[1.5]">
                    {article.summary}
                  </p>
                  <span className="font-body text-muted mt-2 block text-[11px]">
                    {article.readTime} read
                  </span>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2 pt-1">
                  <Sparkline data={article.sparkline} />
                  <svg
                    width="7"
                    height="12"
                    viewBox="0 0 7 12"
                    fill="none"
                    className="text-muted group-hover:text-accent transition-colors"
                  >
                    <path
                      d="M1 1L6 6L1 11"
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
            <p className="font-body text-muted py-10 text-center text-[14px]">
              No articles in this category yet.
            </p>
          )}

          <button className="font-body text-muted hover:text-foreground mt-6 flex w-full items-center justify-center gap-2 py-3 text-[13px] font-medium underline underline-offset-4 transition-colors">
            Load more articles
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            WEEKLY BRIEFING
          </SectionKicker>
          <h2 className="mb-2 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            Get the briefing.
            <br />
            Monday, 7am.
          </h2>
          <p className="font-body mb-6 text-[13px] leading-relaxed text-white/60">
            A 5-minute look at what matters in the new week — straight from the trading desk to your
            inbox.
          </p>
          {subscribed ? (
            <div className="bg-accent/20 flex items-center gap-3 rounded-[14px] px-4 py-4">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10l4 4 8-8"
                  stroke="#00B050"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-body text-[14px] text-white">
                You&apos;re on the list. See you Monday.
              </span>
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
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-body focus:border-accent flex-1 rounded-full border border-white/20 bg-white/[0.07] px-4 py-3 text-[13px] text-white placeholder-white/40 outline-none"
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 font-body flex-shrink-0 rounded-full px-5 py-3 text-[13px] font-medium text-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
