import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResearchDetailPage } from '@newera365/ui';
import type { ArticleDetailData } from '@newera365/ui';
import { getBlogPostBySlug } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug, params.locale);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
  };
}

export default async function BlogDetailRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const post = await getBlogPostBySlug(params.slug, params.locale);
  if (!post) notFound();

  const article: ArticleDetailData = {
    title: post.title,
    category: post.category,
    author: post.author,
    date: post.publishedDate,
    body: post.body,
  };

  return <ResearchDetailPage slug={params.slug} article={article} basePath="blog" />;
}
