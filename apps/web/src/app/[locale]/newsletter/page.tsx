import { setRequestLocale } from 'next-intl/server';
import { NewsletterPage } from '@newera365/ui';

export default function NewsletterRoute({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  setRequestLocale(params.locale);
  const initialState =
    searchParams?.confirmed === '1'
      ? 'confirmed'
      : searchParams?.unsubscribed === '1'
        ? 'unsubscribed'
        : undefined;
  return <NewsletterPage initialState={initialState} />;
}
