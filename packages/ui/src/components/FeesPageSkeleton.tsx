'use client';

import { Pulse, DarkPulse, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors FeesPage: hero, dark spreads table + view-all pill, other-charges list,
// and the closing dark "transparent pricing" band.
export function FeesPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-[40px] w-2/3 xl:h-[56px]" />
          <Pulse className="mb-4 h-[40px] w-1/2 xl:h-[56px]" />
          <Pulse className="h-4 w-[300px] max-w-full xl:w-[460px]" />
        </div>
      </div>

      {/* Spreads table */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-5 h-3 w-28" />
          <div className="overflow-hidden rounded-[18px] bg-black">
            <div className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <DarkPulse key={i} className="h-2 w-10" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-[14px]">
                <DarkPulse className="h-4 w-24" />
                <DarkPulse className="h-4 w-10 justify-self-end" />
                <DarkPulse className="h-4 w-10 justify-self-end" />
                <DarkPulse className="h-4 w-10 justify-self-end" />
              </div>
            ))}
          </div>
          <Pulse className="mt-3 h-[50px] w-full rounded-[14px]" />
        </div>
      </div>

      {/* Other charges */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-5 h-3 w-28" />
          <div className="flex flex-col gap-[10px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex h-[68px] items-center justify-between rounded-[14px] px-4"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-32" />
                  <Pulse className="h-3 w-20" />
                </div>
                <Pulse className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-16 pt-14 xl:px-[120px] xl:pb-20 xl:pt-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 h-3 w-28 animate-pulse rounded bg-white/15" />
          <div className="mb-2 h-7 w-3/5 animate-pulse rounded bg-white/15 xl:h-10" />
          <div className="mb-4 h-7 w-2/5 animate-pulse rounded bg-white/15 xl:h-10" />
          <div className="h-3 w-full max-w-[600px] animate-pulse rounded bg-white/10" />
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
