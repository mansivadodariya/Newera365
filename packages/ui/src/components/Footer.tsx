'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export interface CmsFooterColumn {
  heading?: string | null;
  links?: { label?: string | null; href?: string | null; id?: string | null }[] | null;
  id?: string | null;
}

export interface CmsSocialLinks {
  facebook?: string | null;
  x?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  telegram?: string | null;
  tiktok?: string | null;
}

function Footer({
  footerColumns,
  riskDisclaimer,
  socialLinks,
}: {
  footerColumns?: CmsFooterColumn[];
  riskDisclaimer?: string | null;
  socialLinks?: CmsSocialLinks;
}) {
  const locale = useLocale();
  const t = useTranslations('footer');

  const FOOTER_LINKS = [
    {
      heading: t('headingMarkets'),
      items: [
        { label: t('linkForex'), href: '/markets/forex' },
        { label: t('linkIndices'), href: '/markets/indices' },
        { label: t('linkCommodities'), href: '/markets/commodities' },
        { label: t('linkStocks'), href: '/markets/stocks' },
        { label: t('linkEtfs'), href: '/markets/etfs' },
        { label: t('linkCrypto'), href: '/markets/crypto' },
      ],
    },
    {
      heading: t('headingPlatform'),
      items: [
        { label: t('linkMT5'), href: '/platform/mt5' },
        { label: t('linkWebTrader'), href: '/platform/webtrader' },
        { label: t('linkMobileApp'), href: '/platform/mobile' },
        { label: t('linkTools'), href: '/tools' },
      ],
    },
    {
      heading: t('headingCompany'),
      items: [
        { label: t('linkAbout'), href: '/company/about' },
        { label: t('linkCareers'), href: '/company/careers' },
        { label: t('linkAwards'), href: '/company/awards' },
        { label: t('linkMedia'), href: '/company/media' },
      ],
    },
    {
      heading: t('headingSupport'),
      items: [
        { label: t('linkContact'), href: '/contact' },
        { label: t('linkFaqs'), href: '/faqs' },
        { label: t('linkLiveChat'), href: '/live-chat' },
        { label: t('linkLegal'), href: '/legal' },
      ],
    },
  ];

  const columns =
    footerColumns && footerColumns.length > 0
      ? footerColumns.map((col) => ({
          heading: col.heading ?? '',
          items: (col.links ?? []).map((l) => ({ label: l.label ?? '', href: l.href ?? '' })),
        }))
      : FOOTER_LINKS;

  return (
    <footer className="bg-black px-5 pb-14 pt-12 text-white xl:px-[120px] xl:py-[64px]">
      <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
        {/* Logo */}
        <Image
          src="/images/logo-dark.png"
          alt="NewEra365"
          width={133}
          height={26}
          className="mb-[18px]"
        />

        {/* Tagline */}
        <p className="font-body mb-8 max-w-[280px] text-[13px] leading-[155%] text-[rgba(255,255,255,0.55)]">
          {t('tagline')}
        </p>

        {/* Social icons — conditional on CMS data */}
        {socialLinks && Object.values(socialLinks).some(Boolean) && (
          <div className="mb-8 flex items-center gap-3">
            {[
              {
                key: 'facebook',
                href: socialLinks.facebook,
                icon: (
                  <path
                    d="M14 2H10C8.34 2 7 3.34 7 5v3H5v3h2v7h3v-7h2.5l.5-3H10V5a1 1 0 011-1h3V2z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ),
              },
              {
                key: 'x',
                href: socialLinks.x,
                icon: (
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ),
              },
              {
                key: 'linkedin',
                href: socialLinks.linkedin,
                icon: (
                  <>
                    <rect
                      x="2"
                      y="2"
                      width="12"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <path
                      d="M5 7v5M5 5v.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 12V9c0-1.1.9-2 2-2s2 .9 2 2v3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M8 7v5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </>
                ),
              },
              {
                key: 'instagram',
                href: socialLinks.instagram,
                icon: (
                  <>
                    <rect
                      x="2"
                      y="2"
                      width="12"
                      height="12"
                      rx="3.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <circle cx="11.5" cy="4.5" r="0.6" fill="currentColor" />
                  </>
                ),
              },
              {
                key: 'youtube',
                href: socialLinks.youtube,
                icon: (
                  <>
                    <rect
                      x="1.5"
                      y="4"
                      width="13"
                      height="9"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <path d="M6.5 6l4 2.5-4 2.5V6z" fill="currentColor" />
                  </>
                ),
              },
              {
                key: 'telegram',
                href: socialLinks.telegram,
                icon: (
                  <path
                    d="M2 8l12-5-4 12-3-4.5L2 8zm0 0l6.5 1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ),
              },
              {
                key: 'tiktok',
                href: socialLinks.tiktok,
                icon: (
                  <path
                    d="M9 2v8a3 3 0 11-3-3h1V5a6 6 0 004 1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ),
              },
            ]
              .filter((s) => Boolean(s.href))
              .map((s) => (
                <a
                  key={s.key}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.key.charAt(0).toUpperCase() + s.key.slice(1)}
                  className="text-white/40 transition-colors hover:text-white/80"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    {s.icon}
                  </svg>
                </a>
              ))}
          </div>
        )}

        {/* Link grid — 2 cols mobile, 2 cols desktop (2×2 wrap = 4 sections) */}
        <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-8 xl:gap-x-6 xl:gap-y-8">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase leading-[100%] tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-[8px]">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href.startsWith('http') ? item.href : `/${locale}${item.href}`}
                      className="font-body text-[13px] font-normal leading-[100%] text-[rgba(255,255,255,0.85)] transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Thin divider — left-aligned, not full-width */}
        <div className="mb-5 h-px w-full max-w-[342px] bg-[rgba(255,255,255,0.08)]" />

        {/* Risk disclosure — left-aligned, constrained width */}
        <div className="max-w-[342px]">
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
            {t('riskDisclosure')}
          </p>
          <p className="font-body mb-4 text-[11px] font-normal leading-[160%] text-[rgba(255,255,255,0.45)]">
            {riskDisclaimer ?? t('riskWarning')}
          </p>

          {/* Copyright row */}
          <div className="flex items-center justify-between pt-3">
            <span className="font-mono text-[10px] font-medium tracking-[1.5px] text-[rgba(255,255,255,0.35)]">
              {t('copyright')}
            </span>
            <span className="font-mono text-[10px] font-medium tracking-[1.5px] text-[rgba(255,255,255,0.35)]">
              V 4.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
