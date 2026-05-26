'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="dark:bg-background bg-white px-5 pb-7 pt-9">
      <div className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl lg:max-w-5xl">
        {/* H1 */}
        <h1 className="text-foreground font-sans text-[44px] font-semibold leading-[1.1]">
          {t('heroLine1')} <span className="text-accent">{t('heroPremium')}</span> {t('heroLine2')}
        </h1>

        {/* Subtitle */}
        <p className="font-body text-muted max-w-[320px] text-[14.5px] leading-[1.55]">
          {t('heroSubtitle')}
        </p>

        {/* CTA row */}
        <div className="flex gap-[10px]">
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[50px] flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors"
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
            className="text-foreground font-body flex h-[50px] flex-1 items-center justify-center text-[15px] font-medium transition-opacity hover:opacity-70"
          >
            {t('heroCTADemo')}
          </Link>
        </div>

        {/* Chart card */}
        <div className="dark:bg-background overflow-hidden rounded-[24px] bg-white">
          {/* Trading screen photo */}
          <div className="relative w-full" style={{ aspectRatio: '700/354' }}>
            <Image
              src="/images/hero-chart.png"
              alt="Live trading screen"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Specs row */}
          <div className="dark:border-background dark:bg-background grid grid-cols-3 border-t border-[#e5e7eb] bg-white pb-[12px] pt-[12px]">
            {[
              { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
              { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
              { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
            ].map((spec, i) => (
              <div key={spec.label} className={`flex flex-col items-center gap-[2px]`}>
                <span className="text-muted font-mono text-[9px] font-normal uppercase leading-[100%] tracking-[0.15em]">
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
