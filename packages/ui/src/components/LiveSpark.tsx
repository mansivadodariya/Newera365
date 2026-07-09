'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * LiveSpark: the "living quote board" cell for a market tile.
 *
 * Split into two pieces:
 *   1. useLiveInstrumentPrices(): a SINGLE shared poll (grid level). It hits
 *      /api/mt5/instruments once per interval and returns a { symbol: price }
 *      map. One interval serves all six tiles; we never fire six requests.
 *   2. LiveSpark (default): presentational. Given a symbol + its latest
 *      price it keeps a short rolling series, draws a ~24-point sparkline, shows
 *      the mono price, and flashes green up / red down on each tick.
 *
 * Graceful by contract: when the price is missing (MT5 sync off, fetch failed,
 * symbol absent) LiveSpark renders nothing so the tile keeps its static count.
 *
 * ponytail: this is a poll (every POLL_INTERVAL_MS). The upgrade path once the
 * real MT5 Manager client lands (NE-003) is a single server-sent-events stream
 * pushing ticks, replacing the fetch-on-interval loop below with one EventSource.
 */

const POLL_INTERVAL_MS = 4000;
const MAX_POINTS = 24;

const CMS_BASE = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';

/** Derive a single representative price from an instrument row. Prefers the mid
 * of bid/ask, then bid, then ask. Returns null when none are finite. */
function representativePrice(row: unknown): number | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as { bid?: unknown; ask?: unknown };
  const bid = typeof r.bid === 'number' && Number.isFinite(r.bid) ? r.bid : null;
  const ask = typeof r.ask === 'number' && Number.isFinite(r.ask) ? r.ask : null;
  if (bid != null && ask != null) return (bid + ask) / 2;
  if (bid != null) return bid;
  if (ask != null) return ask;
  return null;
}

/**
 * Shared poll. Fetches the whole instrument list once per interval and returns
 * a symbol->price map. SSR-safe: does nothing until mounted in the browser and
 * returns an empty map on the server / first client render (so tiles paint
 * their static count and hydration matches).
 */
export function useLiveInstrumentPrices(): Record<string, number> {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), POLL_INTERVAL_MS - 200);
        const res = await fetch(`${CMS_BASE}/api/mt5/instruments`, {
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) return;
        const json = (await res.json()) as { data?: Array<{ symbol?: string }> };
        if (cancelled || !Array.isArray(json.data)) return;

        const next: Record<string, number> = {};
        for (const row of json.data) {
          const symbol = row?.symbol;
          if (typeof symbol !== 'string') continue;
          const price = representativePrice(row);
          if (price != null) next[symbol] = price;
        }
        // Only commit when we actually resolved prices: a fallback response with
        // no bid/ask must never wipe a good previous map (avoids flicker to blank).
        if (Object.keys(next).length > 0) setPrices(next);
      } catch {
        // Network error, abort, or bad JSON: stay silent, keep the last good map.
      }
    };

    poll();
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return prices;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/** Format a price with a decimal count sensible for its magnitude. Uses en-US
 * explicitly so the mono row is stable regardless of locale (no RTL digits). */
function formatPrice(p: number): string {
  const abs = Math.abs(p);
  let decimals: number;
  if (abs >= 100) decimals = 2;
  else if (abs >= 10) decimals = 3;
  else if (abs >= 1) decimals = 4;
  else decimals = 5;
  return p.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Build an SVG polyline `points` string for the series inside a 64x16 box. */
function buildPoints(series: number[]): string {
  const W = 64;
  const H = 16;
  const pad = 1.5;
  const n = series.length;
  if (n === 0) return '';
  if (n === 1) return `0,${H / 2} ${W},${H / 2}`;
  let min = Infinity;
  let max = -Infinity;
  for (const v of series) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;
  return series
    .map((v, i) => {
      const x = (i / (n - 1)) * W;
      const y = H - pad - ((v - min) / span) * (H - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

type TickDir = 'up' | 'down' | 'flat';

export interface LiveSparkProps {
  symbol: string;
  /** Latest representative price from the shared poll, or undefined when unknown. */
  price?: number;
  className?: string;
}

export function LiveSpark({ symbol, price, className }: LiveSparkProps) {
  const reduced = usePrefersReducedMotion();
  const [series, setSeries] = useState<number[]>([]);
  const [dir, setDir] = useState<TickDir>('flat');
  const [flashNonce, setFlashNonce] = useState(0);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof price !== 'number' || !Number.isFinite(price)) return;
    const prev = lastRef.current;
    if (prev != null && price === prev) return; // no change, no tick

    if (prev != null) {
      setDir(price > prev ? 'up' : price < prev ? 'down' : 'flat');
      if (!reduced && price !== prev) setFlashNonce((n) => n + 1);
    }
    lastRef.current = price;
    setSeries((s) => {
      // Seed from the first value as a short flat series so the line has shape
      // immediately; append and cap at MAX_POINTS thereafter.
      const base = s.length === 0 ? [price] : s;
      const next = [...base, price];
      return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
    });
  }, [price, reduced]);

  const points = useMemo(() => buildPoints(series), [series]);

  // Nothing to show yet (SSR, pre-first-tick, missing symbol): let the tile
  // fall back to its static count. Never blocks paint, never errors.
  if (typeof price !== 'number' || !Number.isFinite(price) || series.length === 0) {
    return null;
  }

  const priceColor =
    dir === 'up'
      ? 'text-accent-bright'
      : dir === 'down'
        ? 'text-down'
        : 'text-white/90';

  return (
    <span
      className={`relative flex items-center gap-2 ${className ?? ''}`}
      aria-label={`${symbol} live price ${formatPrice(price)}`}
    >
      {/* Tick flash: remounts on each tick (key=nonce) to restart the keyframe.
          Suppressed entirely under reduced motion. */}
      {!reduced && flashNonce > 0 && (
        <span
          key={flashNonce}
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-x-1 -inset-y-0.5 rounded ${
            dir === 'up' ? 'animate-flash-up' : dir === 'down' ? 'animate-flash-down' : ''
          }`}
        />
      )}
      <svg
        viewBox="0 0 64 16"
        width="52"
        height="14"
        className="text-accent/80 shrink-0 overflow-visible"
        fill="none"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        dir="ltr"
        className={`relative font-mono text-[12px] font-semibold tabular-nums tracking-tight ${priceColor} ${
          reduced ? '' : 'transition-colors duration-500'
        }`}
      >
        {formatPrice(price)}
      </span>
    </span>
  );
}
