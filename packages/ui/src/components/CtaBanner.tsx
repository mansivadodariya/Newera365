'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';

export function CtaBanner() {
  const t = useTranslations('home');
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  return (
    <>
      <section className="overflow-hidden bg-gradient-to-l from-[#1f262e] to-black">
        <div className="flex flex-col items-center gap-[29px] px-[28px] py-[54px] text-center xl:gap-[29px] xl:px-[28px] xl:py-[54px] xl:text-left">
          <div className="xl:gap-[29px]">
            <h2 className="mb-4 font-sans text-[32px] font-semibold leading-[1.05] tracking-[-0.9px] text-white xl:text-left xl:text-[44px]">
              {t('ctaBannerTitle')}
            </h2>
            <p className="font-body text-center text-[14px] font-normal leading-[1.55] text-white/60 xl:mb-0">
              {t('ctaBannerSubtitle')}
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-[29px] xl:w-auto xl:flex-shrink-0 xl:gap-[29px]">
            <button
              onClick={() => setAuthModal('register')}
              className="bg-accent hover:bg-accent/90 flex h-[49px] w-[250px] items-center justify-center rounded-[10px] border border-white/30 px-[22px] text-[15px] font-semibold text-white transition-colors xl:w-auto xl:px-8"
            >
              {t('ctaBannerLive')}
            </button>
            <button
              onClick={() => setAuthModal('demo')}
              className="text-accent font-body text-[12px] font-bold uppercase tracking-[0.6px] transition-opacity hover:opacity-70"
            >
              {t('ctaBannerDemo')}
            </button>
          </div>
        </div>
      </section>

      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
