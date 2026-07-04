'use client';

import { useLocale, useTranslations } from 'next-intl';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CmsAccountType {
  id: number;
  name: string;
  nameAr?: string | null;
  badge?: 'free' | 'popular' | 'pro' | 'islamic' | null;
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

// ─── Component ───────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  mt5: 'MT5',
  'web-trader': 'Web',
  mobile: 'Mobile',
};

export function AccountsPage({ cmsAccounts }: AccountsPageProps) {
  const locale = useLocale();
  const t = useTranslations('accounts');
  const matrixRows = MATRIX_ROW_DATA.map((r) => ({ ...r, feature: t(r.featureKey) }));

  function getBadgeLabel(badge: string | null | undefined, isPopular?: boolean | null): string {
    if (badge === 'free') return t('badgeFree');
    if (badge === 'popular' || isPopular) return t('badgePopular');
    if (badge === 'pro') return t('badgePro');
    if (badge === 'islamic') return t('badgeIslamic');
    return t('badgePro');
  }

  function getSubtitle(badge: string | null | undefined): string {
    if (badge === 'free') return t('subtitleDemo');
    if (badge === 'popular') return t('subtitleStandard');
    if (badge === 'islamic') return t('subtitleSwapFree');
    return t('subtitleRaw');
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
      commission: cleanCommission(cms.commission ?? '$0'),
      commissionSub: t('perLotSide'),
      spreadsFrom: cms.spreadFrom ? cleanSpread(cms.spreadFrom) : '—',
      spreadsSub: t('pips'),
      minDeposit:
        badgeValue === 'free' ? t('virtualDeposit') : `$${cms.minDeposit.toLocaleString('en-US')}`,
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
  const highlightIdx = popularIdx !== -1 ? popularIdx : Math.min(1, matrixColNames.length - 1);
  const matrixValueRows = matrixAccounts.length
    ? [
        {
          id: 'minDeposit',
          label: t('matrixMinDeposit'),
          values: matrixAccounts.map((a) => `$${a.minDeposit.toLocaleString('en-US')}`),
        },
        {
          id: 'spread',
          label: t('matrixSpreadFrom'),
          values: matrixAccounts.map((a) => (a.spreadFrom ? cleanSpread(a.spreadFrom) : '—')),
        },
        {
          id: 'commission',
          label: t('matrixCommission'),
          values: matrixAccounts.map((a) => (a.commission ? cleanCommission(a.commission) : '—')),
        },
        {
          id: 'leverage',
          label: t('matrixLeverage'),
          values: matrixAccounts.map((a) => a.leverage?.match(/1:\d+/)?.[0] ?? a.leverage ?? '—'),
        },
        {
          id: 'platforms',
          label: t('matrixPlatforms'),
          values: matrixAccounts.map((a) =>
            a.platforms?.length
              ? a.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(' · ')
              : 'MT5',
          ),
        },
      ]
    : [];
  const matrixGridStyle = {
    gridTemplateColumns: `132px repeat(${matrixColNames.length}, minmax(96px, 1fr))`,
  };

  return (
    <div className="bg-transparent">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-foreground font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] xl:text-[48px]">
            <p>{t('heroLine1')}</p>
            <p>{t('heroLine2')}</p>
            <p className="text-accent">{t('heroAccent')}</p>
          </div>
          <div className="h-[16px]" />
          <p className="font-body max-w-[320px] text-[14px] leading-[1.55] text-[#6B7280] xl:max-w-[720px] dark:text-[#B8BFCC]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Account Cards ─────────────────────────────────────────────────── */}
      <section className="bg-transparent px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto flex max-w-[390px] flex-col gap-[18px] md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-stretch xl:gap-6">
          {displayAccounts.length === 0 && (
            <p className="font-body text-muted w-full py-12 text-center text-[14px]">
              {t('noAccounts')}
            </p>
          )}
          {displayAccounts.map((account) => (
            <div
              key={String(account.id)}
              className="group flex w-full flex-col overflow-hidden rounded-[20px] border-2 border-transparent bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00b050] hover:shadow-[0_12px_40px_-8px_rgba(0,176,80,0.4)] xl:flex-1 dark:bg-[#1a1c22]"
            >
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
                  <span className="font-body rounded-[20px] bg-[#00b050] px-[12px] py-[5px] text-[11px] font-bold tracking-[0.6px] text-[#111]">
                    {account.badge}
                  </span>
                  <p className="font-body text-[15px] font-normal text-white/75">
                    {t('cardAccountLabel')}
                  </p>
                  <p className="font-body text-[30px] font-bold text-[#f0f0f0]">{account.name}</p>
                  <p className="font-body text-[13px] text-white/70">{account.subtitle}</p>
                </div>
              </div>

              {/* Card body — flex-1 so all cards stretch to equal height; the
                  features block absorbs the slack, pinning CTAs to the bottom */}
              <div className="flex flex-1 flex-col gap-[18px] px-[22px] py-[28px]">
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
                  <span className="whitespace-nowrap font-sans text-[26px] font-bold text-[#111] dark:text-white">
                    {account.spreadsFrom}
                  </span>
                </div>
                <div className="h-px bg-[#e5e8eb] dark:bg-[#2a2a2a]" />

                {/* Min deposit — 20px per Figma (smaller than commission/spread) */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[15px] font-medium text-[#111] dark:text-white">
                    {t('minDeposit')}
                  </span>
                  <span className="whitespace-nowrap font-sans text-[20px] font-bold text-[#111] dark:text-white">
                    {account.minDeposit}
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
                      <span className="font-body text-[13px] text-[#6b7280]">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom link — scrolls to the feature matrix (signup handled by CRM) */}
                <a
                  href="#feature-matrix"
                  className="font-body text-center text-[12px] font-bold tracking-[0.6px] text-[#00b050] transition-opacity hover:opacity-75"
                >
                  {account.isDemo ? t('exploreFeatures') : t('tryFreeDemo')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Matrix ────────────────────────────────────────────────── */}
      <section id="feature-matrix" className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="mb-3 flex items-center gap-[6px]">
            <span className="h-px w-[18px] bg-white/40" />
            <span className="font-mono text-[10px] uppercase tracking-[1.8px] text-white/60">
              {t('featureMatrixKicker')}
            </span>
          </div>

          <h2 className="mb-6 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white">
            {t('featureMatrixHeading')}
          </h2>

          {/* Horizontal scroll on mobile with a sticky first column; fits
              without scrolling from md up. */}
          <div className="motion-safe:animate-rise-in overflow-x-auto rounded-[16px]">
            <div className="min-w-[560px] rounded-[16px] bg-white/[0.06] md:min-w-0">
              {/* Header row */}
              <div className="grid" style={matrixGridStyle}>
                <span className="sticky start-0 z-[1] bg-[#171717] px-[14px] py-3 font-mono text-[9px] uppercase tracking-[1.08px] text-white/55 md:bg-white/[0.04]">
                  {t('featureCol')}
                </span>
                {matrixColNames.map((h, j) => (
                  <div
                    key={h}
                    className={`flex items-center justify-center py-3 ${
                      j === highlightIdx ? 'bg-accent/[0.08]' : 'bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[9px] uppercase tracking-[1.08px] ${
                        j === highlightIdx ? 'text-[#00b050]' : 'text-white/55'
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
                  className="grid border-b border-white/[0.06]"
                  style={matrixGridStyle}
                >
                  <span className="font-body sticky start-0 z-[1] bg-[#121212] px-[14px] py-[11px] text-[12px] text-white/85 md:bg-transparent">
                    {row.label}
                  </span>
                  {row.values.map((val, j) => (
                    <div
                      key={j}
                      className={`flex items-center justify-center py-[11px] ${
                        j === highlightIdx ? 'bg-accent/[0.06]' : ''
                      }`}
                    >
                      <span
                        className="font-body px-1 text-center text-[12px] font-semibold tabular-nums text-white"
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
                <div className="grid" style={matrixGridStyle}>
                  <span className="sticky start-0 z-[1] bg-[#171717] px-[14px] py-2 font-mono text-[9px] uppercase tracking-[1.08px] text-white/40 md:bg-white/[0.03]">
                    {t('matrixFeaturesLabel')}
                  </span>
                  {matrixColNames.map((_, j) => (
                    <div
                      key={j}
                      className={j === highlightIdx ? 'bg-accent/[0.06]' : 'bg-white/[0.03]'}
                    />
                  ))}
                </div>
              )}

              {matrixRows.map((row, i) => (
                <div
                  key={row.id}
                  className={`grid ${i < matrixRows.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                  style={matrixGridStyle}
                >
                  <span className="font-body sticky start-0 z-[1] bg-[#121212] px-[14px] py-[11px] text-[12px] text-white/85 md:bg-transparent">
                    {row.feature}
                  </span>
                  {[row.std, row.raw, row.vip].slice(0, matrixColNames.length).map((val, j) => (
                    <div
                      key={j}
                      className={`flex items-center justify-center py-[11px] ${
                        j === highlightIdx ? 'bg-accent/[0.06]' : ''
                      }`}
                    >
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
        </div>
      </section>
    </div>
  );
}
