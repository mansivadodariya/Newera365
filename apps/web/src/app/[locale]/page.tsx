import { setRequestLocale } from 'next-intl/server';
import {
  HeroSection,
  StatsSection,
  MarketsSection,
  NewsSection,
  FeaturesSection,
  ThreeStepsSection,
  CtaBanner,
} from '@newera365/ui';
import { getLatestNews } from '@/lib/cms';

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const news = await getLatestNews(params.locale, 4);

  return (
    <>
      <HeroSection />
      <StatsSection />
      <MarketsSection />
      <NewsSection news={news} />
      <FeaturesSection />
      <ThreeStepsSection />
      <CtaBanner />
    </>
  );
}
