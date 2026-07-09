import { setRequestLocale } from 'next-intl/server';
import {
  HeroSectionDemo,
  StatsSectionDemo,
  MarketsSectionDemo,
  FeaturesSection,
  ThreeStepsSectionDemo,
  TwoPathsSection,
  ArbitrageSection,
  CtaBannerDemo,
  TradingViewTicker,
  TrustStripDemo,
  PartnersSection,
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

  const uspMetrics = siteSettings?.uspMetrics ?? undefined;
  const partners = siteSettings?.partners ?? undefined;

  return (
    <>
      <TradingViewTicker />
      <HeroSectionDemo />
      {/* USPs directly after the hero (feedback #3 — most visitors don't
          scroll past the third section, so the "why us" reasons come first). */}
      <FeaturesSection metrics={uspMetrics} />
      <StatsSectionDemo kpiStats={kpiStats} locale={params.locale} />
      {/* Numbers immediately followed by safeguards (feedback round 2, #3). */}
      <SecurityTrustBand />
      {/* Account journey surfaced high (feedback #4 — "how do I become a client?"
          was hidden far down the page). */}
      <ThreeStepsSectionDemo />
      {/* The funnel fork: beginners into Education, veterans into a live account. */}
      <TwoPathsSection />
      <MarketsSectionDemo />
      <TestimonialsSection
        headline={socialProofHeadline}
        ratingValue={siteSettings?.ratingValue ?? null}
        ratingCaption={ratingCaption}
        items={testimonials}
      />
      {/* Press wordmarks ride directly under the testimonials so the social
          proof reads as one block: what traders say, then who covered us. */}
      <TrustStripDemo logos={trustLogos} />
      {/* Infrastructure trust — liquidity, tech, payment & data partners
          (client content brief item 13). */}
      <PartnersSection partners={partners} />
      <ArbitrageSection />
      <CtaBannerDemo />
    </>
  );
}
