import { setRequestLocale } from 'next-intl/server';
import { EconomicCalendarPage, CtaBanner } from '@newera365/ui';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'التقويم الاقتصادي' : 'Economic Calendar',
    description: isAr
      ? 'أحداث السوق القادمة مصنفة حسب التأثير والعملة.'
      : 'Upcoming market events filtered by impact and currency.',
  };
}

export default function EconomicCalendarRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <EconomicCalendarPage />
      <CtaBanner />
    </>
  );
}
