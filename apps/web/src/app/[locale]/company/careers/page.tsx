import { setRequestLocale } from 'next-intl/server';
import { CareersPage, CtaBanner } from '@newera365/ui';
import type { CmsJobItem } from '@newera365/ui';
import { getCareers } from '@/lib/cms';
import type { CmsCareer } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the team building the next generation of trading technology.',
};

function mapCareer(career: CmsCareer): CmsJobItem {
  return {
    id: career.id,
    slug: career.slug,
    title: career.title,
    department: career.department,
    location: career.location,
    employmentType: career.employmentType,
    summary: career.summary,
    applyUrl: career.applyUrl,
  };
}

export default async function CareersRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const careers = await getCareers(params.locale);
  return (
    <>
      <CareersPage jobs={careers.length > 0 ? careers.map(mapCareer) : undefined} />
      <CtaBanner />
    </>
  );
}
