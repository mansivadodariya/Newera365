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
    <section className="dark:bg-background bg-white px-5 pb-9 pt-10 xl:px-[120px] xl:pb-[60px] xl:pt-[60px]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-[14px] text-black dark:text-white">
          {t('marketsKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-2 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px]">
          {t('marketsHeading')}
        </h2>
        <p className="font-body text-muted mb-[14px] text-[14px] leading-[155%]">
          {t('marketsSubheading')}
        </p>

        {/* 2-col on mobile, 6-col on desktop — photo cards with dark overlay */}
        <div className="mb-[10px] grid grid-cols-2 gap-[10px] xl:grid-cols-6">
          {assets.map((asset) => (
            <div
              key={asset.key}
              className="relative h-[110px] overflow-hidden rounded-[16px] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.14)]"
            >
              {/* Background photo */}
              <Image
                src={ASSET_BG[asset.key]}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 17vw"
                className="object-cover"
              />
              {/* Gradient overlay — heavier at bottom so text is legible */}
              <div className="absolute inset-0 rounded-[16px] bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              {/* Text anchored bottom-left */}
              <div className="absolute bottom-[14px] left-[14px]">
                <p className="font-sans text-[16px] font-semibold leading-tight text-white">
                  {asset.name}
                </p>
                <p className="font-body text-[12px] text-white/80">{asset.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width dark CTA pill */}
        <Link
          href={`/${locale}/markets`}
          className="font-body flex h-[45px] w-full items-center justify-between rounded-[16px] bg-[#111] px-[16px] text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {t('marketsViewAll')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
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
