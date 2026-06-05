'use client';

import { Pulse, HeroSkeleton } from './SkeletonBlocks';

export function ArticleDetailSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-5 pb-0 pt-6">
        <Pulse className="h-3 w-16" />
        <Pulse className="h-3 w-2" />
        <Pulse className="h-3 w-16" />
      </div>
      {/* Article header */}
      <div className="px-5 pb-6 pt-5">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-3 h-5 w-24 rounded-full" />
          <Pulse className="mb-2 h-8 w-4/5" />
          <Pulse className="mb-5 h-4 w-full" />
          <div className="flex items-center gap-3">
            <Pulse className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Pulse className="h-3 w-28" />
              <Pulse className="h-2 w-20" />
            </div>
          </div>
        </div>
      </div>
      {/* ToC */}
      <div className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[18px] bg-[#f2f2f4] p-4 dark:bg-[#111]">
            <Pulse className="mb-3 h-2 w-20" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="mb-2 h-4 w-3/4" />
            ))}
          </div>
        </div>
      </div>
      {/* Body paragraphs */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] space-y-3 md:max-w-2xl xl:max-w-[1200px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <Pulse key={i} className={`h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
          ))}
        </div>
      </div>
      {/* Related articles */}
      <div className="bg-[#f2f2f4] px-5 pb-10 pt-8 dark:bg-[#111]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-5 h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="flex-1 space-y-2">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
