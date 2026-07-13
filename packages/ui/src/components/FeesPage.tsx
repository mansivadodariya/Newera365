'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CountUp } from './CountUp';
import { ScrollReveal } from './ScrollReveal';
import { SectionKicker } from './SectionKicker';

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
  spread?: number | null;
  /** Dedicated RAW spread (preferred over computed value) */
  spreadRaw?: number | null;
  /** Dedicated Standard spread (preferred over computed value) */
  spreadStandard?: number | null;
  /** Dedicated VIP spread (preferred over computed value) */
  spreadVip?: number | null;
}

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

  const displaySpreads = (spreadData ?? []).map((r) => {
    // Use dedicated fields when available; fall back to +0.8/+1.2 formula from legacy `spread`
    const base = r.spreadRaw ?? r.spread;
    const rawVal = r.spreadRaw ?? r.spread;
    const stdVal = r.spreadStandard ?? (base != null ? base + 0.8 : null);
    const vipVal = r.spreadVip ?? (base != null ? base + 1.2 : null);
    return {
      instrument: r.instrument,
      raw: fmt(rawVal ?? null),
      std: fmt(stdVal),
      vip: fmt(vipVal),
    };
  });

  // Ruled subtotal: the tightest RAW spread across the ledger — the receipt's "best line".
  const rawNums = (spreadData ?? [])
    .map((r) => r.spreadRaw ?? r.spread)
    .filter((v): v is number => v != null);
  const tightest = rawNums.length ? fmt(Math.min(...rawNums)) : null;

  const translateValue = (v: string) => {
    if (v === 'Free') return t('valueFree');
    if (v === 'Per-instrument') return t('valuePerInstrument');
    return v;
  };

  return (
    <>
      {/* Hero — receipt masthead */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="bg-accent h-1.5 w-1.5 flex-shrink-0 rounded-[2px]" />
            <span className="text-eyebrow text-muted font-mono uppercase">{t('receiptStamp')}</span>
          </div>
          <h1 className="text-display mb-4 font-sans">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted text-body-lg leading-[1.55] sm:max-w-[350px] xl:max-w-[560px]">
            {t('heroSubtitle')}
          </p>
        </ScrollReveal>
      </section>

      {/* Spread ledger — account tiers as a terminal receipt */}
      <section className="bg-transparent px-5 pb-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('spreadsKicker')}
          </SectionKicker>

          <div className="border-border bg-surface shadow-card overflow-hidden rounded-[18px] border dark:border-white/[0.06]">
            {/* Receipt header strip */}
            <div className="border-border flex items-center justify-between border-b border-dashed px-5 py-3.5 dark:border-white/[0.1]">
              <span className="text-eyebrow text-muted font-mono uppercase">
                {t('receiptStamp')}
              </span>
              <span className="text-accent flex items-center gap-1.5">
                <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                <span className="text-eyebrow font-mono uppercase">{t('spreadsKicker')}</span>
              </span>
            </div>

            {/* Column header */}
            <div className="border-border grid grid-cols-[1fr_54px_54px_54px] border-b px-5 py-2.5 dark:border-white/[0.06]">
              <span className="text-muted text-eyebrow font-mono uppercase">
                {t('colInstrument')}
              </span>
              <span className="text-accent text-eyebrow text-end font-mono uppercase">
                {t('colRaw')}
              </span>
              <span className="text-muted text-eyebrow text-end font-mono uppercase">
                {t('colStd')}
              </span>
              <span className="text-muted text-eyebrow text-end font-mono uppercase">
                {t('colVip')}
              </span>
            </div>

            {/* Data rows — hairline ruled, mono tabular-nums */}
            {displaySpreads.length === 0 ? (
              <p className="font-body text-muted text-body px-5 py-8 text-center">
                {t('noSpreads')}
              </p>
            ) : (
              <div className="list-dim divide-border divide-y dark:divide-white/[0.05]">
                {displaySpreads.map((row) => (
                  <div
                    key={row.instrument}
                    className="group grid grid-cols-[1fr_54px_54px_54px] items-center px-5 py-[13px] transition-colors hover:bg-[#F0F4F1] dark:hover:bg-white/[0.02]"
                  >
                    <span className="text-foreground font-body text-body group-hover:text-accent font-medium transition-colors">
                      {row.instrument}
                    </span>
                    <span
                      dir="ltr"
                      className="text-accent text-body text-end font-mono font-semibold tabular-nums"
                    >
                      {row.raw}
                    </span>
                    <span
                      dir="ltr"
                      className="text-muted text-body text-end font-mono tabular-nums"
                    >
                      {row.std}
                    </span>
                    <span
                      dir="ltr"
                      className="text-muted text-body text-end font-mono tabular-nums"
                    >
                      {row.vip}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Ruled subtotal — tightest spread */}
            {tightest && (
              <div className="border-foreground/70 grid grid-cols-[1fr_54px_54px_54px] items-center border-t-2 px-5 py-3.5 dark:border-white/30">
                <span className="text-foreground text-eyebrow font-mono uppercase">
                  {t('tightestSpread')}
                </span>
                <span dir="ltr" className="text-accent text-title text-end font-mono tabular-nums">
                  {tightest}
                </span>
                <span className="col-span-2" />
              </div>
            )}
          </div>

          {/* Receipt footer action */}
          <Link
            href={`/${locale}/markets/forex`}
            className="text-accent group mt-4 inline-flex items-center gap-2"
          >
            <span className="text-eyebrow font-mono uppercase">{t('viewAll')}</span>
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
      <section className="rounded-t-[32px] bg-transparent px-5 pb-12 pt-[29px] dark:bg-[#0a0c0b]">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('otherKicker')}
          </SectionKicker>

          <div className="border-border bg-surface shadow-card list-dim overflow-hidden rounded-[18px] border dark:border-white/[0.06]">
            {OTHER_CHARGES.map((charge, i) => {
              const key = charge.key.charAt(0).toUpperCase() + charge.key.slice(1);
              const display = charge.green ? '$0.00' : translateValue(charge.value);
              const isMetric = /[$%\d]/.test(display);
              return (
                <ScrollReveal
                  key={charge.key}
                  index={i}
                  direction="up"
                  className={i > 0 ? 'border-border border-t dark:border-white/[0.05]' : ''}
                >
                  <div className="group px-5 py-[15px] transition-colors hover:bg-[#F0F4F1] dark:hover:bg-white/[0.02]">
                    <div className="flex items-baseline gap-3">
                      <span className="text-foreground text-body-lg font-sans font-semibold">
                        {t(`charge${key}` as 'chargeOpening')}
                      </span>
                      {/* Dotted receipt leader warms to signal on the lit line */}
                      <span
                        aria-hidden="true"
                        className="border-border group-hover:border-accent/50 min-w-[24px] flex-1 translate-y-[-4px] border-b border-dotted transition-colors dark:border-white/[0.15]"
                      />
                      <span
                        {...(isMetric ? { dir: 'ltr' as const } : {})}
                        className={`text-body-lg font-mono font-semibold tabular-nums ${charge.green ? 'text-accent' : 'text-foreground'}`}
                      >
                        {display}
                      </span>
                    </div>
                    <p className="font-body text-caption text-muted mt-1">
                      {t(`charge${key}Val` as 'chargeOpeningVal')}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}

            {/* Ruled subtotal — zero account fees */}
            <div className="border-foreground/70 flex items-baseline gap-3 border-t-2 px-5 py-4 dark:border-white/30">
              <span className="text-foreground text-eyebrow font-mono uppercase">
                {t('subtotalLabel')}
              </span>
              <span className="flex-1" />
              <span dir="ltr" className="text-accent text-title font-mono tabular-nums">
                $0.00
              </span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Closing ink band — the grand total you never pay */}
      <section className="ink-band rounded-t-[32px] px-5 pb-16 pt-14 xl:px-[120px] xl:pb-20 xl:pt-20">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-white/60 [&>span:last-child]:text-white/60">
            {t('transparentKicker')}
          </SectionKicker>

          <span
            dir="ltr"
            className="text-sheen text-metric block font-mono font-semibold tabular-nums leading-none"
          >
            <CountUp value="$0" />
          </span>
          <p className="text-body-lg mt-4 font-mono uppercase tracking-[0.12em] text-white/60">
            {t('dontPayCaption')}
          </p>

          <h2 className="text-headline-sm mt-10 font-sans text-white">
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
