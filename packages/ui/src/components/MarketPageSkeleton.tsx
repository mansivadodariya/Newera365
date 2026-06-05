'use client';

import {
  Pulse,
  DarkPulse,
  HeroSkeleton,
  TabRowSkeleton,
  CtaBannerSkeleton,
} from './SkeletonBlocks';

export function MarketPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />
      <TabRowSkeleton tabs={6} />
      {/* Instrument rows */}
      <div className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-40" />
          <div className="overflow-hidden rounded-[20px] bg-[#07090D]">
            <div className="grid grid-cols-[1fr_80px_80px] px-4 py-2">
              {[...Array(3)].map((_, i) => (
                <DarkPulse key={i} className="h-2 w-12" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px] items-center px-4 py-[11px]">
                <DarkPulse className="h-4 w-20" />
                <DarkPulse className="h-4 w-12 justify-self-end" />
                <DarkPulse className="h-4 w-12 justify-self-end" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Spec grid */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-3 w-24" />
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-[16px] bg-[#f2f2f4] px-4 py-4 dark:bg-[#111]">
                <Pulse className="mb-2 h-3 w-20" />
                <Pulse className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <CtaBannerSkeleton />
    </div>
  );
}
