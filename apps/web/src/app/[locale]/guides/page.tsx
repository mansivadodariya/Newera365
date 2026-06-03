import { setRequestLocale } from 'next-intl/server';
import { GuidesPage, CtaBanner } from '@newera365/ui';
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
    featured: item.isFeatured ?? false,
  };
}

export default async function GuidesRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const items = await getGuides(params.locale);
  const guides = items.map(mapToGuide);
  // If the CMS has no guide explicitly marked isFeatured, fall back to the first one.
  if (guides.length > 0 && !guides.some((g) => g.featured)) guides[0]!.featured = true;
  return (
    <>
      <GuidesPage guides={guides.length > 0 ? guides : undefined} />
      <CtaBanner />
    </>
  );
}
