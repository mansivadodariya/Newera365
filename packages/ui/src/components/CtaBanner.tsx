'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function CtaBanner() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="overflow-hidden rounded-t-[32px] bg-black">
      <div className="px-5 pb-11 pt-11 text-center">
        <h2 className="mb-4 text-center font-sans text-[36px] font-semibold leading-[105%] tracking-[-0.025em] text-white">
          {t('ctaBannerTitle')}
        </h2>
        <p className="font-body mb-10 text-center text-[14px] font-medium leading-[155%] tracking-[0] text-white/60">
          {t('ctaBannerSubtitle')}
        </p>

        <div className="flex flex-col gap-[14px]">
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[50px] items-center justify-center rounded-full text-[15px] font-semibold text-white transition-colors"
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
