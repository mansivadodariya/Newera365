'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const MARKETS = [
  {
    key: 'forex',
    bg: '/images/market-forex.jpg',
    nameKey: 'marketsForex',
    countKey: 'marketsForexCount',
  },
  {
    key: 'indices',
    bg: '/images/market-indices.jpg',
    nameKey: 'marketsIndices',
    countKey: 'marketsIndicesCount',
  },
  {
    key: 'commodities',
    bg: '/images/market-commodities.jpg',
    nameKey: 'marketsCommodities',
    countKey: 'marketsCommoditiesCount',
  },
  {
    key: 'stocks',
    bg: '/images/market-stocks.jpg',
    nameKey: 'marketsStocks',
    countKey: 'marketsStocksCount',
  },
  {
    key: 'crypto',
    bg: '/images/market-crypto.jpg',
    nameKey: 'marketsCrypto',
    countKey: 'marketsCryptoCount',
  },
  {
    key: 'etfs',
    bg: '/images/market-etfs.jpg',
    nameKey: 'marketsETFs',
    countKey: 'marketsETFsCount',
  },
] as const;

export function MarketsSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="rounded-l-[32px] bg-gradient-to-r from-[#E2E2E2] to-white px-5 pb-9 pt-10 xl:pb-16 xl:pt-10 dark:from-[#1F262E] dark:to-[#000000]">
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
        <div className="mb-[14px] grid grid-cols-2 gap-[10px] xl:grid-cols-6">
          {MARKETS.map((market) => (
            <div
              key={market.key}
              className="relative flex h-[110px] flex-col justify-end overflow-hidden rounded-[18px] px-4 py-[18px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
            >
              {/* Dark base */}
              <div className="absolute inset-0 bg-[#111]" />
              {/* Background photo at 40% opacity */}
              <Image
                src={market.bg}
                alt=""
                fill
                sizes="(min-width: 1280px) 180px, 50vw"
                className="pointer-events-none object-cover opacity-40"
                aria-hidden="true"
              />
              {/* Content — no icon per Figma; label + count anchored to the bottom */}
              <div className="relative z-10">
                <p className="font-sans text-[16px] font-medium text-white">{t(market.nameKey)}</p>
                <p className="font-body mt-[2px] text-[11px] text-[#FFFFFFCC] dark:text-[#FFFFFF]">
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
