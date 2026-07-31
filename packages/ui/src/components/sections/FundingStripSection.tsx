'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SectionKicker } from '../primitives/SectionKicker';

/* ─── Brand marks ─────────────────────────────────────────────────────────────
   Hand-authored SVG marks (not fetched assets) so the strip is self-contained
   and license-clean: the recognisable payment brands the client listed, drawn
   in their iconic colours. Swap any for an official brand SVG by dropping the
   file in /public/images/payment/brands and pointing the tile at it. Each mark
   fills a 32×24 box and is captioned + aria-labelled for the tile. */

function VisaMark() {
  // Wordmark — Visa's brand IS the wordmark. Blue in light, near-white on ink.
  return (
    <svg
      viewBox="0 0 48 24"
      className="h-[32px] w-auto sm:h-[36px] xl:h-[42px]"
      role="img"
      aria-label="Visa"
    >
      <text
        x="24"
        y="18"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="19"
        letterSpacing="0.5"
        className="fill-[#1434CB] dark:fill-white"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  // Two interlocking circles + the lens overlap — the standalone-recognisable part.
  return (
    <svg
      viewBox="0 0 40 24"
      className="h-[36px] w-auto sm:h-[40px] xl:h-[48px]"
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="15" cy="12" r="9" fill="#EB001B" />
      <circle cx="25" cy="12" r="9" fill="#F79E1B" />
      <path d="M20 4.8a9 9 0 0 1 0 14.4 9 9 0 0 1 0-14.4Z" fill="#FF5F00" />
    </svg>
  );
}

function BankMark() {
  // Regional bank transfer — a columned building. Monochrome ink glyph.
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[36px] w-auto sm:h-[40px] xl:h-[48px]"
      role="img"
      aria-label="Bank transfer"
    >
      <g className="stroke-[#1a2a20] dark:stroke-white/85" strokeWidth="1.5" fill="none">
        <path d="M12 3 3 7.5h18L12 3Z" strokeLinejoin="round" />
        <path d="M4 21h16" strokeLinecap="round" />
        <path d="M5 10.5v8M9.3 10.5v8M14.7 10.5v8M19 10.5v8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function BitcoinMark() {
  // Crypto — orange coin with a white B and the ₿ stems.
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[36px] w-auto sm:h-[40px] xl:h-[48px]"
      role="img"
      aria-label="Crypto"
    >
      <circle cx="12" cy="12" r="11" fill="#F7931A" />
      <g fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
        <path d="M10 6.5v11M13 5.5v1.6M13 16.9v1.6M11 5.5v1.6M11 16.9v1.6" />
      </g>
      <path
        d="M9 7.2h4.4a2.4 2.4 0 0 1 0 4.8H9m0 0h4.9a2.4 2.4 0 0 1 0 4.8H9V7.2Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TetherMark() {
  // USDT — green coin with the ₮ (T + crossbar).
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[36px] w-auto sm:h-[40px] xl:h-[48px]"
      role="img"
      aria-label="USDT"
    >
      <circle cx="12" cy="12" r="11" fill="#26A17B" />
      <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
        <path d="M6.5 8.2h11" />
        <path d="M12 8.2v9.3" />
        <path d="M8 11.6c0 1.1 1.8 2 4 2s4-.9 4-2-1.8-2-4-2-4 .9-4 2Z" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function WalletMark() {
  // E-wallets — a wallet with a snap button. Monochrome ink glyph.
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[34px] w-auto sm:h-[38px] xl:h-[46px]"
      role="img"
      aria-label="Wallets"
    >
      <g className="stroke-[#1a2a20] dark:stroke-white/85" strokeWidth="1.5" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 9.5h13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3" />
        <circle
          cx="16.5"
          cy="13"
          r="1"
          className="fill-[#1a2a20] dark:fill-white/85"
          stroke="none"
        />
      </g>
    </svg>
  );
}

function CheckPromise() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="text-accent transition-colors duration-300 group-hover:text-white"
    >
      <path
        d="M3 8.2l3.2 3.2L13 4.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The curated trust set matching the client's brief (#10): Visa · Mastercard ·
// Bank transfer · Crypto · USDT · Wallets. Captions are localized; Latin brand
// names (Visa/Mastercard/USDT) stay as-is in both locales.
const BRANDS = [
  { key: 'payVisa', mark: <VisaMark /> },
  { key: 'payMastercard', mark: <MastercardMark /> },
  { key: 'payBank', mark: <BankMark /> },
  { key: 'payCrypto', mark: <BitcoinMark /> },
  { key: 'payUsdt', mark: <TetherMark /> },
  { key: 'payWallets', mark: <WalletMark /> },
] as const;

const PROMISES = ['payPromise1', 'payPromise2', 'payPromise3'] as const;

export function FundingStripSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-transparent px-5 py-10 xl:px-[80px] xl:py-14">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-3">{t('payKicker')}</SectionKicker>
          <div className="xl:flex xl:items-end xl:justify-between xl:gap-10">
            <h2 className="text-headline text-foreground font-sans [text-wrap:balance]">
              {t('payHeadingLine1')} <span>{t('payHeadingAccent')}</span>
            </h2>
            <p className="font-body text-body text-muted mt-3 max-w-[45ch] xl:mt-0 dark:text-white/60">
              {t('paySubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="border-border shadow-card mt-8 overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.06] dark:bg-[#14161c] dark:shadow-none">
            {/* Promises — the trust boosters, static (no hover on info). */}
            <div className="grid gap-px bg-[rgba(17,17,17,0.07)] sm:grid-cols-3 dark:bg-white/[0.06]">
              {PROMISES.map((key) => (
                <div
                  key={key}
                  className="hover:bg-accent/[0.05] dark:hover:bg-accent/[0.06] group flex items-center gap-4 bg-white px-7 py-6 transition-colors duration-300 sm:py-7 dark:bg-[#14161c]"
                >
                  {/* Check tile inverts to solid signal on hover */}
                  <span className="bg-accent/[0.1] group-hover:bg-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300">
                    <CheckPromise />
                  </span>
                  <span className="text-foreground font-sans text-lg font-bold sm:text-xl">
                    {t(key)}
                  </span>
                </div>
              ))}
            </div>

            {/* Accepted methods — recognisable brand marks on paper tiles. */}
            <div className="flex flex-col gap-6 border-t border-[rgba(17,17,17,0.07)] px-7 py-7 xl:flex-row xl:items-center xl:justify-between dark:border-white/[0.06]">
              <div className="flex flex-col gap-4">
                <span className="text-muted font-mono text-[12px] uppercase tracking-[1.8px] sm:text-[13px] dark:text-white/45">
                  {t('payAcceptLabel')}
                </span>
                <ul className="flex flex-wrap items-center gap-3 xl:gap-4">
                  {BRANDS.map((brand) => (
                    <li
                      key={brand.key}
                      className="border-border hover:border-accent/40 flex h-[58px] min-w-[82px] items-center justify-center rounded-[14px] border bg-white px-5 transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[0_10px_24px_-12px_rgba(0,176,80,0.35)] motion-safe:hover:-translate-y-0.5 sm:h-[66px] sm:min-w-[100px] sm:px-6 xl:h-[76px] xl:min-w-[118px] xl:rounded-[16px] dark:border-white/[0.08] dark:bg-[#1a1c22]"
                      title={t(brand.key)}
                    >
                      {brand.mark}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/${locale}/trade/funding`}
                className="text-accent font-body group inline-flex w-fit items-center gap-2 text-[16px] font-bold xl:text-[18px]"
              >
                {t('payCta')}
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
