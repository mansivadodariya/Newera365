'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors IBPage: 2-col hero (copy + earnings card), 3 program cards, step cards,
// and the dark CTA section.
export function IBPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-2 xl:items-center xl:gap-14">
          <div>
            <Pulse className="mb-3 h-[42px] w-3/4 xl:h-[56px]" />
            <Pulse className="mb-4 h-[42px] w-1/2 xl:h-[56px]" />
            <Pulse className="mb-6 h-4 w-[300px] max-w-full xl:w-[440px]" />
            <div className="flex gap-[10px]">
              <Pulse className="h-[52px] w-[150px] rounded-full" />
              <Pulse className="h-[52px] w-[130px] rounded-full" />
            </div>
          </div>
          {/* Earnings card */}
          <div className="mt-6 rounded-[22px] bg-[#f4f4f3] p-[22px] xl:mt-0 dark:bg-[#111]">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-8 w-28" />
              </div>
              <Pulse className="h-7 w-14 rounded-full" />
            </div>
            <div className="mt-[18px] flex h-[60px] items-end gap-[6px]">
              {[39, 51, 60, 54, 77, 85, 100].map((h, i) => (
                <Pulse key={i} className="flex-1" style={{ height: `${h * 0.6}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="rounded-t-[32px] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-28" />
          <Pulse className="mb-6 h-8 w-1/2 xl:h-9" />
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex flex-col gap-3 rounded-[22px] p-[22px] dark:bg-[#111]"
              >
                <div className="flex items-center justify-between">
                  <Pulse className="h-6 w-32" />
                  <Pulse className="h-6 w-20 rounded-full" />
                </div>
                <Pulse className="h-3 w-full" />
                <Pulse className="h-3 w-4/5" />
                <div className="flex gap-px overflow-hidden rounded-[12px] bg-[#e5e7eb] dark:bg-[#1a1c22]">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-surface flex flex-1 flex-col gap-2 px-[10px] py-3 dark:bg-[#111]"
                    >
                      <Pulse className="h-2 w-10" />
                      <Pulse className="h-4 w-14" />
                    </div>
                  ))}
                </div>
                <Pulse className="mt-1 h-[46px] w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-[32px] bg-[#f2f2f2] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16 dark:bg-[#0d0f14]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-28" />
          <Pulse className="mb-8 h-8 w-1/2 xl:h-9" />
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[18px] bg-white p-[18px] dark:bg-[#111]"
              >
                <Pulse className="h-7 w-[38px] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-1/3" />
                  <Pulse className="h-3 w-full" />
                  <Pulse className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA dark */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-11 xl:pb-16 xl:pt-16">
        <div className="mx-auto flex max-w-[390px] flex-col items-center gap-3 md:max-w-2xl xl:max-w-[1200px]">
          <div className="h-8 w-2/3 animate-pulse rounded bg-white/15 xl:h-11" />
          <div className="h-4 w-3/4 max-w-[400px] animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 mt-2 h-[52px] w-full animate-pulse rounded-full xl:w-[220px]" />
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
