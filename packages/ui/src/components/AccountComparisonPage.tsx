'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type AccountRow = { label: string; value: string };

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
  section?: string;
  feature: string;
  standard: FeatureValue;
  raw: FeatureValue;
  vip: FeatureValue;
}[] = [
  { feature: 'MetaTrader 5', standard: true, raw: true, vip: true },
  { feature: 'Web & Mobile', standard: true, raw: true, vip: true },
  { feature: 'Expert Advisors', standard: true, raw: true, vip: true },
  { feature: 'Hedging', standard: true, raw: true, vip: true },
  { feature: 'Free VPS hosting', standard: false, raw: true, vip: true },
  { feature: 'Priority withdrawals', standard: false, raw: true, vip: true },
  { feature: 'Dedicated dealer', standard: false, raw: false, vip: true },
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
  return <span className="font-body text-[13px] text-[#6b7280] dark:text-[#4b5563]">—</span>;
}

function MatrixCell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return value ? <CheckIcon /> : <DashIcon />;
  }
  return (
    <span className="font-body text-[11px] font-medium text-[#111111] dark:text-white">
      {value}
    </span>
  );
}

export function AccountComparisonPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            Choose the
            <br />
            account that
            <br />
            <span className="text-accent">fits.</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            Whether you trade a few times a week or a few hundred times a day — we have an account
            tier built for you.
          </p>
        </div>
      </section>

      {/* Horizontal scroll account cards */}
      <section className="dark:bg-background bg-white py-10">
        <div
          className="scrollbar-hide flex snap-x snap-mandatory gap-[14px] overflow-x-auto px-5"
          style={{ scrollPaddingLeft: '20px' }}
        >
          {ACCOUNTS.map((acc) => {
            const isRaw = acc.isHighlighted;
            return (
              <div
                key={acc.id}
                className={`relative flex w-[270px] flex-shrink-0 snap-start flex-col gap-[18px] overflow-hidden rounded-[24px] p-6 ${
                  isRaw ? 'bg-[#111111]' : 'bg-white dark:bg-[#1c1c1c]'
                }`}
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              >
                {/* Green glow for Raw card */}
                {isRaw && (
                  <div
                    className="bg-accent/25 pointer-events-none absolute left-1/2 top-0 h-[80px] w-[200px] -translate-x-1/2 rounded-full"
                    style={{ filter: 'blur(40px)' }}
                  />
                )}

                {/* Head: name + tag */}
                <div className="flex items-start gap-2">
                  <span
                    className={`font-sans text-[26px] font-semibold leading-none ${
                      isRaw ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {acc.name}
                  </span>
                  <span
                    className={`font-body mt-[5px] self-start rounded-full px-[10px] py-[5px] text-[10px] font-semibold uppercase tracking-[0.07em] ${
                      isRaw ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-accent'
                    }`}
                  >
                    {acc.tag}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={`font-body text-[13.5px] leading-[1.5] ${
                    isRaw ? 'text-white/70' : 'text-muted'
                  }`}
                >
                  {acc.description}
                </p>

                {/* Price block */}
                <div className="flex flex-col gap-1">
                  <span
                    className={`font-body text-[10px] uppercase tracking-[0.1em] ${
                      isRaw ? 'text-white/50' : 'text-muted'
                    }`}
                  >
                    PRICING
                  </span>
                  <span
                    className={`font-sans text-[22px] font-semibold leading-tight ${
                      isRaw ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {acc.pricing}
                  </span>
                </div>

                {/* Feature rows */}
                <div
                  className={`flex flex-col gap-[1px] overflow-hidden rounded-[12px] ${
                    isRaw ? 'bg-white' : 'bg-[#111111] dark:bg-[#2a2a2a]'
                  }`}
                >
                  {acc.rows.map((row) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between px-[14px] py-3 ${
                        isRaw ? 'bg-[#111111]' : 'bg-[#fafaf9] dark:bg-[#1c1c1c]'
                      }`}
                    >
                      <span
                        className={`font-body text-[13px] ${
                          isRaw ? 'text-white/60' : 'text-muted'
                        }`}
                      >
                        {row.label}
                      </span>
                      <span
                        className={`font-body text-[13px] font-medium ${
                          isRaw ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <Link
                  href={`/${locale}/register?account=${acc.registerParam}`}
                  className={`font-body flex h-[48px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors ${
                    isRaw
                      ? 'bg-accent hover:bg-accent/90 text-white'
                      : 'bg-[#111111] text-white hover:bg-[#222] dark:bg-white dark:text-[#111111] dark:hover:bg-white/90'
                  }`}
                >
                  {acc.ctaText}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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

      {/* Feature matrix — on black bg */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            FEATURE MATRIX
          </SectionKicker>
          <h2 className="mb-8 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Compare side
            <br />
            by side.
          </h2>

          {/* Matrix table card */}
          <div
            className="overflow-hidden rounded-[16px] bg-white dark:bg-[#1a1a1a]"
            
          >
            {/* Header row */}
            <div className="grid grid-cols-[1fr_52px_52px_52px] items-center gap-2 border-b border-[#e5e7eb] px-[14px] py-3 dark:border-[#2a2a2a]">
              <span className="font-body text-[10px] uppercase tracking-[0.1em] text-[#9ca3af]">
                Feature
              </span>
              {(['Std', 'Raw', 'VIP'] as const).map((label, i) => (
                <span
                  key={label}
                  className={`font-body text-center text-[10px] font-semibold uppercase tracking-[0.1em] ${
                    i === 1 ? 'text-accent' : 'text-[#6b7280] dark:text-[#9ca3af]'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {FEATURE_MATRIX.map((row, i) => (
              <Fragment key={row.feature}>
                {row.section && (
                  <div className="border-b border-[#e5e7eb] px-[14px] pb-1 pt-4 dark:border-[#2a2a2a]">
                    <span className="font-body text-[9px] uppercase tracking-[0.12em] text-[#9ca3af]">
                      {row.section}
                    </span>
                  </div>
                )}
                <div
                  className={`grid grid-cols-[1fr_52px_52px_52px] items-center gap-2 px-[14px] py-[11px] ${
                    i < FEATURE_MATRIX.length - 1
                      ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]'
                      : ''
                  }`}
                >
                  <span className="font-body text-[12px] text-[#6b7280] dark:text-[#9ca3af]">
                    {row.feature}
                  </span>
                  <div className="flex justify-center">
                    <MatrixCell value={row.standard} />
                  </div>
                  <div className="bg-accent/[0.06] dark:bg-accent/[0.1] flex justify-center rounded-[6px] py-[6px]">
                    <MatrixCell value={row.raw} />
                  </div>
                  <div className="flex justify-center">
                    <MatrixCell value={row.vip} />
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10">
            <h3 className="mb-2 font-sans text-[22px] font-semibold leading-[1.2] text-white">
              Ready to open
              <br />
              your account?
            </h3>
            <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
              Takes under 3 minutes. Verified and funded in 24 hours.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}/register?account=raw`}
                className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
              >
                Open Raw account
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
                className="font-body flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
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
