'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const INSTRUMENTS = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USD', 'NAS100', 'US30'] as const;
type Instrument = (typeof INSTRUMENTS)[number];

const CONTRACT_SIZES: Record<Instrument, number> = {
  'EUR/USD': 100000,
  'GBP/USD': 100000,
  'XAU/USD': 100,
  'BTC/USD': 1,
  NAS100: 10,
  US30: 10,
};

const COMMISSION_PER_LOT = 3.5; // USD per lot per side (Raw account)

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">{label}</label>
      <div className="border-border relative overflow-hidden rounded-[12px] border bg-white dark:bg-[#1c1c1c]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-body text-foreground w-full appearance-none bg-transparent px-4 py-3 text-[14px] outline-none"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          className="text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = '0.01',
  min = '0',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="border-border font-body text-foreground focus:border-accent w-full rounded-[12px] border bg-white px-4 py-3 text-[14px] outline-none dark:bg-[#1c1c1c]"
      />
    </div>
  );
}

interface PnlResult {
  gross: number;
  commission: number;
  net: number;
}

function ResultCard({
  result,
  currency,
  lots,
  instrument,
  direction,
}: {
  result: PnlResult;
  currency: string;
  lots: number;
  instrument: Instrument;
  direction: 'Buy' | 'Sell';
}) {
  const isPositive = result.gross >= 0;
  const pnlColor = isPositive ? '#00B050' : '#EF4444';

  return (
    <div
      className="overflow-hidden rounded-[18px] bg-[#111111]"
      style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.15)' }}
    >
      <div className="px-5 pb-4 pt-5">
        <p className="font-body mb-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
          Gross P&amp;L
        </p>
        <p
          className="font-sans text-[42px] font-semibold leading-[1.1]"
          style={{ color: pnlColor }}
        >
          {result.gross < 0 ? '-' : '+'}
          {Math.abs(result.gross).toFixed(2)}
          <span className="ml-1 text-[22px] font-normal text-white/60">{currency}</span>
        </p>
      </div>
      <div className="mx-5 border-t border-white/10" />
      <div className="grid grid-cols-3 px-5 py-4">
        {[
          { label: 'Commission', value: `-${result.commission.toFixed(2)} ${currency}` },
          {
            label: 'Net P&L',
            value: `${result.net >= 0 ? '+' : ''}${result.net.toFixed(2)} ${currency}`,
          },
          { label: 'Contract', value: CONTRACT_SIZES[instrument].toLocaleString('en-US') },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
              {item.label}
            </span>
            <span className="font-body text-[12px] font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mx-5 border-t border-white/10" />
      <div className="flex items-center justify-between px-5 py-3">
        <span className="font-body text-[10px] uppercase tracking-[0.1em] text-white/40">
          Direction
        </span>
        <span
          className="font-body text-[12px] font-semibold"
          style={{ color: direction === 'Buy' ? '#00B050' : '#EF4444' }}
        >
          {direction === 'Buy' ? '▲ Buy' : '▼ Sell'}
        </span>
      </div>
    </div>
  );
}

function FormulaBox() {
  return (
    <div className="rounded-[14px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
      <p className="font-body text-muted mb-2 text-[10px] uppercase tracking-[0.1em]">
        How it&apos;s calculated
      </p>
      <p className="font-body text-foreground text-[13px] leading-[1.6]">
        <span className="font-medium">P&amp;L = (Exit – Entry) × Contract Size × Lots</span>
        <br />
        <span className="text-muted">
          For Raw accounts a commission of $3.50 per lot per side is deducted from gross P&amp;L.
          Results are denominated in the account currency and may vary with live spreads.
        </span>
      </p>
    </div>
  );
}

export function ProfitCalculatorPage() {
  const locale = useLocale();

  const [instrument, setInstrument] = useState<Instrument>('EUR/USD');
  const [direction, setDirection] = useState<'Buy' | 'Sell'>('Buy');
  const [entry, setEntry] = useState('1.0850');
  const [exit, setExit] = useState('1.0920');
  const [lots, setLots] = useState('1.00');
  const [currency] = useState('USD');

  const [result, setResult] = useState<PnlResult>(() => {
    const contractSize = CONTRACT_SIZES['EUR/USD'];
    const gross = (1.092 - 1.085) * contractSize * 1;
    const commission = COMMISSION_PER_LOT * 1 * 2;
    return { gross, commission, net: gross - commission };
  });

  const handleCalculate = useCallback(() => {
    const entryVal = parseFloat(entry);
    const exitVal = parseFloat(exit);
    const lotsVal = parseFloat(lots);
    if (isNaN(entryVal) || isNaN(exitVal) || isNaN(lotsVal) || lotsVal <= 0) return;

    const contractSize = CONTRACT_SIZES[instrument];
    const diff = direction === 'Buy' ? exitVal - entryVal : entryVal - exitVal;
    const gross = diff * contractSize * lotsVal;
    const commission = COMMISSION_PER_LOT * lotsVal * 2; // entry + exit
    const net = gross - commission;
    setResult({ gross, commission, net });
  }, [instrument, direction, entry, exit, lots]);

  const handleReset = useCallback(() => {
    setInstrument('EUR/USD');
    setDirection('Buy');
    setEntry('1.0850');
    setExit('1.0920');
    setLots('1.00');
    const contractSize = CONTRACT_SIZES['EUR/USD'];
    const gross = (1.092 - 1.085) * contractSize * 1;
    const commission = COMMISSION_PER_LOT * 1 * 2;
    setResult({ gross, commission, net: gross - commission });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9 xl:px-[80px] xl:py-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[42px] font-semibold leading-[1.05]">
            Model your P&amp;L.
            <br />
            <span className="text-[#00B050]">Before you trade.</span>
          </h1>
          <p className="font-body text-muted max-w-[340px] text-[14px] leading-[1.55]">
            Estimate gross and net profit or loss for any instrument — factor in position size,
            entry and exit prices, plus Raw account commission.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="dark:bg-background bg-white px-5 pb-10 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:gap-8">
            <div className="flex flex-col gap-4 xl:grid xl:flex-1 xl:grid-cols-2 xl:gap-4">
              <SelectInput
                label="Instrument"
                value={instrument}
                options={INSTRUMENTS}
                onChange={(v) => setInstrument(v as Instrument)}
              />

              {/* Direction toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Buy', 'Sell'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={`font-body rounded-[12px] border py-3 text-[13px] font-medium transition-colors ${
                        direction === d
                          ? d === 'Buy'
                            ? 'border-[#00B050] bg-[#00B050]/10 text-[#00B050]'
                            : 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-border text-muted'
                      }`}
                    >
                      {d === 'Buy' ? '▲ Buy' : '▼ Sell'}
                    </button>
                  ))}
                </div>
              </div>

              <NumberInput label="Entry Price" value={entry} onChange={setEntry} step="0.00001" />
              <NumberInput label="Exit Price" value={exit} onChange={setExit} step="0.00001" />
              <NumberInput
                label="Position Size (lots)"
                value={lots}
                onChange={setLots}
                step="0.01"
                min="0.01"
              />
              <SelectInput
                label="Account Currency"
                value={currency}
                options={['USD']}
                onChange={() => {}}
              />

              {/* Buttons */}
              <div className="flex items-center gap-3 xl:col-span-2">
                <button
                  onClick={handleCalculate}
                  className="font-body flex h-[48px] flex-1 items-center justify-center rounded-full bg-[#00B050] text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90 xl:flex-none xl:px-8"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="border-border font-body flex h-[48px] flex-1 items-center justify-center rounded-full border text-[14px] font-medium transition-colors xl:flex-none xl:px-8"
                >
                  Reset
                </button>
                <p className="font-body text-muted hidden text-[11px] xl:block">
                  Hypothetical · not investment advice.
                </p>
              </div>
            </div>

            {/* Desktop result panel */}
            <div className="hidden xl:flex xl:w-[400px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
              <ResultCard
                result={result}
                currency={currency}
                lots={parseFloat(lots) || 0}
                instrument={instrument}
                direction={direction}
              />
              <FormulaBox />
            </div>
          </div>

          {/* Mobile result panel */}
          <div className="mt-5 flex flex-col gap-4 xl:hidden">
            <ResultCard
              result={result}
              currency={currency}
              lots={parseFloat(lots) || 0}
              instrument={instrument}
              direction={direction}
            />
            <FormulaBox />
          </div>
        </div>
      </section>

      {/* More Calculators */}
      <section className="dark:bg-background bg-[#f9f9f9] px-5 pb-10 pt-8 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            MORE CALCULATORS
          </SectionKicker>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3 xl:gap-5">
            {[
              {
                tag: 'Pre-trade',
                label: 'Margin & pip calculator',
                desc: 'Margin, pip value and swap — pre-trade math without the spreadsheet.',
                href: `/${locale}/tools`,
              },
              {
                tag: 'Technical',
                label: 'Pivot calculator',
                desc: 'Classical, Camarilla, Woodie & Fibonacci pivots for any session.',
                href: `/${locale}/tools/pivot`,
              },
              {
                tag: 'Technical',
                label: 'Fibonacci calculator',
                desc: 'Retracement and extension levels from your swing high and low.',
                href: `/${locale}/tools/fibonacci`,
              },
            ].map((calc) => (
              <div
                key={calc.label}
                className="flex flex-col gap-3 rounded-[16px] bg-white p-5 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <span className="font-body inline-flex w-fit rounded-full bg-[#f3f4f6] px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b7280] dark:bg-[#2a2a2a] dark:text-[#9ca3af]">
                  {calc.tag}
                </span>
                <div>
                  <p className="text-foreground font-sans text-[14px] font-semibold">
                    {calc.label}
                  </p>
                  <p className="font-body text-muted mt-1 text-[12px] leading-[1.55]">
                    {calc.desc}
                  </p>
                </div>
                <Link
                  href={calc.href}
                  className="font-body mt-auto text-[13px] font-semibold text-[#00B050] hover:underline"
                >
                  Open calculator →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Like what
            <br />
            you see?
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Open a live or demo account and start trading with real spreads and execution.
          </p>
          <Link
            href={`/${locale}/register`}
            className="font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#00B050] text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90"
          >
            Open account
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
      </section>
    </>
  );
}
