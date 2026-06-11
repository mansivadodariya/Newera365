'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors FundingPage: hero, payment-method card grid (cover banner on desktop /
// icon header on mobile + 2×2 stats), and the dark trust band. Responsive so the
// skeleton occupies the same footprint as the real content (no layout shift).
export function FundingPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-5 pt-9 xl:px-[120px] xl:pb-8 xl:pt-[48px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-[40px] w-4/5 xl:h-[48px]" />
          <Pulse className="mb-4 h-[40px] w-1/2 xl:h-[48px]" />
          <Pulse className="h-4 w-[300px] max-w-full xl:w-[460px]" />
        </div>
      </div>

      {/* Payment methods */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-5 h-3 w-32" />
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-background shadow-card flex flex-col gap-[14px] rounded-[18px] p-5 dark:shadow-none"
              >
                {/* Mobile icon header */}
                <div className="flex items-start justify-between md:hidden">
                  <Pulse className="h-[42px] w-[42px] rounded-[12px]" />
                  <Pulse className="h-6 w-16 rounded-full" />
                </div>
                {/* Desktop cover banner */}
                <Pulse className="hidden h-[110px] w-full rounded-[12px] md:block" />
                <Pulse className="h-5 w-2/3" />
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-[#e5e7eb] dark:bg-[#1a1c22]">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="bg-background flex flex-col gap-[6px] px-3 py-[10px]">
                      <Pulse className="h-2 w-12" />
                      <Pulse className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust dark band */}
      <div className="rounded-t-[32px] bg-black px-5 py-10 xl:px-[120px] xl:py-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-white/15" />
          <div className="mb-[22px] h-7 w-1/2 animate-pulse rounded bg-white/15" />
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2 xl:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-[14px] rounded-[14px] bg-white/[0.04] p-[18px]"
              >
                <div className="h-[37px] w-[37px] flex-shrink-0 animate-pulse rounded-[11px] bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
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
