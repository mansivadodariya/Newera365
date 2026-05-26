import { setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@newera365/ui';

interface Props {
  params: { locale: string };
}

export default function LegalRoute({ params }: Props) {
  setRequestLocale(params.locale);
  return <LegalPage />;
}
