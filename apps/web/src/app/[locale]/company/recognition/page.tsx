import { setRequestLocale } from 'next-intl/server';
import { RecognitionPage, CtaBanner } from '@newera365/ui';
import type { AwardCardItem, MediaPressItem } from '@newera365/ui';
import { getAwards, getMediaPressItems } from '@/lib/cms';
import type { CmsAward, CmsMediaPressItem } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'التقدير' : 'Recognition',
    description: isAr
      ? 'الجوائز والتغطية الإعلامية والاعتراف الذي حصلت عليه NewEra365.'
      : 'Awards, media coverage and press recognition earned by NewEra365.',
  };
}

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

function mapItem(item: CmsMediaPressItem, locale: string): MediaPressItem {
  return {
    id: item.id,
    headline: item.headline,
    // Publication is a per-field bilingual pair (publication / publicationAr),
    // resolved here by locale; Arabic falls back to the English name when blank.
    publication: locale === 'ar' ? (item.publicationAr ?? item.publication) : item.publication,
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

export default async function RecognitionRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [awards, items] = await Promise.all([
    getAwards(params.locale),
    getMediaPressItems(params.locale),
  ]);
  return (
    <>
      <RecognitionPage
        awards={awards.length > 0 ? awards.map(mapAward) : undefined}
        pressItems={
          items.length > 0 ? items.map((item) => mapItem(item, params.locale)) : undefined
        }
      />
      <CtaBanner />
    </>
  );
}
