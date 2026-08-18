'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { Spotlight } from '../primitives/Spotlight';
import { ChartWidget } from '../market/ChartWidget';
import { MARKET_OVERVIEW_CONFIG } from '../../lib/marketOverviewConfig';
import { MarketSessionStrip } from '../market/MarketSessionStrip';

/** CMS products-instruments row (subset the sheet needs). */
export interface WatchlistInstrument {
  id: number;
  symbol: string;
  name: string;
  assetClass: string;
  spread?: number | null;
  leverage?: string | null;
  minTradeSize?: number | null;
  tradingHours?: string | null;
}

interface LiveWatchlistPageProps {
  instruments?: WatchlistInstrument[];
}

const CLASS_ORDER = ['forex', 'indices', 'commodities', 'stocks', 'etfs', 'crypto'] as const;

const CLASS_I18N: Record<string, string> = {
  forex: 'catForex',
  indices: 'catIndices',
  commodities: 'catCommodities',
  stocks: 'catStocks',
  etfs: 'catEtfs',
  crypto: 'catCrypto',
};

export function LiveWatchlistPage({ instruments }: LiveWatchlistPageProps) {
  const t = useTranslations('watchlist');
  const all = useMemo(() => instruments ?? [], [instruments]);

  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Tabs derive from the data actually seeded in the CMS, in the house order.
  const classes = useMemo(
    () => CLASS_ORDER.filter((c) => all.some((i) => i.assetClass === c)),
    [all],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (i) =>
        (!activeClass || i.assetClass === activeClass) &&
        (!q || i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)),
    );
  }, [all, activeClass, query]);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('kicker')}</SectionKicker>
          <h1 className="text-foreground text-display mb-3 font-sans">
            {t('heroLine1')}
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted text-body max-w-[320px]">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Global sessions + the UTC clock they run on, live client-side */}
      <section className="px-5 pb-4">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <MarketSessionStrip showClock />
        </div>
      </section>

      {/* TradingView market-overview widget in terminal chrome */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Spotlight className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)] xl:rounded-[28px]">
            <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3 md:px-5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="bg-accent-bright absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping" />
                <span className="bg-accent-bright relative inline-flex h-2 w-2 rounded-full" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/[0.65]">
                {t('kicker')}
              </span>
            </div>
            <div className="h-[500px] md:h-[600px] xl:h-[660px]">
              <ChartWidget
                type="market-overview"
                theme="dark"
                width="100%"
                height="100%"
                config={MARKET_OVERVIEW_CONFIG}
              />
            </div>
          </Spotlight>
          <p className="font-body text-caption text-muted mt-3">{t('disclaimer')}</p>
        </div>
      </section>

      {/* The desk sheet — CMS contract terms behind the live prices above.
          Hidden entirely when the collection is empty (no static fallback). */}
      {all.length > 0 && (
        <section className="px-5 pb-12">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <ScrollReveal>
              <SectionKicker className="mb-4">{t('sheetKicker')}</SectionKicker>
              <h2 className="text-foreground text-headline mb-6 max-w-[560px] font-sans">
                {t('sheetHeading')}
              </h2>
            </ScrollReveal>

            {/* Filters: class tabs + symbol search */}
            <ScrollReveal delay={0.08}>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div
                  className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {[null, ...classes].map((cls) => {
                    const isActive = activeClass === cls;
                    return (
                      <button
                        key={cls ?? 'all'}
                        onClick={() => setActiveClass(cls)}
                        aria-pressed={isActive}
                        className={`tap-scale flex-shrink-0 rounded-full border px-4 py-[7px] font-mono text-[12px] uppercase tracking-[0.06em] transition-colors ${
                          isActive
                            ? 'bg-accent border-accent text-white'
                            : 'border-border text-muted hover:border-accent/50 hover:text-foreground bg-white dark:border-white/[0.1] dark:bg-transparent'
                        }`}
                      >
                        {cls ? t(CLASS_I18N[cls] as 'catForex') : t('filterAll')}
                      </button>
                    );
                  })}
                </div>
                <label className="border-border flex items-center gap-2 rounded-full border bg-white px-4 py-[7px] transition-colors md:w-[240px] dark:border-white/[0.1] dark:bg-transparent">
                  <svg
                    className="text-muted flex-shrink-0"
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M11 11l3 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('sheetSearch')}
                    aria-label={t('sheetSearch')}
                    className="text-foreground placeholder:text-muted w-full bg-transparent font-mono text-[12px] outline-none"
                  />
                </label>
              </div>
            </ScrollReveal>

            {/* Terminal ledger — same chrome as the live panel above */}
            <ScrollReveal delay={0.12}>
              <Spotlight
                size={460}
                className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 md:px-5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/[0.65]">
                    {t('sheetKicker')}
                  </span>
                  <span dir="ltr" className="text-accent-bright font-mono text-[11px] tabular-nums">
                    {t('sheetCount', { count: rows.length })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        {[
                          t('colSymbol'),
                          t('colInstrument'),
                          t('colSpread'),
                          t('colLeverage'),
                          t('colMinLot'),
                          t('colHours'),
                        ].map((col, ci) => (
                          <th
                            key={col}
                            className={`px-4 py-3 text-start font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-white/40 md:px-5 ${
                              ci >= 4 ? 'hidden lg:table-cell' : ''
                            }`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-accent/[0.06] border-b border-white/[0.05] transition-colors last:border-b-0"
                        >
                          <td
                            dir="ltr"
                            className="text-accent-bright px-4 py-[13px] text-start font-mono text-[13px] font-semibold tabular-nums md:px-5"
                          >
                            {row.symbol}
                          </td>
                          <td className="font-body px-4 py-[13px] text-[13px] text-white/[0.72] md:px-5">
                            {row.name}
                          </td>
                          <td
                            dir="ltr"
                            className="px-4 py-[13px] text-start font-mono text-[13px] tabular-nums text-white md:px-5"
                          >
                            {row.spread != null ? row.spread : '-'}
                          </td>
                          <td
                            dir="ltr"
                            className="px-4 py-[13px] text-start font-mono text-[13px] tabular-nums text-white md:px-5"
                          >
                            {row.leverage ?? '-'}
                          </td>
                          <td
                            dir="ltr"
                            className="hidden px-4 py-[13px] text-start font-mono text-[13px] tabular-nums text-white/[0.72] md:px-5 lg:table-cell"
                          >
                            {row.minTradeSize != null ? row.minTradeSize : '-'}
                          </td>
                          <td
                            dir="ltr"
                            className="hidden px-4 py-[13px] text-start font-mono text-[13px] tabular-nums text-white/[0.72] md:px-5 lg:table-cell"
                          >
                            {row.tradingHours ?? '-'}
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="font-body px-5 py-10 text-center text-[13px] text-white/50"
                          >
                            {t('sheetEmpty')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Spotlight>
            </ScrollReveal>
          </div>
        </section>
      )}
    </>
  );
}
