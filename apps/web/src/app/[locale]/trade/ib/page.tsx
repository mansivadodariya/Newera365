import { setRequestLocale } from 'next-intl/server';
import { IBPage } from '@newera365/ui';

export default function IBRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <IBPage />;
}
