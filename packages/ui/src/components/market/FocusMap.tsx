'use client';

import { useState } from 'react';
import {
  MARKET_POINTS,
  REGION_PATHS,
  WORLD_LAND_PATH,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
} from '../../lib/worldMapData';

export type FocusRegionId = keyof typeof MARKET_POINTS;

export interface FocusRegionCopy {
  id: FocusRegionId;
  name: string;
}

export interface FocusMarketsProps {
  regions: FocusRegionCopy[];
  mapAriaLabel: string;
}

export function FocusMarkets({ regions, mapAriaLabel }: FocusMarketsProps) {
  const [hoverId, setHoverId] = useState<FocusRegionId | null>(null);

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

        {/* Focus markets & expanded global regions as lit light green country fills */}
        {Object.entries(REGION_PATHS).map(([regionId, pathD]) => (
          <path
            key={regionId}
            d={pathD}
            className={`transition-[fill] duration-300 ${
              regionId === hoverId
                ? 'fill-[#1AD966]'
                : 'fill-[rgba(0,176,80,0.75)] dark:fill-[rgba(0,176,80,0.7)]'
            }`}
            onPointerEnter={(e) =>
              e.pointerType === 'mouse' && setHoverId(regionId as FocusRegionId)
            }
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHoverId(null)}
          />
        ))}
      </svg>

      {/* Market labels: quiet glass chips pinned near their dots (sm+ only,
          sized and placed to cover as little of the map as possible) */}
      {/* {regions.map((r) => {
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
      })} */}

      {/* Mobile legend: names live under the map so nothing covers it */}
      {/* <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:hidden">
        {regions.map((r) => (
          <span key={r.id} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-accent h-1.5 w-1.5 rounded-full" />
            <span className="text-foreground font-mono text-[10px] font-medium uppercase tracking-[0.14em]">
              {r.name}
            </span>
          </span>
        ))}
      </div> */}
    </div>
  );
}
