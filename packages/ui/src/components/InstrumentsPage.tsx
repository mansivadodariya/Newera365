'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

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

  const cmsRows = useMemo(
    () => (instruments ? instruments.filter((i) => ASSET_CLASS_MAP[i.assetClass] === activeCategory) : []),
    [instruments, activeCategory],
  );
  const hasCmsData = cmsRows.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-7 pt-9">
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
            {t('heroDesc')}
          </p>
          {/* Search bar */}
          <div className="bg-surface flex h-[46px] items-center gap-3 rounded-[16px] px-4">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <circle cx="9" cy="9" r="6.5" stroke="#9ca3af" strokeWidth="1.5" />
              <path d="M14 14l3.5 3.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-body flex-1 text-[14px] font-medium text-[#6B7280]">
              {t('searchPlaceholder')}
            </span>
            <span className="font-body text-muted dark:bg-surface-elevated flex-shrink-0 rounded-[6px] bg-[#f2f2f4] px-2 py-[3px] text-[11px]">
              ⌘ K
            </span>
          </div>
        </div>
      </section>

      {/* Category nav strip */}
      <section className="bg-background mx-auto px-5 pb-4">
        <div
          className="scrollbar-hide flex gap-[8px] overflow-x-auto"
          style={{ scrollPaddingLeft: '20px' }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-body flex-shrink-0 rounded-full px-4 py-[10px] text-[13px] font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'text-foreground dark:bg-surface-elevated dark:hover:bg-surface bg-[#f2f2f4] hover:bg-[#e5e5e5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Instrument list */}
      <section className="bg-background px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 flex items-center justify-between">
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted">
              {hasCmsData
                ? `${activeCategory.toUpperCase()} · ${cmsRows.length} INSTRUMENTS`
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

          {/* CMS instrument rows — shown when CMS data is available for the active category */}
          {hasCmsData && (
            <div className="mt-3 overflow-hidden rounded-[20px] bg-[#07090D]">
              {/* Column header */}
              <div className="border-white/8 grid grid-cols-[1fr_80px_80px] border-b px-4 py-2 xl:grid-cols-[1fr_120px_120px] xl:px-6">
                <span className="font-body text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">{t('colSymbol')}</span>
                <span className="font-body text-right text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">{t('colSpread')}</span>
                <span className="font-body text-right text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">{t('colLeverage')}</span>
              </div>
              {cmsRows.slice(0, 8).map((item, i) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_80px_80px] items-center px-4 py-[11px] xl:grid-cols-[1fr_120px_120px] xl:px-6 ${i < Math.min(cmsRows.length, 8) - 1 ? 'border-b border-white/[0.06]' : ''}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#26A69A]" />
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-semibold leading-none text-white">{item.symbol}</p>
                      <p className="font-body mt-[3px] truncate text-[10px] text-white/40">{item.name}</p>
                    </div>
                  </div>
                  <p className="font-body text-right text-[12px] font-medium text-white/70">
                    {item.spread != null ? item.spread : '—'}
                  </p>
                  <p className="font-body text-right text-[12px] font-medium text-white/70">
                    {item.leverage ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Chart + Index watchlist widget — shown when no CMS data for the active category */}
          {!hasCmsData && <div className="mt-3 overflow-hidden rounded-[32px] bg-[#07090D] p-[16px] pb-3 xl:flex xl:flex-row xl:gap-0 xl:p-0">
            {/* Chart column */}
            <div className="xl:flex-1 xl:p-[20px] xl:pr-0">
              {/* Tab bar */}
              <div className="flex justify-between">
                {(['Indices', 'Futures', 'Bonds', 'Forex'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`font-body rounded-[8px] px-[14px] py-[8px] text-[12px] font-medium transition-colors ${
                      tab === 'Indices' ? 'bg-[#1c2033] text-white' : 'text-white/40'
                    }`}
                  >
                    {t(`tab${tab}` as 'tabIndices')}
                  </button>
                ))}
              </div>

              {/* Chart area */}
              <div className="relative px-3 pt-2">
                <svg
                  viewBox="0 0 480 160"
                  className="w-full"
                  preserveAspectRatio="none"
                  style={{ height: 140 }}
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Gradient fill */}
                  <path
                    d="M0,130 C30,126 60,122 90,112 C120,102 150,90 180,75 C210,60 240,50 270,44 C300,38 330,36 360,38 C390,40 420,52 450,62 C462,67 472,72 480,78 L480,160 L0,160 Z"
                    fill="url(#chartFill)"
                  />
                  {/* Line */}
                  <path
                    d="M0,130 C30,126 60,122 90,112 C120,102 150,90 180,75 C210,60 240,50 270,44 C300,38 330,36 360,38 C390,40 420,52 450,62 C462,67 472,72 480,78"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* X-axis date labels */}
                <div className="mt-1 flex justify-between px-1">
                  {['Jun', 'Sep', '2026', 'Apr'].map((label) => (
                    <span key={label} className="font-body text-[9px] text-white/30">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time period selector */}
              <div className="mt-2 flex gap-0.5 px-3">
                {['1D', '1M', '3M', '1Y', '5Y', 'All'].map((p) => (
                  <button
                    key={p}
                    className={`font-body flex-1 rounded-[7px] py-[5px] text-[10px] font-medium transition-colors ${
                      p === '1Y' ? 'bg-[#1c2033] text-white' : 'text-white/35'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Divider (mobile only) */}
              <div className="mx-3 mt-3 border-t border-white/[0.06] xl:hidden" />
            </div>
            {/* end chart column */}

            {/* Price list column (right on xl, below on mobile) */}
            <div className="xl:w-[340px] xl:flex-shrink-0 xl:overflow-y-auto xl:border-l xl:border-white/[0.06]">
              {/* Index rows */}
              {[
                {
                  label: '500',
                  name: 'SPXUSD',
                  full: 'S&P 500',
                  price: '7,404.5',
                  pts: '−8.90',
                  pct: '−0.12%',
                  color: '#DC2626',
                  up: false,
                },
                {
                  label: '100',
                  name: 'NSXUSD',
                  full: 'US 100',
                  price: '29,146.1',
                  pts: '−40.70',
                  pct: '−0.14%',
                  color: '#06B6D4',
                  up: false,
                },
                {
                  label: '30',
                  name: 'DJI',
                  full: 'Dow 30',
                  price: '49,927.0',
                  pts: '−34.30',
                  pct: '−0.07%',
                  color: '#2563EB',
                  up: false,
                },
                {
                  label: '225',
                  name: 'NKY',
                  full: 'Nikkei 225',
                  price: '61,684.14',
                  pts: '+1,879.73',
                  pct: '+5.34%',
                  color: '#E11D48',
                  up: true,
                },
                {
                  label: '40',
                  name: 'DEU40',
                  full: 'DAX Index',
                  price: '24,737.24',
                  pts: '+336.59',
                  pct: '+1.38%',
                  color: '#7C3AED',
                  up: true,
                },
                {
                  label: '100',
                  name: 'UKXGBP',
                  full: 'FTSE 100',
                  price: '10,464.0',
                  pts: '−5.20',
                  pct: '−0.05%',
                  color: '#9D174D',
                  up: false,
                },
              ].map((item, i, arr) => (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 px-3 py-[11px] ${i < arr.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className="font-body flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.label}
                  </div>
                  {/* Symbol + full name */}
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[13px] font-semibold leading-none text-white">
                      {item.name}
                    </p>
                    <p className="font-body mt-[3px] text-[10px] text-white/40">{item.full}</p>
                  </div>
                  {/* Price + changes */}
                  <div className="text-right">
                    <p
                      className={`font-sans text-[13px] font-semibold ${item.up ? 'text-white' : 'text-[#EE5250]'}`}
                    >
                      {item.price}
                    </p>
                    <p
                      className={`font-body mt-[2px] text-[10px] ${item.up ? 'text-[#26A69A]' : 'text-[#EE5250]'}`}
                    >
                      {item.pts}&nbsp;&nbsp;{item.pct}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* end price list column */}
          </div>
          }
        </div>
      </section>

      {/* Specs section */}
      <section className="rounded-t-[32px] bg-[#111111] px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* <SectionKicker className="mb-4 [&>span]:bg-white/40 [&>span:last-child]:text-white/50"> */}
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white [&>span:last-child]:text-white">
            {t('specsKicker')}
          </SectionKicker>
          <h2 className="mb-6 font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            {t('specsHeading')}
          </h2>

          <div className="mb-5 overflow-hidden rounded-[18px] bg-[#111111]">
            {SPEC_ROWS.map((row, i) => (
              <div
                key={row.key}
                className={`flex items-center justify-between px-5 py-[13px] ${i < SPEC_ROWS.length - 1 ? 'border-b border-[#1f1c1c]' : ''}`}
              >
                <span className="font-body text-[13px] text-[#FFFFFFB2]">{t(`spec${row.key.charAt(0).toUpperCase() + row.key.slice(1)}` as 'specMinSpread')}</span>
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
      <section className="bg-background px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 font-mono text-[10px] font-medium leading-[100%] tracking-[0.18em] text-[#6B7280]">
            {t('otherMarketsKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[108%] tracking-[-0.8px]">
            {t('otherMarketsHeading')}
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {OTHER_MARKETS.map((market) => (
              <Link
                key={market}
                href={`/${locale}/markets/${market.toLowerCase()}`}
                className="dark:bg-surface bg-surface dark:hover:bg-surface-elevated flex items-center justify-between rounded-[18px] px-5 py-4 transition-colors hover:bg-[#f0f0ee]"
              >
                <div>
                  <p className="text-foreground font-sans text-[15px] font-semibold">{market}</p>
                  <p className="font-body text-muted mt-[3px] text-[11px]">
                    {t('liveTag')}
                  </p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#111111]">
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
