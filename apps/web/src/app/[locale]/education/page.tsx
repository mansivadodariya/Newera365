import { setRequestLocale } from 'next-intl/server';
import { EducationHubPage, CtaBanner } from '@newera365/ui';
import type { CmsEducationItem } from '@newera365/ui';
import { getEducationContent } from '@/lib/cms';
import type { CmsEducationContent, CmsMedia } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Education Hub',
  description: 'Guides, glossary, ebooks, webinars, videos and audio — all in one place.',
};

function mapItem(item: CmsEducationContent): CmsEducationItem {
  const thumb = item.thumbnail;
  const thumbnailUrl = thumb && typeof thumb !== 'number' ? (thumb as CmsMedia).url : null;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    contentType: item.contentType,
    isGated: item.isGated,
    thumbnailUrl,
    description: item.seoDescription ?? null,
  };
}

export default async function EducationRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const items = await getEducationContent(undefined, params.locale);
  return (
    <>
      <EducationHubPage content={items.length > 0 ? items.map(mapItem) : undefined} />
      <CtaBanner />
    </>
  );
}
