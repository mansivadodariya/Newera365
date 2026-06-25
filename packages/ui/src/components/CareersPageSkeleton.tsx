'use client';

import { Pulse, HeroSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors CareersPage: hero, stat cards (2-col / 4-col), values cards,
// department tab row + job listing rows, and the dark CTA.
export function CareersPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />

      {/* Stats */}
      <div className="px-5 pb-8">
        <div className={WRAP}>
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-[18px] p-5 dark:bg-[#16181d]">
                <Pulse className="mb-2 h-8 w-2/3" />
                <Pulse className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="px-5 pb-8">
        <div className={WRAP}>
          <Pulse className="mb-5 h-7 w-1/2 xl:w-1/3" />
          <div className="grid grid-cols-2 gap-[10px] xl:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex flex-col gap-2 rounded-[18px] p-4 dark:bg-[#16181d]"
              >
                <Pulse className="h-9 w-9 rounded-[12px]" />
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open roles — department tabs + job list */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <Pulse className="mb-5 h-7 w-2/5 xl:w-1/4" />
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-[36px] w-[96px] flex-shrink-0 rounded-full" />
            ))}
          </div>
          <div className="flex flex-col gap-[10px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex items-center justify-between rounded-[16px] px-4 py-4 dark:bg-[#16181d]"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-40" />
                  <Pulse className="h-3 w-28" />
                </div>
                <Pulse className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — page's own dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
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
