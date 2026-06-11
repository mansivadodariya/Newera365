'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors PromoPage: hero, responsive promo-card grid (offer-ends badge, tag row,
// big value, title, desc, footer + claim), and the dark "full terms" band.
export function PromoPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9 xl:px-[120px] xl:pb-10 xl:pt-12">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-[40px] w-3/5 xl:h-[56px]" />
          <Pulse className="mb-4 h-[40px] w-1/2 xl:h-[56px]" />
          <Pulse className="h-4 w-[300px] max-w-full xl:w-[520px]" />
        </div>
      </div>

      {/* Promo cards */}
      <div className="px-5 pb-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-surface flex flex-col rounded-[22px] p-5 dark:bg-[#111]">
                {/* offer-ends badge */}
                <div className="mb-3 flex items-center gap-2">
                  <Pulse className="h-1.5 w-1.5 rounded-full" />
                  <Pulse className="h-3 w-24" />
                </div>
                {/* tag row */}
                <div className="mb-3 flex items-center justify-between">
                  <Pulse className="h-5 w-12 rounded-full" />
                  <Pulse className="h-5 w-14 rounded-full" />
                </div>
                <Pulse className="mb-2 h-9 w-2/3" />
                <Pulse className="mb-2 h-5 w-1/2" />
                <Pulse className="mb-1 h-3 w-full" />
                <Pulse className="mb-4 h-3 w-4/5" />
                <div className="mb-4 h-px bg-[#e5e7eb] dark:bg-[#1a1c22]" />
                <div className="flex items-center justify-between">
                  <Pulse className="h-3 w-28" />
                  <Pulse className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-terms dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-white/15" />
          <div className="mb-3 h-7 w-3/5 animate-pulse rounded bg-white/15 xl:h-9" />
          <div className="mb-2 h-3 w-full max-w-[520px] animate-pulse rounded bg-white/10" />
          <div className="mb-7 h-3 w-3/4 max-w-[440px] animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 h-[50px] w-full animate-pulse rounded-full xl:w-[260px]" />
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
