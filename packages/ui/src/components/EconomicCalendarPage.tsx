'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';
import { MarketSessionStrip } from './MarketSessionStrip';
import { ScrollReveal } from './ScrollReveal';

const STORY_KEYS = ['story1', 'story2', 'story3'] as const;

export function EconomicCalendarPage() {
  const t = useTranslations('calendar');
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground text-display mb-3 font-sans">
            {t('heroLine1')}
            <br />
            {t('heroAccent')}
          </h1>
          <p className="font-body text-body text-muted max-w-[320px] xl:max-w-[720px]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* The desk clock: live UTC time + the four sessions it governs */}
      <section className="px-5 pb-5">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <MarketSessionStrip showClock />
        </div>
      </section>

      {/* Calendar feed in terminal chrome */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]">
            {/* Terminal masthead: live dot + impact legend */}
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-white/[0.08] px-4 py-3 md:px-5">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="bg-accent-bright absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping" />
                  <span className="bg-accent-bright relative inline-flex h-2 w-2 rounded-full" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/[0.65]">
                  {t('liveFeedLabel')}
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {(
                  [
                    ['#EF5350', t('legendHigh')],
                    ['#F5A623', t('legendMedium')],
                    ['#26A69A', t('legendLow')],
                  ] as const
                ).map(([color, label]) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white/[0.55]"
                  >
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            {/* Height scales with the viewport so rows aren't clipped on small
                screens (the widget renders taller rows below ~640px wide). */}
            <div className="h-[560px] w-full md:h-[640px] xl:h-[720px]">
              <ChartWidget
                type="economic-calendar"
                theme="dark"
                width="100%"
                height="100%"
                className="h-full"
                config={{
                  importanceFilter: '-1,0,1',
                  countryFilter: 'ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu',
                  isTransparent: false,
                }}
              />
            </div>
          </div>
          <p className="font-body text-caption text-muted mt-3">{t('dataNote')}</p>
        </div>
      </section>

      {/* How the desk reads it: three numbered editorial rows */}
      <section className="px-5 pb-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-2">
              {t('storyKicker')}
            </SectionKicker>
          </ScrollReveal>
          <div className="divide-border border-border divide-y border-b">
            {STORY_KEYS.map((key, i) => (
              <ScrollReveal key={key} index={i}>
                <div className="row-hover group grid gap-2 py-6 md:grid-cols-[120px_260px_1fr] md:gap-6">
                  <span
                    className="text-foreground group-hover:text-accent dark:text-accent-bright select-none font-sans text-[32px] font-semibold tabular-nums leading-none tracking-tight opacity-[0.08] transition-[color,opacity] duration-200 group-hover:opacity-40 md:text-[40px] dark:opacity-[0.28] dark:group-hover:opacity-70"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-foreground text-title font-sans leading-snug">
                    {t(`${key}Title`)}
                  </h2>
                  <p className="font-body text-muted max-w-[52ch] text-[15px] leading-relaxed">
                    {t(`${key}Desc`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal index={3}>
            <Link
              href={`/${locale}/guides`}
              className="font-body text-accent link-underline mt-6 inline-flex items-center gap-2 text-[15px] font-medium"
            >
              {t('storyLinkLabel')}
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="rtl:-scale-x-100"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
