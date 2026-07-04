'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';

/**
 * Demo restyle of CtaBanner — richer brand-green gradient + glow, larger
 * heading, centred composition with the same CTAs / AuthModal wiring.
 */
export function CtaBannerDemo() {
  const t = useTranslations('home');
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c3b24] via-[#050b08] to-black">
        {/* Accent glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,176,80,0.3),transparent_65%)] blur-2xl"
        />
        <div className="relative flex flex-col items-center gap-7 px-7 py-16 text-center xl:py-20">
          <div className="max-w-[640px]">
            <h2 className="mb-4 font-sans text-[32px] font-semibold leading-[1.05] tracking-[-0.9px] text-white xl:text-[46px]">
              {t('ctaBannerTitle')}
            </h2>
            <p className="font-body mx-auto max-w-[460px] text-[15px] font-normal leading-[1.55] text-white/65">
              {t('ctaBannerSubtitle')}
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => setAuthModal('register')}
              className="bg-accent hover:bg-accent-hover focus-visible:ring-accent flex h-[52px] w-full items-center justify-center rounded-full px-8 text-[15px] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(0,176,80,0.9)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              {t('ctaBannerLive')}
            </button>
            <button
              onClick={() => setAuthModal('demo')}
              className="font-body focus-visible:ring-accent flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 px-8 text-[15px] font-medium text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 sm:w-auto"
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
