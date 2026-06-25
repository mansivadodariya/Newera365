'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors MediaListingPage (education/media + education/audio): hero, search,
// category tabs, a large featured episode card, an episode grid, and dark CTA.
export function MediaListingSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-6 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-4 h-[40px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-4">
        <div className={WRAP}>
          <Pulse className="h-[46px] w-full rounded-[16px]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-4">
        <div className={`${WRAP} flex gap-2 overflow-x-auto`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="h-[36px] w-[88px] flex-shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* Featured episode */}
      <div className="px-5 pb-6">
        <div className={WRAP}>
          <div className="overflow-hidden rounded-[22px] bg-[#0d0d0d] xl:flex xl:flex-row">
            <Pulse className="h-[200px] w-full rounded-none xl:w-1/2" />
            <div className="space-y-3 p-5 xl:flex-1">
              <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
              <div className="h-6 w-5/6 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Episode grid */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 overflow-hidden rounded-[16px] bg-[#f2f2f4] p-3 dark:bg-[#16181d]"
              >
                <Pulse className="h-[90px] w-full rounded-[11px]" />
                <Pulse className="h-4 w-5/6" />
                <Pulse className="h-3 w-1/2" />
              </div>
            ))}
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
