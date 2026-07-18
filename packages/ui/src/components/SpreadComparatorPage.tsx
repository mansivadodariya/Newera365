'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
import { CountUp } from './CountUp';

// ---------------------------------------------------------------------------
// CMS instrument shape (subset)
// ---------------------------------------------------------------------------
export interface CmsSpreadInstrument {
  symbol: string; // e.g. "EURUSD"
  name: string; // e.g. "EUR/USD" — used as label
  spreadIndustry?: number | null;
  spreadStandard?: number | null;
  spreadRaw?: number | null;
  spreadVip?: number | null;
  pipValue?: number | null;
}

// ---------------------------------------------------------------------------
// Fallback static data — used when CMS collection is empty / not seeded yet
// ---------------------------------------------------------------------------

const COMMISSIONS = { standard: 0, raw: 3.5, vip: 1.5 };
const LOTS_PER_MONTH = 10;
const MIN_DEPOSIT = { standard: '$100', raw: '$500', vip: '$10k' };

interface SpreadComparatorPageProps {
  /** Live instrument spread data from the CMS ProductsInstruments collection */
  instruments?: CmsSpreadInstrument[];
}

/**
 * Reveal flag for the spread bars. The bar FILLS are decoration — the numeric
 * spread values are always rendered — so gating fill width behind an in-view
 * flag never hides content. Under reduced motion the bars snap to full width
 * with no transition (animate=false).
 */
function useDuelReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, filled: reduce || inView, animate: !reduce };
}

function ArrowGlyph({ width = 15 }: { width?: number }) {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="rtl:-scale-x-100"
    >
      <path
        d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpreadComparatorPage({ instruments: cmsInstruments }: SpreadComparatorPageProps) {
  const t = useTranslations('spreadComparator');
  const locale = useLocale();

  const instruments = cmsInstruments ?? [];

  const [instrumentSymbol, setInstrumentSymbol] = useState(instruments[0]?.symbol ?? '');

  const selectedInstrument =
    instruments.find((i) => i.symbol === instrumentSymbol) ?? instruments[0];

  // Normalise CMS data into the shape the template expects. selectedInstrument
  // is undefined only when there are no instruments; the defaults below keep the
  // hooks unconditional (Rules of Hooks) and the empty state returns afterwards.
  const data = useMemo(() => {
    const symbol = selectedInstrument?.symbol ?? '';
    return {
      industry: selectedInstrument?.spreadIndustry ?? 1.9,
      standard: selectedInstrument?.spreadStandard ?? 1.0,
      raw: selectedInstrument?.spreadRaw ?? 0.0,
      vip: selectedInstrument?.spreadVip ?? 0.0,
      pipValue: selectedInstrument?.pipValue ?? 10,
      // Unit label: forex uses 'pip', metals use 'USD', crypto uses 'pt'
      unit:
        symbol.includes('USD') && symbol.startsWith('X')
          ? 'USD'
          : symbol.includes('BTC') || symbol.includes('ETH')
            ? 'pt'
            : 'pip',
    };
  }, [selectedInstrument]);

  const costPerLot = useMemo(
    () => ({
      industry: data.industry * data.pipValue,
      standard: data.standard * data.pipValue + COMMISSIONS.standard,
      raw: data.raw * data.pipValue + COMMISSIONS.raw,
      vip: data.vip * data.pipValue + COMMISSIONS.vip,
    }),
    [data],
  );

  const annualSaving = useMemo(() => {
    const industryCost = costPerLot.industry * LOTS_PER_MONTH * 12;
    const rawCost = costPerLot.raw * LOTS_PER_MONTH * 12;
    return Math.max(0, industryCost - rawCost);
  }, [costPerLot]);

  const duel = useDuelReveal();

  // Empty state — returns after all hooks so hook order is stable across renders.
  if (instruments.length === 0) {
    return (
      <section className="px-5 py-20">
        <p className="font-body text-muted text-body text-center">{t('noInstruments')}</p>
      </section>
    );
  }

  const maxSpread = Math.max(data.industry, data.standard, data.raw, data.vip, 0.1);
  const fmtSpread = (n: number) =>
    n === 0
      ? '0.0'
      : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = (n: number) => Math.max(6, (n / maxSpread) * 100);

  // The duel line-up: our three tiers (green) versus the average broker (grey).
  // Ordered narrowest → widest so the bars visibly lengthen down to "the rest".
  const contenders = [
    {
      key: 'raw',
      label: t('rawLabel'),
      spread: data.raw,
      camp: 'us' as const,
      champion: true,
      fill: 'bg-accent shadow-[0_0_20px_-2px_rgba(0,176,80,0.55)]',
      value: 'text-accent',
    },
    {
      key: 'vip',
      label: t('vipLabel'),
      spread: data.vip,
      camp: 'us' as const,
      champion: false,
      fill: 'bg-accent/60',
      value: 'text-foreground',
    },
    {
      key: 'standard',
      label: t('stdLabel'),
      spread: data.standard,
      camp: 'us' as const,
      champion: false,
      fill: 'bg-accent/35',
      value: 'text-foreground',
    },
    {
      key: 'industry',
      label: t('industryAvg'),
      spread: data.industry,
      camp: 'them' as const,
      champion: false,
      fill: 'bg-muted/35 dark:bg-white/20',
      value: 'text-muted',
    },
  ];

  const scorecard = [
    {
      label: t('colSpread'),
      std: `${fmtSpread(data.standard)} ${data.unit}`,
      raw: `${fmtSpread(data.raw)} ${data.unit}`,
      vip: `${fmtSpread(data.vip)} ${data.unit}`,
    },
    {
      label: t('colCommission'),
      std: t('commNone'),
      raw: `$${COMMISSIONS.raw.toFixed(2)}`,
      vip: `$${COMMISSIONS.vip.toFixed(2)}`,
    },
    {
      label: t('colMinDeposit'),
      std: MIN_DEPOSIT.standard,
      raw: MIN_DEPOSIT.raw,
      vip: MIN_DEPOSIT.vip,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground text-display mb-3 font-sans [text-wrap:balance]">
            {t('heroLine1')}
            <br />
            {t('heroLine2')} <span>{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted text-lead max-w-[440px]">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* The duel — animated spread bars, us vs the rest */}
      <section className="px-5 pb-6">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="border-border shadow-card overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.07] dark:bg-[#111316] dark:shadow-none">
            {/* Header */}
            <div className="border-border border-b px-5 py-6 md:px-8 md:py-7 dark:border-white/[0.07]">
              <SectionKicker className="mb-3">
                {t('duelKicker')}
              </SectionKicker>
              <h2 className="text-foreground text-headline font-sans">{t('duelTitle')}</h2>
              <p className="font-body text-muted text-body mt-2 max-w-[560px]">
                {t('duelSubtitle')}
              </p>

              {/* Matchup selector — pick the contract */}
              <div className="scrollbar-hide mt-5 flex flex-wrap gap-2">
                {instruments.map((ins) => {
                  const active = instrumentSymbol === ins.symbol;
                  return (
                    <button
                      key={ins.symbol}
                      onClick={() => setInstrumentSymbol(ins.symbol)}
                      className={`text-caption rounded-pill flex-shrink-0 px-3.5 py-[7px] font-mono font-medium tabular-nums transition-colors active:scale-[0.98] ${
                        active
                          ? 'bg-accent border-accent border text-white'
                          : 'border-border hover:border-accent/50 hover:text-foreground text-muted border bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55 dark:hover:text-white'
                      }`}
                    >
                      {ins.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arena — the bars */}
            <div ref={duel.ref} className="px-5 py-7 md:px-8 md:py-8">
              <div className="flex flex-col gap-6">
                {contenders.map((c, i) => (
                  <div key={c.key}>
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 flex-shrink-0 rounded-[3px] ${
                            c.camp === 'us' ? 'bg-accent' : 'bg-muted/45 dark:bg-white/25'
                          }`}
                        />
                        <span className="text-body text-foreground font-sans font-semibold">
                          {c.label}
                        </span>
                        {c.champion && (
                          <span className="text-accent bg-accent-subtle text-eyebrow rounded-pill px-2 py-0.5 font-mono uppercase">
                            {t('tightest')}
                          </span>
                        )}
                      </div>
                      <span
                        dir="ltr"
                        className={`text-body-lg flex-shrink-0 font-mono font-semibold tabular-nums ${c.value}`}
                      >
                        {fmtSpread(c.spread)} {data.unit}
                      </span>
                    </div>
                    <div className="bg-accent/[0.06] rounded-pill relative h-3 w-full overflow-hidden dark:bg-white/[0.06]">
                      <div
                        className={`rounded-pill absolute inset-y-0 start-0 ${c.fill}`}
                        style={{
                          width: duel.filled ? `${pct(c.spread)}%` : '0%',
                          transition: duel.animate
                            ? 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)'
                            : 'none',
                          transitionDelay: duel.animate ? `${i * 90}ms` : '0ms',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal footnote — how the numbers are measured */}
              <p className="border-border text-muted text-caption mt-7 border-t pt-4 font-mono dark:border-white/[0.07]">
                {t('calcFormula')}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* The scorecard — full ledger across all three tiers */}
      <section className="px-5 pb-6">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="border-border shadow-card overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.07] dark:bg-[#111316] dark:shadow-none">
            <div className="border-border border-b px-5 py-5 md:px-8 dark:border-white/[0.07]">
              <SectionKicker className="mb-3">
                {t('compKicker')}
              </SectionKicker>
              <p className="text-foreground text-title font-sans">
                {selectedInstrument?.name ?? ''}
              </p>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[minmax(84px,1.15fr)_repeat(3,minmax(0,1fr))] items-end gap-2 px-5 pt-5 md:px-8">
              <span />
              <span className="text-eyebrow text-muted text-center font-mono uppercase">
                {t('stdLabel')}
              </span>
              <span className="text-accent text-eyebrow text-center font-mono uppercase">
                {t('rawLabel')}
              </span>
              <span className="text-eyebrow text-muted text-center font-mono uppercase">
                {t('vipLabel')}
              </span>
            </div>

            {/* Rows */}
            <div className="px-5 pb-6 pt-3 md:px-8">
              {scorecard.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[minmax(84px,1.15fr)_repeat(3,minmax(0,1fr))] items-center gap-2 py-3.5 ${
                    i > 0 ? 'border-border border-t dark:border-white/[0.07]' : ''
                  }`}
                >
                  <span className="font-body text-caption text-muted">{row.label}</span>
                  <span
                    dir="ltr"
                    className="text-body text-foreground text-center font-mono tabular-nums"
                  >
                    {row.std}
                  </span>
                  <span
                    dir="ltr"
                    className="text-accent text-body text-center font-mono font-semibold tabular-nums"
                  >
                    {row.raw}
                  </span>
                  <span
                    dir="ltr"
                    className="text-body text-foreground text-center font-mono tabular-nums"
                  >
                    {row.vip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* The payoff — oversized annual saving on ink */}
      <section className="ink-band relative overflow-hidden rounded-t-[32px] px-5 pb-14 pt-12 md:pb-16 md:pt-14">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">
            {t('savingKicker')}
          </SectionKicker>
          <p className="text-headline-sm font-sans text-white/85">{t('savingPre')}</p>
          <span
            dir="ltr"
            className="text-sheen text-metric mt-1 block w-fit font-sans tabular-nums"
          >
            <CountUp
              flat
              value={`$${annualSaving.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            />
          </span>
          <p className="text-headline-sm mt-1 font-sans text-white/85">{t('savingPost')}</p>
          <p className="font-body text-body mt-5 max-w-[440px] text-white/55">
            {t('savingDesc', { lots: LOTS_PER_MONTH })}
          </p>
          <Link
            href={`/${locale}/trade/accounts`}
            className="font-body from-accent to-accent-bright rounded-pill mt-8 inline-flex items-center gap-2 bg-gradient-to-r px-7 py-4 text-[15px] font-semibold text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] active:scale-[0.98]"
          >
            {t('savingCta')}
            <ArrowGlyph />
          </Link>
        </ScrollReveal>
      </section>
    </>
  );
}
