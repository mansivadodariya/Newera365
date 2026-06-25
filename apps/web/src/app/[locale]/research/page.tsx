import { setRequestLocale } from 'next-intl/server';
import { ResearchPage, CtaBanner } from '@newera365/ui';
import type { CmsResearchReportItem } from '@newera365/ui';
import { getResearchArticles, getResearchReports } from '@/lib/cms';
import type { CmsResearchReport, CmsMedia } from '@/lib/cms';

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
  const [cmsArticles, rawReports] = await Promise.all([
    getResearchArticles(params.locale),
    getResearchReports(params.locale),
  ]);
  const cmsReports = rawReports.map(mapReport);
  return (
    <>
      <ResearchPage cmsArticles={cmsArticles} cmsReports={cmsReports} />
      <CtaBanner />
    </>
  );
}
