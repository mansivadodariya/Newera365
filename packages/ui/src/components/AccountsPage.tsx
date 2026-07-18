'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollReveal';
import { SectionKicker } from './SectionKicker';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CmsAccountType {
  id: number;
  name: string;
  nameAr?: string | null;
  badge?: 'free' | 'popular' | 'value' | 'pro' | 'islamic' | null;
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  platforms: string[];
  commission?: string | null;
  features?: { value: string; id?: string | null }[] | null;
  featuresAr?: string | null;
  isPopular?: boolean | null;
  sortOrder?: number | null;
  status: string;
}

interface AccountsPageProps {
  cmsAccounts?: CmsAccountType[];
}

// Header background gradients. The dark variant is the resting state for every
// card; the green variant fades in on hover only (client feedback: never shown
// by default, popular or not).
const DARK_HEADER_GRADIENT =
  'radial-gradient(ellipse at 50% 210%, rgba(28,38,43,1) 0%, rgba(17,23,28,1) 50%, rgba(5,8,13,1) 100%)';
const GREEN_HEADER_GRADIENT =
  'radial-gradient(ellipse at 50% 210%, rgba(18,107,48,1) 0%, rgba(11,66,31,1) 50%, rgba(8,46,22,1) 75%, rgba(5,26,13,1) 100%)';

const AR_FEATURE_VALUES: Record<string, string> = {
  'Full platform access': 'وصول كامل للمنصة',
  'Real-time market data': 'بيانات السوق الفعلية',
  'No deposit required': 'لا يلزم إيداع',
  'All 2000+ instruments': 'جميع الأدوات الـ 2000+',
  'Zero commission': 'صفر عمولة',
  '24/7 expert support': 'دعم خبراء 24/7',
  'No overnight swaps': 'بدون فوائد بيعية',
  'Sharia-compliant structure': 'بنية متوافقة مع الشريعة الإسلامية',
  'Full market access': 'وصول كامل للسوق',
  'Raw spreads from 0.0': 'فروق خام من 0.0',
  'Priority execution': 'تنفيذ ذو أولوية',
  'Dedicated account manager': 'مدير حساب مخصص',
  'Swap-free available on request': 'خيار بدون فوائد تبييت عند الطلب',
  'Interbank raw pricing': 'تسعير خام من البنوك مباشرة',
  'Metals commission $10 per lot': 'عمولة المعادن 10 دولار لكل عقد',
  'Built for scalpers and EAs': 'مصمم للمضاربة السريعة والأنظمة الآلية',
  'Zero commission trading': 'تداول بدون عمولة',
  'Custom spreads and priority execution': 'فروق مخصصة وتنفيذ ذو أولوية',
};

const MATRIX_ROW_DATA = [
  { id: 'mt5', featureKey: 'featureMT5' as const, std: true, raw: true, vip: true },
  { id: 'web', featureKey: 'featureWebMobile' as const, std: true, raw: true, vip: true },
  { id: 'ea', featureKey: 'featureEA' as const, std: true, raw: true, vip: true },
  { id: 'hedging', featureKey: 'featureHedging' as const, std: true, raw: true, vip: true },
  {
    id: 'dealer',
    featureKey: 'featureDedicatedDealer' as const,
    std: false,
    raw: false,
    vip: true,
  },
  {
    id: 'priority',
    featureKey: 'featurePriorityWithdrawals' as const,
    std: false,
    raw: true,
    vip: true,
  },
  { id: 'vps', featureKey: 'featureFreeVPS' as const, std: false, raw: true, vip: true },
  { id: 'spreads', featureKey: 'featureCustomSpreads' as const, std: false, raw: false, vip: true },
];

// Universal execution & risk conditions that apply to every account tier (#5).
// `kind` picks the value treatment: 'num' = tabular LTR figure (accent when the
// zero/best value), 'allow' = accent tick + label, 'text' = plain. Values are
// i18n strings — client-confirmed marketing facts, one-line to update.
const TRADING_CONDITIONS = [
  { labelKey: 'condExecutionLabel', valueKey: 'condExecutionValue', kind: 'text' },
  { labelKey: 'condSpreadLabel', valueKey: 'condSpreadValue', kind: 'num', best: true },
  { labelKey: 'condLeverageLabel', valueKey: 'condLeverageValue', kind: 'num' },
  { labelKey: 'condMarginLabel', valueKey: 'condMarginValue', kind: 'num' },
  { labelKey: 'condStopoutLabel', valueKey: 'condStopoutValue', kind: 'num' },
  { labelKey: 'condHedgingLabel', valueKey: 'condHedgingValue', kind: 'allow' },
  { labelKey: 'condScalpingLabel', valueKey: 'condScalpingValue', kind: 'allow' },
  { labelKey: 'condEaLabel', valueKey: 'condEaValue', kind: 'allow' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-label="Yes"
      className="text-accent"
    >
      <path
        d="M2.5 7l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Crown badge for the recommended card — overhangs the card's top edge, so it
// lives on the (overflow-visible) wrapper, not inside the overflow-hidden card.
// Star + accent gradient + a slow sheen sweep that draws the eye without
// pulsing (reduced-motion users get the static badge).
function RecommendedBadge({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2">
      <span className="relative flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-[#00c95d] to-[#009247] px-3.5 py-[6px] shadow-[0_10px_24px_-6px_rgba(0,176,80,0.75)] ring-1 ring-inset ring-white/30">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="text-[#04120a]"
        >
          <path d="M12 2.2l2.7 6.2 6.7.5-5.1 4.4 1.6 6.6L12 17.9 6.1 20.9l1.6-6.6L2.6 8.9l6.7-.5L12 2.2Z" />
        </svg>
        <span className="font-body whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.7px] text-[#04120a]">
          {label}
        </span>
        {/* Sheen sweep — width-independent (animates background-position). */}
        <span
          aria-hidden="true"
          className="motion-safe:animate-badge-shine absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.65) 50%, transparent 65%)',
            backgroundSize: '220% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </span>
    </div>
  );
}

// Zero is the strongest value for a fee/spread/deposit, so it reads in accent
// on the card spec rows.
function isZeroNumeric(value: string): boolean {
  const m = value.replace(/[$,]/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) === 0 : false;
}

// Flags the winning value in a matrix row so it renders in accent. `dir` picks
// the winning direction: 'min' for fees/spreads/deposits, 'max' for leverage,
// 'none' to skip (e.g. platform lists). Rows where every value is equal
// highlight nothing (no false "winner").
function bestFlags(values: string[], dir: 'min' | 'max' | 'none'): boolean[] {
  if (dir === 'none') return values.map(() => false);
  const nums = values.map((v) => {
    const parts = v.replace(/[$,]/g, '').match(/[\d.]+/g);
    const last = parts?.[parts.length - 1];
    if (last === undefined) return null;
    const n = parseFloat(last);
    return Number.isNaN(n) ? null : n;
  });
  const valid = nums.filter((n): n is number => n !== null);
  if (new Set(valid).size < 2) return values.map(() => false);
  const target = dir === 'min' ? Math.min(...valid) : Math.max(...valid);
  return nums.map((n) => n !== null && n === target);
}

// ─── Component ───────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  mt5: 'MT5',
  'web-trader': 'Web',
  mobile: 'Mobile',
};

export function AccountsPage({ cmsAccounts }: AccountsPageProps) {
  const locale = useLocale();
  const t = useTranslations('accounts');
  // Comparison emphasis is interactive, not fixed: hovering a matrix column
  // lights it up. Nothing is highlighted at rest (client feedback).
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const matrixRows = MATRIX_ROW_DATA.map((r) => ({ ...r, feature: t(r.featureKey) }));

  // Badge labels per the client's ask: every live card carries one.
  // popular -> "Recommended" (crown), value -> "Best Value", pro -> "Professionals Choice".
  function getBadgeLabel(badge: string | null | undefined, isPopular?: boolean | null): string {
    if (badge === 'free') return t('badgeFree');
    if (badge === 'popular' || isPopular) return t('badgePopular');
    if (badge === 'value') return t('badgeValue');
    if (badge === 'islamic') return t('badgeIslamic');
    return t('badgePro');
  }

  function getSubtitle(badge: string | null | undefined): string {
    if (badge === 'free') return t('subtitleDemo');
    if (badge === 'popular') return t('subtitleStandard');
    if (badge === 'islamic') return t('subtitleSwapFree');
    if (badge === 'value') return t('subtitleRaw');
    return t('subtitlePro');
  }

  // CMS spread values are often entered as "From 1.2 pip", but the card already
  // labels this row "Spreads from (pips)" — so we display only the numeric value
  // to match the Figma design (e.g. "1.2", "0.0").
  function cleanSpread(value: string): string {
    const match = value.match(/[\d.]+/);
    return match ? match[0] : value;
  }

  // Same for commission: CMS may hold "$1.5 per lot" but the sub-label already
  // reads "(per lot per side)", so the card shows just "$1.5" per Figma.
  function cleanCommission(value: string): string {
    const match = value.match(/\$?\d+(?:\.\d+)?/);
    return match ? (match[0].startsWith('$') ? match[0] : `$${match[0]}`) : value;
  }

  const BADGE_NAMES = {
    free: 'nameDemo',
    popular: 'nameStandard',
    islamic: 'nameIslamic',
    pro: 'nameProfessional',
  } as const;

  const displayAccounts = (cmsAccounts ?? []).map((cms) => {
    const isAr = locale === 'ar';
    const badgeValue = cms.badge ?? (cms.isPopular ? 'popular' : null);
    const i18nNameKey = badgeValue
      ? BADGE_NAMES[badgeValue as keyof typeof BADGE_NAMES]
      : undefined;
    const displayName = isAr
      ? cms.nameAr || (i18nNameKey ? t(i18nNameKey) : null) || cms.name
      : cms.name;
    const arFeatures = cms.featuresAr
      ? cms.featuresAr
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const rawFeatures =
      isAr && arFeatures.length > 0
        ? arFeatures
        : isAr
          ? (cms.features?.map((f) => AR_FEATURE_VALUES[f.value] ?? f.value) ?? [])
          : (cms.features?.map((f) => f.value) ?? []);
    return {
      id: cms.id,
      badge: getBadgeLabel(badgeValue, cms.isPopular),
      name: displayName,
      subtitle: getSubtitle(badgeValue),
      isDemo: badgeValue === 'free',
      isPopular: badgeValue === 'popular' || !!cms.isPopular,
      commission: cleanCommission(cms.commission ?? '$0'),
      commissionSub: t('perLotSide'),
      spreadsFrom: cms.spreadFrom ? cleanSpread(cms.spreadFrom) : '—',
      spreadsSub: t('pips'),
      minDeposit:
        badgeValue === 'free' ? t('virtualDeposit') : `$${cms.minDeposit.toLocaleString('en-US')}`,
      leverage: cms.leverage ? (cms.leverage.match(/1:\d+/)?.[0] ?? cms.leverage) : '—',
      features: rawFeatures,
      ctaLabel: t('startTrading'),
    };
  });

  // ── Comparison matrix data ──────────────────────────────────────────────
  // Columns = live (non-demo) CMS accounts, capped at 3. The boolean
  // MATRIX_ROW_DATA maps by column index (std/raw/vip) — reordering accounts
  // in the CMS shifts the boolean columns; acceptable, they're marketing-static.
  const isArLocale = locale === 'ar';
  const matrixAccounts = (cmsAccounts ?? [])
    .filter((a) => a.badge !== 'free' && a.minDeposit !== 0)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, 3);
  const matrixColNames = matrixAccounts.length
    ? matrixAccounts.map((a) => (isArLocale ? a.nameAr || a.name : a.name))
    : [t('stdCol'), t('rawCol'), t('vipCol')];
  const popularIdx = matrixAccounts.findIndex((a) => a.badge === 'popular' || a.isPopular);
  const matrixValueRows = (
    matrixAccounts.length
      ? [
          {
            id: 'minDeposit',
            label: t('matrixMinDeposit'),
            dir: 'min' as const,
            values: matrixAccounts.map((a) => `$${a.minDeposit.toLocaleString('en-US')}`),
          },
          {
            id: 'spread',
            label: t('matrixSpreadFrom'),
            dir: 'min' as const,
            values: matrixAccounts.map((a) => (a.spreadFrom ? cleanSpread(a.spreadFrom) : '—')),
          },
          {
            id: 'commission',
            label: t('matrixCommission'),
            dir: 'min' as const,
            values: matrixAccounts.map((a) => (a.commission ? cleanCommission(a.commission) : '—')),
          },
          {
            id: 'leverage',
            label: t('matrixLeverage'),
            dir: 'max' as const,
            values: matrixAccounts.map((a) => a.leverage?.match(/1:\d+/)?.[0] ?? a.leverage ?? '—'),
          },
          {
            id: 'platforms',
            label: t('matrixPlatforms'),
            dir: 'none' as const,
            values: matrixAccounts.map((a) =>
              a.platforms?.length
                ? a.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(' · ')
                : 'MT5',
            ),
          },
        ]
      : []
  ).map((row) => ({ ...row, best: bestFlags(row.values, row.dir) }));
  const matrixGridStyle = {
    gridTemplateColumns: `minmax(170px, 1.3fr) repeat(${matrixColNames.length}, minmax(122px, 1fr))`,
  };

  return (
    <div className="bg-transparent">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-foreground text-display font-sans [text-wrap:balance]">
            <p>{t('heroLine1')}</p>
            <p>
              {t('heroLine2')} <span>{t('heroAccent')}</span>
            </p>
          </div>
          <div className="h-[18px]" />
          <p className="font-body text-lead text-muted max-w-[720px] dark:text-white/60">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Account Cards ─────────────────────────────────────────────────── */}
      <section className="bg-transparent px-5 pb-10">
        <ScrollReveal className="mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-stretch xl:gap-6">
          {displayAccounts.length === 0 && (
            <p className="font-body text-muted w-full py-12 text-center text-[14px]">
              {t('noAccounts')}
            </p>
          )}
          {displayAccounts.map((account) => (
            <div
              key={String(account.id)}
              className={`relative flex w-full xl:flex-1 ${account.isPopular ? 'xl:z-10' : ''}`}
            >
              {account.isPopular && <RecommendedBadge label={account.badge} />}
              <div className="border-border shadow-card group flex h-full w-full flex-col overflow-hidden rounded-[20px] border bg-white transition-all duration-300 hover:border-[#00b050] hover:shadow-[0_12px_40px_-8px_rgba(0,176,80,0.4)] dark:border-white/[0.06] dark:bg-[#1a1c22]">
                {/* Gradient header — dark by default, green on hover only */}
                <div className="relative flex flex-col items-center gap-[6px] overflow-hidden pb-[34px] pt-[26px]">
                  <div
                    className="absolute inset-0"
                    style={{ background: DARK_HEADER_GRADIENT }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: GREEN_HEADER_GRADIENT }}
                    aria-hidden="true"
                  />
                  <div className="relative flex flex-col items-center gap-[6px]">
                    {/* Tier badge — every card carries its own label (incl. the
                      "Most Popular" recommendation) but no fixed highlight. */}
                    {account.badge && (
                      <span
                        className={`font-body rounded-[20px] px-[13px] py-[5px] text-[12px] font-bold tracking-[0.6px] ${
                          account.isPopular ? 'invisible' : 'bg-[#00b050] text-foreground'
                        }`}
                      >
                        {account.badge}
                      </span>
                    )}
                    <p className="font-body text-[15px] font-normal text-white/75">
                      {t('cardAccountLabel')}
                    </p>
                    <p className="font-body text-[32px] font-bold text-white">{account.name}</p>
                    <p className="font-body text-[14px] text-white/70">{account.subtitle}</p>
                  </div>
                </div>

                {/* Card body — flex-1 so all cards stretch to equal height; the
                  features block absorbs the slack, pinning CTAs to the bottom */}
                <div className="flex flex-1 flex-col gap-[18px] px-[22px] py-[28px]">
                  {/* Trading Platform row */}
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[15px] font-medium text-foreground dark:text-white">
                      {t('tradingPlatform')}
                    </span>
                    <span className="font-body text-[15px] font-medium text-foreground dark:text-white">
                      MetaTrader 5
                    </span>
                  </div>
                  <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                  {/* Commission */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-px">
                      <span className="font-body text-[15px] font-medium text-foreground dark:text-white">
                        {t('commission')}
                      </span>
                      <span className="font-body text-caption text-muted">
                        {account.commissionSub}
                      </span>
                    </div>
                    <span
                      dir="ltr"
                      className={`font-sans text-[28px] font-bold tabular-nums ${
                        isZeroNumeric(account.commission)
                          ? 'text-accent'
                          : 'text-foreground dark:text-white'
                      }`}
                    >
                      {account.commission}
                    </span>
                  </div>
                  <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                  {/* Spreads from */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-px">
                      <span className="font-body text-[15px] font-medium text-foreground dark:text-white">
                        {t('spreadsFrom')}
                      </span>
                      <span className="font-body text-caption text-muted">
                        {account.spreadsSub}
                      </span>
                    </div>
                    <span
                      dir="ltr"
                      className={`whitespace-nowrap font-sans text-[28px] font-bold tabular-nums ${
                        isZeroNumeric(account.spreadsFrom)
                          ? 'text-accent'
                          : 'text-foreground dark:text-white'
                      }`}
                    >
                      {account.spreadsFrom}
                    </span>
                  </div>
                  <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                  {/* Min deposit — 20px per Figma (smaller than commission/spread) */}
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[15px] font-medium text-foreground dark:text-white">
                      {t('minDeposit')}
                    </span>
                    <span
                      dir="ltr"
                      className="whitespace-nowrap font-sans text-[22px] font-bold tabular-nums text-foreground dark:text-white"
                    >
                      {account.minDeposit}
                    </span>
                  </div>
                  <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                  {/* Max leverage — reuses the matrix "Max leverage" label + CMS leverage */}
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[15px] font-medium text-foreground dark:text-white">
                      {t('matrixLeverage')}
                    </span>
                    <span
                      dir="ltr"
                      className="whitespace-nowrap font-sans text-[22px] font-bold tabular-nums text-foreground dark:text-white"
                    >
                      {account.leverage}
                    </span>
                  </div>
                  <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                  {/* Features */}
                  <div className="flex flex-1 flex-col gap-[11px]">
                    {account.features.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-center gap-[10px]">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                          className="flex-shrink-0 text-[#00b050]"
                        >
                          <path
                            d="M2.5 6.4l2.3 2.3L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="font-body text-body text-muted dark:text-white/60">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA button — deep-links to the feature matrix (signup handled by CRM) */}
                  <a
                    href="#feature-matrix"
                    className="font-body border-border group-hover:border-accent group-hover:bg-accent inline-flex items-center justify-center rounded-full border px-5 py-3 text-[13px] font-bold uppercase tracking-[0.5px] text-foreground transition-colors active:scale-[0.98] group-hover:text-[#04120a] dark:border-white/15 dark:text-white dark:group-hover:text-[#04120a]"
                  >
                    {account.isDemo ? t('exploreFeatures') : t('tryFreeDemo')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* ── Trading conditions — universal execution & risk terms (#5) ───── */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-3">
              {t('condKicker')}
            </SectionKicker>
            <div className="xl:flex xl:items-end xl:justify-between xl:gap-10">
              <h2 className="text-headline text-foreground font-sans [text-wrap:balance]">
                {t('condHeading')}
              </h2>
              <p className="font-body text-body text-muted mt-3 max-w-[42ch] xl:mt-0 dark:text-white/60">
                {t('condSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="border-border shadow-card mt-8 overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.06] dark:bg-[#14161c] dark:shadow-none">
              <div className="list-dim grid grid-cols-2 gap-px bg-[rgba(17,17,17,0.07)] md:grid-cols-4 dark:bg-white/[0.06]">
                {TRADING_CONDITIONS.map((c) => (
                  <div
                    key={c.labelKey}
                    className="group relative flex flex-col gap-2 bg-white px-5 py-5 dark:bg-[#14161c]"
                  >
                    {/* Accent rule draws across the lit tile — presence, not flight */}
                    <span
                      aria-hidden="true"
                      className="bg-accent absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 rtl:origin-right"
                    />
                    <span className="text-muted group-hover:text-accent font-mono text-[10px] uppercase tracking-[1.1px] transition-colors dark:text-white/45">
                      {t(c.labelKey)}
                    </span>
                    {c.kind === 'allow' ? (
                      <span className="text-accent flex items-center gap-1.5 font-sans text-[17px] font-semibold">
                        <Check />
                        {t(c.valueKey)}
                      </span>
                    ) : c.kind === 'num' ? (
                      <span
                        dir="ltr"
                        className={`w-fit font-sans text-[22px] font-bold tabular-nums ${
                          'best' in c && c.best ? 'text-accent' : 'text-foreground'
                        }`}
                      >
                        {t(c.valueKey)}
                      </span>
                    ) : (
                      <span className="text-foreground font-sans text-[17px] font-semibold">
                        {t(c.valueKey)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="font-body text-caption text-muted border-t border-[rgba(17,17,17,0.07)] px-5 py-3.5 dark:border-white/[0.06] dark:text-white/45">
                {t('condNote')}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Feature Matrix — readable comparison on the ink band ─────────── */}
      <section
        id="feature-matrix"
        className="ink-band rounded-t-[32px] px-5 pb-14 pt-12 xl:pb-20 xl:pt-16"
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('featureMatrixKicker')}</SectionKicker>

          <h2 className="text-headline mb-9 max-w-[24ch] font-sans text-white">
            {t('featureMatrixHeading')}
          </h2>

          {/* Horizontal scroll on mobile with a sticky first column; fits
              without scrolling from md up. */}
          <ScrollReveal className="scrollbar-hide overflow-x-auto rounded-[20px] border border-white/[0.08]">
            <div className="min-w-[640px] bg-white/[0.03] md:min-w-0">
              {/* Header row — real account names with the popular column flagged */}
              <div className="grid border-b border-white/[0.08]" style={matrixGridStyle}>
                <span className="sticky start-0 z-[1] flex items-end bg-[#0b1c11] px-5 pb-5 pt-7 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45 md:bg-transparent">
                  {t('featureCol')}
                </span>
                {matrixColNames.map((h, j) => (
                  <div
                    key={h}
                    onMouseEnter={() => setHoverCol(j)}
                    onMouseLeave={() => setHoverCol(null)}
                    className={`relative flex items-end justify-center px-2 pb-5 pt-7 transition-colors ${
                      j === hoverCol ? 'bg-accent/[0.10]' : ''
                    }`}
                  >
                    {j === popularIdx && (
                      <span className="bg-accent font-body absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-[#04120a]">
                        {t('badgePopular')}
                      </span>
                    )}
                    <span
                      className={`font-sans text-[16px] font-semibold ${
                        j === hoverCol ? 'text-accent-bright' : 'text-white'
                      }`}
                    >
                      {h}
                    </span>
                  </div>
                ))}
              </div>

              {/* Value rows — the numbers people actually compare */}
              {matrixValueRows.map((row) => (
                <div
                  key={row.id}
                  className="grid border-b border-white/[0.06] transition-colors hover:bg-accent/[0.06]"
                  style={matrixGridStyle}
                >
                  <span className="font-body sticky start-0 z-[1] bg-[#0a1810] px-5 py-4 text-[14px] text-white/80 md:bg-transparent">
                    {row.label}
                  </span>
                  {row.values.map((val, j) => (
                    <div
                      key={j}
                      onMouseEnter={() => setHoverCol(j)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={`flex items-center justify-center py-4 transition-colors ${
                        j === hoverCol ? 'bg-accent/[0.06]' : ''
                      }`}
                    >
                      <span
                        className={`px-1 text-center font-sans text-[15px] font-semibold tabular-nums ${
                          row.best[j] ? 'text-accent-bright' : 'text-white'
                        }`}
                        dir="ltr"
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Divider between values and boolean feature rows */}
              {matrixValueRows.length > 0 && (
                <div className="grid border-b border-white/[0.06]" style={matrixGridStyle}>
                  <span className="sticky start-0 z-[1] bg-[#0b1c11] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 md:bg-white/[0.02]">
                    {t('matrixFeaturesLabel')}
                  </span>
                  {matrixColNames.map((_, j) => (
                    <div
                      key={j}
                      onMouseEnter={() => setHoverCol(j)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={`transition-colors ${j === hoverCol ? 'bg-accent/[0.06]' : 'bg-white/[0.02]'}`}
                    />
                  ))}
                </div>
              )}

              {matrixRows.map((row, i) => (
                <div
                  key={row.id}
                  className={`grid transition-colors hover:bg-accent/[0.06] ${i < matrixRows.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                  style={matrixGridStyle}
                >
                  <span className="font-body sticky start-0 z-[1] bg-[#0a1810] px-5 py-4 text-[14px] text-white/80 md:bg-transparent">
                    {row.feature}
                  </span>
                  {[row.std, row.raw, row.vip].slice(0, matrixColNames.length).map((val, j) => (
                    <div
                      key={j}
                      onMouseEnter={() => setHoverCol(j)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={`flex items-center justify-center py-4 transition-colors ${
                        j === hoverCol ? 'bg-accent/[0.06]' : ''
                      }`}
                    >
                      {val ? (
                        <span className="bg-accent/[0.16] flex h-6 w-6 items-center justify-center rounded-full">
                          <Check />
                        </span>
                      ) : (
                        <span className="font-body text-[15px] text-white/25">—</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
