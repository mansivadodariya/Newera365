'use client';

import { useState } from 'react';
import { SectionKicker } from './SectionKicker';

type Tab = 'INDICES' | 'FUTURES' | 'BONDS' | 'FOREX';

const TABS: { id: Tab; label: string }[] = [
  { id: 'INDICES', label: 'Indices' },
  { id: 'FUTURES', label: 'Futures' },
  { id: 'BONDS', label: 'Bonds' },
  { id: 'FOREX', label: 'Forex' },
];

const MARKETS: Record<
  Tab,
  { symbol: string; name: string; price: string; change: string; pct: string; up: boolean }[]
> = {
  INDICES: [
    {
      symbol: 'SP500',
      name: 'S&P 500',
      price: '5,301.4',
      change: '-12.50',
      pct: '-0.24%',
      up: false,
    },
    {
      symbol: 'DJI',
      name: 'Dow Jones',
      price: '39,148.1',
      change: '-46.90',
      pct: '-0.12%',
      up: false,
    },
    {
      symbol: 'NKY',
      name: 'Nikkei 225',
      price: '81,484.14',
      change: '+324.20',
      pct: '+0.40%',
      up: true,
    },
    {
      symbol: 'GOLD',
      name: 'Gold Spot',
      price: '2,457.24',
      change: '+8.20',
      pct: '+0.33%',
      up: true,
    },
    {
      symbol: 'UKGDP',
      name: 'FTSE 100',
      price: '16,464.0',
      change: '+21.40',
      pct: '+0.13%',
      up: true,
    },
  ],
  FUTURES: [
    { symbol: 'CL1', name: 'WTI Crude', price: '79.42', change: '-0.58', pct: '-0.73%', up: false },
    { symbol: 'NG1', name: 'Natural Gas', price: '2.18', change: '+0.04', pct: '+1.87%', up: true },
    {
      symbol: 'GC1',
      name: 'Gold Futures',
      price: '2,463.10',
      change: '+10.30',
      pct: '+0.42%',
      up: true,
    },
    {
      symbol: 'SI1',
      name: 'Silver Futures',
      price: '28.82',
      change: '+0.34',
      pct: '+1.20%',
      up: true,
    },
    {
      symbol: 'HG1',
      name: 'Copper Futures',
      price: '4.61',
      change: '-0.03',
      pct: '-0.65%',
      up: false,
    },
  ],
  BONDS: [
    {
      symbol: 'US10Y',
      name: 'US 10-Year',
      price: '4.474',
      change: '-0.012',
      pct: '-0.27%',
      up: false,
    },
    {
      symbol: 'US2Y',
      name: 'US 2-Year',
      price: '4.912',
      change: '-0.008',
      pct: '-0.16%',
      up: false,
    },
    {
      symbol: 'UK10Y',
      name: 'UK Gilt 10Y',
      price: '4.186',
      change: '+0.006',
      pct: '+0.14%',
      up: true,
    },
    {
      symbol: 'DE10Y',
      name: 'Bund 10Y',
      price: '2.614',
      change: '+0.010',
      pct: '+0.38%',
      up: true,
    },
    {
      symbol: 'JP10Y',
      name: 'JGB 10Y',
      price: '1.062',
      change: '-0.004',
      pct: '-0.37%',
      up: false,
    },
  ],
  FOREX: [
    {
      symbol: 'EURUSD',
      name: 'Euro / USD',
      price: '1.0842',
      change: '+0.0034',
      pct: '+0.31%',
      up: true,
    },
    {
      symbol: 'GBPUSD',
      name: 'Cable',
      price: '1.2691',
      change: '+0.0021',
      pct: '+0.17%',
      up: true,
    },
    {
      symbol: 'USDJPY',
      name: 'Dollar Yen',
      price: '156.84',
      change: '-0.32',
      pct: '-0.20%',
      up: false,
    },
    {
      symbol: 'XAUUSD',
      name: 'Gold / USD',
      price: '2,206.48',
      change: '+8.20',
      pct: '+0.37%',
      up: true,
    },
    {
      symbol: 'GBPJPY',
      name: 'Cable Yen',
      price: '198.12',
      change: '-0.48',
      pct: '-0.24%',
      up: false,
    },
  ],
};

export function LiveWatchlistPage() {
  const [tab, setTab] = useState<Tab>('INDICES');
  const markets = MARKETS[tab];

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-muted text-muted">
            MARKETS
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.1]">
            Market
            <br />
            <span className="text-accent">watch.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Be ahead of every market that matters. Refreshed every second.
          </p>
        </div>
      </section>

      {/* Tab filter */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                  tab === t.id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#f3f4f6] text-[#6b7280] dark:bg-[#1c1c1c] dark:text-[#9ca3af]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Market list — dark card */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div
            className="overflow-hidden rounded-[22px] bg-[#111111]"
            style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.10)' }}
          >
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.06] px-5 py-3">
              <span className="font-body text-[10px] uppercase tracking-[0.1em] text-white/30">
                Symbol
              </span>
              <span className="font-body text-right text-[10px] uppercase tracking-[0.1em] text-white/30">
                Price
              </span>
              <span className="font-body w-16 text-right text-[10px] uppercase tracking-[0.1em] text-white/30">
                Chg %
              </span>
            </div>
            {/* Rows */}
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {markets.map((m) => (
                <div
                  key={m.symbol}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-[14px]"
                >
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-white">{m.symbol}</p>
                    <p className="font-body text-[11px] text-white/40">{m.name}</p>
                  </div>
                  <p className="font-body text-[14px] tabular-nums text-white">{m.price}</p>
                  <p
                    className={`font-body w-16 text-right text-[13px] font-semibold tabular-nums ${m.up ? 'text-accent' : 'text-[#EF4444]'}`}
                  >
                    {m.pct}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">
            Indicative prices. For reference only — not for trading.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            START TRADING
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            A premium global trading platform built for the new era of markets.
          </h2>
          <a
            href="https://trade.newera365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent font-body hover:bg-accent/90 mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Open free account
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
