'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors AwardsPage: hero, year + category filter pill rows, gradient award
// cards (1-col mobile / 3-col xl), a 3-up stats strip, and the dark CTA.
export function AwardsPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-4 h-[38px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Filter tabs — year + category */}
      <div className="px-5 pb-6">
        <div className={`${WRAP} flex flex-col gap-3`}>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-[34px] w-[60px] rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Pulse key={i} className="h-[34px] w-[88px] rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Award cards */}
      <div className="px-5 pb-10">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[14px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-3 xl:gap-[18px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-[22px] bg-[#f2f2f4] dark:bg-[#16181d]"
            >
              <Pulse className="h-[150px] w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-5 w-4/5" />
                <Pulse className="h-3 w-full" />
                <Pulse className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[18px] bg-[#e5e7eb] dark:bg-[#1a1c22]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 bg-[#fafaf9] p-5 dark:bg-[#0f0f14]"
              >
                <Pulse className="h-8 w-12" />
                <Pulse className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — page's own dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className={`${WRAP} flex flex-col items-center gap-4`}>
          <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 mt-2 h-[49px] w-[200px] animate-pulse rounded-full" />
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
