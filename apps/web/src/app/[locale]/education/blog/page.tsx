import { setRequestLocale } from 'next-intl/server';
import { ResearchPage, CtaBanner } from '@newera365/ui';
import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/cms';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'المدونة' : 'Blog',
    description: isAr
      ? 'رؤى وتحليلات وتحديثات من فريق NewEra365.'
      : 'Insights, analysis, and updates from the NewEra365 team.',
  };
}

export default async function BlogRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const cmsArticles = await getBlogPosts(params.locale);
  return (
    <>
      <ResearchPage cmsArticles={cmsArticles} basePath="education/blog" />
      <CtaBanner />
    </>
  );
}
