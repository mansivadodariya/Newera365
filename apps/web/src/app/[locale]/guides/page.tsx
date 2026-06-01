import { setRequestLocale } from 'next-intl/server';
import { GuidesPage } from '@newera365/ui';
import type { CmsGuide } from '@newera365/ui';
import { getGuides } from '@/lib/cms';
import type { CmsEducationContent } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Guides | NewEra365',
  description: 'Long-form trading guides on leverage, risk management, chart reading, and macro.',
};

function mapToGuide(item: CmsEducationContent): CmsGuide {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.seoDescription,
    featured: false,
  };
}

export default async function GuidesRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const items = await getGuides(params.locale);
  const guides = items.map(mapToGuide);
  if (guides.length > 0) guides[0]!.featured = true;
  return <GuidesPage guides={guides.length > 0 ? guides : undefined} />;
}
