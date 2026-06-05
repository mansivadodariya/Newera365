'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type TagType = 'NEW' | 'MONTHLY' | 'EVERGREEN' | 'PERMANENT' | 'PERK';

const TAG_STYLES: Record<TagType, string> = {
  NEW: 'bg-accent text-white',
  MONTHLY: 'bg-[#F59E0B] text-white',
  EVERGREEN: 'bg-[#3B82F6] text-white',
  PERMANENT: 'bg-[#8B5CF6] text-white',
  PERK: 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
};

const CARD_GRADIENTS: Record<TagType, string> = {
  NEW: 'from-accent/[0.07] to-[#FAFAF9] dark:from-accent/[0.12] dark:to-surface',
  MONTHLY: 'from-[#F59E0B]/[0.07] to-[#FAFAF9] dark:from-[#F59E0B]/[0.12] dark:to-surface',
  EVERGREEN: 'from-[#3B82F6]/[0.07] to-[#FAFAF9] dark:from-[#3B82F6]/[0.12] dark:to-surface',
  PERMANENT: 'from-[#8B5CF6]/[0.07] to-[#FAFAF9] dark:from-[#8B5CF6]/[0.12] dark:to-surface',
  PERK: 'from-[#111111]/[0.05] to-[#FAFAF9] dark:from-white/[0.05] dark:to-surface',
};

const PROMOS = [
  {
    id: 'welcome',
    tagType: 'NEW' as TagType,
    value: 'Up to $5,000',
    title: 'Welcome boost',
    desc: 'Match your first deposit up to $5,000. Credited within 24 hours.',
    footer: 'Min $200 deposit · 30 day rollout',
  },
  {
    id: 'rebate',
    tagType: 'MONTHLY' as TagType,
    value: '50% rebate',
    title: 'Active trader rebate',
    desc: 'Earn half your commissions back when you trade 100+ lots per month.',
    footer: 'Standard & Raw accounts',
  },
  {
    id: 'refer',
    tagType: 'EVERGREEN' as TagType,
    value: '$500',
    title: 'Refer a friend',
    desc: 'Earn $500 cash for every friend who funds and trades 5 lots.',
    footer: 'Unlimited referrals',
  },
  {
    id: 'islamic',
    tagType: 'PERMANENT' as TagType,
    value: '0 swap',
    title: 'Islamic accounts',
    desc: 'Swap-free accounts that comply with Sharia. No hidden admin fees.',
    footer: 'Available for verified accounts',
  },
  {
    id: 'vps',
    tagType: 'PERK' as TagType,
    value: 'Free VPS',
    title: 'EA traders bonus',
    desc: 'Free VPS hosting for $5k+ accounts running automated strategies.',
    footer: 'Min balance $5,000',
  },
] as const;

// Colour-key → Tailwind class map (tagColor from CMS)
const CMS_TAG_STYLES: Record<string, string> = {
  accent: 'bg-accent text-white',
  amber: 'bg-[#F59E0B] text-white',
  blue: 'bg-[#3B82F6] text-white',
  purple: 'bg-[#8B5CF6] text-white',
  red: 'bg-[#EF4444] text-white',
  grey: 'bg-[#6B7280] text-white',
};

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
  tag?: string | null;
  tagColor?: string | null;
  description: string;
  terms?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isHighlighted?: boolean | null;
}

interface PromoPageProps {
  promos?: CmsPromoItem[];
}

export function PromoPage({ promos: cmsPromos }: PromoPageProps) {
  const locale = useLocale();
  const t = useTranslations('promos');
  const useCms = cmsPromos && cmsPromos.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Promo cards */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[14px] md:max-w-2xl xl:max-w-[1200px]">
          {PROMOS.map((promo) => (
            <div
              key={promo.id}
              className={`shadow-card dark:shadow-card-dark flex flex-col gap-0 overflow-hidden rounded-[22px] bg-gradient-to-br ${CARD_GRADIENTS[promo.tagType]}`}
            >
              {/* Card top: tag row */}
              <div className="flex items-center justify-between px-5 pt-5">
                <span
                  className={`font-body inline-flex h-5 items-center rounded-full px-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${TAG_STYLES[promo.tagType]}`}
                >
                  {promo.tagType}
                </span>
                <span className="bg-accent/10 text-accent font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.12em]">
                  {t('activeLabel')}
                </span>
              </div>

              {/* Value */}
              <div className="px-5 pt-3">
                <p className="text-accent font-sans text-[36px] font-semibold leading-[100%] tracking-[-0.02em]">
                  {promo.value}
                </p>
              </div>

              {/* Title + desc */}
              <div className="px-5 pt-2">
                <p className="text-foreground mb-1 font-sans text-[17px] font-semibold">
                  {promo.title}
                </p>
                <p className="font-body text-muted text-[13px] leading-[1.55]">{promo.desc}</p>
              </div>

              {/* Divider */}
              <div className="dark:border-border mx-5 mt-4 border-t border-[#e5e7eb]" />

              {/* Footer + CTA */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-muted font-mono text-[11px]">{promo.footer}</span>
                <Link
                  href={`/${locale}/register`}
                  className="bg-accent hover:bg-accent-hover font-body flex h-8 items-center gap-1.5 rounded-full px-4 text-[12px] font-medium text-white transition-colors"
                >
                  {t('claimBtn')}
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
          ))}
        </div>
      </section>

      {/* T&C band */}
      <section className="rounded-t-[32px] bg-[#000000] px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/60 [&>span:last-child]:text-white/60">
            {t('termsKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            {t('termsHeading')}
          </h2>
          <p className="font-body mb-7 max-w-[350px] text-[13px] leading-relaxed text-white/60">
            {t('termsDesc')}
          </p>
          <Link
            href={`/${locale}/legal`}
            className="font-body bg-accent flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors"
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
