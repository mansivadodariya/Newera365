'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function CtaBanner() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="overflow-hidden rounded-t-[32px] bg-black px-5 xl:px-[120px]">
      <div className="mx-auto max-w-[390px] pb-11 pt-11 text-center md:max-w-2xl xl:flex xl:max-w-[1200px] xl:flex-row xl:items-center xl:justify-between xl:py-14 xl:text-left">
        <div className="xl:max-w-[560px]">
          <h2 className="mb-4 text-center font-sans text-[36px] font-semibold leading-[105%] tracking-[-0.025em] text-white xl:text-left xl:text-[44px]">
            {t('ctaBannerTitle')}
          </h2>
          <p className="font-body mb-10 text-center text-[14px] font-medium leading-[155%] tracking-[0] text-white/60 xl:mb-0 xl:text-left">
            {t('ctaBannerSubtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-[14px] xl:flex-shrink-0 xl:flex-row xl:items-center xl:gap-4">
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[50px] items-center justify-center rounded-full px-8 text-[15px] font-semibold text-white transition-colors"
          >
            {t('ctaBannerLive')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="font-body flex h-[50px] items-center justify-center text-[15px] font-semibold text-white transition-opacity hover:opacity-70"
          >
            {t('ctaBannerDemo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
