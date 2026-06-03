'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export function AiCrmPage() {
  const locale = useLocale();
  const t = useTranslations('aiCrm');

  return (
    <>
      {/* Hero */}
      <section className="bg-[#07090d] px-5 pb-10 pt-9 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#00B050]/20 [&>span:last-child]:text-[#00B050]">
            {t('kicker')}
          </SectionKicker>

          <h1 className="mb-3 font-sans text-[40px] font-semibold leading-[1.05] text-white xl:text-[56px]">
            {t('heroLine1')}
            <br />
            <span className="text-[#00B050]">{t('heroLine2')}</span>
          </h1>
          <p className="font-body mb-8 max-w-[340px] text-[14px] leading-[1.6] text-white/60 xl:max-w-[480px] xl:text-[16px]">
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
              className="font-body flex h-[48px] items-center rounded-full border border-white/20 px-6 text-[14px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              {t('salesBtn')}
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-10 overflow-hidden rounded-[20px] border border-white/10 bg-[#111316]">
            {/* Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00B050]" />
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
                  {t('dashboardKicker')}
                </span>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/10 px-0">
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
            {/* Insight */}
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
      </section>

      {/* What it does */}
      <section className="bg-white px-5 py-12 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-[#6B7280]/20 [&>span:last-child]:text-[#6B7280]">
            {t('featuresKicker')}
          </SectionKicker>
          <h2 className="mb-10 font-sans text-[30px] font-semibold leading-[1.1] text-[#07090d] xl:text-[40px]">
            {t('featuresLine1')}
            <br />
            {t('featuresLine2')}
          </h2>

          <div className="flex flex-col gap-8 xl:grid xl:grid-cols-3 xl:gap-6">
            {[
              {
                category: 'CRM',
                dot: '#00B050',
                title: t('feat1Title'),
                desc: t('feat1Desc'),
              },
              {
                category: 'SYSTEM',
                dot: '#3B82F6',
                title: t('feat2Title'),
                desc: t('feat2Desc'),
              },
              {
                category: 'REPORTING',
                dot: '#8B5CF6',
                title: t('feat3Title'),
                desc: t('feat3Desc'),
              },
            ].map((item) => (
              <div
                key={item.category}
                className="flex flex-col gap-3 rounded-[18px] border border-[#f0f0f0] bg-[#fafafa] p-6"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.dot }}
                  />
                  <span
                    className="font-body text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: item.dot }}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="font-sans text-[16px] font-semibold text-[#07090d]">{item.title}</p>
                <p className="font-body text-[13px] leading-[1.6] text-[#6b7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="bg-white px-5 pb-14 xl:px-[80px] xl:pb-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-[#6B7280]/20 [&>span:last-child]:text-[#6B7280]">
            {t('autoKicker')}
          </SectionKicker>
          <h2 className="mb-10 font-sans text-[30px] font-semibold leading-[1.1] text-[#07090d] xl:text-[40px]">
            {t('autoLine1')}
            <br />
            {t('autoLine2')}
          </h2>

          <div className="flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-6">
            {[
              {
                title: t('auto1Title'),
                desc: t('auto1Desc'),
              },
              {
                title: t('auto2Title'),
                desc: t('auto2Desc'),
              },
              {
                title: t('auto3Title'),
                desc: t('auto3Desc'),
              },
              {
                title: t('auto4Title'),
                desc: t('auto4Desc'),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[16px] border border-[#f0f0f0] bg-[#fafafa] p-5"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="#07090d"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-[#07090d]">{item.title}</p>
                  <p className="font-body mt-1 text-[13px] leading-[1.55] text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — matches Figma 1641:98 (light) / 1648:98 (dark) */}
      <section className="overflow-hidden rounded-t-[32px] bg-[#111] px-6 py-10 text-center xl:px-24 xl:py-16">
        <h2 className="mb-2 font-sans text-[26px] font-semibold text-white xl:text-[32px] dark:text-[#8c949e]">
          {t('ctaHeading')}
        </h2>
        <p className="font-body mb-[18px] text-[13px] leading-[1.55] text-[#b8bfcc] dark:text-[#8c949e]">
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
            className="font-body flex items-center rounded-[22px] border border-white/30 px-[16px] py-[12px] text-[13px] font-semibold text-white transition-colors hover:border-white/60 xl:text-[14px] dark:border-[#1f242e] dark:text-[#8c949e]"
          >
            {t('ctaSalesBtn')}
          </Link>
        </div>
      </section>
    </>
  );
}
