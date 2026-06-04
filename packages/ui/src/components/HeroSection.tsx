'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-transparent px-5 pb-7 pt-9 xl:pb-0 xl:pt-16">
      <div className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-start xl:gap-16">
        {/* Left col: headline + subtitle + CTAs */}
        <div className="flex flex-col gap-[18px] xl:w-[516px] xl:flex-shrink-0 xl:pb-16 xl:pt-4">
          <h1 className="text-foreground font-sans text-[44px] font-semibold leading-[1.02] tracking-[-1.54px] xl:text-[52px] xl:tracking-[-2px]">
            {t('heroLine1')}{' '}
            <span className="dark:text-accent text-[#0d7a3e]">{t('heroPremium')}</span>{' '}
            {t('heroLine2')}
          </h1>

          <p className="font-body text-muted max-w-[320px] text-[14.5px] leading-[155%]">
            {t('heroSubtitle')}
          </p>

          <div className="flex items-center gap-[10px]">
            <Link
              href={`/${locale}/register`}
              className="font-body bg-accent hover:bg-accent/90 dark:bg-accent dark:hover:bg-accent/90 inline-flex flex-none items-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium tracking-[-0.075px] text-[#111] transition-colors dark:text-white"
            >
              {t('heroCTALive')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href={`/${locale}/demo-account`}
              className="font-body dark:text-foreground inline-flex flex-none items-center px-[22px] py-4 text-[15px] font-medium tracking-[-0.075px] text-[#111] transition-opacity hover:opacity-70"
            >
              {t('heroCTADemo')}
            </Link>
          </div>
        </div>

        {/* Right col / bottom on mobile: chart card */}
        <div className="xl: overflow-hidden rounded-[24px] bg-[#111] xl:min-w-0 xl:flex-1 dark:bg-gradient-to-b dark:from-[#07090d] dark:to-[#0d1117]">
          <div className="relative w-full" style={{ aspectRatio: '350/250' }}>
            <Image
              src="/images/hero-chart.png"
              alt="Trading chart"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Specs row — white bg, grey mono labels, dark values */}
          <div className="bg-background grid grid-cols-3">
            {[
              { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
              { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
              { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
            ].map((spec) => (
              <div
                key={spec.label}
                className="flex flex-col items-start gap-[2px] px-[14px] py-[6px]"
              >
                <span className="font-mono text-[9px] font-normal uppercase leading-none tracking-[1.35px] text-[#6b7280]">
                  {spec.label}
                </span>
                <span className="font-sans text-[14px] font-semibold text-[#111] dark:text-white">
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
