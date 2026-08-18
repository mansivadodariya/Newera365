'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Standardised scroll-reveal wrapper for the homepage sections. Fades + lifts
 * its children into view once on intersection. Mirrors the timing used by
 * MarketsSectionGrid so the whole page shares one motion vocabulary. No-ops
 * under prefers-reduced-motion.
 */
export function RevealDemo({
  children,
  delay = 0,
  y = 20,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.opacity = '0';
    el.style.transform = `translateY(${y}px)`;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
