'use client';

import { Pulse, DarkPulse, HeroSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

export function PlatformPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={2} />
      {/* Terminal selector cards */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-28" />
          <Pulse className="mb-5 h-8 w-2/3" />
          <div className="flex flex-col gap-[14px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[22px] bg-[#f2f2f4] p-[22px] dark:bg-[#111]">
                <Pulse className="mb-2 h-6 w-1/3" />
                <Pulse className="mb-4 h-3 w-3/4" />
                <Pulse className="h-[40px] w-[120px] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Features section */}
      <div className="rounded-[32px] bg-[#f2f2f2] px-5 pb-9 pt-10 dark:bg-[#0d0f14]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-3 w-28" />
          <Pulse className="mb-6 h-8 w-1/2" />
          <div className="grid grid-cols-2 gap-[10px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[16px] bg-white p-4 dark:bg-[#111]">
                <DarkPulse className="mb-2 h-4 w-4/5" />
                <DarkPulse className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <CtaBannerSkeleton />
    </div>
  );
}
