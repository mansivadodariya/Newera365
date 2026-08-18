import { setRequestLocale } from 'next-intl/server';
import { LiveWatchlistPage, CtaBanner } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'قائمة المتابعة المباشرة' : 'Live Watchlist',
    description: isAr
      ? 'تابع المؤشرات والعقود الآجلة والسندات والفوركس في شاشة واحدة.'
      : 'Track indices, futures, bonds and forex in one desk view.',
  };
}

export default async function WatchlistRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  // Full desk sheet: every active instrument across asset classes, localized.
  const instruments = await getInstruments(undefined, 100, params.locale);
  return (
    <>
      <LiveWatchlistPage instruments={instruments} />
      <CtaBanner />
    </>
  );
}
