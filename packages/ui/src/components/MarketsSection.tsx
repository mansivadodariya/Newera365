'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const MARKETS = [
  {
    key: 'forex',
    bg: '/images/market-forex.jpg',
    icon: '/icons/market-forex-icon.png',
    nameKey: 'marketsForex',
    countKey: 'marketsForexCount',
  },
  {
    key: 'indices',
    bg: '/images/market-indices.jpg',
    icon: '/icons/market-indices-icon.png',
    nameKey: 'marketsIndices',
    countKey: 'marketsIndicesCount',
  },
  {
    key: 'commodities',
    bg: '/images/market-commodities.jpg',
    icon: '/icons/market-commodities-icon.png',
    nameKey: 'marketsCommodities',
    countKey: 'marketsCommoditiesCount',
  },
  {
    key: 'stocks',
    bg: '/images/market-stocks.jpg',
    icon: '/icons/market-stocks-icon.png',
    nameKey: 'marketsStocks',
    countKey: 'marketsStocksCount',
  },
  {
    key: 'crypto',
    bg: '/images/market-crypto.jpg',
    icon: '/icons/market-crypto-icon.png',
    nameKey: 'marketsCrypto',
    countKey: 'marketsCryptoCount',
  },
  {
    key: 'etfs',
    bg: '/images/market-etfs.jpg',
    icon: '/icons/market-etfs-icon.png',
    nameKey: 'marketsETFs',
    countKey: 'marketsETFsCount',
  },
] as const;

export function MarketsSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-background px-5 pb-9 pt-10 xl:pb-16 xl:pt-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-foreground [&>span:first-child]:bg-foreground mb-[14px]">
          {t('marketsKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-3 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] xl:text-[36px]">
          {t('marketsHeading')}
        </h2>
        <p className="font-body text-muted mb-[14px] text-[14px] leading-[1.55]">
          {t('marketsSubheading')}
        </p>

        {/* 2×3 dark card grid — each card has a full-bleed bg image at 40% opacity */}
        <div className="mb-[14px] grid grid-cols-2 gap-[10px] xl:grid-cols-3">
          {MARKETS.map((market) => (
            <div
              key={market.key}
              className="relative flex h-[110px] flex-col justify-between overflow-hidden rounded-[18px] px-4 py-[18px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
            >
              {/* Dark base */}
              <div className="absolute inset-0 bg-[#111]" />
              {/* Background photo at 40% opacity */}
              <Image
                src={market.bg}
                alt=""
                fill
                className="pointer-events-none object-cover opacity-40"
                aria-hidden="true"
              />
              {/* Content */}
              <div className="relative z-10 h-9 w-9 rounded-[10px]">
                <Image
                  src={market.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="ml-[6px] mt-[6px]"
                />
              </div>
              <div className="relative z-10">
                <p className="font-sans text-[16px] font-semibold text-white">
                  {t(market.nameKey)}
                </p>
                <p className="font-body mt-[2px] text-[11px] text-[#8c949e]">
                  {t(market.countKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width dark CTA pill */}
        <Link
          href={`/${locale}/markets/instruments`}
          className="font-body flex h-[46px] w-full items-center justify-between rounded-[16px] bg-[#111] px-4 py-[14px] text-[14px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111]"
        >
          <span>{t('marketsViewAll')}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
