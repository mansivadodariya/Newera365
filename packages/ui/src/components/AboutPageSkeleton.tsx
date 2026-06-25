'use client';

import { Pulse, HeroSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors AboutPage: hero, dark mission-quote band, scroll-coupled journey
// timeline, white team-card grid, explore-links list, and the dark CTA.
export function AboutPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />

      {/* Mission — dark quote band */}
      <div className="rounded-t-[32px] bg-[#111111] px-5 pb-11 pt-11">
        <div className={WRAP}>
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-white/15" />
          <div className="space-y-3">
            <div className="h-6 w-full animate-pulse rounded bg-white/10" />
            <div className="h-6 w-11/12 animate-pulse rounded bg-white/10" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* Journey timeline — rail with year nodes */}
      <div className="px-5 pb-10 pt-10">
        <div className={WRAP}>
          <Pulse className="mb-8 h-7 w-2/3 xl:w-1/3" />
          <div className="flex flex-col gap-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Pulse className="h-3.5 w-3.5 rounded-full" />
                  <div className="mt-1 w-px flex-1 bg-[#e8e8e6] dark:bg-[#1a1c22]" />
                </div>
                <div className="flex-1 space-y-2 pb-2">
                  <Pulse className="h-4 w-16" />
                  <Pulse className="h-5 w-1/2" />
                  <Pulse className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team — gradient section, white cards */}
      <div className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16">
        <div className={WRAP}>
          <Pulse className="mb-8 h-8 w-1/2 xl:w-1/3" />
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-[145px] flex-col gap-[14px] rounded-[18px] bg-white p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-[#16181d]"
              >
                <Pulse className="h-[56px] w-[56px] rounded-[14px]" />
                <div className="space-y-2">
                  <Pulse className="h-4 w-3/4" />
                  <Pulse className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore links */}
      <div className="rounded-t-[32px] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className={WRAP}>
          <Pulse className="mb-8 h-8 w-1/2 xl:w-1/3" />
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-[14px] rounded-[18px] bg-[#fafaf9] px-[18px] py-[18px] dark:bg-[#16181d]"
              >
                <Pulse className="h-10 w-10 rounded-[12px]" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-1/3" />
                  <Pulse className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — page's own dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
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
