'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

type Timeframe = 'M5' | 'M15' | 'H1' | 'D1';
const TIMEFRAMES: Timeframe[] = ['M5', 'M15', 'H1', 'D1'];

// ── Capability icons ──────────────────────────────────────────────────────────

function IconStream() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1 10h3l2-5 3 10 2.5-7 1.5 4h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconMt5() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <polyline
        points="2,14 7,9 11,12 18,5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 5v4M18 5h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <line x1="5" y1="3" x2="5" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="6" width="3" height="6" rx="0.6" fill="currentColor" />
      <line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="8" width="3" height="5" rx="0.6" fill="currentColor" />
    </svg>
  );
}
function IconDepth() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h11M3 8.5h7M3 12h9M3 15.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 10h15M10 2.5v15" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// The six capabilities read as a real terminal's spec list (keys feat2..feat7).
const CAPABILITIES = [
  { idx: 2, Icon: IconStream },
  { idx: 3, Icon: IconMt5 },
  { idx: 4, Icon: IconLock },
  { idx: 5, Icon: IconChart },
  { idx: 6, Icon: IconDepth },
  { idx: 7, Icon: IconGlobe },
] as const;

// Terminal ledger: factual MetaTrader 5 platform specs (not performance claims).
const SPECS = [
  { label: 'specMarkets', value: '2,000+' },
  { label: 'specPlatform', value: 'MetaTrader 5' },
  { label: 'specTimeframes', value: '21' },
  { label: 'specChartTypes', value: '3' },
  { label: 'specIndicators', value: '38+' },
  { label: 'specOrderTypes', value: '6' },
] as const;

export interface CmsWebTraderSpec {
  valueEn: string;
  valueAr: string;
  labelEn: string;
  labelAr: string;
  id?: string | null;
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

// Maps to real EUR/USD price range ~1.0820..1.0865
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

      {/* Price axis labels: fixed-width column, HTML overlay so text never distorts */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0"
        style={{ width: AXIS_W }}
      >
        {gridLevels.map((lv, i) => (
          <div
            key={i}
            className="absolute left-1 font-mono text-[8px] tabular-nums text-white/40"
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
            className="rounded-[3px] px-[5px] py-[2px] font-mono text-[7.5px] font-bold leading-none tabular-nums text-white"
            style={{ backgroundColor: priceColor }}
          >
            {toPrice(last.c).toFixed(5)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bid / Ask panel (the terminal's dealing rail) ─────────────────────────────

function BidAskPanel() {
  const t = useTranslations('webtrader');
  const [vol, setVol] = useState(0.1);

  return (
    <div className="border-t border-white/[0.08]">
      <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
        {/* BUY / Ask */}
        <div className="px-4 py-4">
          <p className="font-body mb-[3px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#26A69A]">
            {t('buyLabel')}
          </p>
          <p dir="ltr" className="w-fit font-mono text-[22px] font-bold leading-none tabular-nums text-[#26A69A]">
            1.08562
          </p>
          <p className="font-body mt-1 text-[10px] text-white/35">{t('askLabel')}</p>
        </div>
        {/* SELL / Bid */}
        <div className="px-4 py-4">
          <p className="font-body mb-[3px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#EF5350]">
            {t('sellLabel')}
          </p>
          <p dir="ltr" className="w-fit font-mono text-[22px] font-bold leading-none tabular-nums text-[#EF5350]">
            1.08549
          </p>
          <p className="font-body mt-1 text-[10px] text-white/35">{t('bidLabel')}</p>
        </div>
      </div>

      {/* Volume row */}
      <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3">
        <span className="font-body text-[11px] text-white/40">{t('volumeLabel')}</span>
        <div className="flex items-center gap-[6px]">
          <span dir="ltr" className="font-mono text-[13px] font-semibold tabular-nums text-white">
            {vol.toFixed(2)}
          </span>
          <button
            onClick={() => setVol((v) => Math.max(0.01, parseFloat((v - 0.01).toFixed(2))))}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white/10 text-[14px] text-white/70 transition-colors hover:bg-white/20 active:scale-[0.94]"
            aria-label="Decrease volume"
          >
            −
          </button>
          <button
            onClick={() => setVol((v) => parseFloat((v + 0.01).toFixed(2)))}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white/10 text-[14px] text-white/70 transition-colors hover:bg-white/20 active:scale-[0.94]"
            aria-label="Increase volume"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="rtl:-scale-x-100" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface WebTraderPageProps {
  specs?: CmsWebTraderSpec[];
}

export function WebTraderPage({ specs }: WebTraderPageProps = {}) {
  const t = useTranslations('webtrader');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [tf, setTf] = useState<Timeframe>('H1');

  const CONTAINER = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';

  // Specs ledger: CMS-driven when seeded, falling back to the static defaults + i18n labels otherwise.
  const specTiles =
    specs && specs.length > 0
      ? specs.map((s, idx) => ({
          key: s.id ?? String(idx),
          label: isAr ? s.labelAr : s.labelEn,
          value: isAr ? s.valueAr : s.valueEn,
        }))
      : SPECS.map((s) => ({ key: s.label, label: t(s.label as 'specMarkets'), value: s.value }));

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="px-5 pb-6 pt-9">
        <ScrollReveal className={CONTAINER}>
          <SectionKicker className="[&>span:first-child]:bg-accent text-foreground mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground text-display mb-4 font-sans [text-wrap:balance]">
            {t('heading')}
          </h1>
          <p className="font-body text-lead text-muted max-w-[520px] dark:text-white/70">
            {t('subheading')}
          </p>
        </ScrollReveal>
      </section>

      {/* ── The terminal (showpiece) ───────────────────────────────── */}
      <section className="px-5 pb-6">
        <ScrollReveal className={CONTAINER}>
          <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111111] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]">
            {/* Ticker bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1AD966]" />
                <span className="font-sans text-[13px] font-semibold text-white">EURUSD</span>
                <span dir="ltr" className="font-mono text-[12px] font-semibold tabular-nums text-white">
                  1.0856
                </span>
                <span dir="ltr" className="font-body text-[11px] tabular-nums text-[#26A69A]">
                  +0.14%
                </span>
              </div>
              <div className="flex gap-[2px]">
                {TIMEFRAMES.map((t_) => (
                  <button
                    key={t_}
                    onClick={() => setTf(t_)}
                    className={`rounded-[6px] px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                      tf === t_ ? 'bg-accent-bright text-[#111]' : 'text-white/50 hover:text-white/80'
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

            {/* Footer: powered-by ledger line + contextual launch action */}
            <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                {t('poweredBy')}
              </p>
              <button className="bg-accent hover:bg-accent-bright inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 font-sans text-[13px] font-semibold text-white transition-all duration-200 hover:shadow-[0_10px_28px_-8px_rgba(26,217,102,0.6)] active:scale-[0.98]">
                {t('ctaBtn')}
                <ArrowRight />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Fallback notice ───────────────────────────────────────── */}
      <section className="px-5 pb-10">
        <ScrollReveal className={CONTAINER}>
          <div className="border-border shadow-card rounded-[20px] border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111111]">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F97316]/[0.12]">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 6v3M8 11v.5" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
                  <path
                    d="M6.8 2.5L1.5 12a1.4 1.4 0 001.2 2h10.6a1.4 1.4 0 001.2-2L9.2 2.5a1.4 1.4 0 00-2.4 0z"
                    stroke="#F97316"
                    strokeWidth="1.3"
                  />
                </svg>
              </span>
              <span className="text-eyebrow font-mono uppercase text-[#F97316]">
                {t('fallbackTag')}
              </span>
            </div>
            <p className="text-foreground text-title mb-2 font-sans font-semibold">
              {t('fallbackHeading')}
            </p>
            <p className="font-body text-muted text-body mb-5 leading-relaxed dark:text-white/60">
              {t('fallbackDesc')}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button className="bg-foreground text-background hover:bg-accent inline-flex h-11 items-center justify-center rounded-full px-5 font-sans text-[13px] font-semibold transition-colors duration-200 active:scale-[0.98] dark:bg-white/10 dark:text-white dark:hover:bg-accent">
                {t('fallbackDesktopBtn')}
              </button>
              <button className="border-border text-foreground hover:text-accent hover:border-accent/40 inline-flex h-11 items-center justify-center rounded-full border px-5 font-sans text-[13px] font-medium transition-colors duration-200 active:scale-[0.98] dark:border-white/10 dark:text-white/70">
                {t('fallbackMobileBtn')}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Terminal specs ledger ─────────────────────────────────── */}
      <section className="px-5 pb-12">
        <ScrollReveal className={CONTAINER}>
          <SectionKicker className="[&>span:first-child]:bg-accent text-foreground mb-4">
            {t('specsKicker')}
          </SectionKicker>
          <h2 className="text-foreground text-headline mb-8 font-sans">{t('specsHeading')}</h2>

          <div className="border-border shadow-card overflow-hidden rounded-[22px] border bg-white sm:grid sm:grid-cols-2 dark:border-white/[0.06] dark:bg-[#111111]">
            {specTiles.map((s) => (
              <div
                key={s.key}
                className="border-border flex items-center justify-between gap-4 border-b px-5 py-[18px] xl:px-6 sm:[&:nth-child(odd)]:border-e dark:border-white/[0.06]"
              >
                <span className="text-eyebrow text-muted font-mono uppercase">{s.label}</span>
                <span dir="ltr" className="text-foreground text-body-lg w-fit font-mono font-semibold tabular-nums">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Capabilities ──────────────────────────────────────────── */}
      <section className="px-5 pb-12">
        <ScrollReveal className={CONTAINER}>
          <SectionKicker className="[&>span:first-child]:bg-accent text-foreground mb-4">
            {t('capabilitiesKicker')}
          </SectionKicker>
          <h2 className="text-foreground text-headline mb-8 font-sans">
            {t('featuresHeading')} <span className="text-accent">{t('featuresHeadingAccent')}</span>
          </h2>
        </ScrollReveal>

        <div className={`${CONTAINER} grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4`}>
          {CAPABILITIES.map((cap, i) => (
            <ScrollReveal key={cap.idx} index={i}>
              <div className="group border-border shadow-card hover:border-accent/40 flex h-full flex-col gap-4 rounded-[18px] border bg-white p-5 transition-[border-color,box-shadow] duration-300 hover:shadow-[0_20px_48px_-18px_rgba(0,176,80,0.22)] xl:p-6 dark:border-white/[0.06] dark:bg-[#111111]">
                <div className="flex items-center justify-between">
                  <span className="bg-accent/10 text-accent group-hover:bg-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-300 group-hover:text-white">
                    <cap.Icon />
                  </span>
                  <span
                    dir="ltr"
                    className="text-muted group-hover:text-accent font-mono text-[13px] font-semibold tabular-nums transition-colors duration-300"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <p className="text-foreground text-body-lg mb-1.5 font-sans font-semibold">
                    {t(`feat${cap.idx}Title` as 'feat2Title')}
                  </p>
                  <p className="font-body text-muted text-body leading-relaxed dark:text-white/55">
                    {t(`feat${cap.idx}Desc` as 'feat2Desc')}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
