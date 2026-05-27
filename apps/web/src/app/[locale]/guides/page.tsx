import { setRequestLocale } from 'next-intl/server';
import { GuidesPage } from '@newera365/ui';

export default function GuidesRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <GuidesPage />;
}
