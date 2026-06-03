'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function CtaBanner() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="overflow-hidden rounded-t-[32px] bg-gradient-to-l from-[#1f262e] to-black">
      <div className="flex flex-col items-center px-5 pb-11 pt-11 text-center xl:flex-row xl:justify-between xl:px-16 xl:py-14 xl:text-left">
        <div className="xl:max-w-[560px]">
          <h2 className="mb-4 font-sans text-[36px] font-semibold leading-[1.05] tracking-[-0.9px] text-white xl:text-left xl:text-[44px]">
            {t('ctaBannerTitle')}
          </h2>
          <p className="font-body mb-8 text-[14px] font-normal leading-[1.55] text-white/60 xl:mb-0 xl:text-left">
            {t('ctaBannerSubtitle')}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4 xl:w-auto xl:flex-shrink-0 xl:flex-row xl:gap-4">
          <div className="h-[8px] xl:hidden" />
          {/* Primary: Start Trading now — Figma style: rounded-[10px] with border */}
          <Link
            href={`/${locale}/register`}
            className="bg-accent hover:bg-accent/90 flex h-[49px] w-[250px] items-center justify-center rounded-[10px] border border-white/30 px-[22px] text-[15px] font-semibold text-white transition-colors xl:w-auto xl:px-8"
          >
            {t('ctaBannerLive')}
          </Link>
          {/* Secondary: Try a free demo — uppercase green text */}
          <Link
            href={`/${locale}/demo-account`}
            className="text-accent font-body text-[12px] font-bold uppercase tracking-[0.6px] transition-opacity hover:opacity-70"
          >
            {t('ctaBannerDemo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
