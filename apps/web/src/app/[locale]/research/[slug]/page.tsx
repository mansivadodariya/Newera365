import { setRequestLocale } from 'next-intl/server';
import { ResearchDetailPage } from '@newera365/ui';

export default function ResearchDetailRoute({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(params.locale);
  return <ResearchDetailPage slug={params.slug} />;
}
