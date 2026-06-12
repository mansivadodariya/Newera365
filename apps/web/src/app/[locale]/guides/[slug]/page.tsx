import { setRequestLocale } from 'next-intl/server';
import { GuideDetailPage } from '@newera365/ui';
import type { CmsGuideDetail } from '@newera365/ui';
import { getGuideBySlug } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug, params.locale);
  if (!guide) return {};
  return {
    title: guide.seoTitle || guide.title,
    description: guide.seoDescription || '',
  };
}

export default async function GuideDetailRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const item = await getGuideBySlug(params.slug, params.locale);

  // When the CMS has a matching doc, pass it through. Otherwise pass null and
  // let GuideDetailPage fall back to static guide content by slug (so links
  // resolve to a real page instead of 404-ing — see staticGuides.ts).
  const guide: CmsGuideDetail | null = item ? { title: item.title, body: item.body ?? [] } : null;

  return <GuideDetailPage slug={params.slug} guide={guide} />;
}
