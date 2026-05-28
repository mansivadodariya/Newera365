import { setRequestLocale } from 'next-intl/server';
import { SpreadComparatorPage } from '@newera365/ui';

export default function SpreadComparatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <SpreadComparatorPage />;
}
