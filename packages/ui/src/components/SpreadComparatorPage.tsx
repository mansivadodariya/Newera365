'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Instrument = 'EURUSD' | 'GBPUSD' | 'XAUUSD' | 'BTCUSD';

const INSTRUMENTS: { id: Instrument; label: string }[] = [
  { id: 'EURUSD', label: 'EURUSD' },
  { id: 'GBPUSD', label: 'GBPUSD' },
  { id: 'XAUUSD', label: 'XAUUSD' },
  { id: 'BTCUSD', label: 'BITCOIN' },
];

const SPREAD_DATA: Record<
  Instrument,
  {
    industry: number;
    standard: number;
    raw: number;
    vip: number;
    pipValue: number;
    unit: string;
  }
> = {
  EURUSD: { industry: 1.9, standard: 1.0, raw: 0.0, vip: 0.0, pipValue: 10, unit: 'pip' },
  GBPUSD: { industry: 2.1, standard: 1.2, raw: 0.1, vip: 0.0, pipValue: 10, unit: 'pip' },
  XAUUSD: { industry: 0.5, standard: 0.35, raw: 0.15, vip: 0.1, pipValue: 1, unit: 'USD' },
  BTCUSD: { industry: 55, standard: 30, raw: 15, vip: 10, pipValue: 1, unit: 'pt' },
};

const COMMISSIONS = { standard: 0, raw: 3.5, vip: 1.5 };
const LOTS_PER_MONTH = 10;

function SpreadBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div className="dark:bg-surface-elevated h-[6px] w-full overflow-hidden rounded-full bg-[#e5e7eb]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function SpreadComparatorPage() {
  const locale = useLocale();
  const [instrument, setInstrument] = useState<Instrument>('EURUSD');

  const data = SPREAD_DATA[instrument];

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

  const maxSpread = data.industry;

  const rows: {
    label: string;
    spread: number;
    commission: number;
    color: string;
    isHighlighted: boolean;
  }[] = [
    {
      label: 'Industry avg',
      spread: data.industry,
      commission: 0,
      color: '#6B7280',
      isHighlighted: false,
    },
    {
      label: 'Standard',
      spread: data.standard,
      commission: COMMISSIONS.standard,
      color: '#374151',
      isHighlighted: false,
    },
    {
      label: 'Raw',
      spread: data.raw,
      commission: COMMISSIONS.raw,
      color: '#00B050',
      isHighlighted: true,
    },
    {
      label: 'VIP',
      spread: data.vip,
      commission: COMMISSIONS.vip,
      color: '#8B5CF6',
      isHighlighted: false,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            TOOLS
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.05] tracking-[-1.14px]">
            See where you <span className="text-accent">save.</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            Side-by-side spread comparison across our account types and the average industry spread.
          </p>
        </div>
      </section>

      {/* Instrument selector */}
      <section className="bg-background px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {INSTRUMENTS.map((ins) => (
              <button
                key={ins.id}
                onClick={() => setInstrument(ins.id)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  instrument === ins.id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'dark:bg-surface dark:text-muted bg-[#f3f4f6] text-[#6b7280]'
                }`}
              >
                {ins.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Spread bars */}
      <section className="bg-background px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="bg-surface rounded-[18px] p-5">
            <p className="font-body mb-4 text-[10px] uppercase tracking-[0.12em] text-[#9ca3af]">
              SPREAD COMPARISON
            </p>
            <div className="flex flex-col gap-4">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-body text-[12px] font-medium ${
                        row.isHighlighted ? 'text-accent' : 'dark:text-muted text-[#6b7280]'
                      }`}
                    >
                      {row.label}
                    </span>
                    <span
                      className={`font-body text-[12px] font-semibold tabular-nums ${
                        row.isHighlighted ? 'text-accent' : 'text-foreground'
                      }`}
                    >
                      {row.spread === 0
                        ? `$${row.commission.toFixed(2)}/lot`
                        : `${row.spread.toLocaleString('en-US')} ${data.unit}`}
                    </span>
                  </div>
                  <SpreadBar value={row.spread || 0.15} max={maxSpread} color={row.color} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Account cards */}
      <section className="bg-background px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-3 gap-[10px]">
            {/* Standard */}
            <div className="bg-surface shadow-card flex flex-col gap-3 rounded-[18px] p-4 dark:shadow-none">
              <span className="text-foreground font-sans text-[13px] font-semibold">Standard</span>
              <div className="flex flex-col gap-1">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                  Spread
                </p>
                <p className="font-body text-foreground text-[13px] font-semibold tabular-nums">
                  {data.standard.toLocaleString('en-US')} {data.unit}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                  Commission
                </p>
                <p className="font-body text-foreground text-[13px] font-semibold">None</p>
              </div>
              <div className="dark:border-border mt-auto border-t border-[#e5e7eb] pt-3">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                  Cost / lot
                </p>
                <p className="font-body text-foreground text-[15px] font-semibold tabular-nums">
                  ${costPerLot.standard.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Raw — highlighted */}
            <div
              className="flex flex-col gap-3 rounded-[18px] bg-[#111111] p-4"
              style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.18)' }}
            >
              <span className="font-sans text-[13px] font-semibold text-white">Raw</span>
              <div className="flex flex-col gap-1">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
                  Spread
                </p>
                <p className="font-body text-accent text-[13px] font-semibold tabular-nums">
                  {data.raw === 0 ? '0.0' : data.raw.toLocaleString('en-US')} {data.unit}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
                  Commission
                </p>
                <p className="font-body text-[13px] font-semibold text-white">$3.50/lot</p>
              </div>
              <div className="mt-auto border-t border-white/10 pt-3">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
                  Cost / lot
                </p>
                <p className="font-body text-accent text-[15px] font-semibold tabular-nums">
                  ${costPerLot.raw.toFixed(2)}
                </p>
              </div>
            </div>

            {/* VIP */}
            <div className="bg-surface shadow-card flex flex-col gap-3 rounded-[18px] p-4 dark:shadow-none">
              <span className="text-foreground font-sans text-[13px] font-semibold">VIP</span>
              <div className="flex flex-col gap-1">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                  Spread
                </p>
                <p className="font-body text-foreground text-[13px] font-semibold tabular-nums">
                  {data.vip === 0 ? '0.0' : data.vip.toLocaleString('en-US')} {data.unit}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                  Commission
                </p>
                <p className="font-body text-foreground text-[13px] font-semibold">From $1.50</p>
              </div>
              <div className="dark:border-border mt-auto border-t border-[#e5e7eb] pt-3">
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-[#9ca3af]">
                  Cost / lot
                </p>
                <p className="font-body text-foreground text-[15px] font-semibold tabular-nums">
                  From ${costPerLot.vip.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Annual saving panel */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div
            className="rounded-[20px] bg-[#111111] px-5 py-6"
            style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.12)' }}
          >
            <p className="font-body mb-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
              YEAR-ROUND SAVING
            </p>
            <p className="mb-1 font-sans text-[46px] font-semibold tabular-nums leading-[1] text-white">
              ${annualSaving.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="font-body text-[12px] leading-snug text-white/50">
              Estimated annual saving on {LOTS_PER_MONTH} lots/month vs. avg. industry
            </p>
            <Link
              href={`/${locale}/register?account=raw`}
              className="bg-accent font-body hover:bg-accent/90 mt-5 flex h-[48px] items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
            >
              Open Raw account
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
        </div>
      </section>

      {/* How we calculate */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="bg-surface rounded-[18px] p-5">
            <p className="font-body mb-2 text-[10px] uppercase tracking-[0.12em] text-[#9ca3af]">
              HOW IT&apos;S CALCULATED
            </p>
            <p className="text-foreground font-sans text-[14px] font-semibold">
              Spread cost = Spread (pips) × Pip value × Lots
            </p>
            <p className="font-body text-muted mt-2 text-[12px] leading-relaxed">
              Pip value for most major pairs is $10 per standard lot. Raw and VIP accounts add a
              fixed commission per lot instead of a wider spread — typically saving active traders
              significantly over the year.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            GET STARTED
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            Trade with
            <br />
            <span className="text-accent">lower costs.</span>
          </h2>
          <p className="font-body mb-8 text-[13px] leading-relaxed text-white/60">
            Open a Raw account and keep more of every trade you make.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/register?account=raw`}
              className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
            >
              Open Raw account
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href={`/${locale}/trade/accounts/comparison`}
              className="font-body flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
            >
              Compare all accounts
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
