import { setRequestLocale } from 'next-intl/server';
import { NewsletterPage } from '@newera365/ui';
import { getNews, fetchBenzingaMarketBriefing } from '@/lib/cms';

export default async function NewsletterRoute({
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

  const [latestNews, marketBriefing] = await Promise.all([
    getNews(params.locale, 8),
    fetchBenzingaMarketBriefing(),
  ]);

  const isAr = params.locale === 'ar';
  const now = new Date();
  const dayName = new Intl.DateTimeFormat(isAr ? 'ar-AE' : 'en-US', {
    weekday: 'long',
  }).format(now);

  const leadHeadline =
    marketBriefing.lead ?? latestNews[0]?.title ?? 'Dollar braces for CPI as the desk trims risk';

  const fxHead = marketBriefing.fx ?? 'US-Japan Yen Intervention Signals Bond Market Fear';

  const cmdHead = marketBriefing.commodities ?? "Gold's range and the key level that breaks it";

  const macroHead =
    marketBriefing.macro ??
    'Hotter PCE Inflation: 5 Defensive ETFs Investors Can Turn to as Rate-Cut Hopes Fade';

  const dynamicTeasers = [
    { label: isAr ? 'العملات' : 'FX', head: fxHead },
    { label: isAr ? 'السلع' : 'COMMODITIES', head: cmdHead },
    { label: isAr ? 'الاقتصاد الكلي' : 'MACRO', head: macroHead },
  ];

  return (
    <NewsletterPage
      initialState={initialState}
      dayName={dayName}
      leadHeadline={leadHeadline}
      teasers={dynamicTeasers}
    />
  );
}
