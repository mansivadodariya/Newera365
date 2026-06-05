import { setRequestLocale } from 'next-intl/server';
import {
  HeroSection,
  StatsSection,
  MarketsSection,
  FeaturesSection,
  ThreeStepsSection,
  ArbitrageSection,
  CtaBanner,
  TickerStrip,
  TrustStrip,
} from '@newera365/ui';
import type { TrustLogo } from '@newera365/ui';
import { getLatestNews, getSiteSettings } from '@/lib/cms';
import type { CmsMedia } from '@/lib/cms';

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const [news, siteSettings] = await Promise.all([
    getLatestNews(params.locale, 4),
    getSiteSettings(),
  ]);

  const kpiStats = siteSettings?.kpiStats ?? undefined;

  // Resolve social proof logos — depth=1 returns the media object
  const trustLogos: TrustLogo[] = (siteSettings?.socialProofLogos ?? []).flatMap((entry) => {
    const media = entry.logo;
    if (!media || typeof media === 'number') return [];
    const url = (media as CmsMedia).url;
    if (!url) return [];
    const alt = params.locale === 'ar' ? (entry.altAr ?? entry.altEn ?? '') : (entry.altEn ?? '');
    return [{ url, alt, href: entry.href ?? null }];
  });

  return (
    <>
      <TickerStrip />
      <HeroSection />
      <TrustStrip logos={trustLogos} />
      <StatsSection kpiStats={kpiStats} locale={params.locale} />
      <MarketsSection />
      <FeaturesSection />
      <ThreeStepsSection />
      <ArbitrageSection />
      <CtaBanner />
    </>
  );
}
