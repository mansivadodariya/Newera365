'use client';

import { useState, useRef, useEffect } from 'react';

interface CalcSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  /** Display labels parallel to options — if omitted, the option value is shown. */
  labels?: readonly string[];
  onChange: (v: string) => void;
}

export function CalcSelect({ label, value, options, labels, onChange }: CalcSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const selectedLabel = labels ? (labels[options.indexOf(value)] ?? value) : value;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">{label}</span>
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="border-border font-body text-foreground hover:border-accent/50 flex w-full items-center justify-between rounded-[12px] border bg-white px-4 py-3 text-[14px] transition-colors dark:border-white/10 dark:bg-[#1a1c22]"
        >
          <span>{selectedLabel}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`text-muted flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Panel */}
        {open && (
          <div className="bg-background border-border animate-fade-in absolute left-0 top-full z-50 mt-1.5 w-full overflow-y-auto rounded-[14px] border p-2 shadow-[0px_12px_28px_-4px_rgba(0,0,0,0.12)] [max-height:240px] [scrollbar-width:none] dark:shadow-[0px_12px_28px_-4px_rgba(0,0,0,0.5)] [&::-webkit-scrollbar]:hidden">
            {options.map((o, i) => {
              const displayLabel = labels ? (labels[i] ?? o) : o;
              const isSelected = o === value;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={`font-body hover:bg-surface flex w-full items-center justify-between rounded-[9px] px-3 py-[9px] text-start text-[14px] transition-colors ${
                    isSelected ? 'text-accent font-semibold' : 'text-foreground'
                  }`}
                >
                  {displayLabel}
                  {isSelected && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-accent flex-shrink-0"
                    >
                      <path
                        d="M2 7l4 4 6-7"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
