'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates the numeric part of a stat string (e.g. "180k", "12+", "99.99%",
 * "< 12 ms") from 0 to its final value when scrolled into view. Non-numeric
 * prefix/suffix are preserved verbatim, so localized values keep their units.
 * Falls back to the static value when no number is present or the user
 * prefers reduced motion.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (!match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const numStr = match[1] ?? match[0];
    const target = parseFloat(numStr);
    const decimalPart = numStr.split('.')[1];
    const decimals = decimalPart ? decimalPart.length : 0;
    const prefix = value.slice(0, match.index ?? 0);
    const suffix = value.slice((match.index ?? 0) + numStr.length);
    let frame = 0;
    let started = false;

    // Hold at 0 until visible so the count-up is seen, not missed.
    setDisplay(`${prefix}${(0).toFixed(decimals)}${suffix}`);

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started) {
          started = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}
