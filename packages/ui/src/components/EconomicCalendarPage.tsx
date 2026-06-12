'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Impact = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Currency = 'ALL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

const IMPACT_DOT: Record<string, string> = {
  HIGH: 'bg-[#EF4444]',
  MEDIUM: 'bg-[#F59E0B]',
  LOW: 'bg-[#9ca3af]',
};

const EVENTS = [
  {
    id: '1',
    date: 'Mon, 26 May',
    time: '08:30',
    currency: 'USD' as Currency,
    event: 'Non-Farm Payrolls',
    impact: 'HIGH' as const,
  },
  {
    id: '2',
    date: 'Mon, 26 May',
    time: '10:00',
    currency: 'EUR' as Currency,
    event: 'ECB Rate Decision',
    impact: 'HIGH' as const,
  },
  {
    id: '3',
    date: 'Mon, 26 May',
    time: '14:00',
    currency: 'GBP' as Currency,
    event: 'UK GDP MoM',
    impact: 'MEDIUM' as const,
  },
  {
    id: '4',
    date: 'Mon, 26 May',
    time: '15:00',
    currency: 'USD' as Currency,
    event: 'ISM Manufacturing PMI',
    impact: 'MEDIUM' as const,
  },
  {
    id: '5',
    date: 'Mon, 26 May',
    time: '22:00',
    currency: 'JPY' as Currency,
    event: 'BoJ Meeting Minutes',
    impact: 'LOW' as const,
  },
  {
    id: '6',
    date: 'Tue, 27 May',
    time: '03:30',
    currency: 'AUD' as Currency,
    event: 'RBA Rate Statement',
    impact: 'HIGH' as const,
  },
  {
    id: '7',
    date: 'Tue, 27 May',
    time: '09:00',
    currency: 'EUR' as Currency,
    event: 'Eurozone CPI YoY',
    impact: 'HIGH' as const,
  },
  {
    id: '8',
    date: 'Tue, 27 May',
    time: '12:30',
    currency: 'USD' as Currency,
    event: 'US Retail Sales MoM',
    impact: 'MEDIUM' as const,
  },
  {
    id: '9',
    date: 'Tue, 27 May',
    time: '14:30',
    currency: 'GBP' as Currency,
    event: 'BoE Gov Bailey Speech',
    impact: 'MEDIUM' as const,
  },
  {
    id: '10',
    date: 'Tue, 27 May',
    time: '16:00',
    currency: 'USD' as Currency,
    event: 'FOMC Member Waller Speech',
    impact: 'LOW' as const,
  },
  {
    id: '11',
    date: 'Wed, 28 May',
    time: '08:00',
    currency: 'GBP' as Currency,
    event: 'UK CPI YoY',
    impact: 'HIGH' as const,
  },
  {
    id: '12',
    date: 'Wed, 28 May',
    time: '13:30',
    currency: 'USD' as Currency,
    event: 'US GDP Preliminary QoQ',
    impact: 'HIGH' as const,
  },
  {
    id: '13',
    date: 'Wed, 28 May',
    time: '15:00',
    currency: 'USD' as Currency,
    event: 'CB Consumer Confidence',
    impact: 'MEDIUM' as const,
  },
  {
    id: '14',
    date: 'Thu, 29 May',
    time: '12:30',
    currency: 'USD' as Currency,
    event: 'Initial Jobless Claims',
    impact: 'MEDIUM' as const,
  },
  {
    id: '15',
    date: 'Fri, 30 May',
    time: '13:30',
    currency: 'USD' as Currency,
    event: 'Core PCE Price Index MoM',
    impact: 'HIGH' as const,
  },
];

const CURRENCIES: Currency[] = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'];
const IMPACTS: { id: Impact; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'HIGH', label: 'High' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'LOW', label: 'Low' },
];

const CURRENCY_FLAG: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
};

export function EconomicCalendarPage() {
  const t = useTranslations('calendar');
  const [impact, setImpact] = useState<Impact>('ALL');
  const [currency, setCurrency] = useState<Currency>('ALL');

  const filtered = EVENTS.filter((e) => {
    const impactMatch = impact === 'ALL' || e.impact === impact;
    const currencyMatch = currency === 'ALL' || e.currency === currency;
    return impactMatch && currencyMatch;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date]!.push(ev);
    return acc;
  }, {});

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[38px] font-semibold leading-[1.06] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            {t('heroAccent')}
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Filters — card */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex flex-col gap-[14px] rounded-[20px] bg-[#fafaf9] p-4 dark:bg-[#16181d]">
            {/* Importance */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[9px] tracking-[1.35px] text-[#6b7280]">IMPORTANCE</p>
              <div className="flex flex-wrap gap-2">
                {IMPACTS.map((imp) => (
                  <button
                    key={imp.id}
                    onClick={() => setImpact(imp.id)}
                    className={`font-body flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors ${
                      impact === imp.id
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                        : 'bg-[#f2f2f4] text-[#6b7280] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e] dark:hover:text-white/80'
                    }`}
                  >
                    {imp.id === 'ALL'
                      ? t('filterAll')
                      : imp.id === 'HIGH'
                        ? t('filterHigh')
                        : imp.id === 'MEDIUM'
                          ? t('filterMedium')
                          : t('filterLow')}
                  </button>
                ))}
              </div>
            </div>
            {/* Currency */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[9px] tracking-[1.35px] text-[#6b7280]">CURRENCY</p>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`font-body flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors ${
                      currency === cur
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                        : 'bg-[#f2f2f4] text-[#6b7280] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e] dark:hover:text-white/80'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="pb-10">
        <div className="mx-auto max-w-[390px] px-5 md:max-w-2xl xl:max-w-[1200px]">
          {/* Desktop table header */}
          <div className="mb-1 hidden xl:grid xl:grid-cols-[80px_40px_80px_1fr_90px_90px_90px_60px] xl:gap-4 xl:border-b xl:border-[#e5e7eb] xl:pb-2 dark:xl:border-[#2a2a2a]">
            {[
              t('colTime'),
              t('colFlag'),
              t('colCurrency'),
              t('colEvent'),
              t('colPrev'),
              t('colForecast'),
              t('colActual'),
              t('colImpact'),
            ].map((h) => (
              <span
                key={h}
                className="font-body text-muted text-[9px] font-semibold uppercase tracking-[0.1em]"
              >
                {h}
              </span>
            ))}
          </div>

          {Object.keys(grouped).length === 0 ? (
            <p className="font-body text-muted py-12 text-center text-[14px]">{t('noEvents')}</p>
          ) : (
            Object.entries(grouped).map(([date, events], gi) => (
              <div key={date} className="mb-4">
                {/* Date kicker + LIVE indicator */}
                <div className="mb-3 flex items-center justify-between">
                  <SectionKicker className="[&>span:first-child]:bg-muted text-muted">
                    {date.toUpperCase()}
                  </SectionKicker>
                  {gi === 0 && (
                    <div className="flex items-center gap-[6px]">
                      <span className="bg-accent h-[6px] w-[6px] rounded-full" />
                      <span className="text-accent font-mono text-[10px] tracking-[1px]">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Events */}
                <div className="rounded-[20px] border border-[#f0f0ee] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/[0.06] dark:bg-[#1a1c22] dark:shadow-none">
                  {events.map((ev, i) => (
                    <div
                      key={ev.id}
                      className={`flex flex-col gap-2 p-[14px] ${i < events.length - 1 ? 'border-b border-[#f0f0ee] dark:border-white/[0.07]' : ''}`}
                    >
                      {/* Top row: time | flag+currency | event | dots */}
                      <div className="flex items-center gap-[10px]">
                        <span className="w-[44px] flex-shrink-0 font-mono text-[12px] font-medium text-[#111] dark:text-white">
                          {ev.time}
                        </span>
                        <div className="flex flex-shrink-0 items-center gap-[5px]">
                          <span className="text-[14px]">{CURRENCY_FLAG[ev.currency]}</span>
                          <span className="font-mono text-[11px] text-[#6b7280]">
                            {ev.currency}
                          </span>
                        </div>
                        <span className="font-body min-w-0 flex-1 text-[13px] font-medium text-[#111] dark:text-white">
                          {ev.event}
                        </span>
                        {/* Impact dots */}
                        <div className="flex flex-shrink-0 gap-[3px]">
                          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
                            <span
                              key={level}
                              className={`h-[6px] w-[6px] rounded-full ${
                                ev.impact === 'HIGH'
                                  ? IMPACT_DOT[level]
                                  : ev.impact === 'MEDIUM' && level !== 'HIGH'
                                    ? IMPACT_DOT[level]
                                    : ev.impact === 'LOW' && level === 'LOW'
                                      ? IMPACT_DOT[level]
                                      : 'bg-[#e5e7eb] dark:bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {/* Bottom row: PREV / FCST / ACT */}
                      <div className="flex items-center justify-between">
                        {[
                          { label: 'PREV', value: '—' },
                          { label: 'FCST', value: '—' },
                          { label: 'ACT', value: '—' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-[6px]">
                            <span className="font-mono text-[9px] tracking-[1.08px] text-[#6b7280]">
                              {label}
                            </span>
                            <span className="font-mono text-[11px] text-[#111] dark:text-white">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <p className="font-body text-muted mt-4 text-[11px] leading-relaxed">{t('dataNote')}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <p className="font-body mb-7 text-[14px] text-white/60">{t('ctaDesc')}</p>
          <a
            href="https://trade.newera365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent font-body hover:bg-accent/90 mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            {t('ctaBtn')}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
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
