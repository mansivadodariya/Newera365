'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
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

  const displaySpreads = (spreadData ?? []).map((r) => {
    // Use dedicated fields when available; fall back to +0.8/+1.2 formula from legacy `spread`
    const base = r.spreadRaw ?? r.spread;
    const rawVal = r.spreadRaw ?? r.spread;
    const stdVal = r.spreadStandard ?? (base != null ? base + 0.8 : null);
    const vipVal = r.spreadVip ?? (base != null ? base + 1.2 : null);
    // Show one decimal for small values (forex/indices pips), integers for large values (crypto)
    const fmt = (v: number | null) => {
      if (v == null) return '—';
      if (Number.isInteger(v) && v >= 5) return String(v);
      return v.toFixed(1);
    };
    return {
      instrument: r.instrument,
      raw: fmt(rawVal ?? null),
      std: fmt(stdVal),
      vip: fmt(vipVal),
    };
  });

  const translateValue = (v: string) => {
    if (v === 'Free') return t('valueFree');
    if (v === 'Per-instrument') return t('valuePerInstrument');
    return v;
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="mb-4 font-sans text-[40px] font-semibold leading-[1.1] tracking-[-1.2px] xl:text-[56px] xl:tracking-[-1.68px]">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted text-[14px] leading-[1.55] sm:max-w-[350px] xl:max-w-[560px] xl:text-[16px]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Spreads table */}
      <section className="bg-transparent px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('spreadsKicker')}
          </SectionKicker>

          <div className="overflow-hidden rounded-[18px] bg-black">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-3">
              <span className="text-muted font-mono text-[9px] tracking-[1.08px]">
                {t('colInstrument')}
              </span>
              {[t('colRaw'), t('colStd'), t('colVip')].map((h) => (
                <span
                  key={h}
                  className="text-muted text-end font-mono text-[9px] tracking-[1.08px]"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {displaySpreads.length === 0 && (
              <p className="font-body px-4 py-8 text-center text-[13px] text-white/50">
                {t('noSpreads')}
              </p>
            )}
            {displaySpreads.map((row) => (
              <div
                key={row.instrument}
                className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-[14px]"
              >
                <span className="font-body text-[13px] font-medium text-white">
                  {row.instrument}
                </span>
                <span className="text-accent text-end font-mono text-[13px] font-medium">
                  {row.raw}
                </span>
                <span className="text-end font-mono text-[13px] text-white">{row.std}</span>
                <span className="text-end font-mono text-[13px] text-white">{row.vip}</span>
              </div>
            ))}
          </div>

          {/* View all link */}
          <Link
            href={`/${locale}/markets/forex`}
            className="bg-surface dark:hover:bg-surface-elevated mt-3 flex items-center justify-center gap-2 rounded-[14px] px-4 py-[14px] transition-colors hover:bg-[#f0f0ee]"
          >
            <span className="font-body text-foreground text-[13px] font-medium">
              {t('viewAll')}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="rtl:-scale-x-100"
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
        </div>
      </section>

      {/* Other Charges */}
      <section className="rounded-t-[32px] bg-[#FFFFFF] px-5 pb-10 pt-[29px] dark:bg-black">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted mb-5 text-[#6B7280] dark:text-[#B8BFCC]">
            {t('otherKicker')}
          </SectionKicker>
          <div className="flex flex-col gap-[10px]">
            {OTHER_CHARGES.map((charge) => (
              <div
                key={charge.label}
                className="bg-surface dark:bg-surface hover-lift flex h-[68px] items-center justify-between rounded-[14px] px-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground mb-[3px] font-sans text-[14px] font-semibold">
                    {t(
                      `charge${charge.key.charAt(0).toUpperCase() + charge.key.slice(1)}` as 'chargeOpening',
                    )}
                  </p>
                  <p className="font-body text-[12px] leading-snug text-[#6B7280] dark:text-[#B8BFCC]">
                    {t(
                      `charge${charge.key.charAt(0).toUpperCase() + charge.key.slice(1)}Val` as 'chargeOpeningVal',
                    )}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 font-sans text-[16px] font-semibold ${charge.green ? 'text-accent' : 'text-foreground'}`}
                >
                  {translateValue(charge.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing dark band */}
      <section className="rounded-t-[32px] bg-black px-5 pb-16 pt-14 xl:px-[120px] xl:pb-20 xl:pt-20">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/60 [&>span:last-child]:text-white/60">
            {t('transparentKicker')}
          </SectionKicker>
          <h2 className="mb-4 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white xl:text-[40px] xl:tracking-[-0.8px]">
            {t('transparentLine1')}
            <br />
            {t('transparentLine2')}
          </h2>
          <p className="font-body max-w-[300px] text-[13.5px] leading-[1.55] text-white/60 xl:max-w-[620px] xl:text-[16px]">
            {t('transparentDesc')}
          </p>
        </div>
      </section>
    </>
  );
}
