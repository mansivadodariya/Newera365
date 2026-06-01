import { setRequestLocale } from 'next-intl/server';
import { ResearchPage } from '@newera365/ui';
import type { ArticleItem } from '@newera365/ui';
import { getBlogPosts } from '@/lib/cms';
import type { CmsBlogPost } from '@/lib/cms';

function mapBlogToArticle(post: CmsBlogPost): ArticleItem {
  return {
    id: String(post.id),
    slug: post.slug,
    category: post.category,
    title: post.title,
    summary: post.excerpt ?? '',
    date: post.publishedDate
      ? new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '',
    featured: false,
  };
}

export default async function BlogRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const { docs } = await getBlogPosts(params.locale);
  const articles = docs.map(mapBlogToArticle);
  if (articles.length > 0) articles[0]!.featured = true;

  return <ResearchPage articles={articles.length > 0 ? articles : undefined} basePath="blog" />;
}
