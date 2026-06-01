'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type AccountRow = { label: string; value: string };

interface CmsAccountOverride {
  name: string;
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  commission?: string | null;
}

const ACCOUNTS = [
  {
    id: 'standard',
    name: 'Standard',
    tag: 'MOST POPULAR',
    description: 'Built for active retail traders. No commission, friendly spreads.',
    pricing: 'No commission',
    ctaText: 'Open Standard',
    registerParam: 'standard',
    isHighlighted: false,
    rows: [
      { label: 'Min deposit', value: '$100' },
      { label: 'Spread from', value: '1.0 pip' },
      { label: 'Commission', value: 'None' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Instruments', value: 'All 6 classes' },
      { label: 'Execution', value: 'Market' },
      { label: 'Stop-out', value: '20%' },
    ] as AccountRow[],
  },
  {
    id: 'raw',
    name: 'Raw',
    tag: 'PRO PRICING',
    description: 'Institutional-grade spreads from 0.0 pip with a flat per-lot commission.',
    pricing: '$3.50 / lot / side',
    ctaText: 'Open Raw',
    registerParam: 'raw',
    isHighlighted: true,
    rows: [
      { label: 'Min deposit', value: '$500' },
      { label: 'Spread from', value: '0.0 pip' },
      { label: 'Commission', value: '$3.50 / lot' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Instruments', value: 'All 6 classes' },
      { label: 'Execution', value: 'Market / ECN' },
      { label: 'Stop-out', value: '20%' },
    ] as AccountRow[],
  },
  {
    id: 'vip',
    name: 'VIP',
    tag: 'HIGH VOLUME',
    description: 'Dedicated dealer, custom spreads, priority withdrawals for $10k+ accounts.',
    pricing: 'From $1.50 / lot',
    ctaText: 'Open VIP',
    registerParam: 'vip',
    isHighlighted: false,
    rows: [
      { label: 'Min deposit', value: '$10,000' },
      { label: 'Spread from', value: '0.0 pip' },
      { label: 'Commission', value: 'From $1.50' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Instruments', value: 'All + early access' },
      { label: 'Execution', value: 'ECN priority' },
      { label: 'Stop-out', value: '15%' },
    ] as AccountRow[],
  },
] as const;

type FeatureValue = boolean | string;

const FEATURE_MATRIX: {
  feature: string;
  standard: FeatureValue;
  raw: FeatureValue;
  vip: FeatureValue;
}[] = [
  { feature: 'MetaTrader 5', standard: true, raw: true, vip: true },
  { feature: 'Web & Mobile', standard: true, raw: true, vip: true },
  { feature: 'Expert Advisors', standard: true, raw: true, vip: true },
  { feature: 'Hedging', standard: true, raw: true, vip: true },
  { feature: 'Dedicated dealer', standard: false, raw: false, vip: true },
  { feature: 'Priority withdrawals', standard: false, raw: true, vip: true },
  { feature: 'Free VPS hosting', standard: false, raw: true, vip: true },
  { feature: 'Custom spreads', standard: false, raw: false, vip: true },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Yes">
      <path
        d="M3 8l3.5 3.5L13 5"
        stroke="#00B050"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashIcon() {
  return <span className="font-body text-[14px] text-white/30">—</span>;
}

function MatrixCell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') return value ? <CheckIcon /> : <DashIcon />;
  return (
    <span className="font-mono text-[11px] font-medium text-[#111] dark:text-white">{value}</span>
  );
}

interface AccountComparisonPageProps {
  cmsAccounts?: CmsAccountOverride[];
}

export function AccountComparisonPage({ cmsAccounts }: AccountComparisonPageProps) {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Heading: stacks on mobile, inline on desktop */}
          <h1 className="mb-4 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-[#111] xl:text-[56px] xl:tracking-[-2px] dark:text-white">
            <span className="block xl:inline">Choose the </span>
            <span className="block xl:inline">account that </span>
            <span className="text-accent block xl:inline">fits.</span>
          </h1>
          <p className="font-body max-w-[480px] text-[14px] leading-[1.55] text-[#6b7280]">
            Whether you trade a few times a week or a few hundred times a day — we have an account
            tier built for you.
          </p>
        </div>
      </section>

      {/* Horizontal scroll account cards */}
      <section className="bg-background py-10">
        <div
          className="scrollbar-hide flex snap-x snap-mandatory gap-[14px] overflow-x-auto px-5"
          style={{ scrollPaddingLeft: '20px' }}
        >
          {ACCOUNTS.map((acc) => {
            const isRaw = acc.isHighlighted;
            const cms = cmsAccounts?.find((a) => a.name.toLowerCase() === acc.name.toLowerCase());
            const rows: AccountRow[] = cms
              ? [
                  { label: 'Min deposit', value: `$${cms.minDeposit.toLocaleString('en-US')}` },
                  { label: 'Spread from', value: cms.spreadFrom },
                  { label: 'Commission', value: cms.commission ?? 'None' },
                  { label: 'Leverage', value: cms.leverage },
                  ...acc.rows.slice(4),
                ]
              : [...acc.rows];
            const pricing = cms?.commission ?? acc.pricing;
            return (
              <div
                key={acc.id}
                className={`shadow-card relative flex w-[270px] flex-shrink-0 snap-start flex-col gap-[18px] overflow-hidden rounded-[24px] p-6 ${
                  isRaw ? 'shadow-card-dark bg-[#111111]' : 'bg-background'
                }`}
              >
                {/* Green glow — Raw only */}
                {isRaw && (
                  <div
                    className="bg-accent/25 pointer-events-none absolute left-1/2 top-0 h-[80px] w-[200px] -translate-x-1/2 rounded-full"
                    style={{ filter: 'blur(40px)' }}
                  />
                )}

                {/* Head: name + tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-sans text-[26px] font-semibold tracking-[-0.52px] ${isRaw ? 'text-white' : 'text-[#111] dark:text-white'}`}
                  >
                    {acc.name}
                  </span>
                  <span className="bg-accent/10 text-accent mt-[5px] self-start rounded-full px-[10px] py-[5px] font-mono text-[10px] tracking-[1.2px]">
                    {acc.tag}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={`font-body text-[13.5px] leading-[1.5] ${isRaw ? 'text-white/70' : 'text-[#6b7280]'}`}
                >
                  {acc.description}
                </p>

                {/* Price block */}
                <div className="flex flex-col gap-[4px]">
                  <span
                    className={`font-mono text-[10px] tracking-[1.2px] ${isRaw ? 'text-white/50' : 'text-[#6b7280]'}`}
                  >
                    PRICING
                  </span>
                  <span
                    className={`font-sans text-[22px] font-semibold tracking-[-0.44px] ${isRaw ? 'text-accent' : 'text-[#111] dark:text-white'}`}
                  >
                    {pricing}
                  </span>
                </div>

                {/* Feature rows */}
                <div
                  className={`flex flex-col gap-[1px] overflow-hidden rounded-[12px] ${
                    isRaw ? 'bg-white' : 'dark:bg-surface-elevated bg-[#111111]'
                  }`}
                >
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between px-[14px] py-3 ${
                        isRaw ? 'bg-[#111111]' : 'dark:bg-surface bg-[#fafaf9]'
                      }`}
                    >
                      <span
                        className={`font-body text-[13px] ${isRaw ? 'text-white/60' : 'text-[#6b7280]'}`}
                      >
                        {row.label}
                      </span>
                      <span
                        className={`font-body text-[13px] font-medium ${isRaw ? 'text-white' : 'text-[#111] dark:text-white'}`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?account=${acc.registerParam}`}
                  className={`font-body flex h-[48px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors ${
                    isRaw
                      ? 'bg-accent hover:bg-accent/90 text-white'
                      : 'bg-[#111] text-white hover:bg-[#222] dark:bg-white dark:text-[#111] dark:hover:bg-white/90'
                  }`}
                >
                  {acc.ctaText}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
            );
          })}
        </div>
      </section>

      {/* ── Feature matrix ───────────────────────────────────── */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10 xl:px-[120px] xl:pb-16 xl:pt-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-white/40 [&>span:last-child]:text-white/50">
            FEATURE MATRIX
          </SectionKicker>
          <h2 className="mb-8 font-sans text-[26px] font-semibold leading-[1.1] text-white xl:text-[32px]">
            Compare side
            <br />
            by side.
          </h2>

          {/* Matrix table card — matches Figma: rgba(255,255,255,0.06) container */}
          <div className="overflow-hidden rounded-[16px] bg-[rgba(255,255,255,0.06)]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_65px_65px_65px] items-center bg-[rgba(255,255,255,0.04)] px-[14px] py-3">
              <span className="font-mono text-[9px] uppercase tracking-[1.08px] text-white/55">
                Feature
              </span>
              {(['Std', 'Raw', 'VIP'] as const).map((label, i) => (
                <span
                  key={label}
                  className={`text-center font-mono text-[9px] tracking-[1.08px] ${
                    i === 1 ? 'text-accent' : 'text-white/55'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {FEATURE_MATRIX.map((row) => (
              <Fragment key={row.feature}>
                <div className="grid grid-cols-[1fr_65px_65px_65px] items-center px-[14px] py-[11px]">
                  <span className="font-body text-[12px] text-white/85">{row.feature}</span>
                  <div className="flex justify-center">
                    <MatrixCell value={row.standard} />
                  </div>
                  <div className="flex justify-center">
                    <MatrixCell value={row.raw} />
                  </div>
                  <div className="flex justify-center">
                    <MatrixCell value={row.vip} />
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          {/* CTA block */}
          <div className="mt-10">
            <h3 className="mb-2 font-sans text-[22px] font-semibold leading-[1.2] text-white xl:text-[26px]">
              Ready to open
              <br />
              your account?
            </h3>
            <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
              Takes under 3 minutes. Verified and funded in 24 hours.
            </p>
            <div className="flex flex-col gap-3 xl:flex-row">
              <Link
                href={`/${locale}/register?account=raw`}
                className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-8"
              >
                Open Raw account
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href={`/${locale}/trade/accounts`}
                className="font-body flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40 xl:w-auto xl:px-8"
              >
                View account details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
