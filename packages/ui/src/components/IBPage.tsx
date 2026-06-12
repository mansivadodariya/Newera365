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
    stats: [
      { label: 'UP TO', value: '$8/lot' },
      { label: 'PAYOUTS', value: 'Monthly' },
      { label: 'MINIMUM', value: 'None' },
    ],
  },
  {
    id: 'affiliate',
    tag: 'CPA',
    stats: [
      { label: 'UP TO', value: '$1,200' },
      { label: 'COOKIE', value: '90 days' },
      { label: 'MIN CPA', value: '$50' },
    ],
  },
  {
    id: 'white-label',
    tag: 'ENTERPRISE',
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
      desc:
        cmsContent?.ibDescription ??
        'Earn up to $8 per lot traded by your referrals. Tiered structure with monthly bonus.',
      stats: [
        { label: 'UP TO', value: cmsContent?.ibRateDisplay ?? '$8/lot' },
        { label: 'PAYOUTS', value: 'Monthly' },
        { label: 'MINIMUM', value: 'None' },
      ],
    },
    {
      ...PARTNER_TYPES[1],
      desc:
        cmsContent?.affiliateDescription ??
        'Fixed cost-per-acquisition payouts up to $1,200 per qualified trader. Built for digital marketers.',
      stats: [
        { label: 'UP TO', value: cmsContent?.affiliateCpaMax ?? '$1,200' },
        { label: 'COOKIE', value: '90 days' },
        { label: 'MIN CPA', value: '$50' },
      ],
    },
    {
      ...PARTNER_TYPES[2],
      desc:
        cmsContent?.whiteLabelDescription ??
        'Launch your own brokerage on our infrastructure. Full MT5 stack, KYC, treasury, support.',
      stats: [
        { label: 'SETUP', value: '< 30 days' },
        { label: 'SPREAD MARK-UP', value: 'Custom' },
        { label: 'TECH', value: 'Turnkey' },
      ],
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
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-2 xl:items-center xl:gap-14">
          <div>
            {/* h1: 42px tracking-[-1.26px] per Figma, scaled up on desktop */}
            <h1 className="font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px] xl:text-[56px] xl:tracking-[-1.68px]">
              <span className="text-foreground">{t('heroLine1')}</span>
              <br />
              <span className="text-accent">{t('heroLine2')}</span>
            </h1>
            <p className="font-body mb-4 mt-4 max-w-[320px] text-[14px] leading-[1.6] text-[#6B7280] xl:max-w-[480px] xl:text-[16px] dark:text-[#B8BFCC]">
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
          </div>

          {/* Earnings card — soft green gradient per Figma */}
          <div className="dark:from-surface dark:to-section rounded-[22px] bg-gradient-to-b from-[#d8f5e0] to-[#eefbf2] p-[22px]">
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
        className="rounded-t-[32px] bg-[#FFFFFF] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16 dark:bg-[#07090D]"
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted mb-4 text-[#6B7280] dark:text-[#B8BFCC]">
            {t('chooseKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-[10px] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            {t('chooseHeading')}
          </h2>
          <div className="mt-6 flex flex-col gap-[14px] xl:grid xl:grid-cols-3">
            {resolvedPartnerTypes.map((pt) => (
              <div
                key={pt.id}
                className="hover:border-accent/20 dark:hover:border-accent/25 group relative flex flex-col gap-[12px] overflow-hidden rounded-[22px] border border-transparent bg-[#f2f2f2] p-[22px] transition-all duration-300 hover:-translate-y-1 hover:bg-[#07090D] hover:shadow-[0_20px_48px_rgba(0,176,80,0.15)] dark:border-white/[0.06] dark:bg-[#1a1c22] dark:hover:bg-[#07090D]"
              >
                {/* Green glow — fades in on hover */}
                <span
                  className="pointer-events-none absolute -top-[60px] left-[10%] h-[200px] w-[200px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-80"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(0,176,80,0.45) 0%, rgba(0,176,80,0.12) 44%, transparent 70%)',
                  }}
                  aria-hidden="true"
                />

                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-[22px] font-semibold tracking-[-0.44px] text-[#111] transition-colors duration-300 group-hover:text-white dark:text-white">
                    {pt.id === 'ib'
                      ? t('ibTitle')
                      : pt.id === 'affiliate'
                        ? t('affiliateTitle')
                        : t('wlTitle')}
                  </span>
                  <span className="bg-accent/10 text-accent group-hover:bg-accent/[0.18] flex-shrink-0 rounded-full px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px] transition-colors duration-300">
                    {pt.id === 'ib'
                      ? t('mostPopular')
                      : pt.id === 'affiliate'
                        ? t('cpaBadge')
                        : t('wlEnterprise')}
                  </span>
                </div>

                {/* Desc */}
                <p className="font-body text-[13px] leading-[1.55] text-[#6b7280] transition-colors duration-300 group-hover:text-white/60 dark:text-white/60">
                  {pt.desc}
                </p>

                {/* Stats */}
                <div className="flex gap-px overflow-hidden rounded-[12px] bg-[rgba(17,17,17,0.08)] transition-colors duration-300 group-hover:bg-[rgba(255,255,255,0.08)] dark:bg-[rgba(255,255,255,0.06)]">
                  {pt.stats.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-1 flex-col gap-[2px] bg-[#f2f2f2] px-[10px] py-[12px] transition-colors duration-300 group-hover:bg-[#07090D] dark:bg-[#1a1c22] dark:group-hover:bg-[#07090D]"
                    >
                      <span className="font-mono text-[9px] tracking-[1.08px] text-[#9ca3af] transition-colors duration-300 group-hover:text-white/45 dark:text-white/40">
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
                      <span className="font-sans text-[14px] font-semibold text-[#111] transition-colors duration-300 group-hover:text-white dark:text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?type=partner&program=${pt.id}`}
                  className="font-body group-hover:bg-accent relative mt-1 flex items-center justify-center gap-2 rounded-full bg-[#111] px-5 py-[14px] text-[14px] font-medium text-white transition-all duration-200 hover:opacity-100 group-hover:shadow-[0_6px_20px_rgba(0,176,80,0.4)] dark:bg-white/10"
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
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] xl:text-[36px]">
            {t('stepsHeading')}
          </h2>
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {resolvedSteps.map((step) => (
              <div
                key={step.num}
                className="bg-background shadow-card flex items-start gap-4 rounded-[18px] p-[18px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:shadow-none"
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
          <h2 className="mb-3 max-w-[280px] text-center font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] text-white xl:max-w-[640px] xl:text-[44px] xl:tracking-[-1.32px]">
            {ctaHeading}
          </h2>
          <p className="font-body mb-[22px] max-w-[300px] text-center text-[14px] leading-[1.55] text-white/60 xl:max-w-[480px] xl:text-[16px]">
            {ctaSubtitle}
          </p>
          <Link
            href={`/${locale}/register?type=partner`}
            className="bg-accent font-body hover:bg-accent/90 mb-2 flex w-full items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors xl:w-auto xl:px-12"
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
          <button className="font-body flex w-full items-center justify-center py-4 text-[15px] font-medium text-white transition-opacity hover:opacity-70 xl:w-auto xl:px-8">
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
