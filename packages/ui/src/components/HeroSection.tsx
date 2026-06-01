'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { TradingViewWidget } from './TradingViewWidget';

export function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const { resolvedTheme } = useTheme();

  return (
    <section className="dark:bg-background bg-white px-5 pb-7 pt-9 xl:pb-0 xl:pt-16">
      <div className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-center xl:gap-16">
        {/* Left col: headline + subtitle + CTAs */}
        <div className="flex flex-col gap-[18px] xl:w-[516px] xl:flex-shrink-0">
          <h1 className="text-foreground font-sans text-[44px] font-semibold leading-[102%] tracking-[-1.54px] xl:text-[52px] xl:tracking-[-2px]">
            {t('heroLine1')} <span className="text-accent">{t('heroPremium')}</span>{' '}
            {t('heroLine2')}
          </h1>

          <p className="font-body text-muted max-w-[320px] text-[14.5px] leading-[155%]">
            {t('heroSubtitle')}
          </p>

          <div className="flex gap-[10px]">
            <Link
              href={`/${locale}/register`}
              className="bg-accent font-body hover:bg-accent-hover flex flex-1 items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors xl:flex-none"
            >
              {t('heroCTALive')}
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
            <Link
              href={`/${locale}/demo-account`}
              className="text-foreground font-body flex flex-1 items-center justify-center px-[22px] py-4 text-[15px] font-medium transition-opacity hover:opacity-70 xl:flex-none"
            >
              {t('heroCTADemo')}
            </Link>
          </div>
        </div>

        {/* Right col / bottom on mobile: chart card */}
        <div className="overflow-hidden rounded-[24px] bg-[#0E1116] xl:min-w-0 xl:flex-1">
          {/* TradingView chart */}
          <div className="relative w-full" style={{ aspectRatio: '620/342' }}>
            <TradingViewWidget
              type="advanced-chart"
              symbol="OANDA:EURUSD"
              theme={resolvedTheme === 'dark' ? 'dark' : 'dark'}
              config={{
                hide_top_toolbar: true,
                hide_legend: true,
                hide_side_toolbar: true,
                allow_symbol_change: false,
                save_image: false,
                style: '1',
                backgroundColor: '#0E1116',
                gridColor: 'rgba(255,255,255,0.04)',
              }}
            />
          </div>

          {/* Specs row */}
          <div className="grid grid-cols-3 border-t border-white/10 pb-[12px] pt-[12px]">
            {[
              { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
              { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
              { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
            ].map((spec) => (
              <div key={spec.label} className="flex flex-col items-center gap-[2px]">
                <span className="font-mono text-[9px] font-normal uppercase leading-[100%] tracking-[0.15em] text-white/60">
                  {spec.label}
                </span>
                <span className="font-sans text-[14px] font-semibold text-white">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
