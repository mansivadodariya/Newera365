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
    <section className="dark:bg-background bg-white px-5 pb-9 pt-10 xl:pb-16 xl:pt-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="[&>span:first-child]:bg-muted mb-5 font-mono text-[10px] font-medium leading-[100%] tracking-[0.18em] text-[#6B7280]">
          {t('stepsKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-4 font-sans text-[28px] font-semibold leading-[110%] tracking-[-0.56px]">
          {t('stepsHeading')}
        </h2>

        <div className="flex flex-col gap-[16px] xl:flex-row xl:gap-[24px]">
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-4 p-[20px]">
              {/* Step number */}
              <span className="text-accent w-[42px] flex-shrink-0 font-sans text-[28px] font-semibold leading-[100%] tracking-[-0.02em]">
                {step.num}
              </span>
              <div className="flex-1 gap-[6px] pt-0.5">
                <h3 className="text-foreground mb-[6px] font-sans text-[16px] font-semibold">
                  {step.title}
                </h3>
                <p className="font-body text-muted text-[13px] leading-[150%]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/register`}
          className="bg-accent font-body hover:bg-accent-hover mt-9 flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors xl:w-auto xl:px-10"
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
