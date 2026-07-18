'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MARKET_POINTS,
  REGION_PATHS,
  WORLD_LAND_PATH,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from '../../lib/worldMapData';

/**
 * "Where we focus" world map (About page).
 *
 * A full-width flat world silhouette (generated SVG path, see
 * apps/web/scripts/generate-world-map.mjs) with the four focus markets as lit
 * country fills, pulsing anchor dots at their financial capitals and glass
 * label chips naming each market. Flight arcs launch between random pairs of
 * markets on a continuous loop: each draws itself in, then travels out toward
 * its destination like a departing route, over a faint dashed network.
 *
 * Pure SVG + framer-motion: server-rendered, theme-adaptive via classes,
 * no WebGL or map libraries. Labels are HTML overlays positioned in map
 * percentages so they stay legible at every viewport size.
 */

export type FocusRegionId = keyof typeof MARKET_POINTS;

export interface FocusRegionCopy {
  id: FocusRegionId;
  name: string;
}

const ARC_SPAWN_MS = 1500; // a new flight arc launches this often
const ARC_S = 2.6; // full arc lifecycle: draw in, then travel out
const MAX_ARCS = 4; // concurrent flights kept on screen

// Label chips (sm+ only; mobile uses the legend row below the map) are
// nudged per market so they sit over ocean or quiet land instead of
// covering the lit regions.
const LABEL_TRANSFORM: Record<FocusRegionId, string> = {
  mena: 'translate(-78%, calc(-100% - 8px))',
  india: 'translate(-50%, 12px)',
  vietnam: 'translate(-15%, calc(-100% - 8px))',
  indonesia: 'translate(-40%, 12px)',
};

interface Point {
  x: number;
  y: number;
}

interface FlightArc {
  id: number;
  d: string;
}

// Quadratic arc between two anchors; lift > 0 bows above the midpoint,
// lift < 0 below, so repeated routes take visibly different ways.
const arcPath = (a: Point, b: Point, lift: number) => {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - dist * lift;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export interface FocusMarketsProps {
  regions: FocusRegionCopy[];
  mapAriaLabel: string;
}

export function FocusMarkets({ regions, mapAriaLabel }: FocusMarketsProps) {
  const [hoverId, setHoverId] = useState<FocusRegionId | null>(null);
  const [arcs, setArcs] = useState<FlightArc[]>([]);
  const arcIdRef = useRef(0);
  const lastPairRef = useRef('');
  const reduced = usePrefersReducedMotion();

  // Ambient flight loop: launch an arc between a random pair of markets,
  // never repeating the exact same route twice in a row.
  useEffect(() => {
    if (reduced || regions.length < 2) return;
    const spawn = () => {
      if (document.hidden) return;
      const ids = regions.map((r) => r.id);
      const from = ids[Math.floor(Math.random() * ids.length)]!;
      let to = from;
      while (to === from) to = ids[Math.floor(Math.random() * ids.length)]!;
      const pair = `${from}-${to}`;
      if (pair === lastPairRef.current) return;
      lastPairRef.current = pair;
      const lift = (0.22 + Math.random() * 0.34) * (Math.random() < 0.72 ? 1 : -1);
      setArcs((cur) => [
        ...cur.slice(-(MAX_ARCS - 1)),
        { id: ++arcIdRef.current, d: arcPath(MARKET_POINTS[from], MARKET_POINTS[to], lift) },
      ]);
    };
    spawn();
    const timer = setInterval(spawn, ARC_SPAWN_MS);
    return () => clearInterval(timer);
  }, [reduced, regions]);

  // Faint dashed route network under the flights (reference-image style).
  const routeArcs = regions.map((r, i) => {
    const next = regions[(i + 1) % regions.length] ?? r;
    return {
      key: `${r.id}-${next.id}`,
      d: arcPath(MARKET_POINTS[r.id], MARKET_POINTS[next.id], 0.4),
    };
  });

  return (
    // max-w in vh units caps the rendered map height at roughly 72vh while
    // preserving the aspect ratio, so the section always fits the screen.
    <div className="relative mx-auto mt-10 w-full max-w-[112vh] xl:mt-12">
      <svg
        viewBox={`0 0 ${WORLD_MAP_WIDTH} ${WORLD_MAP_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={mapAriaLabel}
      >
        <defs>
          {/* Deeper greens in light mode so arcs hold contrast on paper */}
          <linearGradient id="focus-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00B050" stopOpacity="0" />
            <stop offset="45%" stopColor="#009247" className="dark:[stop-color:#00B050]" />
            <stop offset="100%" stopColor="#007A3B" className="dark:[stop-color:#1AD966]" />
          </linearGradient>
          <filter id="focus-arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Land silhouette */}
        <path d={WORLD_LAND_PATH} className="fill-[#2A4A39] dark:fill-[#2C4136]" stroke="none" />

        {/* Focus markets as lit country fills */}
        {regions.map((r) => (
          <path
            key={r.id}
            d={REGION_PATHS[r.id]}
            className={`transition-[fill] duration-300 ${
              r.id === hoverId
                ? 'fill-[#1AD966]'
                : 'fill-[rgba(0,176,80,0.6)] dark:fill-[rgba(0,176,80,0.55)]'
            }`}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverId(r.id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHoverId(null)}
          />
        ))}

        {/* Dashed route network (static, reference-image style) */}
        {routeArcs.map((a) => (
          <path
            key={a.key}
            d={a.d}
            fill="none"
            strokeWidth="1.1"
            strokeDasharray="3 6"
            strokeLinecap="round"
            className="stroke-[rgba(0,176,80,0.4)] dark:stroke-[rgba(26,217,102,0.3)]"
          />
        ))}

        {/* Ambient flight arcs: draw in, then travel out toward the destination.
            Each arc is a blurred glow underlay plus a crisp line on top. */}
        {arcs.map((arc) => (
          <g key={arc.id}>
            <motion.path
              d={arc.d}
              fill="none"
              stroke="url(#focus-arc-gradient)"
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#focus-arc-glow)"
              opacity="0.55"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: [0, 1, 0.02], pathOffset: [0, 0, 0.98] }}
              transition={{ duration: ARC_S, times: [0, 0.5, 1], ease: 'easeInOut' }}
            />
            <motion.path
              d={arc.d}
              fill="none"
              stroke="url(#focus-arc-gradient)"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: [0, 1, 0.02], pathOffset: [0, 0, 0.98] }}
              transition={{ duration: ARC_S, times: [0, 0.5, 1], ease: 'easeInOut' }}
              onAnimationComplete={() => setArcs((cur) => cur.filter((x) => x.id !== arc.id))}
            />
          </g>
        ))}

        {/* Market anchor dots + pulses */}
        {regions.map((r, i) => {
          const p = MARKET_POINTS[r.id];
          const isHovered = r.id === hoverId;
          return (
            <g key={r.id}>
              {!reduced && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  fill="none"
                  strokeWidth="1.2"
                  className="stroke-[#00B050] dark:stroke-[#1AD966]"
                  initial={{ r: 5, opacity: 0.55 }}
                  animate={{ r: 18, opacity: 0 }}
                  transition={{
                    duration: 2.2,
                    ease: 'easeOut',
                    repeat: Infinity,
                    delay: i * 0.55,
                  }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6.5 : 5}
                className={`transition-all duration-300 ${
                  isHovered ? 'fill-[#1AD966]' : 'fill-[#00B050]'
                }`}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                fill="none"
                strokeWidth="1.2"
                className={`transition-opacity duration-300 ${
                  isHovered ? 'stroke-[#1AD966] opacity-100' : 'stroke-[#00B050] opacity-40'
                }`}
              />
            </g>
          );
        })}
      </svg>

      {/* Market labels: quiet glass chips pinned near their dots (sm+ only,
          sized and placed to cover as little of the map as possible) */}
      {regions.map((r) => {
        const p = MARKET_POINTS[r.id];
        return (
          <div
            key={r.id}
            aria-hidden="true"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverId(r.id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHoverId(null)}
            className={`border-border/70 rounded-pill absolute hidden border bg-white/70 px-2.5 py-1 backdrop-blur-sm transition-colors duration-300 sm:block dark:border-white/[0.12] dark:bg-[#0d1512]/70 ${
              r.id === hoverId ? 'border-accent/45 dark:border-accent-bright/60' : ''
            }`}
            style={{
              left: `${(p.x / WORLD_MAP_WIDTH) * 100}%`,
              top: `${(p.y / WORLD_MAP_HEIGHT) * 100}%`,
              transform: LABEL_TRANSFORM[r.id],
            }}
          >
            <span className="text-foreground whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.14em]">
              {r.name}
            </span>
          </div>
        );
      })}

      {/* Mobile legend: names live under the map so nothing covers it */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:hidden">
        {regions.map((r) => (
          <span key={r.id} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-accent h-1.5 w-1.5 rounded-full" />
            <span className="text-foreground font-mono text-[10px] font-medium uppercase tracking-[0.14em]">
              {r.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
