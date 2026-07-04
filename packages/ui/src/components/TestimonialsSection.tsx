'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

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
            <h2 className="text-foreground max-w-[18ch] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
              {headline || t('testimonialsHeading')}
            </h2>
          </div>

          {ratingValue && (
            <div className="border-border bg-surface-elevated shadow-card dark:shadow-card-dark flex items-center gap-4 rounded-[18px] border px-5 py-4">
              <span className="text-foreground font-sans text-[34px] font-bold tabular-nums leading-none">
                {ratingValue}
                <span className="text-muted text-[18px] font-medium"> / 5</span>
              </span>
              <span className="bg-border h-10 w-px" aria-hidden="true" />
              <div className="flex flex-col gap-1.5">
                <Stars rating={Number.isFinite(numericRating) ? numericRating : 5} />
                {ratingCaption && (
                  <span className="font-body text-muted text-[12px] leading-tight">
                    {ratingCaption}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Testimonial cards */}
        <div className="mt-9 grid grid-cols-1 items-stretch gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <ScrollReveal key={i} index={i} className="h-full">
              <figure className="border-border hover-lift shadow-card dark:shadow-card-dark flex h-full flex-col gap-4 rounded-[20px] border bg-white p-6 dark:bg-[#111316]">
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
