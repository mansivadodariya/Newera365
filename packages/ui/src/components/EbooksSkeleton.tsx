'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors EbooksPage: hero, ebook cover + gated download form (stacked on
// mobile, side-by-side on xl), "what's inside" list, more-ebooks list, dark CTA.
export function EbooksSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-3 h-[42px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Cover + gate form */}
      <div className="px-5 pb-10">
        <div
          className={`${WRAP} flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:items-start xl:gap-10`}
        >
          {/* Cover */}
          <div className="flex items-center justify-center rounded-[22px] bg-[#f2f2f4] p-8 dark:bg-[#16181d]">
            <Pulse className="h-[260px] w-[180px] rounded-[16px]" />
          </div>
          {/* Gate form */}
          <div className="rounded-[20px] bg-[#fafaf9] p-5 dark:bg-[#16181d]">
            <Pulse className="mb-4 h-5 w-2/3" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Pulse key={i} className="h-[48px] w-full rounded-[12px]" />
              ))}
              <Pulse className="mt-1 h-[52px] w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* What's inside */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <Pulse className="mb-5 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Pulse className="h-6 w-6 flex-shrink-0 rounded-full" />
                <Pulse className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More ebooks */}
      <div className="bg-surface px-5 pb-10 pt-8">
        <div className={WRAP}>
          <Pulse className="mb-5 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-background flex items-center gap-4 rounded-[18px] p-4 dark:bg-[#16181d]"
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
