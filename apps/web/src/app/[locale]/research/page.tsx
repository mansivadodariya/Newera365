import { setRequestLocale } from 'next-intl/server';
import { ResearchPage, CtaBanner } from '@newera365/ui';
import type { CmsResearchReportItem } from '@newera365/ui';
import type { Metadata } from 'next';
import { getResearchArticles, getResearchReports, getNews, getBlogPosts } from '@/lib/cms';
import type { CmsResearchReport, CmsMedia } from '@/lib/cms';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'الأبحاث' : 'Research',
    description: isAr
      ? 'التحليلات والأخبار اليومية والمدونة من مكتب Newera في مكان واحد.'
      : 'Market analysis, daily news and blog from the Newera desk, all in one place.',
  };
}

function mapReport(r: CmsResearchReport): CmsResearchReportItem {
  const file = r.reportFile;
  const reportUrl = file && typeof file !== 'number' ? ((file as CmsMedia).url ?? null) : null;
  const thumb = r.thumbnail;
  const thumbnailUrl =
    thumb && typeof thumb !== 'number' ? ((thumb as CmsMedia).url ?? null) : null;
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    publishedDate: r.publishedDate,
    isGated: r.isGated,
    reportUrl,
    thumbnailUrl,
  };
}

export default async function ResearchRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [cmsArticles, rawReports, news, blog] = await Promise.all([
    getResearchArticles(params.locale),
    getResearchReports(params.locale),
    getNews(params.locale),
    getBlogPosts(params.locale),
  ]);
  const cmsReports = rawReports.map(mapReport);
  return (
    <>
      <ResearchPage
        cmsArticles={cmsArticles}
        newsArticles={news.length > 0 ? news : undefined}
        blogArticles={blog.length > 0 ? blog : undefined}
        cmsReports={cmsReports}
      />
      <CtaBanner />
    </>
  );
}
