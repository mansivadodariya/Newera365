'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function CtaBanner() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="overflow-hidden rounded-t-[32px] bg-black">
      <div className="flex flex-col items-center justify-center px-5 pb-11 pt-11 text-center xl:flex-row xl:justify-between xl:px-16 xl:py-14 xl:text-left">
        <div className="xl:max-w-[560px]">
          <h2 className="mb-4 font-sans text-[36px] font-semibold leading-[1.05] tracking-[-0.9px] text-white xl:text-left xl:text-[44px]">
            {t('ctaBannerTitle')}
          </h2>
          <p className="font-body mb-10 text-[14px] font-normal leading-[1.55] text-white/60 xl:mb-0 xl:text-left">
            {t('ctaBannerSubtitle')}
          </p>
        </div>

        <div className="flex w-full flex-col gap-[14px] xl:w-auto xl:flex-shrink-0 xl:flex-row xl:items-center xl:gap-4">
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex items-center justify-center rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors xl:px-8"
          >
            {t('ctaBannerLive')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="font-body flex items-center justify-center py-4 text-[15px] font-medium text-white transition-opacity hover:opacity-70"
          >
            {t('ctaBannerDemo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
