'use client';

import { useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from 'react';

interface SectionKickerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  uppercase?: boolean;
}

/**
 * Chapter marker: [tick]—[mono eyebrow]. On scroll into view the tick draws in
 * and the eyebrow types itself out behind a signal-green block caret, so every
 * chapter "decodes" the way a terminal prints a header. SSR, no-JS,
 * reduced-motion, non-string children and non-Latin (Arabic) copy all render
 * fully static — progressive reveal would reshape Arabic ligatures mid-word,
 * so RTL keeps the tick draw only. The animation is an enhancement, never a
 * gate on visibility (armed only after JS runs, with an IO bail-out).
 */
function SectionKicker({
  children,
  uppercase = true,
  className = '',
  ...props
}: SectionKickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'static' | 'armed' | 'drawn'>('static');
  const text = typeof children === 'string' && /[A-Za-z]/.test(children) ? children : null;
  // Characters revealed while typing; null until the type-in starts.
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    setPhase('armed');
    // A healthy IO always delivers an initial callback (even off-screen). If
    // none arrives, the observer is broken in this environment: bail to drawn
    // rather than leave the tick hidden forever.
    let sawCallback = false;
    const io = new IntersectionObserver(
      (entries) => {
        sawCallback = true;
        if (entries.some((e) => e.isIntersecting)) {
          setPhase('drawn');
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    const bail = window.setTimeout(() => {
      if (!sawCallback) setPhase('drawn');
    }, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(bail);
    };
  }, []);

  // Terminal type-in, one character per tick, once the tick has drawn.
  useEffect(() => {
    if (phase !== 'drawn' || !text) return;
    setShown(0);
    const step = window.setInterval(() => {
      setShown((n) => {
        const next = (n ?? 0) + 1;
        if (next >= text.length) window.clearInterval(step);
        return next;
      });
    }, 22);
    return () => window.clearInterval(step);
  }, [phase, text]);

  const typing = text !== null && shown !== null && shown < text.length;
  // While armed (pre-view, JS live) hold the line with a nbsp; the bail timer
  // guarantees we always reach 'drawn', so the copy can never stay hidden.
  const eyebrow =
    text !== null && phase !== 'static'
      ? phase === 'armed'
        ? ' '
        : text.slice(0, shown ?? 0) || ' '
      : children;

  return (
    <div
      {...props}
      ref={ref}
      className={['text-accent flex items-center gap-2', className].filter(Boolean).join(' ')}
    >
      <span
        className={`bg-accent block h-px w-[22px] flex-shrink-0 origin-left transition-transform duration-700 ease-out rtl:origin-right ${
          phase === 'armed' ? 'scale-x-0' : 'scale-x-100'
        }`}
      />
      <span
        className={`text-eyebrow font-mono font-medium ${uppercase ? 'uppercase' : ''}`}
        aria-label={text ?? undefined}
      >
        <span aria-hidden={text !== null ? true : undefined}>{eyebrow}</span>
        {typing && (
          <span
            aria-hidden="true"
            className="bg-accent ms-[3px] inline-block h-[0.85em] w-[6px] translate-y-[0.12em]"
          />
        )}
      </span>
    </div>
  );
}

export { SectionKicker };
