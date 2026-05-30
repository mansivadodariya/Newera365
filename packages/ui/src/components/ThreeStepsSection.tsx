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
    <section className="bg-background px-5 pb-9 pt-10 xl:pb-16 xl:pt-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="[&>span:first-child]:bg-muted mb-4 text-muted">
          {t('stepsKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-4 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
          {t('stepsHeading')}
        </h2>

        <div className="flex flex-col gap-[16px] xl:flex-row xl:gap-[24px]">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-1 items-start gap-4 p-[20px]">
              <span className="text-accent w-[42px] flex-shrink-0 font-sans text-[28px] font-semibold leading-none tracking-[-0.56px]">
                {step.num}
              </span>
              <div className="flex-1 pt-0.5">
                <h3 className="text-foreground mb-[6px] font-sans text-[16px] font-semibold leading-normal">
                  {step.title}
                </h3>
                <p className="font-body text-muted text-[13px] leading-[1.5]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/register`}
          className="bg-accent font-body hover:bg-accent-hover mt-6 flex w-full items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors xl:w-auto xl:px-10"
        >
          {t('stepsGetStarted')}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  );
}
