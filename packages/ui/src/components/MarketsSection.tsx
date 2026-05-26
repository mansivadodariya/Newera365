'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const ASSET_ICONS = {
  forex: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  indices: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 17l4-5 4 3 4-6 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  commodities: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  stocks: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="14" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="9" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="17" y="4" width="4" height="17" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  crypto: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 8h4.5a2 2 0 010 4H9m0-4v8m0-4h5a2 2 0 010 4H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  etfs: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

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
      className="px-5 pb-9 pt-10"
      style={{ background: 'linear-gradient(180deg, rgba(19,19,19,0.43) 0%, #ffffff 100%)' }}
    >
      <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
        <SectionKicker className="mb-5">{t('marketsKicker')}</SectionKicker>

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
              className="flex flex-col gap-[14px] rounded-[18px] bg-[#e0e0e0] px-4 py-[18px]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#efefef] text-[#374151]">
                {ASSET_ICONS[asset.key]}
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
