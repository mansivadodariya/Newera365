import { setRequestLocale } from 'next-intl/server';
import { GuideDetailPage, CtaBanner } from '@newera365/ui';
import type { CmsGuideDetail } from '@newera365/ui';
import { LOCALES } from '@newera365/types';
import { getGuideBySlug, getGuides, slugToTitle } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

// Pre-render top guides at build time. Remaining guides are rendered
// on demand and cached via Next.js ISR (dynamicParams = true by default).
export async function generateStaticParams() {
  const guides = (await getGuides('en')).slice(0, 10);
  return LOCALES.flatMap((locale) => guides.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug, params.locale);
  if (!guide) {
    // No CMS doc: the page still renders generic fallback content, so give it a
    // slug-derived title instead of the bare site default.
    const isAr = params.locale === 'ar';
    return {
      title: slugToTitle(params.slug),
      description: isAr
        ? 'أدلة ودروس التداول من Newera.'
        : 'Trading guides and tutorials from Newera.',
      // Missing CMS doc responds 200 (soft-404), so keep deleted/unknown slugs
      // out of search indexes explicitly.
      robots: { index: false, follow: false },
    };
  }
  return {
    title: guide.seoTitle || guide.title,
    description: guide.seoDescription || '',
  };
}

export default async function GuideDetailRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const item = await getGuideBySlug(params.slug, params.locale);

  // When the CMS has a matching doc, pass it through. Otherwise pass null and
  // let GuideDetailPage render generic fallback content (so links resolve to a
  // real page instead of 404-ing).
  const guide: CmsGuideDetail | null = item ? { title: item.title, body: item.body ?? [] } : null;

  return (
    <>
      <GuideDetailPage slug={params.slug} guide={guide} />
      <CtaBanner />
    </>
  );
}
