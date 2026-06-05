'use client';

import { Pulse, HeroSkeleton, TabRowSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

export function ToolsPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />
      <TabRowSkeleton tabs={3} />
      {/* Calculator / tool panel */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Input fields */}
          <div className="mb-4 flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Pulse className="h-3 w-28" />
                <Pulse className="h-[46px] rounded-[14px]" />
              </div>
            ))}
          </div>
          {/* Result panel */}
          <div className="overflow-hidden rounded-[20px] bg-[#111] p-[22px]">
            <Pulse className="mb-1 h-3 w-28 bg-white/20" />
            <div className="h-[52px] w-1/2 animate-pulse rounded bg-white/30" />
            <div className="mt-4 grid grid-cols-3 gap-px rounded-[12px] bg-white/10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1 bg-[#111] px-3 py-3">
                  <div className="h-2 w-12 animate-pulse rounded bg-white/20" />
                  <div className="h-4 w-16 animate-pulse rounded bg-white/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* More tools grid */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-3 w-24" />
          <div className="grid grid-cols-2 gap-[14px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[18px] bg-[#f2f2f4] p-4 dark:bg-[#111]">
                <Pulse className="mb-2 h-5 w-4/5" />
                <Pulse className="h-3 w-full" />
                <Pulse className="mt-3 h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <CtaBannerSkeleton />
    </div>
  );
}
