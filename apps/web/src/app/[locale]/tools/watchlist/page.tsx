import { setRequestLocale } from 'next-intl/server';
import { LiveWatchlistPage, CtaBanner } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';

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
