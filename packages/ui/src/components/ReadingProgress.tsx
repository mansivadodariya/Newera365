'use client';

import { useEffect, useState } from 'react';

/**
 * Thin scroll-progress bar pinned to the very top of the viewport, filling as
 * the reader moves down a long-form article (detail/prose pages). Purely a
 * progress indicator, so it stays active for reduced-motion users; only the
 * smoothing transition is dropped. Fills from the reading start (flips in RTL).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden="true">
      <div
        className="bg-accent h-full origin-left transition-transform duration-75 ease-out motion-reduce:transition-none rtl:origin-right"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
