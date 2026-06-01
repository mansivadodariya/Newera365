import { setRequestLocale } from 'next-intl/server';
import { EbooksPage } from '@newera365/ui';
import type { CmsEbookItem } from '@newera365/ui';
import { getEducationContent } from '@/lib/cms';
import type { CmsEducationContent, CmsMedia } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Trading Ebooks | NewEra365',
  description: 'Download free ebooks on trading strategy, risk management, and market analysis.',
};

function mapEbook(item: CmsEducationContent): CmsEbookItem {
  const thumb = item.thumbnail;
  const thumbnailUrl = thumb && typeof thumb !== 'number' ? (thumb as CmsMedia).url : null;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.seoDescription,
    thumbnailUrl,
    isGated: item.isGated,
  };
}

export default async function EbooksRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const items = await getEducationContent(params.locale, 'ebook');
  return <EbooksPage ebooks={items.length > 0 ? items.map(mapEbook) : undefined} />;
}
