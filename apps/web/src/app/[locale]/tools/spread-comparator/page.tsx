import { setRequestLocale } from 'next-intl/server';
import { SpreadComparatorPage , CtaBanner } from '@newera365/ui';

export default function SpreadComparatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <SpreadComparatorPage />
      <CtaBanner />
    </>
  );
}
