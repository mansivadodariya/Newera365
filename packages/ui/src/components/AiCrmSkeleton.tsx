'use client';

import { Pulse } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors AiCrmPage: light hero (copy + dark dashboard mockup with a 3-up stat
// strip), a "what it does" feature grid, an "automation" grid, and a dark CTA.
// The /ai-crm route renders no route-level CtaBanner, so this ends at the CTA.
export function AiCrmSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero — copy + dashboard mockup */}
      <div className="px-5 pb-10 pt-9 xl:px-[80px] xl:py-16">
        <div className={`${WRAP} xl:grid xl:grid-cols-2 xl:items-center xl:gap-16`}>
          <div>
            <Pulse className="mb-3 h-3 w-20" />
            <Pulse className="mb-2 h-[40px] w-4/5" />
            <Pulse className="mb-4 h-[40px] w-3/5" />
            <Pulse className="mb-6 h-4 w-[280px] max-w-full" />
            <div className="flex gap-[10px]">
              <Pulse className="h-[52px] w-[160px] rounded-full" />
              <Pulse className="h-[52px] w-[120px] rounded-full" />
            </div>
          </div>
          {/* Dark dashboard mockup */}
          <div className="mt-8 overflow-hidden rounded-[22px] bg-[#0d0f14] xl:mt-0">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="mb-1 h-6 w-12 animate-pulse rounded bg-white/15" />
                  <div className="h-2 w-14 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>
            <div className="space-y-2 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/[0.07]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.07]" />
            </div>
          </div>
        </div>
      </div>

      {/* What it does — feature cards */}
      <div className="bg-white px-5 py-12 xl:px-[80px] xl:py-20 dark:bg-[#111316]">
        <div className={WRAP}>
          <Pulse className="mb-10 h-8 w-2/3 xl:w-1/2" />
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3 xl:gap-[12px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[18px] bg-[#f2f2f4] p-5 dark:bg-[#1a1c22]">
                <Pulse className="mb-3 h-10 w-10 rounded-[12px]" />
                <Pulse className="mb-2 h-4 w-2/3" />
                <Pulse className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automation — cards */}
      <div className="bg-white px-5 pb-14 xl:px-[80px] xl:pb-20 dark:bg-[#111316]">
        <div className={WRAP}>
          <Pulse className="mb-10 h-8 w-2/3 xl:w-1/2" />
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2 xl:gap-[12px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[18px] bg-[#f2f2f4] p-5 dark:bg-[#1a1c22]"
              >
                <Pulse className="h-10 w-10 flex-shrink-0 rounded-[12px]" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-2/3" />
                  <Pulse className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — page's own dark band */}
      <div className="overflow-hidden rounded-t-[32px] bg-[#111] px-6 py-10 text-center xl:px-[80px]">
        <div className={`${WRAP} flex flex-col items-center gap-4`}>
          <div className="h-7 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 mt-2 h-[49px] w-[200px] animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
