'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type FibDirection = 'Uptrend' | 'Downtrend';

interface FibLevel {
  label: string;
  ratio: number;
  price: number;
  type: 'retracement' | 'extension';
  color: string;
}

const RETRACEMENT_RATIOS = [
  { label: '0.0%', ratio: 0, color: '#9CA3AF' },
  { label: '23.6%', ratio: 0.236, color: '#60A5FA' },
  { label: '38.2%', ratio: 0.382, color: '#818CF8' },
  { label: '50.0%', ratio: 0.5, color: '#A78BFA' },
  { label: '61.8%', ratio: 0.618, color: '#C084FC' },
  { label: '78.6%', ratio: 0.786, color: '#E879F9' },
  { label: '100.0%', ratio: 1, color: '#9CA3AF' },
] as const;

const EXTENSION_RATIOS = [
  { label: '127.2%', ratio: 1.272, color: '#34D399' },
  { label: '161.8%', ratio: 1.618, color: '#00B050' },
  { label: '200.0%', ratio: 2.0, color: '#059669' },
  { label: '261.8%', ratio: 2.618, color: '#047857' },
] as const;

function computeFibLevels(
  swingHigh: number,
  swingLow: number,
  direction: FibDirection,
): FibLevel[] {
  const range = swingHigh - swingLow;
  const levels: FibLevel[] = [];

  RETRACEMENT_RATIOS.forEach(({ label, ratio, color }) => {
    const price = direction === 'Uptrend' ? swingHigh - ratio * range : swingLow + ratio * range;
    levels.push({ label, ratio, price, type: 'retracement', color });
  });

  EXTENSION_RATIOS.forEach(({ label, ratio, color }) => {
    const price = direction === 'Uptrend' ? swingLow + ratio * range : swingHigh - ratio * range;
    levels.push({ label, ratio, price, type: 'extension', color });
  });

  return levels;
}

function NumberInput({
  label,
  value,
  onChange,
  step = '0.0001',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="border-border font-body text-foreground focus:border-accent w-full rounded-[12px] border bg-white px-4 py-3 text-[14px] outline-none dark:bg-[#1c1c1c]"
      />
    </div>
  );
}

function ResultCard({ levels }: { levels: FibLevel[] }) {
  const retracements = levels.filter((l) => l.type === 'retracement');
  const extensions = levels.filter((l) => l.type === 'extension');

  return (
    <div
      className="overflow-hidden rounded-[18px] bg-[#111111]"
      style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.15)' }}
    >
      {/* Retracements */}
      <div className="px-5 pb-3 pt-5">
        <p className="font-body mb-3 text-[10px] uppercase tracking-[0.12em] text-white/40">
          Retracement Levels
        </p>
        <div className="flex flex-col gap-0">
          {retracements.map((lvl) => (
            <div
              key={lvl.label}
              className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="block h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: lvl.color }}
                />
                <span className="font-body text-[12px] font-semibold" style={{ color: lvl.color }}>
                  {lvl.label}
                </span>
              </div>
              <span className="font-body text-[14px] font-medium text-white">
                {lvl.price.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 border-t border-white/10" />

      {/* Extensions */}
      <div className="px-5 pb-5 pt-3">
        <p className="font-body mb-3 text-[10px] uppercase tracking-[0.12em] text-white/40">
          Extension Levels
        </p>
        <div className="flex flex-col gap-0">
          {extensions.map((lvl) => (
            <div
              key={lvl.label}
              className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="block h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: lvl.color }}
                />
                <span className="font-body text-[12px] font-semibold" style={{ color: lvl.color }}>
                  {lvl.label}
                </span>
              </div>
              <span className="font-body text-[14px] font-medium text-white">
                {lvl.price.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormulaBox({ direction }: { direction: FibDirection }) {
  return (
    <div className="rounded-[14px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
      <p className="font-body text-muted mb-2 text-[10px] uppercase tracking-[0.1em]">
        How it&apos;s calculated
      </p>
      <p className="font-body text-foreground text-[13px] leading-[1.6]">
        <span className="font-medium">
          {direction === 'Uptrend'
            ? 'Level = Swing High – (Ratio × Range) · Extension = Swing Low + (Ratio × Range)'
            : 'Level = Swing Low + (Ratio × Range) · Extension = Swing High – (Ratio × Range)'}
        </span>
        <br />
        <span className="text-muted">
          Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%, 78.6%) are derived from the golden ratio and
          identify natural support and resistance zones. Extensions (127.2%, 161.8%, 200%, 261.8%)
          project beyond the original swing for trend continuation targets.
        </span>
      </p>
    </div>
  );
}

export function FibonacciCalculatorPage() {
  const locale = useLocale();

  const [swingHigh, setSwingHigh] = useState('1.1050');
  const [swingLow, setSwingLow] = useState('1.0800');
  const [direction, setDirection] = useState<FibDirection>('Uptrend');
  const [levels, setLevels] = useState<FibLevel[]>(() => computeFibLevels(1.105, 1.08, 'Uptrend'));

  const handleCalculate = useCallback(() => {
    const H = parseFloat(swingHigh);
    const L = parseFloat(swingLow);
    if (isNaN(H) || isNaN(L) || H <= L) return;
    setLevels(computeFibLevels(H, L, direction));
  }, [swingHigh, swingLow, direction]);

  const handleReset = useCallback(() => {
    setSwingHigh('1.1050');
    setSwingLow('1.0800');
    setDirection('Uptrend');
    setLevels(computeFibLevels(1.105, 1.08, 'Uptrend'));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9 xl:px-[80px] xl:py-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[42px] font-semibold leading-[1.05]">
            Fibonacci levels.
            <br />
            <span className="text-[#00B050]">Drawn for you.</span>
          </h1>
          <p className="font-body text-muted max-w-[340px] text-[14px] leading-[1.55]">
            Retracement and extension levels from a swing high and low — for trend continuation or
            reversal setups.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="dark:bg-background bg-white px-5 pb-10 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:gap-8">
            <div className="flex flex-col gap-4 xl:grid xl:flex-1 xl:grid-cols-2 xl:gap-4">
              <NumberInput label="Swing High" value={swingHigh} onChange={setSwingHigh} />
              <NumberInput label="Swing Low" value={swingLow} onChange={setSwingLow} />

              {/* Direction toggle */}
              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Uptrend', 'Downtrend'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDirection(d);
                        const H = parseFloat(swingHigh);
                        const L = parseFloat(swingLow);
                        if (!isNaN(H) && !isNaN(L) && H > L) {
                          setLevels(computeFibLevels(H, L, d));
                        }
                      }}
                      className={`font-body rounded-[12px] border py-3 text-[13px] font-medium transition-colors ${
                        direction === d
                          ? d === 'Uptrend'
                            ? 'border-[#00B050] bg-[#00B050]/10 text-[#00B050]'
                            : 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-border text-muted'
                      }`}
                    >
                      {d === 'Uptrend' ? '▲ Uptrend' : '▼ Downtrend'}
                    </button>
                  ))}
                </div>
              </div>

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
            <div className="hidden xl:flex xl:w-[420px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
              <ResultCard levels={levels} />
              <FormulaBox direction={direction} />
            </div>
          </div>

          {/* Mobile result panel */}
          <div className="mt-5 flex flex-col gap-4 xl:hidden">
            <ResultCard levels={levels} />
            <FormulaBox direction={direction} />
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
                tag: 'P&L',
                label: 'Profit calculator',
                desc: 'Model gross P&L by instrument, lots, entry and exit price.',
                href: `/${locale}/tools/profit`,
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
            Trade the levels
            <br />
            with precision.
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Open a live or demo account and execute at the exact prices the calculator shows.
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
