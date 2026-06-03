'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CmsAccountType {
  id: number;
  name: string;
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  platforms: string[];
  commission?: string | null;
  features?: { value: string; id?: string | null }[] | null;
  isPopular?: boolean | null;
  sortOrder?: number | null;
  status: string;
}

interface AccountsPageProps {
  cmsAccounts?: CmsAccountType[];
}

// ─── Static fallback data (Figma spec) ──────────────────────────────────────

const STATIC_ACCOUNTS = [
  {
    id: 'standard',
    badge: 'POPULAR',
    name: 'Standard',
    subtitle: 'For active retail traders',
    isPopular: true,
    headerGradient:
      'radial-gradient(ellipse at 50% 210%, rgba(18,107,48,1) 0%, rgba(11,66,31,1) 50%, rgba(5,26,13,1) 100%)',
    commission: '$0',
    commissionSub: '(per lot per side)',
    spreadsFrom: '1.2',
    spreadsSub: '(pips)',
    minDeposit: '$50',
    features: ['All 2000+ instruments', 'Zero commission', '24/7 expert support'],
    ctaLabel: 'Start Trading now',
    ctaFilled: true,
  },
  {
    id: 'raw',
    badge: 'PRO',
    name: 'Professional',
    subtitle: 'For high-volume traders',
    isPopular: false,
    headerGradient:
      'radial-gradient(ellipse at 50% 210%, rgba(28,38,43,1) 0%, rgba(17,23,28,1) 50%, rgba(5,8,13,1) 100%)',
    commission: '$1.5',
    commissionSub: '(per lot per side)',
    spreadsFrom: '0.0',
    spreadsSub: '(pips)',
    minDeposit: '$2,500',
    features: ['Raw spreads from 0.0', 'Priority execution', 'Dedicated account manager'],
    ctaLabel: 'Start Trading now',
    ctaFilled: false,
  },
  {
    id: 'swap-free',
    badge: 'ISLAMIC',
    name: 'Swap-Free',
    subtitle: 'Sharia-compliant, no swaps',
    isPopular: false,
    headerGradient:
      'radial-gradient(ellipse at 50% 210%, rgba(28,38,43,1) 0%, rgba(17,23,28,1) 50%, rgba(5,8,13,1) 100%)',
    commission: '$0',
    commissionSub: '(per lot per side)',
    spreadsFrom: '1.4',
    spreadsSub: '(pips)',
    minDeposit: '$50',
    features: ['No overnight swaps', 'Sharia-compliant structure', 'Full market access'],
    ctaLabel: 'Start Trading now',
    ctaFilled: false,
  },
] as const;

const MATRIX_ROWS = [
  { feature: 'MetaTrader 5', std: true, raw: true, vip: true },
  { feature: 'Web & Mobile', std: true, raw: true, vip: true },
  { feature: 'Expert Advisors', std: true, raw: true, vip: true },
  { feature: 'Hedging', std: true, raw: true, vip: true },
  { feature: 'Dedicated dealer', std: false, raw: false, vip: true },
  { feature: 'Priority withdrawals', std: false, raw: true, vip: true },
  { feature: 'Free VPS hosting', std: false, raw: true, vip: true },
  { feature: 'Custom spreads', std: false, raw: false, vip: true },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Yes">
      <path
        d="M2.5 7l3 3 6-6"
        stroke="#00b050"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AccountsPage({ cmsAccounts }: AccountsPageProps) {
  const locale = useLocale();
  const t = useTranslations('accounts');

  const staticBadges = [t('badgePopular'), t('badgePro'), t('badgeIslamic')] as const;
  const staticSubtitles = [t('subtitleStandard'), t('subtitleRaw'), t('subtitleSwapFree')] as const;

  // Build display accounts from CMS data + static defaults
  const displayAccounts =
    cmsAccounts && cmsAccounts.length > 0
      ? cmsAccounts.map((cms, i) => {
          const fallback = STATIC_ACCOUNTS[i % STATIC_ACCOUNTS.length];
          return {
            id: cms.id,
            badge: cms.isPopular
              ? t('badgePopular')
              : (staticBadges[i % staticBadges.length] ?? t('badgePro')),
            name: cms.name,
            subtitle: staticSubtitles[i % staticSubtitles.length] ?? t('subtitleStandard'),
            isPopular: Boolean(cms.isPopular),
            headerGradient: cms.isPopular
              ? 'radial-gradient(ellipse at 50% 210%, rgba(18,107,48,1) 0%, rgba(11,66,31,1) 50%, rgba(5,26,13,1) 100%)'
              : 'radial-gradient(ellipse at 50% 210%, rgba(28,38,43,1) 0%, rgba(17,23,28,1) 50%, rgba(5,8,13,1) 100%)',
            commission: cms.commission ?? '$0',
            commissionSub: t('perLotSide'),
            spreadsFrom: cms.spreadFrom ?? '—',
            spreadsSub: t('pips'),
            minDeposit: `$${cms.minDeposit.toLocaleString('en-US')}`,
            features: cms.features?.map((f) => f.value) ?? fallback?.features ?? [],
            ctaLabel: t('startTrading'),
            ctaFilled: Boolean(cms.isPopular),
          };
        })
      : STATIC_ACCOUNTS.map((a, i) => ({
          ...a,
          id: a.id,
          badge: staticBadges[i] ?? a.badge,
          subtitle: staticSubtitles[i] ?? a.subtitle,
          commissionSub: t('perLotSide'),
          spreadsSub: t('pips'),
          ctaLabel: t('startTrading'),
        }));

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-background px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-[#111] xl:text-[48px] dark:text-white">
            <p>{t('heroLine1')}</p>
            <p>{t('heroLine2')}</p>
            <p className="text-accent">{t('heroAccent')}</p>
          </div>
          <div className="h-[16px]" />
          <p className="font-body max-w-[320px] text-[14px] leading-[1.55] text-[#6b7280]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Account Cards ─────────────────────────────────────────────────── */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-start xl:gap-6">
          {displayAccounts.map((account) => (
            <div
              key={String(account.id)}
              className={`w-full overflow-hidden rounded-[20px] bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.08)] xl:flex-1 dark:bg-[#1a1c22] ${
                account.isPopular ? 'border-2 border-[#00b050]' : ''
              }`}
            >
              {/* Gradient header */}
              <div
                className="flex flex-col items-center gap-[6px] pb-[34px] pt-[26px]"
                style={{ background: account.headerGradient }}
              >
                {/* Badge */}
                <span className="font-body rounded-[20px] bg-[#00b050] px-[12px] py-[5px] text-[11px] font-bold tracking-[0.6px] text-[#111]">
                  {account.badge}
                </span>
                <p className="font-body text-[15px] font-normal text-white/75">
                  {t('cardAccountLabel')}
                </p>
                <p className="font-body text-[30px] font-bold text-[#f0f0f0]">{account.name}</p>
                <p className="font-body text-[13px] text-white/70">{account.subtitle}</p>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-[18px] px-[22px] py-[28px]">
                {/* Trading Platform row */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[15px] font-medium text-[#111] dark:text-white">
                    {t('tradingPlatform')}
                  </span>
                  <span className="font-body text-[15px] font-medium text-[#111] dark:text-white">
                    MetaTrader 5
                  </span>
                </div>
                <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                {/* Commission */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-px">
                    <span className="font-body text-[15px] font-medium text-[#111] dark:text-white">
                      {t('commission')}
                    </span>
                    <span className="font-body text-[12px] text-[#6b7380]">
                      {account.commissionSub}
                    </span>
                  </div>
                  <span className="font-sans text-[26px] font-bold text-[#111] dark:text-white">
                    {account.commission}
                  </span>
                </div>
                <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                {/* Spreads from */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-px">
                    <span className="font-body text-[15px] font-medium text-[#111] dark:text-white">
                      {t('spreadsFrom')}
                    </span>
                    <span className="font-body text-[12px] text-[#6b7380]">
                      {account.spreadsSub}
                    </span>
                  </div>
                  <span className="font-sans text-[26px] font-bold text-[#111] dark:text-white">
                    {account.spreadsFrom}
                  </span>
                </div>
                <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                {/* Min deposit */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[15px] font-medium text-[#111] dark:text-white">
                    {t('minDeposit')}
                  </span>
                  <span className="font-sans text-[20px] font-bold text-[#111] dark:text-white">
                    {account.minDeposit}
                  </span>
                </div>
                <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                {/* Features */}
                <div className="flex flex-col gap-[11px]">
                  {(account.features as string[]).slice(0, 3).map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-[10px]">
                      <span className="font-body text-[13px] font-bold text-[#00b050]">✓</span>
                      <span className="font-body text-[13px] text-[#6b7280]">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?account=${String(account.id)}`}
                  className={`font-body flex h-[49px] w-full items-center justify-center rounded-[10px] text-[15px] font-semibold transition-opacity hover:opacity-90 ${
                    account.ctaFilled
                      ? 'bg-[#00b050] text-[#f0f0f0]'
                      : 'border-[1.5px] border-[#00b050] bg-white text-[#111] dark:bg-transparent dark:text-white'
                  }`}
                >
                  {account.ctaLabel}
                </Link>

                {/* Demo link */}
                <Link
                  href={`/${locale}/demo-account`}
                  className="font-body text-center text-[12px] font-bold tracking-[0.6px] text-[#00b050]"
                >
                  {t('tryFreeDemo')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Matrix ────────────────────────────────────────────────── */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Kicker */}
          <div className="mb-3 flex items-center gap-[6px]">
            <span className="h-px w-[18px] bg-white/40" />
            <span className="font-mono text-[10px] uppercase tracking-[1.8px] text-white/60">
              {t('featureMatrixKicker')}
            </span>
          </div>

          <h2 className="mb-6 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white">
            {t('featureMatrixHeading')}
          </h2>

          {/* Table */}
          <div className="overflow-hidden rounded-[16px] bg-white/[0.06]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_65px_65px_65px] bg-white/[0.04] px-[14px] py-3">
              <span className="font-mono text-[9px] uppercase tracking-[1.08px] text-white/55">
                {t('featureCol')}
              </span>
              {[t('stdCol'), t('rawCol'), t('vipCol')].map((h) => (
                <div key={h} className="flex items-center justify-center">
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[1.08px] ${h === 'Raw' ? 'text-[#00b050]' : 'text-white/55'}`}
                  >
                    {h}
                  </span>
                </div>
              ))}
            </div>

            {MATRIX_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_65px_65px_65px] px-[14px] py-[11px] ${
                  i < MATRIX_ROWS.length - 1 ? 'border-b border-white/[0.06]' : ''
                }`}
              >
                <span className="font-body text-[12px] text-white/85">{row.feature}</span>
                {[row.std, row.raw, row.vip].map((val, j) => (
                  <div key={j} className="flex items-center justify-center">
                    {val ? (
                      <Check />
                    ) : (
                      <span className="font-body text-[14px] text-white/30">—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
