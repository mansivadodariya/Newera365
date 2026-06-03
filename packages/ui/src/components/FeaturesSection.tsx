'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const FEATURES = [
  {
    iconSrc: '/icons/feature-execution.svg',
    titleKey: 'whyExecutionTitle',
    descKey: 'whyExecutionDesc',
  },
  {
    iconSrc: '/icons/feature-segregated.svg',
    titleKey: 'whySegregatedTitle',
    descKey: 'whySegregatedDesc',
  },
  {
    iconSrc: '/icons/feature-spreads.svg',
    titleKey: 'whySpreadsTitle',
    descKey: 'whySpreadsDesc',
  },
  {
    iconSrc: '/icons/feature-clock.png',
    titleKey: 'whyClockTitle',
    descKey: 'whyClockDesc',
  },
] as const;

export function FeaturesSection() {
  const t = useTranslations('home');

  return (
    <section className="rounded-[32px] bg-gradient-to-l from-[#e2e2e2] to-white px-5 pb-9 pt-10 xl:pb-16 xl:pt-16 dark:from-[#1a1c22] dark:to-[#0f0f14]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-muted mb-4 [&>span:first-child]:bg-[#6b7280]">
          {t('whyKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-[10px] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
          {t('whyTitle')}
        </h2>

        <div className="h-[10px]" />

        <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.titleKey}
              className="bg-background flex items-start gap-4 rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] dark:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.08)]">
                <Image src={f.iconSrc} alt="" width={24} height={24} />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-foreground mb-[6px] font-sans text-[16px] font-semibold leading-normal">
                  {t(f.titleKey)}
                </h3>
                <p className="font-body text-muted text-[13px] leading-[1.5]">{t(f.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
