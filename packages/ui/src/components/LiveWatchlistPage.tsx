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
  {
    symbol: string;
    tvSymbol: string;
    name: string;
    price: string;
    change: string;
    pct: string;
    up: boolean;
    badge: string;
    badgeColor: string;
  }[]
> = {
  INDICES: [
    {
      symbol: 'SPXUSD',
      tvSymbol: 'CAPITALCOM:US500',
      name: 'S&P 500',
      price: '5,301.4',
      change: '-12.50',
      pct: '-0.24%',
      up: false,
      badge: '500',
      badgeColor: '#F97316',
    },
    {
      symbol: 'NSXUSD',
      tvSymbol: 'NASDAQ:NDX',
      name: 'Nasdaq 100',
      price: '18,742.3',
      change: '+126.4',
      pct: '+0.68%',
      up: true,
      badge: '100',
      badgeColor: '#F97316',
    },
    {
      symbol: 'DJI',
      tvSymbol: 'CAPITALCOM:US30',
      name: 'Dow 30',
      price: '39,148.1',
      change: '-46.90',
      pct: '-0.12%',
      up: false,
      badge: '30',
      badgeColor: '#2961FF',
    },
    {
      symbol: 'NKY',
      tvSymbol: 'TVC:NI225',
      name: 'Nikkei 225',
      price: '38,484.14',
      change: '+324.20',
      pct: '+0.85%',
      up: true,
      badge: '225',
      badgeColor: '#06B6D4',
    },
    {
      symbol: 'DEU40',
      tvSymbol: 'CAPITALCOM:DE40',
      name: 'DAX Index',
      price: '18,464.0',
      change: '+138.4',
      pct: '+0.76%',
      up: true,
      badge: 'X',
      badgeColor: '#6B7280',
    },
    {
      symbol: 'UKGBP',
      tvSymbol: 'CAPITALCOM:UK100',
      name: 'FTSE 100',
      price: '8,246.3',
      change: '+21.40',
      pct: '+0.26%',
      up: true,
      badge: '100',
      badgeColor: '#EF4444',
    },
  ],
  FUTURES: [
    {
      symbol: 'CL1!',
      tvSymbol: 'NYMEX:CL1!',
      name: 'WTI Crude',
      price: '79.42',
      change: '-0.58',
      pct: '-0.73%',
      up: false,
      badge: 'CL',
      badgeColor: '#6B7280',
    },
    {
      symbol: 'NG1!',
      tvSymbol: 'NYMEX:NG1!',
      name: 'Natural Gas',
      price: '2.18',
      change: '+0.04',
      pct: '+1.87%',
      up: true,
      badge: 'NG',
      badgeColor: '#3B82F6',
    },
    {
      symbol: 'GC1!',
      tvSymbol: 'COMEX:GC1!',
      name: 'Gold Futures',
      price: '2,463.10',
      change: '+10.30',
      pct: '+0.42%',
      up: true,
      badge: 'GC',
      badgeColor: '#F59E0B',
    },
    {
      symbol: 'SI1!',
      tvSymbol: 'COMEX:SI1!',
      name: 'Silver Futures',
      price: '28.82',
      change: '+0.34',
      pct: '+1.20%',
      up: true,
      badge: 'SI',
      badgeColor: '#9CA3AF',
    },
    {
      symbol: 'HG1!',
      tvSymbol: 'COMEX:HG1!',
      name: 'Copper',
      price: '4.61',
      change: '-0.03',
      pct: '-0.65%',
      up: false,
      badge: 'HG',
      badgeColor: '#B45309',
    },
  ],
  BONDS: [
    {
      symbol: 'US10Y',
      tvSymbol: 'TVC:US10Y',
      name: 'US 10-Year',
      price: '4.474',
      change: '-0.012',
      pct: '-0.27%',
      up: false,
      badge: '10Y',
      badgeColor: '#2961FF',
    },
    {
      symbol: 'US2Y',
      tvSymbol: 'TVC:US02Y',
      name: 'US 2-Year',
      price: '4.912',
      change: '-0.008',
      pct: '-0.16%',
      up: false,
      badge: '2Y',
      badgeColor: '#2961FF',
    },
    {
      symbol: 'UK10Y',
      tvSymbol: 'TVC:GB10Y',
      name: 'UK Gilt 10Y',
      price: '4.186',
      change: '+0.006',
      pct: '+0.14%',
      up: true,
      badge: 'UK',
      badgeColor: '#EF4444',
    },
    {
      symbol: 'DE10Y',
      tvSymbol: 'TVC:DE10Y',
      name: 'Bund 10Y',
      price: '2.614',
      change: '+0.010',
      pct: '+0.38%',
      up: true,
      badge: 'DE',
      badgeColor: '#6B7280',
    },
    {
      symbol: 'JP10Y',
      tvSymbol: 'TVC:JP10Y',
      name: 'JGB 10Y',
      price: '1.062',
      change: '-0.004',
      pct: '-0.37%',
      up: false,
      badge: 'JP',
      badgeColor: '#F97316',
    },
  ],
  FOREX: [
    {
      symbol: 'EURUSD',
      tvSymbol: 'OANDA:EURUSD',
      name: 'Euro / USD',
      price: '1.0842',
      change: '+0.0034',
      pct: '+0.31%',
      up: true,
      badge: 'EU',
      badgeColor: '#2961FF',
    },
    {
      symbol: 'GBPUSD',
      tvSymbol: 'OANDA:GBPUSD',
      name: 'Cable',
      price: '1.2691',
      change: '+0.0021',
      pct: '+0.17%',
      up: true,
      badge: 'GB',
      badgeColor: '#EF4444',
    },
    {
      symbol: 'USDJPY',
      tvSymbol: 'OANDA:USDJPY',
      name: 'Dollar Yen',
      price: '156.84',
      change: '-0.32',
      pct: '-0.20%',
      up: false,
      badge: 'JP',
      badgeColor: '#F97316',
    },
    {
      symbol: 'XAUUSD',
      tvSymbol: 'OANDA:XAUUSD',
      name: 'Gold / USD',
      price: '2,206.48',
      change: '+8.20',
      pct: '+0.37%',
      up: true,
      badge: 'XAU',
      badgeColor: '#F59E0B',
    },
    {
      symbol: 'GBPJPY',
      tvSymbol: 'OANDA:GBPJPY',
      name: 'Cable Yen',
      price: '198.12',
      change: '-0.48',
      pct: '-0.24%',
      up: false,
      badge: 'GJ',
      badgeColor: '#8B5CF6',
    },
  ],
};

type Period = '1D' | '1M' | '3M' | '1Y' | '5Y' | 'ALL';
const PERIODS: Period[] = ['1D', '1M', '3M', '1Y', '5Y', 'ALL'];
const PERIOD_TO_RANGE: Record<Period, string> = {
  '1D': '1D',
  '1M': '1M',
  '3M': '3M',
  '1Y': '12M',
  '5Y': '60M',
  ALL: 'ALL',
};

export function LiveWatchlistPage() {
  const t = useTranslations('watchlist');
  const [tab, setTab] = useState<Tab>('INDICES');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
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

      {/* Unified dark watchlist widget */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] bg-[#0d1117] xl:rounded-[28px]">
            {/* Tabs */}
            <div className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 pt-3">
              {TABS.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`flex-shrink-0 rounded-t-[8px] px-4 py-[10px] text-[13px] font-medium transition-colors ${
                    tab === tabItem.id
                      ? 'border-accent border-b-2 font-semibold text-white'
                      : 'text-[#6b7280] hover:text-[#adb5c2]'
                  }`}
                >
                  {tabItem.id === 'INDICES'
                    ? t('tabIndices')
                    : tabItem.id === 'FUTURES'
                      ? t('tabFutures')
                      : tabItem.id === 'BONDS'
                        ? t('tabBonds')
                        : t('tabForex')}
                </button>
              ))}
            </div>

            {/* Live market rows + inline chart via TradingView market-overview */}
            <TradingViewWidget
              key={tab}
              type="market-overview"
              theme="dark"
              width="100%"
              height={580}
              config={{
                colorTheme: 'dark',
                dateRange: '12M',
                showChart: true,
                locale: 'en',
                largeChartUrl: '',
                isTransparent: true,
                showSymbolLogo: true,
                showFloatingTooltip: false,
                plotLineColorGrowing: '#1AD966',
                plotLineColorFalling: '#EF4444',
                gridLineColor: 'rgba(255,255,255,0.04)',
                scaleFontColor: 'rgba(255,255,255,0.3)',
                belowLineFillColorGrowing: 'rgba(26,217,102,0.05)',
                belowLineFillColorFalling: 'rgba(239,68,68,0.05)',
                symbolActiveColor: 'rgba(26,217,102,0.08)',
                tabs: [
                  {
                    title: TABS.find((t) => t.id === tab)?.label ?? tab,
                    symbols: MARKETS[tab].map((m) => ({ s: m.tvSymbol, d: m.name })),
                  },
                ],
              }}
            />

            {/* TV attribution */}
            <div className="flex items-center justify-end gap-1.5 border-t border-white/[0.04] px-4 py-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#374151]">
                Powered by TradingView
              </span>
            </div>
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">{t('disclaimer')}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <p className="font-body mb-7 text-[14px] text-white/60">{t('ctaDesc')}</p>
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
