'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors EducationHubPage: hero, category grid (2-col / 3-col), a
// "featured this week" article-row list, and the dark newsletter CTA.
export function EducationHubSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-4 h-[42px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Category grid */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3 xl:gap-[14px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-[18px] border border-[#e8e8e6] p-4 dark:border-[#1a1c22]"
              >
                <Pulse className="h-10 w-10 rounded-[12px]" />
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured this week — article rows */}
      <div className="px-5 pb-10 pt-2">
        <div className={WRAP}>
          <Pulse className="mb-5 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-[#e8e8e6] pb-4 dark:border-[#1a1c22]"
              >
                <Pulse className="h-[64px] w-[64px] flex-shrink-0 rounded-[12px]" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-3 w-20" />
                  <Pulse className="h-4 w-5/6" />
                  <Pulse className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter CTA — page's own dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className={`${WRAP} flex flex-col items-center gap-4`}>
          <div className="h-7 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="mt-2 flex w-full max-w-[420px] gap-2">
            <div className="h-[48px] flex-1 animate-pulse rounded-full bg-white/10" />
            <div className="bg-accent/40 h-[48px] w-[120px] animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
