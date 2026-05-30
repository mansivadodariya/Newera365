'use client';

import { useState } from 'react';
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
      <section className="bg-background px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.1]">
            Economic
            <br />
            <span className="text-accent">calendar.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Stay market-leading news, ranked by impact. Filter by country and importance.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-background px-5 pb-3">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Impact filter */}
          <div className="mb-3 flex gap-2">
            {IMPACTS.map((imp) => (
              <button
                key={imp.id}
                onClick={() => setImpact(imp.id)}
                className={`font-body flex items-center gap-1.5 rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                  impact === imp.id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#f3f4f6] text-[#6b7280] dark:bg-[#1c1c1c] dark:text-[#9ca3af]'
                }`}
              >
                {imp.id !== 'ALL' && (
                  <span className={`h-1.5 w-1.5 rounded-full ${IMPACT_DOT[imp.id]}`} />
                )}
                {imp.label}
              </button>
            ))}
          </div>

          {/* Currency filter */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {CURRENCIES.map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`font-body flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-[6px] text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                  currency === cur
                    ? 'bg-accent/10 text-accent'
                    : 'bg-[#f3f4f6] text-[#6b7280] dark:bg-[#1c1c1c] dark:text-[#9ca3af]'
                }`}
              >
                {cur !== 'ALL' && <span>{CURRENCY_FLAG[cur]}</span>}
                {cur}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="bg-background pb-10">
        <div className="mx-auto max-w-[390px] px-5 md:max-w-2xl xl:max-w-[1200px]">
          {Object.keys(grouped).length === 0 ? (
            <p className="font-body text-muted py-12 text-center text-[14px]">
              No events match your filters.
            </p>
          ) : (
            Object.entries(grouped).map(([date, events]) => (
              <div key={date} className="mb-5">
                <p className="font-body mb-2 border-b border-[#e5e7eb] pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af] dark:border-[#2a2a2a]">
                  {date}
                </p>
                <div className="flex flex-col">
                  {events.map((ev, i) => (
                    <div
                      key={ev.id}
                      className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 py-3 ${
                        i < events.length - 1
                          ? 'border-b border-[#f3f4f6] dark:border-[#1c1c1c]'
                          : ''
                      }`}
                    >
                      {/* Time */}
                      <span className="font-body text-muted text-[11px]">{ev.time}</span>

                      {/* Event + currency */}
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">{CURRENCY_FLAG[ev.currency]}</span>
                        <span className="font-body text-foreground text-[13px]">{ev.event}</span>
                      </div>

                      {/* Impact dots */}
                      <div className="flex gap-[3px]">
                        {(['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
                          <span
                            key={level}
                            className={`h-2 w-2 rounded-full ${
                              ev.impact === 'HIGH'
                                ? IMPACT_DOT[level]
                                : ev.impact === 'MEDIUM' && level !== 'HIGH'
                                  ? IMPACT_DOT[level]
                                  : ev.impact === 'LOW' && level === 'LOW'
                                    ? IMPACT_DOT[level]
                                    : 'bg-[#e5e7eb] dark:bg-[#2a2a2a]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <p className="font-body text-muted mt-4 text-[11px] leading-relaxed">
            Data powered by third-party feed. NewEra365 is not responsible for accuracy or delays.
            All times are GMT.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            TRADE THE NEWS
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            A premium global trading platform built for the new era of markets.
          </h2>
          <a
            href="https://trade.newera365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent font-body hover:bg-accent/90 mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Start trading
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
