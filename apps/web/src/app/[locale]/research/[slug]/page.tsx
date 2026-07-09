import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResearchDetailPage, CtaBanner } from '@newera365/ui';
import type { ArticleDetailData, RelatedArticle, RelatedInstrument } from '@newera365/ui';
import { LOCALES } from '@newera365/types';
import { getMarketAnalysisBySlug, getResearchArticles, slugToTitle } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

// Pre-render published market-analysis articles at build (slugs locale-neutral).
export async function generateStaticParams() {
  const articles = await getResearchArticles('en', 100);
  return LOCALES.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getMarketAnalysisBySlug(params.slug, params.locale);
  if (!article) {
    // No CMS doc: the page still renders generic fallback content, so give it a
    // slug-derived title instead of the bare site default.
    const isAr = params.locale === 'ar';
    return {
      title: slugToTitle(params.slug),
      description: isAr
        ? 'تحليلات وأبحاث الأسواق من مكتب NewEra365.'
        : 'Market analysis and research from the NewEra365 desk.',
      // notFound() on ISR-filled dynamic routes responds 200 (soft-404), so keep
      // deleted/unknown slugs out of search indexes explicitly.
      robots: { index: false, follow: false },
    };
  }
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

  const featuredImage = analysis.featuredImage;
  const imageUrl =
    featuredImage && typeof featuredImage !== 'number' ? (featuredImage.url ?? null) : null;

  const article: ArticleDetailData = {
    title: analysis.title,
    category: analysis.assetCategory,
    author: analysis.analyst,
    date: analysis.publishedDate,
    image: imageUrl,
    imageAlt: analysis.title,
    body: analysis.body,
    chartEmbed: analysis.chartEmbed,
    relatedInstruments,
  };

  // "Keep reading" — other published articles with their CMS cover images.
  const all = await getResearchArticles(params.locale, 6);
  const relatedArticles: RelatedArticle[] = all
    .filter((a) => a.slug !== params.slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      category: a.category,
      title: a.title,
      image: a.thumbnailUrl,
    }));

  return (
    <>
      <ResearchDetailPage
        slug={params.slug}
        article={article}
        relatedArticles={relatedArticles}
        basePath="research"
      />
      <CtaBanner />
    </>
  );
}
