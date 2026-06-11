'use client';

import React from 'react';

function Pulse({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#cce8d8] dark:bg-[#1a1c22] ${className}`}
      style={style}
    />
  );
}

function DarkPulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-[#1a1a1a] dark:bg-[#111] ${className}`} />;
}

export function HomePageSkeleton() {
  return (
    <div className="bg-transparent">
      {/* Ticker strip */}
      <div className="h-10 bg-[#030406]" />

      {/* Hero */}
      <div className="px-5 pb-7 pt-9 xl:pb-0 xl:pt-16">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-3">
              <Pulse className="h-[44px] w-3/4" />
              <Pulse className="h-[44px] w-1/2" />
            </div>
            <Pulse className="h-4 w-[280px]" />
            <div className="flex gap-[10px]">
              <Pulse className="h-[52px] w-[160px] rounded-full" />
              <Pulse className="h-[52px] w-[100px] rounded-full" />
            </div>
            <Pulse
              className="w-full rounded-[24px]"
              style={{ aspectRatio: '350/300' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-t-[32px] bg-[#f2f2f7] px-5 pb-9 pt-10 dark:bg-[#0f0f14]">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="mb-2 h-3 w-28 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="mb-4 h-8 w-56 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="mb-3 h-8 w-48 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-[#e5e7eb] xl:grid-cols-4 dark:bg-[#1a1c22]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[6px] bg-[#111] p-[22px]">
                <DarkPulse className="h-8 w-3/4" />
                <DarkPulse className="h-3 w-1/2" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-[62px] animate-pulse rounded-[16px] bg-white dark:bg-[#1a1c22]" />
        </div>
      </div>

      {/* Markets */}
      <div className="bg-transparent px-5 pb-9 pt-10">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="mb-3 h-3 w-20 animate-pulse rounded bg-[#cce8d8] dark:bg-[#1a1c22]" />
          <Pulse className="mb-2 h-9 w-2/3" />
          <Pulse className="mb-4 h-4 w-3/4" />
          <div className="mb-[14px] grid grid-cols-2 gap-[10px] xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <DarkPulse key={i} className="h-[110px] rounded-[18px]" />
            ))}
          </div>
          <DarkPulse className="h-[46px] rounded-[16px]" />
        </div>
      </div>

      {/* Features */}
      <div className="rounded-[32px] bg-[#f2f2f2] px-5 pb-9 pt-10 dark:bg-[#0d0f14]">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="mb-3 h-3 w-36 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="mb-6 h-9 w-3/4 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="flex flex-col gap-[14px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[20px] bg-white p-5 dark:bg-[#111]"
              >
                <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-[14px] bg-[#e8e8e8] dark:bg-[#1a1c22]" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#e8e8e8] dark:bg-[#1a1c22]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#e8e8e8] dark:bg-[#1a1c22]" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#e8e8e8] dark:bg-[#1a1c22]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Steps */}
      <div className="bg-background px-5 pb-9 pt-10">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="mb-6 h-9 w-2/3 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-start gap-4 py-5">
                <div className="bg-accent/30 dark:bg-accent/20 h-8 w-[42px] animate-pulse rounded" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
                </div>
              </div>
              {i < 2 && <div className="h-px bg-[#e5e7eb] dark:bg-[#1a1c22]" />}
            </div>
          ))}
          <div className="bg-accent/40 dark:bg-accent/20 mt-3 h-[52px] animate-pulse rounded-full" />
        </div>
      </div>

      {/* Arbitrage */}
      <div className="bg-[#fafaf9] px-5 pb-12 pt-12 dark:bg-[#0f0f0f]">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <div className="mb-3 h-3 w-40 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="mb-1 h-8 w-3/4 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          <div className="bg-accent/30 dark:bg-accent/20 mb-3 h-8 w-2/3 animate-pulse rounded" />
          <div className="mb-5 h-4 w-full animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="flex flex-col gap-2 py-4">
                <div className="bg-accent/30 dark:bg-accent/20 h-6 w-24 animate-pulse rounded" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#e0e0e0] dark:bg-[#1a1c22]" />
              </div>
              {i < 3 && <div className="h-px bg-[#d9dbe0] dark:bg-[#2a2a2a]" />}
            </div>
          ))}
          <div className="mt-2 h-[46px] animate-pulse rounded-[12px] bg-[#111] dark:bg-[#1c1c1c]" />
        </div>
      </div>

      {/* CTA */}
      <div className="overflow-hidden rounded-t-[32px] bg-gradient-to-l from-[#1f262e] to-black px-5 pb-11 pt-11">
        <div className="mx-auto flex max-w-[390px] flex-col items-center gap-4 xl:max-w-[1200px]">
          <div className="h-10 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-1/2 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="bg-accent/40 mt-2 h-[49px] w-[250px] animate-pulse rounded-[10px]" />
          <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
