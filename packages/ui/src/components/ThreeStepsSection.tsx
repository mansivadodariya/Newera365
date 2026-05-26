'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export function ThreeStepsSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
  ];

  return (
    <section className="dark:bg-background bg-white px-5 pb-9 pt-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
        <SectionKicker className="mb-5">{t('stepsKicker')}</SectionKicker>

        <h2 className="text-foreground mb-4 font-sans text-[32px] font-semibold leading-[1.1]">
          {t('stepsHeading')}
        </h2>

        <div className="flex flex-col gap-[14px]">
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-4 py-5">
              {/* Step number */}
              <span className="text-accent w-[42px] flex-shrink-0 font-sans text-[28px] font-semibold leading-none">
                {step.num}
              </span>
              <div className="pt-0.5">
                <h3 className="text-foreground mb-[6px] font-sans text-[16px] font-semibold">
                  {step.title}
                </h3>
                <p className="font-body text-muted text-[13px] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/register`}
          className="bg-accent font-body hover:bg-accent-hover mt-9 flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors"
        >
          {t('stepsGetStarted')}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
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
