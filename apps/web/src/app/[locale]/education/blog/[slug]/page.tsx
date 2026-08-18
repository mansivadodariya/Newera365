import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResearchDetailPage, CtaBanner } from '@newera365/ui';
import type { ArticleDetailData, RelatedArticle } from '@newera365/ui';
import { LOCALES } from '@newera365/types';
import { getBlogPostBySlug, getBlogPosts, slugToTitle } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

// Pre-render published posts at build time (slugs are locale-neutral). Unknown
// slugs still render on demand via the static fallback in ResearchDetailPage.
export async function generateStaticParams() {
  const posts = await getBlogPosts('en', 100);
  return LOCALES.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug, params.locale);
  if (!post) {
    // No CMS doc: the page still renders generic fallback content, so give it a
    // slug-derived title instead of the bare site default.
    const isAr = params.locale === 'ar';
    return {
      title: slugToTitle(params.slug),
      description: isAr
        ? 'رؤى وتحليلات وتحديثات من فريق Newera.'
        : 'Insights, analysis, and updates from the Newera team.',
      // notFound() on ISR-filled dynamic routes responds 200 (soft-404), so keep
      // deleted/unknown slugs out of search indexes explicitly.
      robots: { index: false, follow: false },
    };
  }
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
  };
}

export default async function BlogDetailRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const post = await getBlogPostBySlug(params.slug, params.locale);
  if (!post) {
    return (
      <ResearchDetailPage
        article={{
          title: slugToTitle(params.slug),
          category: 'tutorials',
          author: 'Newera Team',
          date: new Date().toISOString(),
          image: null,
          imageAlt: slugToTitle(params.slug),
          body: [],
        }}
      />
    );
  }

  const featuredImage = post.featuredImage;
  const imageUrl =
    featuredImage && typeof featuredImage !== 'number' ? (featuredImage.url ?? null) : null;

  const article: ArticleDetailData = {
    title: post.title,
    category: post.category,
    author: post.author,
    date: post.publishedDate,
    image: imageUrl,
    imageAlt: post.title,
    body: post.body,
  };

  // "Keep reading" — other published posts with their CMS cover images.
  const all = await getBlogPosts(params.locale, 6);
  const relatedArticles: RelatedArticle[] = all
    .filter((p) => p.slug !== params.slug)
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      category: p.category,
      title: p.title,
      image: p.thumbnailUrl,
    }));

  return (
    <>
      <ResearchDetailPage
        slug={params.slug}
        article={article}
        relatedArticles={relatedArticles}
        basePath="education/blog"
      />
      <CtaBanner />
    </>
  );
}
