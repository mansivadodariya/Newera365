import { setRequestLocale } from 'next-intl/server';
import { ResearchPage, CtaBanner } from '@newera365/ui';
import { getBlogPosts } from '@/lib/cms';

export default async function BlogRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const cmsArticles = await getBlogPosts(params.locale);
  return (
    <>
      <ResearchPage cmsArticles={cmsArticles} basePath="blog" />
      <CtaBanner />
    </>
  );
}
