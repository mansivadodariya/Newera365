'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

export interface CmsEbookItem {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  isGated?: boolean | null;
}

interface EbooksPageProps {
  ebooks?: CmsEbookItem[];
}

export function EbooksPage({ ebooks: cmsEbooks }: EbooksPageProps) {
  const t = useTranslations('ebooks');
  const locale = useLocale();
  const fallbackEbooks = [
    { id: 'position', title: t('guide1Title'), desc: t('guide1Desc'), pages: '' },
    { id: 'psychology', title: t('guide2Title'), desc: t('guide2Desc'), pages: '' },
    { id: 'technical', title: t('guide3Title'), desc: t('guide3Desc'), pages: '' },
  ];
  const displayEbooks =
    cmsEbooks && cmsEbooks.length > 0
      ? cmsEbooks
          .slice(1)
          .map((e) => ({ id: String(e.id), title: e.title, desc: e.summary ?? '', pages: '' }))
      : fallbackEbooks;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const contentId = cmsEbooks?.[0]?.id;
    if (!contentId) {
      setError('Content not available. Please try again later.');
      return;
    }
    setLoading(true);
    setError('');
    const cmsBase = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';
    try {
      // The gate captures the email and emails the PDF to the requester; on
      // success we just confirm it's on the way (see successHeading copy).
      const res = await fetch(`${cmsBase}/api/education/gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contentId: String(contentId), locale }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: { message?: string }[];
        };
        setError(
          data.errors?.[0]?.message ?? data.error ?? 'Something went wrong. Please try again.',
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground text-display mb-3 font-sans">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Ebook cover + gate form */}
      <section className="px-5 pb-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Two-up on desktop: cover left, gate form right (avoids the full-width stretch). */}
          <div className="xl:grid xl:grid-cols-2 xl:items-stretch xl:gap-8">
            {/* Cover — ink art band (green light column) framing the book card */}
            <div className="relative mb-6 flex items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0a2614] via-[#0d1f0d] to-[#111111] px-8 py-10 xl:mb-0">
              <img
                src="/images/edge-flow.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.55] to-[#03130B]/[0.15]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/[0.06]"
              />
              <div className="relative w-full max-w-[200px] rounded-[16px] border border-white/[0.10] bg-[#141917]/[0.88] p-6 shadow-2xl backdrop-blur-md">
                <div className="bg-accent mb-4 flex h-8 w-8 items-center justify-center rounded-[10px]">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="2"
                      width="12"
                      height="12"
                      rx="2"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path d="M5 6h6M5 9h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-body mb-1 text-[9px] uppercase tracking-[0.14em] text-white/40">
                  {t('heroKicker')}
                </p>
                <p className="font-sans text-[22px] font-semibold leading-[1.1] text-white">
                  {t('heroLine1')}
                  <br />
                  <span className="text-accent">{t('heroAccent')}</span>
                </p>
                <p className="font-body text-muted max-w-[320px] text-[15px] leading-[1.55]">
                  {t('heroDesc')}
                </p>
              </div>
            </div>

            {/* Gate form */}
            <div className="rounded-[20px] bg-[#F0F4F1] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-[#1a1c22] dark:shadow-none">
              <p className="text-foreground mb-1 font-sans text-[18px] font-semibold">
                {t('gateHeading')}
              </p>
              <p className="font-body text-muted mb-5 text-[12px] leading-[1.55]">
                {t('gateDesc2')}
              </p>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="bg-accent/10 text-accent flex h-12 w-12 items-center justify-center rounded-full">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4 10l4 4 8-8"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-foreground font-sans text-[16px] font-semibold">
                    {t('successHeading')}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-[1.5]">
                    {t('successMsg')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    required
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-body focus:border-accent dark:focus:border-accent w-full rounded-[12px] border border-[#e5e7eb] bg-[#F0F4F1] px-4 py-3 text-[13px] text-[#111] placeholder-[#9ca3af] outline-none dark:border-white/10 dark:bg-[#111316] dark:text-white dark:placeholder-white/30"
                  />
                  <input
                    type="email"
                    required
                    placeholder={t('emailPlaceholderFull')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="font-body focus:border-accent dark:focus:border-accent w-full rounded-[12px] border border-[#e5e7eb] bg-[#F0F4F1] px-4 py-3 text-[13px] text-[#111] placeholder-[#9ca3af] outline-none dark:border-white/10 dark:bg-[#111316] dark:text-white dark:placeholder-white/30"
                  />
                  {error && <p className="font-body text-[12px] text-red-500">{error}</p>}
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="accent-accent mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded"
                    />
                    <span className="font-body text-muted text-[11px] leading-[1.5]">
                      {t('consentCheckbox')}
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading || !agreed}
                    className="bg-accent hover:bg-accent/90 font-body flex h-[50px] w-full items-center justify-center rounded-full text-[14px] font-medium text-white transition-colors disabled:opacity-60"
                  >
                    {loading ? t('sendingLabel') : t('submitBtn')}
                  </button>
                </form>
              )}

              {/* What's inside */}
              <div>
                <SectionKicker className="my-4 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
                  {t('whatsInsideKicker')}
                </SectionKicker>
                <div className="flex flex-col gap-[10px]">
                  {([1, 2, 3, 4, 5] as const).map((i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <svg
                        className="text-accent mt-0.5 flex-shrink-0"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8l3.5 3.5L13 5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-body text-muted text-[13px] leading-[1.5]">
                        {t(`feature${i}` as 'feature1')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* More ebooks */}
      <section className="bg-surface px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('moreGuidesKicker')}</SectionKicker>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3">
            {displayEbooks.map((book, i) => (
              <ScrollReveal
                key={book.id}
                index={i}
                className="bg-background shadow-card dark:shadow-card-dark hover-lift flex items-center gap-4 rounded-[18px] p-4"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.08)] dark:bg-[rgba(255,255,255,0.06)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-accent"
                  >
                    <rect
                      x="3"
                      y="2"
                      width="14"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 7h6M7 10.5h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-sans text-[13px] font-semibold leading-[1.3]">
                    {book.title}
                  </p>
                  <p className="font-body text-muted mt-0.5 text-[11px] leading-[1.4]">
                    {book.desc}
                  </p>
                </div>
                <span className="font-body text-muted flex-shrink-0 text-[10px]">{book.pages}</span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="text-headline-sm mb-3 font-sans text-white">{t('ctaHeading')}</h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
        </ScrollReveal>
      </section>
    </>
  );
}
