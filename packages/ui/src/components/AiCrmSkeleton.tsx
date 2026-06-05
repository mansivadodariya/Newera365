'use client';

import { DarkPulse, CtaBannerSkeleton } from './SkeletonBlocks';

export function AiCrmSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Dark hero */}
      <div className="rounded-b-[32px] bg-black px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <DarkPulse className="mb-3 h-3 w-16" />
          <DarkPulse className="mb-2 h-[44px] w-4/5" />
          <DarkPulse className="mb-4 h-[44px] w-3/5" />
          <DarkPulse className="mb-6 h-4 w-[280px]" />
          <div className="flex gap-[10px]">
            <DarkPulse className="h-[52px] w-[160px] rounded-full bg-[#1a3a1a]" />
            <DarkPulse className="h-[52px] w-[120px] rounded-full" />
          </div>
        </div>
      </div>
      {/* Dashboard preview card */}
      <div className="px-5 pb-10 pt-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] bg-[#0d0f14]">
            <div className="p-4">
              <DarkPulse className="mb-4 h-3 w-28" />
              <div className="mb-4 grid grid-cols-3 gap-px overflow-hidden rounded-[12px] bg-[#1a1c22]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#0d0f14] px-3 py-3">
                    <DarkPulse className="mb-1 h-6 w-12" />
                    <DarkPulse className="h-2 w-14" />
                  </div>
                ))}
              </div>
              <DarkPulse className="mb-2 h-3 w-20" />
              <DarkPulse className="h-4 w-full" />
              <DarkPulse className="mt-1 h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
      {/* Features list */}
      <div className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex flex-col gap-[10px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[18px] bg-[#f2f2f4] p-4 dark:bg-[#111]"
              >
                <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-[12px] bg-[#e0e0e0] dark:bg-[#1a1c22]" />
                <div className="flex-1 space-y-2">
                  <DarkPulse className="h-4 w-2/3 bg-[#e0e0e0] dark:bg-[#1a1c22]" />
                  <DarkPulse className="h-3 w-full bg-[#e8e8e8] dark:bg-[#1a1c22]" />
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
