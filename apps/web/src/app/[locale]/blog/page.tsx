import { setRequestLocale } from 'next-intl/server';
import { ResearchPage } from '@newera365/ui';

export default function BlogRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <ResearchPage />;
}
