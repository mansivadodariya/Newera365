import { setRequestLocale } from 'next-intl/server';
import { AboutPage } from '@newera365/ui';

interface Props {
  params: { locale: string };
}

export default function AboutRoute({ params }: Props) {
  setRequestLocale(params.locale);
  return <AboutPage />;
}
