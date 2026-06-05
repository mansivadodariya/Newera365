'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export interface MediaPressItem {
  id: number | string;
  headline: string;
  publication: string;
  date: string;
  url?: string | null;
  excerpt?: string | null;
  logoUrl?: string | null;
  isFeatured?: boolean | null;
}

interface MediaPressPageProps {
  items?: MediaPressItem[];
}

const STATIC_ITEMS: MediaPressItem[] = [
  {
    id: 1,
    headline: 'NewEra365 introduces sub-3ms execution technology',
    publication: 'Reuters',
    date: '2025-05-14',
    excerpt:
      'Broker NewEra365 has deployed a new execution infrastructure claiming sub-3 millisecond order fills for all asset classes.',
    isFeatured: true,
  },
  {
    id: 2,
    headline: 'NewEra365 expands to the GCC market with CySEC licence upgrade',
    publication: 'Bloomberg',
    date: '2025-04-22',
    excerpt:
      'The forex and CFD broker has been granted expanded operating permissions across GCC territories.',
  },
  {
    id: 3,
    headline: '40% surge: NewEra365 reports record-breaking Q1 trading volumes',
    publication: 'Financial Times',
    date: '2025-04-05',
  },
  {
    id: 4,
    headline: 'NewEra365 wins Best CFD Broker award at Global Forex Summit 2025',
    publication: 'Forex Magnates',
    date: '2025-03-18',
  },
  {
    id: 5,
    headline: 'NewEra365 named fastest growing broker in MENA region',
    publication: 'MENA Forex Review',
    date: '2025-02-10',
  },
  {
    id: 6,
    headline: 'How NewEra365 is using AI to transform broker-client relationships',
    publication: 'FinTech Magazine',
    date: '2025-01-28',
  },
];

const BRAND_ASSETS = [
  { key: 'assetKit', descKey: 'assetKitDesc', icon: '📦' },
  { key: 'logoPack', descKey: 'logoPackDesc', icon: '🎨' },
  { key: 'pressKit', descKey: 'pressKitDesc', icon: '📄' },
] as const;

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function MediaPressPage({ items: cmsItems }: MediaPressPageProps) {
  const locale = useLocale();
  const t = useTranslations('mediaPress');

  const items = cmsItems && cmsItems.length > 0 ? cmsItems : STATIC_ITEMS;
  const featuredItem = items.find((i) => i.isFeatured) ?? items[0];
  const listItems = items.filter((i) => !i.isFeatured || i !== featuredItem);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[38px] font-semibold leading-[1.05] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Press coverage list */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('pressKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px]">
            {t('pressHeading')}
          </h2>
          <div className="flex flex-col">
            {listItems.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 py-4 ${i < listItems.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#1a1c22]' : ''}`}
              >
                {/* Publication logo or initial */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#f2f2f4] dark:bg-[#111]">
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={item.publication}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <span className="font-sans text-[11px] font-bold text-[#6B7280]">
                      {item.publication.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-body text-[11px] font-medium text-[#6B7280]">
                      {item.publication}
                    </span>
                    <span className="font-body text-[11px] text-[#9CA3AF]">
                      · {formatDate(item.date)}
                    </span>
                  </div>
                  {item.url ? (
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <p className="text-foreground group-hover:text-accent font-sans text-[14px] font-semibold leading-[1.35] transition-colors">
                        {item.headline}
                      </p>
                    </Link>
                  ) : (
                    <p className="text-foreground font-sans text-[14px] font-semibold leading-[1.35]">
                      {item.headline}
                    </p>
                  )}
                  {item.excerpt && (
                    <p className="font-body text-muted mt-1 line-clamp-2 text-[12px] leading-[1.5]">
                      {item.excerpt}
                    </p>
                  )}
                </div>
                {item.url && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-muted mt-1 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12L12 2M12 2H6M12 2v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand assets download */}
      <section className="rounded-[32px] bg-[#f2f2f7] px-5 pb-9 pt-10 dark:bg-[#0f0f14]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 text-[#6B7280] dark:text-[#6B7280] [&>span:first-child]:bg-[#d0d0d8] dark:[&>span:first-child]:bg-[#1a1c22]">
            {t('assetsKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[24px] font-semibold leading-[1.1] tracking-[-0.48px]">
            {t('assetsHeading')}
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {BRAND_ASSETS.map(({ key, descKey, icon }) => (
              <div
                key={key}
                className="bg-surface dark:bg-surface flex items-center justify-between rounded-[16px] px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[22px]">{icon}</span>
                  <div>
                    <p className="text-foreground font-sans text-[14px] font-semibold">
                      {t(key as 'assetKit')}
                    </p>
                    <p className="font-body text-muted text-[12px]">
                      {t(descKey as 'assetKitDesc')}
                    </p>
                  </div>
                </div>
                <button className="font-body bg-foreground/[0.08] hover:bg-foreground/[0.14] text-foreground flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors">
                  {t('downloadBtn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured newsroom item */}
      {featuredItem && (
        <section className="bg-transparent px-5 pb-10 pt-10">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
              {t('latestKicker')}
            </SectionKicker>
            <p className="text-foreground mb-4 font-sans text-[18px] font-semibold">
              {t('latestHeading')}
            </p>
            <div className="overflow-hidden rounded-[22px] bg-[#07090D]">
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-body text-[11px] font-medium text-white/50">
                    {featuredItem.publication}
                  </span>
                  <span className="font-body text-[11px] text-white/30">
                    · {formatDate(featuredItem.date)}
                  </span>
                </div>
                <p className="mb-3 font-sans text-[18px] font-semibold leading-[1.3] text-white">
                  {featuredItem.headline}
                </p>
                {featuredItem.excerpt && (
                  <p className="font-body mb-4 text-[13px] leading-[1.5] text-white/50">
                    {featuredItem.excerpt}
                  </p>
                )}
                {featuredItem.url && (
                  <Link
                    href={featuredItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-accent flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80"
                  >
                    {t('readArticle')}
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M2 12L12 2M12 2H6M12 2v6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Media inquiries */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[18px] border border-[#e5e7eb] px-5 py-5 dark:border-[#1a1c22]">
            <p className="text-foreground mb-1 font-sans text-[16px] font-semibold">
              {t('inquiriesHeading')}
            </p>
            <p className="font-body text-muted mb-3 text-[13px] leading-[1.5]">
              {t('inquiriesDesc')}{' '}
              <a
                href={`mailto:${t('inquiriesEmail')}`}
                className="text-accent font-medium hover:underline"
              >
                {t('inquiriesEmail')}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className="mx-auto flex max-w-[390px] flex-col items-center md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 text-center font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] text-white">
            {t('ctaHeading')}
            <br />
            <span className="text-accent">{t('ctaAccent')}</span>
          </h2>
          <p className="font-body mb-6 max-w-[280px] text-center text-[13px] text-white/60">
            {t('ctaSubtitle')}
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent hover:bg-accent/90 font-body flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-white transition-colors"
          >
            {t('ctaBtn')}
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
    </>
  );
}
