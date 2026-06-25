'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';
import type { InstrumentItem } from './InstrumentsPage';

// Default TradingView symbol per category (used for the chart hero and as a
// fallback when a row symbol can't be confidently mapped to a TV symbol).
const CATEGORY_TV_SYMBOL: Record<string, string> = {
  forex: 'OANDA:EURUSD',
  indices: 'OANDA:SPX500USD',
  commodities: 'OANDA:XAUUSD',
  stocks: 'NASDAQ:AAPL',
  etfs: 'AMEX:SPY',
  crypto: 'BITSTAMP:BTCUSD',
};

const ALL_MARKETS = ['Forex', 'Indices', 'Commodities', 'Stocks', 'ETFs', 'Crypto'] as const;

// Live index quotes board (TradingView "market-quotes" embed).
//
// SYMBOL CHOICE MATTERS: the free embed only streams feeds it is entitled to.
// Cash-index tickers for US / EURONEXT exchanges and synthetic TVC:* symbols
// RESOLVE in symbol search but return NO data in the free widget (they need paid
// real-time entitlements) — that's why the board previously rendered mostly blank
// rows. We therefore use only feeds verified to populate the embed:
//   • OANDA / CAPITAL.COM index CFD feeds — free real-time, render in the widget
//   • exchange-native feeds that stream free delayed data (XETR, TSX, BME, SIX)
// All symbols are verified against TradingView's symbol search. When adding a row,
// prefer an OANDA:* CFD and confirm it actually populates in the live widget.
const INDICES_MARKET_QUOTES_CONFIG: Record<string, unknown> = {
  symbolsGroups: [
    {
      name: 'US & Canada',
      symbols: [
        { name: 'OANDA:SPX500USD', displayName: 'S&P 500' },
        { name: 'OANDA:NAS100USD', displayName: 'Nasdaq 100' },
        { name: 'OANDA:US30USD', displayName: 'Dow Jones 30' },
        { name: 'OANDA:US2000USD', displayName: 'Russell 2000' },
        { name: 'CAPITALCOM:VIX', displayName: 'Volatility Index' },
        { name: 'TSX:TSX', displayName: 'S&P/TSX Composite' },
      ],
    },
    {
      name: 'Europe',
      symbols: [
        { name: 'OANDA:UK100GBP', displayName: 'UK 100 (FTSE)' },
        { name: 'XETR:DAX', displayName: 'DAX 40' },
        { name: 'OANDA:FR40EUR', displayName: 'CAC 40' },
        { name: 'OANDA:EU50EUR', displayName: 'Euro Stoxx 50' },
        { name: 'BME:IBC', displayName: 'IBEX 35' },
        { name: 'SIX:SMI', displayName: 'Swiss Market Index' },
        { name: 'CAPITALCOM:IT40', displayName: 'FTSE MIB 40' },
        { name: 'OANDA:NL25EUR', displayName: 'AEX 25' },
      ],
    },
    {
      name: 'Asia / Pacific',
      symbols: [
        { name: 'OANDA:JP225USD', displayName: 'Nikkei 225' },
        { name: 'OANDA:HK33HKD', displayName: 'Hang Seng' },
        { name: 'OANDA:AU200AUD', displayName: 'ASX 200' },
        { name: 'OANDA:CN50USD', displayName: 'China A50' },
        { name: 'OANDA:SG30SGD', displayName: 'Singapore 30' },
      ],
    },
  ],
  showSymbolLogo: true,
  isTransparent: false,
  colorTheme: 'dark',
  locale: 'en',
};

// Normalise a display symbol for matching against CMS instruments, e.g.
// 'XAU/USD' → 'XAUUSD', 'AAPL.US' → 'AAPL', 'SPY.US' → 'SPY'. Used to look up the
// exact CMS-managed TradingView symbol for the selected watchlist row.
function normSym(symbol: string): string {
  return symbol
    .replace(/\.[A-Za-z]{2,4}$/, '') // strip exchange suffix (.US/.UK)
    .replace(/[^A-Za-z0-9]/g, '') // strip slashes/spaces
    .toUpperCase();
}

const CATEGORY_META: Record<
  string,
  {
    label: string;
    headline: string;
    sub: string;
    kicker: string;
    staticRows: {
      symbol: string;
      name: string;
      spread: string;
      change: string;
      up: boolean;
      /** Exact TradingView chart symbol for this row's chart (verified EXCHANGE:SYMBOL). */
      tv?: string;
    }[];
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
      {
        symbol: 'XAU/USD',
        name: 'Gold',
        spread: '1.6',
        change: '+1.24%',
        up: true,
        tv: 'OANDA:XAUUSD',
      },
      {
        symbol: 'XAG/USD',
        name: 'Silver',
        spread: '2.0',
        change: '+0.87%',
        up: true,
        tv: 'OANDA:XAGUSD',
      },
      {
        symbol: 'USOIL',
        name: 'Crude Oil WTI',
        spread: '0.03',
        change: '-0.52%',
        up: false,
        tv: 'TVC:USOIL',
      },
      {
        symbol: 'UKOIL',
        name: 'Brent Crude',
        spread: '0.04',
        change: '-0.48%',
        up: false,
        tv: 'TVC:UKOIL',
      },
      {
        symbol: 'NATGAS',
        name: 'Natural Gas',
        spread: '0.005',
        change: '+1.10%',
        up: true,
        tv: 'OANDA:NATGASUSD',
      },
      {
        symbol: 'XCU/USD',
        name: 'Copper',
        spread: '0.02',
        change: '+0.33%',
        up: true,
        tv: 'OANDA:XCUUSD',
      },
    ],
  },
  stocks: {
    label: 'Stocks',
    headline: 'Trade Stocks.',
    sub: 'CFDs on global equities — trade Apple, Tesla, Amazon and hundreds more.',
    kicker: 'STOCKS · GLOBAL EQUITIES',
    staticRows: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        spread: '0.1',
        change: '+0.44%',
        up: true,
        tv: 'NASDAQ:AAPL',
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        spread: '0.2',
        change: '-1.21%',
        up: false,
        tv: 'NASDAQ:TSLA',
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com',
        spread: '0.1',
        change: '+0.55%',
        up: true,
        tv: 'NASDAQ:AMZN',
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft',
        spread: '0.1',
        change: '+0.28%',
        up: true,
        tv: 'NASDAQ:MSFT',
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        spread: '0.2',
        change: '+2.14%',
        up: true,
        tv: 'NASDAQ:NVDA',
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        spread: '0.1',
        change: '+0.19%',
        up: true,
        tv: 'NASDAQ:GOOGL',
      },
    ],
  },
  etfs: {
    label: 'ETFs',
    headline: 'Trade ETFs.',
    sub: "Diversified exposure in a single instrument — trade the world's top ETFs.",
    kicker: 'ETFs · EXCHANGE-TRADED FUNDS',
    staticRows: [
      {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF',
        spread: '0.05',
        change: '-0.10%',
        up: false,
        tv: 'AMEX:SPY',
      },
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ ETF',
        spread: '0.05',
        change: '+0.28%',
        up: true,
        tv: 'NASDAQ:QQQ',
      },
      {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        spread: '0.10',
        change: '+1.15%',
        up: true,
        tv: 'AMEX:GLD',
      },
      {
        symbol: 'TLT',
        name: 'iShares 20Y Bond',
        spread: '0.05',
        change: '-0.22%',
        up: false,
        tv: 'NASDAQ:TLT',
      },
      {
        symbol: 'EEM',
        name: 'iShares EM ETF',
        spread: '0.05',
        change: '+0.07%',
        up: true,
        tv: 'AMEX:EEM',
      },
      {
        symbol: 'XLE',
        name: 'Energy Select ETF',
        spread: '0.05',
        change: '-0.41%',
        up: false,
        tv: 'AMEX:XLE',
      },
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

const SPEC_ROWS = [
  { key: 'minSpread', value: '0.0 pip' },
  { key: 'maxLeverage', value: '1:500' },
  { key: 'execution', value: '< 12 ms' },
  { key: 'minTrade', value: '0.01 lot' },
  { key: 'stopOut', value: '20%' },
];

export interface MarketCategoryPageProps {
  category: string;
  instruments?: InstrumentItem[];
  mt5Enabled?: boolean;
}

export function MarketCategoryPage({
  category,
  instruments,
  mt5Enabled = false,
}: MarketCategoryPageProps) {
  const locale = useLocale();
  const t = useTranslations('markets');
  const validKey = (category in CATEGORY_META ? category : 'forex') as keyof typeof CATEGORY_META;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const meta = CATEGORY_META[validKey]!;

  const catText = {
    forex: {
      label: t('forexLabel'),
      headline: t('forexHeadline'),
      sub: t('forexSub'),
      kicker: t('forexKicker'),
    },
    indices: {
      label: t('indicesLabel'),
      headline: t('indicesHeadline'),
      sub: t('indicesSub'),
      kicker: t('indicesKicker'),
    },
    commodities: {
      label: t('commoditiesLabel'),
      headline: t('commoditiesHeadline'),
      sub: t('commoditiesSub'),
      kicker: t('commoditiesKicker'),
    },
    stocks: {
      label: t('stocksLabel'),
      headline: t('stocksHeadline'),
      sub: t('stocksSub'),
      kicker: t('stocksKicker'),
    },
    etfs: {
      label: t('etfsLabel'),
      headline: t('etfsHeadline'),
      sub: t('etfsSub'),
      kicker: t('etfsKicker'),
    },
    crypto: {
      label: t('cryptoLabel'),
      headline: t('cryptoHeadline'),
      sub: t('cryptoSub'),
      kicker: t('cryptoKicker'),
    },
  };
  const { label, headline, sub, kicker } =
    catText[validKey as keyof typeof catText] ?? catText.forex;

  const cmsRows = instruments && instruments.length > 0 ? instruments : null;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1M');
  // The watchlist below renders meta.staticRows, so the chart follows the selected
  // static row. Resolve its TradingView symbol in priority order:
  //   1. the matching CMS instrument's tvSymbol (editor-managed, exact)
  //   2. the row's own verified `tv` symbol
  //   3. the category default
  // Every candidate is a real TradingView symbol, so the chart never shows
  // "symbol doesn't exist", and the chart label stays in sync with the clicked row.
  // The watchlist renders CMS instruments when available, else meta.staticRows;
  // the chart symbol follows the selected row from whichever source is active.
  const selectedCmsRow = cmsRows?.[selectedIdx] ?? cmsRows?.[0];
  const selectedStaticRow = meta.staticRows[selectedIdx] ?? meta.staticRows[0];
  const chartSymbol =
    selectedCmsRow?.tvSymbol ||
    cmsRows?.find((r) => normSym(r.symbol) === normSym(selectedStaticRow?.symbol ?? ''))
      ?.tvSymbol ||
    selectedStaticRow?.tv ||
    CATEGORY_TV_SYMBOL[category] ||
    'OANDA:EURUSD';

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-7 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 flex items-center gap-3">
            <SectionKicker>{kicker}</SectionKicker>
            {mt5Enabled && (
              <span className="bg-accent/10 text-accent flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">
                <span className="bg-accent inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
                {locale === 'ar' ? 'بيانات مباشرة MT5' : 'MT5 Live'}
              </span>
            )}
          </div>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {headline}
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[155%] xl:max-w-[480px]">
            {sub}
          </p>
        </div>
      </section>

      {/* Instrument list — forex cross-rates heatmap or watchlist widget */}
      <section className="px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {category === 'forex' ? (
            /* Forex: TradingView cross-rates heatmap */
            <>
              <SectionKicker className="mb-3">{`${label.toUpperCase()} · ${t('crossRates').toUpperCase()}`}</SectionKicker>
              <div className="relative overflow-hidden rounded-[20px] bg-[#07090D] xl:rounded-[24px]">
                <ChartWidget
                  type="forex-cross-rates"
                  theme="dark"
                  width="100%"
                  height={460}
                  config={{
                    currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'],
                    isTransparent: false,
                  }}
                />
              </div>
            </>
          ) : category === 'indices' ? (
            /* Indices: market-quotes widget grouped by region with internal scroll */
            <>
              <SectionKicker className="mb-3">{`${label.toUpperCase()} · ${t('liveQuotes').toUpperCase()}`}</SectionKicker>
              <div className="overflow-hidden rounded-[20px] bg-[#07090D] xl:rounded-[24px]">
                <ChartWidget
                  type="market-quotes"
                  theme="dark"
                  width="100%"
                  height={700}
                  config={INDICES_MARKET_QUOTES_CONFIG}
                />
              </div>
            </>
          ) : category === 'crypto' ? (
            /* Crypto: full crypto screener */
            <>
              <SectionKicker className="mb-3">{`${label.toUpperCase()} · ${t('livePrices').toUpperCase()}`}</SectionKicker>
              <div className="relative overflow-hidden rounded-[20px] bg-[#07090D] xl:rounded-[24px]">
                <ChartWidget
                  type="screener"
                  theme="dark"
                  width="100%"
                  height={700}
                  config={{
                    market: 'crypto',
                    defaultColumn: 'overview',
                    screener_type: 'crypto_mkt',
                    displayCurrency: 'USD',
                    isTransparent: false,
                  }}
                />
              </div>
            </>
          ) : (
            /* All other categories: TradingView chart + instrument watchlist */
            <>
              <SectionKicker className="mb-3">
                {/* {cmsRows
                  ? `${meta.label.toUpperCase()} · ${cmsRows.length} INSTRUMENTS`
                  : `${meta.label.toUpperCase()} · LIVE WATCHLIST`} */}
                {`${label.toUpperCase()} · ${t('liveWatchlist').toUpperCase()}`}
              </SectionKicker>

              {/* TradingView chart — symbol follows the selected row below */}
              <div className="mb-3 overflow-hidden rounded-[20px] bg-[#07090D] xl:rounded-[24px]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/30">
                    {chartSymbol.split(':')[1] ?? chartSymbol}
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
                  <ChartWidget
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

              {/* Dark watchlist container */}
              <div className="overflow-hidden rounded-[20px] bg-[#111111] xl:rounded-[24px]">
                <div className="border-white/8 grid grid-cols-[1fr_64px_64px] border-b px-4 py-2 xl:grid-cols-[1fr_120px_120px] xl:px-6">
                  <span className="font-body text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                    {t('colSymbol')}
                  </span>
                  <span className="font-body text-end text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                    {t('colSpread')}
                  </span>
                  <span className="font-body text-end text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                    {t('colChange')}
                  </span>
                </div>

                {cmsRows
                  ? cmsRows.map((item, i) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedIdx(i)}
                        className={`grid w-full grid-cols-[1fr_64px_64px] items-center px-4 py-[11px] text-start transition-colors xl:grid-cols-[1fr_120px_120px] xl:px-6 xl:py-[14px] ${i < cmsRows.length - 1 ? 'border-b border-white/[0.06]' : ''} ${selectedIdx === i ? 'bg-[#161d27]' : 'hover:bg-white/[0.03]'}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${selectedIdx === i ? 'bg-accent' : 'bg-[#26A69A]'}`}
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
                        <p className="font-body text-end text-[12px] font-medium text-white/70">
                          {item.spread != null ? `${item.spread}` : '—'}
                        </p>
                        <div className="flex justify-end">
                          <span className="font-body inline-flex items-center rounded-[6px] bg-white/10 px-2 py-[3px] text-[10px] font-semibold text-white/50">
                            {item.leverage ?? '—'}
                          </span>
                        </div>
                      </button>
                    ))
                  : meta.staticRows.map((row, i) => (
                      <button
                        type="button"
                        key={row.symbol}
                        onClick={() => setSelectedIdx(i)}
                        className={`grid w-full grid-cols-[1fr_64px_64px] items-center px-4 py-[11px] text-start transition-colors xl:grid-cols-[1fr_120px_120px] xl:px-6 xl:py-[14px] ${i < meta.staticRows.length - 1 ? 'border-b border-white/[0.06]' : ''} ${selectedIdx === i ? 'bg-[#161d27]' : 'hover:bg-white/[0.03]'}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${selectedIdx === i ? 'bg-accent' : row.up ? 'bg-[#26A69A]' : 'bg-[#EE5250]'}`}
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
                        <p className="font-body text-end text-[12px] font-medium text-white/70">
                          {row.spread}
                        </p>
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
                      </button>
                    ))}
              </div>

              <Link
                href={`/${locale}/trade/accounts`}
                className="dark:bg-surface dark:hover:bg-surface-elevated mt-3 flex w-full items-center justify-between rounded-[14px] bg-[#FAFAF9] px-4 py-[13px] transition-colors hover:bg-[#f0f0ee]"
              >
                <span className="font-body text-foreground text-[13px] font-medium">
                  {t('openAccountLabel', { category: label.toLowerCase() })}
                </span>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#111111] dark:bg-white">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="rtl:-scale-x-100"
                  >
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
            </>
          )}
        </div>
      </section>

      {/* Specs section */}
      <section className="rounded-t-[32px] bg-gradient-to-r from-[#FFFFFF] to-[#E2E2E2] px-5 pb-10 pt-10 dark:bg-gradient-to-r dark:from-[#000000] dark:to-[#1F262E]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
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
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-foreground [&>span:last-child]:text-foreground mb-4 font-mono text-[10px] font-medium leading-[100%] tracking-[0.18em]">
            {t('otherKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[108%] tracking-[-0.8px]">
            {t('otherHeading')}
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {ALL_MARKETS.filter((m) => m.toLowerCase() !== validKey).map((market) => (
              <Link
                key={market}
                href={`/${locale}/markets/${market.toLowerCase()}`}
                className="hover:border-accent/30 group flex items-center justify-between rounded-[18px] border border-white/[0.12] bg-[#FAFAF9] px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.10] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] dark:bg-[#000000]"
              >
                <div>
                  <p className="text-foreground font-sans text-[15px] font-semibold">
                    {catText[market.toLowerCase() as keyof typeof catText]?.label ?? market}
                  </p>
                  <p className="font-body mt-[3px] text-[11px] text-[#5D6067] dark:text-[#B8BFCC]">
                    {t('liveTag')}
                  </p>
                </div>
                <div className="group-hover:bg-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[rgba(0,214,97,0.30)] to-[rgba(255,255,255,0.30)] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 12L12 4M12 4H7M12 4v5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="invert"
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
