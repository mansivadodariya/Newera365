'use client';

import { usePathname } from 'next/navigation';
import { CtaBanner } from './CtaBanner';

// Pages that manage their own CTA or don't need the generic trading CTA.
// Shared with StickyCtaBar so both floating CTAs suppress on the same routes.
export const NO_CTA_SUFFIXES = ['/ai-crm', '/newsletter'];

export function SmartCtaBanner() {
  const pathname = usePathname();
  if (NO_CTA_SUFFIXES.some((s) => pathname.endsWith(s))) return null;
  return <CtaBanner />;
}
