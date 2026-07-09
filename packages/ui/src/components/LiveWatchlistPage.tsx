'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';
import { MARKET_OVERVIEW_CONFIG } from './marketOverviewConfig';

// Standard forex session windows in UTC hours (start inclusive, end exclusive).
// Sydney wraps past midnight, so its window is handled by the wrap branch below.
const SESSIONS = [
  { key: 'Sydney', start: 22, end: 7 },
  { key: 'Tokyo', start: 0, end: 9 },
  { key: 'London', start: 8, end: 17 },
  { key: 'NewYork', start: 13, end: 22 },
] as const;

function sessionOpen(hour: number, day: number, start: number, end: number): boolean {
  // The FX week is closed from Fri 22:00 UTC through Sun ~21:00 UTC.
  const weekendClosed = day === 6 || (day === 0 && hour < 21);
  if (weekendClosed) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

/** A row of the four major FX sessions with a live open/closed dot. Time is read
    client-side in an effect so SSR and the first client render match (status
    stays null until mount), then it refreshes each minute. Static styling only. */
function MarketSessionStrip() {
  const t = useTranslations('watchlist');
  const [now, setNow] = useState<{ hour: number; day: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow({ hour: d.getUTCHours(), day: d.getUTCDay() });
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label={t('sessionsLabel')}>
      {SESSIONS.map((s) => {
        const open = now ? sessionOpen(now.hour, now.day, s.start, s.end) : null;
        return (
          <div
            key={s.key}
            role="listitem"
            className="border-border inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 dark:border-white/10 dark:bg-[#111]"
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                open === null ? 'bg-foreground/20' : open ? 'bg-accent' : 'bg-foreground/20'
              }`}
            />
            <span className="text-foreground font-mono text-[12px] uppercase tracking-[0.06em]">
              {t(`session${s.key}` as 'sessionSydney')}
            </span>
            {open !== null && (
              <span className="text-muted font-mono text-[11px] uppercase tracking-[0.04em]">
                {open ? t('sessionOpen') : t('sessionClosed')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LiveWatchlistPage() {
  const t = useTranslations('watchlist');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground text-display mb-3 font-sans">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted text-body max-w-[320px]">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Global sessions — live open/closed, computed client-side from UTC */}
      <section className="px-5 pb-4">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <MarketSessionStrip />
        </div>
      </section>

      {/* TradingView market-overview widget — handles tabs natively */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="h-[500px] overflow-hidden rounded-[22px] bg-black md:h-[600px] xl:h-[660px] xl:rounded-[28px]">
            <ChartWidget
              type="market-overview"
              theme="dark"
              width="100%"
              height="100%"
              config={MARKET_OVERVIEW_CONFIG}
            />
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">{t('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}
