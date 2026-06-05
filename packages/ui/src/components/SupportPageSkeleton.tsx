'use client';

import {
  Pulse,
  HeroSkeleton,
  TabRowSkeleton,
  FormSkeleton,
  CtaBannerSkeleton,
} from './SkeletonBlocks';

export function SupportPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />
      {/* Search bar */}
      <div className="px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="h-[46px] w-full rounded-[16px]" />
        </div>
      </div>
      <TabRowSkeleton tabs={5} />
      {/* FAQ / content list */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Pulse className="mb-4 h-3 w-32" />
          <div className="flex flex-col gap-[8px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[14px] bg-[#f2f2f4] px-4 py-4 dark:bg-[#111]"
              >
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-5 w-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <FormSkeleton fields={3} />
      <CtaBannerSkeleton />
    </div>
  );
}
