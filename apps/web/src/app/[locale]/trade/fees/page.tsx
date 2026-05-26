import { setRequestLocale } from 'next-intl/server';
import { FeesPage } from '@newera365/ui';

export default function FeesRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <FeesPage />;
}
