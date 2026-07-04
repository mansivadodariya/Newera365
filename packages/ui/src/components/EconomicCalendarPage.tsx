'use client';

import { useTranslations } from 'next-intl';
import { ChartWidget } from './ChartWidget';

export function EconomicCalendarPage() {
  const t = useTranslations('calendar');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.06] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            {t('heroAccent')}
          </h1>
          <p className="font-body max-w-[320px] text-[14px] leading-[1.55] text-[#6B7280] xl:max-w-[720px]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* TradingView Economic Calendar Widget */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
