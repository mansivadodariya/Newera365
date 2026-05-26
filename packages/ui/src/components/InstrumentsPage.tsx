'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const CATEGORIES = ['Forex', 'Indices', 'Commodities', 'Stocks', 'ETFs', 'Crypto'] as const;
type Category = (typeof CATEGORIES)[number];

const STATIC_FOREX_ROWS = [
  { pair: 'EUR/USD', bid: '1.0856', spread: '0.8', change: '+0.14%', up: true },
  { pair: 'GBP/USD', bid: '1.2741', spread: '1.0', change: '-0.08%', up: false },
  { pair: 'USD/JPY', bid: '156.42', spread: '0.9', change: '+0.21%', up: true },
  { pair: 'AUD/USD', bid: '0.6512', spread: '0.9', change: '-0.05%', up: false },
  { pair: 'USD/CAD', bid: '1.3617', spread: '1.2', change: '+0.09%', up: true },
  { pair: 'EUR/GBP', bid: '0.8518', spread: '1.1', change: '-0.11%', up: false },
  { pair: 'XAU/USD', bid: '2,418.5', spread: '1.6', change: '+1.24%', up: true },
  { pair: 'XAG/USD', bid: '29.12', spread: '2.0', change: '+0.87%', up: true },
];

const SPEC_ROWS = [
  { label: 'Minimum spread', value: 'from 0.0 pip' },
  { label: 'Maximum leverage', value: '1:500' },
  { label: 'Order execution', value: '< 12 ms' },
  { label: 'Minimum trade size', value: '0.01 lot' },
  { label: 'Stop-out level', value: '20%' },
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
  const [activeCategory, setActiveCategory] = useState<Category>('Forex');

  const cmsRows = instruments
    ? instruments.filter((i) => ASSET_CLASS_MAP[i.assetClass] === activeCategory)
    : [];
  const hasCmsData = cmsRows.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="bg-white px-5 pb-7 pt-9">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[14px] md:max-w-2xl lg:max-w-5xl">
          <h1 className="text-foreground whitespace-pre-line font-sans text-[38px] font-semibold leading-[1.1]">
            {'Every market.\nOne terminal.'}
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            Real-time spreads across forex, indices, commodities, stocks, ETFs and crypto.
          </p>
          {/* Search bar */}
          <div className="flex h-[46px] items-center gap-3 rounded-[16px] bg-[#FAFAF9] px-4">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <circle cx="9" cy="9" r="6.5" stroke="#9ca3af" strokeWidth="1.5" />
              <path d="M14 14l3.5 3.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-body text-muted flex-1 text-[13px]">Search instruments…</span>
            <span className="font-body text-muted flex-shrink-0 rounded-[6px] bg-[#f2f2f4] px-2 py-[3px] text-[11px]">
              ⌘ K
            </span>
          </div>
        </div>
      </section>

      {/* Category nav strip */}
      <section className="bg-white pb-4">
        <div
          className="scrollbar-hide flex gap-[8px] overflow-x-auto px-5"
          style={{ scrollPaddingLeft: '20px' }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[13px] font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-foreground text-white'
                  : 'text-foreground bg-[#f2f2f4] hover:bg-[#e5e5e5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Instrument list */}
      <section className="bg-white px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <div className="mb-4 flex items-center justify-between">
            <SectionKicker>
              {hasCmsData
                ? `${activeCategory.toUpperCase()} · ${cmsRows.length} INSTRUMENTS`
                : 'LIVE SPREADS · 8 OF 70'}
            </SectionKicker>
            <button className="font-body text-muted flex items-center gap-1 text-[10px] uppercase tracking-[0.1em]">
              SORT
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

          {/* Instrument rows */}
          <div className="flex flex-col divide-y divide-[#f0f0f0]">
            {hasCmsData
              ? cmsRows.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-[11px]">
                    <div>
                      <p className="text-foreground font-sans text-[14px] font-semibold">
                        {item.symbol}
                      </p>
                      <p className="font-body text-muted mt-[2px] text-[11px]">{item.name}</p>
                    </div>
                    <div className="text-right">
                      {item.spread != null && (
                        <p className="font-body text-foreground text-[12px] font-medium">
                          Spread: {item.spread} pip
                        </p>
                      )}
                      {item.leverage && (
                        <p className="font-body text-muted mt-[2px] text-[11px]">{item.leverage}</p>
                      )}
                    </div>
                  </div>
                ))
              : STATIC_FOREX_ROWS.map((row) => (
                  <div key={row.pair} className="flex items-center justify-between py-[11px]">
                    <div>
                      <p className="text-foreground font-sans text-[14px] font-semibold">
                        {row.pair}
                      </p>
                      <p className="font-body text-muted mt-[2px] text-[11px]">
                        Spread: {row.spread} pip
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-foreground text-[13px] font-medium">{row.bid}</p>
                      <p
                        className={`font-body mt-[2px] text-[11px] ${row.up ? 'text-[#26A69A]' : 'text-[#EE5250]'}`}
                      >
                        {row.change}
                      </p>
                    </div>
                  </div>
                ))}
          </div>

          {/* View all button */}
          <button className="mt-4 flex w-full items-center justify-between rounded-[14px] bg-[#FAFAF9] px-4 py-[13px] transition-colors hover:bg-[#f0f0ee]">
            <span className="font-body text-foreground text-[13px] font-medium">
              {hasCmsData
                ? `View all ${cmsRows.length} ${activeCategory.toLowerCase()} instruments`
                : 'View all 70 forex pairs'}
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
          </button>

          {/* Watchlist-style dark widget */}
          <div className="mt-5 flex flex-col gap-4 rounded-[32px] bg-[#07090D] p-5">
            <div className="flex gap-2">
              {['Indices', 'Futures', 'Bonds', 'Forex'].map((tab) => (
                <button
                  key={tab}
                  className={`font-body rounded-[8px] px-3 py-[5px] text-[12px] ${
                    tab === 'Indices' ? 'bg-[#1F262E] text-white' : 'text-[#ADB5C2]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex h-[80px] items-end px-1">
              <svg viewBox="0 0 340 80" className="h-full w-full" preserveAspectRatio="none">
                <polyline
                  points="0,65 40,55 80,60 120,40 160,45 200,30 240,38 280,20 340,25"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex gap-1">
              {['1D', '1M', '3M', '1Y', '5Y', 'All'].map((p) => (
                <button
                  key={p}
                  className={`font-body flex-1 rounded-[8px] py-[5px] text-[11px] ${
                    p === '1Y' ? 'bg-[#1F262E] text-white' : 'text-[#B8BFC8]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-[2px]">
              {[
                {
                  code: 'SPXUSD',
                  name: 'S&P 500',
                  price: '7,404.5',
                  change: '−0.12%',
                  up: false,
                  color: '#DB213D',
                },
                {
                  code: 'NSXUSD',
                  name: 'US 100',
                  price: '29,146.1',
                  change: '−0.14%',
                  up: false,
                  color: '#5CC7E5',
                },
                {
                  code: 'DJI',
                  name: 'Dow Jones',
                  price: '42,312.8',
                  change: '+0.09%',
                  up: true,
                  color: '#1A5ED5',
                },
              ].map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between rounded-[12px] bg-[#0A1326] px-3 py-[10px]"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="font-body flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.code.slice(0, 3)}
                    </div>
                    <div>
                      <p className="font-body text-[12px] font-medium text-white">{item.code}</p>
                      <p className="font-body text-[10px] text-[#8C939E]">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-body text-[12px] font-medium ${item.up ? 'text-white' : 'text-[#EF5350]'}`}
                    >
                      {item.price}
                    </p>
                    <p
                      className={`font-body text-[10px] ${item.up ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}
                    >
                      {item.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specs section */}
      <section className="rounded-t-[32px] bg-[#111111] px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          {/* <SectionKicker className="mb-4 [&>span]:bg-white/40 [&>span:last-child]:text-white/50"> */}
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            TRADING SPECS
          </SectionKicker>
          <h2 className="mb-6 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            Institutional pricing, retail simplicity.
          </h2>

          <div className="mb-5 overflow-hidden rounded-[18px] bg-[#111111]">
            {SPEC_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-[13px] ${i < SPEC_ROWS.length - 1 ? 'border-b border-[#1f1c1c]' : ''}`}
              >
                <span className="font-body text-[13px] text-[#FFFFFFB2]">{row.label}</span>
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
            Compare account types
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
      <section className="bg-white px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <SectionKicker className="mb-4">OTHER MARKETS</SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[1.1]">
            Diversify across asset classes.
          </h2>
          <div className="flex flex-col gap-[10px]">
            {OTHER_MARKETS.map((market) => (
              <Link
                key={market}
                href={`/${locale}/markets/${market.toLowerCase()}`}
                className="flex items-center justify-between rounded-[18px] bg-[#FAFAF9] px-5 py-4 transition-colors hover:bg-[#f0f0ee]"
              >
                <div>
                  <p className="text-foreground font-sans text-[15px] font-semibold">{market}</p>
                  <p className="font-body text-muted mt-[3px] text-[11px]">
                    Live spec table · MT5-driven
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
