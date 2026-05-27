import { setRequestLocale } from 'next-intl/server';
import { EbooksPage } from '@newera365/ui';

export default function EbooksRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <EbooksPage />;
}
