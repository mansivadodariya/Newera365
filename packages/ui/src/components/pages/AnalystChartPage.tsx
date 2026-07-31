'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { ChartWidget } from '../market/ChartWidget';
import { sameCategory } from '../../lib/filterUtils';

export interface CmsAnalystCallItem {
  id: number;
  symbol: string;
  tvSymbol: string;
  currentPrice: string;
  targetPrice: string;
  confidence: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  category: 'Majors' | 'Crosses' | 'Commodities' | 'Crypto';
  sparkPoints?: string | null;
}

export interface CmsAnalystProfile {
  initials?: string | null;
  name?: string | null;
  title?: string | null;
  updated?: string | null;
  commentaryEn?: string | null;
  commentaryAr?: string | null;
}

type FilterTab = 'All' | 'Majors' | 'Crosses' | 'Commodities' | 'Crypto';
type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

interface PairCall {
  symbol: string;
  tv: string; // TradingView symbol, e.g. OANDA:EURUSD
  price: string;
  target: string;
  conf: number;
  sentiment: Sentiment;
  up: boolean;
  category: FilterTab;
  sparkPoints: number[];
}

// Timeframe label → TradingView advanced-chart interval and visible range.
const TF_INTERVAL: Record<string, string> = { '1H': '60', '4H': '240', '1D': 'D', '1W': 'W' };
const TF_RANGE: Record<string, string> = { '1H': '1D', '4H': '5D', '1D': '3M', '1W': '12M' };

const CALLS: PairCall[] = [
  {
    symbol: 'EUR/USD',
    tv: 'OANDA:EURUSD',
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
    tv: 'OANDA:USDJPY',
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
    tv: 'OANDA:GBPUSD',
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
    tv: 'OANDA:XAUUSD',
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
    tv: 'BITSTAMP:BTCUSD',
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
    tv: 'OANDA:GBPJPY',
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

const TABS: FilterTab[] = ['All', 'Majors', 'Crosses', 'Commodities', 'Crypto'];

interface AnalystChartPageProps {
  cmsCalls?: CmsAnalystCallItem[];
  cmsAnalyst?: CmsAnalystProfile | null;
  locale?: string;
}

function mapCmsCall(c: CmsAnalystCallItem): PairCall {
  let sparkPoints: number[] = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
  if (c.sparkPoints) {
    try {
      sparkPoints = JSON.parse(c.sparkPoints) as number[];
    } catch {
      // keep default
    }
  }
  return {
    symbol: c.symbol,
    tv: c.tvSymbol,
    price: c.currentPrice,
    target: c.targetPrice,
    conf: c.confidence,
    sentiment: c.sentiment,
    up: c.sentiment === 'BULLISH',
    category: c.category as FilterTab,
    sparkPoints,
  };
}

const TIMEFRAMES = ['1H', '4H', '1D', '1W'];

// Desk container: mobile-first narrow, opens up on md/xl to a working spread.
const DESK = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Strip the ledger prefix ("+ " / "± " / "- ") so the raw figure sits alone in mono.
function targetValue(target: string): string {
  return target.replace(/^[+\-±]\s*/, '');
}

function sentimentLabel(s: Sentiment, t: (key: string) => string): string {
  return s === 'BULLISH'
    ? t('sentimentBullish')
    : s === 'BEARISH'
      ? t('sentimentBearish')
      : t('sentimentNeutral');
}

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

// Vertical bias caret - direction is up/down, so it is NOT flipped for RTL.
function Caret({ up }: { up: boolean }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      {up ? (
        <path d="M5 2l3 5H2z" fill="currentColor" />
      ) : (
        <path d="M5 8L2 3h6z" fill="currentColor" />
      )}
    </svg>
  );
}

const DARK_SENTIMENT: Record<Sentiment, string> = {
  BULLISH: 'bg-[#00B050]/15 text-[#00B050]',
  BEARISH: 'bg-[#EF4444]/15 text-[#EF4444]',
  NEUTRAL: 'bg-white/10 text-white/60',
};

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  BULLISH: 'bg-[#00B050]/10 text-[#00B050]',
  BEARISH: 'bg-[#EF4444]/10 text-[#EF4444]',
  NEUTRAL: 'bg-[#6B7280]/10 text-muted',
};

function FeaturedChart({ pair }: { pair: PairCall }) {
  const [tf, setTf] = useState('1D');

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#111111]"
      style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.12)' }}
    >
      {/* Terminal header: live symbol + timeframe selector */}
      <div className="flex items-center justify-between px-5 pt-4">
        <p
          dir="ltr"
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-white/50"
        >
          <span className="bg-accent inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" />
          {pair.symbol} <span className="text-white/30">/</span> {tf}
        </p>
        <div className="flex gap-1">
          {TIMEFRAMES.map((tfLabel) => (
            <button
              key={tfLabel}
              onClick={() => setTf(tfLabel)}
              className={`rounded px-2 py-[3px] font-mono text-[10px] tabular-nums transition-colors ${
                tf === tfLabel ? 'bg-[#00B050] text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tfLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Live TradingView chart - re-keyed on symbol/interval so it remounts cleanly */}
      <div className="mt-3 flex-1 px-3 pb-4">
        <div style={{ height: 300 }}>
          <ChartWidget
            key={`${pair.tv}-${tf}`}
            type="advanced-chart"
            symbol={pair.tv}
            theme="dark"
            width="100%"
            height="100%"
            config={{
              interval: TF_INTERVAL[tf] ?? 'D',
              range: TF_RANGE[tf] ?? '3M',
              hide_top_toolbar: false,
              hide_legend: false,
              allow_symbol_change: false,
              backgroundColor: 'rgba(17,17,17,1)',
              gridColor: 'rgba(255,255,255,0.04)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Terminal-ledger readout for the featured call: mono, tabular-nums, direction in accent/red.
function ReadoutLedger({ pair }: { pair: PairCall }) {
  const t = useTranslations('analystChart');
  const dirColor = pair.up ? 'text-[#00B050]' : 'text-[#EF4444]';

  return (
    <div
      className="flex h-full flex-col rounded-[20px] border border-white/[0.06] bg-[#111111] p-5"
      style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.10)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-eyebrow font-mono uppercase text-white/40">{t('featuredKicker')}</p>
          <p dir="ltr" className="text-title mt-1 font-sans text-white">
            {pair.symbol}
          </p>
        </div>
        <span
          className={`rounded px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${DARK_SENTIMENT[pair.sentiment]}`}
        >
          {sentimentLabel(pair.sentiment, t)}
        </span>
      </div>

      <dl className="mt-5 border-t border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-3">
          <dt className="text-eyebrow font-mono uppercase text-white/40">{t('lastLabel')}</dt>
          <dd dir="ltr" className="font-mono text-[15px] tabular-nums text-white">
            {pair.price}
          </dd>
        </div>
        <div className="flex items-center justify-between border-b border-white/[0.06] py-3">
          <dt className="text-eyebrow font-mono uppercase text-white/40">{t('targetLabel')}</dt>
          <dd
            dir="ltr"
            className={`inline-flex items-center gap-1.5 font-mono text-[15px] font-semibold tabular-nums ${dirColor}`}
          >
            <Caret up={pair.up} />
            {targetValue(pair.target)}
          </dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-eyebrow font-mono uppercase text-white/40">{t('convictionLabel')}</dt>
          <dd dir="ltr" className="font-mono text-[15px] tabular-nums text-white">
            {pair.conf}%
          </dd>
        </div>
      </dl>

      {/* Conviction bar - represents the figure above, not decoration */}
      <div className="mt-auto pt-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#00B050] transition-[width] duration-500"
            style={{ width: `${Math.max(0, Math.min(100, pair.conf))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function AnalystChartPage({ cmsCalls, cmsAnalyst, locale }: AnalystChartPageProps = {}) {
  const t = useTranslations('analystChart');
  const [tab, setTab] = useState<FilterTab>('All');
  // Symbol picked from the week's-calls list; null = first call of the filter.
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const calls = cmsCalls?.length ? cmsCalls.map(mapCmsCall) : CALLS;
  const analyst = {
    initials: cmsAnalyst?.initials ?? ANALYST.initials,
    name: cmsAnalyst?.name ?? ANALYST.name,
    title: cmsAnalyst?.title ?? ANALYST.title,
    updated: cmsAnalyst?.updated ?? ANALYST.updated,
    commentary:
      (locale === 'ar' ? cmsAnalyst?.commentaryAr : cmsAnalyst?.commentaryEn) ?? ANALYST.commentary,
  };

  const filtered = tab === 'All' ? calls : calls.filter((c) => sameCategory(c.category, tab));
  const selectedCall = selectedSymbol
    ? filtered.find((c) => c.symbol === selectedSymbol)
    : undefined;
  const featured = selectedCall ?? filtered[0] ?? calls[0]!;

  const half = Math.ceil(filtered.length / 2);
  const leftItems = filtered.slice(0, half);
  const rightItems = filtered.slice(half);

  return (
    <>
      {/* Desk masthead */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <ScrollReveal className={DESK}>
          <SectionKicker className="mb-4">{t('deskKicker')}</SectionKicker>
          <h1 className="text-foreground text-display mb-3 font-sans">
            {t('heroLine1')} {t('heroLine2')}
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="text-body-lg text-muted max-w-[440px]">{t('heroSubtitle')}</p>

          {/* Byline + timestamp - the masthead ledger line */}
          <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-3 dark:border-white/[0.08]">
            <p className="text-caption text-foreground">
              <span className="font-semibold">{analyst.name}</span>
              <span className="text-muted"> · {analyst.title}</span>
            </p>
            <p dir="ltr" className="text-muted font-mono text-[11px] uppercase tracking-[0.08em]">
              {t('asOfLabel')} {analyst.updated}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured call - chart terminal + readout ledger */}
      <section className="px-5 pb-8">
        <ScrollReveal className={DESK}>
          <SectionKicker className="mb-4">{t('featuredKicker')}</SectionKicker>
          <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
            <FeaturedChart pair={featured} />
            <ReadoutLedger pair={featured} />
          </div>
        </ScrollReveal>
      </section>

      {/* This week's calls - the desk blotter */}
      <section className="px-5 pb-8">
        <ScrollReveal className={DESK}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionKicker>{t('callsKicker')}</SectionKicker>
            <div className="flex flex-wrap gap-2">
              {TABS.map((tabItem) => (
                <button
                  key={tabItem}
                  onClick={() => setTab(tabItem)}
                  className={`rounded-full px-3.5 py-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                    tab === tabItem
                      ? 'bg-accent text-white'
                      : 'text-muted hover:text-foreground bg-[#F0F4F1] dark:bg-[#16181d] dark:hover:text-white'
                  }`}
                >
                  {tabItem === 'All'
                    ? t('filterAll')
                    : tabItem === 'Majors'
                      ? t('filterMajors')
                      : tabItem === 'Crosses'
                        ? t('filterCrosses')
                        : tabItem === 'Commodities'
                          ? t('filterCommodities')
                          : t('filterCrypto')}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger card: 2 columns on md/xl with vertical separator in between (or full width if 1 item) */}
          <div className="overflow-hidden rounded-[20px] border border-[#1b2b20] bg-[#080b09] shadow-2xl dark:border-[#1b2b20] dark:bg-[#080b09]">
            <div
              className={
                rightItems.length === 0 ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2'
              }
            >
              {/* Left Column */}
              <div
                className={
                  rightItems.length === 0
                    ? ''
                    : 'md:border-r md:border-[#1b2b20] rtl:md:border-l rtl:md:border-r-0 rtl:md:border-[#1b2b20]'
                }
              >
                <div className="hidden items-center justify-between border-b border-[#1b2b20] bg-[#0d1410] px-5 py-3 text-gray-400 sm:flex">
                  <span className="text-eyebrow font-mono font-semibold uppercase">
                    {t('instrumentLabel')}
                  </span>
                  <span className="text-eyebrow font-mono font-semibold uppercase">
                    {t('lastLabel')} <span className="mx-1 opacity-40">/</span> {t('targetLabel')}
                  </span>
                </div>

                <div className="divide-y divide-[#1b2b20]">
                  {leftItems.map((pair) => {
                    const active = pair.symbol === featured.symbol;
                    return (
                      <button
                        key={pair.symbol}
                        type="button"
                        onClick={() => setSelectedSymbol(pair.symbol)}
                        aria-pressed={active}
                        className={`group flex w-full cursor-pointer items-center justify-between px-5 py-4 text-start transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b050] ${
                          active ? 'bg-[#00b050]/20' : 'hover:bg-[#00b050]/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Sparkline points={pair.sparkPoints} up={pair.up} />
                          <div>
                            <p
                              dir="ltr"
                              className="font-sans text-[14px] font-bold text-white transition-colors group-hover:text-[#00b050]"
                            >
                              {pair.symbol}
                            </p>
                            <span
                              className={`mt-0.5 inline-block rounded px-1.5 py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${SENTIMENT_STYLES[pair.sentiment]}`}
                            >
                              {sentimentLabel(pair.sentiment, t)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <span
                            dir="ltr"
                            className="hidden font-mono text-[13px] tabular-nums text-gray-200 transition-colors group-hover:text-white sm:inline"
                          >
                            {pair.price}
                          </span>
                          <span
                            dir="ltr"
                            className={`inline-flex items-center gap-1 font-mono text-[13px] font-semibold tabular-nums ${
                              pair.up ? 'text-[#00B050]' : 'text-[#EF4444]'
                            }`}
                          >
                            <Caret up={pair.up} />
                            {targetValue(pair.target)}
                          </span>
                          <span className="w-9 text-end font-mono text-[12px] tabular-nums text-gray-300 transition-colors group-hover:text-white">
                            {pair.conf}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column */}
              {rightItems.length > 0 && (
                <div>
                  <div className="hidden items-center justify-between border-b border-t border-[#1b2b20] bg-[#0d1410] px-5 py-3 text-gray-400 sm:flex md:border-t-0">
                    <span className="text-eyebrow font-mono font-semibold uppercase">
                      {t('instrumentLabel')}
                    </span>
                    <span className="text-eyebrow font-mono font-semibold uppercase">
                      {t('lastLabel')} <span className="mx-1 opacity-40">/</span> {t('targetLabel')}
                    </span>
                  </div>

                  <div className="divide-y divide-[#1b2b20] border-t border-[#1b2b20] md:border-t-0">
                    {rightItems.map((pair) => {
                      const active = pair.symbol === featured.symbol;
                      return (
                        <button
                          key={pair.symbol}
                          type="button"
                          onClick={() => setSelectedSymbol(pair.symbol)}
                          aria-pressed={active}
                          className={`group flex w-full cursor-pointer items-center justify-between px-5 py-4 text-start transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b050] ${
                            active ? 'bg-[#00b050]/20' : 'hover:bg-[#00b050]/20'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Sparkline points={pair.sparkPoints} up={pair.up} />
                            <div>
                              <p
                                dir="ltr"
                                className="font-sans text-[14px] font-bold text-white transition-colors group-hover:text-[#00b050]"
                              >
                                {pair.symbol}
                              </p>
                              <span
                                className={`mt-0.5 inline-block rounded px-1.5 py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${SENTIMENT_STYLES[pair.sentiment]}`}
                              >
                                {sentimentLabel(pair.sentiment, t)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 sm:gap-6">
                            <span
                              dir="ltr"
                              className="hidden font-mono text-[13px] tabular-nums text-gray-200 transition-colors group-hover:text-white sm:inline"
                            >
                              {pair.price}
                            </span>
                            <span
                              dir="ltr"
                              className={`inline-flex items-center gap-1 font-mono text-[13px] font-semibold tabular-nums ${
                                pair.up ? 'text-[#00B050]' : 'text-[#EF4444]'
                              }`}
                            >
                              <Caret up={pair.up} />
                              {targetValue(pair.target)}
                            </span>
                            <span className="w-9 text-end font-mono text-[12px] tabular-nums text-gray-300 transition-colors group-hover:text-white">
                              {pair.conf}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Analyst commentary - the research note */}
      <section className="px-5 pb-14">
        <ScrollReveal className={DESK}>
          <SectionKicker className="mb-4">{t('commentaryLabel')}</SectionKicker>
          <div className="border-border shadow-card rounded-[20px] border bg-white p-6 md:p-8 xl:p-10 dark:border-white/[0.08] dark:bg-[#111318] dark:shadow-none">
            <div className="grid gap-8 xl:grid-cols-[2fr_1fr] xl:gap-10">
              {/* The note: a pulled call-out quote with an accent margin rule */}
              <blockquote className="relative">
                <span
                  aria-hidden="true"
                  className="text-accent/25 absolute -top-3 start-0 select-none font-sans text-[64px] leading-none"
                >
                  &ldquo;
                </span>
                <p className="border-accent text-foreground text-lead border-s-2 ps-5 pt-6 font-sans leading-[1.75]">
                  {analyst.commentary}
                </p>
              </blockquote>

              {/* Margin: who signed it */}
              <div className="border-border border-t pt-6 xl:border-s xl:border-t-0 xl:ps-8 xl:pt-0 dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#111111]">
                    <span className="font-sans text-[13px] font-semibold text-white">
                      {analyst.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground font-sans text-[14px] font-semibold">
                      {analyst.name}
                    </p>
                    <p className="text-muted text-caption">{analyst.title}</p>
                  </div>
                </div>

                <dl className="border-border mt-5 border-t pt-4 dark:border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <dt className="text-eyebrow text-muted font-mono uppercase">
                      {t('asOfLabel')}
                    </dt>
                    <dd dir="ltr" className="text-foreground font-mono text-[12px] tabular-nums">
                      {analyst.updated}
                    </dd>
                  </div>
                </dl>

                <p className="text-muted text-caption mt-5">{t('noteDisclaimer')}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
