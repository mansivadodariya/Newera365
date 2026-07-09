'use client';

import type { ReactNode } from 'react';

/* White bordered card on paper; #111 card in dark. Canon: never gray fills. */
const CARD =
  'border-border bg-white shadow-card dark:border-white/[0.06] dark:bg-[#111] dark:shadow-card-dark';

export interface AccordionProps {
  /** Stable id — the row also becomes a scroll/deep-link target. */
  id: string;
  question: string;
  /** String answer (rendered as a paragraph) or custom content. */
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  /** Optional leading chip, e.g. a category badge. */
  badge?: ReactNode;
  className?: string;
}

/**
 * Shared animated accordion row. The panel content stays in the DOM at all times
 * (height animates via `grid-rows-[1fr]`/`[0fr]`), so it is reduced-motion safe
 * and never gates visibility behind motion. Chevron rotates and flips under RTL.
 */
export function Accordion({
  id,
  question,
  answer,
  isOpen,
  onToggle,
  badge,
  className,
}: AccordionProps) {
  return (
    <div
      id={id}
      className={`scroll-mt-24 overflow-hidden rounded-[16px] border transition-colors ${CARD} ${
        isOpen ? 'border-accent/50' : 'hover:border-accent/40'
      } ${className ?? ''}`}
    >
      <button
        id={`${id}-btn`}
        onClick={onToggle}
        className="tap-scale flex w-full items-center gap-[14px] px-5 py-[18px] text-start"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
      >
        {badge}
        <span className="text-foreground text-body flex-1 font-sans font-semibold leading-snug tracking-[-0.15px]">
          {question}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className={`text-muted flex-shrink-0 transition-transform duration-300 motion-reduce:transition-none rtl:-scale-x-100 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* grid-rows 0fr → 1fr height animation; content stays in the DOM (never gated on motion). */}
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-border/70 mx-5 border-t pb-5 pt-4 dark:border-white/[0.06]">
            {typeof answer === 'string' ? (
              <p className="font-body text-muted text-body">{answer}</p>
            ) : (
              answer
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
