'use client';

import { Pulse, HeroSkeleton, StatsGridSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

export function CompanyPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />
      <StatsGridSkeleton />
      {/* Content section — values / team / awards grid */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-3 w-24" />
          <Pulse className="mb-6 h-8 w-1/2" />
          <div className="grid grid-cols-2 gap-[10px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[18px] bg-[#f2f2f4] p-4 dark:bg-[#111]">
                <Pulse className="mb-2 h-5 w-4/5" />
                <Pulse className="h-3 w-full" />
                <Pulse className="mt-1 h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Jobs / awards / press listing */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-7 w-36" />
          <div className="flex flex-col gap-[10px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[16px] bg-[#f2f2f4] px-4 py-4 dark:bg-[#111]"
              >
                <div className="space-y-1">
                  <Pulse className="h-4 w-40" />
                  <Pulse className="h-3 w-24" />
                </div>
                <Pulse className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <CtaBannerSkeleton />
    </div>
  );
}
