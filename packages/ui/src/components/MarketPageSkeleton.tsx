'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors MarketCategoryPage: hero, a large TradingView chart/heatmap block
// with a period selector + a dark instrument watchlist, a dark specs band, and
// the "other markets" grid.
export function MarketPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-7 pt-9">
        <div className={`${WRAP} flex flex-col gap-3`}>
          <Pulse className="h-[40px] w-2/3" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Chart + watchlist */}
      <div className="px-5 pb-6">
        <div className={WRAP}>
          {/* Chart / heatmap block */}
          <div className="mb-3 overflow-hidden rounded-[20px] bg-[#07090D] xl:rounded-[24px]">
            {/* Period selector pills */}
            <div className="flex gap-2 px-4 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-9 animate-pulse rounded-[6px] bg-white/10" />
              ))}
            </div>
            <div className="m-4 h-[300px] animate-pulse rounded-[14px] bg-white/[0.05]" />
          </div>

          {/* Dark watchlist */}
          <div className="overflow-hidden rounded-[20px] bg-[#111111] xl:rounded-[24px]">
            <div className="grid grid-cols-[1fr_64px_64px] border-b border-white/[0.08] px-4 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-2 w-12 animate-pulse rounded bg-white/10" />
              ))}
            </div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_64px_64px] items-center px-4 py-[11px]">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/15" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 animate-pulse rounded bg-white/15" />
                    <div className="h-2 w-24 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
                <div className="h-4 w-10 animate-pulse justify-self-end rounded bg-white/15" />
                <div className="h-4 w-10 animate-pulse justify-self-end rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs dark band */}
      <div className="rounded-t-[32px] bg-[#111111] px-5 pb-10 pt-10">
        <div className={WRAP}>
          <div className="mb-6 h-7 w-1/2 animate-pulse rounded bg-white/15" />
          <div className="mb-5 overflow-hidden rounded-[18px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-[#1f1c1c] px-5 py-[13px] last:border-0"
              >
                <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-20 animate-pulse rounded bg-white/15" />
              </div>
            ))}
          </div>
          <div className="bg-accent/40 h-[48px] w-full animate-pulse rounded-full" />
        </div>
      </div>

      {/* Other markets */}
      <div className="px-5 pb-12 pt-10">
        <div className={WRAP}>
          <Pulse className="mb-6 h-7 w-1/2 xl:w-1/3" />
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex items-center justify-between rounded-[18px] px-5 py-4 dark:bg-[#16181d]"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-24" />
                  <Pulse className="h-3 w-16" />
                </div>
                <Pulse className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
