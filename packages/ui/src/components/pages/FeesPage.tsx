'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CountUp } from '../motion/CountUp';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SectionKicker } from '../primitives/SectionKicker';

const OTHER_CHARGES = [
  { key: 'opening', label: 'Account opening', value: 'Free', green: true },
  { key: 'deposits', label: 'Deposits', value: 'Free', green: true },
  { key: 'withdrawals', label: 'Withdrawals', value: 'Free', green: true },
  { key: 'inactivity', label: 'Inactivity', value: '$10 / mo', green: false },
  { key: 'swap', label: 'Swap (overnight)', value: 'Per-instrument', green: false },
  { key: 'fx', label: 'Currency conversion', value: '0.5%', green: false },
] as const;

export interface CmsSpreadRow {
  instrument: string;
  symbol: string;
  assetClass?: string | null;
  leverage?: string | null;
  spread?: number | null;
  /** Dedicated RAW spread (preferred over computed value) */
  spreadRaw?: number | null;
  /** Dedicated Standard spread (preferred over computed value) */
  spreadStandard?: number | null;
  /** Dedicated VIP spread (preferred over computed value) */
  spreadVip?: number | null;
}

const DEFAULT_SPREAD_ROWS: CmsSpreadRow[] = [
  {
    instrument: 'EUR/USD',
    symbol: 'EURUSD',
    assetClass: 'forex',
    leverage: '1:2000',
    spreadRaw: 0.0,
    spreadStandard: 0.8,
    spreadVip: 1.2,
  },
  {
    instrument: 'GBP/USD',
    symbol: 'GBPUSD',
    assetClass: 'forex',
    leverage: '1:2000',
    spreadRaw: 0.1,
    spreadStandard: 1.0,
    spreadVip: 1.5,
  },
  {
    instrument: 'USD/JPY',
    symbol: 'USDJPY',
    assetClass: 'forex',
    leverage: '1:2000',
    spreadRaw: 0.1,
    spreadStandard: 0.9,
    spreadVip: 1.3,
  },
  {
    instrument: 'Gold (XAU/USD)',
    symbol: 'XAUUSD',
    assetClass: 'commodities',
    leverage: '1:1000',
    spreadRaw: 1.2,
    spreadStandard: 1.6,
    spreadVip: 2.0,
  },
  {
    instrument: 'US 30 (Dow Jones)',
    symbol: 'US30',
    assetClass: 'indices',
    leverage: '1:500',
    spreadRaw: 1.0,
    spreadStandard: 1.4,
    spreadVip: 1.8,
  },
  {
    instrument: 'Bitcoin / USD',
    symbol: 'BTCUSD',
    assetClass: 'crypto',
    leverage: '1:100',
    spreadRaw: 8.0,
    spreadStandard: 12.0,
    spreadVip: 15.0,
  },
];

interface FeesPageProps {
  /** Live instrument spread data from the CMS ProductsInstruments collection */
  spreadData?: CmsSpreadRow[];
}

export function FeesPage({ spreadData }: FeesPageProps) {
  const locale = useLocale();
  const t = useTranslations('fees');

  // One decimal for small values (forex/indices pips), integers for large values (crypto).
  const fmt = (v: number | null) => {
    if (v == null) return '·';
    if (Number.isInteger(v) && v >= 5) return String(v);
    return v.toFixed(1);
  };

  const getSymbolType = (row: CmsSpreadRow) => {
    if (row.assetClass) {
      const ac = row.assetClass.toLowerCase();
      if (ac === 'forex') return 'Forex';
      if (ac === 'commodities') return 'Commodities';
      if (ac === 'indices') return 'Indices';
      if (ac === 'crypto') return 'Crypto';
      if (ac === 'stocks') return 'Stocks';
      return row.assetClass;
    }
    const name = row.instrument.toLowerCase();
    if (
      name.includes('gold') ||
      name.includes('xau') ||
      name.includes('silver') ||
      name.includes('xag')
    )
      return 'Metals';
    if (
      name.includes('us 30') ||
      name.includes('us 500') ||
      name.includes('dow') ||
      name.includes('sp500')
    )
      return 'Indices';
    if (
      name.includes('bitcoin') ||
      name.includes('btc') ||
      name.includes('eth') ||
      name.includes('crypto')
    )
      return 'Crypto';
    return 'Forex';
  };

  const rowsToDisplay = spreadData && spreadData.length > 0 ? spreadData : DEFAULT_SPREAD_ROWS;

  const displaySpreads = rowsToDisplay.map((r) => {
    // Use dedicated fields when available; fall back to +0.8/+1.2 formula from legacy `spread`
    const base = r.spreadRaw ?? r.spread;
    const rawVal = r.spreadRaw ?? r.spread;
    const stdVal = r.spreadStandard ?? (base != null ? base + 0.8 : null);
    const vipVal = r.spreadVip ?? (base != null ? base + 1.2 : null);
    return {
      instrument: r.instrument,
      symbol: r.symbol || r.instrument.replace(/[^A-Z]/g, ''),
      type: getSymbolType(r),
      raw: fmt(rawVal ?? null),
      std: fmt(stdVal),
      vip: fmt(vipVal),
    };
  });

  // Ruled subtotal: the tightest RAW spread across the ledger — the receipt's "best line".
  const rawNums = rowsToDisplay
    .map((r) => r.spreadRaw ?? r.spread)
    .filter((v): v is number => v != null);
  const tightest = rawNums.length ? fmt(Math.min(...rawNums)) : null;

  const translateValue = (v: string) => {
    if (v === 'Free') return t('valueFree');
    if (v === 'Per-instrument') return t('valuePerInstrument');
    return v;
  };

  const safeTrans = (key: string, fallback: string) => {
    try {
      const val = t(key as any);
      return !val || val.includes('.') ? fallback : val;
    } catch {
      return fallback;
    }
  };

  return (
    <>
      {/* Hero — receipt masthead */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('receiptStamp')}</SectionKicker>
          <h1 className="text-display text-foreground mb-4 font-sans">
            {t('heroLine1')}
            <br />
            {t('heroLine2')}
          </h1>
          <p className="font-body text-muted text-body-lg leading-[1.55] sm:max-w-[350px] xl:max-w-[560px]">
            {t('heroSubtitle')}
          </p>
        </ScrollReveal>
      </section>

      {/* Spread ledger — account tiers as a terminal receipt */}
      <section className="bg-transparent px-5 pb-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('spreadsKicker')}</SectionKicker>

          <div className="overflow-x-auto rounded-[20px] border border-[#1b2b20] bg-[#080b09] shadow-2xl dark:border-[#1b2b20] dark:bg-[#080b09]">
            <div className="min-w-[640px]">
              {/* Receipt header strip */}
              <div className="flex items-center justify-between border-b border-dashed border-[#1b2b20] bg-[#0d1410] px-5 py-3.5">
                <span className="text-eyebrow font-mono uppercase text-gray-400">
                  {t('receiptStamp')}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-[#00b050]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#00b050]" />
                  <span className="text-eyebrow font-mono uppercase">{t('spreadsKicker')}</span>
                </span>
              </div>

              {/* Column header */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[#1b2b20] bg-[#0d1410] px-5 py-3">
                <span className="text-eyebrow font-mono font-semibold uppercase text-gray-400">
                  {safeTrans('colInstrument', 'INSTRUMENT')}
                </span>
                <span className="text-eyebrow text-center font-mono font-semibold uppercase text-gray-400">
                  {safeTrans('colSymbol', 'SYMBOL')}
                </span>
                <span className="text-eyebrow text-center font-mono font-semibold uppercase text-gray-400">
                  {safeTrans('colCategory', 'TYPE')}
                </span>
                <span className="text-eyebrow text-center font-mono font-bold uppercase text-[#00b050]">
                  {safeTrans('colRaw', 'RAW')}
                </span>
                <span className="text-eyebrow text-center font-mono font-semibold uppercase text-gray-400">
                  {safeTrans('colStd', 'STD')}
                </span>
                <span className="text-eyebrow text-center font-mono font-semibold uppercase text-gray-400">
                  {safeTrans('colVip', 'VIP')}
                </span>
              </div>

              {/* Data rows — hairline ruled, mono tabular-nums */}
              {displaySpreads.length === 0 ? (
                <p className="font-body text-body px-5 py-8 text-center text-gray-400">
                  {t('noSpreads')}
                </p>
              ) : (
                <div className="divide-y divide-[#1b2b20]">
                  {displaySpreads.map((row) => (
                    <div
                      key={row.instrument}
                      className="group grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-l-4 border-l-transparent px-5 py-[14px] transition-all duration-200 hover:border-l-[#00b050] hover:bg-[#00b050]/20"
                    >
                      <span className="font-body text-body font-semibold text-white transition-colors group-hover:text-[#00b050]">
                        {row.instrument}
                      </span>
                      <span className="text-center font-mono text-xs font-bold tracking-wider text-[#00b050]">
                        {row.symbol}
                      </span>
                      <span className="text-center font-mono text-xs font-medium uppercase text-gray-400">
                        {row.type}
                      </span>
                      <span
                        dir="ltr"
                        className="text-body text-center font-mono font-bold tabular-nums text-[#00b050]"
                      >
                        {row.raw}
                      </span>
                      <span
                        dir="ltr"
                        className="text-body text-center font-mono tabular-nums text-gray-300 transition-colors group-hover:text-white"
                      >
                        {row.std}
                      </span>
                      <span
                        dir="ltr"
                        className="text-body text-center font-mono tabular-nums text-gray-300 transition-colors group-hover:text-white"
                      >
                        {row.vip}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Ruled subtotal — tightest spread */}
              {tightest && (
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-t-2 border-[#00b050]/40 bg-[#0d1410] px-5 py-4">
                  <span className="text-eyebrow col-span-3 font-mono font-bold uppercase text-white">
                    {t('tightestSpread')}
                  </span>
                  <span
                    dir="ltr"
                    className="text-title text-center font-mono font-extrabold tabular-nums text-[#00b050]"
                  >
                    {tightest}
                  </span>
                  <span className="col-span-2" />
                </div>
              )}
            </div>
          </div>

          {/* Receipt footer action */}
          <Link
            href={`/${locale}/markets/forex`}
            className="font-body text-foreground hover:text-accent group mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors"
          >
            <span className="link-underline group-hover:[background-size:100%_1px]">
              {t('viewAll')}
            </span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100"
            >
              <path
                d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </ScrollReveal>
      </section>

      {/* Other charges — the receipt, line by line */}
      <section className="rounded-t-[32px] bg-transparent px-5 pb-12 pt-[29px]">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('otherKicker')}</SectionKicker>

          <div className="overflow-hidden rounded-[20px] border border-[#1b2b20] bg-[#080b09] shadow-2xl dark:border-[#1b2b20] dark:bg-[#080b09]">
            <div className="grid grid-cols-1 divide-y divide-[#1b2b20] md:grid-cols-2 md:divide-y-0">
              {/* Column 1 */}
              <div className="divide-y divide-[#1b2b20]">
                {OTHER_CHARGES.slice(0, 3).map((charge, i) => {
                  const key = charge.key.charAt(0).toUpperCase() + charge.key.slice(1);
                  const display = charge.green ? '$0.00' : translateValue(charge.value);
                  const isMetric = /[$%\d]/.test(display);
                  return (
                    <ScrollReveal key={charge.key} index={i} direction="up">
                      <div className="group border-l-4 border-l-transparent px-5 py-[16px] transition-all duration-200 hover:border-l-[#00b050] hover:bg-[#00b050]/20">
                        <div className="flex items-baseline gap-3">
                          <span className="text-body-lg font-sans font-semibold text-white transition-colors group-hover:text-[#00b050]">
                            {t(`charge${key}` as 'chargeOpening')}
                          </span>
                          <span
                            aria-hidden="true"
                            className="min-w-[24px] flex-1 translate-y-[-4px] border-b border-dotted border-[#1b2b20] transition-colors group-hover:border-[#00b050]/60"
                          />
                          <span
                            {...(isMetric ? { dir: 'ltr' as const } : {})}
                            className={`text-body-lg font-mono font-bold tabular-nums ${charge.green ? 'text-[#00b050]' : 'text-gray-200 group-hover:text-white'}`}
                          >
                            {display}
                          </span>
                        </div>
                        <p className="font-body text-caption mt-1 text-gray-400">
                          {t(`charge${key}Val` as 'chargeOpeningVal')}
                        </p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="divide-y divide-[#1b2b20] md:border-l md:border-[#1b2b20]">
                {OTHER_CHARGES.slice(3, 6).map((charge, i) => {
                  const key = charge.key.charAt(0).toUpperCase() + charge.key.slice(1);
                  const display = charge.green ? '$0.00' : translateValue(charge.value);
                  const isMetric = /[$%\d]/.test(display);
                  return (
                    <ScrollReveal key={charge.key} index={i + 3} direction="up">
                      <div className="group border-l-4 border-l-transparent px-5 py-[16px] transition-all duration-200 hover:border-l-[#00b050] hover:bg-[#00b050]/20">
                        <div className="flex items-baseline gap-3">
                          <span className="text-body-lg font-sans font-semibold text-white transition-colors group-hover:text-[#00b050]">
                            {t(`charge${key}` as 'chargeOpening')}
                          </span>
                          <span
                            aria-hidden="true"
                            className="min-w-[24px] flex-1 translate-y-[-4px] border-b border-dotted border-[#1b2b20] transition-colors group-hover:border-[#00b050]/60"
                          />
                          <span
                            {...(isMetric ? { dir: 'ltr' as const } : {})}
                            className={`text-body-lg font-mono font-bold tabular-nums ${charge.green ? 'text-[#00b050]' : 'text-gray-200 group-hover:text-white'}`}
                          >
                            {display}
                          </span>
                        </div>
                        <p className="font-body text-caption mt-1 text-gray-400">
                          {t(`charge${key}Val` as 'chargeOpeningVal')}
                        </p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Ruled subtotal — zero account fees */}
            <div className="flex items-baseline gap-3 border-t-2 border-[#00b050]/40 bg-[#0d1410] px-5 py-4">
              <span className="text-eyebrow font-mono font-bold uppercase text-white">
                {t('subtotalLabel')}
              </span>
              <span className="flex-1" />
              <span
                dir="ltr"
                className="text-title font-mono font-extrabold tabular-nums text-[#00b050]"
              >
                $0.00
              </span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Closing ink band — the grand total you never pay */}
      <section className="ink-band rounded-t-[32px] px-5 pb-16 pt-14 xl:px-[120px] xl:pb-20 xl:pt-20">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6">{t('transparentKicker')}</SectionKicker>

          <span
            dir="ltr"
            className="text-sheen text-metric block font-mono font-semibold tabular-nums leading-none"
          >
            <CountUp value="$0" />
          </span>
          <p className="text-body-lg mt-4 font-mono uppercase tracking-[0.12em] text-white/60">
            {t('dontPayCaption')}
          </p>

          <h2 className="text-headline mt-10 font-sans text-white">
            {t('transparentLine1')}
            <br />
            {t('transparentLine2')}
          </h2>
          <p className="font-body text-body mt-4 max-w-[300px] leading-[1.55] text-white/60 xl:max-w-[620px]">
            {t('transparentDesc')}
          </p>
        </ScrollReveal>
      </section>
    </>
  );
}
