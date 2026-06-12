'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

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
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
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

function OfferEndsBadge({ label }: { label: string }) {
  return (
    <div className="bg-accent/10 mb-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px]">
      <span className="bg-accent h-1.5 w-1.5 shrink-0 rounded-full" />
      <span className="font-body text-accent text-[11px] font-medium">{label}</span>
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="bg-accent/10 text-accent inline-flex items-center rounded-full px-2.5 py-[5px] font-mono text-[10px] tracking-[1.2px]">
      {tag}
    </span>
  );
}

/** Promo card — light at rest, transitions to dark highlighted with green glow on hover */
function PromoCard({
  promo,
  endsLabel,
  claimLabel,
  activeLabel,
  claimHref,
}: {
  promo: CmsPromoItem;
  endsLabel: string | null;
  claimLabel: string;
  activeLabel: string;
  claimHref: string;
}) {
  return (
    <div className="hover:border-accent/25 dark:hover:border-accent/25 group relative isolate overflow-hidden rounded-[20px] border border-transparent bg-[#f2f2f2] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[#07090D] hover:shadow-[0_20px_56px_rgba(0,176,80,0.18)] dark:border-white/[0.06] dark:bg-[#111111] dark:hover:bg-[#07090D]">
      {/* Green glow blob — fades in on hover */}
      <span
        className="pointer-events-none absolute -top-[60px] left-[12%] h-[220px] w-[220px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
        <span className="font-mono text-[10px] tracking-[1px] text-[#6b7280] transition-colors duration-300 group-hover:text-white/50 dark:text-white/40">
          {activeLabel}
        </span>
      </div>

      <div className="mt-[22px]">
        {promo.valueDisplay && (
          <p className="text-accent font-sans text-[36px] font-semibold leading-none tracking-[-0.72px]">
            {promo.valueDisplay}
          </p>
        )}
        <p className="mt-2 font-sans text-[20px] font-semibold leading-snug tracking-[-0.4px] text-[#111] transition-colors duration-300 group-hover:text-white dark:text-white">
          {promo.title}
        </p>
        <p className="mt-2.5 text-[13.5px] leading-[1.55] text-[#6b7280] transition-colors duration-300 group-hover:text-white/65 dark:text-white/60">
          {promo.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 pt-3.5">
        <span className="font-mono text-[11.5px] leading-snug text-[#6b7280] transition-colors duration-300 group-hover:text-white/45 dark:text-white/40">
          {promo.terms ?? ''}
        </span>
        <Link
          href={claimHref}
          className="group-hover:bg-accent inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#111] px-3.5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 active:scale-[0.97] group-hover:shadow-[0_6px_20px_rgba(0,176,80,0.45)] dark:bg-white/[0.08]"
        >
          {claimLabel}
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
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <h1 className="mb-4 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-[#111] xl:text-[48px] xl:tracking-[-1.5px] dark:text-white">
            {t('heroLine1')}
            <br />
            <span className="text-[#111] dark:text-white">{accentPrefix}</span>
            <span className="text-accent">{accentGreen}</span>
          </h1>
          <p className="max-w-[320px] text-[14px] leading-[1.55] text-[#6b7280] xl:max-w-[680px] dark:text-white/60">
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
              {items.map((promo) => {
                const endsLabel = offerEndsLabel(promo.activeTo);
                const claimLabel = promo.ctaLabel ?? t('claimBtn');
                const claimHref = promo.ctaHref ?? `/${locale}/register`;
                const activeLabel = t('activeLabel');

                return (
                  <PromoCard
                    key={promo.id}
                    promo={promo}
                    endsLabel={endsLabel}
                    claimLabel={claimLabel}
                    activeLabel={activeLabel}
                    claimHref={claimHref}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── T&C band ───────────────────────────────────────────── */}
      <section className="rounded-t-[32px] bg-black px-5 pb-14 pt-10 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
          <SectionKicker className="mb-3 [&>span:first-child]:bg-white/40 [&>span:last-child]:text-white/60">
            {t('termsKicker')}
          </SectionKicker>

          <h2 className="mb-3 font-sans text-[24px] font-semibold leading-[1.15] tracking-[-0.48px] text-white xl:text-[28px]">
            {t('termsHeading')}
          </h2>
          <p className="mb-5 max-w-[340px] text-[13px] leading-[1.55] text-white/55 xl:max-w-[680px] xl:text-[15px]">
            {t('termsDesc')}
          </p>

          {/* Mobile: single button · Desktop: two buttons + "Updated each month" */}
          <div className="flex flex-col items-start gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-3">
              <Link
                href={`/${locale}/legal`}
                className="bg-accent inline-flex items-center gap-2 rounded-[10px] px-7 py-3.5 text-[14px] font-medium text-white shadow-[0_10px_24px_-6px_rgba(0,176,79,0.3)] transition-all duration-150 hover:bg-[#00c85a] hover:shadow-[0_12px_28px_-6px_rgba(0,176,79,0.45)] active:scale-95"
              >
                {t('termsLink')}
                <ArrowRight size={14} />
              </Link>
              <button className="hidden items-center justify-center rounded-[10px] border border-white/20 px-7 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:border-white/40 hover:bg-white/[0.05] active:scale-95 xl:inline-flex">
                {t('termsDownloadPdf')}
              </button>
            </div>
            <p className="hidden font-mono text-[10px] tracking-[1px] text-white/35 xl:block">
              ---{t('termsUpdated')}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
