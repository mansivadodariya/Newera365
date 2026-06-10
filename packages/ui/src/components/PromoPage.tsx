'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

// tagColor (from CMS) → badge colour. Style maps, not content.
const CMS_TAG_STYLES: Record<string, string> = {
  accent: 'bg-accent text-white',
  amber: 'bg-[#F59E0B] text-white',
  blue: 'bg-[#3B82F6] text-white',
  purple: 'bg-[#8B5CF6] text-white',
  red: 'bg-[#EF4444] text-white',
  grey: 'bg-[#6B7280] text-white',
};

// Resting card gradient by tagColor — light/tinted, matching the static design.
// The bold dark-green gradient is applied on hover only (group-hover below).
const CMS_CARD_GRADIENTS: Record<string, string> = {
  accent: 'from-accent/[0.07] to-[#FAFAF9] dark:from-accent/[0.12] dark:to-surface',
  amber: 'from-[#F59E0B]/[0.07] to-[#FAFAF9] dark:from-[#F59E0B]/[0.12] dark:to-surface',
  blue: 'from-[#3B82F6]/[0.07] to-[#FAFAF9] dark:from-[#3B82F6]/[0.12] dark:to-surface',
  purple: 'from-[#8B5CF6]/[0.07] to-[#FAFAF9] dark:from-[#8B5CF6]/[0.12] dark:to-surface',
  red: 'from-[#EF4444]/[0.07] to-[#FAFAF9] dark:from-[#EF4444]/[0.12] dark:to-surface',
  grey: 'from-[#6B7280]/[0.07] to-[#FAFAF9] dark:from-[#6B7280]/[0.12] dark:to-surface',
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
              {items.map((promo) => {
                const tagStyle =
                  CMS_TAG_STYLES[promo.tagColor ?? 'accent'] ?? CMS_TAG_STYLES.accent;
                const gradient =
                  CMS_CARD_GRADIENTS[promo.tagColor ?? 'accent'] ?? CMS_CARD_GRADIENTS.accent;
                const endsLabel = offerEndsLabel(promo.activeTo);
                return (
                  <div
                    key={promo.id}
                    className={`shadow-card dark:shadow-card-dark group flex flex-col overflow-hidden rounded-[22px] bg-gradient-to-br transition-colors duration-300 ${gradient} hover:from-[#062a04] hover:to-[#010f01]`}
                  >
                    {/* Offer-ends badge */}
                    {endsLabel && (
                      <div className="flex items-center gap-2 px-5 pt-5">
                        <span className="bg-accent h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                        <span className="font-body text-muted text-[11px] transition-colors duration-300 group-hover:text-white/70">
                          {endsLabel}
                        </span>
                      </div>
                    )}

                    {/* Tag row */}
                    <div
                      className={`flex items-center justify-between px-5 ${endsLabel ? 'pt-3' : 'pt-5'}`}
                    >
                      {promo.tag ? (
                        <span
                          className={`font-body inline-flex h-5 items-center rounded-full px-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${tagStyle}`}
                        >
                          {promo.tag}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="bg-accent/10 text-accent font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white/70">
                        {t('activeLabel')}
                      </span>
                    </div>

                    {/* Value + Title + desc */}
                    <div className="px-5 pt-3">
                      {promo.valueDisplay && (
                        <p className="text-accent font-sans text-[36px] font-semibold leading-[100%] tracking-[-0.02em]">
                          {promo.valueDisplay}
                        </p>
                      )}
                      <p
                        className={`font-sans font-semibold leading-tight transition-colors duration-300 group-hover:text-white ${promo.valueDisplay ? 'text-foreground mt-2 text-[17px]' : 'text-foreground text-[20px]'}`}
                      >
                        {promo.title}
                      </p>
                      <p className="font-body text-muted mt-1 text-[13px] leading-[1.55] transition-colors duration-300 group-hover:text-white/70">
                        {promo.description}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="dark:border-border mx-5 mt-4 border-t border-[#e5e7eb] transition-colors duration-300 group-hover:border-white/15" />

                    {/* Footer + CTA */}
                    <div className="mt-auto flex items-center justify-between px-5 py-4">
                      <span className="text-muted max-w-[180px] font-mono text-[10px] leading-snug transition-colors duration-300 group-hover:text-white/50">
                        {promo.terms ?? ''}
                      </span>
                      <Link
                        href={promo.ctaHref ?? `/${locale}/register`}
                        className="bg-accent hover:bg-accent-hover font-body flex h-8 flex-shrink-0 items-center gap-1.5 rounded-full px-4 text-[12px] font-medium text-white transition-colors"
                      >
                        {promo.ctaLabel ?? t('claimBtn')}
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 8h10M9 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
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
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
