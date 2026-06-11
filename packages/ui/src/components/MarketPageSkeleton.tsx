'use client';

import { Pulse, DarkPulse, TabRowSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors InstrumentsPage: hero + search bar, category tabs, dark instrument
// table, dark specs band, and the "other markets" grid.
export function MarketPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero + search */}
      <div className="px-5 pb-7 pt-9">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[14px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="h-[40px] w-2/3" />
          <Pulse className="h-[40px] w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
          <Pulse className="h-[46px] w-full rounded-[16px]" />
        </div>
      </div>

      <TabRowSkeleton tabs={6} />

      {/* Instrument rows */}
      <div className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 flex items-center justify-between">
            <Pulse className="h-3 w-40" />
            <Pulse className="h-3 w-12" />
          </div>
          <Pulse className="mb-3 h-[50px] w-full rounded-[14px]" />
          <div className="overflow-hidden rounded-[20px] bg-[#07090D]">
            <div className="grid grid-cols-[1fr_80px_80px] px-4 py-2 xl:grid-cols-[1fr_120px_120px] xl:px-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <DarkPulse key={i} className="h-2 w-12" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_80px_80px] items-center px-4 py-[11px] xl:grid-cols-[1fr_120px_120px] xl:px-6"
              >
                <div className="flex items-center gap-3">
                  <DarkPulse className="h-1.5 w-1.5 rounded-full" />
                  <div className="space-y-1.5">
                    <DarkPulse className="h-3 w-16" />
                    <DarkPulse className="h-2 w-24" />
                  </div>
                </div>
                <DarkPulse className="h-4 w-10 justify-self-end" />
                <DarkPulse className="h-4 w-10 justify-self-end" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs dark band */}
      <div className="rounded-t-[32px] bg-[#111111] px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-white/15" />
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
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-28" />
          <Pulse className="mb-6 h-7 w-1/2" />
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex items-center justify-between rounded-[18px] px-5 py-4"
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
