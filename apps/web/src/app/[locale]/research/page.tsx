import { setRequestLocale } from 'next-intl/server';
import { ResearchPage } from '@newera365/ui';
import { getResearchArticles } from '@/lib/cms';

export default async function ResearchRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const cmsArticles = await getResearchArticles(params.locale);
  return <ResearchPage cmsArticles={cmsArticles} />;
}
