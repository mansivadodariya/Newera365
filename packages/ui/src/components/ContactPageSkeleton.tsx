'use client';

import { Pulse, HeroSkeleton, FormSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors ContactPage: hero, three channel cards (Email/Call/Chat), department
// form, a dark (bg-black) offices/three-cities band, then the route CtaBanner.
export function ContactPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={0} />

      {/* Channel cards */}
      <div className="px-5 pb-8">
        <div className="mx-auto grid max-w-[390px] grid-cols-1 gap-3 md:max-w-2xl xl:max-w-[1200px] xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] bg-[#f2f2f4] p-5 dark:bg-[#111]">
              <Pulse className="mb-3 h-10 w-10 rounded-full" />
              <Pulse className="mb-2 h-4 w-1/2" />
              <Pulse className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Department form */}
      <FormSkeleton fields={4} />

      {/* Offices — dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className={WRAP}>
          <div className="mb-7 h-7 w-2/3 animate-pulse rounded bg-white/10 xl:w-1/2" />
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-[14px] rounded-[18px] bg-white/[0.04] p-5"
              >
                <div className="h-[44px] w-[44px] flex-shrink-0 animate-pulse rounded-[14px] bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
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
