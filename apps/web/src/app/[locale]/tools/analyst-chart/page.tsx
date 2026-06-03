import { setRequestLocale } from 'next-intl/server';
import { AnalystChartPage , CtaBanner } from '@newera365/ui';

export default function AnalystChartRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <AnalystChartPage />
      <CtaBanner />
    </>
  );
}
