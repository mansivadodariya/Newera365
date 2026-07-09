'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export interface TestimonialItem {
  quote: string;
  authorName: string;
  authorRole?: string | null;
  rating?: number | null;
  avatarUrl?: string | null;
}

export interface TestimonialsSectionProps {
  /** Locale-resolved headline, e.g. "Trusted by 25,000+ traders worldwide". */
  headline?: string | null;
  /** e.g. "4.8" — shown as "4.8 / 5". */
  ratingValue?: string | null;
  /** Locale-resolved caption, e.g. "based on 2,400+ verified reviews". */
  ratingCaption?: string | null;
  items: TestimonialItem[];
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={i < filled ? 'text-accent' : 'text-border'}
        >
          <path
            d="M8 1.5l1.85 3.96 4.15.52-3.06 2.86.82 4.16L8 11.4l-3.76 2.06.82-4.16L2 6.48l4.15-.52L8 1.5z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

/**
 * Homepage social-proof section (client feedback #5): a rating band + trader
 * testimonial cards. All content is CMS-driven (SiteSettings `testimonials`
 * array + rating fields, locale-resolved in page.tsx). Renders nothing when no
 * testimonials are configured — never shows placeholder marketing.
 */
export function TestimonialsSection({
  headline,
  ratingValue,
  ratingCaption,
  items,
}: TestimonialsSectionProps) {
  const t = useTranslations('demo');
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // True while a programmatic scroll animates, so the scroll listener below
  // doesn't fight the auto-advance / arrow taps mid-animation.
  const programmatic = useRef(false);
  const count = items?.length ?? 0;

  // Auto-advance; pause on hover/focus/drag and for reduced motion. `active` is
  // in the deps so any change — a dot/arrow tap included — restarts the dwell
  // timer, otherwise a click could be overridden by an already-pending tick.
  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), 2000);
    return () => clearInterval(id);
  }, [paused, count, active]);

  // Scroll the active slide to the logical start — scrollBy on the TRACK only.
  // (scrollIntoView also nudged the page vertically and double-fought snap.)
  // The delta is measured from bounding rects, so it is correct in LTR and RTL.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    if (!slide) return;
    const rtl = getComputedStyle(track).direction === 'rtl';
    const tr = track.getBoundingClientRect();
    const sr = slide.getBoundingClientRect();
    const delta = rtl ? sr.right - tr.right : sr.left - tr.left;
    if (Math.abs(delta) < 1) return;
    programmatic.current = true;
    track.scrollBy({ left: delta, behavior: 'smooth' });
    const to = setTimeout(() => (programmatic.current = false), 600);
    return () => clearTimeout(to);
  }, [active]);

  // Keep `active` in sync when the user drags/scrolls the track directly, so
  // the dots and auto-advance never desync from what is actually on screen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      if (programmatic.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rtl = getComputedStyle(track).direction === 'rtl';
        const edge = rtl
          ? track.getBoundingClientRect().right
          : track.getBoundingClientRect().left;
        let nearest = 0;
        let best = Infinity;
        track.querySelectorAll<HTMLElement>('[data-idx]').forEach((s, i) => {
          const sr = s.getBoundingClientRect();
          const d = Math.abs((rtl ? sr.right : sr.left) - edge);
          if (d < best) {
            best = d;
            nearest = i;
          }
        });
        setActive((a) => (a === nearest ? a : nearest));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!items || items.length === 0) return null;

  const numericRating = ratingValue ? Number.parseFloat(ratingValue) : NaN;

  return (
    <section className="bg-section px-5 py-10 xl:py-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        {/* Header: kicker + heading, with the rating band trailing on desktop */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <SectionKicker className="text-muted mb-4 [&>span:first-child]:bg-[#6b7280]">
              {t('testimonialsKicker')}
            </SectionKicker>
            <h2 className="text-foreground text-headline max-w-[18ch] font-sans">
              {headline || t('testimonialsHeading')}
            </h2>
          </div>

          {ratingValue && (
            <div className="border-border bg-surface-elevated shadow-card dark:shadow-card-dark flex items-center gap-4 rounded-[18px] border px-5 py-4 transition-[transform,border-color] duration-300 hover:border-accent/40 motion-safe:hover:scale-[1.02]">
              <span className="text-foreground font-sans text-[34px] font-bold tabular-nums leading-none">
                {ratingValue}
                <span className="text-muted text-[18px] font-medium"> / 5</span>
              </span>
              <span className="bg-border h-10 w-px" aria-hidden="true" />
              <div className="flex flex-col gap-1.5">
                <Stars rating={Number.isFinite(numericRating) ? numericRating : 5} />
                {ratingCaption && (
                  <span className="font-body text-muted text-caption leading-tight">
                    {ratingCaption}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Testimonial carousel — auto-advancing, snap-scroll (drag on touch /
            trackpad), pause on hover/focus, dots + arrows for pointer users. */}
        <div
          className="relative mt-9"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className={`scrollbar-hide flex snap-x snap-mandatory items-stretch gap-[14px] overflow-x-auto pb-1 ${
              // On desktop the <=3 cards all fit, so drop the scroll clip and let
              // the highlighted card scale + shadow bleed past the row edges for a
              // seamless pop. (Falls back to a scroll-clip if more cards are added.)
              count <= 3 ? 'xl:overflow-visible' : ''
            }`}
          >
            {items.map((item, i) => {
              const isActive = i === active;
              // Edge cards scale inward (origin toward the row centre) so the
              // active first/last card never overflows the track's clip box —
              // RTL-flipped since index 0 is visually on the right there.
              const originClass =
                i === 0
                  ? 'xl:origin-left rtl:xl:origin-right'
                  : i === count - 1
                    ? 'xl:origin-right rtl:xl:origin-left'
                    : 'xl:origin-center';
              return (
              <div
                key={i}
                data-idx={i}
                className="w-[86%] flex-shrink-0 snap-start sm:w-[calc(50%-7px)] xl:w-[calc(33.333%-10px)]"
              >
                {/* Active card grows to become the focus (the rest hold their
                    size, dimmed) — the auto-advance and dots drive `active`, so
                    on desktop where all cards are already visible the carousel
                    reads as a moving spotlight rather than a dead scroll. */}
                <figure
                  className={`border-border relative flex h-full flex-col gap-4 rounded-[20px] border bg-white p-6 transition-[transform,opacity,box-shadow] duration-500 ease-out dark:bg-[#111316] ${originClass} ${
                    isActive
                      ? 'shadow-card dark:shadow-card-dark xl:border-accent/40 xl:z-10 xl:scale-[1.05] xl:shadow-xl'
                      : 'shadow-card dark:shadow-card-dark xl:opacity-55'
                  }`}
                >
                {/* Quote glyph (locale-neutral — avoids LTR quote chars in RTL) */}
                <svg
                  width="32"
                  height="24"
                  viewBox="0 0 26 20"
                  aria-hidden="true"
                  className="text-accent/25 rtl:-scale-x-100"
                >
                  <path
                    d="M0 20V11.5C0 5.2 3.9 1 9.8 0l.9 2.9C7.6 4 6 6 5.8 8.6H10V20H0zm15 0V11.5C15 5.2 18.9 1 24.8 0l.9 2.9C22.6 4 21 6 20.8 8.6H25V20H15z"
                    fill="currentColor"
                  />
                </svg>

                <blockquote className="font-body text-foreground flex-1 text-[16px] font-medium leading-[1.6] xl:text-[17px]">
                  {item.quote}
                </blockquote>

                <div className="border-border flex items-center gap-3 border-t pt-4">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.authorName}
                      width={40}
                      height={40}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="bg-accent/[0.12] text-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-semibold">
                      {initialsOf(item.authorName)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <figcaption className="text-foreground truncate font-sans text-[15px] font-semibold">
                      {item.authorName}
                    </figcaption>
                    {item.authorRole && (
                      <p className="font-body text-muted truncate text-[12px]">{item.authorRole}</p>
                    )}
                  </div>
                  <span className="ms-auto flex-shrink-0">
                    <Stars rating={item.rating ?? 5} />
                  </span>
                </div>
                </figure>
              </div>
              );
            })}
          </div>

          {count > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label={t('testimonialsPrev')}
                onClick={() => setActive((a) => (a - 1 + count) % count)}
                className="border-border text-muted hover:text-accent hover:border-accent/40 flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="rtl:-scale-x-100"
                >
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i + 1}`}
                    aria-current={i === active}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? 'bg-accent w-5' : 'bg-border hover:bg-muted w-1.5'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={t('testimonialsNext')}
                onClick={() => setActive((a) => (a + 1) % count)}
                className="border-border text-muted hover:text-accent hover:border-accent/40 flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="rtl:-scale-x-100"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
