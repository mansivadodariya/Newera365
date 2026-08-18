'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Animates the numeric part of a stat string (e.g. "180k", "12+", "99.99%",
 * "$5,000", "< 12 ms") when scrolled into view. Non-numeric prefix/suffix are
 * preserved verbatim, so localized values keep their units. Every value counts
 * up 0 → value over one fixed duration; grouped values keep their commas.
 *
 * The odometer digit-roll (formerly used for values >= 1000) was RETIRED
 * 2026-07-09: its nested per-digit spans do NOT inherit `.text-sheen`'s clipped
 * gradient, so every sheen metric rendered blank (IB stat band showed "$ ,",
 * the newsletter social-proof number vanished, etc.), and the fixed 1em digit
 * windows risked clipping under tight metric line-heights. A single text node
 * paints correctly under sheen and still animates on scroll. The `flat` prop is
 * kept for back-compat and is now the only behaviour.
 *
 * Falls back to the static value when no number is present or the user prefers
 * reduced motion.
 */

const GroupCtx = createContext<boolean | null>(null);

/** One observer for a whole stats block: every CountUp inside starts at the
    same instant (and, sharing one duration, ends at the same instant) instead
    of each card triggering on its own viewport entry. */
export function CountUpGroup({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <GroupCtx.Provider value={started}>
      <div ref={ref}>{children}</div>
    </GroupCtx.Provider>
  );
}

/** Group start flag when inside a CountUpGroup; otherwise self-observe. */
function useStarted(ref: React.RefObject<HTMLElement>) {
  const group = useContext(GroupCtx);
  const [self, setSelf] = useState(false);

  useEffect(() => {
    if (group !== null) return; // group drives the start
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSelf(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSelf(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [group, ref]);

  return group ?? self;
}

export function CountUp({
  value,
  duration = 1400,
  flat,
}: {
  value: string;
  duration?: number;
  /** Accepted for back-compat; the flat single-node render is now the only
      behaviour (the odometer was retired — see the component doc above). */
  flat?: boolean;
}) {
  void flat;
  const ref = useRef<HTMLSpanElement>(null);
  const started = useStarted(ref);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const parsed = useMemo(() => {
    // Grouped numbers ("10,000") must match as a whole — a digits-only pattern
    // would stop at the comma and animate "10" against a frozen ",000" suffix.
    const match = value.match(/(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/);
    // Don't animate "less-than" values like "< 12 ms": counting up from 0 would
    // momentarily display an even lower (better-than-advertised) figure.
    if (!match || value.includes('<')) return null;
    const numStr = match[1] ?? match[0];
    const plainNum = numStr.replace(/,/g, '');
    const decimalPart = plainNum.split('.')[1];
    return {
      numStr,
      target: parseFloat(plainNum),
      hasGrouping: numStr.includes(','),
      decimals: decimalPart ? decimalPart.length : 0,
      prefix: value.slice(0, match.index ?? 0),
      suffix: value.slice((match.index ?? 0) + numStr.length),
    };
  }, [value]);

  const isStatic = parsed === null || reducedMotion !== false;

  useEffect(() => {
    if (isStatic) {
      setDisplay(value);
      return;
    }
    const { target, hasGrouping, decimals, prefix, suffix } = parsed;
    const fmt = (n: number) =>
      hasGrouping ? Math.round(n).toLocaleString('en-US') : n.toFixed(decimals);

    // Hold at 0 until the start signal so the count-up is seen, not missed.
    if (!started) {
      setDisplay(`${prefix}${fmt(0)}${suffix}`);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(`${prefix}${fmt(target * eased)}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isStatic, started, parsed, value, duration]);

  return <span ref={ref}>{display}</span>;
}
