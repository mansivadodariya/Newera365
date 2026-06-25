import { setRequestLocale } from 'next-intl/server';
import { WebinarsPage, CtaBanner } from '@newera365/ui';
import type { WebinarItem } from '@newera365/ui';
import { getWebinars } from '@/lib/cms';
import type { CmsWebinar } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webinars',
  description:
    'Live and recorded webinar sessions from the NewEra365 trading desk. Register for upcoming sessions or watch past replays.',
};

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

export default async function WebinarsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const raw = await getWebinars(params.locale);
  const webinars = raw.map(mapWebinar);
  return (
    <>
      <WebinarsPage webinars={webinars} />
      <CtaBanner />
    </>
  );
}
