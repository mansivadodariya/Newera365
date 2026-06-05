'use client';

import { Pulse, HeroSkeleton, CardGridSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

export function TradePageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={2} />
      <CardGridSkeleton cols={1} cards={3} />
      {/* Feature matrix / comparison table placeholder */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-28" />
          <Pulse className="mb-5 h-7 w-1/2" />
          <div className="overflow-hidden rounded-[18px] bg-[#f2f2f7] dark:bg-[#0f0f14]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-[14px]">
                <Pulse className="h-4 w-1/3" />
                <div className="flex gap-8">
                  {[...Array(3)].map((_, j) => (
                    <Pulse key={j} className="h-4 w-5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CtaBannerSkeleton />
    </div>
  );
}
