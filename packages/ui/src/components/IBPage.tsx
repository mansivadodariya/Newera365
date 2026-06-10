'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export interface IBCmsContent {
  heroSubtitle?: string | null;
  ibDescription?: string | null;
  affiliateDescription?: string | null;
  whiteLabelDescription?: string | null;
  ibRateDisplay?: string | null;
  affiliateCpaMax?: string | null;
  steps?: { stepTitle: string; stepDescription: string }[] | null;
  ctaHeading?: string | null;
  ctaSubtitle?: string | null;
}

const PARTNER_TYPES = [
  {
    id: 'ib',
    tag: 'MOST POPULAR',
    tagClass: 'bg-[rgba(242,242,244,0.08)] text-white',
    title: 'Introducing Broker',
    desc: 'Earn up to $8 per lot traded by your referrals. Tiered structure with monthly bonus.',
    cardClass: 'bg-[#111111]',
    headColor: 'text-white',
    descColor: 'text-white/60',
    statLabelColor: 'text-white/45',
    statValueColor: 'text-white',
    statRowBg: 'bg-[#111111]',
    statGridBg: 'bg-[rgba(255,255,255,0.1)]',
    ctaClass: 'bg-accent text-white',
    stats: [
      { label: 'UP TO', value: '$8/lot' },
      { label: 'PAYOUTS', value: 'Monthly' },
      { label: 'MINIMUM', value: 'None' },
    ],
  },
  {
    id: 'affiliate',
    tag: 'CPA',
    tagClass: 'bg-accent/10 text-accent',
    title: 'Affiliate',
    desc: 'Fixed cost-per-acquisition payouts up to $1,200 per qualified trader. Built for digital marketers.',
    cardClass: 'bg-surface dark:bg-surface',
    headColor: 'text-foreground',
    descColor: 'text-muted',
    statLabelColor: 'text-muted',
    statValueColor: 'text-foreground',
    statRowBg: 'bg-background',
    statGridBg: 'bg-[rgba(17,17,17,0.08)] dark:bg-[rgba(255,255,255,0.06)]',
    ctaClass: 'bg-foreground text-background',
    stats: [
      { label: 'UP TO', value: '$1,200' },
      { label: 'COOKIE', value: '90 days' },
      { label: 'MIN CPA', value: '$50' },
    ],
  },
  {
    id: 'white-label',
    tag: 'ENTERPRISE',
    tagClass: 'bg-accent/10 text-accent',
    title: 'White Label',
    desc: 'Launch your own brokerage on our infrastructure. Full MT5 stack, KYC, treasury, support.',
    cardClass: 'bg-surface dark:bg-surface',
    headColor: 'text-foreground',
    descColor: 'text-muted',
    statLabelColor: 'text-muted',
    statValueColor: 'text-foreground',
    statRowBg: 'bg-background',
    statGridBg: 'bg-[rgba(17,17,17,0.08)] dark:bg-[rgba(255,255,255,0.06)]',
    ctaClass: 'bg-foreground text-background',
    stats: [
      { label: 'SETUP', value: '< 30 days' },
      { label: 'SPREAD MARK-UP', value: 'Custom' },
      { label: 'TECH', value: 'Turnkey' },
    ],
  },
] as const;

const STEP_NUMS = ['01', '02', '03', '04'] as const;

type StepItem = { num: string; title: string; desc: string };

export function IBPage({ cmsContent }: { cmsContent?: IBCmsContent | null }) {
  const locale = useLocale();
  const t = useTranslations('ib');

  const heroSubtitle = cmsContent?.heroSubtitle ?? t('heroSubtitle');

  const resolvedPartnerTypes = [
    {
      ...PARTNER_TYPES[0],
      desc: cmsContent?.ibDescription ?? PARTNER_TYPES[0].desc,
      stats: [
        {
          label: PARTNER_TYPES[0].stats[0].label,
          value: cmsContent?.ibRateDisplay ?? PARTNER_TYPES[0].stats[0].value,
        },
        PARTNER_TYPES[0].stats[1],
        PARTNER_TYPES[0].stats[2],
      ],
    },
    {
      ...PARTNER_TYPES[1],
      desc: cmsContent?.affiliateDescription ?? PARTNER_TYPES[1].desc,
      stats: [
        {
          label: PARTNER_TYPES[1].stats[0].label,
          value: cmsContent?.affiliateCpaMax ?? PARTNER_TYPES[1].stats[0].value,
        },
        PARTNER_TYPES[1].stats[1],
        PARTNER_TYPES[1].stats[2],
      ],
    },
    {
      ...PARTNER_TYPES[2],
      desc: cmsContent?.whiteLabelDescription ?? PARTNER_TYPES[2].desc,
    },
  ];

  const stepsFromCms = cmsContent?.steps;
  const resolvedSteps: StepItem[] = STEP_NUMS.map((num, i) => ({
    num,
    title: stepsFromCms?.[i]?.stepTitle ?? t(`step${i + 1}Title` as 'step1Title'),
    desc: stepsFromCms?.[i]?.stepDescription ?? t(`step${i + 1}Desc` as 'step1Desc'),
  }));

  const ctaHeading = cmsContent?.ctaHeading ?? t('ctaDesc');
  const ctaSubtitle = cmsContent?.ctaSubtitle ?? t('ctaSubDesc');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* h1: 42px tracking-[-1.26px] per Figma */}
          <h1 className="font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px]">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted mb-4 mt-4 max-w-[320px] text-[14px] leading-[1.6]">
            {heroSubtitle}
          </p>

          {/* CTAs — matches Figma: green pill + ghost text button */}
          <div className="mb-6 flex gap-[10px]">
            <Link
              href={`/${locale}/register?type=partner`}
              className="bg-accent font-body hover:bg-accent/90 flex items-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
            >
              {t('heroApplyBtn')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href="#programs"
              className="text-foreground font-body flex items-center px-[22px] py-4 text-[15px] font-medium transition-opacity hover:opacity-70"
            >
              {t('viewProgramsBtn')}
            </a>
          </div>

          {/* Earnings card — gradient from #fafaf9 to #f4f4f3 per Figma */}
          <div className="dark:from-surface dark:to-section rounded-[22px] bg-gradient-to-b from-[#fafaf9] to-[#f4f4f3] p-[22px]">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-[6px]">
                <span className="text-muted font-mono text-[10px] tracking-[1.2px]">
                  {t('earningsKicker')}
                </span>
                <span className="text-foreground font-sans text-[32px] font-semibold tracking-[-0.64px]">
                  $4,820
                </span>
              </div>
              <div className="bg-accent/[0.08] text-accent flex items-center gap-[6px] rounded-full px-[10px] py-[6px]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 10L10 2M10 2H5M10 2v5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-body text-accent text-[11px] font-bold">+28%</span>
              </div>
            </div>
            {/* Bar chart — 7 bars NOV-MAY */}
            <div className="mt-[18px] flex h-[60px] items-end gap-[6px]">
              {[
                { h: 39, label: 'NOV' },
                { h: 51, label: 'DEC' },
                { h: 60, label: 'JAN' },
                { h: 54, label: 'FEB' },
                { h: 77, label: 'MAR' },
                { h: 85, label: 'APR' },
                { h: 100, label: 'MAY' },
              ].map((bar, i) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-0">
                  <div
                    className={`w-full rounded-[4px] ${i === 6 ? 'bg-accent' : 'bg-[#e5e5e3] dark:bg-[#2e3138]'}`}
                    style={{ height: `${bar.h * 0.6}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'].map((m) => (
                <span key={m} className="text-muted font-mono text-[9px] tracking-[0.9px]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three ways to partner */}
      <section
        id="programs"
        className="rounded-t-[32px] bg-transparent px-5 pb-10 pt-10 xl:pb-16 xl:pt-16"
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('chooseKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-[10px] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            {t('chooseHeading')}
          </h2>
          <div className="mt-6 flex flex-col gap-[14px] xl:grid xl:grid-cols-3">
            {resolvedPartnerTypes.map((pt) => (
              <div
                key={pt.id}
                className={`shadow-card dark:shadow-card-dark flex flex-col gap-[12px] rounded-[22px] p-[22px] ${pt.cardClass}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-sans text-[22px] font-semibold tracking-[-0.44px] ${pt.headColor}`}
                  >
                    {pt.id === 'ib'
                      ? t('ibTitle')
                      : pt.id === 'affiliate'
                        ? t('affiliateTitle')
                        : t('wlTitle')}
                  </span>
                  <span
                    className={`flex-shrink-0 rounded-full px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px] ${pt.tagClass}`}
                  >
                    {pt.id === 'ib'
                      ? t('mostPopular')
                      : pt.id === 'affiliate'
                        ? t('cpaBadge')
                        : t('wlEnterprise')}
                  </span>
                </div>

                {/* Desc */}
                <p className={`font-body text-[13px] leading-[1.55] ${pt.descColor}`}>{pt.desc}</p>

                {/* Stats */}
                <div className={`flex gap-px overflow-hidden rounded-[12px] ${pt.statGridBg}`}>
                  {pt.stats.map((s) => (
                    <div
                      key={s.label}
                      className={`flex flex-1 flex-col gap-[2px] px-[10px] py-[12px] ${pt.statRowBg}`}
                    >
                      <span
                        className={`font-mono text-[9px] tracking-[1.08px] ${pt.statLabelColor}`}
                      >
                        {(
                          {
                            'UP TO': t('upTo'),
                            PAYOUTS: t('payouts'),
                            MINIMUM: t('minimum'),
                            COOKIE: t('cookieBadge'),
                            'MIN CPA': t('minCpaBadge'),
                            SETUP: t('wlSetup'),
                            'SPREAD MARK-UP': t('wlSpread'),
                            TECH: t('wlTech'),
                          } as Record<string, string>
                        )[s.label] ?? s.label}
                      </span>
                      <span className={`font-sans text-[14px] font-semibold ${pt.statValueColor}`}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?type=partner&program=${pt.id}`}
                  className={`font-body mt-1 flex items-center justify-center gap-2 rounded-full px-5 py-[14px] text-[14px] font-medium transition-opacity hover:opacity-80 ${pt.ctaClass}`}
                >
                  {t('applyBtn')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps — gradient section, white cards per Figma */}
      <section
        className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('stepsKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px]">
            {t('stepsHeading')}
          </h2>
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {resolvedSteps.map((step) => (
              <div
                key={step.num}
                className="bg-background shadow-card flex items-start gap-4 rounded-[18px] p-[18px] dark:shadow-none"
              >
                {/* Step number — accent 22px per Figma */}
                <span className="text-accent w-[38px] flex-shrink-0 font-sans text-[22px] font-semibold leading-none tracking-[-0.44px]">
                  {step.num}
                </span>
                <div className="flex-1">
                  <p className="text-foreground mb-1 font-sans text-[15px] font-semibold leading-normal">
                    {step.title}
                  </p>
                  <p className="font-body text-muted text-[12.5px] leading-[1.5]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — matches Figma: centered 32px heading, green pill + ghost text */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-11 xl:pb-16 xl:pt-16">
        <div className="mx-auto flex max-w-[390px] flex-col items-center md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 max-w-[280px] text-center font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] text-white">
            {ctaHeading}
          </h2>
          <p className="font-body mb-[22px] max-w-[300px] text-center text-[14px] leading-[1.55] text-white/60">
            {ctaSubtitle}
          </p>
          <Link
            href={`/${locale}/register?type=partner`}
            className="bg-accent font-body hover:bg-accent/90 mb-2 flex w-full items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
          >
            {t('ctaApply')}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <button className="font-body flex w-full items-center justify-center py-4 text-[15px] font-medium text-white transition-opacity hover:opacity-70">
            {t('ctaDeck')}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v8M4 9l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}
