import { setRequestLocale } from 'next-intl/server';
import { GlossaryPage } from '@newera365/ui';

export default function GlossaryRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <GlossaryPage />;
}
