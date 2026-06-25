'use client';

import { Pulse, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors WebinarsPage: hero, "upcoming" webinar cards (row layout with a
// register button), and a "past / replay" list of compact rows.
export function WebinarsSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Hero */}
      <div className="px-5 pb-8 pt-9">
        <div className={WRAP}>
          <Pulse className="mb-4 h-[38px] w-3/4 xl:w-1/2" />
          <Pulse className="h-4 w-[300px] max-w-full" />
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-5 pb-8">
        <div className={WRAP}>
          <Pulse className="mb-5 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface flex flex-col gap-4 rounded-[20px] p-5 md:flex-row md:items-center md:justify-between dark:bg-[#16181d]"
              >
                <div className="flex-1 space-y-2">
                  <Pulse className="h-3 w-28" />
                  <Pulse className="h-5 w-3/4" />
                  <Pulse className="h-3 w-2/3" />
                </div>
                <Pulse className="h-[44px] w-full rounded-full md:w-[140px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past / Replay */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <Pulse className="mb-5 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[16px] bg-[#FAFAF9] px-4 py-3 dark:bg-[#16181d]"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-44" />
                  <Pulse className="h-3 w-24" />
                </div>
                <Pulse className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
