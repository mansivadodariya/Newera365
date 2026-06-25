'use client';

import { HeroSkeleton, CardGridSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors AccountsPage: hero, three account-type cards, and a dark bg-black
// feature-matrix comparison table, then the route CTA banner.
export function TradePageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={2} />
      <CardGridSkeleton cols={1} cards={3} />

      {/* Feature matrix — dark bg-black comparison table */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-6 h-7 w-1/2 animate-pulse rounded bg-white/15" />
          <div className="overflow-hidden rounded-[14px]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_65px_65px_65px] bg-white/[0.04] px-[14px] py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 w-12 animate-pulse rounded bg-white/15" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_65px_65px_65px] items-center border-b border-white/[0.04] px-[14px] py-[12px] last:border-0"
              >
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 w-5 animate-pulse justify-self-center rounded bg-white/10"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
