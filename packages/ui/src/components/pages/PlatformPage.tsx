'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import Image from 'next/image';

function IconWindows() {
  return (
    <Image
      src="/icons/window.svg"
      alt="Windows"
      width={28}
      height={28}
      className="h-6 w-6 object-contain sm:h-7 sm:w-7"
    />
  );
}
function IconMac() {
  return (
    <Image
      src="/icons/apple.svg"
      alt="macOS"
      width={28}
      height={28}
      className="h-6 w-6 object-contain sm:h-7 sm:w-7"
    />
  );
}
function IconAndroid() {
  return (
    <Image
      src="/icons/android.svg"
      alt="Android"
      width={28}
      height={28}
      className="h-6 w-6 object-contain sm:h-7 sm:w-7"
    />
  );
}
function IconWeb() {
  return (
    <Image
      src="/icons/internet.svg"
      alt="Web"
      width={28}
      height={28}
      className="h-6 w-6 object-contain sm:h-7 sm:w-7"
    />
  );
}
function IconMobile() {
  return (
    <Image
      src="/icons/apple.svg"
      alt="iOS"
      width={28}
      height={28}
      className="h-6 w-6 object-contain sm:h-7 sm:w-7"
    />
  );
}
function IconIndicators() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <polyline
        points="2,14 7,9 11,12 18,5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconEa() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8h4M8 11h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconTimeframes() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 6v4l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconHedging() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 14h16M4 10h12M6 6h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconLinux() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-2 0-3.2 1.6-3.2 3.7 0 1 .1 1.9-.4 2.8-.6 1-1.7 1.8-2.3 3.1-.5 1-.9 2.1-1.6 3-.4.5-.9.9-.8 1.5.1.5.7.6 1.2.7.9.2 1.3.5 1.8 1.1.6.7 1.6 1.3 3 1.5h4.6c1.4-.2 2.4-.8 3-1.5.5-.6.9-.9 1.8-1.1.5-.1 1.1-.2 1.2-.7.1-.6-.4-1-.8-1.5-.7-.9-1.1-2-1.6-3-.6-1.3-1.7-2.1-2.3-3.1-.5-.9-.4-1.8-.4-2.8C15.2 3.6 14 2 12 2zm-1.6 3.4a.7.7 0 110 1.4.7.7 0 010-1.4zm3.2 0a.7.7 0 110 1.4.7.7 0 010-1.4zM12 7.6c.7 0 1.5.4 1.5.9 0 .3-.7.6-1.5.6s-1.5-.3-1.5-.6c0-.5.8-.9 1.5-.9z" />
    </svg>
  );
}

const DEFAULT_DOWNLOADS: Required<CmsPlatformDownloads> = {
  windows:
    'https://download.terminal.free/cdn/web/newera.capital.markets/mt5/neweracapitalmarkets5setup.exe',
  mac: 'https://download.terminal.free/cdn/web/newera.capital.markets/mt5/neweracapitalmarkets5setup.exe',
  webTrader: 'https://webtrading.newera365.com/terminal',
  android:
    'https://download.terminal.free/cdn/mobile/mt5/android?server=NeweraCapitalMarkets-Server',
  ios: 'https://download.terminal.free/cdn/mobile/mt5/ios?server=NeweraCapitalMarkets-Server',
};

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

const COMPARE_COLS = [
  { key: 'compareColMobile', subKey: 'compareColMobileSub', Icon: IconMobile },
  { key: 'compareColDesktop', subKey: 'compareColDesktopSub', Icon: IconWindows },
  { key: 'compareColWeb', subKey: 'compareColWebSub', Icon: IconWeb },
] as const;

const COMPARE_GRID = {
  gridTemplateColumns: 'minmax(170px, 1.3fr) repeat(3, minmax(122px, 1fr))',
};

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
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const renderCompareCell = (cell: CompareCell, isDesktopCol: boolean) => {
    if (cell === true)
      return (
        <span
          className="bg-accent/20 border-accent/40 text-accent-bright flex h-7 w-7 items-center justify-center rounded-full border font-sans text-[15px] font-bold shadow-sm"
          role="img"
          aria-label={t('compareYes')}
        >
          ✔
        </span>
      );
    if (cell === false)
      return (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15 font-sans text-[13px] font-bold text-red-400"
          role="img"
          aria-label={t('compareNo')}
        >
          ✖
        </span>
      );
    if (cell === 'ltd')
      return (
        <span className="rounded-full border border-white/25 bg-white/5 px-2.5 py-[4px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80">
          {t('compareLimited')}
        </span>
      );
    return (
      <span
        dir="ltr"
        className={`font-sans text-[16px] font-bold tabular-nums ${
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
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:flex xl:max-w-[1200px] xl:items-center xl:gap-2">
          <div className="xl:flex-1">
            <h1 className="text-foreground text-display mb-5 font-sans">
              {t('heroLine1')} <span> {t('heroAccent')} </span>
              {t('heroLine2')}
            </h1>
            <p className="font-body text-lead text-muted max-w-[340px] xl:max-w-[440px] dark:text-white">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Device mockup */}
          <div className="group relative mt-6 w-full max-w-[560px] sm:max-w-[600px] xl:mt-0 xl:w-[550px] xl:max-w-[550px] xl:flex-shrink-0">
            {/* Pure floor shadow strictly BELOW the bottom edge — ZERO side/top shadow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-full mt-2.5 h-6 w-[70%] -translate-x-1/2 rounded-[100%] bg-black/20 blur-md transition-all duration-500 group-hover:w-[75%] dark:bg-[#00b050]/40"
            />
            <div className="relative overflow-hidden rounded-[24px] transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/images/platformSide.png"
                alt="Platform across devices"
                className="h-auto w-full rounded-[24px] object-contain [image-rendering:-webkit-optimize-contrast]"
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

          {/* POWERED BY MT5 Highlight Card — Centered Bottom CTA & Branching Connectors */}
          <div className="relative mb-0 sm:mb-1">
            <div className="relative rounded-[28px] border border-[#00b050]/20 bg-gradient-to-br from-[#0A160E] via-[#0E1B12] to-[#060A07] p-8 pb-14 text-white shadow-[0_20px_50px_rgba(0,176,80,0.12)] sm:p-10 sm:pb-16 xl:p-12 xl:pb-16">
              {/* Inner clipped background container for 5.svg & stock chart lines */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                {/* Stock candlestick charts & wave graphic */}
                <svg
                  className="absolute right-0 top-1/2 h-full w-full max-w-[520px] -translate-y-1/2 opacity-35"
                  viewBox="0 0 520 200"
                  fill="none"
                >
                  {/* Glowing stock wave line */}
                  <path
                    d="M 20 140 Q 100 160 180 110 T 340 70 T 500 30"
                    stroke="#00b050"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 20 140 Q 100 160 180 110 T 340 70 T 500 30 L 500 200 L 20 200 Z"
                    fill="url(#stockGlow)"
                    opacity="0.12"
                  />
                  <defs>
                    <linearGradient id="stockGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b050" />
                      <stop offset="100%" stopColor="#00b050" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Faint Candlestick Bars */}
                  <rect x="240" y="85" width="7" height="30" rx="1" fill="#00b050" opacity="0.6" />
                  <line
                    x1="243.5"
                    y1="70"
                    x2="243.5"
                    y2="130"
                    stroke="#00b050"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />

                  <rect x="270" y="60" width="7" height="45" rx="1" fill="#00b050" opacity="0.8" />
                  <line
                    x1="273.5"
                    y1="45"
                    x2="273.5"
                    y2="120"
                    stroke="#00b050"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />

                  <rect x="300" y="90" width="7" height="25" rx="1" fill="#ef4444" opacity="0.6" />
                  <line
                    x1="303.5"
                    y1="75"
                    x2="303.5"
                    y2="125"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />

                  <rect x="330" y="50" width="7" height="50" rx="1" fill="#00b050" opacity="0.9" />
                  <line
                    x1="333.5"
                    y1="35"
                    x2="333.5"
                    y2="115"
                    stroke="#00b050"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />

                  <rect x="360" y="40" width="7" height="35" rx="1" fill="#00b050" opacity="0.7" />
                  <line
                    x1="363.5"
                    y1="25"
                    x2="363.5"
                    y2="90"
                    stroke="#00b050"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />

                  <rect x="390" y="65" width="7" height="20" rx="1" fill="#ef4444" opacity="0.5" />
                  <line
                    x1="393.5"
                    y1="50"
                    x2="393.5"
                    y2="95"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                </svg>

                {/* Background 5 SVG Graphic strictly clipped inside box */}
                <img
                  src="/images/5.svg"
                  alt="MT5 Graphic"
                  className="absolute right-0 top-1/2 hidden h-[220px] w-auto -translate-y-1/2 object-contain opacity-40 xl:block xl:h-[250px]"
                />
              </div>

              <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-[640px]">
                  <span className="mb-4 inline-block rounded-full border border-[#00b050]/30 bg-[#00b050]/20 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00b050]">
                    {t('mt5HighlightKicker')}
                  </span>
                  <h3 className="mb-3 font-sans text-[28px] font-extrabold leading-tight text-white sm:text-[34px] xl:text-[40px]">
                    {t('mt5HighlightHeading')}
                  </h3>
                  <p className="font-body text-[14px] leading-relaxed text-white/75 sm:text-[15px] xl:text-[16px]">
                    {t('mt5HighlightDesc')}
                  </p>
                </div>

                {/* MetaTrader 5 Logo */}
                <div className="relative z-10 hidden flex-shrink-0 items-center gap-3 opacity-90 xl:mr-12 xl:flex">
                  <img
                    src="/icons/Metarader.png"
                    alt="MetaTrader 5"
                    className="h-14 w-14 object-contain"
                  />
                  <span className="font-sans text-[22px] font-black tracking-tight text-white">
                    MetaTrader <span className="text-[#00b050]">5</span>
                  </span>
                </div>
              </div>

              {/* Bottom Center Floating Badge (Non-clickable) */}
              <div className="absolute -bottom-6 left-1/2 z-20 -translate-x-1/2">
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00b050] px-7 py-3.5 font-sans text-[14px] font-semibold text-white shadow-[0_8px_28px_rgba(0,176,80,0.5)] sm:px-9 sm:py-4 sm:text-[15px]">
                  <span>{t('mt5HighlightCta')}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="rtl:-scale-x-100"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rounded Branching Connector Line to Platform Cards (Matching Design Spec) */}
            <div className="relative mb-2 mt-6 hidden h-14 w-full md:block" aria-hidden="true">
              <svg
                className="h-full w-full overflow-visible text-[#00b050]/60 dark:text-[#00b050]/70"
                viewBox="0 0 900 56"
                fill="none"
              >
                {/* Center vertical stem from button to branch line */}
                <path
                  d="M 450 0 V 20"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeDasharray="3 3"
                />

                {/* Left branch: horizontal left, 12px rounded corner arc down to Card 1 */}
                <path
                  d="M 450 20 H 162 A 12 12 0 0 0 150 32 V 52"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeDasharray="3 3"
                />

                {/* Center branch: vertical line straight down to Card 2 */}
                <path
                  d="M 450 20 V 52"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeDasharray="3 3"
                />

                {/* Right branch: horizontal right, 12px rounded corner arc down to Card 3 */}
                <path
                  d="M 450 20 H 738 A 12 12 0 0 1 750 32 V 52"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeDasharray="3 3"
                />

                {/* 3 Green node dots at top center of each card below */}
                <circle cx="150" cy="52" r="3.5" fill="#00b050" />
                <circle cx="450" cy="52" r="3.5" fill="#00b050" />
                <circle cx="750" cy="52" r="3.5" fill="#00b050" />
              </svg>
            </div>
          </div>

          {/* 3-up then 2-up (centered) on desktop — a balanced arrangement
              instead of all five cramped into a single row. */}
          <div className="grid grid-cols-2 gap-[14px] md:grid-cols-3 xl:grid-cols-6 xl:gap-[18px]">
            {PLATFORM_CARDS.map((card, i) => {
              const url = DEFAULT_DOWNLOADS[card.urlKey];
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

                  {/* Icon + tag — stacked on the 2-col mobile grid, side by side from md up */}
                  <div className="relative flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-2">
                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(0,176,80,0.20)] group-hover:ring-[#00b050]/50 sm:h-14 sm:w-14 dark:bg-[#141822] dark:ring-white/15 dark:group-hover:ring-[#00b050]/60">
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
                  <p className="font-body text-caption xl:text-body text-muted leading-snug dark:text-white">
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
              <p className="font-body text-body mt-3 max-w-[42ch] text-white xl:mt-0">
                {t('compareSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          {/* Horizontal scroll on mobile with a sticky first column; fits
              without scrolling from md up (same rig as the accounts matrix). */}
          <ScrollReveal className="overflow-x-auto rounded-[20px] border border-white/[0.08]">
            <div className="min-w-[640px] bg-white/[0.03] md:min-w-0">
              {/* Header row — device surfaces with high contrast bright headings */}
              <div
                className="grid border-b border-white/[0.12] bg-white/[0.04]"
                style={COMPARE_GRID}
              >
                <span className="sticky start-0 z-[1] flex items-end bg-[#0b1c11] px-5 pb-5 pt-6 font-mono text-[13px] font-extrabold uppercase tracking-[0.14em] text-white md:bg-transparent">
                  {t('compareColFeature')}
                </span>
                {COMPARE_COLS.map((col, j) => (
                  <div
                    key={col.key}
                    onMouseEnter={() => setHoverCol(j)}
                    onMouseLeave={() => setHoverCol(null)}
                    className={`flex flex-col items-center justify-end gap-1.5 px-2 pb-5 pt-6 text-center transition-colors ${
                      j === hoverCol ? 'bg-accent/[0.14]' : ''
                    }`}
                  >
                    <span
                      className={`transition-colors [&>svg]:h-5 [&>svg]:w-5 ${
                        j === hoverCol
                          ? 'text-accent-bright scale-110'
                          : 'text-[#00b050] dark:text-[#1ad966]'
                      }`}
                    >
                      <col.Icon />
                    </span>
                    <span
                      className={`font-sans text-[26px] font-extrabold tracking-tight ${
                        j === hoverCol ? 'text-accent-bright' : 'text-white'
                      }`}
                    >
                      {t(col.key as 'compareColMobile')}
                    </span>
                    <span className="font-body text-[14px] font-bold text-white">
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
                  <span className="font-body sticky start-0 z-[1] bg-[#0a1810] px-5 py-4 text-[14.5px] font-semibold text-white/95 md:bg-transparent">
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
          <p className="font-body text-caption mt-4 text-white/80">{t('compareNote')}</p>

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
