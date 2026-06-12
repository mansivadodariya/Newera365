'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { TradingViewWidget } from './TradingViewWidget';

const CATEGORIES = ['Forex', 'Indices', 'Commodities', 'Stocks', 'ETFs', 'Crypto'] as const;

type Category = (typeof CATEGORIES)[number];

const SPEC_ROWS = [
  { key: 'minSpread', value: 'from 0.0 pip' },
  { key: 'maxLeverage', value: '1:500' },
  { key: 'execution', value: '< 12 ms' },
  { key: 'minTrade', value: '0.01 lot' },
  { key: 'stopOut', value: '20%' },
];

const OTHER_MARKETS = ['Indices', 'Commodities', 'Stocks', 'ETFs', 'Crypto'] as const;

const CATEGORY_TV_SYMBOL: Record<Category, string> = {
  Forex: 'OANDA:EURUSD',
  Indices: 'CAPITALCOM:US500',
  Commodities: 'COMEX:GC1!',
  Stocks: 'NASDAQ:AAPL',
  ETFs: 'AMEX:SPY',
  Crypto: 'COINBASE:BTCUSD',
};

type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
const CHART_PERIODS: ChartPeriod[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];
const CHART_PERIOD_RANGE: Record<ChartPeriod, string> = {
  '1D': '1D',
  '1W': '5D',
  '1M': '1M',
  '3M': '3M',
  '6M': '6M',
  '1Y': '12M',
};

const ASSET_CLASS_MAP: Record<string, Category> = {
  forex: 'Forex',
  indices: 'Indices',
  commodities: 'Commodities',
  stocks: 'Stocks',
  etfs: 'ETFs',
  crypto: 'Crypto',
};

export interface InstrumentItem {
  id: number;
  name: string;
  symbol: string;
  assetClass: string;
  spread?: number | null;
  leverage?: string | null;
  minTradeSize?: number | null;
}

interface InstrumentsPageProps {
  instruments?: InstrumentItem[];
}

export function InstrumentsPage({ instruments }: InstrumentsPageProps) {
  const locale = useLocale();
  const t = useTranslations('instruments');
  const [activeCategory, setActiveCategory] = useState<Category>('Forex');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIdx, setSelectedRowIdx] = useState(0);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1M');

  const cmsRows = useMemo(
    () =>
      instruments
        ? instruments.filter((i) => ASSET_CLASS_MAP[i.assetClass] === activeCategory)
        : [],
    [instruments, activeCategory],
  );
  const hasCmsData = cmsRows.length > 0;

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return cmsRows;
    const q = searchQuery.toLowerCase();
    return cmsRows.filter(
      (i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q),
    );
  }, [cmsRows, searchQuery]);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-7 pt-9">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[14px] md:max-w-2xl xl:max-w-[1200px]">
          <span>
            <h1 className="text-foreground whitespace-pre-line font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
              {t('heroLine1')}
            </h1>
            <h1 className="text-accent whitespace-pre-line font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
              {t('heroLine2')}
            </h1>
          </span>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
          {/* Search bar */}
          <div className="bg-surface focus-within:ring-accent/40 flex h-[46px] items-center gap-3 rounded-[16px] px-4 transition-shadow focus-within:ring-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              className="text-muted flex-shrink-0"
            >
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M14 14l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="font-body text-foreground placeholder:text-muted flex-1 bg-transparent text-[14px] font-medium outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-muted hover:text-foreground flex-shrink-0 transition-colors"
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category nav strip */}
      <section className="mx-auto bg-transparent px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div
            className="scrollbar-hide flex gap-2 overflow-x-auto"
            style={{ scrollPaddingLeft: '20px' }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedRowIdx(0);
                }}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[10px] text-[13px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#f2f2f4] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e] dark:hover:text-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Instrument list */}
      <section className="bg-transparent px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 flex items-center justify-between">
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted">
              {hasCmsData
                ? `${activeCategory.toUpperCase()} · ${filteredRows.length}${searchQuery ? ` OF ${cmsRows.length}` : ''} INSTRUMENTS`
                : 'LIVE SPREADS · 8 OF 70'}
            </SectionKicker>
            <button className="font-body flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-[#6B7280]">
              {t('sortLabel')}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4l4 4 4-4"
                  stroke="#9ca3af"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* View all — navigates to the per-category page */}
          <Link
            href={`/${locale}/markets/${activeCategory.toLowerCase()}`}
            className="bg-surface dark:hover:bg-surface-elevated mt-3 flex w-full items-center justify-between rounded-[14px] px-4 py-[13px] transition-colors hover:bg-[#f0f0ee]"
          >
            <span className="font-body text-foreground text-[13px] font-medium">
              {hasCmsData
                ? `View all ${cmsRows.length} ${activeCategory.toLowerCase()} instruments`
                : `View all ${activeCategory.toLowerCase()} pairs`}
            </span>
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#111111]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>

          {/* TradingView chart — always shown, symbol updates on row click */}
          {(() => {
            const chartSymbol =
              hasCmsData && filteredRows[selectedRowIdx]
                ? `OANDA:${filteredRows[selectedRowIdx].symbol.replace('/', '')}`
                : CATEGORY_TV_SYMBOL[activeCategory];
            return (
              <div className="mt-3 overflow-hidden rounded-[20px] bg-[#07090D]">
                {/* Period selector */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/30">
                    {chartSymbol
                      .replace('OANDA:', '')
                      .replace('CAPITALCOM:', '')
                      .replace('COMEX:', '')
                      .replace('NASDAQ:', '')
                      .replace('AMEX:', '')
                      .replace('COINBASE:', '')}
                  </span>
                  <div className="flex gap-[2px]">
                    {CHART_PERIODS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`rounded-[6px] px-[9px] py-[5px] font-mono text-[11px] transition-colors ${
                          chartPeriod === p
                            ? 'bg-[#1f2937] font-semibold text-white'
                            : 'text-[#6b7280] hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[340px] xl:h-[420px]">
                  <TradingViewWidget
                    key={`${chartSymbol}-${chartPeriod}`}
                    type="advanced-chart"
                    symbol={chartSymbol}
                    theme="dark"
                    width="100%"
                    height="100%"
                    config={{
                      style: '1',
                      range: CHART_PERIOD_RANGE[chartPeriod],
                      hide_top_toolbar: false,
                      save_image: false,
                      hide_volume: true,
                      allow_symbol_change: false,
                    }}
                  />
                </div>
              </div>
            );
          })()}

          {/* CMS instrument rows — clickable to update chart */}
          {hasCmsData && (
            <div className="mt-3 overflow-hidden rounded-[20px] bg-[#07090D]">
              {/* Column header */}
              <div className="grid grid-cols-[1fr_80px_80px] border-b border-white/[0.08] px-4 py-2 xl:grid-cols-[1fr_120px_120px] xl:px-6">
                <span className="font-body text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                  {t('colSymbol')}
                </span>
                <span className="font-body text-right text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                  {t('colSpread')}
                </span>
                <span className="font-body text-right text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                  {t('colLeverage')}
                </span>
              </div>
              {filteredRows.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="font-body text-[13px] text-white/40">{t('noResults')}</p>
                </div>
              ) : (
                filteredRows.slice(0, 8).map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedRowIdx(i)}
                    className={`grid w-full grid-cols-[1fr_80px_80px] items-center px-4 py-[11px] text-left transition-colors xl:grid-cols-[1fr_120px_120px] xl:px-6 ${
                      i < Math.min(filteredRows.length, 8) - 1 ? 'border-b border-white/[0.06]' : ''
                    } ${selectedRowIdx === i ? 'bg-[#161d27]' : 'hover:bg-white/[0.03]'}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${selectedRowIdx === i ? 'bg-accent' : 'bg-[#26A69A]'}`}
                      />
                      <div className="min-w-0">
                        <p className="font-sans text-[13px] font-semibold leading-none text-white">
                          {item.symbol}
                        </p>
                        <p className="font-body mt-[3px] truncate text-[10px] text-white/40">
                          {item.name}
                        </p>
                      </div>
                    </div>
                    <p className="font-body text-right text-[12px] font-medium text-white/70">
                      {item.spread != null ? item.spread : '—'}
                    </p>
                    <p className="font-body text-right text-[12px] font-medium text-white/70">
                      {item.leverage ?? '—'}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Specs section */}
      <section className="rounded-t-[32px] bg-gradient-to-r from-[#FFFFFF] to-[#E2E2E2] px-5 pb-10 pt-10 dark:bg-gradient-to-r dark:from-[#000000] dark:to-[#1F262E]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* <SectionKicker className="mb-4 [&>span]:bg-white/40 [&>span:last-child]:text-white/50"> */}
          <SectionKicker className="[&>span:first-child]:bg-foreground [&>span:last-child]:text-foreground mb-4">
            {t('specsKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.02em]">
            {t('specsHeading')}
          </h2>

          <div className="mb-5 overflow-hidden rounded-[18px] bg-[#111111]">
            {SPEC_ROWS.map((row, i) => (
              <div
                key={row.key}
                className={`flex items-center justify-between px-5 py-[13px] ${i < SPEC_ROWS.length - 1 ? 'border-b border-[#1f1c1c]' : ''}`}
              >
                <span className="font-body text-[13px] text-[#FFFFFFB2]">
                  {t(
                    `spec${row.key.charAt(0).toUpperCase() + row.key.slice(1)}` as 'specMinSpread',
                  )}
                </span>
                <span className="font-body text-[14px] font-semibold text-[#FFFFFF]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <Link
            href={`/${locale}/trade/accounts`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[48px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            {t('compareAccounts')}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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

      {/* Other markets */}
      <section className="bg-gradient-to-r from-[#FFFFFF] to-[#E2E2E2] px-5 pb-12 pt-10 dark:bg-gradient-to-r dark:from-[#000000] dark:to-[#1F262E]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-foreground [&>span:last-child]:text-foreground mb-4 font-mono text-[10px] font-medium leading-[100%] tracking-[0.18em]">
            {t('otherKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[108%] tracking-[-0.8px]">
            {t('otherHeading')}
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {OTHER_MARKETS.map((market) => (
              <Link
                key={market}
                href={`/${locale}/markets/${market.toLowerCase()}`}
                className="hover:border-accent/30 group flex items-center justify-between rounded-[18px] border border-white/[0.12] bg-white/[0.06] px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.10] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <div>
                  <p className="font-sans text-[15px] font-semibold text-white">{market}</p>
                  <p className="font-body mt-[3px] text-[11px] text-white/40">{t('liveTag')}</p>
                </div>
                <div className="group-hover:bg-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 12L12 4M12 4H7M12 4v5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
