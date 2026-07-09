import { setRequestLocale } from 'next-intl/server';
import { AboutPage, CtaBanner } from '@newera365/ui';
import type { CmsTeamMemberItem, CmsMilestoneItem } from '@newera365/ui';
import { getTeamMembers, getMilestones, getSiteSettings } from '@/lib/cms';
import type { CmsTeamMember, CmsMedia, CmsMilestone } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Our story, our team, and our mission to democratise professional trading.',
};

function resolveUrl(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  return media.url ?? null;
}

function mapTeamMember(m: CmsTeamMember): CmsTeamMemberItem {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    bio: m.bio,
    photoUrl: resolveUrl(m.photo),
    photoAlt: m.name,
  };
}

function mapMilestone(m: CmsMilestone): CmsMilestoneItem {
  return { year: m.year, label: m.label, description: m.description };
}

export default async function AboutRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [members, milestones, siteSettings] = await Promise.all([
    getTeamMembers(params.locale),
    getMilestones(params.locale),
    getSiteSettings(),
  ]);
  return (
    <>
      <AboutPage
        team={members.length > 0 ? members.map(mapTeamMember) : undefined}
        milestones={milestones.length > 0 ? milestones.map(mapMilestone) : undefined}
        manifestoStatValue={siteSettings?.aboutManifestoStatValue}
      />
      <CtaBanner />
    </>
  );
}
