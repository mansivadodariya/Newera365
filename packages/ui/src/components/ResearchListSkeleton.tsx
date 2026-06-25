'use client';

import {
  Pulse,
  HeroSkeleton,
  TabRowSkeleton,
  ArticleListSkeleton,
  CtaBannerSkeleton,
} from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors ResearchPage (research / blog / daily-news): hero, search bar,
// category tabs, featured article + article list, research-report downloads,
// and the dark newsletter CTA.
export function ResearchListSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />

      {/* Search bar */}
      <div className="px-5 pb-4">
        <div className={WRAP}>
          <Pulse className="h-[46px] w-full rounded-[12px]" />
        </div>
      </div>

      <TabRowSkeleton tabs={5} />
      <ArticleListSkeleton count={5} />

      {/* Research report downloads */}
      <div className="px-5 pb-10">
        <div className={WRAP}>
          <Pulse className="mb-4 h-6 w-2/5 xl:w-1/4" />
          <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 rounded-[16px] bg-white p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.04)] dark:bg-[#16181d] dark:shadow-none"
              >
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-3/4" />
                  <Pulse className="h-3 w-full" />
                  <Pulse className="h-3 w-1/2" />
                </div>
                <Pulse className="h-9 w-9 flex-shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter — dark band */}
      <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className={`${WRAP} xl:flex xl:items-center xl:justify-between xl:gap-10`}>
          <div className="mb-4 xl:mb-0">
            <div className="mb-2 h-7 w-2/3 animate-pulse rounded bg-white/10 xl:w-full" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          </div>
          <div className="flex gap-2 xl:w-[420px]">
            <div className="h-[48px] flex-1 animate-pulse rounded-full bg-white/10" />
            <div className="bg-accent/40 h-[48px] w-[120px] animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      <CtaBannerSkeleton />
    </div>
  );
}
