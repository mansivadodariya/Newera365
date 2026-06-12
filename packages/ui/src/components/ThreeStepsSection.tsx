'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function ThreeStepsSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  const steps = [
    { num: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
    { num: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
    { num: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
  ];

  return (
    <section className="rounded-l-[32px] bg-gradient-to-r from-[#E2E2E2] to-white px-5 pb-9 pt-10 xl:pb-16 xl:pt-16 dark:from-[#1F262E] dark:to-[#000000]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        {/* Kicker */}
        <div className="mb-[14px] flex items-center gap-[6px]">
          <span className="h-px w-[18px] bg-[#6b7280]" />
          <span className="font-body text-[10px] font-medium uppercase tracking-[1.8px] text-[#6b7280]">
            {t('stepsKicker')}
          </span>
        </div>

        <h2 className="text-foreground mb-[12px] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
          {t('stepsHeading')}
        </h2>

        <div className="h-[12px]" />

        <div className="flex flex-col xl:flex-row xl:gap-[24px]">
          {steps.map((step, i) => (
            <div key={step.num} className="flex-1">
              <div className="flex items-start gap-4 py-5">
                <span className="text-accent w-[42px] flex-shrink-0 font-sans text-[28px] font-semibold leading-none tracking-[-0.56px]">
                  {step.num}
                </span>
                <div className="flex-1 pt-0.5">
                  <h3 className="text-foreground mb-[6px] font-sans text-[16px] font-semibold leading-normal">
                    {t(step.titleKey)}
                  </h3>
                  <p className="font-body text-[13px] leading-[1.5] text-[#6B7280] dark:text-[#B8BFCC]">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="h-px bg-[#e5e7eb] xl:hidden dark:bg-[#1a1c22]" />
              )}
            </div>
          ))}
        </div>

        <div className="h-[8px]" />

        {/* Full-width green pill button */}
        <Link
          href={`/${locale}/register`}
          className="bg-accent font-body hover:bg-accent/90 flex w-full items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors xl:w-auto xl:px-10"
        >
          {t('stepsGetStarted')}
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
    </section>
  );
}
