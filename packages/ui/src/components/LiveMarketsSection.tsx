'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';
import { MARKET_OVERVIEW_CONFIG } from './marketOverviewConfig';

/**
 * Homepage live-markets panel — a branded "terminal" card around the
 * TradingView market-overview embed (real live prices, tabs handled natively
 * by the widget). The card keeps a fixed dark surface in both themes, matching
 * the ticker and /tools/watchlist convention for market widgets.
 */
export function LiveMarketsSection() {
  const locale = useLocale();
  const t = useTranslations('home');

  return (
    <section className="px-5 py-12 xl:py-16">
      <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-4">{t('liveMarketsKicker')}</SectionKicker>
        <h2 className="text-foreground text-headline mb-3 font-sans">{t('liveMarketsHeading')}</h2>
        <p className="font-body text-muted mb-6 max-w-[480px] text-[14px] leading-[155%]">
          {t('liveMarketsSub')}
        </p>

        <div className="h-[420px] overflow-hidden rounded-[22px] bg-[#0d1117] md:h-[520px] xl:h-[600px] xl:rounded-[28px]">
          <ChartWidget
            type="market-overview"
            theme="dark"
            width="100%"
            height="100%"
            config={MARKET_OVERVIEW_CONFIG}
          />
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Link
            href={`/${locale}/tools/watchlist`}
            className="text-accent hover:text-accent-hover font-body inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
          >
            {t('liveMarketsCta')}
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
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
      </div>
    </section>
  );
}
