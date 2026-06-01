'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const FEATURES = [
  {
    icon: '/icons/feature-execution.svg',
    titleKey: 'whyExecutionTitle',
    descKey: 'whyExecutionDesc',
  },
  {
    icon: '/icons/feature-segregated.svg',
    titleKey: 'whySegregatedTitle',
    descKey: 'whySegregatedDesc',
  },
  { icon: '/icons/feature-spreads.svg', titleKey: 'whySpreadsTitle', descKey: 'whySpreadsDesc' },
  { icon: '/icons/feature-clock.png', titleKey: 'whyClockTitle', descKey: 'whyClockDesc' },
] as const;

export function FeaturesSection() {
  const t = useTranslations('home');

  return (
    <section className="bg-gradient-to-br from-white to-[#e2e2e2] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16 dark:from-[#1c1c1c] dark:to-[#111]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-5 text-[#6b7280]">{t('whyKicker')}</SectionKicker>

        <h2 className="mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] text-[#111] dark:text-white">
          {t('whyTitle')}
        </h2>

        {/* Vertical stack on mobile, 2-col on xl — white cards matching Figma */}
        <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.titleKey}
              className="flex items-start gap-[16px] rounded-[20px] bg-white p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] dark:bg-[#1c1c1c]"
            >
              {/* Icon box — 44×44, light bg */}
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.10)] dark:bg-[rgba(255,255,255,0.06)]">
                <Image
                  src={f.icon}
                  alt=""
                  width={24}
                  height={24}
                  unoptimized
                  className="dark:invert"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-[6px] pt-[2px]">
                <p className="font-sans text-[16px] font-semibold leading-tight text-[#111] dark:text-white">
                  {t(f.titleKey)}
                </p>
                <p className="font-body text-[13px] leading-[150%] text-[#6b7280]">
                  {t(f.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
