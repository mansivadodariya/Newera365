'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import type { InstrumentItem } from './InstrumentsPage';

const CATEGORY_META: Record<
  string,
  {
    label: string;
    headline: string;
    sub: string;
    kicker: string;
    staticRows: { symbol: string; name: string; spread: string; change: string; up: boolean }[];
  }
> = {
  forex: {
    label: 'Forex',
    headline: 'Trade Forex.',
    sub: 'Tight spreads, fast execution across 70+ currency pairs.',
    kicker: 'FOREX · CURRENCY PAIRS',
    staticRows: [
      { symbol: 'EUR/USD', name: 'Euro / US Dollar', spread: '0.8', change: '+0.14%', up: true },
      { symbol: 'GBP/USD', name: 'Pound / US Dollar', spread: '1.0', change: '-0.08%', up: false },
      { symbol: 'USD/JPY', name: 'US Dollar / Yen', spread: '0.9', change: '+0.21%', up: true },
      { symbol: 'AUD/USD', name: 'Aussie / US Dollar', spread: '0.9', change: '-0.05%', up: false },
      { symbol: 'USD/CAD', name: 'US Dollar / CAD', spread: '1.2', change: '+0.09%', up: true },
      { symbol: 'EUR/GBP', name: 'Euro / Pound', spread: '1.1', change: '-0.11%', up: false },
      { symbol: 'XAU/USD', name: 'Gold / US Dollar', spread: '1.6', change: '+1.24%', up: true },
      { symbol: 'XAG/USD', name: 'Silver / US Dollar', spread: '2.0', change: '+0.87%', up: true },
    ],
  },
  indices: {
    label: 'Indices',
    headline: 'Trade Indices.',
    sub: "Access the world's leading stock market indices with tight spreads.",
    kicker: 'INDICES · GLOBAL MARKETS',
    staticRows: [
      { symbol: 'SPX500', name: 'S&P 500', spread: '0.4', change: '-0.12%', up: false },
      { symbol: 'NAS100', name: 'Nasdaq 100', spread: '0.6', change: '+0.31%', up: true },
      { symbol: 'DJI30', name: 'Dow Jones 30', spread: '1.0', change: '+0.09%', up: true },
      { symbol: 'GER40', name: 'DAX 40', spread: '1.2', change: '+0.44%', up: true },
      { symbol: 'UK100', name: 'FTSE 100', spread: '1.0', change: '-0.21%', up: false },
      { symbol: 'JPN225', name: 'Nikkei 225', spread: '5.0', change: '+0.18%', up: true },
    ],
  },
  commodities: {
    label: 'Commodities',
    headline: 'Trade Commodities.',
    sub: 'Gold, silver, oil and more — trade real assets at institutional pricing.',
    kicker: 'COMMODITIES · METALS & ENERGY',
    staticRows: [
      { symbol: 'XAU/USD', name: 'Gold', spread: '1.6', change: '+1.24%', up: true },
      { symbol: 'XAG/USD', name: 'Silver', spread: '2.0', change: '+0.87%', up: true },
      { symbol: 'USOIL', name: 'Crude Oil WTI', spread: '0.03', change: '-0.52%', up: false },
      { symbol: 'UKOIL', name: 'Brent Crude', spread: '0.04', change: '-0.48%', up: false },
      { symbol: 'NATGAS', name: 'Natural Gas', spread: '0.005', change: '+1.10%', up: true },
      { symbol: 'XCU/USD', name: 'Copper', spread: '0.02', change: '+0.33%', up: true },
    ],
  },
  stocks: {
    label: 'Stocks',
    headline: 'Trade Stocks.',
    sub: 'CFDs on global equities — trade Apple, Tesla, Amazon and hundreds more.',
    kicker: 'STOCKS · GLOBAL EQUITIES',
    staticRows: [
      { symbol: 'AAPL', name: 'Apple Inc.', spread: '0.1', change: '+0.44%', up: true },
      { symbol: 'TSLA', name: 'Tesla Inc.', spread: '0.2', change: '-1.21%', up: false },
      { symbol: 'AMZN', name: 'Amazon.com', spread: '0.1', change: '+0.55%', up: true },
      { symbol: 'MSFT', name: 'Microsoft', spread: '0.1', change: '+0.28%', up: true },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', spread: '0.2', change: '+2.14%', up: true },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', spread: '0.1', change: '+0.19%', up: true },
    ],
  },
  etfs: {
    label: 'ETFs',
    headline: 'Trade ETFs.',
    sub: "Diversified exposure in a single instrument — trade the world's top ETFs.",
    kicker: 'ETFs · EXCHANGE-TRADED FUNDS',
    staticRows: [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', spread: '0.05', change: '-0.10%', up: false },
      { symbol: 'QQQ', name: 'Invesco QQQ ETF', spread: '0.05', change: '+0.28%', up: true },
      { symbol: 'GLD', name: 'SPDR Gold Shares', spread: '0.10', change: '+1.15%', up: true },
      { symbol: 'TLT', name: 'iShares 20Y Bond', spread: '0.05', change: '-0.22%', up: false },
      { symbol: 'EEM', name: 'iShares EM ETF', spread: '0.05', change: '+0.07%', up: true },
      { symbol: 'XLE', name: 'Energy Select ETF', spread: '0.05', change: '-0.41%', up: false },
    ],
  },
  crypto: {
    label: 'Crypto',
    headline: 'Trade Crypto.',
    sub: 'Bitcoin, Ethereum and major altcoins — 24/7 crypto markets at your fingertips.',
    kicker: 'CRYPTO · DIGITAL ASSETS',
    staticRows: [
      { symbol: 'BTC/USD', name: 'Bitcoin', spread: '12', change: '+1.82%', up: true },
      { symbol: 'ETH/USD', name: 'Ethereum', spread: '1.5', change: '+2.14%', up: true },
      { symbol: 'SOL/USD', name: 'Solana', spread: '0.5', change: '+3.41%', up: true },
      { symbol: 'XRP/USD', name: 'Ripple', spread: '0.002', change: '-0.88%', up: false },
      { symbol: 'ADA/USD', name: 'Cardano', spread: '0.001', change: '+0.44%', up: true },
      { symbol: 'DOGE/USD', name: 'Dogecoin', spread: '0.0005', change: '-1.12%', up: false },
    ],
  },
};

const SPEC_ROWS = [
  { key: 'minSpread', value: 'from 0.0 pip' },
  { key: 'maxLeverage', value: '1:500' },
  { key: 'execution', value: '< 12 ms' },
  { key: 'minTrade', value: '0.01 lot' },
  { key: 'stopOut', value: '20%' },
];

export interface MarketCategoryPageProps {
  category: string;
  instruments?: InstrumentItem[];
}

export function MarketCategoryPage({ category, instruments }: MarketCategoryPageProps) {
  const locale = useLocale();
  const t = useTranslations('markets');
  const validKey = (category in CATEGORY_META ? category : 'forex') as keyof typeof CATEGORY_META;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const meta = CATEGORY_META[validKey]!;

  const cmsRows = instruments && instruments.length > 0 ? instruments : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-7 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Link
            href={`/${locale}/markets/instruments`}
            className="font-body text-muted hover:text-foreground mb-5 flex items-center gap-1 text-[13px] transition-colors"
          >
            <svg width="6" height="10" viewBox="0 0 7 12" fill="none">
              <path
                d="M6 1L1 6L6 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('backLink')}
          </Link>

          <SectionKicker className="mb-4">{meta.kicker}</SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {meta.headline}
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[155%] xl:max-w-[480px]">
            {meta.sub}
          </p>
        </div>
      </section>

      {/* Instrument list — watchlist widget */}
      <section className="bg-background px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3">
            {cmsRows
              ? `${meta.label.toUpperCase()} · ${cmsRows.length} INSTRUMENTS`
              : `${meta.label.toUpperCase()} · LIVE WATCHLIST`}
          </SectionKicker>

          {/* Dark watchlist container */}
          <div className="overflow-hidden rounded-[20px] bg-[#111111] xl:rounded-[24px]">
            {/* Column header */}
            <div className="border-white/8 grid grid-cols-[1fr_64px_64px] border-b px-4 py-2 xl:grid-cols-[1fr_120px_120px] xl:px-6">
              <span className="font-body text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                {t('colSymbol')}
              </span>
              <span className="font-body text-right text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                {t('colSpread')}
              </span>
              <span className="font-body text-right text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                {t('colChange')}
              </span>
            </div>

            {/* Rows */}
            {cmsRows
              ? cmsRows.map((item, i) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[1fr_64px_64px] items-center px-4 py-[11px] xl:grid-cols-[1fr_120px_120px] xl:px-6 xl:py-[14px] ${i < cmsRows.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    {/* Left: indicator dot + symbol + name */}
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#26A69A]" />
                      <div className="min-w-0">
                        <p className="font-sans text-[13px] font-semibold leading-none text-white">
                          {item.symbol}
                        </p>
                        <p className="font-body mt-[3px] truncate text-[10px] text-white/40">
                          {item.name}
                        </p>
                      </div>
                    </div>
                    {/* Spread */}
                    <p className="font-body text-right text-[12px] font-medium text-white/70">
                      {item.spread != null ? `${item.spread}` : '—'}
                    </p>
                    {/* Change — CMS rows have no change data, show neutral */}
                    <div className="flex justify-end">
                      <span className="font-body inline-flex items-center rounded-[6px] bg-white/10 px-2 py-[3px] text-[10px] font-semibold text-white/50">
                        —
                      </span>
                    </div>
                  </div>
                ))
              : meta.staticRows.map((row, i) => (
                  <div
                    key={row.symbol}
                    className={`grid grid-cols-[1fr_64px_64px] items-center px-4 py-[11px] xl:grid-cols-[1fr_120px_120px] xl:px-6 xl:py-[14px] ${i < meta.staticRows.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    {/* Left: indicator dot + symbol + name */}
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${row.up ? 'bg-[#26A69A]' : 'bg-[#EE5250]'}`}
                      />
                      <div className="min-w-0">
                        <p className="font-sans text-[13px] font-semibold leading-none text-white">
                          {row.symbol}
                        </p>
                        <p className="font-body mt-[3px] truncate text-[10px] text-white/40">
                          {row.name}
                        </p>
                      </div>
                    </div>
                    {/* Spread */}
                    <p className="font-body text-right text-[12px] font-medium text-white/70">
                      {row.spread}
                    </p>
                    {/* Change pill */}
                    <div className="flex justify-end">
                      <span
                        className={`font-body inline-flex items-center rounded-[6px] px-2 py-[3px] text-[10px] font-semibold ${
                          row.up
                            ? 'bg-[#26A69A]/20 text-[#26A69A]'
                            : 'bg-[#EE5250]/20 text-[#EE5250]'
                        }`}
                      >
                        {row.change}
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          <Link
            href={`/${locale}/trade/accounts`}
            className="dark:bg-surface dark:hover:bg-surface-elevated mt-3 flex w-full items-center justify-between rounded-[14px] bg-[#FAFAF9] px-4 py-[13px] transition-colors hover:bg-[#f0f0ee]"
          >
            <span className="font-body text-foreground text-[13px] font-medium">
              {t('openAccountLabel', { category: meta.label.toLowerCase() })}
            </span>
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#111111] dark:bg-white">
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
        </div>
      </section>

      {/* Specs section */}
      <section className="rounded-[32px] bg-[#111111] px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                <span className="font-body text-[14px] font-semibold text-white">{row.value}</span>
              </div>
            ))}
          </div>

          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[48px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            {t('startTradingBtn', { category: meta.label })}
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
          <SectionKicker className="mb-4">{t('otherMarketsKicker')}</SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[108%] tracking-[-0.8px]">
            {t('otherMarketsHeading')}
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {Object.entries(CATEGORY_META)
              .filter(([key]) => key !== category)
              .map(([key, m]) => (
                <Link
                  key={key}
                  href={`/${locale}/markets/${key}`}
                  className="dark:bg-surface dark:hover:bg-surface-elevated flex items-center justify-between rounded-[18px] bg-[#FAFAF9] px-5 py-4 transition-colors hover:bg-[#f0f0ee]"
                >
                  <div>
                    <p className="text-foreground font-sans text-[15px] font-semibold">{m.label}</p>
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
