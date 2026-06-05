'use client';

import {
  Pulse,
  HeroSkeleton,
  TabRowSkeleton,
  ArticleListSkeleton,
  CtaBannerSkeleton,
} from './SkeletonBlocks';

export function ResearchListSkeleton() {
  return (
    <div className="bg-transparent">
      <HeroSkeleton buttons={1} />
      <TabRowSkeleton tabs={5} />
      <ArticleListSkeleton count={5} />
      <CtaBannerSkeleton />
    </div>
  );
}
