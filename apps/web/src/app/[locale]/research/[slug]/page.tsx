import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResearchDetailPage } from '@newera365/ui';
import type { ArticleDetailData, RelatedInstrument } from '@newera365/ui';
import { getMarketAnalysisBySlug } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getMarketAnalysisBySlug(params.slug, params.locale);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || '',
  };
}

export default async function ResearchDetailRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const analysis = await getMarketAnalysisBySlug(params.slug, params.locale);
  if (!analysis) notFound();

  const relatedInstruments: RelatedInstrument[] | undefined = analysis.relatedInstruments
    ?.filter((i) => i && typeof i === 'object')
    .map((i) => ({
      id: i.id,
      name: i.name,
      symbol: i.symbol,
      assetClass: i.assetClass,
      spread: i.spread,
    }));

  const article: ArticleDetailData = {
    title: analysis.title,
    category: analysis.assetCategory,
    author: analysis.analyst,
    date: analysis.publishedDate,
    body: analysis.body,
    chartEmbed: analysis.chartEmbed,
    relatedInstruments,
  };

  return <ResearchDetailPage slug={params.slug} article={article} basePath="research" />;
}
