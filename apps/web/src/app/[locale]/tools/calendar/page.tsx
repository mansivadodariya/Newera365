import { setRequestLocale } from 'next-intl/server';
import { EconomicCalendarPage , CtaBanner } from '@newera365/ui';

export default function EconomicCalendarRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <EconomicCalendarPage />
      <CtaBanner />
    </>
  );
}
