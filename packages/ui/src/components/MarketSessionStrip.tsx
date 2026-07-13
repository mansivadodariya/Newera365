'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

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

/** Live UTC clock readout. Mounted-gated so SSR and first client render agree,
    then ticks every second: the one number every session on the strip obeys. */
function UtcClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setTime(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-border inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 dark:border-white/10 dark:bg-[#111]">
      <span aria-hidden="true" className="bg-accent h-2 w-2 flex-shrink-0 rounded-full" />
      <span
        dir="ltr"
        className="text-foreground font-mono text-[12px] tabular-nums tracking-[0.06em]"
      >
        {time ?? '--:--:--'}
      </span>
      <span className="text-muted font-mono text-[11px] uppercase tracking-[0.04em]">UTC</span>
    </div>
  );
}

/** A row of the four major FX sessions with a live open/closed dot. Time is read
    client-side in an effect so SSR and the first client render match (status
    stays null until mount), then it refreshes each minute. Static styling only. */
export function MarketSessionStrip({ showClock = false }: { showClock?: boolean }) {
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
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label={t('sessionsLabel')}>
      {showClock && <UtcClock />}
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
