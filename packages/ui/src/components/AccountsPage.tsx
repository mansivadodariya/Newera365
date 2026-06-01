'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

interface CmsAccountOverride {
  name: string;
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  commission?: string | null;
}

const CHECK = (
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

const DASH = <span className="font-body text-[13px] text-[#6b7280]">—</span>;

const ACCOUNTS = [
  {
    id: 'standard',
    name: 'Standard',
    tag: 'MOST POPULAR',
    desc: 'Built for active retail traders. No commission, friendly spreads.',
    pricingLabel: 'PRICING',
    pricingValue: 'No commission',
    cardBg: 'bg-white dark:bg-surface-elevated',
    headTextColor: 'text-[#111111] dark:text-white',
    descColor: 'text-[#6b7280] dark:text-muted',
    pricingLabelColor: 'text-[#6b7280] dark:text-muted',
    pricingValueColor: 'text-[#111111] dark:text-white',
    rowsContainerBg: 'bg-[#111111] dark:bg-surface-elevated',
    rowBg: 'bg-[#FAFAF9] dark:bg-surface',
    rowLabelColor: 'text-[#6b7280] dark:text-muted',
    rowValueColor: 'text-[#111111] dark:text-white',
    ctaBg: 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
    ctaLabel: 'Open Standard',
    rows: [
      { label: 'Min deposit', value: '$100' },
      { label: 'Spread from', value: '1.0 pip' },
      { label: 'Commission', value: 'None' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Instruments', value: 'All 6 classes' },
      { label: 'Execution', value: 'Market' },
      { label: 'Stop-out', value: '20%' },
    ],
  },
  {
    id: 'raw',
    name: 'Raw',
    tag: 'BEST ANNUAL',
    desc: 'Institutional-grade spreads from 0.0 pip with a flat per-lot commission.',
    pricingLabel: 'PRICING',
    pricingValue: '$3.50 / lot / side',
    cardBg: 'bg-[#111111]',
    headTextColor: 'text-white',
    descColor: 'text-white/60',
    pricingLabelColor: 'text-white/50',
    pricingValueColor: 'text-accent',
    rowsContainerBg: 'bg-white dark:bg-surface-elevated',
    rowBg: 'bg-[#111111]',
    rowLabelColor: 'text-white/60',
    rowValueColor: 'text-white',
    ctaBg: 'bg-accent text-white',
    ctaLabel: 'Open Raw',
    rows: [
      { label: 'Min deposit', value: '$500' },
      { label: 'Spread from', value: '0.0 pip' },
      { label: 'Commission', value: '$3.50 / lot' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Instruments', value: 'All 6 classes' },
      { label: 'Execution', value: 'Market / ECN' },
      { label: 'Stop-out', value: '20%' },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    tag: 'HIGH VOLUME',
    desc: 'Dedicated dealer, custom spreads, priority withdrawals for $10k+ accounts.',
    pricingLabel: 'PRICING',
    pricingValue: 'From $1.50 / lot',
    cardBg: 'bg-white dark:bg-surface-elevated',
    headTextColor: 'text-[#111111] dark:text-white',
    descColor: 'text-[#6b7280] dark:text-muted',
    pricingLabelColor: 'text-[#6b7280] dark:text-muted',
    pricingValueColor: 'text-[#111111] dark:text-white',
    rowsContainerBg: 'bg-[#111111] dark:bg-surface-elevated',
    rowBg: 'bg-[#FAFAF9] dark:bg-surface',
    rowLabelColor: 'text-[#6b7280] dark:text-muted',
    rowValueColor: 'text-[#111111] dark:text-white',
    ctaBg: 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
    ctaLabel: 'Open VIP',
    rows: [
      { label: 'Min deposit', value: '$10,000' },
      { label: 'Spread from', value: '0.0 pip' },
      { label: 'Commission', value: 'From $1.50' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Instruments', value: 'All + early access' },
      { label: 'Execution', value: 'ECN priority' },
      { label: 'Stop-out', value: '15%' },
    ],
  },
] as const;

const MATRIX_ROWS: { feature: string; std: boolean; raw: boolean; vip: boolean }[] = [
  { feature: 'MetaTrader 5', std: true, raw: true, vip: true },
  { feature: 'Web & Mobile', std: true, raw: true, vip: true },
  { feature: 'Expert Advisors', std: true, raw: true, vip: true },
  { feature: 'Hedging', std: true, raw: true, vip: true },
  { feature: 'Dedicated dealer', std: false, raw: false, vip: true },
  { feature: 'Priority withdrawals', std: false, raw: true, vip: true },
  { feature: 'Free VPS hosting', std: false, raw: true, vip: true },
  { feature: 'Custom spreads', std: false, raw: false, vip: true },
];

interface AccountsPageProps {
  cmsAccounts?: CmsAccountOverride[];
}

export function AccountsPage({ cmsAccounts }: AccountsPageProps) {
  const locale = useLocale();

  const displayAccounts =
    cmsAccounts && cmsAccounts.length > 0
      ? cmsAccounts.map((a, i) => {
          const theme = CARD_THEMES[i % CARD_THEMES.length]!;
          return {
            id: String(a.id),
            name: a.name,
            tag: a.isPopular ? 'MOST POPULAR' : '',
            desc: a.features?.[0]?.value ?? '',
            pricingLabel: 'SPREAD FROM',
            pricingValue: a.spreadFrom,
            ctaLabel: `Open ${a.name}`,
            rows: [
              { label: 'Min deposit', value: `$${a.minDeposit}` },
              { label: 'Spread from', value: a.spreadFrom },
              { label: 'Commission', value: a.commission ?? 'None' },
              { label: 'Leverage', value: a.leverage },
            ],
            ...theme,
          };
        })
      : ACCOUNTS;

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-8 pt-9">
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

      {/* Cards — horizontal scroll snap */}
      <section className="bg-background pb-10">
        <div
          className="scrollbar-hide flex snap-x snap-mandatory gap-[14px] overflow-x-auto px-5 pb-2"
          style={{ scrollPaddingLeft: '20px' }}
        >
          {ACCOUNTS.map((account) => {
            const cms = cmsAccounts?.find(
              (a) => a.name.toLowerCase() === account.name.toLowerCase(),
            );
            const rows = cms
              ? [
                  { label: 'Min deposit', value: `$${cms.minDeposit.toLocaleString('en-US')}` },
                  { label: 'Spread from', value: cms.spreadFrom },
                  { label: 'Commission', value: cms.commission ?? 'None' },
                  { label: 'Leverage', value: cms.leverage },
                  ...account.rows.slice(4),
                ]
              : account.rows;
            const pricingValue = cms?.commission ?? account.pricingValue;
            return (
              <div
                key={account.id}
                className={`shadow-card dark:shadow-card-dark flex w-[350px] flex-shrink-0 snap-start flex-col gap-[18px] rounded-[24px] p-6 ${account.cardBg}`}
              >
                {/* Head */}
                <div className="flex items-center justify-between">
                  <span className={`font-sans text-[20px] font-semibold ${account.headTextColor}`}>
                    {account.name}
                  </span>
                  <span className="bg-accent/10 text-accent rounded-full px-[10px] py-[5px] font-mono text-[10px] tracking-[1.2px]">
                    {account.tag}
                  </span>
                </div>

                {/* Description */}
                <p className={`font-body text-[13px] leading-[1.55] ${account.descColor}`}>
                  {account.desc}
                </p>

                {/* Price block */}
                <div>
                  <p
                    className={`font-body mb-1 text-[9px] uppercase tracking-[0.14em] ${account.pricingLabelColor}`}
                  >
                    {account.pricingLabel}
                  </p>
                  <p className={`font-sans text-[20px] font-semibold ${account.pricingValueColor}`}>
                    {pricingValue}
                  </p>
                </div>

                {/* Spec rows */}
                <div
                  className={`flex flex-col overflow-hidden rounded-[14px] ${account.rowsContainerBg}`}
                >
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between px-4 py-[11px] ${account.rowBg}`}
                    >
                      <span className={`font-body text-[12px] ${account.rowLabelColor}`}>
                        {row.label}
                      </span>
                      <span
                        className={`font-body text-[12px] font-medium ${account.rowValueColor}`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?account=${account.id}`}
                  className={`font-body flex h-[48px] items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-opacity hover:opacity-80 ${account.ctaBg}`}
                >
                  {account.ctaLabel}
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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

      {/* Feature Matrix */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/60 [&>span:last-child]:text-white/60">
            FEATURE MATRIX
          </SectionKicker>
          <h2 className="mb-7 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Compare side
            <br />
            by side.
          </h2>

          {/* Table */}
          <div className="overflow-hidden rounded-[18px] bg-[#111111]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_52px_52px_52px] border-b border-white/10">
              <div className="px-4 py-3">
                <span className="font-body text-[9px] uppercase tracking-[0.1em] text-[#FFFFFF8C]">
                  Feature
                </span>
              </div>
              {['Std', 'Raw', 'VIP'].map((h) => (
                <div key={h} className="flex items-center justify-center py-3">
                  <span
                    className={`font-body text-[9px] uppercase tracking-[0.1em] ${h === 'Raw' ? 'text-[#00B050]' : 'text-[#FFFFFF8C]'}`}
                  >
                    {h}
                  </span>
                </div>
              ))}
            </div>
            {MATRIX_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_52px_52px_52px] ${i < MATRIX_ROWS.length - 1 ? 'border-b border-white/10' : ''}`}
              >
                <div className="px-4 py-[13px]">
                  <span className="font-body text-[13px] text-white/80">{row.feature}</span>
                </div>
                {[row.std, row.raw, row.vip].map((val, j) => (
                  <div key={j} className="flex items-center justify-center py-[13px]">
                    {val ? CHECK : DASH}
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
