import { setRequestLocale } from 'next-intl/server';
import { ContactPage } from '@newera365/ui';

interface Props {
  params: { locale: string };
}

export default function ContactRoute({ params }: Props) {
  setRequestLocale(params.locale);
  return <ContactPage />;
}
