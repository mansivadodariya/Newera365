'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const ASSET_ICON_FILES = {
  forex: '/icons/forex.png',
  indices: '/icons/performance.png',
  commodities: '/icons/commodities.png',
  stocks: '/icons/exchange.png',
  crypto: '/icons/crypto.png',
  etfs: '/icons/products.png',
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
    <section className="px-5 pb-9 pt-10" style={{ background: 'var(--gradient-markets)' }}>
      <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
        <SectionKicker className="text-muted mb-5">{t('marketsKicker')}</SectionKicker>

        <h2 className="text-foreground mb-3 font-sans text-[32px] font-semibold leading-[1.1]">
          {t('marketsHeading')}
        </h2>
        <p className="font-body text-muted mb-[14px] text-[14px] leading-relaxed">
          {t('marketsSubheading')}
        </p>

        {/* 2×3 asset class grid */}
        <div className="mb-[14px] grid grid-cols-2 gap-[10px]">
          {assets.map((asset) => (
            <div
              key={asset.key}
              className="flex flex-col gap-[14px] rounded-[18px] bg-[#e0e0e061] pb-[18px] pl-[16px] pr-[16px] pt-[18px] shadow-[0px_4px_16px_0px_#0000000F] dark:bg-[#1c1c1c] dark:shadow-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#efefef] dark:bg-[#2a2a2a]">
                <Image
                  src={ASSET_ICON_FILES[asset.key]}
                  alt={asset.name}
                  width={22}
                  height={22}
                  className="dark:invert"
                />
              </div>
              <div>
                <p className="text-foreground font-sans text-[16px] font-semibold">{asset.name}</p>
                <p className="font-body text-muted mt-0.5 text-[11px]">{asset.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dark CTA button */}
        <Link
          href={`/${locale}/markets`}
          className="bg-foreground text-background font-body flex h-[45px] w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-medium transition-opacity hover:opacity-90"
        >
          {t('marketsViewAll')}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
