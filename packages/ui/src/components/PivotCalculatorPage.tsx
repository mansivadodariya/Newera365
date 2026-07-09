'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CalcSelect } from './CalcSelect';

type PivotMethod = 'Classical' | 'Camarilla' | 'Woodie' | 'Fibonacci';

interface PivotLevels {
  P: number;
  R1: number;
  R2: number;
  R3: number;
  S1: number;
  S2: number;
  S3: number;
}

function calcClassical(H: number, L: number, C: number): PivotLevels {
  const P = (H + L + C) / 3;
  const R1 = 2 * P - L;
  const R2 = P + (H - L);
  const R3 = H + 2 * (P - L);
  const S1 = 2 * P - H;
  const S2 = P - (H - L);
  const S3 = L - 2 * (H - P);
  return { P, R1, R2, R3, S1, S2, S3 };
}

function calcCamarilla(H: number, L: number, C: number): PivotLevels {
  const P = (H + L + C) / 3;
  const range = H - L;
  const R1 = C + (range * 1.1) / 12;
  const R2 = C + (range * 1.1) / 6;
  const R3 = C + (range * 1.1) / 4;
  const S1 = C - (range * 1.1) / 12;
  const S2 = C - (range * 1.1) / 6;
  const S3 = C - (range * 1.1) / 4;
  return { P, R1, R2, R3, S1, S2, S3 };
}

function calcWoodie(H: number, L: number, C: number): PivotLevels {
  const P = (H + L + 2 * C) / 4;
  const R1 = 2 * P - L;
  const R2 = P + (H - L);
  const R3 = R1 + (H - L);
  const S1 = 2 * P - H;
  const S2 = P - (H - L);
  const S3 = S1 - (H - L);
  return { P, R1, R2, R3, S1, S2, S3 };
}

function calcFibonacci(H: number, L: number, C: number): PivotLevels {
  const P = (H + L + C) / 3;
  const range = H - L;
  const R1 = P + 0.382 * range;
  const R2 = P + 0.618 * range;
  const R3 = P + 1.0 * range;
  const S1 = P - 0.382 * range;
  const S2 = P - 0.618 * range;
  const S3 = P - 1.0 * range;
  return { P, R1, R2, R3, S1, S2, S3 };
}

function computePivots(method: PivotMethod, H: number, L: number, C: number): PivotLevels {
  switch (method) {
    case 'Camarilla':
      return calcCamarilla(H, L, C);
    case 'Woodie':
      return calcWoodie(H, L, C);
    case 'Fibonacci':
      return calcFibonacci(H, L, C);
    default:
      return calcClassical(H, L, C);
  }
}

function fmt(n: number) {
  return n.toFixed(4);
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

function FormulaBox({ method, calcKicker }: { method: PivotMethod; calcKicker: string }) {
  const formulas: Record<PivotMethod, { formula: string; desc: string }> = {
    Classical: {
      formula: 'P = (High + Low + Close) ÷ 3 · R1 = 2P - Low · S1 = 2P - High',
      desc: 'The classical pivot is the benchmark for intraday support and resistance. Resistance and support levels fan out symmetrically around P using the prior session range.',
    },
    Camarilla: {
      formula: 'P = (H+L+C) ÷ 3 · R1 = C + Range × 1.1/12 · R3 = C + Range × 1.1/4',
      desc: 'Camarilla levels use the close as the anchor. Prices tend to revert to the centre; breaches of R3/S3 signal momentum breakouts.',
    },
    Woodie: {
      formula: 'P = (High + Low + 2×Close) ÷ 4 · R1 = 2P - Low · R2 = P + Range',
      desc: 'Woodie pivots weight the close twice, making P closer to the closing price and giving more significance to where the session ended.',
    },
    Fibonacci: {
      formula: 'P = (H+L+C) ÷ 3 · R1 = P + 0.382×Range · R2 = P + 0.618×Range · R3 = P + Range',
      desc: 'Fibonacci pivots apply the golden-ratio retracement levels (38.2%, 61.8%, 100%) to the session range, useful for identifying high-probability turning points.',
    },
  };
  const { formula, desc } = formulas[method];
  return (
    <div className="rounded-[14px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
      <p className="font-body text-muted mb-2 text-[10px] uppercase tracking-[0.1em]">
        {calcKicker}
      </p>
      <p className="font-body text-foreground text-[13px] leading-[1.6]">
        <span className="font-medium">{formula}</span>
        <br />
        <span className="text-muted">{desc}</span>
      </p>
    </div>
  );
}

function ResultCard({ levels, resultLabel }: { levels: PivotLevels; resultLabel: string }) {
  const rows: { label: string; value: number; color: string }[] = [
    { label: 'R3', value: levels.R3, color: '#EF4444' },
    { label: 'R2', value: levels.R2, color: '#F97316' },
    { label: 'R1', value: levels.R1, color: '#EAB308' },
    { label: 'P', value: levels.P, color: '#00B050' },
    { label: 'S1', value: levels.S1, color: '#EAB308' },
    { label: 'S2', value: levels.S2, color: '#F97316' },
    { label: 'S3', value: levels.S3, color: '#EF4444' },
  ];

  return (
    <div
      className="overflow-hidden rounded-[18px] bg-[#111111]"
      style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.15)' }}
    >
      <div className="px-5 pb-4 pt-5">
        <p className="font-body mb-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
          {resultLabel}
        </p>
        <p className="font-sans text-[42px] font-semibold leading-[1.1] text-[#00B050]">
          {fmt(levels.P)}
        </p>
      </div>
      <div className="mx-5 border-t border-white/10" />
      <div className="flex flex-col gap-0 px-5 py-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
          >
            <span
              className="font-body text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: row.color }}
            >
              {row.label}
            </span>
            <span className="font-body text-[14px] font-medium text-white">{fmt(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PivotCalculator() {
  const t = useTranslations('pivot');

  const [method, setMethod] = useState<PivotMethod>('Classical');
  const [high, setHigh] = useState('1.0925');
  const [low, setLow] = useState('1.0830');
  const [close, setClose] = useState('1.0892');
  const [levels, setLevels] = useState<PivotLevels>(() =>
    computePivots('Classical', 1.0925, 1.083, 1.0892),
  );

  const METHODS: PivotMethod[] = ['Classical', 'Camarilla', 'Woodie', 'Fibonacci'];

  const TAB_LABELS: Record<PivotMethod, string> = {
    Classical: t('tabClassic'),
    Camarilla: t('tabCamarilla'),
    Woodie: t('tabWoodie'),
    Fibonacci: t('tabFib'),
  };

  const handleCalculate = useCallback(() => {
    const H = parseFloat(high);
    const L = parseFloat(low);
    const C = parseFloat(close);
    if (isNaN(H) || isNaN(L) || isNaN(C)) return;
    setLevels(computePivots(method, H, L, C));
  }, [method, high, low, close]);

  const handleReset = useCallback(() => {
    setMethod('Classical');
    setHigh('1.0925');
    setLow('1.0830');
    setClose('1.0892');
    setLevels(computePivots('Classical', 1.0925, 1.083, 1.0892));
  }, []);

  return (
    <div>
      {/* Method tabs */}
          <div className="mb-5 flex rounded-[14px] bg-[#f2f2f4] p-1 dark:bg-[#1c1c1c]">
            {METHODS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMethod(m);
                  const H = parseFloat(high);
                  const L = parseFloat(low);
                  const C = parseFloat(close);
                  if (!isNaN(H) && !isNaN(L) && !isNaN(C)) {
                    setLevels(computePivots(m, H, L, C));
                  }
                }}
                className={`font-body flex-1 rounded-[11px] py-2.5 text-[12px] font-medium transition-colors ${
                  method === m
                    ? 'text-foreground bg-white shadow-sm dark:bg-[#2a2a2a] dark:text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {TAB_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Inputs + results */}
          <div className="xl:flex xl:gap-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:flex-1">
              <CalcSelect
                label={t('fieldMethod')}
                value={method}
                options={METHODS}
                onChange={(v) => {
                  const m = v as PivotMethod;
                  setMethod(m);
                  const H = parseFloat(high);
                  const L = parseFloat(low);
                  const C = parseFloat(close);
                  if (!isNaN(H) && !isNaN(L) && !isNaN(C)) {
                    setLevels(computePivots(m, H, L, C));
                  }
                }}
              />
              <NumberInput label={t('fieldHigh')} value={high} onChange={setHigh} />
              <NumberInput label={t('fieldLow')} value={low} onChange={setLow} />
              <NumberInput label={t('fieldClose')} value={close} onChange={setClose} />

              {/* Buttons */}
              <div className="col-span-full flex items-center gap-3">
                <button
                  onClick={handleCalculate}
                  className="font-body flex h-[48px] flex-1 items-center justify-center rounded-full bg-[#00B050] text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90 xl:flex-none xl:px-8"
                >
                  {t('calcBtn')}
                </button>
                <button
                  onClick={handleReset}
                  className="border-border font-body flex h-[48px] flex-1 items-center justify-center rounded-full border text-[14px] font-medium transition-colors xl:flex-none xl:px-8"
                >
                  {t('resetBtn')}
                </button>
                <p className="font-body text-muted hidden text-[11px] xl:block">
                  {t('disclaimer')}
                </p>
              </div>
            </div>

            {/* Desktop result panel */}
            <div className="hidden xl:flex xl:w-[400px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
              <ResultCard levels={levels} resultLabel={t('resultLabel')} />
              <FormulaBox method={method} calcKicker={t('calcKicker')} />
            </div>
          </div>

          {/* Mobile result panel */}
          <div className="mt-5 flex flex-col gap-4 xl:hidden">
            <ResultCard levels={levels} resultLabel={t('resultLabel')} />
            <FormulaBox method={method} calcKicker={t('calcKicker')} />
          </div>
    </div>
  );
}
