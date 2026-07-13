import { setRequestLocale } from 'next-intl/server';
import { AboutPage, CtaBanner } from '@newera365/ui';
import type { CmsMilestoneItem } from '@newera365/ui';
import { getMilestones, getSiteSettings } from '@/lib/cms';
import type { CmsMilestone } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Our story, our focus markets, and our mission to democratise professional trading.',
};

function mapMilestone(m: CmsMilestone): CmsMilestoneItem {
  return { year: m.year, label: m.label, description: m.description };
}

export default async function AboutRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [milestones, siteSettings] = await Promise.all([
    getMilestones(params.locale),
    getSiteSettings(),
  ]);
  return (
    <>
      <AboutPage
        milestones={milestones.length > 0 ? milestones.map(mapMilestone) : undefined}
        manifestoStatValue={siteSettings?.aboutManifestoStatValue}
      />
      <CtaBanner />
    </>
  );
}
