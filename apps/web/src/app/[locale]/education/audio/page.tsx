import { setRequestLocale } from 'next-intl/server';
import { MediaListingPage, CtaBanner } from '@newera365/ui';
import type { CmsVideoItem } from '@newera365/ui';
import { getEducationContent } from '@/lib/cms';
import type { CmsEducationContent, CmsMedia } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audio',
  description: 'Podcasts, market commentaries and audio lessons from the NewEra365 trading desk.',
};

function mapAudioItem(item: CmsEducationContent): CmsVideoItem {
  const thumb = item.thumbnail;
  const thumbnailUrl = thumb && typeof thumb !== 'number' ? (thumb as CmsMedia).url : null;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    contentType: 'audio',
    thumbnailUrl,
    videoEmbed: item.videoEmbed,
    description: item.seoDescription,
    mediaCategory: item.mediaCategory,
  };
}

export default async function AudioRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const raw = await getEducationContent('audio', params.locale, 50);
  const cmsVideos = raw.length > 0 ? raw.map(mapAudioItem) : undefined;
  return (
    <>
      <MediaListingPage cmsVideos={cmsVideos} />
      <CtaBanner />
    </>
  );
}
