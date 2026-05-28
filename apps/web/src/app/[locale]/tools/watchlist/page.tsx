import { setRequestLocale } from 'next-intl/server';
import { LiveWatchlistPage } from '@newera365/ui';

export default function WatchlistRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <LiveWatchlistPage />;
}
