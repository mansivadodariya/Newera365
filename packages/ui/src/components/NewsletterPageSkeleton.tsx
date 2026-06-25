'use client';

import { Pulse, HeroSkeleton } from './SkeletonBlocks';

const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

// Mirrors NewsletterPage: hero, inline subscribe form, a "what you get" list,
// and a dark (#111) social-proof band. No route-level CtaBanner on this route.
export function NewsletterPageSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={0} />

      {/* Subscribe form */}
      <div className="px-5 pb-8">
        <div className={`${WRAP} flex gap-2`}>
          <Pulse className="h-[52px] flex-1 rounded-full" />
          <Pulse className="h-[52px] w-[120px] rounded-full" />
        </div>
      </div>

      {/* What you get list */}
      <div className="px-5 pb-8">
        <div className={`${WRAP} flex flex-col gap-3`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-6 w-6 flex-shrink-0 rounded-full" />
              <Pulse className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Social proof — dark band */}
      <div className="rounded-t-[32px] bg-[#111111] px-5 pb-12 pt-10 xl:px-[80px]">
        <div className={WRAP}>
          <div className="mb-6 h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[18px] bg-white/[0.06] p-5">
                <div className="mb-3 h-4 w-full animate-pulse rounded bg-white/10" />
                <div className="mb-3 h-3 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
