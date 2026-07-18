'use client';

import Image from 'next/image';
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { CountUp, CountUpGroup } from './CountUp';

export interface IBCmsContent {
  heroSubtitle?: string | null;
  ibDescription?: string | null;
  affiliateDescription?: string | null;
  whiteLabelDescription?: string | null;
  ibTag?: string | null;
  ibRateDisplay?: string | null;
  ibPayoutsFrequency?: string | null;
  ibMinimum?: string | null;
  affiliateTag?: string | null;
  affiliateCpaMax?: string | null;
  affiliateCookieDays?: string | null;
  affiliateMinCpa?: string | null;
  wlTag?: string | null;
  wlSetupTime?: string | null;
  wlSpreadMarkup?: string | null;
  wlTechStack?: string | null;
  steps?: { stepTitle: string; stepDescription: string }[] | null;
  ctaHeading?: string | null;
  ctaSubtitle?: string | null;
  heroStat1Value?: string | null;
  heroStat2Value?: string | null;
  heroStat3Value?: string | null;
  heroStat4Value?: string | null;
  incomeLadder?:
    | {
        balanceLabel: string;
        minBalance: number;
        incomeValue: string;
        isTopSlab?: boolean | null;
      }[]
    | null;
  rebateTables?:
    | {
        instrumentNameEn: string;
        instrumentNameAr: string;
        rows?: { spread: string; commission: string; rebate: string }[] | null;
      }[]
    | null;
  ftdCap?: string | null;
  ftdMinLots?: string | null;
}

// Fallback income ladder — used only if the CMS array is empty. Also drives
// the interactive estimator's salary lookup (see salaryForBalance) so the
// displayed table and the calculator can never drift apart.
const DEFAULT_LADDER = [
  { balanceLabel: '$30,000 to $50,000', minBalance: 30000, incomeValue: '$500', isTopSlab: false },
  { balanceLabel: '$50,000 to $100,000', minBalance: 50000, incomeValue: '$750', isTopSlab: false },
  {
    balanceLabel: '$100,000 to $200,000',
    minBalance: 100000,
    incomeValue: '$1,250',
    isTopSlab: false,
  },
  {
    balanceLabel: '$200,000 to $300,000',
    minBalance: 200000,
    incomeValue: '$2,000',
    isTopSlab: false,
  },
  {
    balanceLabel: '$300,000 to $400,000',
    minBalance: 300000,
    incomeValue: '$3,000',
    isTopSlab: false,
  },
  {
    balanceLabel: '$400,000 to $500,000',
    minBalance: 400000,
    incomeValue: '$4,000',
    isTopSlab: false,
  },
  { balanceLabel: '$500,000+', minBalance: 500000, incomeValue: '$5,000', isTopSlab: true },
] as const;

const PARTNER_TYPES = [
  {
    id: 'ib',
    tag: 'MOST POPULAR',
    stats: [
      { label: 'UP TO', value: '$8/lot' },
      { label: 'PAYOUTS', value: 'Monthly' },
      { label: 'MINIMUM', value: 'None' },
    ],
  },
  {
    id: 'affiliate',
    tag: 'CPA',
    stats: [
      { label: 'UP TO', value: '$1,200' },
      { label: 'COOKIE', value: '90 days' },
      { label: 'MIN CPA', value: '$50' },
    ],
  },
  {
    id: 'white-label',
    tag: 'ENTERPRISE',
    stats: [
      { label: 'SETUP', value: '< 30 days' },
      { label: 'SPREAD MARK-UP', value: 'Custom' },
      { label: 'TECH', value: 'Turnkey' },
    ],
  },
] as const;

const STEP_NUMS = ['01', '02', '03', '04'] as const;

type StepItem = { num: string; title: string; desc: string };

const AR_STAT_VALUES: Record<string, string> = {
  Monthly: 'شهرياً',
  None: 'لا يوجد',
  Custom: 'مخصص',
  Turnkey: 'جاهز للعمل',
};

const svgIconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** Icon glyph per partner program — shared-nodes (IB), link (affiliate),
 * layered stack (white-label). Rendered inside an h-11 w-11 accent tile. */
function PartnerIcon({ id }: { id: string }) {
  if (id === 'affiliate') {
    return (
      <svg {...svgIconProps}>
        <path d="M9.5 14.5 14.5 9.5" />
        <path d="M11 7.5 12.2 6.3a3.6 3.6 0 0 1 5.1 5.1l-1.2 1.2" />
        <path d="M13 16.5 11.8 17.7a3.6 3.6 0 0 1-5.1-5.1l1.2-1.2" />
      </svg>
    );
  }
  if (id === 'white-label') {
    return (
      <svg {...svgIconProps}>
        <path d="M12 3 3 8l9 5 9-5-9-5Z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
    );
  }
  return (
    <svg {...svgIconProps}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="17" cy="6" r="2.4" />
      <circle cx="17" cy="18" r="2.4" />
      <path d="M8.3 10.9 14.7 7.2M8.3 13.1 14.7 16.8" />
    </svg>
  );
}

/** Icon glyph per earning stream — stacked coins (rebate), award badge
 * (FTD salary), trend-up (scaling tiers). */
function StreamIcon({ index }: { index: number }) {
  if (index === 1) {
    return (
      <svg {...svgIconProps}>
        <circle cx="12" cy="9" r="5" />
        <path d="M8.6 13.3 7 21l5-3 5 3-1.6-7.7" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg {...svgIconProps}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M21 10V7h-3" />
      </svg>
    );
  }
  return (
    <svg {...svgIconProps}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  );
}

export function IBPage({ cmsContent }: { cmsContent?: IBCmsContent | null }) {
  const t = useTranslations('ib');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const localiseStatValue = (v: string) => (isAr && AR_STAT_VALUES[v] ? AR_STAT_VALUES[v] : v);

  const heroSubtitle = cmsContent?.heroSubtitle ?? t('heroSubtitle');

  const resolvedPartnerTypes = [
    {
      ...PARTNER_TYPES[0],
      tag: cmsContent?.ibTag ?? t('mostPopular'),
      desc: cmsContent?.ibDescription ?? t('ibDesc'),
      stats: [
        { label: 'UP TO', value: cmsContent?.ibRateDisplay ?? '$8/lot' },
        { label: 'PAYOUTS', value: localiseStatValue(cmsContent?.ibPayoutsFrequency ?? 'Monthly') },
        { label: 'MINIMUM', value: localiseStatValue(cmsContent?.ibMinimum ?? 'None') },
      ],
    },
    {
      ...PARTNER_TYPES[1],
      tag: cmsContent?.affiliateTag ?? t('cpaBadge'),
      desc: cmsContent?.affiliateDescription ?? t('affiliateDesc'),
      stats: [
        { label: 'UP TO', value: cmsContent?.affiliateCpaMax ?? '$1,200' },
        { label: 'COOKIE', value: cmsContent?.affiliateCookieDays ?? '90 days' },
        { label: 'MIN CPA', value: cmsContent?.affiliateMinCpa ?? '$50' },
      ],
    },
    {
      ...PARTNER_TYPES[2],
      tag: cmsContent?.wlTag ?? t('wlEnterprise'),
      desc: cmsContent?.whiteLabelDescription ?? t('wlDesc'),
      stats: [
        { label: 'SETUP', value: cmsContent?.wlSetupTime ?? '< 30 days' },
        {
          label: 'SPREAD MARK-UP',
          value: localiseStatValue(cmsContent?.wlSpreadMarkup ?? 'Custom'),
        },
        { label: 'TECH', value: localiseStatValue(cmsContent?.wlTechStack ?? 'Turnkey') },
      ],
    },
  ];

  const stepsFromCms = cmsContent?.steps;
  const resolvedSteps: StepItem[] = STEP_NUMS.map((num, i) => ({
    num,
    title: stepsFromCms?.[i]?.stepTitle ?? t(`step${i + 1}Title` as 'step1Title'),
    desc: stepsFromCms?.[i]?.stepDescription ?? t(`step${i + 1}Desc` as 'step1Desc'),
  }));

  const ctaHeading = cmsContent?.ctaHeading ?? t('ctaDesc');
  const ctaSubtitle = cmsContent?.ctaSubtitle ?? t('ctaSubDesc');

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    country: '',
    message: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [applyError, setApplyError] = useState('');
  const setField =
    (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  async function submitApply(e: FormEvent) {
    e.preventDefault();
    if (applyLoading) return;
    setApplyLoading(true);
    setApplyError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/partners/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      if (res.ok) {
        setApplyDone(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: { message?: string }[];
        };
        setApplyError(data.errors?.[0]?.message ?? data.error ?? t('applyError'));
      }
    } catch {
      setApplyError(t('applyError'));
    } finally {
      setApplyLoading(false);
    }
  }
  const inputCls =
    'font-body text-foreground border-border w-full rounded-[12px] border bg-[#F4F7F5] px-4 py-3 text-[15px] outline-none dark:border-white/10 dark:bg-[#1a1c22]';

  // Income ladder — CMS-driven (falls back to the same defaults shown in the
  // table below), single source of truth for both the display and the estimator.
  const incomeLadder = cmsContent?.incomeLadder?.length ? cmsContent.incomeLadder : DEFAULT_LADDER;
  // Non-null assertion is safe: DEFAULT_LADDER is a fixed 7-item literal, always non-empty.
  const topSlab =
    incomeLadder.find((slab) => slab.isTopSlab) ?? DEFAULT_LADDER[DEFAULT_LADDER.length - 1]!;

  // Interactive partner estimator (client IB deck): maintained balance maps to a
  // monthly income slab (from incomeLadder — ascending by minBalance); lots per
  // month times the up-to per-lot rebate gives rebate income; the two stack
  // into an illustrative monthly total.
  const [estBalance, setEstBalance] = useState(200000);
  const [estLots, setEstLots] = useState(50);
  const salaryForBalance = (b: number) => {
    let income = 0;
    for (const slab of incomeLadder) {
      if (b >= slab.minBalance) income = Number(slab.incomeValue.replace(/[^0-9.]/g, '')) || 0;
    }
    return income;
  };
  const EST_REBATE_PER_LOT = 15;
  const estSalary = salaryForBalance(estBalance);
  const estRebate = estLots * EST_REBATE_PER_LOT;
  const estTotal = estSalary + estRebate;

  // Headline partnership metrics (client IB deck, "why partner with Newera").
  // CMS-driven values, i18n eyebrow/sub labels. CountUp animates the numeric part.
  const heroStats: { eyebrow: string | null; value: string; sub: string }[] = [
    {
      eyebrow: t('statUpTo'),
      value: cmsContent?.heroStat1Value ?? '$5,000',
      sub: t('statPerMonth'),
    },
    { eyebrow: t('statUpTo'), value: cmsContent?.heroStat2Value ?? '15', sub: t('statPerLot') },
    { eyebrow: null, value: cmsContent?.heroStat3Value ?? '3', sub: t('statStreams') },
    { eyebrow: null, value: cmsContent?.heroStat4Value ?? '4', sub: t('statMarkets') },
  ];

  // Stream 1 — rebate per standard lot by instrument (IB deck figures, verbatim).
  // CMS-driven (falls back to the same figures); rows = Raw / Standard / Pro.
  const rebateTiers = [t('rebateTierRaw'), t('rebateTierStandard'), t('rebateTierPro')];
  const rebateTables: { title: string; rows: [string, string, string][] }[] = cmsContent
    ?.rebateTables?.length
    ? cmsContent.rebateTables.map((rt) => ({
        title: isAr ? rt.instrumentNameAr : rt.instrumentNameEn,
        rows: (rt.rows ?? []).map((r) => [r.spread, r.commission, r.rebate]) as [
          string,
          string,
          string,
        ][],
      }))
    : [
        {
          title: t('rebateGold'),
          rows: [
            ['7-8', '10', '3'],
            ['20', '0', '5'],
            ['30', '0', '15'],
          ],
        },
        {
          title: t('rebateFx'),
          rows: [
            ['2-4', '7', '2'],
            ['12-15', '0', '4'],
            ['18-22', '0', '8'],
          ],
        },
        {
          title: t('rebateSilver'),
          rows: [
            ['15-20', '10', '3'],
            ['35-45', '0', '8'],
            ['50-70', '0', '15'],
          ],
        },
      ];

  // Stream 2 — FTD eligibility: BOTH conditions in the same monthly cycle.
  const ftdConditions: { value: string; unit: string; detail: string }[] = [
    {
      value: cmsContent?.ftdCap ?? 'USD 10,000',
      unit: t('ftdCond1Cap'),
      detail: t('ftdCond1Detail'),
    },
    { value: cmsContent?.ftdMinLots ?? '50', unit: t('ftdCond2Unit'), detail: t('ftdCond2Detail') },
  ];

  const targetMarkets: { name: string; desc: string }[] = [
    { name: t('marketIndia'), desc: t('marketIndiaDesc') },
    { name: t('marketMena'), desc: t('marketMenaDesc') },
    { name: t('marketIndonesia'), desc: t('marketIndonesiaDesc') },
    { name: t('marketVietnam'), desc: t('marketVietnamDesc') },
  ];

  const complianceRows: { title: string; desc: string }[] = [
    { title: t('complianceRow1Title'), desc: t('complianceRow1Desc') },
    { title: t('complianceRow2Title'), desc: t('complianceRow2Desc') },
    { title: t('complianceRow3Title'), desc: t('complianceRow3Desc') },
    { title: t('complianceRow4Title'), desc: t('complianceRow4Desc') },
    { title: t('complianceRow5Title'), desc: t('complianceRow5Desc') },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-2 xl:items-center xl:gap-14">
          <div>
            {/* h1: 42px tracking-[-1.26px] per Figma, scaled up on desktop */}
            <h1 className="text-display font-sans">
              <span className="text-foreground">{t('heroLine1')}</span>
              <br />
              <span>{t('heroLine2')}</span>
            </h1>
            <p className="font-body text-body text-muted mb-4 mt-4 max-w-[320px] xl:max-w-[480px] xl:text-[16px] dark:text-white/60">
              {heroSubtitle}
            </p>

            {/* CTAs — matches Figma: green pill + ghost text button */}
            <div className="mb-6 flex gap-[10px]">
              <a
                href="#apply"
                className="bg-accent hover:bg-accent/90 font-body flex items-center rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
              >
                {t('applyNow')}
              </a>
              <a
                href="#programs"
                className="text-foreground font-body flex items-center px-[22px] py-4 text-[15px] font-medium transition-opacity hover:opacity-70"
              >
                {t('viewProgramsBtn')}
              </a>
            </div>
          </div>

          {/* Earnings card — ink-art terminal panel: cinematic backdrop framing
              the CSS bar chart + the live earnings metric at real scale */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]">
            <Image
              src="/images/hero-terminal-macro.jpg"
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1280px) 100vw, 46vw"
              className="object-cover object-[46%_28%] opacity-[0.5]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.92] via-[#03130B]/[0.4] to-[#03130B]/[0.15]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/[0.06]"
            />
            <div className="relative p-6 xl:p-7">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-[7px]">
                  <span className="text-eyebrow font-mono uppercase tracking-[0.14em] text-white/45">
                    {t('earningsKicker')}
                  </span>
                  <span
                    dir="ltr"
                    className="text-sheen text-metric-sm w-fit font-sans font-semibold tabular-nums"
                  >
                    $4,820
                  </span>
                </div>
                <div className="bg-accent-bright/[0.14] text-accent-bright flex items-center gap-[6px] rounded-full px-[10px] py-[6px]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 10L10 2M10 2H5M10 2v5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-body text-[11px] font-bold">+28%</span>
                </div>
              </div>
              {/* Bar chart — 7 bars NOV-MAY, on the ink panel */}
              <div className="mt-7 flex h-[104px] items-end gap-[7px]">
                {[
                  { h: 39, label: 'NOV' },
                  { h: 51, label: 'DEC' },
                  { h: 60, label: 'JAN' },
                  { h: 54, label: 'FEB' },
                  { h: 77, label: 'MAR' },
                  { h: 85, label: 'APR' },
                  { h: 100, label: 'MAY' },
                ].map((bar, i) => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center gap-0">
                    <div
                      className={`w-full rounded-[4px] ${i === 6 ? 'bg-accent-bright' : 'bg-white/[0.14]'}`}
                      style={{ height: `${bar.h}px` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex justify-between">
                {['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'].map((m) => (
                  <span key={m} className="font-mono text-[9px] tracking-[0.9px] text-white/40">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero stat band — headline partnership metrics with CountUp ──── */}
      <section className="bg-transparent px-5 pb-8 pt-2 xl:pb-12">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="ink-band overflow-hidden rounded-[24px] border border-white/[0.08] p-7 xl:p-10">
            <SectionKicker className="mb-7">{t('statsKicker')}</SectionKicker>
            <CountUpGroup>
              <div className="grid grid-cols-2 gap-x-6 gap-y-9 xl:grid-cols-4 xl:gap-x-10">
                {heroStats.map((stat, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <span className="text-eyebrow font-mono font-medium uppercase text-white/45">
                      {stat.eyebrow ?? ' '}
                    </span>
                    <span
                      dir="ltr"
                      className="text-sheen text-metric-sm w-fit font-sans font-semibold tabular-nums"
                    >
                      <CountUp value={stat.value} />
                    </span>
                    <span className="font-body text-caption text-white/55">{stat.sub}</span>
                  </div>
                ))}
              </div>
            </CountUpGroup>
            <p className="font-body text-caption mt-8 text-white/35">{t('statsDisclaimer')}</p>
          </div>
        </div>
      </section>

      {/* Three ways to partner */}
      <section
        id="programs"
        className="rounded-t-[32px] bg-[#FFFFFF] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16 dark:bg-[#07090D]"
      >
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('chooseKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-[10px] font-sans">
            {t('chooseHeading')}
          </h2>
          <div className="mt-6 flex flex-col gap-[14px] xl:grid xl:grid-cols-3">
            {resolvedPartnerTypes.map((pt) => (
              <div
                key={pt.id}
                className="border-border hover:border-accent/45 dark:hover:border-accent/45 shadow-card group relative flex flex-col gap-[12px] overflow-hidden rounded-[22px] border bg-white p-[22px] transition-all duration-300 hover:shadow-[0_18px_44px_rgba(0,176,80,0.16)] dark:border-white/[0.08] dark:bg-[#15171c]"
              >
                {/* Header — icon tile + program tag */}
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-accent/10 text-accent group-hover:bg-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-300 group-hover:text-white">
                    <PartnerIcon id={pt.id} />
                  </span>
                  <span className="bg-accent/10 text-accent group-hover:bg-accent/[0.18] flex-shrink-0 rounded-full px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px] transition-colors duration-300">
                    {pt.id === 'ib'
                      ? t('mostPopular')
                      : pt.id === 'affiliate'
                        ? t('cpaBadge')
                        : t('wlEnterprise')}
                  </span>
                </div>

                {/* Title */}
                <span className="text-title text-foreground font-sans dark:text-white">
                  {pt.id === 'ib'
                    ? t('ibTitle')
                    : pt.id === 'affiliate'
                      ? t('affiliateTitle')
                      : t('wlTitle')}
                </span>

                {/* Desc */}
                <p className="font-body text-body text-muted dark:text-white/60">{pt.desc}</p>

                {/* Stats */}
                <div className="group-hover:bg-accent/25 mt-auto flex gap-px overflow-hidden rounded-[12px] bg-[rgba(17,17,17,0.08)] transition-colors duration-300 dark:bg-[rgba(255,255,255,0.06)]">
                  {pt.stats.map((s) => (
                    <div
                      key={s.label}
                      className="group-hover:bg-accent/[0.08] dark:group-hover:bg-accent/[0.10] flex flex-1 flex-col gap-[2px] bg-[#F0F4F1] px-[10px] py-[12px] transition-colors duration-300 dark:bg-[#1a1c22]"
                    >
                      <span className="text-muted font-mono text-[9px] tracking-[1.08px] dark:text-white/40">
                        {(
                          {
                            'UP TO': t('upTo'),
                            PAYOUTS: t('payouts'),
                            MINIMUM: t('minimum'),
                            COOKIE: t('cookieBadge'),
                            'MIN CPA': t('minCpaBadge'),
                            SETUP: t('wlSetup'),
                            'SPREAD MARK-UP': t('wlSpread'),
                            TECH: t('wlTech'),
                          } as Record<string, string>
                        )[s.label] ?? s.label}
                      </span>
                      <span className="text-foreground font-sans text-[14px] font-semibold dark:text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Income streams + monthly ladder (client IB deck, 2026-07) ────── */}
      <section className="bg-transparent px-5 pb-12 pt-4 xl:pb-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('earnKicker')}</SectionKicker>
          <div className="xl:flex xl:items-end xl:justify-between xl:gap-12">
            <h2 className="text-headline text-foreground max-w-[22ch] font-sans">
              {t('earnHeading')}
            </h2>
            <p className="font-body text-lead text-muted mt-3 max-w-[460px] hyphens-auto text-justify xl:mt-0 xl:flex-shrink-0">
              {t('earnSub')}
            </p>
          </div>

          {/* Three ways you earn */}
          <div className="mt-9 flex flex-col gap-[14px] xl:grid xl:grid-cols-3 xl:gap-[18px]">
            {(
              [
                ['stream1Title', 'stream1Desc'],
                ['stream2Title', 'stream2Desc'],
                ['stream3Title', 'stream3Desc'],
              ] as const
            ).map(([titleKey, descKey], i) => (
              <div
                key={titleKey}
                className="border-border hover:border-accent/45 dark:hover:border-accent/45 shadow-card group relative overflow-hidden rounded-[20px] border bg-white p-6 transition-all duration-300 hover:shadow-[0_18px_44px_rgba(0,176,80,0.16)] dark:border-white/[0.08] dark:bg-[#15171c]"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-accent/10 text-accent group-hover:bg-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors duration-300 group-hover:text-white">
                    <StreamIcon index={i} />
                  </span>
                  <span
                    dir="ltr"
                    className="text-foreground group-hover:text-accent dark:text-accent-bright font-sans text-[26px] font-semibold tabular-nums leading-none tracking-tight opacity-[0.15] transition-[color,opacity] duration-200 group-hover:opacity-40 dark:opacity-[0.28]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-foreground text-body-lg mt-5 font-sans font-semibold leading-snug">
                  {t(titleKey)}
                </h3>
                <p className="font-body text-body text-muted mt-1.5 dark:text-white/60">
                  {t(descKey)}
                </p>
              </div>
            ))}
          </div>

          {/* Monthly income ladder — ink panel with the $5,000 headline */}
          <div className="ink-band mt-6 overflow-hidden rounded-[24px] border border-white/[0.08] xl:mt-8">
            <div className="grid xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="border-b border-white/[0.08] p-7 xl:border-b-0 xl:border-e xl:p-10">
                <p className="text-eyebrow font-mono font-medium uppercase text-white/45">
                  {t('ladderUpTo')}
                </p>
                <p className="text-sheen text-metric mt-3 w-fit font-sans tabular-nums" dir="ltr">
                  {topSlab.incomeValue}
                </p>
                <p className="font-body text-body mt-3 max-w-[32ch] text-white/60">
                  {t('ladderPerMonth')}
                </p>
                <p className="font-body text-caption mt-6 max-w-[46ch] text-white/35">
                  {t('ladderNote')}
                </p>
              </div>
              <div className="p-4 xl:p-6">
                <div className="grid grid-cols-[1fr_auto] gap-x-6 px-3 pb-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {t('ladderColBalance')}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {t('ladderColIncome')}
                  </span>
                </div>
                {incomeLadder.map((slab) => (
                  <div
                    key={slab.balanceLabel}
                    className={`grid grid-cols-[1fr_auto] items-center gap-x-6 border-t border-white/[0.06] px-3 py-3 ${
                      slab.isTopSlab
                        ? 'bg-accent/[0.08] -mx-1 rounded-[10px] border-transparent px-4'
                        : ''
                    }`}
                  >
                    <span className="font-body flex items-center gap-2.5 text-[14px] text-white/80">
                      <span dir="ltr">{slab.balanceLabel}</span>
                      {slab.isTopSlab && (
                        <span className="bg-accent rounded-full px-2 py-[2px] font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#04120a]">
                          {t('ladderTopSlab')}
                        </span>
                      )}
                    </span>
                    <span
                      dir="ltr"
                      className={`font-sans text-[15px] font-semibold tabular-nums ${slab.isTopSlab ? 'text-accent-bright' : 'text-white'}`}
                    >
                      {slab.incomeValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stream 1 — rebate matrix as terminal ledgers (IB deck) ─────── */}
      <section className="bg-transparent px-5 pb-12 pt-2 xl:pb-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('stream1Kicker')}</SectionKicker>
          <h2 className="text-headline text-foreground max-w-[22ch] font-sans">
            {t('rebateHeading')}
          </h2>
          <p className="font-body text-lead text-muted mt-3 max-w-[560px]">{t('rebateSub')}</p>

          <div className="mt-8 grid gap-[14px] xl:grid-cols-3 xl:gap-[18px]">
            {rebateTables.map((table) => (
              <div
                key={table.title}
                className="border-border shadow-card hover:border-accent/40 group relative overflow-hidden rounded-[18px] border bg-white transition-[transform,box-shadow,border-color] duration-300 hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.18)] motion-safe:hover:-translate-y-1 dark:border-white/[0.08] dark:bg-[#101318]"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="border-border flex items-center justify-between border-b px-5 py-3.5 dark:border-white/[0.08]">
                  <span className="text-foreground font-mono text-[13px] font-semibold tracking-[0.02em]">
                    {table.title}
                  </span>
                </div>
                {/* Header row */}
                <div className="border-border text-muted grid grid-cols-[1.2fr_1fr_0.9fr_0.9fr] gap-x-2 border-b px-5 py-2.5 dark:border-white/[0.08]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                    {t('rebateColType')}
                  </span>
                  <span className="text-end font-mono text-[10px] uppercase tracking-[0.1em]">
                    {t('rebateColSpread')}
                  </span>
                  <span className="text-end font-mono text-[10px] uppercase tracking-[0.1em]">
                    {t('rebateColComm')}
                  </span>
                  <span className="text-end font-mono text-[10px] uppercase tracking-[0.1em]">
                    {t('rebateColRebate')}
                  </span>
                </div>
                {/* Data rows */}
                {table.rows.map((row, ri) => {
                  const isPro = ri === rebateTiers.length - 1;
                  return (
                    <div
                      key={ri}
                      className={`grid grid-cols-[1.2fr_1fr_0.9fr_0.9fr] items-center gap-x-2 px-5 py-3 ${
                        ri > 0 ? 'border-border border-t dark:border-white/[0.06]' : ''
                      } ${isPro ? 'bg-accent/[0.05] dark:bg-accent/[0.07]' : ''}`}
                    >
                      <span className="text-foreground font-sans text-[13px] font-medium">
                        {rebateTiers[ri]}
                      </span>
                      <span
                        dir="ltr"
                        className="text-muted text-end font-mono text-[13px] tabular-nums"
                      >
                        {row[0]}
                      </span>
                      <span
                        dir="ltr"
                        className="text-muted text-end font-mono text-[13px] tabular-nums"
                      >
                        {row[1]}
                      </span>
                      <span
                        dir="ltr"
                        className={`text-end font-mono text-[13px] font-semibold tabular-nums ${
                          isPro ? 'text-accent-bright' : 'text-accent'
                        }`}
                      >
                        {row[2]}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="font-body text-caption text-muted mt-5 max-w-[620px]">{t('rebateNote')}</p>
        </div>
      </section>

      {/* ── Stream 2 — FTD eligibility: BOTH conditions (IB deck) ───────── */}
      <section className="bg-transparent px-5 pb-12 pt-2 xl:pb-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('stream2Kicker')}</SectionKicker>
          <h2 className="text-headline text-foreground max-w-[20ch] font-sans">
            {t('ftdHeading')}
          </h2>
          <p className="font-body text-lead text-muted mt-3 max-w-[560px]">{t('ftdSub')}</p>

          {/* Two conditions joined by an explicit AND */}
          <div className="mt-8 flex flex-col items-stretch gap-4 xl:flex-row xl:items-center">
            {ftdConditions.map((cond, i) => (
              <div key={i} className="contents">
                <div className="border-border shadow-card flex-1 rounded-[20px] border bg-white p-7 transition-transform duration-300 motion-safe:hover:scale-[1.02] dark:border-white/[0.08] dark:bg-[#15171c]">
                  <p
                    dir="ltr"
                    className="text-foreground text-metric-sm w-fit font-sans font-semibold tabular-nums"
                  >
                    {cond.value}
                  </p>
                  <p className="text-foreground mt-3 font-sans text-[15px] font-semibold">
                    {cond.unit}
                  </p>
                  <p className="font-body text-body text-muted mt-1.5 dark:text-white/60">
                    {cond.detail}
                  </p>
                </div>
                {i === 0 && (
                  <div className="flex items-center justify-center">
                    <span className="bg-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-[#04120a]">
                      {t('ftdAnd')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="font-body text-caption text-muted mt-5 max-w-[620px]">{t('ftdNote')}</p>
        </div>
      </section>

      {/* Interactive partner estimator (client IB deck) */}
      <section className="bg-transparent px-5 pb-12 pt-2 xl:pb-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('estKicker')}</SectionKicker>
          <div className="xl:flex xl:items-end xl:justify-between xl:gap-12">
            <h2 className="text-headline text-foreground max-w-[20ch] font-sans">
              {t('estHeading')}
            </h2>
            <p className="font-body text-lead text-muted mt-3 max-w-[440px] xl:mt-0 xl:flex-shrink-0">
              {t('estSub')}
            </p>
          </div>

          <div className="mt-8 grid gap-[18px] xl:grid-cols-2">
            {/* Sliders */}
            <div className="border-border shadow-card flex flex-col gap-9 rounded-[20px] border bg-white p-7 dark:border-white/[0.08] dark:bg-[#15171c]">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="est-balance" className="font-body text-body text-muted">
                    {t('estBalanceLabel')}
                  </label>
                  <span
                    dir="ltr"
                    className="text-foreground font-mono text-[16px] font-semibold tabular-nums"
                  >
                    ${estBalance.toLocaleString('en-US')}
                  </span>
                </div>
                <input
                  id="est-balance"
                  type="range"
                  min={0}
                  max={500000}
                  step={10000}
                  value={estBalance}
                  onChange={(e) => setEstBalance(Number(e.target.value))}
                  className="mt-3 w-full accent-[#00B050]"
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="est-lots" className="font-body text-body text-muted">
                    {t('estLotsLabel')}
                  </label>
                  <span
                    dir="ltr"
                    className="text-foreground font-mono text-[16px] font-semibold tabular-nums"
                  >
                    {estLots.toLocaleString('en-US')}
                  </span>
                </div>
                <input
                  id="est-lots"
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={estLots}
                  onChange={(e) => setEstLots(Number(e.target.value))}
                  className="mt-3 w-full accent-[#00B050]"
                />
              </div>
            </div>

            {/* Terminal read-out */}
            <div className="ink-band flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/[0.08] p-7">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
                  <span className="font-body text-body text-white/60">{t('estSalaryLabel')}</span>
                  <span
                    dir="ltr"
                    className="font-mono text-[15px] font-semibold tabular-nums text-white"
                  >
                    ${estSalary.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
                  <span className="font-body text-body text-white/60">{t('estRebateLabel')}</span>
                  <span
                    dir="ltr"
                    className="font-mono text-[15px] font-semibold tabular-nums text-white"
                  >
                    ${estRebate.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-eyebrow font-mono font-medium uppercase text-white/45">
                  {t('estTotalLabel')}
                </p>
                <p
                  dir="ltr"
                  className="text-sheen text-metric-sm mt-2 w-fit font-sans tabular-nums"
                >
                  ${estTotal.toLocaleString('en-US')}
                  <span className="text-white/50">/mo</span>
                </p>
                <p className="font-body text-caption mt-5 max-w-[46ch] hyphens-auto text-justify text-white/35">
                  {t('estDisclaimer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target markets — where the partnership performs best (IB deck) */}
      <section className="bg-transparent px-5 pb-12 pt-2 xl:pb-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('marketsBandKicker')}</SectionKicker>
          <h2 className="text-headline text-foreground mb-8 max-w-[20ch] font-sans">
            {t('marketsBandHeading')}
          </h2>
          <div className="bg-border border-border grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border sm:grid-cols-2 xl:grid-cols-4">
            {targetMarkets.map((m) => (
              <div key={m.name} className="flex flex-col gap-2 bg-white p-6 dark:bg-[#15171c]">
                <p className="text-foreground font-sans text-[17px] font-semibold">{m.name}</p>
                <p className="font-body text-caption text-muted leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance ledger — quiet, factual partner terms (IB deck) */}
      <section className="bg-transparent px-5 pb-12 pt-2 xl:pb-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[900px]">
          <SectionKicker className="mb-4">{t('complianceKicker')}</SectionKicker>
          <h2 className="text-headline text-foreground mb-8 max-w-[22ch] font-sans">
            {t('complianceHeading')}
          </h2>
          <div className="border-border border-t">
            {complianceRows.map((row, i) => (
              <div
                key={i}
                className="border-border grid grid-cols-1 gap-1 border-b py-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-8"
              >
                <p className="text-foreground font-sans text-[15px] font-semibold">{row.title}</p>
                <p className="font-body text-body text-muted leading-relaxed">{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps — gradient section, white cards per Figma */}
      <section
        className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('stepsKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-8 font-sans">{t('stepsHeading')}</h2>
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {resolvedSteps.map((step) => (
              <div
                key={step.num}
                className="bg-background shadow-card flex items-start gap-4 rounded-[18px] border border-transparent p-[18px] transition-all duration-300 hover:shadow-lg dark:border-white/[0.08] dark:bg-[#101318] dark:shadow-none"
              >
                {/* Step number — accent 22px per Figma */}
                <span className="text-accent w-[38px] flex-shrink-0 font-sans text-[22px] font-semibold leading-none tracking-[-0.44px]">
                  {step.num}
                </span>
                <div className="flex-1">
                  <p className="text-foreground mb-1 font-sans text-[15px] font-semibold leading-normal">
                    {step.title}
                  </p>
                  <p className="font-body text-muted text-[12.5px] leading-[1.5]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner application form — POSTs to /api/partners/apply */}
      <section id="apply" className="bg-transparent px-5 pb-12 pt-2">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[760px]">
          <SectionKicker className="mb-4">{t('applyKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-6 font-sans">{t('applyHeading')}</h2>
          {applyDone ? (
            <div className="bg-accent/10 text-accent font-body rounded-[16px] px-5 py-6 text-[14px]">
              {t('applySuccess')}
            </div>
          ) : (
            <form onSubmit={submitApply} className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder={t('applyName')}
                  value={form.name}
                  onChange={setField('name')}
                  className={inputCls}
                />
                <input
                  required
                  type="email"
                  placeholder={t('applyEmail')}
                  value={form.email}
                  onChange={setField('email')}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder={t('applyCompany')}
                  value={form.company}
                  onChange={setField('company')}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder={t('applyWebsite')}
                  value={form.website}
                  onChange={setField('website')}
                  className={inputCls}
                />
              </div>
              <input
                type="text"
                placeholder={t('applyCountry')}
                value={form.country}
                onChange={setField('country')}
                className={inputCls}
              />
              <textarea
                placeholder={t('applyMessage')}
                value={form.message}
                onChange={setField('message')}
                rows={4}
                className={inputCls}
              />
              {applyError && <p className="font-body text-[12px] text-red-500">{applyError}</p>}
              <button
                type="submit"
                disabled={applyLoading}
                className="bg-accent hover:bg-accent/90 font-body w-full rounded-full px-6 py-4 text-[15px] font-medium text-white transition-colors disabled:opacity-60 xl:w-auto xl:self-start xl:px-10"
              >
                {applyLoading ? t('applySubmitting') : t('applyCta')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA — centered heading + green pill, on an ink band with a soft
          edge-flow light column behind the copy */}
      <section className="ink-band relative overflow-hidden rounded-t-[32px] px-5 pb-12 pt-11 xl:pb-16 xl:pt-16">
        <Image
          src="/images/edge-flow.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none object-cover object-center opacity-[0.3]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.92] via-[#03130B]/[0.55] to-[#03130B]/[0.4]"
        />
        <div className="relative z-10 mx-auto flex max-w-[390px] flex-col items-center md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="text-headline mb-3 max-w-[280px] text-center font-sans text-white xl:max-w-[640px]">
            {ctaHeading}
          </h2>
          <p className="font-body mb-[22px] max-w-[300px] text-center text-[14px] leading-[1.55] text-white/60 xl:max-w-[480px] xl:text-[16px]">
            {ctaSubtitle}
          </p>
          <a
            href="#apply"
            className="bg-accent hover:bg-accent/90 font-body flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium text-white transition-colors"
          >
            {t('applyCta')}
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
