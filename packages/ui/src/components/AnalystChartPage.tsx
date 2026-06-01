'use client';

import { useState } from 'react';
import { SectionKicker } from './SectionKicker';

type Tab = 'FOREX' | 'INDICES' | 'COMMODITIES';

const TABS: { id: Tab; label: string }[] = [
  { id: 'FOREX', label: 'Forex' },
  { id: 'INDICES', label: 'Indices' },
  { id: 'COMMODITIES', label: 'Commodities' },
];

const PAIRS: Record<
  Tab,
  { symbol: string; price: string; change: string; pct: string; up: boolean }[]
> = {
  FOREX: [
    { symbol: 'EURUSD', price: '1.0842', change: '+0.0034', pct: '+0.31%', up: true },
    { symbol: 'GBPUSD', price: '1.2691', change: '+0.0021', pct: '+0.17%', up: true },
    { symbol: 'GBPJPY', price: '198.12', change: '-0.48', pct: '-0.24%', up: false },
    { symbol: 'XAUUSD', price: '2,206.48', change: '+8.20', pct: '+0.37%', up: true },
  ],
  INDICES: [
    { symbol: 'SP500', price: '5,301.4', change: '-12.50', pct: '-0.24%', up: false },
    { symbol: 'NAS100', price: '18,744.2', change: '+45.10', pct: '+0.24%', up: true },
    { symbol: 'UK100', price: '8,264.0', change: '+18.40', pct: '+0.22%', up: true },
    { symbol: 'GER40', price: '18,512.3', change: '-34.20', pct: '-0.18%', up: false },
  ],
  COMMODITIES: [
    { symbol: 'XAUUSD', price: '2,206.48', change: '+8.20', pct: '+0.37%', up: true },
    { symbol: 'XAGUSD', price: '28.14', change: '+0.22', pct: '+0.79%', up: true },
    { symbol: 'USOIL', price: '79.42', change: '-0.58', pct: '-0.73%', up: false },
    { symbol: 'NATGAS', price: '2.18', change: '+0.04', pct: '+1.87%', up: true },
  ],
};

const ANALYSTS = [
  {
    initials: 'DR',
    name: 'Diego Romero',
    title: 'FX Desk · Senior Analyst',
    commentary: `EURUSD has continued to grind higher as the ECB pushes back against July cut expectations. With Q2 data softening and the Fed holding above 5% — well above its long-run average, we see room for a move toward 1.10 before the summer recess. This week's NFP print is the key trigger. A miss below 150K could prompt a sharp reversal toward the 1.09 handle.`,
    updated: '26 May 2025',
    pair: 'EURUSD',
  },
];

function MiniChart() {
  const points = [30, 34, 32, 36, 38, 35, 39, 42, 40, 44, 43, 46];
  const w = 300;
  const h = 80;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');
  const areaCoords = `0,${h} ${coords} ${w},${h}`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00B050" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00B050" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaCoords} fill="url(#chartGrad)" />
      <polyline
        points={coords}
        fill="none"
        stroke="#00B050"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalystChartPage() {
  const [tab, setTab] = useState<Tab>('FOREX');

  const pairs = PAIRS[tab];
  const featured = pairs[0]!;
  const analyst = ANALYSTS[0]!;

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.08]">
            Where the
            <br />
            majors are
            <br />
            <span className="text-accent"> headed next.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Our trading desk is live on the top five currency pairs — updated weekly.
          </p>
        </div>
      </section>

      {/* Featured price + pair list */}
      <section className="dark:bg-background bg-white px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:grid xl:grid-cols-2 xl:gap-8">
            {/* Featured price card */}
            <div
              className="rounded-[20px] bg-[#111111] p-5"
              style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.12)' }}
            >
              <p className="font-body mb-1 text-[11px] uppercase tracking-[0.1em] text-white/40">
                {featured.symbol}
              </p>
              <div className="mb-4 flex items-end gap-3">
                <p className="font-sans text-[40px] font-semibold tabular-nums leading-none text-white">
                  {featured.price}
                </p>
                <span
                  className={`font-body mb-1 text-[13px] font-semibold ${featured.up ? 'text-accent' : 'text-[#EF4444]'}`}
                >
                  {featured.pct}
                </span>
              </div>
              <div className="h-[80px] overflow-hidden rounded-[10px]">
                <MiniChart />
              </div>
            </div>

            {/* Tab filter + pair list */}
            <div className="mt-5 xl:mt-0">
              <div className="mb-4 flex gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`font-body rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                      tab === t.id
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                        : 'bg-[#f3f4f6] text-[#6b7280] dark:bg-[#1c1c1c] dark:text-[#9ca3af]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col divide-y divide-[#e5e7eb] dark:divide-[#2a2a2a]">
                {pairs.map((p) => (
                  <div key={p.symbol} className="flex items-center justify-between py-[13px]">
                    <p className="text-foreground font-sans text-[14px] font-semibold">
                      {p.symbol}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="font-body text-foreground text-[13px] tabular-nums">
                        {p.price}
                      </p>
                      <p
                        className={`font-body text-[12px] font-semibold tabular-nums ${p.up ? 'text-accent' : 'text-[#EF4444]'}`}
                      >
                        {p.pct}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analyst commentary */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body mb-4 text-[10px] uppercase tracking-[0.12em] text-[#9ca3af]">
            ANALYST COMMENTARY
          </p>
          <div className="rounded-[18px] bg-[#f9f9f9] p-5 dark:bg-[#1c1c1c]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#111111]">
                <span className="font-sans text-[13px] font-semibold text-white">
                  {analyst.initials}
                </span>
              </div>
              <div>
                <p className="text-foreground font-sans text-[13px] font-semibold">
                  {analyst.name}
                </p>
                <p className="font-body text-muted text-[11px]">{analyst.title}</p>
              </div>
              <span className="font-body text-muted ml-auto text-[10px]">{analyst.updated}</span>
            </div>
            <p className="font-body text-muted text-[13px] leading-[1.7]">{analyst.commentary}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            TRADE NOW
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            A premium global trading platform built for the new era of markets.
          </h2>
          <a
            href="https://trade.newera365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent font-body hover:bg-accent/90 mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Open free account
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
