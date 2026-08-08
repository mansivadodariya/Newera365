'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { CountUp } from '../motion/CountUp';

/**
 * Homepage newsletter teaser (client feedback #19). A premium, full-bleed ink
 * bento: the section IS the `.ink-band` (terminal grid + green signal glow,
 * identical in both themes per DESIGN.md §2/§3), a square-edged dark chapter
 * matching the "Why Newera" band. Content sits in a centred max-width container
 * with a left-aligned editorial header over an asymmetric bento — a capture cell
 * (glowing `.text-sheen` subscriber count + form), a product mockup rendering the
 * actual Monday Briefing issue (masthead, glowing chart, teaser headlines), and
 * the four content categories with crosshair "reticle" glyphs ("Terminal
 * Precision").
 *
 * CMS-managed via SiteSettings (like FeaturesSection / TestimonialsSection): the
 * editorial copy comes from the `content` prop (locale-resolved in page.tsx from
 * `site-settings`), falling back to the i18n defaults when a field is unset — so
 * the section always renders even before the CMS is seeded. Posts to the same
 * /api/newsletter/subscribe endpoint as /newsletter. Cells define via border +
 * glow on hover; nothing levitates (§4).
 */

export interface HomeNewsletterContent {
  headline?: string | null;
  headlineAccent?: string | null;
  subtitle?: string | null;
  metricValue?: string | null;
  metricLabel?: string | null;
  issueMeta?: string | null;
  leadHeadline?: string | null;
  fxHead?: string | null;
  cmdHead?: string | null;
  macroHead?: string | null;
  categories?: { cadence?: string | null; title?: string | null; desc?: string | null }[] | null;
}

interface CategoryIcon {
  cadenceKey: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
}

const CATEGORY_ICONS: CategoryIcon[] = [
  {
    cadenceKey: 'dailyCadence',
    titleKey: 'dailyTitle',
    descKey: 'dailyDesc',
    icon: <path d="M2.5 12h4l2.5-7 4 14 2.5-7h4" />,
  },
  {
    cadenceKey: 'eventsCadence',
    titleKey: 'eventsTitle',
    descKey: 'eventsDesc',
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      </>
    ),
  },
  {
    cadenceKey: 'tipsCadence',
    titleKey: 'tipsTitle',
    descKey: 'tipsDesc',
    icon: (
      <>
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
      </>
    ),
  },
  {
    cadenceKey: 'outlookCadence',
    titleKey: 'outlookTitle',
    descKey: 'outlookDesc',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.6 8.4l-2.2 4.9-4.9 2.2 2.2-4.9 4.9-2.2z" />
      </>
    ),
  },
];

function SubmitArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Terminal reticle framing around a category glyph — the section's signature
    detail. A dashed ring + N/E/S/W ticks read as a targeting mark; the inner
    disc carries the glyph and brightens as the cell is hovered. */
function ReticleGlyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative grid h-12 w-12 flex-shrink-0 place-items-center">
      <svg
        className="group-hover:text-accent/50 absolute inset-0 h-full w-full text-white/[0.16] transition-colors duration-300 motion-safe:group-hover:[animation:spin_16s_linear_infinite]"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="20.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2.5 4.5"
        />
        <path
          d="M24 1.5v4M24 42.5v4M1.5 24h4M42.5 24h4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <span className="border-accent/25 bg-accent/[0.1] text-accent-bright group-hover:border-accent/50 group-hover:bg-accent/[0.16] relative grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {children}
        </svg>
      </span>
    </span>
  );
}

/** The rich product shot: a compact render of this week's Monday Briefing —
    masthead, a glowing lead chart, and three teaser headlines on a frosted
    "paper" card. Copy resolves from CMS `content` with i18n fallback. */
function IssueMockup({ content }: { content?: HomeNewsletterContent }) {
  const t = useTranslations('homeNewsletter');
  const teasers = [
    { label: t('fxLabel'), head: content?.fxHead ?? t('fxHead') },
    { label: t('cmdLabel'), head: content?.cmdHead ?? t('cmdHead') },
    { label: t('macroLabel'), head: content?.macroHead ?? t('macroHead') },
  ];
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/[0.09] bg-white/[0.02] p-5 ring-1 ring-inset ring-white/[0.05] md:col-span-2 xl:col-span-7 xl:row-start-1 xl:p-6">
      <span
        aria-hidden="true"
        className="bg-accent/[0.16] pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-[80px]"
      />
      <div className="relative mb-4 flex items-center justify-between">
        <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-white backdrop-blur">
          {t('issueChip')}
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] text-white">
          <span className="bg-accent-bright h-1.5 w-1.5 rounded-full shadow-[0_0_8px_2px_rgba(26,217,102,0.6)]" />
          {content?.issueMeta ?? t('issueMeta')}
        </span>
      </div>

      {/* The issue — frosted paper card */}
      <div className="relative flex-1 rounded-[16px] border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 backdrop-blur-sm">
        <div className="border-b border-white/[0.08] pb-3 text-center">
          <p className="text-accent font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
            {t('captureEyebrow')}
          </p>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="text-accent font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
              {t('leadLabel')}
            </span>
            <h4 className="mt-1.5 font-sans text-[15px] font-medium leading-snug text-white">
              {content?.leadHeadline ?? t('leadHeadline')}
            </h4>
          </div>
          <svg
            width="104"
            height="52"
            viewBox="0 0 104 52"
            fill="none"
            aria-hidden="true"
            className="flex-shrink-0 self-end rtl:-scale-x-100"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(26,217,102,0.5))' }}
          >
            <path
              d="M2 44 L18 36 L32 40 L48 24 L64 30 L80 12 L102 4 L102 50 L2 50 Z"
              fill="url(#nl-area)"
            />
            <path
              d="M2 44 L18 36 L32 40 L48 24 L64 30 L80 12 L102 4"
              stroke="#1AD966"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="102" cy="4" r="2.5" fill="#1AD966" />
            <defs>
              <linearGradient id="nl-area" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#1AD966" stopOpacity="0.28" />
                <stop offset="1" stopColor="#1AD966" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <ul className="mt-4 border-t border-white/[0.08]">
          {teasers.map((row) => (
            <li
              key={row.label}
              className="flex items-baseline gap-3 border-b border-white/[0.06] py-2.5 last:border-b-0"
            >
              <span className="text-accent w-[116px] flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.06em]">
                {row.label}
              </span>
              <span className="font-body text-[13px] text-white">{row.head}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function HomeNewsletterSection({ content }: { content?: HomeNewsletterContent } = {}) {
  const t = useTranslations('homeNewsletter');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // CMS content overrides i18n defaults per field (section renders either way).
  const headline = content?.headline ?? t('headline');
  const headlineAccent = content?.headlineAccent ?? t('headlineAccent');
  const subtitle = content?.subtitle ?? t('subtitle');
  const metricValue = content?.metricValue ?? t('metricValue');
  const metricLabel = content?.metricLabel ?? t('metricLabel');

  const categories = CATEGORY_ICONS.map((cat, i) => {
    const cms = content?.categories?.[i];
    return {
      icon: cat.icon,
      cadence: cms?.cadence ?? t(cat.cadenceKey),
      title: cms?.title ?? t(cat.titleKey),
      desc: cms?.desc ?? t(cat.descKey),
    };
  });

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
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: { message?: string }[];
        };
        setError(data.errors?.[0]?.message ?? data.error ?? t('errorGeneric'));
      }
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="home-newsletter-heading"
      className="ink-band relative overflow-hidden px-5 py-14 sm:px-6 xl:px-8 xl:py-20"
    >
      {/* Depth: extra signal glows framing the full-bleed field */}
      <span
        aria-hidden="true"
        className="bg-accent/[0.1] pointer-events-none absolute -left-24 top-1/4 h-[26rem] w-[26rem] rounded-full blur-[130px]"
      />
      <span
        aria-hidden="true"
        className="bg-accent/[0.08] pointer-events-none absolute -bottom-40 right-[-6rem] h-[26rem] w-[26rem] rounded-full blur-[130px]"
      />

      <div className="relative mx-auto max-w-[1200px]">
        {/* Header — editorial: claim on the start, the pitch on the end */}
        <ScrollReveal>
          <SectionKicker className="mb-4">{t('kicker')}</SectionKicker>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
            <h2
              id="home-newsletter-heading"
              className="text-headline max-w-[17ch] text-balance font-sans text-white"
            >
              {headline} <span>{headlineAccent}</span>
            </h2>
            <p className="text-lead max-w-[46ch] text-white xl:pb-1">{subtitle}</p>
          </div>
        </ScrollReveal>

        {/* Bento */}
        <ScrollReveal delay={0.1}>
          <div className="mt-10 grid gap-3.5 md:grid-cols-2 xl:mt-12 xl:grid-cols-12">
            {/* ── Capture cell ─────────────────────────────────────────── */}
            <div className="relative flex flex-col overflow-hidden rounded-[22px] border border-white/[0.09] bg-white/[0.035] p-6 ring-1 ring-inset ring-white/[0.05] backdrop-blur-sm md:col-span-2 xl:col-span-5 xl:row-start-1 xl:min-h-[400px] xl:p-8">
              <span
                aria-hidden="true"
                className="bg-accent/[0.22] pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full blur-[64px]"
              />
              <div className="relative">
                <span className="text-accent font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {t('captureEyebrow')}
                </span>
                <div
                  className="text-sheen text-metric mt-3 w-fit font-sans tabular-nums leading-none"
                  dir="ltr"
                >
                  <CountUp value={metricValue} />
                </div>
                <div className="mt-3.5 flex items-center gap-3">
                  <div className="flex -space-x-2.5" aria-hidden="true">
                    {[
                      'from-[#1AD966] to-[#0a8f42]',
                      'from-[#3bdd82] to-[#0e6b39]',
                      'from-[#12b45f] to-[#083]',
                      'from-[#7de1a0] to-[#159c52]',
                    ].map((g, i) => (
                      <span
                        key={i}
                        className={`h-7 w-7 rounded-full bg-gradient-to-br ring-[#0a1610] ${g} ring-2`}
                      />
                    ))}
                  </div>
                  <p className="font-body text-body text-white">{metricLabel}</p>
                </div>
              </div>

              <div className="relative mt-auto pt-8">
                {submitted ? (
                  <div className="border-accent-bright/25 bg-accent-bright/[0.08] flex items-start gap-3.5 rounded-[16px] border p-5">
                    <span className="bg-accent mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12l5 5L20 7"
                          stroke="white"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-title font-sans text-white">{t('successHeading')}</p>
                      <p className="text-body font-body mt-1 text-white">{t('successDesc')}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label
                      htmlFor="home-nl-email"
                      className="text-accent font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
                    >
                      {t('formEyebrow')}
                    </label>
                    <div className="flex flex-col gap-2.5 sm:flex-row">
                      <input
                        id="home-nl-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        aria-label={t('emailLabel')}
                        className="font-body text-body w-full rounded-[13px] border border-white/[0.14] bg-white/[0.06] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/60 sm:flex-1"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent hover:bg-accent-bright font-body text-body group flex items-center justify-center gap-2 rounded-[13px] px-6 py-3 font-medium text-white outline-none transition-[background,transform] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1610] active:scale-[0.98] disabled:opacity-60"
                      >
                        {loading ? t('subscribingBtn') : t('subscribeBtn')}
                        {!loading && <SubmitArrow />}
                      </button>
                    </div>
                    {error && <p className="text-caption text-down font-body">{error}</p>}
                  </form>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="text-caption font-body text-white/80">{t('privacyNote')}</p>
                  <Link
                    href={`/${locale}/newsletter`}
                    className="font-body hover:text-accent-bright group inline-flex items-center gap-1.5 text-[14px] font-medium text-white transition-colors"
                  >
                    <span className="link-underline group-hover:[background-size:100%_1px]">
                      {t('previewLink')}
                    </span>
                    <SubmitArrow />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Product mockup cell ──────────────────────────────────── */}
            <IssueMockup content={content} />

            {/* ── The four content categories ──────────────────────────── */}
            {categories.map((c, i) => (
              <div
                key={i}
                className="hover:border-accent/40 hover:bg-accent/[0.08] group relative flex flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-5 ring-1 ring-inset ring-white/[0.05] transition-[border-color,background-color] duration-300 md:col-span-1 xl:col-span-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <ReticleGlyph>{c.icon}</ReticleGlyph>
                  <span className="rounded-full border border-white/[0.2] bg-white/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white">
                    {c.cadence}
                  </span>
                </div>
                <h3 className="text-body-lg mt-4 font-sans font-semibold leading-tight text-white">
                  {c.title}
                </h3>
                <p className="font-body mt-1.5 text-[13.5px] leading-relaxed text-white">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
