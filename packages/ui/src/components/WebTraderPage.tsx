'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Timeframe = 'M5' | 'M15' | 'H1' | 'D1';
const TIMEFRAMES: Timeframe[] = ['M5', 'M15', 'H1', 'D1'];

const FEATURES = [
  { idx: 2, icon: 'stream' },
  { idx: 3, icon: 'mt5' },
  { idx: 4, icon: 'lock' },
] as const;

function CheckCircle() {
  return (
    <span className="bg-accent flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 6l3 3 5-5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ── Terminal SVG ──────────────────────────────────────────────────────────────

function rng(seed: number): number {
  const x = Math.sin(seed + 1.618) * 83421.7;
  return x - Math.floor(x);
}

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  vol: number;
}

// Deterministic EURUSD-shaped sparkline (trending up with pullbacks)
const EURUSD_PTS = [28, 26, 30, 28, 32, 31, 35, 33, 30, 34, 38, 36, 33, 37, 40, 38, 36, 40, 44, 42];
const TF_SEEDS: Record<Timeframe, number> = { M5: 11, M15: 23, H1: 37, D1: 53 };

// Maps to real EUR/USD price range ~1.0820–1.0865
const BASE_PRICE = 1.082;
const PRICE_RNG = 0.0045;

function buildCandles(pts: number[], seed: number): Candle[] {
  const N = 28;
  const span = Math.max(...pts) - Math.min(...pts) || 4;
  const wick = span * 0.16;
  const raw = Array.from({ length: N }, (_, i) => {
    const t = (i / (N - 1)) * (pts.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(lo + 1, pts.length - 1);
    const c = pts[lo]! + (pts[hi]! - pts[lo]!) * (t - lo);
    return {
      c,
      hOff: rng(seed + i * 7 + 1) * wick + wick * 0.25,
      lOff: rng(seed + i * 7 + 2) * wick + wick * 0.25,
      vol: 0.2 + rng(seed + i * 7 + 3) * 0.8,
    };
  });
  return raw.map((d, i) => {
    const open = i === 0 ? d.c : raw[i - 1]!.c;
    return {
      o: open,
      c: d.c,
      h: Math.max(open, d.c) + d.hOff,
      l: Math.min(open, d.c) - d.lOff,
      vol: d.vol,
    };
  });
}

function TerminalChart({ tf }: { tf: Timeframe }) {
  const candles = buildCandles(EURUSD_PTS, TF_SEEDS[tf]);

  const VH = 302;
  const cTop = 10,
    cBot = 238,
    cLeft = 6,
    cRight = 504;
  // Fixed-width price axis, decoupled from container width so it never leaves
  // dead space on wide screens. ponytail: bump if 5-digit labels ever overflow.
  const AXIS_W = 60;
  const cW = cRight - cLeft,
    cH = cBot - cTop;
  const vTop = 246,
    vBot = 278;

  const allP = candles.flatMap((d) => [d.h, d.l]);
  const minP = Math.min(...allP),
    maxP = Math.max(...allP);
  const span = maxP - minP || 1;
  const pad = span * 0.15;
  const pLo = minP - pad,
    pHi = maxP + pad;

  const py = (v: number) => parseFloat((cTop + (1 - (v - pLo) / (pHi - pLo)) * cH).toFixed(2));
  const toPrice = (v: number) => BASE_PRICE + ((v - pLo) / (pHi - pLo)) * PRICE_RNG;

  const maxVol = Math.max(...candles.map((d) => d.vol));
  const slotW = cW / candles.length;
  const bodyW = Math.max(Math.floor(slotW * 0.55), 2);

  const last = candles[candles.length - 1]!;
  const lastY = py(last.c);
  const BULL = '#26A69A',
    BEAR = '#EF5350';
  const priceColor = last.c >= last.o ? BULL : BEAR;

  const gridLevels = [0.2, 0.4, 0.6, 0.8].map((r) => pLo + r * (pHi - pLo));

  return (
    <div className="relative w-full bg-[#0D0F14]" style={{ height: 320 }}>
      {/* Chart SVG fills everything except the fixed price-axis column on the right.
          Geometry only, no text (HTML overlay handles labels to avoid distortion). */}
      <svg
        viewBox={`0 0 ${cRight} ${VH}`}
        height="100%"
        preserveAspectRatio="none"
        className="absolute inset-y-0 left-0 block"
        style={{ width: `calc(100% - ${AXIS_W}px)` }}
      >
        <rect width={cRight} height={VH} fill="#0D0F14" />

        {/* Chart / axis divider */}
        <line
          x1={cRight}
          x2={cRight}
          y1={0}
          y2={VH}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {gridLevels.map((lv, i) => (
          <line
            key={i}
            x1={cLeft}
            x2={cRight}
            y1={py(lv)}
            y2={py(lv)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Candlesticks */}
        {candles.map((c, i) => {
          const cx = cLeft + i * slotW + slotW / 2;
          const isBull = c.c >= c.o;
          const color = isBull ? BULL : BEAR;
          const bTop = py(Math.max(c.o, c.c));
          const bBot = py(Math.min(c.o, c.c));
          const bH = Math.max(bBot - bTop, 1);
          return (
            <g key={i} opacity={i === candles.length - 1 ? 1 : 0.88}>
              <line x1={cx} x2={cx} y1={py(c.h)} y2={py(c.l)} stroke={color} strokeWidth="1" />
              <rect x={cx - bodyW / 2} y={bTop} width={bodyW} height={bH} fill={color} rx="0.5" />
            </g>
          );
        })}

        {/* Current price dashed line */}
        <line
          x1={cLeft}
          x2={cRight}
          y1={lastY}
          y2={lastY}
          stroke={priceColor}
          strokeWidth="0.8"
          strokeDasharray="4,3"
        />

        {/* Volume bars */}
        {candles.map((c, i) => {
          const cx = cLeft + i * slotW + slotW / 2;
          const vh = (c.vol / maxVol) * (vBot - vTop);
          return (
            <rect
              key={i}
              x={cx - bodyW / 2}
              y={vBot - vh}
              width={bodyW}
              height={vh}
              fill={c.c >= c.o ? BULL : BEAR}
              opacity="0.4"
              rx="0.5"
            />
          );
        })}
        <line
          x1={cLeft}
          x2={cRight}
          y1={vTop}
          y2={vTop}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      </svg>

      {/* Price axis labels — fixed-width column, HTML overlay so text never distorts */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0"
        style={{ width: AXIS_W }}
      >
        {gridLevels.map((lv, i) => (
          <div
            key={i}
            className="absolute left-1 font-mono text-[8px] text-white/40"
            style={{ top: `${(py(lv) / VH) * 100}%`, transform: 'translateY(-50%)' }}
          >
            {toPrice(lv).toFixed(5)}
          </div>
        ))}

        {/* Current price pill */}
        <div
          className="absolute inset-x-0 flex items-center pl-[3px]"
          style={{ top: `${(lastY / VH) * 100}%`, transform: 'translateY(-50%)' }}
        >
          <div
            className="rounded-[3px] px-[5px] py-[2px] font-mono text-[7.5px] font-bold leading-none text-white"
            style={{ backgroundColor: priceColor }}
          >
            {toPrice(last.c).toFixed(5)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bid / Ask panel (replaces TradingView symbol-info) ────────────────────────

function BidAskPanel() {
  const [vol, setVol] = useState(0.1);

  return (
    <div className="border-t border-white/[0.08]">
      <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
        {/* BUY / Ask */}
        <div className="px-4 py-4">
          <p className="font-body mb-[3px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#26A69A]">
            BUY
          </p>
          <p className="font-mono text-[22px] font-bold leading-none text-[#26A69A]">1.08562</p>
          <p className="font-body mt-1 text-[10px] text-white/35">Ask</p>
        </div>
        {/* SELL / Bid */}
        <div className="px-4 py-4">
          <p className="font-body mb-[3px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#EF5350]">
            SELL
          </p>
          <p className="font-mono text-[22px] font-bold leading-none text-[#EF5350]">1.08549</p>
          <p className="font-body mt-1 text-[10px] text-white/35">Bid</p>
        </div>
      </div>

      {/* Volume row */}
      <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3">
        <span className="font-body text-[11px] text-white/40">Volume (lots)</span>
        <div className="flex items-center gap-[6px]">
          <span className="font-mono text-[13px] font-semibold text-white">{vol.toFixed(2)}</span>
          <button
            onClick={() => setVol((v) => Math.max(0.01, parseFloat((v - 0.01).toFixed(2))))}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white/10 text-[14px] text-white/70 transition-colors hover:bg-white/20"
            aria-label="Decrease volume"
          >
            −
          </button>
          <button
            onClick={() => setVol((v) => parseFloat((v + 0.01).toFixed(2)))}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white/10 text-[14px] text-white/70 transition-colors hover:bg-white/20"
            aria-label="Increase volume"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function WebTraderPage() {
  const t = useTranslations('webtrader');
  const [tf, setTf] = useState<Timeframe>('H1');

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="px-5 pb-6 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:last-child]:font-body mb-2 [&>span:first-child]:hidden [&>span:last-child]:text-[11px] [&>span:last-child]:font-semibold [&>span:last-child]:uppercase [&>span:last-child]:leading-[100%] [&>span:last-child]:tracking-[0.08em] [&>span:last-child]:text-[#1AD966]">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[44px] font-semibold leading-[1.05] tracking-[-1.54px]">
            {t('heading')}
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* ── Trading Terminal Panel ─────────────────────────────────── */}
      <section className="px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111111]">
            {/* Ticker bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1AD966]" />
                <span className="font-sans text-[13px] font-semibold text-white">EURUSD</span>
                <span className="font-mono text-[12px] font-semibold text-white">1.0856</span>
                <span className="font-body text-[11px] text-[#26A69A]">+0.14%</span>
              </div>
              <div className="flex gap-[2px]">
                {TIMEFRAMES.map((t_) => (
                  <button
                    key={t_}
                    onClick={() => setTf(t_)}
                    className={`rounded-[6px] px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                      tf === t_ ? 'bg-[#1AD966] text-[#111]' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {t_}
                  </button>
                ))}
              </div>
            </div>

            {/* Candlestick chart */}
            <TerminalChart tf={tf} />

            {/* BUY / SELL + volume */}
            <BidAskPanel />

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-2">
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">
                {t('poweredBy')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fallback Card ─────────────────────────────────────────── */}
      <section className="px-5 pb-8">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[18px] border border-[#F97316]/20 bg-[#FFF7ED] p-5 dark:border-[#F97316]/15 dark:bg-[#1a130a]">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#F97316]/15">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 6v3M8 11v.5"
                    stroke="#F97316"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.8 2.5L1.5 12a1.4 1.4 0 001.2 2h10.6a1.4 1.4 0 001.2-2L9.2 2.5a1.4 1.4 0 00-2.4 0z"
                    stroke="#F97316"
                    strokeWidth="1.3"
                  />
                </svg>
              </span>
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#F97316]">
                FALLBACK STATE
              </span>
            </div>
            <p className="mb-1 font-sans text-[15px] font-semibold text-[#111] dark:text-white">
              {t('fallbackHeading')}
            </p>
            <p className="font-body mb-4 text-[12px] leading-[1.55] text-[#6b7280] dark:text-white/60">
              {t('fallbackDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#111] px-4 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#222] dark:bg-white/10 dark:hover:bg-white/20">
                {t('fallbackDesktopBtn')}
              </button>
              <button className="hover:text-accent dark:hover:text-accent inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[12px] font-medium text-[#111] transition-colors dark:text-white/70">
                {t('fallbackMobileBtn')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1]">
            {t('feat1Title')}
            <br />
            <span className="text-accent">{t('feat1Sub')}</span>
          </h2>
          <div className="flex flex-col gap-[10px]">
            {FEATURES.map((feat) => (
              <div
                key={feat.idx}
                className="flex items-start gap-3 rounded-[16px] bg-[#FAFAF9] px-4 py-4 dark:bg-[#16181d]"
              >
                <CheckCircle />
                <div>
                  <p className="text-foreground mb-0.5 font-sans text-[14px] font-semibold">
                    {t(`feat${feat.idx}Title` as 'feat2Title')}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-relaxed">
                    {t(`feat${feat.idx}Desc` as 'feat2Desc')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Launch CTA ────────────────────────────────────────────── */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <button className="bg-accent flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-sans text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(0,176,80,0.35)] transition-all duration-200 hover:bg-[#00c85a] hover:shadow-[0_12px_32px_rgba(0,176,80,0.45)] active:scale-[0.98]">
            {t('ctaBtn')}
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}
