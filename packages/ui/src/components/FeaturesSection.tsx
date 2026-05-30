'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const ICONS = {
  execution: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 4C7.13 4 4 7.13 4 11s3.13 7 7 7 7-3.13 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 2l4 2-2 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  segregated: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11a5 5 0 005 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 7a5 5 0 00-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle
        cx="14.5"
        cy="7.5"
        r="3"
        fill="currentColor"
        fillOpacity=".12"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M13.5 7.5l.8.8 1.5-1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  spreads: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="7.5" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="14.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 18L18 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 7v4l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6l1.5 1M19 6l-1.5 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export function FeaturesSection() {
  const t = useTranslations('home');

  const features = [
    { icon: 'execution' as const, title: t('whyExecution'), desc: t('whyExecutionDesc') },
    { icon: 'segregated' as const, title: t('whySegregated'), desc: t('whySegregatedDesc') },
    { icon: 'spreads' as const, title: t('whySpreads'), desc: t('whySpreadsDesc') },
    { icon: 'clock' as const, title: t('whyClock'), desc: t('whyClockDesc') },
  ];

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
              <div className="text-foreground flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.08)] dark:bg-[rgba(255,255,255,0.06)]">
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
