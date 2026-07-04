import { setRequestLocale } from 'next-intl/server';
import {
  HeroSectionDemo,
  StatsSectionDemo,
  MarketsSectionDemo,
  FeaturesSection,
  ThreeStepsSectionDemo,
  ArbitrageSection,
  CtaBannerDemo,
  TradingViewTicker,
  TrustStripDemo,
  TestimonialsSection,
  SecurityTrustBand,
} from '@newera365/ui';
import type { TrustLogo, TestimonialItem } from '@newera365/ui';
import { getSiteSettings } from '@/lib/cms';
import type { CmsMedia } from '@/lib/cms';

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const siteSettings = await getSiteSettings();

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

  // Resolve testimonials (client feedback #5) — locale-correct quote/role
  const isAr = params.locale === 'ar';
  const testimonials: TestimonialItem[] = (siteSettings?.testimonials ?? []).flatMap((tm) => {
    const quote = isAr ? tm.quoteAr : tm.quoteEn;
    if (!quote) return [];
    return [
      {
        quote,
        authorName: tm.authorName,
        authorRole: isAr ? (tm.authorRoleAr ?? null) : (tm.authorRoleEn ?? null),
        rating: tm.rating ?? 5,
        avatarUrl: tm.avatarUrl ?? null,
      },
    ];
  });
  const socialProofHeadline = isAr
    ? (siteSettings?.socialProofHeadlineAr ?? null)
    : (siteSettings?.socialProofHeadlineEn ?? null);
  const ratingCaption = isAr
    ? (siteSettings?.ratingCountAr ?? null)
    : (siteSettings?.ratingCountEn ?? null);

  return (
    <>
      <TradingViewTicker />
      <HeroSectionDemo />
      <TrustStripDemo logos={trustLogos} />
      {/* USPs surfaced right after the trust strip (feedback #3 — most visitors
          don't scroll past the third section, so the "why us" reasons need to
          appear before the journey/stats). */}
      <FeaturesSection />
      <StatsSectionDemo kpiStats={kpiStats} locale={params.locale} />
      {/* Numbers immediately followed by safeguards (feedback round 2, #3). */}
      <SecurityTrustBand />
      {/* Account journey surfaced high (feedback #4 — "how do I become a client?"
          was hidden far down the page). */}
      <ThreeStepsSectionDemo />
      <MarketsSectionDemo />
      <TestimonialsSection
        headline={socialProofHeadline}
        ratingValue={siteSettings?.ratingValue ?? null}
        ratingCaption={ratingCaption}
        items={testimonials}
      />
      <ArbitrageSection />
      <CtaBannerDemo />
    </>
  );
}
