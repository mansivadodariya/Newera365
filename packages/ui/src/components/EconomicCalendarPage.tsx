'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';

export function EconomicCalendarPage() {
  const t = useTranslations('calendar');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-accent text-muted mb-4">
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

      {/* TradingView Economic Calendar Widget */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Impact legend — decodes the widget's three-dot importance marks. */}
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {(
              [
                ['#EF5350', t('legendHigh')],
                ['#F5A623', t('legendMedium')],
                ['#26A69A', t('legendLow')],
              ] as const
            ).map(([color, label]) => (
              <span
                key={label}
                className="text-muted text-eyebrow flex items-center gap-2 font-mono uppercase"
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
          {/* Height scales with the viewport so rows aren't clipped on small
              screens (the widget renders taller rows below ~640px wide). */}
          <div className="h-[560px] w-full overflow-hidden rounded-[20px] border border-transparent md:h-[640px] xl:h-[720px] dark:border-white/[0.08]">
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
      </section>
    </>
  );
}
