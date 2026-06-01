'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

// Real background photos from Figma desktop design (node 821:140)
const ASSET_BG = {
  forex: '/images/market-forex.jpg',
  indices: '/images/market-indices.jpg',
  commodities: '/images/market-commodities.jpg',
  stocks: '/images/market-stocks.jpg',
  crypto: '/images/market-crypto.jpg',
  etfs: '/images/market-etfs.jpg',
} as const;

export function MarketsSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  const assets = [
    { key: 'forex', name: t('marketsForex'), count: t('marketsForexCount') },
    { key: 'indices', name: t('marketsIndices'), count: t('marketsIndicesCount') },
    { key: 'commodities', name: t('marketsCommodities'), count: t('marketsCommoditiesCount') },
    { key: 'stocks', name: t('marketsStocks'), count: t('marketsStocksCount') },
    { key: 'crypto', name: t('marketsCrypto'), count: t('marketsCryptoCount') },
    { key: 'etfs', name: t('marketsETFs'), count: t('marketsETFsCount') },
  ] as const;

  return (
    <section
      className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-10"
      style={{ background: 'var(--gradient-markets)' }}
    >
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-foreground mb-[14px] [&>span:first-child]:dark:bg-white dark:[&>span:last-child]:text-white">
          {t('marketsKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-3 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] xl:text-[36px]">
          {t('marketsHeading')}
        </h2>
        <p className="font-body text-muted mb-[14px] text-[14px] leading-[1.55]">
          {t('marketsSubheading')}
        </p>

        {/* 2×3 asset class grid — 3 cols on desktop */}
        <div className="mb-[14px] grid grid-cols-2 gap-[10px] xl:grid-cols-3">
          {assets.map((asset) => (
            <div
              key={asset.key}
              className="flex flex-col gap-[14px] rounded-[18px] bg-[rgba(224,224,224,0.38)] px-4 py-[18px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] dark:bg-[rgba(17,17,17,0.38)] dark:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(239,239,239,0)] dark:bg-[rgba(17,17,17,0)]">
                <Image
                  src={ASSET_BG[asset.key]}
                  alt={asset.name}
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <div>
                <p className="text-foreground font-sans text-[16px] font-semibold">{asset.name}</p>
                <p className="font-body text-muted mt-[2px] text-[11px]">{asset.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width dark CTA pill */}
        <Link
          href={`/${locale}/markets/instruments`}
          className="bg-foreground text-background font-body flex h-[46px] w-full items-center justify-center gap-2 rounded-[16px] text-[14px] font-medium transition-opacity hover:opacity-90 xl:w-auto xl:px-8"
        >
          {t('marketsViewAll')}
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
