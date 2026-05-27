import { setRequestLocale } from 'next-intl/server';
import { GuideDetailPage } from '@newera365/ui';

export default function GuideDetailRoute({ params }: { params: { locale: string; slug: string } }) {
  setRequestLocale(params.locale);
  return <GuideDetailPage slug={params.slug} />;
}
