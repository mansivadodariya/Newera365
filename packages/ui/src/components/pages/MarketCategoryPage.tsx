'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { ChartWidget } from '../market/ChartWidget';
import { Accordion } from '../primitives/Accordion';
export interface InstrumentItem {
  id: number;
  name: string;
  symbol: string;
  assetClass: string;
  /** Exact TradingView chart symbol (EXCHANGE:SYMBOL), CMS-managed. */
  tvSymbol?: string | null;
  spread?: number | null;
  leverage?: string | null;
  minTradeSize?: number | null;
  // Specification fields surfaced on the market-category spec panel
  contractSize?: number | null;
  marginRequirement?: number | null;
  tradingHours?: string | null;
  swapLong?: number | null;
  swapShort?: number | null;
}

// Capitalized category token used to build the per-category i18n key names for
// the "Why trade" reasons and the FAQ accordion (e.g. whyForex1Title, faqForexQ1).
const KEY_CAP: Record<string, string> = {
  forex: 'Forex',
  indices: 'Indices',
  commodities: 'Commodities',
  stocks: 'Stocks',
  etfs: 'Etfs',
  crypto: 'Crypto',
};

// Three editorial "why trade" reasons and four FAQ entries per category. The
// content itself is category-keyed in messages/*.json; here we only carry the
// row indices so each category renders its own copy.
const WHY_ITEMS = [1, 2, 3] as const;
const FAQ_ITEMS = [1, 2, 3, 4] as const;

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
    sub: 'Gold, silver, oil and more: trade real assets at institutional pricing.',
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
    sub: 'CFDs on global equities: trade Apple, Tesla, Amazon and hundreds more.',
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
    sub: "Diversified exposure in a single instrument: trade the world's top ETFs.",
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
    sub: 'Bitcoin, Ethereum and major altcoins: 24/7 crypto markets at your fingertips.',
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
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  // Capitalized token for building per-category "why"/"faq" i18n key names.
  const cap = KEY_CAP[validKey];
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

  // Per-instrument specification cells for the selected CMS row. Swaps are
  // signed values (negative = cost to hold overnight).
  const fmtSwap = (v: number) => (v > 0 ? `+${v}` : `${v}`);
  const specCells = selectedCmsRow
    ? [
        {
          label: t('colSpread'),
          value: selectedCmsRow.spread != null ? `${selectedCmsRow.spread}` : null,
        },
        { label: t('specLeverage'), value: selectedCmsRow.leverage ?? null },
        {
          label: t('specMinTrade'),
          value: selectedCmsRow.minTradeSize != null ? `${selectedCmsRow.minTradeSize} lot` : null,
        },
        {
          label: t('specContractSize'),
          value:
            selectedCmsRow.contractSize != null
              ? selectedCmsRow.contractSize.toLocaleString('en-US')
              : null,
        },
        {
          label: t('specMarginRequirement'),
          value:
            selectedCmsRow.marginRequirement != null
              ? `${selectedCmsRow.marginRequirement}%`
              : null,
        },
        {
          label: t('specSwapLong'),
          value: selectedCmsRow.swapLong != null ? fmtSwap(selectedCmsRow.swapLong) : null,
        },
        {
          label: t('specSwapShort'),
          value: selectedCmsRow.swapShort != null ? fmtSwap(selectedCmsRow.swapShort) : null,
        },
        { label: t('specTradingHours'), value: selectedCmsRow.tradingHours ?? null },
      ]
    : [];
  // Only worth a panel when the instrument actually carries spec data beyond
  // what the watchlist row already shows.
  const hasSpecPanel =
    selectedCmsRow != null &&
    (selectedCmsRow.contractSize != null ||
      selectedCmsRow.marginRequirement != null ||
      selectedCmsRow.tradingHours != null ||
      selectedCmsRow.swapLong != null ||
      selectedCmsRow.swapShort != null ||
      selectedCmsRow.minTradeSize != null);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-7 pt-9">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 flex items-center gap-3">
            <SectionKicker>{kicker}</SectionKicker>
            {mt5Enabled && (
              <span className="bg-accent/10 text-accent flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">
                <span className="bg-accent inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
                {locale === 'ar' ? 'بيانات مباشرة MT5' : 'MT5 Live'}
              </span>
            )}
          </div>
          <h1 className="text-foreground text-display mb-3 font-sans">{headline}</h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[155%] xl:max-w-[480px]">
            {sub}
          </p>
        </ScrollReveal>
      </section>

      {/* Instrument list — forex cross-rates heatmap or watchlist widget */}
      <section className="px-5 pb-6">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {category === 'forex' ? (
            /* Forex: TradingView cross-rates heatmap */
            <>
              <SectionKicker className="mb-3">{`${label.toUpperCase()} · ${t('crossRates').toUpperCase()}`}</SectionKicker>
              <div className="relative h-[380px] overflow-hidden rounded-[20px] bg-[#07090D] md:h-[420px] xl:h-[460px] xl:rounded-[24px]">
                <ChartWidget
                  type="forex-cross-rates"
                  theme="dark"
                  width="100%"
                  height="100%"
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
              <div className="h-[440px] overflow-hidden rounded-[20px] bg-[#07090D] md:h-[560px] xl:h-[700px] xl:rounded-[24px]">
                <ChartWidget
                  type="market-quotes"
                  theme="dark"
                  width="100%"
                  height="100%"
                  config={INDICES_MARKET_QUOTES_CONFIG}
                />
              </div>
            </>
          ) : category === 'crypto' ? (
            /* Crypto: full crypto screener */
            <>
              <SectionKicker className="mb-3">{`${label.toUpperCase()} · ${t('livePrices').toUpperCase()}`}</SectionKicker>
              <div className="relative h-[440px] overflow-hidden rounded-[20px] bg-[#07090D] md:h-[560px] xl:h-[700px] xl:rounded-[24px]">
                <ChartWidget
                  type="screener"
                  theme="dark"
                  width="100%"
                  height="100%"
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
                            ? 'bg-accent font-semibold text-white'
                            : 'text-white/45 hover:text-white'
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

              {/* Per-instrument specifications — CMS-driven, follows the
                  selected watchlist row; individual fields degrade to '—'. */}
              {hasSpecPanel && selectedCmsRow && (
                <div className="mb-3 overflow-hidden rounded-[20px] bg-[#111111] xl:rounded-[24px]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 xl:px-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/30">
                      {t('specPanelHeading')}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/50"
                      dir="ltr"
                    >
                      {selectedCmsRow.symbol}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-4 py-4 xl:grid-cols-4 xl:px-6 xl:py-5">
                    {specCells.map((cell) => (
                      <div key={cell.label} className="min-w-0">
                        <p className="font-body text-[10px] uppercase tracking-[0.08em] text-white/40">
                          {cell.label}
                        </p>
                        <p
                          className="font-body mt-1 truncate text-[13px] font-semibold tabular-nums text-white"
                          dir="ltr"
                          title={cell.value ?? undefined}
                        >
                          {cell.value ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dark watchlist container */}
              <div className="overflow-hidden rounded-[20px] bg-[#111111] xl:rounded-[24px]">
                <div className="border-white/8 grid grid-cols-[minmax(0,1fr)_72px_56px] border-b px-4 py-2 xl:grid-cols-[1fr_180px_100px_110px_110px_110px] xl:px-6">
                  <span className="font-body text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                    {t('colSymbol')}
                  </span>
                  <span className="font-body hidden text-start text-[9px] font-medium uppercase tracking-[0.12em] text-white/30 xl:block">
                    {t('colSecurity')}
                  </span>
                  <span className="font-body text-end text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
                    {t('colSpread')}
                  </span>
                  <span className="font-body hidden text-end text-[9px] font-medium uppercase tracking-[0.12em] text-white/30 xl:block">
                    {t('colContract')}
                  </span>
                  <span className="font-body hidden text-end text-[9px] font-medium uppercase tracking-[0.12em] text-white/30 xl:block">
                    {t('colMargin')}
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
                        className={`grid w-full grid-cols-[minmax(0,1fr)_72px_56px] items-center px-4 py-[11px] text-start transition-colors xl:grid-cols-[1fr_180px_100px_110px_110px_110px] xl:px-6 xl:py-[14px] ${i < cmsRows.length - 1 ? 'border-b border-white/[0.06]' : ''} ${selectedIdx === i ? 'bg-accent/[0.14]' : 'hover:bg-accent/[0.06]'}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${selectedIdx === i ? 'bg-accent' : 'bg-[#26A69A]'}`}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-sans text-[13px] font-semibold leading-none text-white">
                              {item.symbol}
                            </p>
                            <p className="font-body mt-[3px] truncate text-[10px] text-white/40 xl:hidden">
                              {item.name}
                            </p>
                          </div>
                        </div>
                        <p
                          className="font-body hidden truncate text-start text-[12px] font-medium text-white/70 xl:block"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        <p
                          className="font-body text-end text-[12px] font-medium tabular-nums text-white/70"
                          dir="ltr"
                        >
                          {item.spread != null ? `${item.spread}` : '—'}
                        </p>
                        <p
                          className="font-body hidden text-end text-[12px] font-medium tabular-nums text-white/70 xl:block"
                          dir="ltr"
                        >
                          {item.contractSize != null
                            ? item.contractSize.toLocaleString('en-US')
                            : '—'}
                        </p>
                        <p
                          className="font-body hidden text-end text-[12px] font-medium tabular-nums text-white/70 xl:block"
                          dir="ltr"
                        >
                          {item.marginRequirement != null ? `${item.marginRequirement}%` : '—'}
                        </p>
                        <div className="flex justify-end">
                          <span className="font-body inline-flex items-center rounded-[6px] bg-white/10 px-2 py-[3px] text-[10px] font-semibold tabular-nums text-white/50">
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
                        className={`grid w-full grid-cols-[minmax(0,1fr)_72px_56px] items-center px-4 py-[11px] text-start transition-colors xl:grid-cols-[1fr_180px_100px_110px_110px_110px] xl:px-6 xl:py-[14px] ${i < meta.staticRows.length - 1 ? 'border-b border-white/[0.06]' : ''} ${selectedIdx === i ? 'bg-accent/[0.14]' : 'hover:bg-accent/[0.06]'}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${selectedIdx === i ? 'bg-accent' : row.up ? 'bg-[#26A69A]' : 'bg-[#EE5250]'}`}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-sans text-[13px] font-semibold leading-none text-white">
                              {row.symbol}
                            </p>
                            <p className="font-body mt-[3px] truncate text-[10px] text-white/40 xl:hidden">
                              {row.name}
                            </p>
                          </div>
                        </div>
                        <p
                          className="font-body hidden truncate text-start text-[12px] font-medium text-white/70 xl:block"
                          title={row.name}
                        >
                          {row.name}
                        </p>
                        <p
                          className="font-body text-end text-[12px] font-medium tabular-nums text-white/70"
                          dir="ltr"
                        >
                          {row.spread}
                        </p>
                        <p className="font-body hidden text-end text-[12px] font-medium text-white/40 xl:block">
                          —
                        </p>
                        <p className="font-body hidden text-end text-[12px] font-medium text-white/40 xl:block">
                          —
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
                className="dark:bg-surface hover:bg-accent/[0.06] dark:hover:bg-accent/[0.10] mt-3 flex w-full items-center justify-between rounded-[14px] bg-[#F0F4F1] px-4 py-[13px] transition-colors"
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
        </ScrollReveal>
      </section>

      {/* Why trade {category}: editorial reason ledger (ghost numerals, hairline rows) */}
      <section className="bg-transparent px-5 pb-6 pt-2">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">
            {`${label.toUpperCase()} · ${t('whyKickerLabel').toUpperCase()}`}
          </SectionKicker>
          <h2 className="text-foreground text-headline mb-6 font-sans">
            {t('whyHeading', { category: label })}
          </h2>
          <div className="border-border/70 border-t dark:border-white/[0.08]">
            {WHY_ITEMS.map((n, i) => (
              <ScrollReveal key={n} index={i}>
                <div className="border-border/70 border-b py-2 dark:border-white/[0.08]">
                  <div className="group flex items-start gap-5 rounded-[16px] px-4 py-5 transition-all duration-300 hover:bg-[#00b050]">
                    <span
                      className="font-mono text-[28px] font-semibold text-gray-400 transition-colors duration-300 group-hover:text-white xl:text-[32px] dark:text-white/40"
                      dir="ltr"
                    >
                      {`0${n}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground text-title font-sans font-bold transition-colors duration-300 group-hover:text-white">
                        {t(`why${cap}${n}Title`)}
                      </h3>
                      <p className="font-body text-muted text-body mt-2 max-w-[62ch] transition-colors duration-300 group-hover:text-white/95">
                        {t(`why${cap}${n}Body`)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Frequently asked questions: shared animated accordion */}
      <section className="bg-transparent px-5 pb-8 pt-2">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">
            {`${label.toUpperCase()} · ${t('faqKickerLabel').toUpperCase()}`}
          </SectionKicker>
          <h2 className="text-foreground text-headline mb-6 font-sans">{t('faqHeading')}</h2>
          <div className="flex flex-col gap-[10px]">
            {FAQ_ITEMS.map((n, i) => {
              const id = `market-faq-${n}`;
              return (
                <ScrollReveal key={n} index={i}>
                  <Accordion
                    id={id}
                    question={t(`faq${cap}Q${n}`)}
                    answer={t(`faq${cap}A${n}`)}
                    isOpen={openFaq === id}
                    onToggle={() => setOpenFaq(openFaq === id ? null : id)}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* Specs section */}
      {validKey !== 'commodities' && (
        <section className="rounded-t-[32px] bg-gradient-to-r from-[#DCEAE1] to-[#F2F5F3] px-5 pb-10 pt-10 rtl:bg-gradient-to-l dark:from-[#0C1F14] dark:to-[#07090D]">
          <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            {/* <SectionKicker className="mb-4"> */}
            <SectionKicker className="mb-4">{t('specsKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline mb-6 font-sans">{t('specsHeading')}</h2>

            <div className="mb-6 grid grid-cols-1 gap-3 rounded-[18px] bg-[#111111] md:grid-cols-2 md:gap-4">
              {SPEC_ROWS.map((row, i) => (
                <div
                  key={row.key}
                  className={`flex items-center justify-between px-5 py-[13px] ${i < SPEC_ROWS.length - 1 ? 'border-b border-[#1f1c1c]' : ''}`}
                >
                  <span className="font-body text-[13px] text-white/70">
                    {t(
                      `spec${row.key.charAt(0).toUpperCase() + row.key.slice(1)}` as 'specMinSpread',
                    )}
                  </span>
                  <span className="font-mono text-[14px] font-bold tabular-nums text-white">
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
          </ScrollReveal>
        </section>
      )}

      {/* Other markets */}
      <section
        className={`${validKey === 'commodities' ? 'rounded-t-[32px]' : ''} bg-gradient-to-r from-[#DCEAE1] to-[#F2F5F3] px-5 pb-12 pt-10 rtl:bg-gradient-to-l dark:from-[#0C1F14] dark:to-[#07090D]`}
      >
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 text-[10px] leading-[100%] tracking-[0.18em]">
            {t('otherKicker')}
          </SectionKicker>
          <h2 className="text-foreground text-headline mb-6 font-sans">{t('otherHeading')}</h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {ALL_MARKETS.filter((m) => m.toLowerCase() !== validKey).map((market, i) => (
              <ScrollReveal key={market} index={i}>
                <Link
                  href={`/${locale}/markets/${market.toLowerCase()}`}
                  className="hover:border-accent/30 hover:bg-accent/[0.12] group flex items-center justify-between rounded-[18px] border border-white/[0.12] bg-[#F0F4F1] px-5 py-4 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] dark:bg-[#000000]"
                >
                  <div>
                    <p className="text-foreground font-sans text-[15px] font-semibold">
                      {catText[market.toLowerCase() as keyof typeof catText]?.label ?? market}
                    </p>
                    <p className="font-body text-muted mt-[3px] text-[11px] dark:text-white/60">
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
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
