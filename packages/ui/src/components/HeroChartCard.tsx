'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Live hero chart card (DEMO).
 *
 * A self-contained "trading terminal" panel that mirrors the brand mood of the
 * original hero card (`bg-[#0c0e12]`, brand-green line) but is now *alive*:
 *
 *  - the EUR/USD quote ticks every 1.5 s with a brief green/red flash;
 *  - a pulsing ● LIVE marker signals real-time-style data;
 *  - the 1H/1D/1W/1M pills are interactive — selecting one redraws the chart
 *    with that period's shape (the SVG line re-animates via a `key` remount);
 *  - the floating XAU / US30 / BTC chips drift on their own random walk.
 *
 * Determinism: the first paint (server + hydration) always renders the seed
 * values below, so there is no hydration mismatch. All randomness is introduced
 * *after* mount inside the interval, which is itself skipped entirely under
 * `prefers-reduced-motion` (and paused while the tab is hidden).
 *
 * Prices are illustrative seeds — wiring them to the live `/api/mt5/instruments`
 * proxy is a deliberate future step (NE-003), not needed here.
 */

const TIMEFRAMES = ['1H', '1D', '1W', '1M'] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
type Dir = 'up' | 'down' | null;

const X0 = 10;
const X1 = 575;
const SEED_PRICE = 1.0921;

// Deterministic seed series per timeframe (no Math.random → no hydration drift).
// y is SVG space (smaller = higher price); each series ends higher than it starts
// so the quote reads as an uptrend with its own character per period.
const SERIES: Record<Timeframe, number[]> = {
  '1H': [206, 196, 211, 188, 199, 176, 187, 169, 179, 156],
  '1D': [238, 224, 214, 198, 180, 168, 150, 120, 92, 60],
  '1W': [242, 230, 233, 208, 204, 184, 172, 150, 126, 92],
  '1M': [176, 203, 162, 209, 150, 177, 116, 143, 88, 66],
};

// Period return per timeframe → the implied "open" used for the % readout.
const PERIOD_CHANGE: Record<Timeframe, number> = {
  '1H': 0.06,
  '1D': 0.18,
  '1W': 0.74,
  '1M': 1.92,
};
const OPEN: Record<Timeframe, number> = {
  '1H': SEED_PRICE / (1 + PERIOD_CHANGE['1H'] / 100),
  '1D': SEED_PRICE / (1 + PERIOD_CHANGE['1D'] / 100),
  '1W': SEED_PRICE / (1 + PERIOD_CHANGE['1W'] / 100),
  '1M': SEED_PRICE / (1 + PERIOD_CHANGE['1M'] / 100),
};

const CHIPS = [
  {
    symbol: 'XAU/USD',
    seed: 2318.4,
    dec: 2,
    step: 1.4,
    min: 2309,
    max: 2326,
    change: '+0.42%',
    up: true,
    pos: 'absolute start-3 top-3 sm:start-5 sm:top-5',
    delay: '0s',
  },
  {
    symbol: 'US30',
    seed: 38942,
    dec: 0,
    step: 20,
    min: 38860,
    max: 39030,
    change: '+0.12%',
    up: true,
    pos: 'absolute end-4 top-1/2 hidden -translate-y-1/2 sm:flex',
    delay: '0.6s',
  },
  {
    symbol: 'BTC/USD',
    seed: 64210,
    dec: 0,
    step: 140,
    min: 63800,
    max: 64640,
    change: '-0.31%',
    up: false,
    pos: 'absolute bottom-4 end-3 sm:bottom-6 sm:end-5',
    delay: '1.1s',
  },
] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const dirOf = (a: number, b: number): Dir => (b > a ? 'up' : b < a ? 'down' : null);
const fmt = (v: number, dec: number) =>
  v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

function points(ys: number[]): [number, number][] {
  const n = ys.length;
  return ys.map((y, i) => [X0 + ((X1 - X0) * i) / (n - 1), y]);
}

// Catmull-Rom → cubic Bézier for a smooth, deterministic line through the points.
function smoothLine(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  const first = pts[0]!;
  const out = [`M${first[0].toFixed(1)},${first[1].toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    out.push(
      `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`,
    );
  }
  return out.join(' ');
}

type LineGeo = { line: string; area: string; last: [number, number] };
function buildGeo(tf: Timeframe): LineGeo {
  const pts = points(SERIES[tf]);
  const line = smoothLine(pts);
  const last = pts[pts.length - 1] ?? [X1, 60];
  return { line, area: `${line} L${X1},300 L${X0},300 Z`, last };
}
const GEO: Record<Timeframe, LineGeo> = {
  '1H': buildGeo('1H'),
  '1D': buildGeo('1D'),
  '1W': buildGeo('1W'),
  '1M': buildGeo('1M'),
};

function Caret({ up }: { up: boolean }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
      className={up ? '' : 'rotate-180'}
    >
      <path d="M4 1L7 6H1L4 1Z" fill="currentColor" />
    </svg>
  );
}

function PriceChip({
  symbol,
  price,
  change,
  up,
  className = '',
  delay = '0s',
}: {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={[
        'animate-float-y motion-reduce:animate-none',
        'flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-2.5 py-1.5 backdrop-blur-md',
        'shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]',
        className,
      ].join(' ')}
    >
      <div className="flex flex-col">
        <span className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-white/55">
          {symbol}
        </span>
        <span className="font-sans text-[12px] font-semibold tabular-nums leading-tight text-white">
          {price}
        </span>
      </div>
      <span
        className={`flex items-center gap-0.5 font-mono text-[10px] font-medium leading-none ${
          up ? 'text-up' : 'text-down'
        }`}
      >
        <Caret up={up} />
        {change}
      </span>
    </div>
  );
}

export function HeroChartCard() {
  const t = useTranslations('demo');
  const [tf, setTf] = useState<Timeframe>('1D');

  // Live view state — seeded deterministically so the first paint matches the server.
  const [tick, setTick] = useState(0);
  const [price, setPrice] = useState(SEED_PRICE);
  const [priceDir, setPriceDir] = useState<Dir>(null);
  const [chipVals, setChipVals] = useState<number[]>(() => CHIPS.map((c) => c.seed));
  const data = useRef<{ price: number; chips: number[] }>({
    price: SEED_PRICE,
    chips: CHIPS.map((c) => c.seed),
  });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      const d = data.current;
      const prevPrice = d.price;
      const nextPrice = clamp(prevPrice + (Math.random() - 0.5) * 0.0009, 1.0903, 1.0939);
      d.price = nextPrice;
      d.chips = CHIPS.map((c, i) =>
        clamp((d.chips[i] ?? c.seed) + (Math.random() - 0.5) * c.step, c.min, c.max),
      );
      setPrice(nextPrice);
      setPriceDir(dirOf(prevPrice, nextPrice));
      setChipVals([...d.chips]);
      setTick((n) => n + 1);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const pct = ((price - OPEN[tf]) / OPEN[tf]) * 100;
  const pctUp = pct >= 0;
  const geo = GEO[tf];

  return (
    <div className="relative w-full">
      {/* Soft brand-green glow behind the card */}
      <div
        aria-hidden="true"
        className="animate-glow-pulse pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_70%_30%,rgba(0,176,80,0.28),transparent_70%)] blur-2xl motion-reduce:animate-none"
      />

      {/* Brighter border + a card surface kept lighter than the near-black page
          bg (#07090d) so the panel reads as a distinct device and doesn't blend
          into the background in dark mode (client feedback #2/#8). */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.22] bg-[#0c0e12] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.04] dark:bg-gradient-to-b dark:from-[#11151b] dark:to-[#0a0d12]">
        {/* Top bar: featured symbol + live badge */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="bg-accent/15 text-accent-bright flex h-7 w-7 items-center justify-center rounded-full font-sans text-[11px] font-bold">
              €
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <p className="font-sans text-[14px] font-semibold text-white">EUR/USD</p>
                <span className="bg-accent-bright/10 inline-flex items-center gap-1 rounded-full px-1.5 py-[3px]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="bg-accent-bright absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 motion-reduce:animate-none" />
                    <span className="bg-accent-bright relative inline-flex h-1.5 w-1.5 rounded-full" />
                  </span>
                  <span className="text-accent-bright font-mono text-[8px] font-semibold uppercase tracking-[0.12em]">
                    {t('heroLive')}
                  </span>
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/45">
                Major · Forex
              </p>
            </div>
          </div>
          <div className="text-end leading-tight">
            <p
              key={tick}
              className={`-me-1 inline-block rounded px-1 font-sans text-[24px] font-bold tabular-nums tracking-[-0.6px] text-white ${
                priceDir === 'up'
                  ? 'animate-flash-up'
                  : priceDir === 'down'
                    ? 'animate-flash-down'
                    : ''
              } motion-reduce:animate-none`}
            >
              {price.toFixed(4)}
            </p>
            <p
              className={`flex items-center justify-end gap-0.5 font-mono text-[12px] font-medium tabular-nums ${
                pctUp ? 'text-up' : 'text-down'
              }`}
            >
              <Caret up={pctUp} />
              {pctUp ? '+' : ''}
              {pct.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Timeframe selector — interactive */}
        <div className="mt-3 flex items-center gap-1.5 px-5">
          {TIMEFRAMES.map((item) => {
            const active = item === tf;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTf(item)}
                aria-pressed={active}
                className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium transition-colors ${
                  active
                    ? 'bg-accent/20 text-accent-bright'
                    : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="relative mt-1 px-1 pb-1">
          <svg
            viewBox="0 0 585 300"
            className="h-auto w-full"
            role="img"
            aria-label="Illustrative EUR/USD price chart"
          >
            <defs>
              <linearGradient id="heroAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B050" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#00B050" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="heroLineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00B050" />
                <stop offset="100%" stopColor="#1AD966" />
              </linearGradient>
            </defs>

            {/* Gridlines (static) */}
            {[70, 130, 190, 250].map((y) => (
              <line
                key={y}
                x1="10"
                y1={y}
                x2="575"
                y2={y}
                stroke="#ffffff"
                strokeOpacity="0.05"
                strokeWidth="1"
              />
            ))}

            {/* Chart geometry — keyed on timeframe so it re-draws on switch */}
            <g key={tf}>
              <path
                d={geo.area}
                fill="url(#heroAreaFill)"
                className="animate-fade-in motion-reduce:animate-none"
              />
              <path
                d={geo.line}
                pathLength={1}
                fill="none"
                stroke="url(#heroLineStroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-line [stroke-dasharray:1] [stroke-dashoffset:1] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
              />
              {/* Last-price marker */}
              <circle
                cx={geo.last[0]}
                cy={geo.last[1]}
                r="9"
                fill="#1AD966"
                fillOpacity="0.25"
                className="animate-chip-pulse motion-reduce:animate-none"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <circle cx={geo.last[0]} cy={geo.last[1]} r="3.5" fill="#1AD966" />
            </g>
          </svg>

          {/* Floating price chips */}
          {CHIPS.map((chip, i) => (
            <PriceChip
              key={chip.symbol}
              symbol={chip.symbol}
              price={fmt(chipVals[i] ?? chip.seed, chip.dec)}
              change={chip.change}
              up={chip.up}
              delay={chip.delay}
              className={chip.pos}
            />
          ))}
        </div>

        {/* Clarity bar — labels what the panel is, so it reads as functional,
            not decorative (client feedback #2: "users may not know what they
            are looking at"). */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
            {t('heroMarketMovement')}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
            <span className="bg-accent-bright h-1.5 w-1.5 rounded-full" />
            {t('heroPoweredBy')}
          </span>
        </div>
      </div>
    </div>
  );
}
