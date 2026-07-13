'use client';

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
import { Spotlight } from './Spotlight';

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
  // CMS-managed: the first ebook is the gated hero book, the rest fill the
  // index below. No static fallback — an empty collection hides the section.
  const moreEbooks = (cmsEbooks ?? [])
    .slice(1)
    .map((e) => ({ id: e.id, title: e.title, summary: e.summary ?? '' }));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Which book the gate form will send — index rows re-target the same form.
  const [requested, setRequested] = useState<{
    id: number;
    title: string;
    summary: string;
  } | null>(
    cmsEbooks?.[0]
      ? { id: cmsEbooks[0].id, title: cmsEbooks[0].title, summary: cmsEbooks[0].summary ?? '' }
      : null,
  );
  const gateRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function requestEbook(book: { id: number; title: string; summary: string }) {
    setRequested(book);
    setSuccess(false);
    gateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Focus lands after the smooth scroll so the jump isn't cut short.
    setTimeout(() => emailRef.current?.focus({ preventScroll: true }), 450);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const contentId = requested?.id;
    if (!contentId) {
      setError(t('errorMsg'));
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
        setError(data.errors?.[0]?.message ?? data.error ?? t('errorMsg'));
      }
    } catch {
      setError(t('errorMsg'));
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
          <p className="font-body text-muted max-w-[340px] text-[15px] leading-[1.55]">
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
            <Spotlight
              size={420}
              className="mb-6 flex items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0a2614] via-[#0d1f0d] to-[#111111] px-8 py-10 xl:mb-0"
            >
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
                {/* The cover mirrors whichever book the gate will send. */}
                {requested ? (
                  <>
                    <p className="font-sans text-[22px] font-semibold leading-[1.12] text-white">
                      {requested.title}
                    </p>
                    {requested.summary && (
                      <p className="font-body mt-2 max-w-[320px] text-[13px] leading-[1.55] text-white/55">
                        {requested.summary}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-sans text-[22px] font-semibold leading-[1.1] text-white">
                      {t('heroLine1')}
                      <br />
                      <span className="text-accent">{t('heroAccent')}</span>
                    </p>
                    <p className="font-body text-muted max-w-[320px] text-[15px] leading-[1.55]">
                      {t('heroDesc')}
                    </p>
                  </>
                )}
              </div>
            </Spotlight>

            {/* Gate form */}
            <div
              ref={gateRef}
              className="rounded-[20px] bg-[#F0F4F1] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-[#1a1c22] dark:shadow-none"
            >
              <p className="text-foreground mb-1 font-sans text-[18px] font-semibold">
                {t('gateHeading')}
              </p>
              <p className="font-body text-muted mb-3 text-[15px] leading-[1.55]">
                {t('gateDesc2')}
              </p>
              {requested && (
                <span className="border-accent/30 bg-accent/[0.08] text-accent mb-4 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M3 3.5A1.5 1.5 0 014.5 2h7A1.5 1.5 0 0113 3.5v10.2a.3.3 0 01-.47.25L8 11.2l-4.53 2.75a.3.3 0 01-.47-.25V3.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="truncate">{requested.title}</span>
                </span>
              )}

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
                  <p className="font-body text-muted text-[15px] leading-[1.5]">
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
                    className="font-body focus:border-accent dark:focus:border-accent border-border w-full rounded-[12px] border bg-white px-4 py-3 text-[15px] text-[#111] placeholder-[#9ca3af] outline-none transition-colors dark:border-white/10 dark:bg-[#111316] dark:text-white dark:placeholder-white/30"
                  />
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    placeholder={t('emailPlaceholderFull')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="font-body focus:border-accent dark:focus:border-accent border-border w-full rounded-[12px] border bg-white px-4 py-3 text-[15px] text-[#111] placeholder-[#9ca3af] outline-none transition-colors dark:border-white/10 dark:bg-[#111316] dark:text-white dark:placeholder-white/30"
                  />
                  {error && (
                    <p role="alert" className="font-body text-caption text-red-500">
                      {error}
                    </p>
                  )}
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="accent-accent mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded"
                    />
                    <span className="font-body text-muted text-caption leading-[1.5]">
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
                      <span className="font-body text-muted text-[15px] leading-[1.5]">
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

      {/* More ebooks: editorial index rows (learning content, not a card grid).
          CMS-managed — education-content ebooks after the hero book; hidden
          when the collection has none. Each row re-targets the gate form. */}
      {moreEbooks.length > 0 && (
        <section className="px-5 pb-12 pt-8">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-3">{t('moreGuidesKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline-sm mb-6 max-w-[560px] font-sans">
              {t('moreGuidesHeading')}
            </h2>
            <div className="border-border border-t">
              {moreEbooks.map((book, i) => (
                <ScrollReveal key={book.id} index={i}>
                  <button
                    type="button"
                    onClick={() => requestEbook(book)}
                    className="border-border hover:border-s-accent group grid w-full grid-cols-[auto_1fr] items-baseline gap-4 border-b border-s-2 border-s-transparent py-6 ps-3 text-start transition-colors duration-200 xl:gap-6 xl:py-7 xl:ps-4"
                  >
                    <span
                      dir="ltr"
                      aria-hidden="true"
                      className="text-foreground group-hover:text-accent dark:text-accent-bright w-[46px] shrink-0 font-sans text-[46px] font-semibold tabular-nums leading-none tracking-tight opacity-[0.08] transition-[color,opacity] duration-200 group-hover:opacity-40 xl:w-[64px] xl:text-[60px] dark:opacity-[0.28] dark:group-hover:opacity-70"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-foreground group-hover:text-accent text-body-lg font-sans font-semibold leading-snug transition-colors duration-200">
                        {book.title}
                      </h3>
                      {book.summary && (
                        <p className="font-body text-muted mt-1.5 max-w-[62ch] text-[15px] leading-relaxed">
                          {book.summary}
                        </p>
                      )}
                      <span className="text-accent mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.08em]">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 4l6 4.5L14 4M2.5 3h11a1 1 0 011 1v8a1 1 0 01-1 1h-11a1 1 0 01-1-1V4a1 1 0 011-1z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t('deliveryChip')}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                          className="opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100 motion-safe:-translate-x-1 motion-safe:group-hover:translate-x-0 rtl:-scale-x-100"
                        >
                          <path
                            d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="text-headline-sm mb-3 font-sans text-white">{t('ctaHeading')}</h2>
          <p className="font-body mb-7 max-w-[52ch] text-[15px] leading-relaxed text-white/[0.72]">
            {t('ctaDesc')}
          </p>
        </ScrollReveal>
      </section>
    </>
  );
}
