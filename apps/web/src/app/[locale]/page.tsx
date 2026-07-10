import { setRequestLocale } from 'next-intl/server';
import {
  HeroSectionDemo,
  StatsSectionDemo,
  MarketsSectionDemo,
  FeaturesSection,
  ThreeStepsSectionDemo,
  TwoPathsSection,
  ArbitrageSection,
  HomeNewsletterSection,
  CtaBannerDemo,
  TradingViewTicker,
  TrustStripDemo,
  PartnersSection,
  TestimonialsSection,
  SecurityTrustBand,
  FundingStripSection,
  CompareChecklistSection,
} from '@newera365/ui';
import type { TrustLogo, TestimonialItem, HomeNewsletterContent } from '@newera365/ui';
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

  // Homepage newsletter teaser (feedback #19) — locale-resolved CMS copy; the
  // component falls back to its i18n defaults for any field left unset.
  const s = siteSettings;
  const newsletterContent: HomeNewsletterContent = {
    headline: (isAr ? s?.nlHeadlineAr : s?.nlHeadlineEn) ?? null,
    headlineAccent: (isAr ? s?.nlHeadlineAccentAr : s?.nlHeadlineAccentEn) ?? null,
    subtitle: (isAr ? s?.nlSubtitleAr : s?.nlSubtitleEn) ?? null,
    metricValue: s?.nlMetricValue ?? null,
    metricLabel: (isAr ? s?.nlMetricLabelAr : s?.nlMetricLabelEn) ?? null,
    issueMeta: (isAr ? s?.nlIssueMetaAr : s?.nlIssueMetaEn) ?? null,
    leadHeadline: (isAr ? s?.nlLeadHeadlineAr : s?.nlLeadHeadlineEn) ?? null,
    fxHead: (isAr ? s?.nlFxHeadAr : s?.nlFxHeadEn) ?? null,
    cmdHead: (isAr ? s?.nlCmdHeadAr : s?.nlCmdHeadEn) ?? null,
    macroHead: (isAr ? s?.nlMacroHeadAr : s?.nlMacroHeadEn) ?? null,
    categories: (s?.nlCategories ?? []).map((c) => ({
      cadence: (isAr ? c.cadenceAr : c.cadenceEn) ?? null,
      title: (isAr ? c.titleAr : c.titleEn) ?? null,
      desc: (isAr ? c.descAr : c.descEn) ?? null,
    })),
  };

  return (
    <>
      <TradingViewTicker />
      <HeroSectionDemo />
      {/* USPs directly after the hero (feedback #3 — most visitors don't
          scroll past the third section, so the "why us" reasons come first). */}
      <FeaturesSection metrics={uspMetrics} />
      <StatsSectionDemo kpiStats={kpiStats} locale={params.locale} />
      {/* Payments trust strip (client build #4) — the numbers, then "money
          moves fast and free." */}
      <FundingStripSection />
      {/* Account journey surfaced high (feedback #4 — "how do I become a client?"
          was hidden far down the page). */}
      <ThreeStepsSectionDemo />
      {/* The funnel fork: beginners into Education, veterans into a live account. */}
      <TwoPathsSection />
      <MarketsSectionDemo />
      {/* "Compare yourself" checklist (client build #16) — what traders want,
          every box ticked, right after the markets they'd trade. */}
      <CompareChecklistSection />
      {/* Newsletter briefing capture (feedback #19) — a full-bleed ink chapter
          mid-page, between markets and social proof (off the dark CTA closer). */}
      <HomeNewsletterSection content={newsletterContent} />
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
      {/* Execution proof + safeguards moved to the close (client request): the
          "how fast we fill" and "how we protect you" detail rides after the
          pitch and the social proof, right before the final CTA. */}
      <ArbitrageSection />
      <SecurityTrustBand />
      <CtaBannerDemo />
    </>
  );
}
