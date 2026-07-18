'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalcSelect } from './CalcSelect';
import { FormulaChips, LevelRow, NumberInput, ResultPanel, type LevelTone } from './CalcKit';

type FibDirection = 'Uptrend' | 'Downtrend';

interface FibLevel {
  label: string;
  ratio: number;
  price: number;
  type: 'retracement' | 'extension';
  tone: LevelTone;
}

/* The golden-ratio zone (38.2 / 50 / 61.8 retracement, 161.8 extension) is
   what traders actually watch — those rows carry the signal color; the 0/100
   anchors stay muted. Terminal palette only, no rainbow. */
const RETRACEMENT_RATIOS: { label: string; ratio: number; tone: LevelTone }[] = [
  { label: '0.0%', ratio: 0, tone: 'muted' },
  { label: '23.6%', ratio: 0.236, tone: 'default' },
  { label: '38.2%', ratio: 0.382, tone: 'accent' },
  { label: '50.0%', ratio: 0.5, tone: 'accent' },
  { label: '61.8%', ratio: 0.618, tone: 'accent' },
  { label: '78.6%', ratio: 0.786, tone: 'default' },
  { label: '100.0%', ratio: 1, tone: 'muted' },
];

const EXTENSION_RATIOS: { label: string; ratio: number; tone: LevelTone }[] = [
  { label: '127.2%', ratio: 1.272, tone: 'default' },
  { label: '161.8%', ratio: 1.618, tone: 'accent' },
  { label: '200.0%', ratio: 2.0, tone: 'default' },
  { label: '261.8%', ratio: 2.618, tone: 'default' },
];

function computeFibLevels(
  swingHigh: number,
  swingLow: number,
  direction: FibDirection,
): FibLevel[] {
  const range = swingHigh - swingLow;
  const levels: FibLevel[] = [];

  RETRACEMENT_RATIOS.forEach(({ label, ratio, tone }) => {
    const price = direction === 'Uptrend' ? swingHigh - ratio * range : swingLow + ratio * range;
    levels.push({ label, ratio, price, type: 'retracement', tone });
  });

  EXTENSION_RATIOS.forEach(({ label, ratio, tone }) => {
    const price = direction === 'Uptrend' ? swingLow + ratio * range : swingHigh - ratio * range;
    levels.push({ label, ratio, price, type: 'extension', tone });
  });

  return levels;
}

function ResultCard({
  levels,
  retracementLabel,
  extensionLabel,
}: {
  levels: FibLevel[];
  retracementLabel: string;
  extensionLabel: string;
}) {
  const retracements = levels.filter((l) => l.type === 'retracement');
  const extensions = levels.filter((l) => l.type === 'extension');

  return (
    <ResultPanel>
      <div className="px-5 pb-3 pt-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          {retracementLabel}
        </p>
        <div className="flex flex-col">
          {retracements.map((lvl) => (
            <LevelRow
              key={lvl.label}
              label={lvl.label}
              value={lvl.price.toFixed(4)}
              tone={lvl.tone}
            />
          ))}
        </div>
      </div>

      <div className="mx-5 border-t border-white/10" />

      <div className="px-5 pb-5 pt-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          {extensionLabel}
        </p>
        <div className="flex flex-col">
          {extensions.map((lvl) => (
            <LevelRow
              key={lvl.label}
              label={lvl.label}
              value={lvl.price.toFixed(4)}
              tone={lvl.tone}
            />
          ))}
        </div>
      </div>
    </ResultPanel>
  );
}

export function FibonacciCalculator() {
  const t = useTranslations('fibonacci');

  const [swingHigh, setSwingHigh] = useState('1.1050');
  const [swingLow, setSwingLow] = useState('1.0800');
  const [direction, setDirection] = useState<FibDirection>('Uptrend');

  // Live recompute on every valid input; hold the last valid read-out while
  // the user is mid-edit (H <= L or an empty field never blanks the panel).
  const computed = useMemo(() => {
    const H = parseFloat(swingHigh);
    const L = parseFloat(swingLow);
    if (isNaN(H) || isNaN(L) || H <= L) return null;
    return computeFibLevels(H, L, direction);
  }, [swingHigh, swingLow, direction]);
  const lastValid = useRef(computed ?? computeFibLevels(1.105, 1.08, 'Uptrend'));
  if (computed) lastValid.current = computed;
  const levels = computed ?? lastValid.current;

  return (
    <div>
      <div className="xl:flex xl:gap-8">
        <div className="xl:flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CalcSelect
              label={t('fieldTrend')}
              value={direction}
              options={['Uptrend', 'Downtrend']}
              labels={[t('trendUp'), t('trendDown')]}
              onChange={(v) => setDirection(v as FibDirection)}
            />
            <NumberInput label={t('fieldHigh')} value={swingHigh} onChange={setSwingHigh} />
            <NumberInput label={t('fieldLow')} value={swingLow} onChange={setSwingLow} />
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">{t('disclaimer')}</p>
        </div>

        {/* Desktop result panel */}
        <div className="hidden xl:flex xl:w-[400px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
          <ResultCard
            levels={levels}
            retracementLabel={t('retracementLabel')}
            extensionLabel={t('extensionLabel')}
          />
          <FormulaChips kicker={t('calcKicker')} formula={t('calcFormula')} desc={t('calcDesc')} />
        </div>
      </div>

      {/* Mobile result panel */}
      <div className="mt-5 flex flex-col gap-4 xl:hidden">
        <ResultCard
          levels={levels}
          retracementLabel={t('retracementLabel')}
          extensionLabel={t('extensionLabel')}
        />
        <FormulaChips kicker={t('calcKicker')} formula={t('calcFormula')} desc={t('calcDesc')} />
      </div>
    </div>
  );
}
