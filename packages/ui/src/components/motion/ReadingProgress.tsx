'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Thin scroll-progress bar pinned to the very top of the viewport, filling as
 * the reader moves through an article. Pass `targetRef` to track a specific
 * content region (title→end of body) instead of the whole page, so header,
 * related links and the closing CTA band don't count as "reading". Without a
 * ref it falls back to whole-document progress. Purely a progress indicator, so
 * it stays active for reduced-motion users; only the smoothing transition is
 * dropped. Fills from the reading start (flips in RTL).
 */
export function ReadingProgress({
  targetRef,
}: {
  targetRef?: RefObject<HTMLElement | null>;
} = {}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const compute = () => {
      const el = targetRef?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // Scrollable distance within the content region (its height minus one viewport).
        const total = rect.height - vh;
        if (total <= 0) {
          // Content shorter than the viewport: full once its top passes the top of screen.
          setProgress(rect.top <= 0 ? 1 : 0);
          return;
        }
        // rect.top starts positive and goes negative as the region scrolls past the top.
        setProgress(Math.min(1, Math.max(0, -rect.top / total)));
        return;
      }
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [targetRef]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden="true">
      <div
        className="bg-accent h-full origin-left transition-transform duration-75 ease-out motion-reduce:transition-none rtl:origin-right"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
