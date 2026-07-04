'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const FEATURE_CATEGORIES = ['CRM', 'SYSTEM', 'REPORTING'];

/* Static mockup data — design fixture, not CMS content. */
const KPI_VALUES = ['2,184', '92%', '$1.4M'];
const LEAD_ROWS: Array<[string, number]> = [
  ['Marko V.', 94],
  ['Aiyana P.', 88],
  ['L. Marchetti', 71],
];

const AUTOMATION_ICONS = [
  /* target — client management */
  <svg key="target" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7" stroke="#111" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="2.5" stroke="#111" strokeWidth="1.5" />
  </svg>,
  /* arrow — lead tracking */
  <svg
    key="arrow"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className="rtl:-scale-x-100"
  >
    <path
      d="M3 10h14M12 5l5 5-5 5"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  /* bars — broker dashboards */
  <svg key="bars" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 16v-5M10 16V4m6 12v-8" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  /* shield — admin & compliance */
  <svg key="shield" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M10 2.5 4 5v4.5c0 3.7 2.6 6.6 6 8 3.4-1.4 6-4.3 6-8V5l-6-2.5Z"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m7.5 10 1.8 1.8 3.2-3.6"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
];

function ArrowIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
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
  );
}

export function AiCrmPage() {
  const locale = useLocale();
  const t = useTranslations('aiCrm');

  const features = FEATURE_CATEGORIES.map((category, i) => ({
    category,
    title: [t('feat1Title'), t('feat2Title'), t('feat3Title')][i],
    desc: [t('feat1Desc'), t('feat2Desc'), t('feat3Desc')][i],
  }));

  const automations = [
    { title: t('auto1Title'), desc: t('auto1Desc') },
    { title: t('auto2Title'), desc: t('auto2Desc') },
    { title: t('auto3Title'), desc: t('auto3Desc') },
    { title: t('auto4Title'), desc: t('auto4Desc') },
  ];

  const kpis = KPI_VALUES.map((value, i) => ({
    value,
    label: [t('kpiLeads'), t('kpiScore'), t('kpiDeposits')][i],
  }));

  const stages = [t('stageFunded'), t('stageKyc'), t('stageDemo')];

  return (
    <>
      {/* Hero — light mode fades from brand green into white; dark inherits page bg */}
      <section className="bg-gradient-to-b from-[#b2ffab] to-white px-5 pb-10 pt-9 xl:px-[80px] xl:pb-[60px] xl:pt-20 dark:bg-none">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:grid xl:grid-cols-[1fr_480px] xl:items-center xl:gap-[60px]">
            {/* Left: text + CTAs */}
            <div>
              <SectionKicker className="mb-4 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280] dark:[&>span:last-child]:text-[#b8bfcc]">
                {t('kicker')}
              </SectionKicker>

              <h1 className="mb-4 font-sans text-[40px] font-semibold leading-[1.1] text-[#111] xl:text-[48px] dark:text-white">
                {t('heroLine1')}
                <br />
                <span className="text-[#00B050]">{t('heroLine2')}</span>
              </h1>
              <p className="font-body mb-7 max-w-[480px] text-[14px] leading-[24px] text-[#6b7280] xl:text-[15px] dark:text-[#b8bfcc]">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/contact`}
                  className="font-body flex items-center gap-2 rounded-[10px] bg-[#00B050] px-[22px] py-[14px] text-[14px] font-semibold text-white transition-colors hover:bg-[#00B050]/90"
                >
                  {t('demoBtn')}
                  <ArrowIcon />
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="font-body flex items-center rounded-[10px] border border-[#111] px-5 py-[14px] text-[14px] font-semibold text-[#121212] transition-colors hover:bg-[#111]/5 dark:border-[#1f242e] dark:text-white dark:hover:bg-white/5"
                >
                  {t('salesBtn')}
                </Link>
              </div>
            </div>

            {/* Right: CRM dashboard mockup — dark card in both modes */}
            <div className="mt-10 flex flex-col gap-4 rounded-[16px] bg-[#111] p-[22px] xl:mt-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00B050]" />
                <span className="font-body flex-1 text-[12px] font-medium text-white dark:text-[#b8bfcc]">
                  {t('dashboardKicker')}
                </span>
                <span className="font-body text-[10px] text-[#8c949e]">●●●</span>
              </div>

              <div className="flex gap-2.5">
                {kpis.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-1 flex-col gap-1 rounded-[20px] bg-[#1f262e] px-3 py-3.5"
                  >
                    <p className="font-sans text-[20px] font-bold leading-none text-[#00B050]">
                      {stat.value}
                    </p>
                    <p className="font-body text-[11px] text-[#8c949e]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1 rounded-[20px] border border-[#00B050] bg-[#1f262e] p-3.5">
                <p className="font-body text-[10px] font-medium uppercase tracking-[0.12em] text-[#00B050]">
                  {t('insightLabel')}
                </p>
                <p className="font-body text-[13px] leading-[18px] text-white dark:text-[#b8bfcc]">
                  {t('insightText')}
                </p>
              </div>

              <div className="rounded-[20px] bg-[#1f262e]">
                <div className="font-body flex px-3.5 py-2.5 text-[10px] font-medium tracking-[0.1em] text-[#8c949e]">
                  <span className="flex-1">{t('tableLead')}</span>
                  <span className="flex-1">{t('tableStage')}</span>
                  <span className="flex-1">{t('tableScore')}</span>
                </div>
                {LEAD_ROWS.map(([name, score], i) => (
                  <div key={name} className="font-body flex px-3.5 py-2.5 text-[12px]">
                    <span className="flex-1 text-white dark:text-[#b8bfcc]">{name}</span>
                    <span className="flex-1 text-white dark:text-[#b8bfcc]">{stages[i]}</span>
                    <span className="flex-1 font-semibold text-[#00B050]">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What it does — gradient cards with green category pills */}
      <section className="bg-[#fafaf9] px-5 py-12 xl:px-[80px] xl:py-[60px] dark:bg-transparent">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3.5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280] dark:[&>span:last-child]:text-[#b8bfcc]">
            {t('featuresKicker')}
          </SectionKicker>
          <h2 className="mb-2 font-sans text-[28px] font-semibold leading-[1.15] text-[#111] xl:text-[32px] dark:text-white">
            {t('featuresLine1')} {t('featuresLine2')}
          </h2>
          <p className="font-body mb-8 max-w-[720px] text-[15px] leading-[24px] text-[#6b7280] dark:text-[#b8bfcc]">
            {t('featuresSubtitle')}
          </p>

          <div className="flex flex-col gap-5 xl:grid xl:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.category}
                className="flex flex-col items-start gap-3.5 rounded-[20px] bg-gradient-to-l from-[#e2e2e2] to-white px-7 py-8 dark:bg-[#111] dark:bg-none"
              >
                <span className="font-body rounded-[12px] bg-[#ecf8f1] px-2.5 py-[5px] text-[10px] font-medium tracking-[0.12em] text-[#00B050] dark:bg-white/[0.06]">
                  {item.category}
                </span>
                <p className="font-sans text-[20px] font-semibold text-[#111] dark:text-white">
                  {item.title}
                </p>
                <p className="font-body text-[14px] leading-[22px] text-[#6b7280] dark:text-[#b8bfcc]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automation — 2×2 icon-tile cards */}
      <section className="bg-white px-5 py-12 xl:px-[80px] xl:py-[60px] dark:bg-transparent">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3.5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280] dark:[&>span:last-child]:text-[#b8bfcc]">
            {t('autoKicker')}
          </SectionKicker>
          <h2 className="mb-2 font-sans text-[28px] font-semibold leading-[1.15] text-[#111] xl:text-[32px] dark:text-white">
            {t('autoLine1')} {t('autoLine2')}
          </h2>
          <p className="font-body mb-8 max-w-[720px] text-[15px] leading-[24px] text-[#6b7280] dark:text-[#b8bfcc]">
            {t('autoSubtitle')}
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            {automations.map((item, i) => (
              <div
                key={item.title}
                className="flex flex-col items-start gap-3.5 rounded-[20px] bg-gradient-to-l from-[#e2e2e2] to-white p-7 dark:bg-[#111] dark:bg-none"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#ecf8f1] dark:bg-white">
                  {AUTOMATION_ICONS[i]}
                </span>
                <p className="font-body text-[18px] font-semibold text-[#111] dark:text-white">
                  {item.title}
                </p>
                <p className="font-body text-[14px] leading-[22px] text-[#6b7280] dark:text-[#b8bfcc]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111] px-6 py-12 text-center xl:px-[80px] xl:py-[60px]">
        <h2 className="mb-2.5 font-sans text-[30px] font-semibold text-white xl:text-[38px] dark:text-[#b8bfcc]">
          {t('ctaHeading')}
        </h2>
        <p className="font-body mb-6 text-[14px] leading-[1.55] text-[#b8bfcc] xl:text-[15px] dark:text-[#8c949e]">
          {t('ctaDesc')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/contact`}
            className="font-body flex items-center gap-2 rounded-[10px] bg-[#00b050] px-6 py-[14px] text-[14px] font-semibold text-white transition-colors hover:bg-[#00b050]/90"
          >
            {t('ctaDemoBtn')}
            <ArrowIcon />
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="font-body flex items-center rounded-[10px] border border-white px-[22px] py-[14px] text-[14px] font-semibold text-white transition-colors hover:bg-white/10 dark:border-[#1f242e]"
          >
            {t('ctaSalesBtn')}
          </Link>
        </div>
      </section>
    </>
  );
}
