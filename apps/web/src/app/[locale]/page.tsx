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
  PartnersSection,
  TestimonialsSection,
  SecurityTrustBand,
  FundingStripSection,
  CompareChecklistSection,
} from '@newera365/ui';
import type { TestimonialItem, HomeNewsletterContent } from '@newera365/ui';
import { getSiteSettings } from '@/lib/cms';

const ADDITIONAL_TESTIMONIALS = [
  {
    quoteEn:
      'Swap-free account terms are transparent and fair. Trading Gold (XAUUSD) with tight spreads without hidden overnight fees makes a massive difference for my strategy.',
    quoteAr:
      'شروط الحساب الخالي من الفوائد شفافة وعادلة. تداول الذهب بسبريد ضيق ودون رسوم تبييت خفية أحدث فارقاً كبيراً في استراتيجيتي.',
    authorName: 'Tariq M.',
    authorRoleEn: 'Commodity trader · Kuwait City',
    authorRoleAr: 'متداول سلع · مدينة الكويت',
    rating: 5,
  },
  {
    quoteEn:
      'USDT deposits clear almost instantly and order execution under 15ms is real. No re-quotes or unexpected slippage during high volatility.',
    quoteAr:
      'إيداعات USDT تتأكد شبه فورياً وتنفيذ الأوامر في أقل من 15 ملي ثانية حقيقي. لا توجد إعادة تسعير أو انزلاق غير متوقع أثناء تقلبات السوق.',
    authorName: 'Lucas V.',
    authorRoleEn: 'Algorithmic trader · Frankfurt',
    authorRoleAr: 'متداول خوارزمي · فرانكفورت',
    rating: 5,
  },
  {
    quoteEn:
      'Customer support answered my account verification questions within minutes via live chat. Refreshing to deal with a broker that values client service.',
    quoteAr:
      'أجاب فريق الدعم الفني على استفسارات توثيق حسابي خلال دقائق عبر المحادثة المباشرة. من الرائع التعامل مع وسيط يهتم بخدمة العملاء.',
    authorName: 'Nadia H.',
    authorRoleEn: 'FX trader · Kuala Lumpur',
    authorRoleAr: 'متداولة عملات · كوالالمبور',
    rating: 5,
  },
  {
    quoteEn:
      'Switched my portfolio to Newera last year. The seamless web and mobile MT5 sync lets me manage risk on major FX pairs from anywhere.',
    quoteAr:
      'نقلت محفظتي إلى Newera العام الماضي. التزامن السلس لـ MT5 على الويب والهاتف يتيح لي إدارة المخاطر على أزواج العملات الرئيسية من أي مكان.',
    authorName: 'Liam R.',
    authorRoleEn: 'Portfolio manager · Sydney',
    authorRoleAr: 'مدير محافظ · سدني',
    rating: 5,
  },
  {
    quoteEn:
      "I've traded with several brokers over the years, but Newera's raw spreads on EUR/USD are consistently the tightest. The transparency around fees is something I genuinely appreciate.",
    quoteAr:
      'تداولت مع عدة وسطاء على مر السنين، لكن سبريد EUR/USD في Newera هو الأضيق باستمرار. أقدّر حقاً الشفافية في رسوم التداول.',
    authorName: 'James O.',
    authorRoleEn: 'Forex day trader · London',
    authorRoleAr: 'متداول يومي في العملات · لندن',
    rating: 5,
  },
  {
    quoteEn:
      'Funding and withdrawing is genuinely painless. I tested with a small transfer first, and funds hit my account within hours. That kind of reliability builds real trust.',
    quoteAr:
      'عمليات الإيداع والسحب سهلة للغاية. جربت بتحويل صغير أولاً، ووصلت الأموال لحسابي في غضون ساعات. هذا النوع من الموثوقية يبني ثقة حقيقية.',
    authorName: 'Sara K.',
    authorRoleEn: 'Retail investor · Dubai',
    authorRoleAr: 'مستثمرة · دبي',
    rating: 5,
  },
  {
    quoteEn:
      'The MT5 platform on both desktop and mobile is stable and responsive. Chart loading is near-instant even during busy sessions like NFP. Exactly what a serious trader needs.',
    quoteAr:
      'منصة MT5 على سطح المكتب والهاتف مستقرة وسريعة الاستجابة. تحميل الرسوم البيانية شبه فوري حتى في جلسات مزدحمة مثل وقت صدور NFP. هذا ما يحتاجه المتداول الجاد.',
    authorName: 'Farouk A.',
    authorRoleEn: 'Swing trader · Cairo',
    authorRoleAr: 'متداول سوينغ · القاهرة',
    rating: 5,
  },
];

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const siteSettings = await getSiteSettings();

  const kpiStats = siteSettings?.kpiStats ?? undefined;

  // Resolve testimonials from CMS database + additional 4 global traders
  const isAr = params.locale === 'ar';
  const dbTestimonials: TestimonialItem[] = (siteSettings?.testimonials ?? []).flatMap((tm) => {
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

  const extraTestimonials: TestimonialItem[] = ADDITIONAL_TESTIMONIALS.map((tm) => ({
    quote: isAr ? tm.quoteAr : tm.quoteEn,
    authorName: tm.authorName,
    authorRole: isAr ? tm.authorRoleAr : tm.authorRoleEn,
    rating: tm.rating,
    avatarUrl: null,
  }));

  const testimonials = [...dbTestimonials, ...extraTestimonials];

  const socialProofHeadline = isAr
    ? (siteSettings?.socialProofHeadlineAr ?? null)
    : (siteSettings?.socialProofHeadlineEn ?? null);

  const ratingValue = siteSettings?.ratingValue ?? null;

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
        ratingValue={ratingValue}
        ratingCaption={ratingCaption}
        items={testimonials}
      />
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
