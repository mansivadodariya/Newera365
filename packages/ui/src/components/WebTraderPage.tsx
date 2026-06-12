'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { TradingViewWidget } from './TradingViewWidget';

type Timeframe = 'M5' | 'M15' | 'H1' | 'D1';
const TIMEFRAMES: Timeframe[] = ['M5', 'M15', 'H1', 'D1'];

const FEATURES = [
  { idx: 2, icon: 'stream' },
  { idx: 3, icon: 'mt5' },
  { idx: 4, icon: 'lock' },
] as const;

function CheckCircle() {
  return (
    <span className="bg-accent flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 6l3 3 5-5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function WebTraderPage() {
  const locale = useLocale();
  const t = useTranslations('webtrader');
  const [tf, setTf] = useState<Timeframe>('H1');

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:last-child]:font-body mb-2 [&>span:first-child]:hidden [&>span:last-child]:text-[11px] [&>span:last-child]:font-semibold [&>span:last-child]:uppercase [&>span:last-child]:leading-[100%] [&>span:last-child]:tracking-[0.08em] [&>span:last-child]:text-[#1AD966]">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[44px] font-semibold leading-[1.05] tracking-[-1.54px]">
            {t('heading')}
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* ── Trading Terminal Panel ─────────────────────────────────── */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111111]">
            {/* Ticker bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1AD966]" />
                <span className="font-sans text-[13px] font-semibold text-white">EUR / USD</span>
                <span className="font-body text-[10px] text-white/40">Live</span>
              </div>
              <div className="flex gap-[2px]">
                {TIMEFRAMES.map((t_) => (
                  <button
                    key={t_}
                    onClick={() => setTf(t_)}
                    className={`rounded-[6px] px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                      tf === t_ ? 'bg-[#1AD966] text-[#111]' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {t_}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart — hide_top_toolbar:false shows live price in TradingView's native header */}
            <div style={{ height: 320 }}>
              <TradingViewWidget
                type="advanced-chart"
                symbol="OANDA:EURUSD"
                theme="dark"
                width="100%"
                height="100%"
                config={{
                  hide_top_toolbar: false,
                  hide_side_toolbar: true,
                  save_image: false,
                  allow_symbol_change: false,
                  interval: tf === 'M5' ? '5' : tf === 'M15' ? '15' : tf === 'H1' ? '60' : 'D',
                  toolbar_bg: '#111111',
                }}
              />
            </div>

            {/* Live symbol info + Volume */}
            <div className="border-t border-white/[0.08]">
              <div style={{ height: 120 }}>
                <TradingViewWidget
                  type="symbol-info"
                  symbol="OANDA:EURUSD"
                  theme="dark"
                  width="100%"
                  height="100%"
                  config={{ isTransparent: true }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-2">
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">
                {t('poweredBy')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fallback Card ─────────────────────────────────────────── */}
      <section className="px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[18px] border border-[#F97316]/20 bg-[#FFF7ED] p-5 dark:border-[#F97316]/15 dark:bg-[#1a130a]">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#F97316]/15">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 6v3M8 11v.5"
                    stroke="#F97316"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.8 2.5L1.5 12a1.4 1.4 0 001.2 2h10.6a1.4 1.4 0 001.2-2L9.2 2.5a1.4 1.4 0 00-2.4 0z"
                    stroke="#F97316"
                    strokeWidth="1.3"
                  />
                </svg>
              </span>
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#F97316]">
                FALLBACK STATE
              </span>
            </div>
            <p className="mb-1 font-sans text-[15px] font-semibold text-[#111] dark:text-white">
              {t('fallbackHeading')}
            </p>
            <p className="font-body mb-4 text-[12px] leading-[1.55] text-[#6b7280] dark:text-white/60">
              {t('fallbackDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/platform/mt5`}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#111] px-4 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#222] dark:bg-white/10 dark:hover:bg-white/20"
              >
                {t('fallbackDesktopBtn')}
              </Link>
              <Link
                href={`/${locale}/platform/mobile`}
                className="hover:text-accent dark:hover:text-accent inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[12px] font-medium text-[#111] transition-colors dark:text-white/70"
              >
                {t('fallbackMobileBtn')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="text-foreground mb-6 font-sans text-[32px] font-semibold leading-[1.1]">
            {t('feat1Title')}
            <br />
            <span className="text-accent">{t('feat1Sub')}</span>
          </h2>
          <div className="flex flex-col gap-[10px]">
            {FEATURES.map((feat) => (
              <div
                key={feat.idx}
                className="flex items-start gap-3 rounded-[16px] bg-[#FAFAF9] px-4 py-4 dark:bg-[#16181d]"
              >
                <CheckCircle />
                <div>
                  <p className="text-foreground mb-0.5 font-sans text-[14px] font-semibold">
                    {t(`feat${feat.idx}Title` as 'feat2Title')}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-relaxed">
                    {t(`feat${feat.idx}Desc` as 'feat2Desc')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Launch CTA ────────────────────────────────────────────── */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <Link
            href={`/${locale}/register`}
            className="bg-accent flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-sans text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(0,176,80,0.35)] transition-all duration-200 hover:bg-[#00c85a] hover:shadow-[0_12px_32px_rgba(0,176,80,0.45)] active:scale-[0.98]"
          >
            {t('ctaBtn')}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
