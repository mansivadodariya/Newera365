'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export interface IBCmsContent {
  heroSubtitle?: string | null;
  ibDescription?: string | null;
  affiliateDescription?: string | null;
  whiteLabelDescription?: string | null;
  ibTag?: string | null;
  ibRateDisplay?: string | null;
  ibPayoutsFrequency?: string | null;
  ibMinimum?: string | null;
  affiliateTag?: string | null;
  affiliateCpaMax?: string | null;
  affiliateCookieDays?: string | null;
  affiliateMinCpa?: string | null;
  wlTag?: string | null;
  wlSetupTime?: string | null;
  wlSpreadMarkup?: string | null;
  wlTechStack?: string | null;
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

const AR_STAT_VALUES: Record<string, string> = {
  Monthly: 'شهرياً',
  None: 'لا يوجد',
  Custom: 'مخصص',
  Turnkey: 'جاهز للعمل',
};

export function IBPage({ cmsContent }: { cmsContent?: IBCmsContent | null }) {
  const t = useTranslations('ib');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const localiseStatValue = (v: string) => (isAr && AR_STAT_VALUES[v] ? AR_STAT_VALUES[v] : v);

  const heroSubtitle = cmsContent?.heroSubtitle ?? t('heroSubtitle');

  const resolvedPartnerTypes = [
    {
      ...PARTNER_TYPES[0],
      tag: cmsContent?.ibTag ?? t('mostPopular'),
      desc: cmsContent?.ibDescription ?? t('ibDesc'),
      stats: [
        { label: 'UP TO', value: cmsContent?.ibRateDisplay ?? '$8/lot' },
        { label: 'PAYOUTS', value: localiseStatValue(cmsContent?.ibPayoutsFrequency ?? 'Monthly') },
        { label: 'MINIMUM', value: localiseStatValue(cmsContent?.ibMinimum ?? 'None') },
      ],
    },
    {
      ...PARTNER_TYPES[1],
      tag: cmsContent?.affiliateTag ?? t('cpaBadge'),
      desc: cmsContent?.affiliateDescription ?? t('affiliateDesc'),
      stats: [
        { label: 'UP TO', value: cmsContent?.affiliateCpaMax ?? '$1,200' },
        { label: 'COOKIE', value: cmsContent?.affiliateCookieDays ?? '90 days' },
        { label: 'MIN CPA', value: cmsContent?.affiliateMinCpa ?? '$50' },
      ],
    },
    {
      ...PARTNER_TYPES[2],
      tag: cmsContent?.wlTag ?? t('wlEnterprise'),
      desc: cmsContent?.whiteLabelDescription ?? t('wlDesc'),
      stats: [
        { label: 'SETUP', value: cmsContent?.wlSetupTime ?? '< 30 days' },
        {
          label: 'SPREAD MARK-UP',
          value: localiseStatValue(cmsContent?.wlSpreadMarkup ?? 'Custom'),
        },
        { label: 'TECH', value: localiseStatValue(cmsContent?.wlTechStack ?? 'Turnkey') },
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

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    country: '',
    message: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [applyError, setApplyError] = useState('');
  const setField =
    (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  async function submitApply(e: FormEvent) {
    e.preventDefault();
    if (applyLoading) return;
    setApplyLoading(true);
    setApplyError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/partners/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      if (res.ok) {
        setApplyDone(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setApplyError(data.error ?? t('applyError'));
      }
    } catch {
      setApplyError(t('applyError'));
    } finally {
      setApplyLoading(false);
    }
  }
  const inputCls =
    'font-body text-foreground focus:border-accent w-full rounded-[12px] border border-[#e5e5e3] bg-[#fafaf9] px-4 py-3 text-[14px] outline-none dark:border-white/10 dark:bg-[#1a1c22]';

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-2 xl:items-center xl:gap-14">
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
              <a
                href="#apply"
                className="bg-accent hover:bg-accent/90 font-body flex items-center rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
              >
                {t('applyNow')}
              </a>
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
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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

      {/* Partner application form — POSTs to /api/partners/apply */}
      <section id="apply" className="bg-transparent px-5 pb-12 pt-2">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[760px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('applyKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.6px] xl:text-[32px]">
            {t('applyHeading')}
          </h2>
          {applyDone ? (
            <div className="bg-accent/10 text-accent font-body rounded-[16px] px-5 py-6 text-[14px]">
              {t('applySuccess')}
            </div>
          ) : (
            <form onSubmit={submitApply} className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder={t('applyName')}
                  value={form.name}
                  onChange={setField('name')}
                  className={inputCls}
                />
                <input
                  required
                  type="email"
                  placeholder={t('applyEmail')}
                  value={form.email}
                  onChange={setField('email')}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder={t('applyCompany')}
                  value={form.company}
                  onChange={setField('company')}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder={t('applyWebsite')}
                  value={form.website}
                  onChange={setField('website')}
                  className={inputCls}
                />
              </div>
              <input
                type="text"
                placeholder={t('applyCountry')}
                value={form.country}
                onChange={setField('country')}
                className={inputCls}
              />
              <textarea
                placeholder={t('applyMessage')}
                value={form.message}
                onChange={setField('message')}
                rows={4}
                className={inputCls}
              />
              {applyError && <p className="font-body text-[12px] text-red-500">{applyError}</p>}
              <button
                type="submit"
                disabled={applyLoading}
                className="bg-accent hover:bg-accent/90 font-body w-full rounded-full px-6 py-4 text-[15px] font-medium text-white transition-colors disabled:opacity-60 xl:w-auto xl:self-start xl:px-10"
              >
                {applyLoading ? t('applySubmitting') : t('applyCta')}
              </button>
            </form>
          )}
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
          <a
            href="#apply"
            className="bg-accent hover:bg-accent/90 font-body flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium text-white transition-colors"
          >
            {t('applyCta')}
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
