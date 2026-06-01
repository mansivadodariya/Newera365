import { setRequestLocale } from 'next-intl/server';
import { ResearchPage } from '@newera365/ui';
import type { ArticleItem } from '@newera365/ui';
import { getMarketAnalysis } from '@/lib/cms';
import type { CmsMarketAnalysis } from '@/lib/cms';

function mapAnalysisToArticle(a: CmsMarketAnalysis): ArticleItem {
  return {
    id: String(a.id),
    slug: a.slug,
    category: a.assetCategory,
    title: a.title,
    summary: a.analyst ? `By ${a.analyst}` : '',
    date: new Date(a.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    featured: false,
  };
}

export default async function ResearchRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const { docs } = await getMarketAnalysis(params.locale);
  const articles = docs.map(mapAnalysisToArticle);
  if (articles.length > 0) articles[0]!.featured = true;

  return <ResearchPage articles={articles.length > 0 ? articles : undefined} basePath="research" />;
}
