'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const SPREADS = [
  { instrument: 'EUR/USD', raw: '0.0', std: '0.8', vip: '1.2' },
  { instrument: 'GBP/USD', raw: '0.1', std: '1.0', vip: '1.5' },
  { instrument: 'USD/JPY', raw: '0.0', std: '0.9', vip: '1.3' },
  { instrument: 'XAU/USD', raw: '1.2', std: '1.6', vip: '2.0' },
  { instrument: 'US30', raw: '1.0', std: '1.4', vip: '1.8' },
  { instrument: 'BTC/USD', raw: '8', std: '12', vip: '15' },
] as const;

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
}

interface FeesPageProps {
  /** Live instrument spread data from the CMS ProductsInstruments collection */
  spreadData?: CmsSpreadRow[];
}

export function FeesPage({ spreadData }: FeesPageProps) {
  const locale = useLocale();
  const t = useTranslations('fees');

  const displaySpreads =
    spreadData && spreadData.length > 0
      ? spreadData.map((r) => ({
          instrument: r.instrument,
          raw: r.spread != null ? String(r.spread) : '—',
          std: r.spread != null ? String((r.spread + 0.8).toFixed(1)) : '—',
          vip: r.spread != null ? String((r.spread + 1.2).toFixed(1)) : '—',
        }))
      : SPREADS;

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted text-[14px] leading-[1.55] sm:max-w-[350px]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Spreads table */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                  className="text-muted text-right font-mono text-[9px] tracking-[1.08px]"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {displaySpreads.map((row) => (
              <div
                key={row.instrument}
                className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-[14px]"
              >
                <span className="font-body text-[13px] font-medium text-white">
                  {row.instrument}
                </span>
                <span className="text-accent text-right font-mono text-[13px] font-medium">
                  {row.raw}
                </span>
                <span className="text-right font-mono text-[13px] text-white">{row.std}</span>
                <span className="text-right font-mono text-[13px] text-white">{row.vip}</span>
              </div>
            ))}
          </div>

          {/* View all link */}
          <Link
            href={`/${locale}/markets/instruments`}
            className="bg-surface dark:hover:bg-surface-elevated mt-3 flex items-center justify-center gap-2 rounded-[14px] px-4 py-[14px] transition-colors hover:bg-[#f0f0ee]"
          >
            <span className="font-body text-foreground text-[13px] font-medium">
              {t('viewAll')}
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('otherKicker')}
          </SectionKicker>
          <div className="flex flex-col gap-[10px]">
            {OTHER_CHARGES.map((charge) => (
              <div
                key={charge.label}
                className="bg-surface dark:bg-surface flex h-[68px] items-center justify-between rounded-[14px] px-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground mb-[3px] font-sans text-[14px] font-semibold">
                    {t(
                      `charge${charge.key.charAt(0).toUpperCase() + charge.key.slice(1)}` as 'chargeOpening',
                    )}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-snug">
                    {t(
                      `charge${charge.key.charAt(0).toUpperCase() + charge.key.slice(1)}Val` as 'chargeOpeningVal',
                    )}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 font-sans text-[16px] font-semibold ${charge.green ? 'text-accent' : 'text-foreground'}`}
                >
                  {charge.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing dark band */}
      <section className="rounded-t-[32px] bg-black px-5 pb-16 pt-14 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/60 [&>span:last-child]:text-white/60">
            {t('transparentKicker')}
          </SectionKicker>
          <h2 className="mb-4 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white">
            {t('transparentLine1')}
            <br />
            {t('transparentLine2')}
          </h2>
          <p className="font-body max-w-[300px] text-[13.5px] leading-[1.55] text-white/60">
            {t('transparentDesc')}
          </p>
        </div>
      </section>
    </>
  );
}
