import { setRequestLocale } from 'next-intl/server';
import { MediaListingPage } from '@newera365/ui';

export default function MediaRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <MediaListingPage />;
}
