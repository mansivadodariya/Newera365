import { setRequestLocale } from 'next-intl/server';
import { ResearchPage, CtaBanner } from '@newera365/ui';
import type { Metadata } from 'next';
import { fetchCollection } from '@/lib/cms';
import type { CmsNews, CmsArticle } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Daily News | NewEra365',
  description: 'Latest forex, commodities, indices and crypto market news.',
};

// Map news category to the assetCategory field ResearchPage expects
const NEWS_CAT_TO_ASSET: Record<string, CmsArticle['assetCategory']> = {
  forex: 'forex',
  commodities: 'commodities',
  indices: 'indices',
  crypto: 'crypto',
  company: 'stocks',
  regulation: 'etfs',
};

export default async function DailyNewsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const data = await fetchCollection<CmsNews>(
    'news',
    {
      'where[status][equals]': 'published',
      sort: '-publishedDate',
      limit: '20',
    },
    params.locale,
  );

  const cmsArticles: CmsArticle[] = data.docs.map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.headline,
    assetCategory: NEWS_CAT_TO_ASSET[n.category] ?? 'forex',
    analyst: n.source ?? null,
    publishedDate: n.publishedDate,
    status: n.status,
  }));

  return (
    <>
      <ResearchPage
        cmsArticles={cmsArticles.length > 0 ? cmsArticles : undefined}
        basePath="daily-news"
      />
      <CtaBanner />
    </>
  );
}
