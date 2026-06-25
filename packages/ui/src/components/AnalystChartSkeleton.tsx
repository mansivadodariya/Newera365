'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors AnalystChartPage: hero, a large featured chart card (header + chart +
// target), pair filter pills + this-week's-calls list, analyst commentary, CTA.
export function AnalystChartSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-6 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-3 h-[38px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Featured chart card */}
      <div className="px-5 pb-6">
        <div className={WRAP}>
          <div className="overflow-hidden rounded-[22px] bg-[#0d0d0d] p-5">
            {/* Header row */}
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-28 animate-pulse rounded bg-white/15" />
                <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
            {/* Chart area */}
            <div className="h-[280px] w-full animate-pulse rounded-[14px] bg-white/[0.06]" />
            {/* Target */}
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 flex-1 animate-pulse rounded-[12px] bg-white/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pair filter + this week's calls */}
      <div className="px-5 pb-6">
        <div className={WRAP}>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-[34px] w-[76px] flex-shrink-0 rounded-full" />
            ))}
          </div>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex items-center justify-between rounded-[16px] px-4 py-4 dark:bg-[#16181d]"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-24" />
                  <Pulse className="h-3 w-32" />
                </div>
                <Pulse className="h-7 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analyst commentary */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <div className="bg-surface flex gap-4 rounded-[18px] p-5 dark:bg-[#16181d]">
            <Pulse className="h-12 w-12 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-1/3" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-5/6" />
              <Pulse className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA — page's own dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className={`${WRAP} flex flex-col items-center gap-4`}>
          <div className="h-7 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 mt-2 h-[49px] w-[200px] animate-pulse rounded-full" />
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
