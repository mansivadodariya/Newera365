import { setRequestLocale } from 'next-intl/server';
import { AboutPage } from '@newera365/ui';
import type { CmsTeamMemberItem, CmsAwardItem } from '@newera365/ui';
import { getTeamMembers, getAwards } from '@/lib/cms';
import type { CmsTeamMember, CmsAward, CmsMedia } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | NewEra365',
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

function mapAward(a: CmsAward): CmsAwardItem {
  return {
    id: a.id,
    title: a.title,
    date: a.date,
    description: a.description,
    logoUrl: resolveUrl(a.logo),
    logoAlt: a.title,
    externalUrl: a.externalUrl,
  };
}

export default async function AboutRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [members, awards] = await Promise.all([
    getTeamMembers(params.locale),
    getAwards(params.locale),
  ]);
  return (
    <AboutPage
      team={members.length > 0 ? members.map(mapTeamMember) : undefined}
      awards={awards.length > 0 ? awards.map(mapAward) : undefined}
    />
  );
}
