'use client';

import { useRef, useEffect, type ReactNode } from 'react';

/** Wraps the stats grid and fades it in with a stagger as it enters the viewport. */
export function StatsSectionClient({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Start invisible
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
