'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';
import { MARKET_OVERVIEW_CONFIG } from './marketOverviewConfig';

export function LiveWatchlistPage() {
  const t = useTranslations('watchlist');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* TradingView market-overview widget — handles tabs natively */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="h-[500px] overflow-hidden rounded-[22px] bg-[#0d1117] md:h-[600px] xl:h-[660px] xl:rounded-[28px]">
            <ChartWidget
              type="market-overview"
              theme="dark"
              width="100%"
              height="100%"
              config={MARKET_OVERVIEW_CONFIG}
            />
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">{t('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}
