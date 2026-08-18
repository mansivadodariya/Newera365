import { setRequestLocale } from 'next-intl/server';
import { EducationHubPage, CtaBanner } from '@newera365/ui';
import type { CmsEducationItem } from '@newera365/ui';
import { getEducationContent, getWebinars } from '@/lib/cms';
import type { CmsEducationContent, CmsMedia } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Education Hub',
  description: 'Guides, glossary, ebooks, webinars, videos and audio, all in one place.',
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

function mapToGlossaryTerm(item: CmsEducationContent) {
  return {
    id: item.id,
    glossaryTerm: item.glossaryTerm ?? item.title,
    alphabeticalIndex: item.alphabeticalIndex,
    glossaryCategory: item.glossaryCategory,
    body: item.body ?? null,
  };
}

function mapToGuide(item: CmsEducationContent) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.seoDescription,
    featured: item.isFeatured ?? false,
    body: item.body ?? null,
  };
}

function mapEbook(item: CmsEducationContent) {
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

export default async function EducationRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [items, webinars] = await Promise.all([
    getEducationContent(undefined, params.locale),
    getWebinars(params.locale),
  ]);

  const glossaryItems = items.filter((i) => i.contentType === 'glossary').map(mapToGlossaryTerm);
  const guideItems = items.filter((i) => i.contentType === 'guide').map(mapToGuide);
  if (guideItems.length > 0 && !guideItems.some((g) => g.featured)) {
    guideItems[0]!.featured = true;
  }
  const ebookItems = items.filter((i) => i.contentType === 'ebook').map(mapEbook);

  return (
    <>
      <EducationHubPage
        content={items.length > 0 ? items.map(mapItem) : undefined}
        webinarCount={webinars.length}
        glossaryTerms={glossaryItems.length > 0 ? glossaryItems : undefined}
        guides={guideItems.length > 0 ? guideItems : undefined}
        ebooks={ebookItems.length > 0 ? ebookItems : undefined}
      />
      <CtaBanner />
    </>
  );
}
