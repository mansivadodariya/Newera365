'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

function IconMt5() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <polyline
        points="2,14 7,9 11,12 18,5"
        stroke="#111111"
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
      <circle cx="10" cy="10" r="8" stroke="#111111" strokeWidth="1.5" />
      <path d="M10 2v16M2 10h16" stroke="#111111" strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="4" ry="8" stroke="#111111" strokeWidth="1.5" />
    </svg>
  );
}
function IconMobile() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="2" width="10" height="16" rx="2" stroke="#111111" strokeWidth="1.5" />
      <circle cx="10" cy="15.5" r="1" fill="#111111" />
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
      <rect x="5" y="2" width="10" height="16" rx="2" stroke="#111111" strokeWidth="1.5" />
      <circle cx="10" cy="15.5" r="1" fill="#111111" />
    </svg>
  );
}
function IconTablet() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="#111111" strokeWidth="1.5" />
      <circle cx="16.5" cy="10" r="1" fill="#111111" />
    </svg>
  );
}
function IconDesktop() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="11" rx="1.5" stroke="#111111" strokeWidth="1.5" />
      <path d="M6 17h8M10 14v3" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
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
    iconBg: 'bg-[#f2f2f4]',
    Icon: IconMt5,
  },
  {
    id: 'web',
    tag: 'NO INSTALL',
    tagStyle: 'border border-accent text-accent',
    name: 'Web Trader',
    desc: 'Full MT5 power, runs in any browser. No download required.',
    ctaLabel: 'Open web trader',
    ctaStyle: 'bg-[#111111] text-white',
    cardBg: 'bg-[#FAFAF9] dark:bg-surface',
    nameColor: 'text-foreground',
    descColor: 'text-muted',
    iconBg: 'bg-white dark:bg-[#1c1c1c]',
    Icon: IconWeb,
  },
  {
    id: 'mobile',
    tag: 'iOS & ANDROID',
    tagStyle: 'border border-accent text-accent',
    name: 'Mobile App',
    desc: 'One-tap trading with FaceID. Push alerts for every move.',
    ctaLabel: 'Get the app',
    ctaStyle: 'bg-[#111111] text-white',
    cardBg: 'bg-[#FAFAF9] dark:bg-surface',
    nameColor: 'text-foreground',
    descColor: 'text-muted',
    iconBg: 'bg-white dark:bg-[#1c1c1c]',
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
  { label: 'Linux', Icon: IconDesktop },
  { label: 'Windows', Icon: IconDesktop },
];

export function PlatformPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">Platforms</SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            A platform that
            <br />
            moves with markets.
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            Trade the way you want — on the world&apos;s most trusted terminal, native mobile or
            web.
          </p>

          {/* Device mockup placeholder */}
          <div className="relative mt-6 h-[200px] overflow-hidden rounded-[24px] bg-[#f5f5f5] dark:bg-[#1c1c1c]">
            {/* Mobile mock */}
            <div className="absolute right-8 top-4 h-[170px] w-[90px] rounded-[16px] bg-[#d9d9d9]" />
            {/* Laptop mock */}
            <div className="absolute left-4 top-8 flex h-[140px] w-[180px] flex-col gap-1 rounded-[8px] bg-[#111111] p-2">
              <div className="h-2 w-full rounded bg-white/10" />
              <div className="flex-1 rounded bg-[#1a1a1a]" />
            </div>
          </div>
        </div>
      </section>

      {/* Terminal section */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">PICK YOUR TERMINAL</SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1]">
            Trade anywhere.
          </h2>

          <div className="flex flex-col gap-[14px]">
            {PLATFORM_CARDS.map((card) => (
              <div
                key={card.id}
                className={`flex flex-col gap-[18px] rounded-[22px] p-[22px] ${card.cardBg}`}
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
                    {card.name}
                  </p>
                  <p className={`font-body text-[13px] leading-[1.55] ${card.descColor}`}>
                    {card.desc}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register`}
                  className={`font-body flex h-[44px] items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80 ${card.ctaStyle}`}
                >
                  {card.ctaLabel}
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
      <section className="dark:bg-background gap-[14px] rounded-[32px] bg-white bg-gradient-to-b from-[#F8F8F7] to-[#FFFFFF] pb-[36px] pl-[20px] pr-[20px] pt-[40px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">WHAT&apos;S INSIDE</SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1]">
            Pro tools, made approachable.
          </h2>

          <div className="grid grid-cols-2 gap-[10px]">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="dark:bg-surface flex flex-col gap-3 rounded-[18px] bg-white p-4"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#a6a6a6]">
                  <tool.Icon />
                </div>
                <div>
                  <p className="text-foreground mb-[4px] font-sans text-[14px] font-semibold">
                    {tool.label}
                  </p>
                  <p className="font-body text-muted text-[11px] leading-snug">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works Everywhere */}
      <section className="bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white [&>span:last-child]:text-white">
            WORKS EVERYWHERE
          </SectionKicker>
          <h2 className="mb-7 font-sans text-[32px] font-semibold leading-[1.1] text-white">
            One login.
            <br />
            Every device.
          </h2>

          {/* Device grid */}
          <div className="mb-8 grid grid-cols-3 gap-[10px]">
            {DEVICES.map((dev) => (
              <div
                key={dev.label}
                className="flex flex-col items-center gap-2 rounded-[14px] bg-white py-4"
              >
                <dev.Icon />
                <span className="font-body text-foreground text-[11px] font-medium">
                  {dev.label}
                </span>
              </div>
            ))}
          </div>

          {/* Download CTA */}
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Download MetaTrader 5
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
      </section>
    </>
  );
}
