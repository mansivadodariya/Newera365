import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResearchPage, CtaBanner } from '@newera365/ui';
import type { Metadata } from 'next';
import { getNews } from '@/lib/cms';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'الأخبار اليومية' : 'Daily News',
    description: isAr
      ? 'آخر أخبار الفوركس والسلع والمؤشرات والعملات الرقمية.'
      : 'Latest forex, commodities, indices and crypto market news.',
  };
}

export default async function DailyNewsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const [cmsArticles, t] = await Promise.all([
    getNews(params.locale),
    getTranslations({ locale: params.locale, namespace: 'dailyNews' }),
  ]);

  return (
    <>
      <ResearchPage
        cmsArticles={cmsArticles.length > 0 ? cmsArticles : undefined}
        basePath="daily-news"
        hero={{ line1: t('heroLine1'), line2: t('heroLine2'), subtitle: t('heroSubtitle') }}
      />
      <CtaBanner />
    </>
  );
}
