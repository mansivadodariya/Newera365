import { setRequestLocale } from 'next-intl/server';
import { PivotCalculatorPage, CtaBanner } from '@newera365/ui';

export default function PivotCalculatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <PivotCalculatorPage />
      <CtaBanner />
    </>
  );
}
