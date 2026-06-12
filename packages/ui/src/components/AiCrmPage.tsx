'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const FEATURE_STYLES = [
  {
    category: 'CRM',
    dot: '#00B050',
    cardCls:
      'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#00B050]/40 dark:bg-[#061a0d] dark:border-[#00B050]/25 dark:hover:border-[#00B050]/50',
    catCls: 'text-[#00B050]',
  },
  {
    category: 'SYSTEM',
    dot: '#3B82F6',
    cardCls:
      'bg-[#eff6ff] border-[#bfdbfe] hover:border-[#3B82F6]/40 dark:bg-[#06102a] dark:border-[#3B82F6]/25 dark:hover:border-[#3B82F6]/50',
    catCls: 'text-[#3B82F6]',
  },
  {
    category: 'REPORTING',
    dot: '#8B5CF6',
    cardCls:
      'bg-[#faf5ff] border-[#ddd6fe] hover:border-[#8B5CF6]/40 dark:bg-[#150a2a] dark:border-[#8B5CF6]/25 dark:hover:border-[#8B5CF6]/50',
    catCls: 'text-[#8B5CF6]',
  },
];

export function AiCrmPage() {
  const locale = useLocale();
  const t = useTranslations('aiCrm');

  const features = FEATURE_STYLES.map((s, i) => ({
    ...s,
    title: [t('feat1Title'), t('feat2Title'), t('feat3Title')][i],
    desc: [t('feat1Desc'), t('feat2Desc'), t('feat3Desc')][i],
  }));

  const automations = [
    {
      title: t('auto1Title'),
      desc: t('auto1Desc'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 5v3l2 2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: t('auto2Title'),
      desc: t('auto2Desc'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: t('auto3Title'),
      desc: t('auto3Desc'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ),
    },
    {
      title: t('auto4Title'),
      desc: t('auto4Desc'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="px-5 pb-10 pt-9 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:grid xl:grid-cols-2 xl:items-center xl:gap-16">
            {/* Left: text + CTAs */}
            <div>
              <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
                {t('kicker')}
              </SectionKicker>

              <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] xl:text-[56px] dark:text-white">
                {t('heroLine1')}
                <br />
                <span className="text-[#00B050]">{t('heroLine2')}</span>
              </h1>
              <p className="font-body text-muted mb-8 max-w-[340px] text-[14px] leading-[1.6] xl:max-w-[480px] xl:text-[16px] dark:text-white/60">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/contact`}
                  className="font-body flex h-[48px] items-center gap-2 rounded-full bg-[#00B050] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90"
                >
                  {t('demoBtn')}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="font-body border-foreground/20 text-foreground/80 hover:border-foreground/40 hover:text-foreground flex h-[48px] items-center rounded-full border px-6 text-[14px] font-medium transition-colors dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 dark:hover:text-white"
                >
                  {t('salesBtn')}
                </Link>
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="mt-10 overflow-hidden rounded-[20px] border border-white/10 bg-[#111316] xl:mt-0">
              <div className="flex items-center border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00B050]" />
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
                    {t('dashboardKicker')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10">
                {[
                  { value: '2.1k', label: t('tabLeads') },
                  { value: '92%', label: t('tabScore') },
                  { value: '$1.4M', label: t('tabAtc') },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-4">
                    <p className="font-sans text-[22px] font-semibold text-white">{stat.value}</p>
                    <p className="font-body text-[10px] uppercase tracking-[0.08em] text-white/40">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 px-5 py-4">
                <p className="font-body mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#00B050]">
                  {t('insightLabel')}
                </p>
                <p className="font-body text-[13px] leading-[1.5] text-white/80">
                  {t('insightText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What it does — feature cards with per-color tint */}
      <section className="bg-white px-5 py-12 xl:px-[80px] xl:py-20 dark:bg-[#111316]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            {t('featuresKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-10 font-sans text-[30px] font-semibold leading-[1.1] xl:text-[40px]">
            {t('featuresLine1')}
            <br />
            {t('featuresLine2')}
          </h2>

          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3 xl:gap-[12px]">
            {features.map((item) => (
              <div
                key={item.category}
                className={`group flex flex-col gap-3 rounded-[18px] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.cardCls}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.dot }}
                  />
                  <span
                    className={`font-body text-[10px] font-semibold uppercase tracking-[0.12em] ${item.catCls}`}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="text-foreground font-sans text-[16px] font-semibold">{item.title}</p>
                <p className="text-muted font-body text-[13px] leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="bg-white px-5 pb-14 xl:px-[80px] xl:pb-20 dark:bg-[#111316]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            {t('autoKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-10 font-sans text-[30px] font-semibold leading-[1.1] xl:text-[40px]">
            {t('autoLine1')}
            <br />
            {t('autoLine2')}
          </h2>

          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2 xl:gap-[12px]">
            {automations.map((item) => (
              <div
                key={item.title}
                className="group flex items-start gap-4 rounded-[16px] border border-[#e5e7eb] bg-[#fafaf9] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.07] dark:bg-[#1a1c22]"
              >
                <div className="group-hover:border-accent/30 group-hover:text-accent mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111] transition-colors duration-200 dark:border-white/[0.07] dark:bg-[#111316] dark:text-white">
                  {item.icon}
                </div>
                <div>
                  <p className="text-foreground font-sans text-[14px] font-semibold">
                    {item.title}
                  </p>
                  <p className="text-muted font-body mt-1 text-[13px] leading-[1.55]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="overflow-hidden rounded-t-[32px] bg-[#111] px-6 py-10 text-center xl:px-24 xl:py-16">
        <h2 className="mb-2 font-sans text-[26px] font-semibold text-white xl:text-[32px]">
          {t('ctaHeading')}
        </h2>
        <p className="font-body mb-[18px] text-[13px] leading-[1.55] text-[#b8bfcc]">
          {t('ctaDesc')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[10px]">
          <Link
            href={`/${locale}/contact`}
            className="font-body flex items-center gap-[6px] rounded-[22px] bg-[#00b050] px-[18px] py-[12px] text-[13px] font-semibold text-white transition-colors hover:bg-[#00b050]/90 xl:text-[14px]"
          >
            {t('ctaDemoBtn')}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="font-body flex items-center rounded-[22px] border border-white/30 px-[16px] py-[12px] text-[13px] font-semibold text-white transition-colors hover:border-white/60 xl:text-[14px]"
          >
            {t('ctaSalesBtn')}
          </Link>
        </div>
      </section>
    </>
  );
}
