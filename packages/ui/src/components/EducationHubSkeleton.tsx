'use client';

import {
  Pulse,
  HeroSkeleton,
  TabRowSkeleton,
  ArticleListSkeleton,
  CtaBannerSkeleton,
} from './SkeletonBlocks';

export function EducationHubSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />
      <TabRowSkeleton tabs={5} />
      {/* Content type cards */}
      <div className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-2 gap-[10px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[18px] bg-[#f2f2f4] p-4 dark:bg-[#111]">
                <Pulse className="mb-3 h-3 w-20" />
                <Pulse className="mb-1 h-7 w-14" />
                <Pulse className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ArticleListSkeleton count={4} />
      <CtaBannerSkeleton />
    </div>
  );
}
