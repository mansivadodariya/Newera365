'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from '../chrome/AuthModal';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SectionKicker } from '../primitives/SectionKicker';

/* ─── Brand marks ─────────────────────────────────────────────────────────────
   Hand-authored SVG marks (not fetched assets) so the strip is self-contained
   and license-clean: the recognisable payment brands the client listed, drawn
   in their iconic colours. Swap any for an official brand SVG by dropping the
   file in /public/images/payment/brands and pointing the tile at it. Each mark
   fills a 32×24 box and is captioned + aria-labelled for the tile. */

function VisaMark() {
  return (
    <svg
      viewBox="0 9.4 31 11.5"
      className="h-[28px] w-auto fill-[#2557FF] sm:h-[34px] dark:fill-[#4A82FF]"
      role="img"
      aria-label="Visa"
    >
      <path d="M15.854 11.329l-2.003 9.367h-2.424l2.006-9.367zM26.051 17.377l1.275-3.518 0.735 3.518zM28.754 20.696h2.242l-1.956-9.367h-2.069c-0.003-0-0.007-0-0.010-0-0.459 0-0.853 0.281-1.019 0.68l-0.003 0.007-3.635 8.68h2.544l0.506-1.4h3.109zM22.429 17.638c0.010-2.473-3.419-2.609-3.395-3.714 0.008-0.336 0.327-0.694 1.027-0.785 0.13-0.013 0.28-0.021 0.432-0.021 0.711 0 1.385 0.162 1.985 0.452l-0.027-0.012 0.425-1.987c-0.673-0.261-1.452-0.413-2.266-0.416h-0.001c-2.396 0-4.081 1.275-4.096 3.098-0.015 1.348 1.203 2.099 2.122 2.549 0.945 0.459 1.262 0.754 1.257 1.163-0.006 0.63-0.752 0.906-1.45 0.917-0.032 0.001-0.071 0.001-0.109 0.001-0.871 0-1.691-0.219-2.407-0.606l0.027 0.013-0.439 2.052c0.786 0.315 1.697 0.497 2.651 0.497 0.015 0 0.030-0 0.045-0h-0.002c2.546 0 4.211-1.257 4.22-3.204zM12.391 11.329l-3.926 9.367h-2.562l-1.932-7.477c-0.037-0.364-0.26-0.668-0.57-0.82l-0.006-0.003c-0.688-0.338-1.488-0.613-2.325-0.786l-0.066-0.011 0.058-0.271h4.124c0 0 0.001 0 0.001 0 0.562 0 1.028 0.411 1.115 0.948l0.001 0.006 1.021 5.421 2.522-6.376z" />
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg
      viewBox="0 0 40 24"
      className="h-[36px] w-auto sm:h-[42px]"
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="15" cy="12" r="9" fill="#FF3B30" />
      <circle cx="25" cy="12" r="9" fill="#FFCC00" />
      <path d="M20 4.8a9 9 0 0 1 0 14.4 9 9 0 0 1 0-14.4Z" fill="#FF9500" />
    </svg>
  );
}

function BitcoinMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[38px] w-auto sm:h-[44px]"
      role="img"
      aria-label="Bitcoin"
    >
      <circle cx="12" cy="12" r="11" fill="#FF9900" />
      <g fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <path d="M10 6.5v11M13 5.5v1.6M13 16.9v1.6M11 5.5v1.6M11 16.9v1.6" />
      </g>
      <path
        d="M9 7.2h4.4a2.4 2.4 0 0 1 0 4.8H9m0 0h4.9a2.4 2.4 0 0 1 0 4.8H9V7.2Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BankMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[32px] w-auto sm:h-[38px]"
      role="img"
      aria-label="Bank transfer"
    >
      <g className="fill-[#111c24] dark:fill-white">
        <path d="M12 3L2 8v2h20V8L12 3zm0 2.5l6.5 3.25H5.5L12 5.5zM4 11h2v7H4v-7zm5 0h2v7H9v-7zm5 0h2v7h-2v-7zm5 0h2v7h-2v-7zM2 19h20v2H2v-2z" />
      </g>
    </svg>
  );
}

function WalletMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[34px] w-auto sm:h-[40px]"
      role="img"
      aria-label="Wallets"
    >
      <g className="stroke-[#111c24] dark:stroke-white" strokeWidth="1.5" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 9.5h13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3" />
        <circle cx="16.5" cy="13" r="1" className="fill-[#111c24] dark:fill-white" stroke="none" />
      </g>
    </svg>
  );
}

const BRANDS = [
  { key: 'payVisa', mark: <VisaMark /> },
  { key: 'payMastercard', mark: <MastercardMark /> },
  { key: 'payCrypto', mark: <BitcoinMark /> },
  { key: 'payWallets', mark: <WalletMark /> },
] as const;

const PROMISES = [
  {
    key: 'payPromise1',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    key: 'payPromise2',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    key: 'payPromise3',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
] as const;

export function FundingStripSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  const isAr = locale === 'ar';

  return (
    <section className="bg-transparent px-5 py-8 xl:px-[80px] xl:py-12">
      <div className="mx-auto max-w-[390px] md:max-w-3xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-3">{t('payKicker')}</SectionKicker>
          <div className="mb-8 xl:flex xl:items-end xl:justify-between xl:gap-10">
            <h2 className="text-headline text-foreground font-sans [text-wrap:balance]">
              {t('payHeadingLine1')} <span>{t('payHeadingAccent')}</span>
            </h2>
            <p className="font-body text-body text-foreground/85 mt-3 max-w-[45ch] xl:mt-0 dark:text-white/85">
              {t('paySubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="border-border shadow-card mt-8 overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.06] dark:bg-[#14161c] dark:shadow-none">
            {/* Promises — the trust boosters, static (no hover on info). */}
            <div className="grid gap-px bg-[rgba(17,17,17,0.07)] sm:grid-cols-3 dark:bg-white/[0.06]">
              {PROMISES.map((item) => (
                <div
                  key={item.key}
                  className="hover:bg-accent/[0.05] dark:hover:bg-accent/[0.06] group flex items-center gap-4 bg-white px-7 py-6 transition-colors duration-300 sm:py-7 dark:bg-[#14161c]"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#d2f3e2] text-[#00b050] transition-all duration-300 group-hover:bg-[#00b050] group-hover:text-white motion-safe:group-hover:scale-110 dark:bg-[#00b050]/20 dark:text-[#1ad966]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-foreground font-sans text-lg font-bold sm:text-xl">
                      {t(item.key)}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row: Accepted Methods (Left) & See All + Deposit CTA (Right) */}
            <div className="border-t border-[rgba(17,17,17,0.07)] p-6 sm:p-7 dark:border-white/[0.08]">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-stretch">
                {/* Accepted Methods Column */}
                <div className="flex flex-col justify-between xl:col-span-8">
                  {/* Header with Card Icon & Line */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#d2f3e2] text-[#00b050] dark:bg-[#00b050]/20 dark:text-[#1ad966]">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <h3 className="text-muted font-mono text-[12px] uppercase tracking-[1.8px] sm:text-[13px] dark:text-white">
                      {t('payAcceptLabel')}
                    </h3>
                    <div className="flex-1 border-b border-slate-200/80 dark:border-white/10" />
                  </div>

                  {/* 4 Accepted Payment Method Cards mapped from BRANDS with elevation hover */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    {BRANDS.map((brand) => (
                      <div
                        key={brand.key}
                        className="group flex h-[68px] cursor-pointer items-center justify-center rounded-[16px] border border-slate-200/70 bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#00b050] hover:shadow-[0_12px_28px_-8px_rgba(0,176,80,0.35)] motion-safe:hover:-translate-y-1 sm:h-[76px] dark:border-white/10 dark:bg-[#181a22] dark:hover:border-[#00b050]"
                        title={t(brand.key)}
                      >
                        <div className="transition-transform duration-300 motion-safe:group-hover:scale-[1.06]">
                          {brand.mark}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right CTA Box */}
                <div className="group/cta flex flex-col justify-between gap-5 rounded-[22px] border border-[#e1f5eb] bg-[#f0faf5] p-5 transition-all duration-300 hover:border-[#00b050]/40 xl:col-span-4 dark:border-white/5 dark:bg-[#14261d]/80">
                  {/* See all payment methods Link */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#d2f3e2] text-[#00b050] transition-all duration-300 group-hover/cta:bg-[#00b050] group-hover/cta:text-white dark:bg-[#00b050]/20 dark:text-[#1ad966]">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
                      </svg>
                    </div>
                    <Link
                      href={`/${locale}/trade/funding`}
                      className="group/link flex items-center gap-1.5 font-sans text-[15px] font-bold text-[#111c24] transition-colors hover:text-[#00b050] dark:text-white"
                    >
                      <span>{t('payCta')}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover/link:translate-x-1.5 rtl:-scale-x-100"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* Deposit Now CTA Button */}
                  <button
                    onClick={() => setAuthModal('register')}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#00b050] px-6 py-3.5 font-sans text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(0,176,80,0.6)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#009644] hover:shadow-[0_14px_32px_-6px_rgba(0,176,80,0.85)] focus:outline-none"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>{t('depositNow')}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </section>
  );
}
