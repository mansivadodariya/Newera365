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
    <section className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16" style={{ background: 'var(--gradient-features)' }}>
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="[&>span:first-child]:bg-muted mb-4 text-muted">
          {t('whyKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
          {t('whyTitle')}
        </h2>

        <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-background flex items-start gap-4 rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] dark:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]"
            >
              <div className="text-foreground flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.08)] dark:bg-[rgba(31,36,46,0.08)]">
                {ICONS[f.icon]}
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-foreground mb-[6px] font-sans text-[16px] font-semibold leading-normal">
                  {f.title}
                </h3>
                <p className="font-body text-muted text-[13px] leading-[1.5]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
