'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type FilterTab = 'All' | 'Majors' | 'Crosses' | 'Commodities';
type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

interface PairCall {
  symbol: string;
  price: string;
  target: string;
  conf: number;
  sentiment: Sentiment;
  up: boolean;
  category: FilterTab;
  sparkPoints: number[];
}

const CALLS: PairCall[] = [
  {
    symbol: 'EUR/USD',
    price: '1.0842',
    target: '+ 1.0980',
    conf: 80,
    sentiment: 'BULLISH',
    up: true,
    category: 'Majors',
    sparkPoints: [28, 30, 29, 33, 31, 35, 34, 37, 36, 40],
  },
  {
    symbol: 'USD/JPY',
    price: '157.34',
    target: '± 35.20',
    conf: 65,
    sentiment: 'BEARISH',
    up: false,
    category: 'Majors',
    sparkPoints: [40, 38, 39, 37, 36, 35, 33, 32, 30, 28],
  },
  {
    symbol: 'GBP/USD',
    price: '1.2718',
    target: '+ 1.3710',
    conf: 50,
    sentiment: 'NEUTRAL',
    up: true,
    category: 'Majors',
    sparkPoints: [30, 31, 30, 32, 31, 33, 32, 33, 32, 34],
  },
  {
    symbol: 'XAU/USD',
    price: '2,318.40',
    target: '+ 1,360.00',
    conf: 72,
    sentiment: 'BULLISH',
    up: true,
    category: 'Commodities',
    sparkPoints: [26, 29, 27, 32, 30, 35, 34, 38, 37, 42],
  },
  {
    symbol: 'BTC/USD',
    price: '67,250',
    target: '+ 72,000',
    conf: 60,
    sentiment: 'BULLISH',
    up: true,
    category: 'Commodities',
    sparkPoints: [25, 30, 28, 33, 31, 36, 35, 39, 38, 44],
  },
  {
    symbol: 'GBP/JPY',
    price: '198.12',
    target: '± 2.10',
    conf: 45,
    sentiment: 'NEUTRAL',
    up: false,
    category: 'Crosses',
    sparkPoints: [34, 33, 35, 32, 34, 31, 33, 30, 32, 31],
  },
];

const ANALYST = {
  initials: 'DR',
  name: 'Diego Romero',
  title: 'Senior FX Analyst',
  updated: '20 May, 09:14 UTC',
  commentary: `EUR/USD continues to grind higher as the ECB pushes back against July cut expectations. With US data softening and the dollar index breaking below the 200-day average, we see room for a move toward 1.0980 in the coming weeks. Key risk: a hot NFP print could trigger a sharp reversal back toward 1.0750.`,
};

const TABS: FilterTab[] = ['All', 'Majors', 'Crosses', 'Commodities'];

const TIMEFRAMES = ['1H', '4H', '1D', '1W'];

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const w = 60;
  const h = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const color = up ? '#00B050' : '#EF4444';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturedChart({ pair }: { pair: PairCall }) {
  const [tf, setTf] = useState('1D');
  const w = 320;
  const h = 100;
  const points = pair.sparkPoints;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');
  const areaCoords = `0,${h} ${coords} ${w},${h}`;

  return (
    <div
      className="overflow-hidden rounded-[20px] bg-[#111111]"
      style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.12)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-white/50">
          {pair.symbol} <span className="text-white/30">·</span> D1
        </p>
        <div className="flex gap-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`font-body rounded px-2 py-[3px] text-[10px] transition-colors ${
                tf === t ? 'bg-[#00B050] text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="px-5 pb-3 pt-2">
        <span className="font-sans text-[32px] font-semibold text-white">{pair.price}</span>
        <span className="ml-2 font-sans text-[14px] font-medium text-[#00B050]">+1.27%</span>
      </div>

      {/* Chart */}
      <div className="relative px-0">
        <svg
          width="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="block h-[100px]"
        >
          <defs>
            <linearGradient id="featuredChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B050" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00B050" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaCoords} fill="url(#featuredChartGrad)" />
          <polyline
            points={coords}
            fill="none"
            stroke="#00B050"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Target */}
      <div className="flex justify-end px-5 pb-4 pt-1">
        <span className="font-body text-[10px] uppercase tracking-[0.1em] text-white/40">
          TARGET {pair.target.replace('+ ', '')}
        </span>
      </div>
    </div>
  );
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  BULLISH: 'bg-[#00B050]/10 text-[#00B050]',
  BEARISH: 'bg-[#EF4444]/10 text-[#EF4444]',
  NEUTRAL: 'bg-[#6B7280]/10 text-[#6B7280]',
};

export function AnalystChartPage() {
  const t = useTranslations('analystChart');
  const [tab, setTab] = useState<FilterTab>('All');
  const analyst = ANALYST;
  const featured = CALLS[0]!;

  const filtered = tab === 'All' ? CALLS : CALLS.filter((c) => c.category === tab);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.08] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            {t('heroLine2')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Featured chart card */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <FeaturedChart pair={featured} />
        </div>
      </section>

      {/* Pair filter + This week's calls */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Filter */}
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('filterKicker')}
          </SectionKicker>
          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((tabItem) => (
              <button
                key={tabItem}
                onClick={() => setTab(tabItem)}
                className={`font-body rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                  tab === tabItem
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#f3f4f6] text-[#6b7280] dark:bg-[#1c1c1c] dark:text-[#9ca3af]'
                }`}
              >
                {tabItem === 'All'
                  ? t('filterAll')
                  : tabItem === 'Majors'
                    ? t('filterMajors')
                    : tabItem === 'Crosses'
                      ? t('filterCrosses')
                      : t('filterCommodities')}
              </button>
            ))}
          </div>

          {/* This week's calls */}
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-3">
            {t('callsKicker')}
          </SectionKicker>
          <div className="flex flex-col gap-[10px]">
            {filtered.map((p) => (
              <div
                key={p.symbol}
                className="bg-surface shadow-card flex items-center gap-3 rounded-[16px] px-4 py-3 dark:shadow-none"
              >
                {/* Symbol + sparkline */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-body rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.06em] ${SENTIMENT_STYLES[p.sentiment]}`}
                    >
                      {p.sentiment === 'BULLISH' ? '▲' : p.sentiment === 'BEARISH' ? '▼' : '●'}{' '}
                      {p.sentiment}
                    </span>
                  </div>
                  <p className="text-foreground mt-[3px] font-sans text-[15px] font-semibold">
                    {p.symbol}
                  </p>
                </div>

                {/* Sparkline */}
                <div className="flex-shrink-0">
                  <Sparkline points={p.sparkPoints} up={p.up} />
                </div>

                {/* Price + target */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-foreground font-sans text-[14px] font-semibold tabular-nums">
                    {p.price}
                  </p>
                  <p
                    className={`font-body text-[11px] tabular-nums ${p.up ? 'text-accent' : 'text-[#EF4444]'}`}
                  >
                    {p.target}
                  </p>
                </div>

                {/* Confidence */}
                <div className="w-[48px] flex-shrink-0 text-right">
                  <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                    {t('confLabel')}
                  </p>
                  <p className="font-sans text-[13px] font-semibold text-[#111] dark:text-white">
                    {p.conf}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analyst commentary */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('commentaryLabel')}
          </SectionKicker>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#111111]">
              <span className="font-sans text-[13px] font-semibold text-white">
                {analyst.initials}
              </span>
            </div>
            <div>
              <p className="text-foreground font-sans text-[14px] font-semibold">{analyst.name}</p>
              <p className="font-body text-muted text-[11px]">
                {analyst.title} · {analyst.updated}
              </p>
            </div>
          </div>
          <p className="font-body text-foreground mt-4 text-[14px] leading-[1.7]">
            {analyst.commentary}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] text-center md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-2 font-sans text-[28px] font-semibold leading-[1.1] text-white xl:text-[36px]">
            {t('ctaHeading')}
          </h2>
          <p className="font-body mb-7 text-[14px] text-white/60">{t('ctaDesc')}</p>
          <a
            href="/en/register"
            className="bg-accent font-body hover:bg-accent/90 inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-8 text-[14px] font-medium text-white transition-colors"
          >
            {t('ctaBtn')}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
