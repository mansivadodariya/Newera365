'use client';

import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import Image from 'next/image';

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
function IconIPhone() {
  return <Image alt="Apple Store" src="/images/apple-store.png" width="33" height="33" />;
}
function IconPhone() {
  return <Image alt="Play Store" src="/images/google-play.png" width="33" height="33" />;
}
function IconDesktop() {
  return <Image alt="Windows" src="/images/windows.png" width="33" height="33" />;
}

const PLATFORM_CARDS = [
  { id: 'mt5', Icon: IconMt5 },
  { id: 'web', Icon: IconWeb },
  { id: 'mobile', Icon: IconMobile },
];

const TOOLS = [
  { id: 'indicators', Icon: IconIndicators },
  { id: 'ea', Icon: IconEa },
  { id: 'timeframes', Icon: IconTimeframes },
  { id: 'hedging', Icon: IconHedging },
];

const DEVICE_KEYS = [
  { key: 'deviceIos' as const, Icon: IconIPhone },
  { key: 'deviceAndroid' as const, Icon: IconPhone },
  { key: 'deviceWindows' as const, Icon: IconDesktop },
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
      <section className="rounded-b-[32px] bg-gradient-to-b from-[#FFFFFF] to-[#B2FFAB] px-5 pb-8 pt-9 dark:bg-gradient-to-b dark:from-[#000000] dark:to-[#085A00]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:flex xl:max-w-[1200px] xl:items-center xl:gap-16">
          <div className="xl:flex-1">
            <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] xl:text-[52px] xl:tracking-[-1.56px]">
              {t('heroLine1')} <span className="text-accent">{t('heroAccent')}</span>
              <br />
              {t('heroLine2')}
            </h1>
            <p className="font-body max-w-[310px] text-[14px] leading-[1.55] xl:max-w-[380px] xl:text-[15px] dark:text-[#B8BFCC]">
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
      <section className="rounded-t-[32px] bg-[#FFFFFF] px-5 py-[56px] dark:bg-[#07090D]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                className="hover:border-accent/20 dark:hover:border-accent/25 group relative flex flex-col gap-[18px] overflow-hidden rounded-[22px] border border-transparent bg-[#f2f2f2] p-[22px] transition-all duration-300 hover:-translate-y-1 hover:bg-[#07090D] hover:shadow-[0_20px_48px_rgba(0,176,80,0.15)] xl:p-[28px] dark:border-white/[0.06] dark:bg-[#1a1c22] dark:hover:bg-[#07090D]"
              >
                {/* Green glow — fades in on hover */}
                <span
                  className="pointer-events-none absolute -top-[50px] left-[10%] h-[180px] w-[180px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-70"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(0,176,80,0.4) 0%, rgba(0,176,80,0.1) 50%, transparent 70%)',
                  }}
                  aria-hidden="true"
                />

                {/* Icon + tag */}
                <div className="relative flex items-center justify-between">
                  <div className="bg-accent/10 text-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                    <card.Icon />
                  </div>
                  <span className="font-body 'border-accent text-accent group-hover:border-accent/40 rounded-full border px-3 py-[5px] text-[9px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300">
                    {card.id === 'mt5'
                      ? t('mt5Badge')
                      : card.id === 'web'
                        ? t('webBadge')
                        : t('mobileBadge')}
                  </span>
                </div>

                {/* Name + desc */}
                <div className="relative">
                  <p className="mb-2 font-sans text-[22px] font-semibold text-[#111] transition-colors duration-300 group-hover:text-white dark:text-white">
                    {card.id === 'mt5'
                      ? t('mt5Title')
                      : card.id === 'web'
                        ? t('webTitle')
                        : t('mobileTitle')}
                  </p>
                  <p className="font-body text-[13px] leading-[1.55] text-[#6b7280] transition-colors duration-300 group-hover:text-white/60 dark:text-white/60">
                    {card.id === 'mt5'
                      ? t('mt5Desc')
                      : card.id === 'web'
                        ? t('webDesc')
                        : t('mobileDesc')}
                  </p>
                </div>

                {/* CTA */}
                {card.id === 'mt5' ? (
                  <a
                    href={downloads?.windows ?? '#'}
                    target={downloads?.windows ? '_blank' : undefined}
                    rel={downloads?.windows ? 'noopener noreferrer' : undefined}
                    className="font-body group-hover:bg-accent relative flex h-[44px] items-center justify-center gap-2 rounded-full bg-[#111] text-[13px] font-medium text-white transition-all duration-200 group-hover:shadow-[0_6px_20px_rgba(0,176,80,0.4)] dark:bg-white/10"
                  >
                    {t('mt5Btn')}
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3v8M4 7l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                ) : card.id === 'web' ? (
                  <a
                    href={downloads?.webTrader ?? `/${locale}/web-trader`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body group-hover:bg-accent relative flex h-[44px] items-center justify-center gap-2 rounded-full bg-[#111] text-[13px] font-medium text-white transition-all duration-200 group-hover:shadow-[0_6px_20px_rgba(0,176,80,0.4)] dark:bg-white/10"
                  >
                    {t('webBtn')}
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 13L13 3M13 3H7M13 3v6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                ) : (
                  <a
                    href={downloads?.ios ?? downloads?.android ?? '#'}
                    target={downloads?.ios || downloads?.android ? '_blank' : undefined}
                    rel={downloads?.ios || downloads?.android ? 'noopener noreferrer' : undefined}
                    className="font-body group-hover:bg-accent relative flex h-[44px] items-center justify-center gap-2 rounded-full bg-[#111] text-[13px] font-medium text-white transition-all duration-200 group-hover:shadow-[0_6px_20px_rgba(0,176,80,0.4)] dark:bg-white/10"
                  >
                    {t('mobileBtn')}
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3v8M4 7l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools section — dark green bg matching Figma */}
      <section className="rounded-t-[32px] bg-gradient-to-b from-[#26A69A] to-[#FFFFFF] px-5 pb-10 pt-10 xl:px-8 xl:py-16 dark:bg-gradient-to-b dark:from-[#26A69A] dark:to-[#07090D]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white dark:[&>span:first-child]:bg-black [&>span:last-child]:text-white dark:[&>span:last-child]:text-black">
            {t('featuresKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1] xl:mb-8 xl:text-[40px]">
            {t('featuresHeading')}
          </h2>

          <div className="grid grid-cols-2 gap-[10px] xl:gap-[14px]">
            {TOOLS.map((tool, i) => (
              <div
                key={tool.id}
                className="flex flex-col gap-3 rounded-[18px] bg-white p-4 dark:bg-[#111111]"
              >
                <div className="bg-accent/10 text-accent flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px]">
                  <tool.Icon />
                </div>
                <div>
                  <p className="mb-[4px] font-sans text-[14px] font-semibold text-[#111] xl:mb-1 xl:text-[18px] dark:text-white">
                    {t(`feat${i + 1}` as 'feat1')}
                  </p>
                  <p className="font-body text-[11px] leading-snug text-[#6b7280] xl:text-[13px] dark:text-white/50">
                    {t(`feat${i + 1}Desc` as 'feat1Desc')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works Everywhere */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/30 [&>span:last-child]:text-white/60">
            {t('devicesKicker')}
          </SectionKicker>
          <h2 className="mb-2 font-sans text-[32px] font-semibold leading-[1.1] text-white xl:text-[40px]">
            {t('devicesLine1')}
          </h2>
          <h2 className="mb-6 font-sans text-[32px] font-semibold leading-[1.1] text-white xl:text-[40px]">
            {t('devicesLine2')}
          </h2>

          {/* 3 device pills — stack on mobile, row on larger screens */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            {DEVICE_KEYS.map((dev) => (
              <div
                key={dev.key}
                className="flex min-w-0 flex-1 justify-between gap-[14px] rounded-[14px] bg-white/10 px-[20px] py-4 text-white transition-colors hover:bg-white/15"
              >
                <div className="flex min-w-0 items-center gap-[14px]">
                  <dev.Icon />
                  <span className="font-body truncate text-[13px] font-medium">{t(dev.key)}</span>
                </div>
                <div className="font-inter text-[18px] font-normal text-[rgba(255,255,255,0.30)]">
                  ›
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={downloads?.windows ?? '#'}
            target={downloads?.windows ? '_blank' : undefined}
            rel={downloads?.windows ? 'noopener noreferrer' : undefined}
            className="bg-accent font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors hover:bg-[#00c85a] xl:w-auto xl:px-8"
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
        </div>
      </section>
    </>
  );
}
