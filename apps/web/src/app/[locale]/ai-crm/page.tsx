import { setRequestLocale } from 'next-intl/server';
import { AiCrmPage } from '@newera365/ui';

export default function AiCrmRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <AiCrmPage />;
}
