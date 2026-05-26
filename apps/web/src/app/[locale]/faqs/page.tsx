import { setRequestLocale } from 'next-intl/server';
import { FaqPage } from '@newera365/ui';

interface Props {
  params: { locale: string };
}

export default function FaqsRoute({ params }: Props) {
  setRequestLocale(params.locale);
  return <FaqPage />;
}
