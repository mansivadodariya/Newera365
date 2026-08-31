'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { CountUp } from '../motion/CountUp';

export interface NewsletterPageProps {
  initialState?: 'confirmed' | 'unsubscribed';
  dayName?: string | null;
  leadHeadline?: string | null;
  fxHead?: string | null;
  cmdHead?: string | null;
  macroHead?: string | null;
  teasers?: { label: string; head: string }[] | null;
}

export function NewsletterPage({
  initialState,
  dayName,
  leadHeadline,
  fxHead,
  cmdHead,
  macroHead,
  teasers,
}: NewsletterPageProps = {}) {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const computedDayName =
    dayName ||
    new Intl.DateTimeFormat(isAr ? 'ar-AE' : 'en-US', { weekday: 'long' }).format(new Date());

  const heroLine1 = isAr ? `نشرة يوم ${computedDayName}` : `The ${computedDayName}`;
  const formEyebrow = isAr
    ? `احصل على عدد يوم ${computedDayName}`
    : `Get this ${computedDayName}'s issue`;
  const masthead = isAr ? `نشرة ${computedDayName} الموجزة` : `The ${computedDayName} Briefing`;
  const issueMeta = isAr
    ? `العدد 118 · ${computedDayName} 7:00 ص · 5 دقائق قراءة`
    : `ISSUE 118 · ${computedDayName.toUpperCase()} 7:00AM · 5 MIN READ`;

  const activeTeasers =
    teasers && teasers.length > 0
      ? teasers
      : [
          { label: t('teaser1Label'), head: fxHead ?? t('teaser1Head') },
          { label: t('teaser2Label'), head: cmdHead ?? t('teaser2Head') },
          { label: t('teaser3Label'), head: macroHead ?? t('teaser3Head') },
        ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
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
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  // Post-action confirmation / unsubscribe screens
  if (initialState === 'confirmed' || initialState === 'unsubscribed') {
    const isConfirmed = initialState === 'confirmed';
    return (
      <section className="px-5 py-20 md:py-28">
        <ScrollReveal className="mx-auto w-full max-w-[420px]">
          <div className="border-border bg-surface shadow-card rounded-[24px] border px-6 py-10 text-center md:px-8">
            <p className="text-eyebrow text-accent mb-6 font-mono font-medium uppercase">
              {masthead}
            </p>
            <div
              className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
                isConfirmed ? 'bg-accent' : 'bg-section text-muted'
              }`}
            >
              {isConfirmed ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                  aria-hidden="true"
                  className="text-muted"
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
            <h1 className="text-foreground text-headline mb-3 font-sans">
              {isConfirmed ? t('confirmedHeading') : t('unsubscribedHeading')}
            </h1>
            <p className="font-body text-muted text-body mb-8">
              {isConfirmed ? t('confirmedDesc') : t('unsubscribedDesc')}
            </p>
            <a
              href={`/${locale}/newsletter`}
              className="text-accent font-body link-underline text-caption font-medium"
            >
              {isConfirmed ? t('confirmedLink') : t('resubscribeLink')}
            </a>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  // The issue's table of contents (reuses the four "what you get" keys)
  const contents = [
    { i: '01', label: t('teaser1Label'), title: t('item1Title'), desc: t('item1Desc') },
    { i: '02', label: t('teaser2Label'), title: t('item2Title'), desc: t('item2Desc') },
    { i: '03', label: t('whatKicker'), title: t('item3Title'), desc: t('item3Desc') },
    { i: '04', label: t('teaser3Label'), title: t('item4Title'), desc: t('item4Desc') },
  ];

  return (
    <>
      {/* Hero: editorial pitch + single-field form beside the issue front page */}
      <section className="px-5 pb-14 pt-10 md:pb-20 xl:px-[80px]">
        <div className="mx-auto grid max-w-[390px] items-center gap-10 md:max-w-2xl xl:max-w-[1200px] xl:grid-cols-[1.05fr_0.95fr] xl:gap-16">
          {/* Left: the pitch and the form */}
          <ScrollReveal className="w-full">
            <SectionKicker className="mb-6">{t('heroKicker')}</SectionKicker>
            <h1 className="text-foreground text-display font-sans">
              {heroLine1} <span>{t('heroAccent')}</span>
            </h1>
            <p className="font-body text-muted text-lead mt-5 max-w-[440px]">{t('heroSubtitle')}</p>

            {submitted ? (
              <div className="border-accent/30 bg-accent/[0.06] mt-8 flex items-start gap-4 rounded-[18px] border p-5">
                <div className="bg-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-foreground text-title font-sans">{t('successHeading')}</h2>
                  <p className="font-body text-muted text-body mt-1">{t('successDesc')}</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 flex w-full max-w-[440px] flex-col gap-3"
              >
                <label
                  htmlFor="nl-email"
                  className="text-eyebrow text-muted font-mono font-medium uppercase"
                >
                  {formEyebrow}
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="nl-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('fieldEmailPlaceholder')}
                    aria-label={t('fieldEmailLabel')}
                    className="font-body text-foreground text-body border-border bg-surface placeholder:text-muted w-full rounded-[14px] border px-4 py-[14px] outline-none transition-colors sm:flex-1"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent font-body text-body hover:bg-accent/90 flex items-center justify-center gap-2 rounded-[14px] px-6 py-[14px] font-medium text-white transition-[background,transform] active:scale-[0.98] disabled:opacity-60"
                  >
                    {t('subscribeBtn')}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
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
                </div>
                {error && <p className="font-body text-caption text-down">{error}</p>}
                <p className="font-body text-muted text-caption">{t('privacyNote')}</p>
              </form>
            )}
          </ScrollReveal>

          {/* Right: the front page of this week's issue */}
          <ScrollReveal delay={0.12} className="w-full">
            <article className="border-border bg-surface shadow-card hover:border-accent/40 hover:shadow-card-lg relative overflow-hidden rounded-[24px] border p-6 transition-[box-shadow,border-color] duration-300 md:p-8">
              {/* Masthead */}
              <div className="pt-2 text-center">
                <p className="text-eyebrow text-accent font-mono font-medium uppercase">
                  {t('issueTag')}
                </p>
                <h2 className="text-foreground text-headline mt-2 font-sans uppercase leading-[1.02] tracking-tight">
                  {masthead}
                </h2>
                <p className="border-border text-caption text-muted mt-4 border-y py-2 font-mono uppercase tracking-[0.1em]">
                  {issueMeta}
                </p>
              </div>

              {/* Lead story */}
              <div className="mt-6 flex items-start justify-between gap-4">
                <div className="group/lead relative min-w-0 flex-1">
                  <p className="text-eyebrow text-accent font-mono font-medium uppercase">
                    {t('leadLabel')}
                  </p>
                  <h3 className="text-foreground text-title group-hover/lead:text-accent mt-2 line-clamp-2 cursor-default font-sans transition-colors">
                    {leadHeadline ?? t('leadHeadline')}
                  </h3>
                  {/* Shorter custom tooltip */}
                  <div
                    role="tooltip"
                    className="border-border bg-surface/95 text-foreground pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-max max-w-[280px] rounded-lg border px-3 py-2 text-[12px] font-normal leading-snug shadow-xl backdrop-blur-md transition-all group-hover/lead:block"
                  >
                    {leadHeadline ?? t('leadHeadline')}
                    <div className="border-border bg-surface absolute -top-1 left-4 h-2 w-2 -rotate-45 border-l border-t" />
                  </div>
                </div>
                <svg
                  width="96"
                  height="52"
                  viewBox="0 0 96 52"
                  fill="none"
                  aria-hidden="true"
                  className="hidden flex-shrink-0 self-end sm:block rtl:-scale-x-100"
                >
                  <path
                    d="M2 42 L18 34 L30 38 L46 22 L60 28 L74 12 L94 4"
                    stroke="#00B050"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 42 L18 34 L30 38 L46 22 L60 28 L74 12 L94 4 L94 50 L2 50 Z"
                    fill="#00B050"
                    fillOpacity="0.08"
                  />
                </svg>
              </div>

              {/* Teaser headlines */}
              <ul className="border-border mt-6 border-t">
                {activeTeasers.map((row) => (
                  <li
                    key={row.label}
                    className="border-border flex cursor-default items-baseline gap-4 border-b py-3 last:border-b-0"
                  >
                    <span className="text-caption text-accent w-[124px] flex-shrink-0 font-mono uppercase tracking-[0.08em]">
                      {row.label}
                    </span>
                    <div className="group/tip relative min-w-0 flex-1">
                      <span className="text-foreground font-body text-body group-hover/tip:text-accent line-clamp-2 font-medium transition-colors">
                        {row.head}
                      </span>
                      {/* Shorter compact tooltip */}
                      <div
                        role="tooltip"
                        className="border-border bg-surface/95 text-foreground pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-max max-w-[280px] rounded-lg border px-3 py-2 text-[12px] font-normal leading-snug shadow-xl backdrop-blur-md transition-all group-hover/tip:block"
                      >
                        {row.head}
                        <div className="border-border bg-surface absolute -bottom-1 left-4 h-2 w-2 rotate-45 border-b border-r" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="border-border text-caption text-muted mt-5 border-t pt-4 font-mono uppercase tracking-[0.1em]">
                {t('issueFooter')}
              </p>
            </article>
          </ScrollReveal>
        </div>
      </section>

      {/* In every issue: the briefing's standing table of contents */}
      <section className="px-5 pb-16 md:pb-20 xl:px-[80px]">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .ne-nl-row { position: relative; }
          .ne-nl-row::before {
            content: '';
            position: absolute;
            inset: 8px -14px;
            border-radius: 14px;
            background: #00B050;
            opacity: 0;
            transition: opacity 0.3s ease-out;
            pointer-events: none;
          }
          @media (hover: hover) {
            .ne-nl-row:hover::before { opacity: 1; }
          }
        `,
          }}
        />
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-8">{t('whatKicker')}</SectionKicker>
          </ScrollReveal>
          <ul className="border-border border-t">
            {contents.map((item, idx) => (
              <li key={item.i} className="border-border border-b">
                <ScrollReveal index={idx}>
                  {/* Strict columns keep every row on the same rails: numeral,
                      then label, then content (content drops below on mobile). */}
                  <div className="ne-nl-row group grid grid-cols-[56px_1fr] items-start gap-x-4 py-6 sm:grid-cols-[72px_190px_1fr] sm:gap-x-8">
                    <span
                      className="text-metric-sm text-accent/40 dark:text-accent-bright/50 relative z-[1] font-sans tabular-nums leading-none transition-colors duration-300 group-hover:text-white"
                      dir="ltr"
                    >
                      {item.i}
                    </span>
                    <span className="text-eyebrow text-muted relative z-[1] pt-2 font-mono font-medium uppercase transition-colors duration-200 group-hover:text-white/90">
                      {item.label}
                    </span>
                    <div className="relative z-[1] col-span-2 mt-3 sm:col-span-1 sm:mt-0">
                      <p className="text-foreground text-title font-sans leading-tight transition-colors duration-200 group-hover:text-white">
                        {item.title}
                      </p>
                      <p className="font-body text-muted text-body-lg mt-1.5 max-w-[560px] transition-colors duration-200 group-hover:text-white/90">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ink closer: subscriber count + the pull-quote */}
      <section className="ink-band rounded-t-[32px] px-5 py-16 md:py-20 xl:px-[80px]">
        <div className="mx-auto grid max-w-[390px] items-center gap-12 md:max-w-2xl xl:max-w-[1200px] xl:grid-cols-2 xl:gap-20">
          <ScrollReveal className="w-full">
            <SectionKicker className="mb-6">{t('socialKicker')}</SectionKicker>
            <div className="text-sheen text-metric w-fit font-sans tabular-nums" dir="ltr">
              <CountUp value={t('metricValue')} />
            </div>
            <p className="text-lead mt-4 font-sans text-white/70">{t('metricLabel')}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="w-full">
            <figure className="hover:border-accent-bright/40 hover:bg-accent/[0.10] rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-6 transition-colors md:p-8">
              <blockquote className="font-body text-body-lg leading-[1.7] text-white/85">
                {t('testimonialText')}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="bg-accent-bright/20 text-accent-bright text-caption flex h-10 w-10 items-center justify-center rounded-full font-sans font-semibold">
                  {t('testimonialAuthor')
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </span>
                <span>
                  <span className="text-caption block font-sans font-semibold text-white">
                    {t('testimonialAuthor')}
                  </span>
                  <span className="font-body text-caption block text-white/50">
                    {t('testimonialSince')}
                  </span>
                </span>
              </figcaption>
            </figure>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
