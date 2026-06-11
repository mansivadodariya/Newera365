'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

// CMS tagColor → badge background colour (light variant, used on resting light card).
const TAG_BG_LIGHT: Record<string, string> = {
  accent: 'bg-accent/[0.12] text-accent',
  amber: 'bg-[#F59E0B]/[0.15] text-[#B45309]',
  blue: 'bg-[#3B82F6]/[0.15] text-[#1D4ED8]',
  purple: 'bg-[#8B5CF6]/[0.18] text-[#6D28D9]',
  red: 'bg-[#EF4444]/[0.15] text-[#B91C1C]',
  grey: 'bg-[#6B7280]/[0.15] text-[#374151]',
};

export interface CmsPromoItem {
  id: number;
  slug: string;
  title: string;
  valueDisplay?: string | null;
  tag?: string | null;
  tagColor?: string | null;
  description: string;
  terms?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isHighlighted?: boolean | null;
  activeTo?: string | null;
}

interface PromoPageProps {
  promos?: CmsPromoItem[];
}

/** "Ends in N days" when near, otherwise "Offer ends DD/MM/YY". Null = evergreen. */
function useOfferEndsLabel() {
  const t = useTranslations('promos');
  return (activeTo?: string | null): string | null => {
    if (!activeTo) return null;
    const end = new Date(activeTo);
    if (Number.isNaN(end.getTime())) return null;
    const days = Math.ceil((end.getTime() - Date.now()) / 86_400_000);
    if (days < 0) return null;
    if (days === 0) return t('endsToday');
    if (days === 1) return t('endsTomorrow');
    if (days <= 14) return t('endsInDays', { days });
    const dd = String(end.getDate()).padStart(2, '0');
    const mm = String(end.getMonth() + 1).padStart(2, '0');
    const yy = String(end.getFullYear()).slice(-2);
    return t('offerEnds', { date: `${dd}/${mm}/${yy}` });
  };
}

function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromoCard({
  promo,
  endsLabel,
  claimLabelFallback,
  activeLabel,
  locale,
}: {
  promo: CmsPromoItem;
  endsLabel: string | null;
  claimLabelFallback: string;
  activeLabel: string;
  locale: string;
}) {
  const highlighted = !!promo.isHighlighted;
  const tagLight = TAG_BG_LIGHT[promo.tagColor ?? 'accent'] ?? TAG_BG_LIGHT.accent;

  // Highlighted cards are dark by default (matching Figma — green-tinted black
  // gradient with a soft glow at the top-right). Regular cards are light and
  // transition to the same dark gradient on hover, per the user spec.
  //
  // The `data-card` selectors below let us style every child differently in
  // each state without re-listing every variant in Tailwind.
  const cardClass = highlighted
    ? // Always dark
      'data-[state=dark] [&]:bg-[radial-gradient(120%_120%_at_85%_-10%,rgba(0,176,80,0.32)_0%,rgba(0,176,80,0.06)_28%,#0b1410_55%,#020806_100%)]'
    : // Light by default, dark on hover
      'bg-[#fafaf9] dark:bg-[#101418] hover:bg-[radial-gradient(120%_120%_at_85%_-10%,rgba(0,176,80,0.32)_0%,rgba(0,176,80,0.06)_28%,#0b1410_55%,#020806_100%)]';

  // Common "is currently showing the dark surface" expressed via group state.
  // We use a CSS variable to drive child colours so a single hover toggles all.
  return (
    <div
      data-highlighted={highlighted ? 'true' : 'false'}
      className={[
        'group relative isolate flex flex-col overflow-hidden rounded-[22px] p-5 transition-[background] duration-300',
        'shadow-card dark:shadow-card-dark',
        cardClass,
      ].join(' ')}
    >
      {/* Offer-ends badge */}
      {endsLabel && (
        <div
          className={[
            'mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1',
            highlighted ? 'bg-accent/[0.18]' : 'bg-accent/[0.12] group-hover:bg-accent/[0.18]',
          ].join(' ')}
        >
          <span className="bg-accent h-1.5 w-1.5 flex-shrink-0 rounded-full" />
          <span
            className={[
              'font-body text-[11px] font-medium tracking-[0.01em]',
              highlighted ? 'text-accent' : 'text-accent',
            ].join(' ')}
          >
            {endsLabel}
          </span>
        </div>
      )}

      {/* Tag + ACTIVE row */}
      <div className="mb-4 flex items-center justify-between">
        {promo.tag ? (
          <span
            className={[
              'font-body inline-flex h-[23px] items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]',
              highlighted
                ? 'bg-accent/[0.18] text-accent'
                : `${tagLight} group-hover:bg-accent/[0.18] group-hover:text-accent`,
            ].join(' ')}
          >
            {promo.tag}
          </span>
        ) : (
          <span />
        )}
        <span
          className={[
            'font-mono text-[10px] tracking-[0.12em]',
            highlighted ? 'text-white/45' : 'text-muted group-hover:text-white/45',
            'transition-colors duration-300',
          ].join(' ')}
        >
          {activeLabel}
        </span>
      </div>

      {/* Value */}
      {promo.valueDisplay && (
        <p className="text-accent font-sans text-[36px] font-semibold leading-[1] tracking-[-0.02em]">
          {promo.valueDisplay}
        </p>
      )}

      {/* Title */}
      <p
        className={[
          'font-sans font-semibold leading-tight transition-colors duration-300',
          promo.valueDisplay ? 'mt-2 text-[17px]' : 'text-[20px]',
          highlighted ? 'text-white' : 'text-foreground group-hover:text-white',
        ].join(' ')}
      >
        {promo.title}
      </p>

      {/* Description */}
      <p
        className={[
          'font-body mt-2 text-[13px] leading-[1.5] transition-colors duration-300',
          highlighted ? 'text-white/60' : 'text-muted group-hover:text-white/60',
        ].join(' ')}
      >
        {promo.description}
      </p>

      {/* Spacer pushes footer to the bottom for uniform card heights */}
      <div className="flex-1" />

      {/* Footer + CTA */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={[
            'max-w-[55%] font-mono text-[10px] leading-snug transition-colors duration-300',
            highlighted ? 'text-white/45' : 'text-muted/80 group-hover:text-white/45',
          ].join(' ')}
        >
          {promo.terms ?? ''}
        </span>
        <Link
          href={promo.ctaHref ?? `/${locale}/register`}
          className={[
            'font-body inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300',
            // Highlighted: always green. Regular: black resting, green on hover.
            highlighted
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-foreground text-background group-hover:bg-accent group-hover:text-white',
          ].join(' ')}
        >
          {promo.ctaLabel ?? claimLabelFallback}
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

export function PromoPage({ promos }: PromoPageProps) {
  const locale = useLocale();
  const t = useTranslations('promos');
  const offerEndsLabel = useOfferEndsLabel();
  const items = promos ?? [];

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9 xl:px-[120px] xl:pb-10 xl:pt-12">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] xl:text-[56px] xl:tracking-[-1.68px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55] xl:max-w-[560px] xl:text-[16px]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Promo cards */}
      <section className="bg-transparent px-5 pb-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {items.length === 0 ? (
            <p className="font-body text-muted py-12 text-center text-[14px]">{t('noPromos')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              {items.map((promo) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  endsLabel={offerEndsLabel(promo.activeTo)}
                  claimLabelFallback={t('claimBtn')}
                  activeLabel={t('activeLabel')}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* T&C band */}
      <section className="rounded-t-[32px] bg-[#000000] px-5 pb-12 pt-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/60 [&>span:last-child]:text-white/60">
            {t('termsKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white xl:text-[34px]">
            {t('termsHeading')}
          </h2>
          <p className="font-body mb-7 max-w-[350px] text-[13px] leading-relaxed text-white/60 xl:max-w-[560px] xl:text-[15px]">
            {t('termsDesc')}
          </p>
          <Link
            href={`/${locale}/legal`}
            className="font-body bg-accent flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-10"
          >
            {t('termsLink')}
            <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
