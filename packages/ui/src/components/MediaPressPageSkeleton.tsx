'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors MediaPressPage: hero, press-coverage list, "featured in" logo strip,
// media-kit card grid, by-the-numbers stats, newsroom list, and the dark CTA.
export function MediaPressPageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-4 h-[38px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Press coverage list */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <Pulse className="mb-6 h-6 w-1/2 xl:w-1/3" />
          <div className="flex flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 border-b border-[#e5e7eb] py-5 dark:border-[#1a1c22]"
              >
                <Pulse className="h-3 w-24" />
                <Pulse className="h-5 w-5/6" />
                <Pulse className="h-3 w-full" />
                <Pulse className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured-in logo strip */}
      <div className="border-y border-[#e5e7eb] px-5 py-6 dark:border-[#1a1c22]">
        <div className={`${WRAP} flex flex-wrap items-center justify-center gap-6`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-6 w-24" />
          ))}
        </div>
      </div>

      {/* Media kit */}
      <div className="rounded-[32px] bg-[#f2f2f7] px-5 pb-9 pt-10 dark:bg-[#0f0f14]">
        <div className={WRAP}>
          <Pulse className="mb-6 h-6 w-2/5 xl:w-1/4" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex flex-col gap-3 rounded-[18px] p-4 dark:bg-[#16181d]"
              >
                <Pulse className="h-10 w-10 rounded-[12px]" />
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By the numbers */}
      <div className="px-5 py-10">
        <div className={WRAP}>
          <div className="grid grid-cols-3 gap-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Pulse className="h-9 w-16" />
                <Pulse className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsroom list */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <Pulse className="mb-6 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-[10px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex items-center justify-between rounded-[16px] px-4 py-4 dark:bg-[#16181d]"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-44" />
                  <Pulse className="h-3 w-24" />
                </div>
                <Pulse className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media inquiries — centered card */}
      <div className="px-5 pb-12">
        <div className={WRAP}>
          <div className="rounded-[22px] bg-[#f2f2f7] px-6 py-8 text-center dark:bg-[#0f0f14]">
            <Pulse className="mx-auto mb-3 h-6 w-1/2" />
            <Pulse className="mx-auto mb-2 h-3 w-3/4" />
            <Pulse className="mx-auto h-9 w-[160px] rounded-full" />
          </div>
        </div>
      </div>

      {/* CTA — page's own dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className={`${WRAP} flex flex-col items-center gap-4`}>
          <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 mt-2 h-[49px] w-[200px] animate-pulse rounded-full" />
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
