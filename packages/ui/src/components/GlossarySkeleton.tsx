'use client';

import { Pulse, HeroSkeleton, DarkCtaSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors GlossaryPage: hero, search bar, category chips, A–Z index chips, a
// list of glossary term rows, then the dark CTA + route banner.
export function GlossarySkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={0} />

      {/* Search */}
      <div className="px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="h-[46px] w-full rounded-[16px]" />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-5 pb-3">
        <div className="mx-auto flex max-w-[390px] gap-1.5 overflow-x-auto md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <Pulse key={i} className="h-[30px] w-[72px] flex-shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* A–Z index chips */}
      <div className="px-5 pb-4">
        <div className="mx-auto flex max-w-[390px] flex-wrap gap-2 md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 14 }).map((_, i) => (
            <Pulse key={i} className="h-[30px] w-[30px] rounded-md" />
          ))}
        </div>
      </div>

      {/* Term list */}
      <div className="px-5 pb-10">
        <div className="mx-auto flex max-w-[390px] flex-col md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border-b border-[#ebebea] py-5 dark:border-white/[0.07]"
            >
              <Pulse className="h-5 w-1/3" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      <DarkCtaSkeleton />
      <CtaBannerSkeleton />
    </div>
  );
}
