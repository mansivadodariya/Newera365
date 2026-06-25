'use client';

import {
  HeroSkeleton,
  TabRowSkeleton,
  TableSkeleton,
  DarkCtaSkeleton,
  CtaBannerSkeleton,
} from './SkeletonBlocks';

// Mirrors LiveWatchlistPage: hero, asset-class tab filter, a dark price table
// (the TradingView market-overview widget), then the dark CTA + route banner.
export function WatchlistSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={0} />
      <TabRowSkeleton tabs={4} />
      <TableSkeleton rows={9} />
      <DarkCtaSkeleton />
      <CtaBannerSkeleton />
    </div>
  );
}
