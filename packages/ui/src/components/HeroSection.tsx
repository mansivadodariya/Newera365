'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="dark:bg-background bg-white px-5 pb-7 pt-9 xl:pb-0 xl:pt-16">
      <div className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-start xl:gap-16">
        {/* Left col: headline + subtitle + CTAs */}
        <div className="flex flex-col gap-[18px] xl:w-[516px] xl:flex-shrink-0 xl:pb-16 xl:pt-4">
          <h1 className="text-foreground font-sans text-[44px] font-semibold leading-[1.1]">
            {t('heroLine1')} <span className="text-accent">{t('heroPremium')}</span>{' '}
            {t('heroLine2')}
          </h1>

          <p className="font-body text-muted max-w-[320px] text-[14.5px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>

          <div className="flex gap-[10px]">
            <Link
              href={`/${locale}/register`}
              className="bg-accent font-body hover:bg-accent-hover flex h-[50px] flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors xl:flex-none xl:px-[22px]"
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
              className="text-foreground font-body flex h-[50px] flex-1 items-center justify-center text-[15px] font-medium transition-opacity hover:opacity-70 xl:flex-none xl:px-[22px]"
            >
              {t('heroCTADemo')}
            </Link>
          </div>
        </div>

        {/* Right col / bottom on mobile: chart card */}
        <div className="overflow-hidden rounded-[24px] xl:min-w-0 xl:flex-1 xl:bg-[#0E1116]">
          {/* Trading screen photo */}
          <div className="relative w-full" style={{ aspectRatio: '620/342' }}>
            <Image
              src="/images/hero-chart.png"
              alt="Live trading screen"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Specs row */}
          <div className="grid grid-cols-3 bg-transparent pb-[12px] pt-[12px] xl:border-white/10">
            {[
              { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
              { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
              { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
            ].map((spec) => (
              <div key={spec.label} className="flex flex-col items-center gap-[2px]">
                <span className="text-foreground font-mono text-[9px] font-normal uppercase leading-[100%] tracking-[0.15em]">
                  {spec.label}
                </span>
                <span className="text-foreground font-sans text-[14px] font-semibold">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
