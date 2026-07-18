'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { AuthModal, AuthModalType } from '../chrome/AuthModal';

export interface WebinarItem {
  id: number;
  title: string;
  slug: string;
  speaker: string;
  speakerBio?: string | null;
  scheduledAt: string;
  timezone?: string | null;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  replayUrl?: string | null;
}

interface WebinarsSectionProps {
  webinars?: WebinarItem[];
}

const CMS_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001')
    : 'http://localhost:3001';

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

function dayOfMonth(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : String(d.getDate()).padStart(2, '0');
}

/**
 * Live countdown to a session start. Mounted-gated so SSR markup never
 * disagrees with the client clock; ticks every second under 24h, every
 * minute above it.
 */
function useCountdown(iso: string) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const target = new Date(iso).getTime();
    const tick = () => setNow(Date.now());
    const under24h = target - Date.now() < 24 * 60 * 60 * 1000;
    const interval = setInterval(tick, under24h ? 1000 : 60_000);
    return () => clearInterval(interval);
  }, [iso]);

  if (now === null) return null;
  const diff = new Date(iso).getTime() - now;
  if (Number.isNaN(diff) || diff <= 0) return { past: true as const };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { past: false as const, days, hours, minutes, seconds };
}

function CountdownChip({ iso }: { iso: string }) {
  const t = useTranslations('webinars');
  const cd = useCountdown(iso);
  if (!cd || cd.past) return null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const value =
    cd.days > 0
      ? t('countdownDaysHours', { days: cd.days, hours: cd.hours })
      : `${pad(cd.hours)}:${pad(cd.minutes)}:${pad(cd.seconds)}`;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.09] px-3 py-[5px] backdrop-blur">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/[0.6]">
        {t('startsIn')}
      </span>
      {/* No dir override: the AR variant contains Arabic unit letters, which a
          forced LTR context would visually scramble. Digit-only values keep
          their order in both directions on their own. */}
      <span className="text-accent-bright font-mono text-[13px] font-semibold tabular-nums">
        {value}
      </span>
    </span>
  );
}

function RegisterModal({ webinar, onClose }: { webinar: WebinarItem; onClose: () => void }) {
  const t = useTranslations('webinars');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${CMS_URL}/api/webinars/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webinarId: webinar.id, name, email, locale }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: { message?: string }[];
        };
        setError(data.errors?.[0]?.message ?? data.error ?? t('registerError'));
      }
    } catch {
      setError(t('registerError'));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'font-body w-full rounded-[12px] border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-[15px] text-white placeholder:text-white/[0.35] outline-none transition-colors';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('registerTitle')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-[2px] md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="motion-safe:animate-rise-in relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#0A130E] p-6 shadow-[0_28px_56px_-28px_rgba(4,16,10,0.85)] ring-1 ring-inset ring-white/[0.06] md:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="hover:border-accent-bright/50 absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white/[0.7] transition-colors hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {done ? (
          <div className="py-4 text-center">
            <div className="bg-accent mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12l5 5L20 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-title mb-2 font-sans text-white">{t('registerSuccess')}</h3>
            <p className="font-body text-[15px] leading-relaxed text-white/[0.72]">
              {t('registerSuccessDesc')}
            </p>
            <button
              onClick={onClose}
              className="bg-accent font-body mt-6 rounded-full px-7 py-3 text-[14px] font-medium text-white transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-eyebrow text-accent font-mono uppercase">{t('statusUpcoming')}</p>
            <h3 className="text-title mt-2 font-sans leading-snug text-white">
              {t('registerTitle')}
            </h3>
            <p className="font-body mt-1 text-[15px] text-white/[0.72]">{webinar.title}</p>
            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/[0.55]">
                  {t('nameLabel')}
                </span>
                <input
                  type="text"
                  required
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/[0.55]">
                  {t('emailLabel')}
                </span>
                <input
                  type="email"
                  required
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </label>
              {error && (
                <p role="alert" className="font-body text-caption text-red-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-accent font-body mt-1 rounded-full py-3.5 text-[15px] font-medium text-white transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? '…' : t('registerBtn')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/** Ink-art session card: house plate, green-black scrim, the date as a ghost numeral. */
function UpcomingCard({
  webinar,
  index,
  onRegister,
}: {
  webinar: WebinarItem;
  index: number;
  onRegister: () => void;
}) {
  const t = useTranslations('webinars');
  const locale = useLocale();
  const isLive = webinar.status === 'live';
  const ghostDay = dayOfMonth(webinar.scheduledAt);

  return (
    <article className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/edge-flow.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.55]"
        style={{ objectPosition: `${30 + (index % 3) * 20}% ${20 + (index % 2) * 18}%` }}
        loading="lazy"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.92] via-[#03130B]/[0.38] to-[#03130B]/[0.12]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/[0.06]"
      />
      {ghostDay && (
        <span
          aria-hidden="true"
          dir="ltr"
          className="text-accent-bright/[0.22] absolute -top-6 end-4 select-none font-sans text-[96px] font-semibold tabular-nums leading-none tracking-tight"
        >
          {ghostDay}
        </span>
      )}

      <div className="relative flex flex-col items-start gap-4 p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/[0.35] bg-red-500/[0.18] px-3 py-[5px] backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-red-300">
                {t('statusLive')}
              </span>
            </span>
          ) : (
            <>
              <span className="text-accent-bright inline-flex items-center rounded-full border border-white/[0.14] bg-white/[0.09] px-3 py-[5px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur">
                {t('statusUpcoming')}
              </span>
              <CountdownChip iso={webinar.scheduledAt} />
            </>
          )}
        </div>

        <div>
          <h2 className="text-title max-w-[26ch] font-sans leading-snug text-white">
            {webinar.title}
          </h2>
          <p className="font-body mt-2 text-[15px] text-white/[0.72]">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/[0.5]">
              {t('hostLabel')}
            </span>{' '}
            {webinar.speaker}
            {webinar.speakerBio && (
              <span className="text-white/[0.55]"> · {webinar.speakerBio}</span>
            )}
          </p>
          <p className="font-body text-caption mt-1 text-white/[0.6]">
            {formatDate(webinar.scheduledAt, locale)}
            {webinar.timezone && ` (${webinar.timezone})`}
          </p>
        </div>

        <button
          onClick={onRegister}
          className="bg-accent font-body rounded-full px-6 py-2.5 text-[14px] font-medium text-white transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          {t('registerBtn')}
        </button>
      </div>
    </article>
  );
}

/** Editorial replay ledger row: ink thumbnail, hairline rules, mono metadata. */
function ReplayRow({ webinar, index }: { webinar: WebinarItem; index: number }) {
  const t = useTranslations('webinars');
  const locale = useLocale();

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 py-4 md:grid-cols-[auto_1fr_auto] md:gap-x-5">
      <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#0A130E]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/edge-flow.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          style={{ objectPosition: `${25 + (index % 4) * 18}% ${30 + (index % 3) * 12}%` }}
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.25] bg-white/[0.12] backdrop-blur">
            <svg
              width="9"
              height="10"
              viewBox="0 0 9 10"
              fill="none"
              aria-hidden="true"
              className="ms-[2px] rtl:-scale-x-100"
            >
              <path d="M0.5 0.8v8.4L8.3 5 0.5 0.8z" fill="white" />
            </svg>
          </span>
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-foreground font-sans text-[16px] font-semibold leading-snug md:truncate md:text-[17px]">
          {webinar.title}
        </p>
        <p className="font-body text-muted text-caption mt-0.5 md:truncate">
          {webinar.speaker} · {formatDate(webinar.scheduledAt, locale)}
        </p>
      </div>

      <div className="col-start-2 md:col-auto">
        {webinar.replayUrl ? (
          <a
            href={webinar.replayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-accent link-underline inline-flex items-center gap-1.5 text-[14px] font-medium"
          >
            {t('watchReplay')}
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        ) : (
          <span className="text-muted font-mono text-[11px] uppercase tracking-[0.08em]">
            {t('replaySoon')}
          </span>
        )}
      </div>
    </div>
  );
}

export function WebinarsSection({ webinars = [] }: WebinarsSectionProps) {
  const t = useTranslations('webinars');
  const [selected, setSelected] = useState<WebinarItem | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  const upcoming = webinars.filter((w) => w.status === 'upcoming' || w.status === 'live');
  const past = webinars.filter((w) => w.status === 'completed');

  return (
    <>
      {/* Upcoming: ink-art session cards */}
      {upcoming.length > 0 && (
        <section className="px-5 pb-10">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-5">{t('upcomingKicker')}</SectionKicker>
            <div className={`grid gap-5 ${upcoming.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {upcoming.map((w, i) => (
                <UpcomingCard key={w.id} webinar={w} index={i} onRegister={() => setSelected(w)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past: editorial replay ledger */}
      {past.length > 0 && (
        <section className="px-5 pb-12">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-3">{t('pastKicker')}</SectionKicker>
            <div className="divide-border border-border divide-y border-y">
              {past.map((w, i) => (
                <ReplayRow key={w.id} webinar={w} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {webinars.length === 0 && (
        <section className="px-5 pb-16">
          <div className="mx-auto max-w-[390px] text-center md:max-w-2xl xl:max-w-[1200px]">
            <p className="font-body text-muted py-14 text-[15px]">{t('noWebinars')}</p>
            <button
              onClick={() => setAuthModal('register')}
              className="bg-accent font-body inline-flex h-[50px] items-center gap-2 rounded-full px-7 text-[14px] font-medium text-white transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              {t('notifyMe')}
            </button>
          </div>
        </section>
      )}

      {selected && <RegisterModal webinar={selected} onClose={() => setSelected(null)} />}
      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
