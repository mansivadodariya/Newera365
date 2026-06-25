'use client';

import { Pulse, HeroSkeleton, DarkCtaSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors EconomicCalendarPage: hero, impact + currency filter chips, a list of
// event rows (time · event · impact dots), then the dark CTA + route banner.
export function CalendarSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={0} />

      {/* Filter chip groups */}
      <div className="px-5 pb-4">
        <div className="mx-auto flex max-w-[390px] flex-col gap-3 md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Pulse key={i} className="h-[32px] w-[70px] rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Pulse key={i} className="h-[28px] w-[52px] rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Event rows */}
      <div className="px-5 pb-12">
        <div className="mx-auto flex max-w-[390px] flex-col md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[#ebebea] py-4 dark:border-white/[0.07]"
            >
              <Pulse className="h-3 w-12 flex-shrink-0" />
              <Pulse className="h-6 w-9 flex-shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-3 w-1/3" />
              </div>
              <div className="flex flex-shrink-0 gap-1">
                {Array.from({ length: 3 }).map((_, d) => (
                  <Pulse key={d} className="h-2 w-2 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DarkCtaSkeleton />
      <CtaBannerSkeleton />
    </div>
  );
}
