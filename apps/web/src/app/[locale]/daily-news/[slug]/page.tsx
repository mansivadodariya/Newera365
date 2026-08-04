import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResearchDetailPage, CtaBanner } from '@newera365/ui';
import type { ArticleDetailData, RelatedArticle } from '@newera365/ui';
import { LOCALES } from '@newera365/types';
import { getNews, getNewsBySlug, slugToTitle } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

// Pre-render published news at build time (slugs are locale-neutral). Unknown
// slugs still render on demand via the static fallback in ResearchDetailPage.
export async function generateStaticParams() {
  const items = await getNews('en', 100);
  return LOCALES.flatMap((locale) => items.map((n) => ({ locale, slug: n.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsBySlug(params.slug, params.locale);
  if (!news) {
    // No CMS doc: the page still renders generic fallback content, so give it a
    // slug-derived title instead of the bare site default.
    const isAr = params.locale === 'ar';
    return {
      title: slugToTitle(params.slug),
      description: isAr ? 'آخر أخبار الأسواق من Newera.' : 'Latest market news from Newera.',
      // notFound() on ISR-filled dynamic routes responds 200 (soft-404), so keep
      // deleted/unknown slugs out of search indexes explicitly.
      robots: { index: false, follow: false },
    };
  }
  return {
    title: news.seoTitle || news.headline,
    description: news.seoDescription || '',
  };
}

export default async function DailyNewsDetailRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const news = await getNewsBySlug(params.slug, params.locale);
  if (!news) notFound();

  const featuredImage = news.featuredImage;
  const imageUrl =
    featuredImage && typeof featuredImage !== 'number' ? (featuredImage.url ?? null) : null;

  const article: ArticleDetailData = {
    title: news.headline,
    category: news.category,
    author: news.source,
    date: news.publishedDate,
    image: imageUrl,
    imageAlt: news.headline,
    body: news.body,
  };

  // "Keep reading" — other published news items with their CMS cover images.
  const all = await getNews(params.locale, 6);
  const relatedArticles: RelatedArticle[] = all
    .filter((n) => n.slug !== params.slug)
    .slice(0, 3)
    .map((n) => ({
      slug: n.slug,
      category: n.category,
      title: n.title,
      image: n.thumbnailUrl,
    }));

  return (
    <>
      <ResearchDetailPage
        slug={params.slug}
        article={article}
        relatedArticles={relatedArticles}
        basePath="daily-news"
      />
      <CtaBanner />
    </>
  );
}
