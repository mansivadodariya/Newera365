'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
import Image from 'next/image';

function IconWindows() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconMac() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}
function IconAndroid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        fill="currentColor"
        d="M6 9v7a1 1 0 001 1h1v3a1 1 0 002 0v-3h2v3a1 1 0 002 0v-3h1a1 1 0 001-1V9H6zM4.5 9a1 1 0 00-1 1v5a1 1 0 002 0v-5a1 1 0 00-1-1zm15 0a1 1 0 00-1 1v5a1 1 0 002 0v-5a1 1 0 00-1-1zM15.3 3.9l1.1-1.6a.4.4 0 00-.65-.45L14.6 3.5A6 6 0 0012 3a6 6 0 00-2.6.5L8.25 1.85a.4.4 0 10-.65.45L8.7 3.9A5 5 0 006 8h12a5 5 0 00-2.7-4.1zM9.5 6.5a.7.7 0 110-1.4.7.7 0 010 1.4zm5 0a.7.7 0 110-1.4.7.7 0 010 1.4z"
      />
    </svg>
  );
}
function IconWeb() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="4" ry="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconMobile() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}
function IconIndicators() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <polyline
        points="2,14 7,9 11,12 18,5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconEa() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h4M8 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconTimeframes() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6v4l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconHedging() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 14h16M4 10h12M6 6h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconLinux() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-2 0-3.2 1.6-3.2 3.7 0 1 .1 1.9-.4 2.8-.6 1-1.7 1.8-2.3 3.1-.5 1-.9 2.1-1.6 3-.4.5-.9.9-.8 1.5.1.5.7.6 1.2.7.9.2 1.3.5 1.8 1.1.6.7 1.6 1.3 3 1.5h4.6c1.4-.2 2.4-.8 3-1.5.5-.6.9-.9 1.8-1.1.5-.1 1.1-.2 1.2-.7.1-.6-.4-1-.8-1.5-.7-.9-1.1-2-1.6-3-.6-1.3-1.7-2.1-2.3-3.1-.5-.9-.4-1.8-.4-2.8C15.2 3.6 14 2 12 2zm-1.6 3.4a.7.7 0 110 1.4.7.7 0 010-1.4zm3.2 0a.7.7 0 110 1.4.7.7 0 010-1.4zM12 7.6c.7 0 1.5.4 1.5.9 0 .3-.7.6-1.5.6s-1.5-.3-1.5-.6c0-.5.8-.9 1.5-.9z" />
    </svg>
  );
}

interface PlatformCard {
  id: string;
  Icon: () => JSX.Element;
  urlKey: keyof CmsPlatformDownloads;
  titleKey: string;
  descKey: string;
  badgeKey: string;
  btnKey: string;
  cta: 'download' | 'external';
  webFallback?: boolean;
}

const PLATFORM_CARDS: PlatformCard[] = [
  {
    id: 'windows',
    Icon: IconWindows,
    urlKey: 'windows',
    titleKey: 'winTitle',
    descKey: 'winDesc',
    badgeKey: 'winBadge',
    btnKey: 'mt5Btn',
    cta: 'download',
  },
  {
    id: 'macos',
    Icon: IconMac,
    urlKey: 'mac',
    titleKey: 'macTitle',
    descKey: 'macDesc',
    badgeKey: 'macBadge',
    btnKey: 'mt5Btn',
    cta: 'download',
  },
  {
    id: 'web',
    Icon: IconWeb,
    urlKey: 'webTrader',
    titleKey: 'webTitle',
    descKey: 'webDesc',
    badgeKey: 'webBadge',
    btnKey: 'webBtn',
    cta: 'external',
    webFallback: true,
  },
  {
    id: 'android',
    Icon: IconAndroid,
    urlKey: 'android',
    titleKey: 'androidTitle',
    descKey: 'androidDesc',
    badgeKey: 'androidBadge',
    btnKey: 'mobileBtn',
    cta: 'external',
  },
  {
    id: 'ios',
    Icon: IconMobile,
    urlKey: 'ios',
    titleKey: 'iosTitle',
    descKey: 'iosDesc',
    badgeKey: 'iosBadge',
    btnKey: 'mobileBtn',
    cta: 'external',
  },
];

const TOOLS = [
  { id: 'indicators', Icon: IconIndicators },
  { id: 'ea', Icon: IconEa },
  { id: 'timeframes', Icon: IconTimeframes },
  { id: 'hedging', Icon: IconHedging },
];

// MT5 surface comparison (client feedback: Mobile vs Desktop vs Web matrix).
// Cells: true = included, false = not available, 'ltd' = limited, any other
// string = a count. Counts are MetaQuotes' published MT5 built-ins; the honest
// gaps stay visible (EAs and MQL5 are desktop-only, push alerts mobile-only).
type CompareCell = boolean | string;
const COMPARE_ROWS: {
  id: string;
  labelKey: string;
  cells: [CompareCell, CompareCell, CompareCell];
}[] = [
  { id: 'charts', labelKey: 'compareRowCharts', cells: [true, true, true] },
  { id: 'indicators', labelKey: 'compareRowIndicators', cells: ['30', '38', '30'] },
  { id: 'drawing', labelKey: 'compareRowDrawing', cells: ['24', '44', '24'] },
  { id: 'oneclick', labelKey: 'compareRowOneClick', cells: [true, true, true] },
  { id: 'alerts', labelKey: 'compareRowAlerts', cells: [true, true, true] },
  { id: 'push', labelKey: 'compareRowPush', cells: [true, false, false] },
  { id: 'ea', labelKey: 'compareRowEa', cells: [false, true, false] },
  { id: 'mql5', labelKey: 'compareRowMql5', cells: [false, true, false] },
  { id: 'dom', labelKey: 'compareRowDom', cells: ['ltd', true, 'ltd'] },
  { id: 'accounts', labelKey: 'compareRowAccounts', cells: [true, true, true] },
  { id: 'history', labelKey: 'compareRowHistory', cells: [true, true, true] },
];

// Column order matches the client doc: Mobile | Desktop | Web.
const COMPARE_COLS = [
  { key: 'compareColMobile', subKey: 'compareColMobileSub', Icon: IconMobile },
  { key: 'compareColDesktop', subKey: 'compareColDesktopSub', Icon: IconWindows },
  { key: 'compareColWeb', subKey: 'compareColWebSub', Icon: IconWeb },
] as const;

const COMPARE_GRID = {
  gridTemplateColumns: 'minmax(170px, 1.3fr) repeat(3, minmax(122px, 1fr))',
};

// Full device matrix for the "Works Everywhere" band (matches the reference
// 6-tile grid). Linux has no dedicated MT5 build in CMS, so it points at the
// browser Web Trader, which runs on Linux.
const DEVICE_KEYS = [
  { key: 'androidTitle' as const, urlKey: 'android' as const, Icon: IconAndroid },
  { key: 'iosTitle' as const, urlKey: 'ios' as const, Icon: IconMobile },
  { key: 'macTitle' as const, urlKey: 'mac' as const, Icon: IconMac },
  { key: 'winTitle' as const, urlKey: 'windows' as const, Icon: IconWindows },
  { key: 'linuxTitle' as const, urlKey: 'webTrader' as const, Icon: IconLinux },
  { key: 'webTitle' as const, urlKey: 'webTrader' as const, Icon: IconWeb },
];

export interface CmsPlatformDownloads {
  windows?: string | null;
  mac?: string | null;
  ios?: string | null;
  android?: string | null;
  webTrader?: string | null;
}

interface PlatformPageProps {
  downloads?: CmsPlatformDownloads;
}

export function PlatformPage({ downloads }: PlatformPageProps) {
  const locale = useLocale();
  const t = useTranslations('platform');
  // Comparison emphasis is interactive, not fixed: hovering a matrix column
  // lights it up (same behaviour as the accounts feature matrix).
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  // Ink-ledger cell treatment (mirrors the accounts matrix): included = accent
  // check chip, missing = quiet dash, limited = mono chip, counts = tabular
  // figures (desktop carries the highest built-in counts, so it reads accent).
  const renderCompareCell = (cell: CompareCell, isDesktopCol: boolean) => {
    if (cell === true)
      return (
        <span
          className="bg-accent/[0.16] flex h-6 w-6 items-center justify-center rounded-full"
          role="img"
          aria-label={t('compareYes')}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-accent">
            <path
              d="M2.5 7l3 3 6-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    if (cell === false)
      return (
        <span
          className="font-body text-[15px] text-white/25"
          role="img"
          aria-label={t('compareNo')}
        >
          —
        </span>
      );
    if (cell === 'ltd')
      return (
        <span className="rounded-full border border-white/15 px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">
          {t('compareLimited')}
        </span>
      );
    return (
      <span
        dir="ltr"
        className={`font-sans text-[15px] font-semibold tabular-nums ${
          isDesktopCol ? 'text-accent-bright' : 'text-white'
        }`}
      >
        {cell}
      </span>
    );
  };

  return (
    <>
      {/* Hero */}
      <section className="rounded-b-[32px] bg-gradient-to-b from-[#F2F5F3] to-[#BDEECA] px-5 pb-10 pt-10 dark:bg-gradient-to-b dark:from-[#000000] dark:to-[#085A00]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:flex xl:max-w-[1200px] xl:items-center xl:gap-16">
          <div className="xl:flex-1">
            <h1 className="text-foreground text-display mb-5 font-sans [text-wrap:balance]">
              {t('heroLine1')} <span>{t('heroAccent')}</span>
              <br />
              {t('heroLine2')}
            </h1>
            <p className="font-body text-lead text-muted max-w-[340px] xl:max-w-[440px] dark:text-white/60">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Device mockup */}
          <div className="relative mt-6 h-[240px] overflow-visible xl:mt-0 xl:h-[340px] xl:w-[460px] xl:flex-shrink-0">
            {/* Green glow behind */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#c5f5d0] to-[#e8f8ec] dark:from-[#0a2a12] dark:to-[#111111]" />
            {/* Laptop mock — bottom-left, larger */}
            <div className="dark:border-border border-radius-[12px] absolute bottom-4 start-4 h-[170px] w-[240px] overflow-hidden rounded-[12px] border border-[#111111] bg-[#111111] p-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] xl:bottom-6 xl:start-6 xl:h-[220px] xl:w-[310px]">
              <Image
                src="/images/laptop.jpg"
                alt="Platform on laptop"
                width={132}
                height={92}
                loading="lazy"
                className="h-full w-full shrink-0 rounded-[12px]"
              />
            </div>
            {/* Phone mock — top-right, overlapping */}
            <div className="dark:border-border border-radius-[12px] absolute end-6 top-4 h-[170px] w-[90px] overflow-hidden rounded-[12px] border border-[#111111] bg-[#111111] p-[4px] shadow-[0_12px_40px_rgba(0,0,0,0.2)] xl:end-8 xl:top-6 xl:h-[266px] xl:w-[128px] dark:bg-[#111111]">
              <Image
                src="/images/platform-mobile.jpg"
                alt="Platform on mobile"
                width={83}
                height={162}
                loading="lazy"
                className="h-[162px] w-[83px] shrink-0 rounded-[12px] xl:h-[258px] xl:w-[120px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Terminal / Platform cards */}
      <section className="rounded-t-[32px] bg-transparent px-5 py-[56px] xl:py-16 dark:bg-[#07090D]">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('terminalKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-8 font-sans">{t('terminalHeading')}</h2>

          {/* 3-up then 2-up (centered) on desktop — a balanced arrangement
              instead of all five cramped into a single row. */}
          <div className="grid grid-cols-2 gap-[14px] md:grid-cols-3 xl:grid-cols-6 xl:gap-[18px]">
            {PLATFORM_CARDS.map((card, i) => {
              const rawUrl = downloads?.[card.urlKey] ?? null;
              const url = rawUrl ?? (card.webFallback ? `/${locale}/web-trader` : null);
              const isInternal = url?.startsWith('/') ?? false;
              // min-h (not fixed h) + tight leading so a long label like
              // "Open web trader" wraps to two tidy lines inside the pill on the
              // narrow 2-col mobile grid instead of cramping/overflowing.
              const ctaClass =
                'font-body bg-accent hover:bg-accent-hover relative mt-auto flex min-h-[48px] items-center justify-center gap-2 rounded-full py-2 text-center text-[13px] font-semibold leading-tight text-white transition-all duration-200 active:scale-[0.98] xl:text-[14px]';
              const arrow =
                card.cta === 'download' ? (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v8M4 7l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="rtl:-scale-x-100"
                  >
                    <path
                      d="M3 13L13 3M13 3H7M13 3v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                );

              return (
                <div
                  key={card.id}
                  className={`border-border hover:border-accent/45 dark:hover:border-accent/45 shadow-card group relative flex flex-col gap-[18px] overflow-hidden rounded-[22px] border bg-white p-[22px] transition-all duration-300 hover:shadow-[0_20px_48px_rgba(0,176,80,0.18)] xl:col-span-2 xl:p-[24px] dark:border-white/[0.06] dark:bg-[#1a1c22] ${
                    i === 3 ? 'xl:col-start-2' : ''
                  }`}
                >
                  {/* Green glow — fades in on hover */}
                  <span
                    className="pointer-events-none absolute -top-[50px] left-[10%] h-[180px] w-[180px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-40 dark:group-hover:opacity-70"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(0,176,80,0.4) 0%, rgba(0,176,80,0.1) 50%, transparent 70%)',
                    }}
                    aria-hidden="true"
                  />

                  {/* Icon + tag — stacked on the 2-col mobile grid (icon + badge
                      won't fit side by side in ~117px), side by side from md up. */}
                  <div className="relative flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-2">
                    <div className="bg-accent/10 text-accent group-hover:bg-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-300 group-hover:text-white">
                      <card.Icon />
                    </div>
                    <span className="border-accent/40 text-accent group-hover:border-accent/50 whitespace-nowrap rounded-full border px-3 py-[5px] font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300">
                      {t(card.badgeKey as 'winBadge')}
                    </span>
                  </div>

                  {/* Name + desc */}
                  <div className="relative">
                    <p className="text-title text-foreground mb-2 font-sans dark:text-white">
                      {t(card.titleKey as 'winTitle')}
                    </p>
                    <p className="font-body text-body text-muted dark:text-white/60">
                      {t(card.descKey as 'winDesc')}
                    </p>
                  </div>

                  {/* CTA */}
                  {url ? (
                    <a
                      href={url}
                      target={isInternal ? undefined : '_blank'}
                      rel={isInternal ? undefined : 'noopener noreferrer'}
                      className={ctaClass}
                    >
                      {t(card.btnKey as 'mt5Btn')}
                      {arrow}
                    </a>
                  ) : (
                    <span
                      className={`${ctaClass} pointer-events-none opacity-50`}
                      aria-disabled="true"
                    >
                      {t(card.btnKey as 'mt5Btn')}
                      {arrow}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* Tools section — brand-tinted band (replaced the off-palette teal) */}
      <section className="rounded-t-[32px] bg-gradient-to-b from-[#DCEAE1] to-[#F2F5F3] px-5 pb-12 pt-12 xl:px-8 xl:py-16 dark:from-[#0C1F14] dark:to-[#07090D]">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('featuresKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-8 font-sans">{t('featuresHeading')}</h2>

          <div className="list-dim grid grid-cols-2 gap-[12px] xl:gap-[16px]">
            {TOOLS.map((tool, i) => (
              <div
                key={tool.id}
                className="border-border shadow-card hover:border-accent/35 group flex flex-col gap-3 rounded-[18px] border bg-white p-5 transition-colors xl:p-6 dark:border-white/[0.06] dark:bg-[#111111]"
              >
                <div className="bg-accent/10 text-accent group-hover:bg-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-300 group-hover:text-white">
                  <tool.Icon />
                </div>
                <div>
                  <p className="text-foreground mb-1 font-sans text-[16px] font-semibold xl:text-[20px] dark:text-white">
                    {t(`feat${i + 1}` as 'feat1')}
                  </p>
                  <p className="font-body text-caption xl:text-body text-muted leading-snug dark:text-white/50">
                    {t(`feat${i + 1}Desc` as 'feat1Desc')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Dark closer — the MT5 surface matrix (styled like the accounts
          feature matrix) plus the Works Everywhere device band, one ink chapter. */}
      <section className="ink-band rounded-t-[32px] px-5 pb-14 pt-12 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('compareKicker')}</SectionKicker>
            <div className="mb-9 xl:flex xl:items-end xl:justify-between xl:gap-10">
              <h2 className="text-headline max-w-[24ch] font-sans text-white [text-wrap:balance]">
                {t('compareHeading')}
              </h2>
              <p className="font-body text-body mt-3 max-w-[42ch] text-white/60 xl:mt-0">
                {t('compareSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          {/* Horizontal scroll on mobile with a sticky first column; fits
              without scrolling from md up (same rig as the accounts matrix). */}
          <ScrollReveal className="overflow-x-auto rounded-[20px] border border-white/[0.08]">
            <div className="min-w-[640px] bg-white/[0.03] md:min-w-0">
              {/* Header row — device surfaces, hovered column lights up */}
              <div className="grid border-b border-white/[0.08]" style={COMPARE_GRID}>
                <span className="sticky start-0 z-[1] flex items-end bg-[#0b1c11] px-5 pb-5 pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45 md:bg-transparent">
                  {t('compareColFeature')}
                </span>
                {COMPARE_COLS.map((col, j) => (
                  <div
                    key={col.key}
                    onMouseEnter={() => setHoverCol(j)}
                    onMouseLeave={() => setHoverCol(null)}
                    className={`flex flex-col items-center justify-end gap-1 px-2 pb-5 pt-6 text-center transition-colors ${
                      j === hoverCol ? 'bg-accent/[0.10]' : ''
                    }`}
                  >
                    <span
                      className={`transition-colors [&>svg]:h-4 [&>svg]:w-4 ${
                        j === hoverCol ? 'text-accent-bright' : 'text-white/55'
                      }`}
                    >
                      <col.Icon />
                    </span>
                    <span
                      className={`font-sans text-[16px] font-semibold ${
                        j === hoverCol ? 'text-accent-bright' : 'text-white'
                      }`}
                    >
                      {t(col.key as 'compareColMobile')}
                    </span>
                    <span className="font-body text-[11px] text-white/45">
                      {t(col.subKey as 'compareColMobileSub')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature rows */}
              {COMPARE_ROWS.map((row, i) => (
                <div
                  key={row.id}
                  className={`hover:bg-accent/[0.06] grid transition-colors ${
                    i < COMPARE_ROWS.length - 1 ? 'border-b border-white/[0.06]' : ''
                  }`}
                  style={COMPARE_GRID}
                >
                  <span className="font-body sticky start-0 z-[1] bg-[#0a1810] px-5 py-4 text-[14px] text-white/80 md:bg-transparent">
                    {t(row.labelKey as 'compareRowCharts')}
                  </span>
                  {row.cells.map((cell, j) => (
                    <div
                      key={j}
                      onMouseEnter={() => setHoverCol(j)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={`flex items-center justify-center px-2 py-4 transition-colors ${
                        j === hoverCol ? 'bg-accent/[0.06]' : ''
                      }`}
                    >
                      {renderCompareCell(cell, j === 1)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollReveal>
          <p className="font-body text-caption mt-4 text-white/45">{t('compareNote')}</p>

          {/* Works everywhere — device band continues the same ink chapter */}
          <ScrollReveal className="mt-14">
            <SectionKicker className="mb-4">{t('devicesKicker')}</SectionKicker>
            <h2 className="text-headline font-sans text-white">{t('devicesLine1')}</h2>
            <h2 className="text-headline mb-8 font-sans text-white">{t('devicesLine2')}</h2>

            {/* Device tiles — informational, not links or buttons. MT5 runs on
              every surface; the actual downloads live in the terminal cards
              above and the CTA below. Icons sit in glass badges (larger, house
              set); the whole tile only warms its tint on hover. */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DEVICE_KEYS.map((dev) => (
                <div
                  key={dev.key}
                  className="hover:border-accent/40 hover:bg-accent/[0.12] group flex min-w-0 items-center gap-[14px] rounded-[16px] border border-white/[0.08] bg-white/[0.05] px-[18px] py-[14px] text-white transition-colors"
                >
                  <span className="group-hover:border-accent/40 group-hover:bg-accent/[0.15] group-hover:text-accent-bright flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.10] bg-white/[0.06] text-white transition-colors [&>svg]:h-[22px] [&>svg]:w-[22px]">
                    <dev.Icon />
                  </span>
                  <span className="font-body text-[15px] font-medium leading-tight">
                    {t(dev.key as 'winTitle')}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={downloads?.windows ?? '#'}
              target={downloads?.windows ? '_blank' : undefined}
              rel={downloads?.windows ? 'noopener noreferrer' : undefined}
              className="from-accent to-accent-bright font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r text-[15px] font-semibold text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] xl:w-auto xl:px-9"
            >
              {t('downloadMT5Btn')}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <path
                  d="M13.125 9.375V11.875C13.125 12.2065 12.9933 12.5245 12.7589 12.7589C12.5245 12.9933 12.2065 13.125 11.875 13.125H3.125C2.79348 13.125 2.47554 12.9933 2.24112 12.7589C2.0067 12.5245 1.875 12.2065 1.875 11.875V9.375"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.375 6.25L7.5 9.375L10.625 6.25"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 9.375V1.875"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
