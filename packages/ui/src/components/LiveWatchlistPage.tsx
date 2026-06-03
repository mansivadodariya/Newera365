'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { TradingViewWidget } from './TradingViewWidget';

type Tab = 'INDICES' | 'FUTURES' | 'BONDS' | 'FOREX';

const TABS: { id: Tab; label: string }[] = [
  { id: 'INDICES', label: 'Indices' },
  { id: 'FUTURES', label: 'Futures' },
  { id: 'BONDS', label: 'Bonds' },
  { id: 'FOREX', label: 'Forex' },
];

const TAB_SYMBOLS: Record<Tab, string> = {
  INDICES: 'CAPITALCOM:US500',
  FUTURES: 'NYMEX:CL1!',
  BONDS: 'TVC:US10Y',
  FOREX: 'OANDA:EURUSD',
};

const MARKETS: Record<
  Tab,
  { symbol: string; name: string; price: string; change: string; pct: string; up: boolean; badge: string; badgeColor: string }[]
> = {
  INDICES: [
    { symbol: 'SPXUSD', name: 'S&P 500', price: '5,301.4', change: '-12.50', pct: '-0.24%', up: false, badge: '500', badgeColor: '#F97316' },
    { symbol: 'NSXUSD', name: 'Nasdaq 100', price: '18,742.3', change: '+126.4', pct: '+0.68%', up: true, badge: '100', badgeColor: '#F97316' },
    { symbol: 'DJI', name: 'Dow 30', price: '39,148.1', change: '-46.90', pct: '-0.12%', up: false, badge: '30', badgeColor: '#2961FF' },
    { symbol: 'NKY', name: 'Nikkei 225', price: '38,484.14', change: '+324.20', pct: '+0.85%', up: true, badge: '225', badgeColor: '#06B6D4' },
    { symbol: 'DEU40', name: 'DAX Index', price: '18,464.0', change: '+138.4', pct: '+0.76%', up: true, badge: 'X', badgeColor: '#6B7280' },
    { symbol: 'UKGBP', name: 'FTSE 100', price: '8,246.3', change: '+21.40', pct: '+0.26%', up: true, badge: '100', badgeColor: '#EF4444' },
  ],
  FUTURES: [
    { symbol: 'CL1!', name: 'WTI Crude', price: '79.42', change: '-0.58', pct: '-0.73%', up: false, badge: 'CL', badgeColor: '#6B7280' },
    { symbol: 'NG1!', name: 'Natural Gas', price: '2.18', change: '+0.04', pct: '+1.87%', up: true, badge: 'NG', badgeColor: '#3B82F6' },
    { symbol: 'GC1!', name: 'Gold Futures', price: '2,463.10', change: '+10.30', pct: '+0.42%', up: true, badge: 'GC', badgeColor: '#F59E0B' },
    { symbol: 'SI1!', name: 'Silver Futures', price: '28.82', change: '+0.34', pct: '+1.20%', up: true, badge: 'SI', badgeColor: '#9CA3AF' },
    { symbol: 'HG1!', name: 'Copper', price: '4.61', change: '-0.03', pct: '-0.65%', up: false, badge: 'HG', badgeColor: '#B45309' },
  ],
  BONDS: [
    { symbol: 'US10Y', name: 'US 10-Year', price: '4.474', change: '-0.012', pct: '-0.27%', up: false, badge: '10Y', badgeColor: '#2961FF' },
    { symbol: 'US2Y', name: 'US 2-Year', price: '4.912', change: '-0.008', pct: '-0.16%', up: false, badge: '2Y', badgeColor: '#2961FF' },
    { symbol: 'UK10Y', name: 'UK Gilt 10Y', price: '4.186', change: '+0.006', pct: '+0.14%', up: true, badge: 'UK', badgeColor: '#EF4444' },
    { symbol: 'DE10Y', name: 'Bund 10Y', price: '2.614', change: '+0.010', pct: '+0.38%', up: true, badge: 'DE', badgeColor: '#6B7280' },
    { symbol: 'JP10Y', name: 'JGB 10Y', price: '1.062', change: '-0.004', pct: '-0.37%', up: false, badge: 'JP', badgeColor: '#F97316' },
  ],
  FOREX: [
    { symbol: 'EURUSD', name: 'Euro / USD', price: '1.0842', change: '+0.0034', pct: '+0.31%', up: true, badge: 'EU', badgeColor: '#2961FF' },
    { symbol: 'GBPUSD', name: 'Cable', price: '1.2691', change: '+0.0021', pct: '+0.17%', up: true, badge: 'GB', badgeColor: '#EF4444' },
    { symbol: 'USDJPY', name: 'Dollar Yen', price: '156.84', change: '-0.32', pct: '-0.20%', up: false, badge: 'JP', badgeColor: '#F97316' },
    { symbol: 'XAUUSD', name: 'Gold / USD', price: '2,206.48', change: '+8.20', pct: '+0.37%', up: true, badge: 'XAU', badgeColor: '#F59E0B' },
    { symbol: 'GBPJPY', name: 'Cable Yen', price: '198.12', change: '-0.48', pct: '-0.24%', up: false, badge: 'GJ', badgeColor: '#8B5CF6' },
  ],
};

export function LiveWatchlistPage() {
  const t = useTranslations('watchlist');
  const [tab, setTab] = useState<Tab>('INDICES');
  const markets = MARKETS[tab];
  const chartSymbol = TAB_SYMBOLS[tab];

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Tab filter */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                  tab === tabItem.id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'dark:bg-surface dark:text-muted bg-[#f3f4f6] text-[#6b7280]'
                }`}
              >
                {tabItem.id === 'INDICES' ? t('tabIndices') : tabItem.id === 'FUTURES' ? t('tabFutures') : tabItem.id === 'BONDS' ? t('tabBonds') : t('tabForex')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TradingView mini chart — matches Figma watchlist widget */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px]" style={{ height: 220 }}>
            <TradingViewWidget
              key={chartSymbol}
              type="mini-chart"
              symbol={chartSymbol}
              theme="dark"
              config={{ chartOnly: false, width: '100%', height: 220, locale: 'en' }}
            />
          </div>
        </div>
      </section>

      {/* Market list — dark card */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] bg-[#111111]" style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.10)' }}>
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 border-b border-white/[0.06] px-4 py-3">
              <span className="w-8" />
              <span className="font-body text-[10px] uppercase tracking-[0.1em] text-white/30">
                {t('colSymbol')}
              </span>
              <span className="font-body text-right text-[10px] uppercase tracking-[0.1em] text-white/30">
                {t('colPrice')}
              </span>
              <span className="font-body w-16 text-right text-[10px] uppercase tracking-[0.1em] text-white/30">
                {t('colChange')}
              </span>
            </div>
            {/* Rows */}
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {markets.map((m) => (
                <div
                  key={m.symbol}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-[12px]"
                >
                  {/* Colored badge icon */}
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] text-white"
                    style={{ backgroundColor: m.badgeColor }}
                  >
                    <span className="font-sans text-[9px] font-bold leading-none">{m.badge}</span>
                  </div>
                  <div>
                    <p className="font-sans text-[13px] font-semibold text-white">{m.symbol}</p>
                    <p className="font-body text-[11px] text-white/40">{m.name}</p>
                  </div>
                  <p className="font-body text-[13px] tabular-nums text-white">{m.price}</p>
                  <p
                    className={`font-body w-16 text-right text-[12px] font-semibold tabular-nums ${m.up ? 'text-accent' : 'text-[#EF4444]'}`}
                  >
                    {m.pct}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">
            {t('disclaimer')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <p className="font-body mb-7 text-[14px] text-white/60">
            {t('ctaDesc')}
          </p>
          <a
            href="https://trade.newera365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent font-body hover:bg-accent/90 mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
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
