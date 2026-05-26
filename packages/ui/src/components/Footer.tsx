'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

function Footer() {
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

  return (
    <footer className="bg-black px-5 pb-8 pt-10 text-white">
      <div className="mx-auto max-w-[350px]">
        {/* Logo */}
        <Image
          src="/images/logo-dark.png"
          alt="NewEra365"
          width={133}
          height={26}
          className="mb-4"
        />

        {/* Tagline */}
        <p
          className="font-body mb-8 text-[13px] leading-[155%] tracking-[0] text-[#FFFFFF8C]"
          style={{ maxWidth: 280 }}
        >
          {t('tagline')}
        </p>

        {/* Link grid — 2 columns */}
        <div className="mb-8 grid grid-cols-2 gap-[24px] gap-x-4 gap-y-6">
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase leading-[100%] tracking-[0.15em] text-[#FFFFFF66]">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-[8px]">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className="font-body text-[13px] font-normal leading-[100%] tracking-[0] text-[#FFFFFFD9] transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Risk disclosure */}
        <div className="gap-[14px] border-t border-white/10 pt-[20px]">
          <div className="mb-1 font-mono text-[10px] font-normal uppercase leading-[100%] tracking-[0.15em] text-[#FFFFFF66]">
            {t('riskDisclosure')}
          </div>
          <div className="font-body mb-6 pt-[14px] text-[11px] font-normal leading-[160%] tracking-[0] text-[#FFFFFF73]">
            {t('riskWarning')}
          </div>

          {/* Copyright */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-normal leading-[100%] tracking-[0.15em] text-[#FFFFFF59]">
              {t('copyright')}
            </span>
            <span className="font-mono text-[10px] leading-[100%] tracking-[0.15em] text-[#FFFFFF59]">
              V 4.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
