'use client';

import { Pulse } from './SkeletonBlocks';

// Mirrors LiveChatPage: a chat window with a header, alternating message
// bubbles, and a composer input bar.
export function LiveChatPageSkeleton() {
  const bubbles = [
    { side: 'left', w: 'w-3/5' },
    { side: 'right', w: 'w-2/5' },
    { side: 'left', w: 'w-4/5' },
    { side: 'right', w: 'w-1/2' },
    { side: 'left', w: 'w-2/3' },
  ] as const;

  return (
    <div className="bg-transparent px-5 py-9">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[760px]">
        <div className="overflow-hidden rounded-[20px] border border-[#ebebea] dark:border-white/[0.07]">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-[#ebebea] bg-[#fafaf9] px-4 py-3 dark:border-white/[0.07] dark:bg-[#1a1c22]">
            <Pulse className="h-9 w-9 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-2 w-16" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 p-4">
            {bubbles.map((b, i) => (
              <div
                key={i}
                className={`flex ${b.side === 'right' ? 'justify-end' : 'justify-start'}`}
              >
                <Pulse className={`h-[44px] rounded-[16px] ${b.w}`} />
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-[#ebebea] p-3 dark:border-white/[0.07]">
            <Pulse className="h-[44px] flex-1 rounded-full" />
            <Pulse className="h-[44px] w-[44px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
