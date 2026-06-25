'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

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

interface SpreadComparatorPageProps {
  /** Live instrument spread data from the CMS ProductsInstruments collection */
  instruments?: CmsSpreadInstrument[];
}

export function SpreadComparatorPage({ instruments: cmsInstruments }: SpreadComparatorPageProps) {
  const t = useTranslations('spreadComparator');

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

  // Empty state — returns after all hooks so hook order is stable across renders.
  if (instruments.length === 0) {
    return (
      <section className="px-5 py-20">
        <p className="font-body text-muted text-center text-[14px]">{t('noInstruments')}</p>
      </section>
    );
  }

  const maxSpread = data.industry;

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.05] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            {t('heroLine2')} <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Instrument selector */}
      <section className="px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-3">
            {t('kicker')}
          </SectionKicker>
          <div className="scrollbar-hide flex flex-wrap gap-2">
            {instruments.map((ins) => (
              <button
                key={ins.symbol}
                onClick={() => setInstrumentSymbol(ins.symbol)}
                className={`font-body flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors ${
                  instrumentSymbol === ins.symbol
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#f2f2f4] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e] dark:hover:text-white/80'
                }`}
              >
                {ins.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Spread bars — SPREAD · PIP */}
      <section className="px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-3">
            SPREAD · PIP
          </SectionKicker>
          <div className="dark:bg-surface rounded-[20px] bg-[#fafaf9] p-[18px]">
            <div className="flex flex-col gap-[6px]">
              {/* RAW */}
              <div className="flex items-center gap-[10px]">
                <span className="w-[40px] flex-shrink-0 font-mono text-[10px] tracking-[1px] text-[#6b7280]">
                  RAW
                </span>
                <div className="relative flex h-[8px] flex-1 overflow-hidden rounded-full bg-[#f4f4f3] dark:bg-white/10">
                  <div
                    className="absolute start-0 top-0 h-full rounded-full bg-[#00b050] transition-all duration-500"
                    style={{
                      width: `${data.raw === 0 ? 4 : Math.max(4, (data.raw / maxSpread) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-[30px] flex-shrink-0 text-end font-mono text-[11px] font-medium text-[#111] dark:text-white">
                  {data.raw === 0 ? '0.0' : data.raw.toLocaleString('en-US')}
                </span>
              </div>
              {/* STD */}
              <div className="flex items-center gap-[10px]">
                <span className="w-[40px] flex-shrink-0 font-mono text-[10px] tracking-[1px] text-[#6b7280]">
                  STD
                </span>
                <div className="relative flex h-[8px] flex-1 overflow-hidden rounded-full bg-[#f4f4f3] dark:bg-white/10">
                  <div
                    className="absolute start-0 top-0 h-full rounded-full bg-[#111] transition-all duration-500 dark:bg-white"
                    style={{ width: `${Math.max(4, (data.standard / maxSpread) * 100)}%` }}
                  />
                </div>
                <span className="w-[30px] flex-shrink-0 text-end font-mono text-[11px] font-medium text-[#111] dark:text-white">
                  {data.standard.toLocaleString('en-US')}
                </span>
              </div>
              {/* VIP */}
              <div className="flex items-center gap-[10px]">
                <span className="w-[40px] flex-shrink-0 font-mono text-[10px] tracking-[1px] text-[#6b7280]">
                  VIP
                </span>
                <div className="relative flex h-[8px] flex-1 overflow-hidden rounded-full bg-[#f4f4f3] dark:bg-white/10">
                  <div
                    className="absolute start-0 top-0 h-full rounded-full bg-[#1f8a5b] transition-all duration-500"
                    style={{
                      width: `${data.vip === 0 ? 4 : Math.max(4, (data.vip / maxSpread) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-[30px] flex-shrink-0 text-end font-mono text-[11px] font-medium text-[#111] dark:text-white">
                  {data.vip === 0 ? '0.0' : data.vip.toLocaleString('en-US')}
                </span>
              </div>
              {/* COMP */}
              <div className="flex items-center gap-[10px]">
                <span className="w-[40px] flex-shrink-0 font-mono text-[10px] tracking-[1px] text-[#6b7280]">
                  COMP
                </span>
                <div className="relative flex h-[8px] flex-1 overflow-hidden rounded-full bg-[#f4f4f3] dark:bg-white/10">
                  <div
                    className="absolute start-0 top-0 h-full rounded-full bg-[#9ca3af] transition-all duration-500"
                    style={{ width: `${Math.max(4, (data.industry / maxSpread) * 100)}%` }}
                  />
                </div>
                <span className="w-[30px] flex-shrink-0 text-end font-mono text-[11px] font-medium text-[#111] dark:text-white">
                  {data.industry.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account cards — stacked full-width */}
      <section className="px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-3">
            {t('compKicker')}
          </SectionKicker>
          <div className="flex flex-col gap-3">
            {/* Standard */}
            <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-[22px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:border-white/[0.07] dark:bg-[#1a1c22] dark:hover:border-white/10">
              <p className="text-foreground mb-4 font-sans text-[20px] font-semibold tracking-[-0.4px]">
                {t('stdLabel')}
              </p>
              <div className="flex flex-col gap-px overflow-hidden rounded-[20px] bg-[rgba(17,17,17,0.08)] dark:bg-white/[0.06]">
                {[
                  {
                    label: `${t('colSpread')} (${selectedInstrument?.name ?? ''})`,
                    value: `${data.standard.toLocaleString('en-US')} ${data.unit}`,
                  },
                  { label: t('colCommission'), value: t('commNone') },
                  { label: t('colMinDeposit'), value: '$100' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between bg-[#f7f7f5] px-[14px] py-[12px] dark:bg-[#111316]"
                  >
                    <span className="font-body text-[13px] text-[#6b7280] dark:text-white/60">
                      {row.label}
                    </span>
                    <span className="font-sans text-[13px] font-semibold text-[#111] dark:text-white">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw — highlighted */}
            <div
              className="relative overflow-hidden rounded-[20px] bg-[#111] p-[22px]"
              style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.18)' }}
            >
              <div className="pointer-events-none absolute end-[-20px] top-[-50px] h-[180px] w-[180px] rounded-full bg-[#00b050]/[0.12] blur-[60px]" />
              <div className="relative mb-4 flex items-center justify-between">
                <p className="font-sans text-[20px] font-semibold tracking-[-0.4px] text-white">
                  {t('rawLabel')}
                </p>
                <span className="text-accent rounded-full bg-[rgba(0,176,80,0.15)] px-[10px] py-[5px] font-mono text-[10px] tracking-[1.2px]">
                  BEST VALUE
                </span>
              </div>
              <div className="relative flex flex-col gap-px overflow-hidden rounded-[20px] bg-white/10">
                {[
                  {
                    label: `${t('colSpread')} (${selectedInstrument?.name ?? ''})`,
                    value: `${data.raw === 0 ? '0.0' : data.raw.toLocaleString('en-US')} ${data.unit}`,
                  },
                  { label: t('colCommission'), value: '$3.50/lot' },
                  { label: t('colMinDeposit'), value: '$500' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between bg-[#111] px-[14px] py-[12px]"
                  >
                    <span className="font-body text-[13px] text-white/60">{row.label}</span>
                    <span className="font-sans text-[13px] font-semibold text-white">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP */}
            <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-[22px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:border-white/[0.07] dark:bg-[#1a1c22] dark:hover:border-white/10">
              <p className="text-foreground mb-4 font-sans text-[20px] font-semibold tracking-[-0.4px]">
                {t('vipLabel')}
              </p>
              <div className="flex flex-col gap-px overflow-hidden rounded-[20px] bg-[rgba(17,17,17,0.08)] dark:bg-white/[0.06]">
                {[
                  {
                    label: `${t('colSpread')} (${selectedInstrument?.name ?? ''})`,
                    value: `${data.vip === 0 ? '0.0' : data.vip.toLocaleString('en-US')} ${data.unit}`,
                  },
                  { label: t('colCommission'), value: t('commFrom') },
                  { label: t('colMinDeposit'), value: '$10k' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between bg-[#f7f7f5] px-[14px] py-[12px] dark:bg-[#111316]"
                  >
                    <span className="font-body text-[13px] text-[#6b7280] dark:text-white/60">
                      {row.label}
                    </span>
                    <span className="font-sans text-[13px] font-semibold text-[#111] dark:text-white">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Annual saving panel */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[20px] bg-[#111111] px-5 py-6">
            <SectionKicker className="mb-3 [&>span:first-child]:bg-white/20 [&>span:last-child]:text-white/50">
              {t('savingKicker')}
            </SectionKicker>
            <p className="text-accent mb-1 font-sans text-[48px] font-semibold tabular-nums leading-[1]">
              ${annualSaving.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="font-body mt-1 text-[13px] leading-[1.55] text-white/60">
              {t('savingDesc', { lots: LOTS_PER_MONTH })}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
