import { setRequestLocale } from 'next-intl/server';
import { NewsletterPage } from '@newera365/ui';

export default function NewsletterRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <NewsletterPage />;
}
