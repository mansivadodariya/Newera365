'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Re-keys on every route change so the page (and its loading skeleton) fades in
 * smoothly instead of snapping. Uses the shared `fade-in` keyframe.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <main key={pathname} className="animate-fade-in">
      {children}
    </main>
  );
}
