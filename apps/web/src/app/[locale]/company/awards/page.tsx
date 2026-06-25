import { setRequestLocale } from 'next-intl/server';
import { AwardsPage, CtaBanner } from '@newera365/ui';
import type { AwardCardItem } from '@newera365/ui';
import { getAwards } from '@/lib/cms';
import type { CmsAward } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Awards & Recognition',
  description:
    'Industry awards and recognition received by NewEra365 for execution quality, platform excellence and customer support.',
};

function mapAward(a: CmsAward): AwardCardItem {
  return {
    id: a.id,
    title: a.title,
    organisation: null,
    year: a.date ? new Date(a.date).getFullYear().toString() : null,
    description: a.description ?? null,
    category: a.awardCategory ?? null,
    imageUrl: a.logo && typeof a.logo === 'object' && 'url' in a.logo ? (a.logo.url ?? null) : null,
    externalUrl: a.externalUrl ?? null,
  };
}

export default async function AwardsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const awards = await getAwards(params.locale);
  return (
    <>
      <AwardsPage awards={awards.length > 0 ? awards.map(mapAward) : undefined} />
      <CtaBanner />
    </>
  );
}
