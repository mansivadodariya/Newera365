'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { AuthModal, AuthModalType } from './AuthModal';

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

function RegisterModal({ webinar, onClose }: { webinar: WebinarItem; onClose: () => void }) {
  const t = useTranslations('webinars');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

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
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? t('registerError'));
      }
    } catch {
      setError(t('registerError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface w-full max-w-md rounded-[24px] p-6">
        {done ? (
          <div className="py-4 text-center">
            <div className="bg-accent mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5L20 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-foreground mb-2 font-sans text-[20px] font-semibold">
              {t('registerSuccess')}
            </h3>
            <p className="font-body text-muted text-[13px]">{t('registerSuccessDesc')}</p>
            <button
              onClick={onClose}
              className="bg-accent font-body mt-6 rounded-full px-6 py-3 text-[14px] font-medium text-white"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-foreground mb-1 font-sans text-[18px] font-semibold">
              {t('registerTitle')}
            </h3>
            <p className="font-body text-muted mb-5 text-[13px]">{webinar.title}</p>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-body text-foreground bg-surface focus:border-accent rounded-[12px] border border-[#e5e7eb] px-4 py-3 text-[14px] outline-none dark:border-[#2a2d36]"
              />
              <input
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-body text-foreground bg-surface focus:border-accent rounded-[12px] border border-[#e5e7eb] px-4 py-3 text-[14px] outline-none dark:border-[#2a2d36]"
              />
              {error && <p className="font-body text-[12px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-accent font-body hover:bg-accent/90 mt-1 rounded-full py-3 text-[14px] font-medium text-white disabled:opacity-60"
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

const STATUS_BADGE: Record<WebinarItem['status'], string> = {
  upcoming: 'bg-[#00b050]/10 text-[#00b050]',
  live: 'bg-red-500/10 text-red-500',
  completed: 'bg-[#6b7280]/10 text-[#6b7280]',
  cancelled: 'bg-[#6b7280]/10 text-[#6b7280]',
};

export function WebinarsSection({ webinars = [] }: WebinarsSectionProps) {
  const t = useTranslations('webinars');
  const locale = useLocale();
  const [selected, setSelected] = useState<WebinarItem | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  const upcoming = webinars.filter((w) => w.status === 'upcoming' || w.status === 'live');
  const past = webinars.filter((w) => w.status === 'completed');

  return (
    <>
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="px-5 pb-8">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
              {t('upcomingKicker')}
            </SectionKicker>
            <div className="flex flex-col gap-4">
              {upcoming.map((w) => (
                <div
                  key={w.id}
                  className="bg-surface flex flex-col gap-4 rounded-[20px] border border-transparent p-5 transition-colors duration-200 hover:border-accent/40 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`font-body rounded-full px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] ${STATUS_BADGE[w.status]}`}
                      >
                        {w.status === 'live' ? t('statusLive') : t('statusUpcoming')}
                      </span>
                    </div>
                    <h2 className="text-foreground mb-1 font-sans text-[17px] font-semibold leading-[1.3]">
                      {w.title}
                    </h2>
                    <p className="font-body text-muted text-[13px]">
                      {w.speaker}
                      {w.speakerBio && ` · ${w.speakerBio}`}
                    </p>
                    <p className="font-body text-muted mt-1 text-[12px]">
                      {formatDate(w.scheduledAt, locale)}
                      {w.timezone && ` (${w.timezone})`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(w)}
                    className="bg-accent font-body hover:bg-accent/90 flex-shrink-0 rounded-full px-5 py-2.5 text-[13px] font-medium text-white transition-colors"
                  >
                    {t('registerBtn')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past / Replay */}
      {past.length > 0 && (
        <section className="px-5 pb-10">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
              {t('pastKicker')}
            </SectionKicker>
            <div className="flex flex-col gap-3">
              {past.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-[16px] border border-transparent bg-[#F0F4F1] px-4 py-3 transition-colors duration-200 hover:border-accent/40 dark:bg-[#16181d]"
                >
                  <div>
                    <p className="text-foreground font-sans text-[14px] font-semibold">{w.title}</p>
                    <p className="font-body text-muted text-[12px]">
                      {w.speaker} · {formatDate(w.scheduledAt, locale)}
                    </p>
                  </div>
                  {w.replayUrl ? (
                    <a
                      href={w.replayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-accent flex-shrink-0 text-[13px] font-medium hover:underline"
                    >
                      {t('watchReplay')}
                    </a>
                  ) : (
                    <span className="font-body text-muted flex-shrink-0 text-[12px]">
                      {t('replaySoon')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {webinars.length === 0 && (
        <section className="px-5 pb-16">
          <div className="mx-auto max-w-[390px] text-center md:max-w-2xl xl:max-w-[1200px]">
            <p className="font-body text-muted py-16 text-[14px]">{t('noWebinars')}</p>
            <button
              onClick={() => setAuthModal('register')}
              className="bg-accent font-body hover:bg-accent/90 inline-flex h-[50px] items-center gap-2 rounded-full px-7 text-[14px] font-medium text-white transition-colors"
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
