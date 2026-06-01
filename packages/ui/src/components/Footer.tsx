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
        { label: t('linkAwards'), href: '/company/about' },
        { label: t('linkMedia'), href: '/education/media' },
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
    <footer className="bg-black px-5 pb-[56px] pt-[48px] text-white xl:pb-16 xl:pt-16">
      <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
        {/* Top row: logo + tagline (mobile stacked, desktop inline) */}
        <div className="xl:mb-12 xl:flex xl:items-start xl:justify-between">
          <div className="xl:max-w-[280px]">
            <Image
              src="/images/logo-dark.png"
              alt="NewEra365"
              width={133}
              height={26}
              className="mb-4"
            />
            <p className="font-body text-[13px] leading-[155%] tracking-[0] text-[#FFFFFF8C]">
              {t('tagline')}
            </p>
          </div>

          {/* Link grid — 2 cols mobile, 4 cols desktop */}
          <div className="mb-8 mt-8 grid grid-cols-2 gap-x-4 gap-y-6 xl:mb-0 xl:mt-0 xl:grid-cols-4 xl:gap-x-6">
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
        </div>

        {/* Risk disclosure */}
        <div className="border-t border-white/10 pt-[20px]">
          <div className="mb-1 font-mono text-[10px] font-medium uppercase leading-[100%] tracking-[0.15em] text-[#FFFFFF66]">
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
