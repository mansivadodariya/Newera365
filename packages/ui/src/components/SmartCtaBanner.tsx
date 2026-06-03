'use client';

import { usePathname } from 'next/navigation';
import { CtaBanner } from './CtaBanner';

// Pages that manage their own CTA or don't need the generic trading CTA
const NO_CTA_SUFFIXES = ['/tools/ai-crm', '/newsletter', '/live-chat'];

export function SmartCtaBanner() {
  const pathname = usePathname();
  if (NO_CTA_SUFFIXES.some((s) => pathname.endsWith(s))) return null;
  return <CtaBanner />;
}
