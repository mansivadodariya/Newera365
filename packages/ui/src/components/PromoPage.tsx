'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

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

function ArrowRight({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100"
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

/** Promo card — light at rest, transitions to dark highlighted with green glow on hover */
function PromoCard({
  promo,
  endsLabel,
  claimLabel,
  activeLabel,
  onClaim,
}: {
  promo: CmsPromoItem;
  endsLabel: string | null;
  claimLabel: string;
  activeLabel: string;
  onClaim: () => void;
}) {
  return (
    <div className="border-border hover:border-accent/45 dark:hover:border-accent/45 shadow-card group relative isolate overflow-hidden rounded-[20px] border bg-white p-6 transition-all duration-300 hover:shadow-[0_20px_56px_rgba(0,176,80,0.18)] dark:border-white/[0.06] dark:bg-[#111111]">
      {/* Green glow blob — fades in on hover */}
      <span
        className="pointer-events-none absolute -top-[60px] left-[12%] h-[220px] w-[220px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-40 dark:group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle, rgba(0,176,80,0.5) 0%, rgba(0,176,80,0.15) 44%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {endsLabel && (
        <div className="bg-accent/10 group-hover:bg-accent/[0.18] mb-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] transition-colors duration-300">
          <span className="bg-accent h-1.5 w-1.5 shrink-0 rounded-full" />
          <span className="font-body text-accent text-[11px] font-medium">{endsLabel}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="bg-accent/10 text-accent group-hover:bg-accent/[0.18] inline-flex items-center rounded-full px-2.5 py-[5px] font-mono text-[10px] tracking-[1.2px] transition-colors duration-300">
          {promo.tag ?? ''}
        </span>
        <span className="text-muted font-mono text-[10px] tracking-[1px] dark:text-white/40">
          {activeLabel}
        </span>
      </div>

      <div className="mt-[22px]">
        {promo.valueDisplay && (
          <p className="text-accent font-sans text-[36px] font-semibold leading-none tracking-[-0.72px]">
            {promo.valueDisplay}
          </p>
        )}
        <p className="text-title text-foreground mt-2 font-sans dark:text-white">{promo.title}</p>
        <p className="font-body text-body text-muted mt-2.5 dark:text-white/60">
          {promo.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 pt-3.5">
        <span className="text-muted font-mono text-[11.5px] leading-snug dark:text-white/40">
          {promo.terms ?? ''}
        </span>
        <button
          type="button"
          onClick={onClaim}
          className="bg-accent hover:bg-accent-hover inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 active:scale-[0.97]"
        >
          {claimLabel}
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

export function PromoPage({ promos }: PromoPageProps) {
  const locale = useLocale();
  const t = useTranslations('promos');
  const offerEndsLabel = useOfferEndsLabel();
  const items = promos ?? [];
  const [modal, setModal] = useState<AuthModalType>(null);

  // Split "from every trade." → "from " (dark) + "every trade." (green).
  // Works for EN ("from every trade.") and AR ("من كل صفقة.") — first word stays dark.
  const accentFull = t('heroAccent');
  const firstSpace = accentFull.indexOf(' ');
  const accentPrefix = firstSpace === -1 ? '' : accentFull.slice(0, firstSpace) + ' ';
  const accentGreen = firstSpace === -1 ? accentFull : accentFull.slice(firstSpace + 1);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="px-5 pb-8 pt-9 xl:px-[120px] xl:pb-10 xl:pt-14">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] xl:max-w-[1200px]">
          <h1 className="text-display text-foreground mb-4 font-sans dark:text-white">
            {t('heroLine1')}
            <br />
            <span className="text-foreground dark:text-white">{accentPrefix}</span>
            <span>{accentGreen}</span>
          </h1>
          <p className="text-body text-muted max-w-[320px] xl:max-w-[680px] dark:text-white/60">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Promo cards — always single column, full width ─────── */}
      <section className="px-5 pb-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          {items.length === 0 ? (
            <p className="text-muted py-12 text-center text-[14px]">{t('noPromos')}</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {items.map((promo, i) => {
                const endsLabel = offerEndsLabel(promo.activeTo);
                const claimLabel = promo.ctaLabel ?? t('claimBtn');
                const activeLabel = t('activeLabel');

                return (
                  <ScrollReveal key={promo.id} index={i}>
                    <PromoCard
                      promo={promo}
                      endsLabel={endsLabel}
                      claimLabel={claimLabel}
                      activeLabel={activeLabel}
                      onClaim={() => setModal('register')}
                    />
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── T&C band ───────────────────────────────────────────── */}
      <section className="ink-band rounded-t-[32px] px-5 pb-14 pt-10 xl:px-[120px]">
        <ScrollReveal className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <SectionKicker className="mb-3">{t('termsKicker')}</SectionKicker>

          <h2 className="text-headline mb-3 font-sans text-white">{t('termsHeading')}</h2>
          <p className="font-body text-body mb-5 max-w-[340px] hyphens-auto text-justify text-white/55 xl:max-w-[680px]">
            {t('termsDesc')}
          </p>

          {/* Mobile: single button · Desktop: two buttons + "Updated each month" */}
          <div className="flex flex-col items-start gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-3">
              <Link
                href={`/${locale}/legal`}
                className="bg-accent hover:bg-accent-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-6px_rgba(0,176,79,0.3)] transition-all duration-150 hover:shadow-[0_12px_28px_-6px_rgba(0,176,79,0.45)] active:scale-[0.98]"
              >
                {t('termsLink')}
                <ArrowRight size={14} />
              </Link>
              <button className="hover:border-accent-bright/60 hover:bg-accent/[0.08] hidden items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-[15px] font-medium text-white transition-all duration-150 active:scale-[0.98] xl:inline-flex">
                {t('termsDownloadPdf')}
              </button>
            </div>
            <p className="hidden font-mono text-[10px] tracking-[1px] text-white/35 xl:block">
              ---{t('termsUpdated')}
            </p>
          </div>
        </ScrollReveal>
      </section>

      <AuthModal type={modal} onClose={() => setModal(null)} />
    </>
  );
}
