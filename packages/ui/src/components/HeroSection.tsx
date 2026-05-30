'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-background rounded-b-[32px] px-5 pb-7 pt-9 xl:pb-0 xl:pt-16">
      <div className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-start xl:gap-16">
        {/* Left col: headline + subtitle + CTAs */}
        <div className="flex flex-col gap-[18px] xl:w-[516px] xl:flex-shrink-0 xl:pb-16 xl:pt-4">
          <h1 className="text-foreground font-sans text-[44px] font-semibold leading-[1.02] tracking-[-1.54px] xl:text-[52px] xl:tracking-[-2px]">
            {t('heroLine1')} <span className="text-accent">{t('heroPremium')}</span>{' '}
            {t('heroLine2')}
          </h1>

          <p className="font-body text-muted max-w-[320px] text-[14.5px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>

          <div className="flex gap-[10px]">
            <Link
              href={`/${locale}/register`}
              className="bg-accent font-body hover:bg-accent-hover flex flex-1 items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium tracking-[-0.075px] text-white transition-colors xl:flex-none"
            >
              {t('heroCTALive')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href={`/${locale}/demo-account`}
              className="text-foreground font-body flex flex-1 items-center justify-center px-[22px] py-4 text-[15px] font-medium tracking-[-0.075px] transition-opacity hover:opacity-70 xl:flex-none"
            >
              {t('heroCTADemo')}
            </Link>
          </div>
        </div>

        {/* Right col / bottom on mobile: chart card */}
        <div className="overflow-hidden rounded-[24px] bg-gradient-to-b from-[#fafaf9] to-[#f4f4f3] dark:from-[#1c1c1c] dark:to-[#181818] xl:min-w-0 xl:flex-1">
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

          {/* Specs row — white bg, grey labels, dark values */}
          <div className="bg-background grid grid-cols-3 divide-x divide-border py-3">
            {[
              { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
              { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
              { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
            ].map((spec) => (
              <div key={spec.label} className="flex flex-col items-start gap-[2px] px-[14px] py-[6px]">
                <span className="font-mono text-[9px] font-normal uppercase leading-none tracking-[1.35px] text-muted">
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
