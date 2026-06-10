'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

function IconMt5() {
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
        stroke="white"
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
      <rect x="4" y="4" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5" />
      <path d="M8 8h4M8 11h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconTimeframes() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.5" />
      <path
        d="M10 6v4l2.5 2.5"
        stroke="white"
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
      <path d="M2 14h16M4 10h12M6 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}
function IconTablet() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}
function IconDesktop() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 17h8M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const PLATFORM_CARDS = [
  {
    id: 'mt5',
    tag: 'INDUSTRY STANDARD',
    tagStyle: 'bg-white/10 text-white',
    name: 'MetaTrader 5',
    desc: 'Advanced charting, 80+ indicators, Expert Advisors, multi-asset.',
    ctaLabel: 'Download',
    ctaStyle: 'bg-accent text-white',
    cardBg: 'bg-[#111111]',
    nameColor: 'text-white',
    descColor: 'text-white/60',
    iconBg: 'bg-[#f2f2f4] text-[#111111]',
    Icon: IconMt5,
  },
  {
    id: 'web',
    tag: 'NO INSTALL',
    tagStyle: 'border border-accent text-accent',
    name: 'Web Trader',
    desc: 'Full MT5 power, runs in any browser. No download required.',
    ctaLabel: 'Open web trader',
    ctaStyle: 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]',
    cardBg: 'bg-surface',
    nameColor: 'text-foreground',
    descColor: 'text-muted',
    iconBg: 'bg-white dark:bg-surface text-[#111111] dark:text-white',
    Icon: IconWeb,
  },
  {
    id: 'mobile',
    tag: 'iOS & ANDROID',
    tagStyle: 'border border-accent text-accent',
    name: 'Mobile App',
    desc: 'One-tap trading with FaceID. Push alerts for every move.',
    ctaLabel: 'Get the app',
    ctaStyle: 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]',
    cardBg: 'bg-surface',
    nameColor: 'text-foreground',
    descColor: 'text-muted',
    iconBg: 'bg-white dark:bg-surface text-[#111111] dark:text-white',
    Icon: IconMobile,
  },
];

const TOOLS = [
  {
    id: 'indicators',
    label: '80+ indicators',
    desc: 'Built-in technical analysis tools',
    Icon: IconIndicators,
  },
  {
    id: 'ea',
    label: 'EA support',
    desc: 'Run Expert Advisors and algorithmic strategies',
    Icon: IconEa,
  },
  {
    id: 'timeframes',
    label: '21 timeframes',
    desc: 'From M1 ticks to monthly bars',
    Icon: IconTimeframes,
  },
  {
    id: 'hedging',
    label: 'Hedging',
    desc: 'Multiple positions on the same instrument',
    Icon: IconHedging,
  },
];

const DEVICES = [
  { label: 'iOS', Icon: IconPhone },
  { label: 'iPadOS', Icon: IconTablet },
  { label: 'macOS', Icon: IconDesktop },
  { label: 'Android', Icon: IconPhone },
  { label: 'Web', Icon: IconWeb },
  { label: 'Windows', Icon: IconDesktop },
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

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px]">
            {t('heroLine1')}
            <br />
            {t('heroLine2')}
            <span className="text-accent"> {t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>

          {/* Device mockup */}
          <div className="relative mt-6 h-[200px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#f0f9f3] to-[#f0f0f0] xl:mt-0 xl:h-[340px] xl:w-1/2 xl:flex-shrink-0 xl:rounded-[32px] dark:from-[#0d1f11] dark:to-[#1a1a1a]">
            {/* Phone mock */}
            <div className="dark:border-border absolute right-6 top-3 h-[180px] w-[82px] overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-lg dark:bg-[#111111]">
              <div className="h-2.5 w-full bg-[#111111] dark:bg-[#000]" />
              <div className="flex h-full flex-col gap-1 bg-[#111111] p-1.5">
                <div className="h-1.5 w-3/4 rounded bg-white/10" />
                <div className="flex-1 rounded bg-[#1a1a1a]">
                  <div className="flex h-full items-end gap-0.5 p-1.5">
                    {[40, 55, 35, 70, 60, 80, 65].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i % 2 === 0 ? '#26A69A' : '#EE5250',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop mock */}
            <div className="dark:border-border absolute left-3 top-6 h-[148px] w-[190px] overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#111111] shadow-lg">
              <div className="flex h-6 items-center gap-1 border-b border-white/10 bg-[#1a1a1a] px-2">
                <span className="font-body text-[8px] font-semibold text-white">EURUSD</span>
                <span className="font-body ml-1 text-[7px] text-white/40">H1</span>
              </div>
              <div className="flex h-[calc(100%-24px)] items-end gap-0.5 px-2 pb-2 pt-1 xl:h-[calc(100%-32px)] xl:gap-1 xl:px-3 xl:pb-3">
                {[30, 50, 40, 60, 45, 70, 55, 80, 65, 75, 60, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i % 2 === 0 ? '#26A69A' : '#EE5250',
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Accent glow */}
            <div className="to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent" />
          </div>
        </div>
      </section>

      {/* Terminal section */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('terminalKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1] xl:text-[40px]">
            {t('terminalHeading')}
          </h2>

          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-3 xl:gap-[18px]">
            {PLATFORM_CARDS.map((card) => (
              <div
                key={card.id}
                className={`flex flex-col gap-[18px] rounded-[22px] p-[22px] xl:p-[28px] ${card.cardBg}`}
              >
                {/* Head: icon + tag */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] ${card.iconBg}`}
                  >
                    <card.Icon />
                  </div>
                  <span
                    className={`font-body rounded-full px-3 py-[5px] text-[9px] font-semibold uppercase tracking-[0.12em] ${card.tagStyle}`}
                  >
                    {card.tag}
                  </span>
                </div>

                {/* Name + desc */}
                <div>
                  <p className={`mb-2 font-sans text-[22px] font-semibold ${card.nameColor}`}>
                    {card.id === 'mt5'
                      ? t('mt5Title')
                      : card.id === 'web'
                        ? t('webTitle')
                        : t('mobileTitle')}
                  </p>
                  <p className={`font-body text-[13px] leading-[1.55] ${card.descColor}`}>
                    {card.id === 'mt5'
                      ? t('mt5Desc')
                      : card.id === 'web'
                        ? t('webDesc')
                        : t('mobileDesc')}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register`}
                  className={`font-body flex h-[44px] items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80 ${card.ctaStyle}`}
                >
                  {card.id === 'mt5'
                    ? t('mt5Btn')
                    : card.id === 'web'
                      ? t('webBtn')
                      : t('mobileBtn')}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v8M4 7l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools section */}
      <section className="dark:bg-surface bg-[#f5f5f5] pb-[36px] pl-[20px] pr-[20px] pt-[40px] xl:px-8 xl:py-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('featuresKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1] xl:mb-8 xl:text-[40px]">
            {t('featuresHeading')}
          </h2>

          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-2 xl:gap-[16px]">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="bg-background shadow-card flex flex-col gap-3 rounded-[18px] p-4 dark:shadow-none"
              >
                <div className="text-foreground flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.08)] dark:bg-[rgba(255,255,255,0.06)]">
                  <tool.Icon />
                </div>
                <div>
                  <p className="text-foreground mb-[4px] font-sans text-[14px] font-semibold xl:mb-1 xl:text-[18px]">
                    {t(
                      `feat${['indicators', 'ea', 'timeframes', 'hedging'].indexOf(tool.id) + 1}` as 'feat1',
                    )}
                  </p>
                  <p className="font-body text-muted text-[11px] leading-snug xl:text-[13px]">
                    {t(
                      `feat${['indicators', 'ea', 'timeframes', 'hedging'].indexOf(tool.id) + 1}Desc` as 'feat1Desc',
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works Everywhere */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white [&>span:last-child]:text-white">
            {t('devicesKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1] text-white xl:text-[40px]">
            {t('devicesLine1')}
          </h2>
          <p className="font-body mb-8 max-w-[320px] text-[14px] leading-[1.55] text-white/50 xl:max-w-[460px] xl:text-[15px]">
            {t('devicesDesc')}
          </p>

          {/* Device grid — 3-col on mobile, 2-col (of 3 rows) on xl */}
          <div className="mb-8 grid grid-cols-3 gap-[10px] xl:grid-cols-2 xl:gap-x-6 xl:gap-y-3">
            {DEVICES.map((dev) => (
              <div
                key={dev.label}
                className="text-foreground bg-surface flex flex-col items-center gap-2 rounded-[14px] py-4"
              >
                <div className="text-white/70 xl:flex-shrink-0">
                  <dev.Icon />
                </div>
                <div className="xl:flex-1">
                  <span className="font-body block text-[11px] font-medium xl:text-[14px] xl:font-semibold">
                    {dev.label}
                  </span>
                  <span className="font-body hidden text-[10px] text-white/40 xl:block">
                    {dev.label === 'iOS'
                      ? 'iPhone · App Store'
                      : dev.label === 'iPadOS'
                        ? 'iPad · App Store'
                        : dev.label === 'macOS'
                          ? 'Mac · Direct download'
                          : dev.label === 'Android'
                            ? 'Google Play'
                            : dev.label === 'Web'
                              ? 'Open in browser'
                              : 'Windows · Direct download'}
                  </span>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="hidden text-white/30 xl:block"
                >
                  <path
                    d="M4 8h8M9 5l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* CTA row — stacked on mobile, inline on xl with tagline on right */}
          <div className="xl:flex xl:items-center xl:justify-between xl:gap-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:gap-4">
              {/* Download MT5 */}
              <a
                href={downloads?.windows ?? '#'}
                target={downloads?.windows ? '_blank' : undefined}
                rel={downloads?.windows ? 'noopener noreferrer' : undefined}
                className="bg-accent font-body hover:bg-accent-hover flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-7"
              >
                {t('downloadMT5Btn')}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3v8M4 7l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* Open WebTrader */}
              <Link
                href={downloads?.webTrader ?? `/${locale}/platform`}
                className="font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40 xl:w-auto xl:px-7"
              >
                {t('openWebBtn')}
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 8h8M9 5l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* Right tagline — desktop only */}
            <p className="font-body hidden text-right text-[13px] leading-snug text-white/40 xl:block">
              {t('freeDemo')}
              <br />
              {t('mt4Note')}
            </p>
          </div>

          {/* Mobile app badges — shown only when CMS URLs are configured */}
          {(downloads?.ios || downloads?.android) && (
            <div className="mt-3 flex gap-3">
              {downloads.ios && (
                <a
                  href={downloads.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border font-body text-foreground flex h-[42px] flex-1 items-center justify-center gap-1.5 rounded-full border text-[13px] font-medium transition-opacity hover:opacity-70"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M11.5 1a3.5 3.5 0 01-3.5 3.5A3.5 3.5 0 0111.5 1z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M2 11.5C2 8.46 4.46 6 7.5 6h1C11.54 6 14 8.46 14 11.5c0 1.93-.7 3-2 3.5H4c-1.3-.5-2-1.57-2-3.5z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                  App Store
                </a>
              )}
              {downloads.android && (
                <a
                  href={downloads.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border font-body text-foreground flex h-[42px] flex-1 items-center justify-center gap-1.5 rounded-full border text-[13px] font-medium transition-opacity hover:opacity-70"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 5.5h10v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 013 12.5v-7z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M5.5 5.5V4a2.5 2.5 0 015 0v1.5M6 14v1.5M10 14v1.5M1.5 7h1M13.5 7h1"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Google Play
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
