import { setRequestLocale } from 'next-intl/server';
import { MediaListingPage, CtaBanner } from '@newera365/ui';
import type { CmsVideoItem } from '@newera365/ui';
import { getEducationContent } from '@/lib/cms';
import type { CmsEducationContent, CmsMedia } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos & Audio | NewEra365',
  description:
    'Lessons, interviews, breakdowns and discussions from our trading desk and partners.',
};

function mapMediaItem(item: CmsEducationContent): CmsVideoItem {
  const thumb = item.thumbnail;
  const thumbnailUrl = thumb && typeof thumb !== 'number' ? (thumb as CmsMedia).url : null;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    contentType: item.contentType as 'video' | 'audio',
    thumbnailUrl,
    videoEmbed: item.videoEmbed,
    description: item.seoDescription,
  };
}

export default async function MediaRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  // Fetch both videos and audio in parallel
  const [videos, audio] = await Promise.all([
    getEducationContent('video', params.locale, 50),
    getEducationContent('audio', params.locale, 50),
  ]);
  const allMedia = [...videos, ...audio];
  const cmsVideos = allMedia.length > 0 ? allMedia.map(mapMediaItem) : undefined;
  return (
    <>
      <MediaListingPage cmsVideos={cmsVideos} />
      <CtaBanner />
    </>
  );
}
