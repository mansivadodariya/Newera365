'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export function NewsletterPage() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-10 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
      <section className="bg-background px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
              <p className="font-body text-muted text-[13px] leading-relaxed">
                {t('successDesc')}
              </p>
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
              <button
                type="submit"
                className="bg-accent font-body hover:bg-accent/90 flex w-full items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
              >
                {t('subscribeBtn')}
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="font-body text-muted text-center text-[11px]">
                {t('privacyNote')}
              </p>
            </form>
          )}
        </div>
      </section>

      {/* What you get */}
      <section className="bg-background px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                    <path d="M10 3l2 6h6l-5 3.5 2 6L10 15l-5 3.5 2-6L2 9h6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                title: t('item2Title'),
                desc: t('item2Desc'),
              },
              {
                key: 'education',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
                    <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                  <p className="text-foreground font-sans text-[14px] font-semibold">{item.title}</p>
                  <p className="font-body text-muted mt-[3px] text-[12px] leading-[1.5]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="rounded-t-[32px] bg-[#111111] px-5 pb-12 pt-10 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                <p className="font-sans text-[13px] font-semibold text-white">{t('testimonialAuthor')}</p>
                <p className="font-body text-[11px] text-white/40">{t('testimonialSince')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
