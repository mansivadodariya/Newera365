'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const FEATURES = [
  {
    id: 'streaming',
    title: 'Real-time streaming',
    desc: 'WebSocket-powered price feeds with sub-100ms latency.',
  },
  {
    id: 'mt5',
    title: 'MT5 backend',
    desc: 'Same trade execution engine as the desktop client.',
  },
  {
    id: 'encrypted',
    title: 'Encrypted sessions',
    desc: 'TLS 1.3 with hardware-isolated key vault.',
  },
] as const;

// Static candlestick data for the chart mockup
const CANDLES = [
  { h: 62, l: 18, o: 24, c: 58 },
  { h: 70, l: 30, o: 55, c: 35 },
  { h: 55, l: 10, o: 40, c: 15 },
  { h: 48, l: 20, o: 22, c: 44 },
  { h: 75, l: 38, o: 40, c: 72 },
  { h: 80, l: 50, o: 74, c: 55 },
  { h: 65, l: 30, o: 52, c: 38 },
  { h: 58, l: 22, o: 25, c: 55 },
  { h: 72, l: 44, o: 46, c: 70 },
  { h: 85, l: 60, o: 62, c: 82 },
  { h: 90, l: 68, o: 84, c: 72 },
  { h: 78, l: 48, o: 70, c: 52 },
  { h: 68, l: 38, o: 40, c: 65 },
  { h: 74, l: 50, o: 52, c: 70 },
  { h: 82, l: 58, o: 72, c: 60 },
  { h: 70, l: 42, o: 58, c: 48 },
  { h: 62, l: 30, o: 45, c: 35 },
  { h: 55, l: 25, o: 28, c: 52 },
  { h: 72, l: 48, o: 50, c: 68 },
  { h: 80, l: 58, o: 70, c: 62 },
];

function CandlestickChart() {
  const W = 280;
  const H = 100;
  const cw = 10;
  const gap = 4;
  const step = cw + gap;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {CANDLES.map((c, i) => {
        const x = i * step + cw / 2;
        const up = c.c >= c.o;
        const color = up ? '#26A69A' : '#EE5250';
        const bodyTop = H - Math.max(c.o, c.c);
        const bodyH = Math.abs(c.c - c.o) || 2;
        return (
          <g key={i}>
            {/* Wick */}
            <line x1={x} y1={H - c.h} x2={x} y2={H - c.l} stroke={color} strokeWidth="1" />
            {/* Body */}
            <rect x={x - cw / 2} y={bodyTop} width={cw} height={bodyH} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

export function WebTraderPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:last-child]:font-body mb-2 [&>span:first-child]:hidden [&>span:last-child]:text-[11px] [&>span:last-child]:font-semibold [&>span:last-child]:leading-[100%] [&>span:last-child]:tracking-[0.08em] [&>span:last-child]:text-[#1AD966]">
            TRADING PLATFORM
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[44px] font-semibold leading-[1.05] tracking-[-1.54px]">
            WebTrader.
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            Trade global markets directly in your browser. No download, no install — just open and
            go.
          </p>
        </div>
      </section>

      {/* Embed mockup */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] bg-[#111111]">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-body text-[13px] font-semibold text-white">EURUSD</span>
                <span className="font-body text-[11px] text-white/50">+0.14%</span>
              </div>
              <div className="flex gap-1">
                {['M5', 'M15', 'H1', 'D1'].map((tf) => (
                  <span
                    key={tf}
                    className={`font-body rounded px-2 py-[3px] text-[10px] font-medium ${tf === 'H1' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                  >
                    {tf}
                  </span>
                ))}
              </div>
            </div>

            {/* Chart area */}
            <div className="relative px-4 py-4">
              {/* Y-axis labels */}
              <div
                className="absolute right-4 top-4 flex flex-col justify-between py-1 text-right"
                style={{ height: 100 }}
              >
                <span className="font-body text-[9px] text-white/30">1.0890</span>
                <span className="font-body text-[9px] text-white/30">1.0856</span>
                <span className="font-body text-[9px] text-white/30">1.0820</span>
              </div>
              <CandlestickChart />
            </div>

            {/* Trade panel */}
            <div className="border-t border-white/10 px-4 pb-4 pt-3">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-[10px] bg-[#26A69A]/20 px-3 py-2 text-center">
                  <p className="font-body mb-0.5 text-[9px] uppercase tracking-[0.1em] text-[#26A69A]">
                    BUY
                  </p>
                  <p className="font-sans text-[18px] font-semibold text-white">1.08562</p>
                  <p className="font-body text-[9px] text-white/40">Ask</p>
                </div>
                <div className="rounded-[10px] bg-[#EE5250]/20 px-3 py-2 text-center">
                  <p className="font-body mb-0.5 text-[9px] uppercase tracking-[0.1em] text-[#EE5250]">
                    SELL
                  </p>
                  <p className="font-sans text-[18px] font-semibold text-white">1.08549</p>
                  <p className="font-body text-[9px] text-white/40">Bid</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[10px] bg-white/5 px-3 py-2">
                <span className="font-body text-[11px] text-white/50">Volume (lots)</span>
                <div className="flex items-center gap-3">
                  <button className="font-body flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[14px] text-white/60 hover:bg-white/20">
                    –
                  </button>
                  <span className="font-body text-[13px] font-medium text-white">0.10</span>
                  <button className="font-body flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[14px] text-white/60 hover:bg-white/20">
                    +
                  </button>
                </div>
              </div>
              <p className="font-body mt-3 text-center text-[9px] uppercase tracking-[0.1em] text-white/20">
                WEBTRADER · POWERED BY MT5
              </p>
            </div>
          </div>

          {/* Fallback banner */}
          <div className="mt-3 flex gap-3 rounded-[16px] bg-[#FAFAF9] p-4 dark:bg-[#1c1500]">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F59E0B]/15">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L1 14h14L8 2z"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6v4M8 11.5v.5"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-foreground mb-1 font-sans text-[13px] font-semibold">
                Browser doesn&apos;t support WebTrader?
              </p>
              <p className="font-body text-muted mb-3 text-[11px] leading-relaxed">
                Some browsers block the WebSocket connection WebTrader uses to stream live prices.
                Try a different browser, disable VPN/ad blockers, or fall back to our native apps.
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/platform/metatrader-5`}
                  className="font-body flex h-7 items-center rounded-full bg-[#111111] px-3 text-[11px] font-medium text-white dark:bg-white dark:text-[#111111]"
                >
                  Download Desktop
                </Link>
                <Link
                  href={`/${locale}/platform/mobile`}
                  className="font-body text-foreground dark:border-border flex h-7 items-center rounded-full border border-[#e5e7eb] px-3 text-[11px] font-medium"
                >
                  Get Mobile App
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1]">
            No download.
            <br />
            <span className="text-accent">No compromise.</span>
          </h2>
          <div className="flex flex-col gap-[10px]">
            {FEATURES.map((feat) => (
              <div
                key={feat.id}
                className="dark:bg-surface flex items-start gap-3 rounded-[16px] bg-[#FAFAF9] px-4 py-4"
              >
                <div className="bg-accent mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-foreground mb-0.5 font-sans text-[14px] font-semibold">
                    {feat.title}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/40 [&>span:last-child]:text-white/50">
            WEBTRADER
          </SectionKicker>
          <h2 className="mb-4 font-sans text-[32px] font-semibold leading-[1.1] text-white">
            Open a position
            <br />
            in 30 seconds.
          </h2>
          <p className="font-body mb-8 max-w-[290px] text-[14px] leading-relaxed text-white/60">
            No download. No setup. Full MT5 power — straight from your browser.
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent hover:bg-accent-hover font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Launch WebTrader
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
