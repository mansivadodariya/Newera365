'use client';

import { Pulse, HeroSkeleton, CtaBannerSkeleton } from './SkeletonBlocks';

// Mirrors LegalPage: hero, doc-type pill selector, TOC card, prose sections,
// dark footer-note band, then the route CtaBanner.
export function LegalPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={0} />

      {/* Document selector pills */}
      <div className="px-5 pb-4">
        <div className="mx-auto flex max-w-[390px] gap-2 md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-[32px] w-[90px] flex-shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* Table of contents card */}
      <div className="px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[14px] bg-[#fafaf9] p-4 dark:bg-[#1a1c22]">
            <Pulse className="mb-3 h-2 w-24" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Pulse key={i} className="h-3 w-2/3" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prose sections */}
      <div className="px-5 pb-12">
        <div className="mx-auto flex max-w-[390px] flex-col gap-8 md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Pulse className="h-6 w-1/2" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer note band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-5 h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-[110px] animate-pulse rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
