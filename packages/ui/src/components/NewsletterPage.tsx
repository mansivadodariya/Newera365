'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

interface NewsletterPageProps {
  initialState?: 'confirmed' | 'unsubscribed';
}

export function NewsletterPage({ initialState }: NewsletterPageProps = {}) {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, locale }),
        },
      );
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (initialState === 'confirmed' || initialState === 'unsubscribed') {
    const isConfirmed = initialState === 'confirmed';
    return (
      <section className="min-h-[60vh] px-5 py-20">
        <div className="mx-auto flex max-w-[390px] flex-col items-center text-center md:max-w-md">
          <div
            className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${isConfirmed ? 'bg-accent' : 'bg-[#f2f2f4] dark:bg-[#1a1c22]'}`}
          >
            {isConfirmed ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5L20 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#6b7280]"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <h1 className="text-foreground mb-3 font-sans text-[28px] font-semibold leading-[1.15]">
            {isConfirmed ? t('confirmedHeading') : t('unsubscribedHeading')}
          </h1>
          <p className="font-body text-muted mb-8 text-[14px] leading-relaxed">
            {isConfirmed ? t('confirmedDesc') : t('unsubscribedDesc')}
          </p>
          {isConfirmed ? (
            <a
              href={`/${locale}/newsletter`}
              className="font-body text-accent text-[13px] font-medium underline-offset-2 hover:underline"
            >
              {t('confirmedLink')}
            </a>
          ) : (
            <a
              href={`/${locale}/newsletter`}
              className="font-body text-accent text-[13px] font-medium underline-offset-2 hover:underline"
            >
              {t('resubscribeLink')}
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-10 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[44px] font-semibold leading-[1.05] xl:text-[64px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.6]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Subscribe form */}
      <section className="px-5 pb-8">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {submitted ? (
            <div className="bg-surface rounded-[20px] px-6 py-10 text-center">
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
              <h2 className="text-foreground mb-2 font-sans text-[22px] font-semibold">
                {t('successHeading')}
              </h2>
              <p className="font-body text-muted text-[13px] leading-relaxed">{t('successDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="nl-email"
                  className="font-body text-muted text-[11px] uppercase tracking-[0.12em]"
                >
                  {t('fieldEmailLabel')}
                </label>
                <input
                  id="nl-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('fieldEmailPlaceholder')}
                  className="font-body text-foreground focus:border-accent bg-surface placeholder:text-muted w-full rounded-[14px] px-4 py-[14px] text-[14px] outline-none"
                />
              </div>
              <span className="font-body text-muted text-[12px] leading-relaxed">
                {t('consentText')}
              </span>
              {error && <p className="font-body text-[12px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-accent font-body hover:bg-accent/90 flex w-full items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors disabled:opacity-60"
              >
                {t('subscribeBtn')}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="rtl:-scale-x-100"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <p className="font-body text-muted text-center text-[11px]">{t('privacyNote')}</p>
            </form>
          )}
        </div>
      </section>

      {/* What you get */}
      <section className="px-5 pb-8">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('whatKicker')}
          </SectionKicker>
          <div className="flex flex-col gap-[14px]">
            {[
              {
                key: 'thesis' as const,
                icon: (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="10" width="2" height="7" rx="1" fill="currentColor" />
                    <rect x="7" y="7" width="2" height="10" rx="1" fill="currentColor" />
                    <rect x="11" y="4" width="2" height="13" rx="1" fill="currentColor" />
                    <rect x="15" y="6" width="2" height="11" rx="1" fill="currentColor" />
                  </svg>
                ),
                title: t('item1Title'),
                desc: t('item1Desc'),
              },
              {
                key: 'setup',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 3l2 6h6l-5 3.5 2 6L10 15l-5 3.5 2-6L2 9h6z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
                title: t('item2Title'),
                desc: t('item2Desc'),
              },
              {
                key: 'education',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="14"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 7h6M7 10h6M7 13h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: t('item3Title'),
                desc: t('item3Desc'),
              },
              {
                key: 'events',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M10 7v3l2 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
                title: t('item4Title'),
                desc: t('item4Desc'),
              },
            ].map((item) => (
              <div key={item.key} className="flex items-start gap-4">
                <div className="text-accent bg-accent/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]">
                  {item.icon}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-foreground font-sans text-[14px] font-semibold">
                    {item.title}
                  </p>
                  <p className="font-body text-muted mt-[3px] text-[12px] leading-[1.5]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="rounded-t-[32px] bg-[#111111] px-5 pb-12 pt-10 xl:px-[80px]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            {t('socialKicker')}
          </SectionKicker>
          <p className="font-sans text-[38px] font-semibold leading-[1.1] text-white">
            {t('socialStat')}
          </p>
          <p className="mb-8 font-sans text-[24px] text-white/60">{t('socialSubtitle')}</p>

          <div className="rounded-[18px] bg-white/[0.06] p-5">
            <p className="font-body mb-4 text-[14px] leading-[1.7] text-white/80">
              {t('testimonialText')}
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 flex h-9 w-9 items-center justify-center rounded-full">
                <span className="text-accent font-sans text-[12px] font-semibold">MC</span>
              </div>
              <div>
                <p className="font-sans text-[13px] font-semibold text-white">
                  {t('testimonialAuthor')}
                </p>
                <p className="font-body text-[11px] text-white/40">{t('testimonialSince')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
