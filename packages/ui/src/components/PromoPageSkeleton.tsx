'use client';

import { Pulse, DarkPulse, CtaBannerSkeleton } from './SkeletonBlocks';

export function PromoPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9 xl:px-[120px] xl:pb-10 xl:pt-14">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <Pulse className="mb-3 h-[40px] w-3/5 xl:h-[48px]" />
          <Pulse className="mb-4 h-[40px] w-1/2 xl:h-[48px]" />
          <Pulse className="h-4 w-[300px] max-w-full xl:w-[520px]" />
        </div>
      </div>

      {/* Promo cards — single column, stacked */}
      <div className="px-5 pb-10 xl:px-[120px]">
        <div className="mx-auto flex max-w-[390px] flex-col gap-3.5 xl:max-w-[1200px]">
          {/* Highlighted card skeleton (dark) */}
          <div className="rounded-[20px] bg-[#111] p-6">
            <div className="mb-3.5 flex items-center gap-1.5">
              <DarkPulse className="h-1.5 w-1.5 rounded-full" />
              <DarkPulse className="h-3 w-24" />
            </div>
            <div className="mb-5 flex items-center justify-between">
              <DarkPulse className="h-5 w-12 rounded-full" />
              <DarkPulse className="h-3 w-14" />
            </div>
            <DarkPulse className="mb-2 h-9 w-2/5" />
            <DarkPulse className="mb-2.5 h-5 w-1/3" />
            <DarkPulse className="mb-1 h-3 w-full" />
            <DarkPulse className="mb-5 h-3 w-3/4" />
            <div className="flex items-center justify-between pt-3.5">
              <DarkPulse className="h-3 w-40" />
              <DarkPulse className="h-10 w-20 rounded-[10px]" />
            </div>
          </div>

          {/* 4 regular card skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dark:bg-surface rounded-[20px] bg-[#f2f2f2] p-6">
              <div className="mb-3.5 flex items-center gap-1.5">
                <Pulse className="h-1.5 w-1.5 rounded-full" />
                <Pulse className="h-3 w-28" />
              </div>
              <div className="mb-5 flex items-center justify-between">
                <Pulse className="h-5 w-16 rounded-full" />
                <Pulse className="h-3 w-14" />
              </div>
              <Pulse className="mb-2 h-9 w-1/3" />
              <Pulse className="mb-2.5 h-5 w-2/5" />
              <Pulse className="mb-1 h-3 w-full" />
              <Pulse className="mb-5 h-3 w-4/5" />
              <div className="flex items-center justify-between pt-3.5">
                <Pulse className="h-3 w-32" />
                <Pulse className="h-10 w-20 rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-terms dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-14 pt-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-white/15" />
          <div className="mb-3 h-7 w-3/5 animate-pulse rounded bg-white/15 xl:h-8" />
          <div className="mb-2 h-3 w-full max-w-[520px] animate-pulse rounded bg-white/10" />
          <div className="mb-5 h-3 w-3/4 max-w-[440px] animate-pulse rounded bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="bg-accent/40 h-[48px] w-[220px] animate-pulse rounded-[10px]" />
            <div className="hidden h-[48px] w-[160px] animate-pulse rounded-[10px] bg-white/10 xl:block" />
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
