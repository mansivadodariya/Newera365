'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CountUp } from './CountUp';
import { FormulaChips, LevelRow, NumberInput, ResultPanel, TAB_WELL_CLASS } from './CalcKit';

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

/* Resistance rows carry the down tick color, support rows the up tick color
   (sell zone above price, buy zone below): the chart palette, not a rainbow. */
function ResultCard({ levels, resultLabel }: { levels: PivotLevels; resultLabel: string }) {
  const rows = [
    { label: 'R3', value: levels.R3, tone: 'down' as const },
    { label: 'R2', value: levels.R2, tone: 'down' as const },
    { label: 'R1', value: levels.R1, tone: 'down' as const },
    { label: 'P', value: levels.P, tone: 'accent' as const },
    { label: 'S1', value: levels.S1, tone: 'up' as const },
    { label: 'S2', value: levels.S2, tone: 'up' as const },
    { label: 'S3', value: levels.S3, tone: 'up' as const },
  ];

  return (
    <ResultPanel>
      <div className="px-5 pb-4 pt-5">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          {resultLabel}
        </p>
        <p
          dir="ltr"
          className="text-accent-bright font-mono text-[42px] font-semibold tabular-nums leading-[1.1]"
        >
          <CountUp value={fmt(levels.P)} />
        </p>
      </div>
      <div className="mx-5 border-t border-white/10" />
      <div className="flex flex-col px-5 py-4">
        {rows.map((row) => (
          <LevelRow key={row.label} label={row.label} value={fmt(row.value)} tone={row.tone} />
        ))}
      </div>
    </ResultPanel>
  );
}

export function PivotCalculator() {
  const t = useTranslations('pivot');

  const [method, setMethod] = useState<PivotMethod>('Classical');
  const [high, setHigh] = useState('1.0925');
  const [low, setLow] = useState('1.0830');
  const [close, setClose] = useState('1.0892');

  // Live recompute; the panel holds the last valid read-out mid-edit.
  const computed = useMemo(() => {
    const H = parseFloat(high);
    const L = parseFloat(low);
    const C = parseFloat(close);
    if (isNaN(H) || isNaN(L) || isNaN(C) || H < L) return null;
    return computePivots(method, H, L, C);
  }, [method, high, low, close]);
  const lastValid = useRef(computed ?? computePivots('Classical', 1.0925, 1.083, 1.0892));
  if (computed) lastValid.current = computed;
  const levels = computed ?? lastValid.current;

  const METHODS: PivotMethod[] = ['Classical', 'Camarilla', 'Woodie', 'Fibonacci'];

  const TAB_LABELS: Record<PivotMethod, string> = {
    Classical: t('tabClassic'),
    Camarilla: t('tabCamarilla'),
    Woodie: t('tabWoodie'),
    Fibonacci: t('tabFib'),
  };

  const FORMULA_KEYS: Record<PivotMethod, { formula: string; desc: string }> = {
    Classical: { formula: t('formulaClassical'), desc: t('formulaClassicalDesc') },
    Camarilla: { formula: t('formulaCamarilla'), desc: t('formulaCamarillaDesc') },
    Woodie: { formula: t('formulaWoodie'), desc: t('formulaWoodieDesc') },
    Fibonacci: { formula: t('formulaFib'), desc: t('formulaFibDesc') },
  };

  return (
    <div>
      {/* Method tabs — the one switch that changes the math */}
      <div className={`mb-5 ${TAB_WELL_CLASS}`}>
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            aria-pressed={method === m}
            className={`font-body flex-1 rounded-[11px] py-2.5 text-[12px] font-medium transition-colors ${
              method === m
                ? 'text-foreground bg-white shadow-sm dark:bg-[#2a2d36] dark:text-white'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {TAB_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="xl:flex xl:gap-8">
        <div className="xl:flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <NumberInput label={t('fieldHigh')} value={high} onChange={setHigh} />
            <NumberInput label={t('fieldLow')} value={low} onChange={setLow} />
            <NumberInput label={t('fieldClose')} value={close} onChange={setClose} />
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">{t('disclaimer')}</p>
        </div>

        {/* Desktop result panel */}
        <div className="hidden xl:flex xl:w-[400px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
          <ResultCard levels={levels} resultLabel={t('resultLabel')} />
          <FormulaChips
            kicker={t('calcKicker')}
            formula={FORMULA_KEYS[method].formula}
            desc={FORMULA_KEYS[method].desc}
          />
        </div>
      </div>

      {/* Mobile result panel */}
      <div className="mt-5 flex flex-col gap-4 xl:hidden">
        <ResultCard levels={levels} resultLabel={t('resultLabel')} />
        <FormulaChips
          kicker={t('calcKicker')}
          formula={FORMULA_KEYS[method].formula}
          desc={FORMULA_KEYS[method].desc}
        />
      </div>
    </div>
  );
}
