import { setRequestLocale } from 'next-intl/server';
import { MediaListingPage, CtaBanner } from '@newera365/ui';
import type { CmsVideoItem, WebinarItem } from '@newera365/ui';
import { getEducationContent, getWebinars } from '@/lib/cms';
import type { CmsEducationContent, CmsMedia, CmsWebinar } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos, Audio & Webinars',
  description:
    'Lessons, interviews, breakdowns, discussions and live webinars from our trading desk and partners.',
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
    mediaCategory: item.mediaCategory,
    isFeatured: item.isFeatured,
  };
}

function mapWebinar(w: CmsWebinar): WebinarItem {
  return {
    id: w.id,
    title: w.title,
    slug: w.slug,
    speaker: w.speaker,
    speakerBio: w.speakerBio,
    scheduledAt: w.scheduledAt,
    timezone: w.timezone,
    status: w.status,
    replayUrl: w.replayUrl,
  };
}

export default async function MediaRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  // Fetch videos, audio and webinars in parallel
  const [videos, audio, rawWebinars] = await Promise.all([
    getEducationContent('video', params.locale, 50),
    getEducationContent('audio', params.locale, 50),
    getWebinars(params.locale),
  ]);
  const allMedia = [...videos, ...audio];
  const cmsVideos = allMedia.length > 0 ? allMedia.map(mapMediaItem) : undefined;
  const webinars = rawWebinars.length > 0 ? rawWebinars.map(mapWebinar) : undefined;
  return (
    <>
      <MediaListingPage cmsVideos={cmsVideos} webinars={webinars} />
      <CtaBanner />
    </>
  );
}
