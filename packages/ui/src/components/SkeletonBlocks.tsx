'use client';

import React from 'react';

// Lime-green tinted pulse — shows against the fixed gradient background
export function Pulse({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#cce8d8] dark:bg-[#1a1c22] ${className}`}
      style={style}
    />
  );
}

// Dark card pulse — for sections with dark backgrounds
export function DarkPulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-[#1a1a1a] dark:bg-[#111] ${className}`} />;
}

// Kicker + 2 heading lines + subtitle + 1-2 CTA buttons
export function HeroSkeleton({ buttons = 2 }: { buttons?: number }) {
  return (
    <div className="px-5 pb-8 pt-9">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <Pulse className="mb-3 h-3 w-20" />
        <div className="mb-4 flex flex-col gap-3">
          <Pulse className="h-[44px] w-4/5" />
          <Pulse className="h-[44px] w-3/5" />
        </div>
        <Pulse className="mb-6 h-4 w-[280px]" />
        <div className="flex gap-[10px]">
          {Array.from({ length: buttons }).map((_, i) => (
            <Pulse
              key={i}
              className={`h-[52px] rounded-full ${i === 0 ? 'w-[160px]' : 'w-[120px]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// N columns × M card placeholders
export function CardGridSkeleton({ cols = 1, cards = 3 }: { cols?: number; cards?: number }) {
  return (
    <div className="px-5 pb-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div
          className="flex flex-col gap-[14px]"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '14px',
          }}
        >
          {Array.from({ length: cards }).map((_, i) => (
            <Pulse key={i} className="h-[180px] rounded-[22px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Table with column headers + data rows
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="px-5 pb-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="overflow-hidden rounded-[18px] bg-black">
          <div className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-3">
            {[...Array(4)].map((_, i) => (
              <DarkPulse key={i} className="h-2 w-10" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_60px_60px] px-4 py-[14px]">
              <DarkPulse className="h-4 w-20" />
              <DarkPulse className="h-4 w-10 justify-self-end" />
              <DarkPulse className="h-4 w-10 justify-self-end" />
              <DarkPulse className="h-4 w-10 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Featured hero card + list of article rows
export function ArticleListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="px-5 pb-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <Pulse className="mb-[14px] h-[220px] rounded-[22px]" />
        <div className="flex flex-col gap-[14px]">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="flex-1 space-y-2">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-5 w-full" />
                <Pulse className="h-3 w-3/4" />
              </div>
              <Pulse className="h-[70px] w-[70px] flex-shrink-0 rounded-[12px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Horizontal tab row
export function TabRowSkeleton({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className="flex gap-2 px-5 pb-4">
      {Array.from({ length: tabs }).map((_, i) => (
        <Pulse key={i} className={`h-[38px] rounded-full ${i === 0 ? 'w-[80px]' : 'w-[90px]'}`} />
      ))}
    </div>
  );
}

// Form fields (label + input)
export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="px-5 pb-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="flex flex-col gap-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-[48px] w-full rounded-[14px]" />
            </div>
          ))}
          <Pulse className="mt-2 h-[52px] w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Dark bottom CTA band
export function CtaBannerSkeleton() {
  return (
    <div className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
      <div className="mx-auto flex max-w-[390px] flex-col items-center gap-4 md:max-w-2xl xl:max-w-[1200px]">
        <div className="h-9 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="bg-accent/40 mt-2 h-[49px] w-[220px] animate-pulse rounded-full" />
      </div>
    </div>
  );
}

// 2×2 stat card grid
export function StatsGridSkeleton() {
  return (
    <div className="rounded-t-[32px] bg-[#f2f2f7] px-5 pb-9 pt-10 dark:bg-[#0f0f14]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-[#e5e7eb] dark:bg-[#1a1c22]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[6px] bg-[#111] p-[22px]">
              <DarkPulse className="h-8 w-3/4" />
              <DarkPulse className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
