'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors GuidesPage: hero, a large dark featured-guide card, the all-guides
// list, and the dark CTA.
export function GuidesSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-4 h-[40px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Featured guide — large dark card */}
      <div className="px-5 pb-6">
        <div className={WRAP}>
          <div className="overflow-hidden rounded-[22px] bg-[#111111] p-6">
            <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
            <div className="mt-3 h-7 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
            </div>
            <div className="bg-accent/40 mt-5 h-[42px] w-[140px] animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* All guides list */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2 xl:gap-[14px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex items-center gap-4 rounded-[18px] p-4 dark:bg-[#16181d]"
              >
                <Pulse className="h-11 w-11 flex-shrink-0 rounded-[14px]" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-3/4" />
                  <Pulse className="h-3 w-1/2" />
                </div>
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
