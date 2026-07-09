'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/* ─── HeroTerminal ───────────────────────────────────────────────────────
   Code-built terminal panel for the hero (replaces the static 4K PNG render
   the client rejected). Everything is drawn — SVG candles + close line on the
   ink surface with a live-ticking quote rail — so it's crisp at any DPI,
   themable, and ~0 bytes of imagery on the critical path.

   Determinism: the candle series comes from a seeded PRNG evaluated at module
   scope, so server and client render identical markup (no hydration diff).
   Ticking starts only after mount, is skipped under prefers-reduced-motion,
   and pauses in background tabs (interval cleared on visibilitychange). */

// mulberry32 — tiny deterministic PRNG; NEVER swap for Math.random (hydration)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

// EURUSD-flavoured random walk: drifts up with two pullbacks — reads as a
// market, not a logo swoosh.
const CANDLES: Candle[] = (() => {
  const rand = mulberry32(20260706);
  const out: Candle[] = [];
  let price = 1.0872;
  for (let i = 0; i < 44; i++) {
    // pullback zones around bars 14-19 and 30-33
    const drift = (i > 13 && i < 20) || (i > 29 && i < 34) ? -0.00055 : 0.00095;
    const o = price;
    const c = o + drift + (rand() - 0.5) * 0.0026;
    const h = Math.max(o, c) + rand() * 0.0012;
    const l = Math.min(o, c) - rand() * 0.0012;
    out.push({ o, h, l, c });
    price = c;
  }
  return out;
})();

// ── Chart geometry (viewBox units) ──────────────────────────────────────
const W = 720;
const H = 340;
const PAD_TOP = 18;
const PAD_BOTTOM = 14;
const PLOT_END = 636; // candles end here; price axis lives to the right

const LO = Math.min(...CANDLES.map((k) => k.l));
const HI = Math.max(...CANDLES.map((k) => k.h));
const y = (p: number) => PAD_TOP + ((HI - p) / (HI - LO)) * (H - PAD_TOP - PAD_BOTTOM);
const x = (i: number) => 10 + (i * (PLOT_END - 20)) / CANDLES.length;
const CW = ((PLOT_END - 20) / CANDLES.length) * 0.55; // candle body width

const LAST = CANDLES[CANDLES.length - 1]!;
const CLOSE_LINE = CANDLES.map((k, i) => `${(x(i) + CW / 2).toFixed(1)},${y(k.c).toFixed(1)}`).join(
  ' ',
);
// 5 horizontal gridlines with price labels
const GRID = Array.from({ length: 5 }, (_, i) => {
  const p = HI - ((HI - LO) * i) / 4;
  return { yy: y(p), label: p.toFixed(4) };
});

// ── Quote rail ───────────────────────────────────────────────────────────
interface Quote {
  sym: string;
  price: number;
  dp: number;
  delta: number; // session % — jittered live
}

const BASE_QUOTES: Quote[] = [
  { sym: 'EURUSD', price: 1.14125, dp: 5, delta: 0.21 },
  { sym: 'XAUUSD', price: 4133.18, dp: 2, delta: 0.64 },
  { sym: 'NAS100', price: 29834.0, dp: 1, delta: -0.18 },
  { sym: 'BTCUSD', price: 61997.0, dp: 0, delta: 1.12 },
];

// Hairlines between rail cells (logical borders, RTL-safe): 2×2 on mobile,
// 4-across from md.
const CELL_BORDERS = [
  '',
  'border-s border-white/[0.07]',
  'border-t border-white/[0.07] md:border-t-0 md:border-s',
  'border-s border-t border-white/[0.07] md:border-t-0',
] as const;

// The open position the panel "runs": its P/L ticks with the EURUSD quote,
// so the hero shows money moving — not wallpaper.
const ENTRY = 1.1398;

// Proof toasts — the Edge claims happening as live terminal events
// (execution speed, 24/7 withdrawals, A-Book routing).
const EVENTS = ['heroTermEvent1', 'heroTermEvent2', 'heroTermEvent3'] as const;

const EVENT_ICONS = [
  // bolt — execution
  <path key="bolt" d="M6.5 1 2 7h3l-.5 4L9 5H6l.5-4Z" fill="currentColor" />,
  // clock — 24/7 withdrawals
  <g key="clock" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
    <circle cx="5.5" cy="6" r="4.5" />
    <path d="M5.5 3.8V6l1.6 1.2" />
  </g>,
  // route — A-Book straight-through
  <g key="route" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
    <path d="M1.5 6h8M6.5 3l3 3-3 3" strokeLinejoin="round" />
  </g>,
];

export function HeroTerminal() {
  const t = useTranslations('home');
  const [quotes, setQuotes] = useState(BASE_QUOTES);
  // ticks[i] increments when row i updates — keys the flash animation restart
  const [ticks, setTicks] = useState([0, 0, 0, 0]);
  const [eventIdx, setEventIdx] = useState(0);
  const dirRef = useRef<('up' | 'down')[]>(['up', 'up', 'down', 'up']);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      timer = setInterval(() => {
        const i = Math.floor(Math.random() * BASE_QUOTES.length);
        setQuotes((prev) =>
          prev.map((q, j) => {
            if (j !== i) return q;
            const move = q.price * (Math.random() - 0.48) * 0.0006;
            dirRef.current[j] = move >= 0 ? 'up' : 'down';
            return { ...q, price: q.price + move, delta: q.delta + move / q.price / 0.01 };
          }),
        );
        setTicks((prev) => prev.map((n, j) => (j === i ? n + 1 : n)));
      }, 1700);
    };
    const onVis = () => {
      if (document.hidden) {
        if (timer) clearInterval(timer);
        timer = undefined;
      } else if (!timer) start();
    };
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Proof-event cycle — same gating as the ticker (reduced motion: the first
  // event stays as a static caption).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      if (!document.hidden) setEventIdx((i) => (i + 1) % EVENTS.length);
    }, 4600);
    return () => clearInterval(timer);
  }, []);

  const plValue = (quotes[0]!.price - ENTRY) * 100000;
  const plUp = plValue >= 0;

  return (
    // Financial charts read LTR in every locale.
    <div
      dir="ltr"
      className="ink-band flex h-[420px] flex-col overflow-hidden rounded-[20px] border border-white/[0.09] shadow-[0_24px_64px_-24px_rgba(4,16,10,0.5)] md:h-[500px] xl:h-[560px]"
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <i className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <i className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
          </span>
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-white/50">
            EURUSD · M15
          </span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-2.5 py-1">
          <i className="bg-accent-bright motion-safe:animate-chip-pulse h-[6px] w-[6px] rounded-full" />
          <span className="text-accent-bright font-mono text-[10px] font-semibold tracking-[0.16em]">
            LIVE
          </span>
        </span>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ht-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1AD966" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1AD966" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid + price axis */}
          {GRID.map((g) => (
            <g key={g.label}>
              <line x1="0" y1={g.yy} x2={PLOT_END} y2={g.yy} stroke="rgba(255,255,255,0.05)" />
              <text
                x={PLOT_END + 10}
                y={g.yy + 3}
                fill="rgba(255,255,255,0.32)"
                fontSize="10"
                fontFamily="var(--font-mono), monospace"
              >
                {g.label}
              </text>
            </g>
          ))}

          {/* Area under closes */}
          <polygon
            points={`${CLOSE_LINE} ${x(CANDLES.length - 1) + CW / 2},${H - PAD_BOTTOM} ${x(0) + CW / 2},${H - PAD_BOTTOM}`}
            fill="url(#ht-area)"
            className="motion-safe:animate-fade-in"
          />

          {/* Candles */}
          <g className="motion-safe:animate-fade-in">
            {CANDLES.map((k, i) => {
              const up = k.c >= k.o;
              const color = up ? '#26A69A' : '#EF5350';
              const bx = x(i);
              return (
                <g key={i}>
                  <line
                    x1={bx + CW / 2}
                    y1={y(k.h)}
                    x2={bx + CW / 2}
                    y2={y(k.l)}
                    stroke={color}
                    strokeWidth="1.1"
                  />
                  <rect
                    x={bx}
                    y={y(Math.max(k.o, k.c))}
                    width={CW}
                    height={Math.max(1.5, Math.abs(y(k.o) - y(k.c)))}
                    fill={color}
                    rx="0.8"
                  />
                </g>
              );
            })}
          </g>

          {/* Close line draws itself in (pathLength trick + existing keyframes) */}
          <polyline
            points={CLOSE_LINE}
            fill="none"
            stroke="#1AD966"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            className="motion-safe:animate-draw-line"
          />

          {/* Last price marker */}
          <line
            x1="0"
            y1={y(LAST.c)}
            x2={PLOT_END}
            y2={y(LAST.c)}
            stroke="rgba(26,217,102,0.4)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <rect
            x={PLOT_END + 2}
            y={y(LAST.c) - 9}
            width={W - PLOT_END - 4}
            height="18"
            rx="4"
            fill="#0E5D33"
          />
          <text
            x={PLOT_END + 10}
            y={y(LAST.c) + 3.5}
            fill="#D7FFE6"
            fontSize="10"
            fontWeight="600"
            fontFamily="var(--font-mono), monospace"
          >
            {LAST.c.toFixed(4)}
          </text>
        </svg>

        {/* Open position — running P/L tied to the EURUSD quote */}
        <div className="absolute left-3 top-3 flex items-center gap-2.5 rounded-[10px] border border-white/[0.09] bg-[#081710]/90 px-3 py-2 md:left-4">
          <span className="bg-accent/[0.16] text-accent-bright rounded-[5px] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em]">
            {t('heroTermBuy')}
          </span>
          <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-white/70">
            1.00 · EURUSD
          </span>
          <span className="h-3 w-px bg-white/[0.12]" aria-hidden="true" />
          <span
            className={`font-sans text-[12px] font-semibold tabular-nums ${plUp ? 'text-[#2EE58A]' : 'text-[#FF7A76]'}`}
          >
            {plUp ? '+' : '−'}${Math.abs(plValue).toFixed(2)}
          </span>
        </div>

        {/* Proof events — the Edge claims as live terminal activity */}
        <div
          key={eventIdx}
          className="animate-fade-in absolute bottom-3 left-3 flex items-center gap-2.5 rounded-[10px] border border-white/[0.09] bg-[#081710]/90 px-3 py-2 md:left-4"
        >
          <span className="bg-accent/[0.16] text-accent-bright flex h-[22px] w-[22px] items-center justify-center rounded-full">
            <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
              {EVENT_ICONS[eventIdx]}
            </svg>
          </span>
          <span className="font-mono text-[11px] font-medium tracking-[0.04em] text-white/80">
            {t(EVENTS[eventIdx]!)}
          </span>
        </div>
      </div>

      {/* Live quote rail */}
      <div className="grid grid-cols-2 border-t border-white/[0.07] md:grid-cols-4">
        {quotes.map((q, i) => {
          const dir = dirRef.current[i];
          const up = (q.delta ?? 0) >= 0;
          return (
            <div key={q.sym} className={`px-4 py-3 md:px-5 md:py-3.5 ${CELL_BORDERS[i]}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-white/45">
                  {q.sym}
                </span>
                <span
                  className={`font-mono text-[10px] font-semibold tabular-nums ${up ? 'text-[#2EE58A]' : 'text-[#FF7A76]'}`}
                >
                  {up ? '▲' : '▼'} {Math.abs(q.delta).toFixed(2)}%
                </span>
              </div>
              {/* key restarts the tick flash on every update for THIS row only */}
              <p
                key={ticks[i]}
                className={`-mx-1 mt-0.5 w-fit rounded px-1 font-sans text-[15px] font-semibold tabular-nums text-white md:text-[16px] ${
                  ticks[i] ? (dir === 'up' ? 'animate-flash-up' : 'animate-flash-down') : ''
                }`}
              >
                {q.price.toLocaleString('en-US', {
                  minimumFractionDigits: q.dp,
                  maximumFractionDigits: q.dp,
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
