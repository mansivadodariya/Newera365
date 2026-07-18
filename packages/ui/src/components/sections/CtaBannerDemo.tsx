'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { AuthModal, type AuthModalType } from '../chrome/AuthModal';
import { Spotlight } from '../primitives/Spotlight';

/**
 * Homepage closer — the ink anchor. A cinematic terminal plate sits under the
 * ink-band grid for real depth (no flat gradient), keeping the same two
 * AuthModal CTAs. Masked so the headline stays crisp over the image.
 */
export function CtaBannerDemo() {
  const t = useTranslations('home');
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  return (
    <>
      <section className="ink-band relative overflow-hidden">
        {/* Cinematic terminal plate, alpha-masked so the type zone stays clean */}
        <Image
          src="/images/hero-terminal-macro.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover object-[50%_35%] opacity-[0.20] [mask-image:radial-gradient(120%_130%_at_50%_-10%,#000_18%,transparent_72%)]"
        />
        {/* Soft brand-green glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/3 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,176,80,0.26),transparent_65%)] blur-2xl"
        />
        {/* Full-bleed glow layer; the content column nests inside so the
            spotlight never clips at the column edge. */}
        <Spotlight size={520} strength={0.1}>
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-7 px-6 py-16 text-center xl:py-20">
            <span aria-hidden="true" className="bg-accent-bright/80 h-[3px] w-9 rounded-full" />
            <div className="max-w-[640px]">
              <h2 className="text-headline mb-4 font-sans text-white">{t('ctaBannerTitle')}</h2>
              <p className="font-body text-lead mx-auto max-w-[500px] font-normal text-white/70">
                {t('ctaBannerSubtitle')}
              </p>
            </div>

            {/* Same presentation at every width: the two pills sit side by side
              (wrapping only if a locale's labels genuinely can't fit). */}
            <div className="flex w-full flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setAuthModal('register')}
                className="bg-accent hover:bg-accent-hover focus-visible:ring-accent flex h-[48px] items-center justify-center rounded-full px-6 text-[15px] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(0,176,80,0.9)] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] sm:h-[52px] sm:px-8"
              >
                {t('ctaBannerLive')}
              </button>
              <button
                onClick={() => setAuthModal('demo')}
                className="font-body focus-visible:ring-accent hover:border-accent-bright/60 flex h-[48px] items-center justify-center rounded-full border border-white/20 px-6 text-[15px] font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] sm:h-[52px] sm:px-8"
              >
                {t('ctaBannerDemo')}
              </button>
            </div>
          </div>
        </Spotlight>
      </section>

      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
