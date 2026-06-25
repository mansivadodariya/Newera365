import { setRequestLocale } from 'next-intl/server';
import { MediaPressPage, CtaBanner } from '@newera365/ui';
import type { MediaPressItem } from '@newera365/ui';
import { getMediaPressItems } from '@/lib/cms';
import type { CmsMediaPressItem } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Media & Press',
  description: 'Press coverage, media mentions and brand asset downloads for NewEra365.',
};

function mapItem(item: CmsMediaPressItem): MediaPressItem {
  return {
    id: item.id,
    headline: item.headline,
    publication: item.publication,
    date: item.date,
    url: item.url ?? null,
    excerpt: item.excerpt ?? null,
    logoUrl:
      item.logo && typeof item.logo === 'object' && 'url' in item.logo
        ? (item.logo.url ?? null)
        : null,
    isFeatured: item.isFeatured ?? false,
  };
}

export default async function MediaPressRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const items = await getMediaPressItems(params.locale);
  return (
    <>
      <MediaPressPage items={items.length > 0 ? items.map(mapItem) : undefined} />
      <CtaBanner />
    </>
  );
}
