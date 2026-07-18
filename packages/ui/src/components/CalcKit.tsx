'use client';

import type { ReactNode } from 'react';
import { Spotlight } from './Spotlight';

/**
 * Shared primitives for the /tools calculator suite so all six tabs speak the
 * same "terminal read-out" language (DESIGN.md §8: interactive cards are
 * terminal panels with formula chips and live results). One source of truth
 * for inputs, formula chips, result-panel chrome and level rows.
 */

/** Dark terminal panel chrome shared by every calculator result card. */
export const RESULT_PANEL_CLASS =
  'shadow-card-dark overflow-hidden rounded-[18px] border border-transparent bg-[#111111] dark:border-white/[0.08]';

/** The terminal read-out surface: panel chrome + the cursor-tracked signal
    glow every ink surface carries (DESIGN.md §4, sections answer the cursor). */
export function ResultPanel({ children }: { children: ReactNode }) {
  return (
    <Spotlight size={300} className={RESULT_PANEL_CLASS}>
      {children}
    </Spotlight>
  );
}

/** Light tab-well chrome (brand-tinted, never neutral gray). */
export const TAB_WELL_CLASS =
  'flex rounded-[14px] bg-[#EDF2EF] p-1 dark:bg-[#1a1c22] border border-transparent dark:border-white/[0.06]';

export function NumberInput({
  label,
  value,
  onChange,
  step = '0.0001',
  min,
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
        dir="ltr"
        onChange={(e) => onChange(e.target.value)}
        className="border-border w-full rounded-[12px] border bg-white px-4 py-3 text-start font-mono text-[14px] tabular-nums text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgba(0,176,80,0.12)] dark:border-white/10 dark:bg-[#1a1c22] dark:text-white"
      />
    </div>
  );
}

/** Formula rendered as discrete mono "chips" (each whitespace-separated token
    a small bordered pill) so it reads like a terminal expression. */
export function FormulaChips({
  kicker,
  formula,
  desc,
}: {
  kicker: string;
  formula: string;
  desc: string;
}) {
  const tokens = formula.split(/\s+/).filter(Boolean);
  return (
    <div className="rounded-[14px] bg-[#F0F4F1] p-4 dark:bg-[#1a1c22]">
      <p className="text-muted mb-2.5 font-mono text-[10px] uppercase tracking-[0.1em]">{kicker}</p>
      <div dir="ltr" className="flex flex-wrap items-center gap-1.5">
        {tokens.map((tok, i) => (
          <span
            key={`${tok}-${i}`}
            className="border-border text-foreground inline-flex items-center rounded-[7px] border bg-white px-2 py-[3px] font-mono text-[11px] tabular-nums dark:border-white/10 dark:bg-[#111]"
          >
            {tok}
          </span>
        ))}
      </div>
      <p className="font-body text-muted mt-2.5 text-[12px] leading-[1.6]">{desc}</p>
    </div>
  );
}

export type LevelTone = 'accent' | 'up' | 'down' | 'muted' | 'default';

const TONE_CLASS: Record<LevelTone, string> = {
  accent: 'text-accent-bright',
  up: 'text-[#26A69A]',
  down: 'text-[#EF5350]',
  muted: 'text-white/35',
  default: 'text-white/60',
};

/** One price level inside a terminal result panel: mono label, tabular price,
    hairline rule; a whisper of row highlight while scanning. */
export function LevelRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: LevelTone;
}) {
  return (
    <div className="-mx-2 flex items-center justify-between rounded-[7px] border-b border-white/5 px-2 py-2 transition-colors last:border-0 hover:bg-accent/[0.06]">
      <span
        className={`font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${TONE_CLASS[tone]}`}
      >
        {label}
      </span>
      <span dir="ltr" className="font-mono text-[13px] font-medium tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}
