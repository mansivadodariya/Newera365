'use client';

import { SectionKicker } from './SectionKicker';

/* Desktop cover images — Figma assets (7-day expiry, replace with permanent assets before launch) */
const COVER_VISA = 'https://www.figma.com/api/mcp/asset/b62e5aa8-4ac0-437f-bf91-4752b49ac0e1';
const COVER_SWIFT = 'https://www.figma.com/api/mcp/asset/7906d284-4d90-4921-8911-72072bc61257';
const COVER_SKRILL = 'https://www.figma.com/api/mcp/asset/45624c82-912d-4349-96e8-f140ad013f6c';
const COVER_NETELLER = 'https://www.figma.com/api/mcp/asset/66a07e99-45a3-4500-8894-e3f25e60721f';
const COVER_CRYPTO = 'https://www.figma.com/api/mcp/asset/f1b2f8cd-d7f2-424e-acea-084b791f808e';
const COVER_LOCAL = 'https://www.figma.com/api/mcp/asset/e66263cc-7536-4723-af2b-677895dec3b8';

function IconCreditCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="15" height="11" rx="2" stroke="#00B050" strokeWidth="1.4" />
      <path d="M1.5 7.5h15" stroke="#00B050" strokeWidth="1.4" />
      <rect x="3" y="10" width="4" height="1.5" rx="0.5" fill="#00B050" />
    </svg>
  );
}

function IconLandmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L2 5.5h14L9 2z" stroke="#00B050" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="3" y="6.5" width="1.5" height="6" rx="0.4" fill="#00B050" />
      <rect x="7.25" y="6.5" width="1.5" height="6" rx="0.4" fill="#00B050" />
      <rect x="11.5" y="6.5" width="1.5" height="6" rx="0.4" fill="#00B050" />
      <path d="M2 13.5h14" stroke="#00B050" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="#00B050" strokeWidth="1.4" />
      <ellipse cx="9" cy="9" rx="3" ry="6.5" stroke="#00B050" strokeWidth="1.4" />
      <path d="M2.5 9h13" stroke="#00B050" strokeWidth="1.4" />
      <path d="M3 6h12M3 12h12" stroke="#00B050" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconBitcoin() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6 3.5h5a2.5 2.5 0 010 5H6m0 0h5.5a2.5 2.5 0 010 5H6"
        stroke="#00B050"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M6 3.5v11M8 2.5v12.5" stroke="#00B050" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const PAYMENT_METHODS = [
  {
    id: 'card',
    type: 'CARD',
    name: 'Visa / Mastercard',
    deposit: 'Instant',
    withdraw: '1-3 days',
    min: '$50',
    fee: 'Free',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 8h18" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="11" width="4" height="2" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'bank',
    type: 'BANK',
    name: 'Bank wire (SWIFT)',
    deposit: '1-3 days',
    withdraw: '2-5 days',
    min: '$500',
    fee: 'Free',
    cover: COVER_SWIFT,
    coverFit: 'object-cover',
    icon: <IconLandmark />,
  },
  {
    id: 'skrill',
    type: 'E-WALLET',
    name: 'Skrill',
    deposit: 'Instant',
    withdraw: 'Within 24h',
    min: '$50',
    fee: 'Free',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="4" ry="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'neteller',
    type: 'E-WALLET',
    name: 'Neteller',
    deposit: 'Instant',
    withdraw: 'Within 24h',
    min: '$50',
    fee: 'Free',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="4" ry="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'crypto',
    type: 'CRYPTO',
    name: 'Crypto (USDT, BTC)',
    deposit: '< 30 min',
    withdraw: 'Within 24h',
    min: '$50',
    fee: 'Network only',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M7 10h6M7 7h5.5c1.1 0 2 .9 2 2s-.9 2-2 2H7M7 13h5.5c1.1 0 2-.9 2-2"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M9 5v10M11 5v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'local',
    type: 'REGIONAL',
    name: 'Local bank transfer',
    deposit: 'Same day',
    withdraw: '1-2 days',
    min: '$50',
    fee: 'Free',
    cover: COVER_LOCAL,
    coverFit: 'object-cover',
    icon: <IconLandmark />,
  },
] as const;

const GREEN_VALUES = new Set(['Instant', 'Same day', 'Free']);

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="dark:bg-surface flex flex-[1_0_0] flex-col gap-[2px] bg-[#fafaf9] px-[12px] py-[10px]">
      <span className="font-mono text-[9px] tracking-[1.08px] text-[#6b7280]">{label}</span>
      <span
        className={`font-sans text-[13px] font-semibold ${GREEN_VALUES.has(value) ? 'text-[#00b050]' : 'text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatsGrid({
  deposit,
  withdraw,
  min,
  fee,
}: {
  deposit: string;
  withdraw: string;
  min: string;
  fee: string;
}) {
  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-[12px] bg-[rgba(17,17,17,0.08)] dark:bg-[rgba(255,255,255,0.06)]">
      <div className="flex gap-px">
        <StatCell label="DEPOSIT" value={deposit} />
        <StatCell label="WITHDRAW" value={withdraw} />
      </div>
      <div className="flex gap-px">
        <StatCell label="MIN" value={min} />
        <StatCell label="FEE" value={fee} />
      </div>
    </div>
  );
}

const TRUST_ROWS = [
  {
    title: 'Segregated client funds',
    desc: 'Your money is held with tier-1 banks, separated from operating capital.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2L3 5.5V10c0 4 3 7 7 8 4-1 7-4 7-8V5.5L10 2z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 10l2 2 4-4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'PCI-DSS Level 1',
    desc: 'Payment data is encrypted in transit and at rest, audited annually.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 9V6.5a3 3 0 016 0V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'No weekend hold',
    desc: 'Withdrawals are processed 7 days a week, including holidays.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v4l2.5 2.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'No re-deposit fees',
    desc: 'Deposit and withdraw without per-transaction charges from us.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 10l4 4 8-8"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export interface CmsPaymentMethodItem {
  id: number;
  name: string;
  methodType: string;
  depositTime?: string | null;
  withdrawalTime?: string | null;
  minDeposit?: string | null;
  fee?: string | null;
  notes?: string | null;
}

interface FundingPageProps {
  paymentMethods?: CmsPaymentMethodItem[];
}

function HeroContent() {
  return (
    <>
      {/* Hero — desktop (shown below cards, above trust) */}
      <section className="dark:bg-background hidden bg-white pb-14 pt-[30px] xl:block xl:px-[120px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="h-[18px]" />
          <div className="flex items-baseline gap-0">
            <span className="text-foreground font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
              Money in,&nbsp;money out —&nbsp;
            </span>
            <span className="font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-[#00b050]">
              fast.
            </span>
          </div>
          <div className="h-4" />
          <p className="font-body text-muted max-w-[720px] text-[14px] leading-[1.55]">
            Free deposits, same-day withdrawals on most methods. Choose the channel that works for
            you.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            PAYMENT METHODS
          </SectionKicker>
          <div className="flex flex-col gap-[14px]">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="bg-background shadow-card flex flex-col gap-[14px] rounded-[18px] p-5 dark:shadow-none"
              >
                {/* Card header: icon box + type pill */}
                <div className="flex items-start justify-between">
                  <div className="bg-accent/[0.08] text-accent flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px]">
                    {method.icon}
                  </div>
                  <span className="text-foreground dark:bg-surface-elevated dark:text-foreground rounded-full bg-[rgba(17,17,17,0.05)] px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px]">
                    {method.type}
                  </span>
                </div>

                {/* Name — Outfit SemiBold 17px tracking-[-0.17px] */}
                <p className="text-foreground font-sans text-[17px] font-semibold tracking-[-0.17px]">
                  {method.name}
                </p>

                {/* Stats 2×2 grid — matches Figma rgba(17,17,17,0.08) wrapper, #fafaf9 cells */}
                <div className="dark:bg-surface-elevated grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-[rgba(17,17,17,0.08)]">
                  {[
                    {
                      label: 'DEPOSIT',
                      value: method.deposit,
                      green: method.deposit === 'Instant' || method.deposit === 'Same day',
                    },
                    { label: 'WITHDRAW', value: method.withdraw, green: false },
                    { label: 'MIN', value: method.min, green: false },
                    { label: 'FEE', value: method.fee, green: method.fee === 'Free' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="dark:bg-surface flex flex-col gap-[2px] bg-[#fafaf9] px-3 py-[10px]"
                    >
                      <span className="text-muted font-mono text-[9px] tracking-[1.08px]">
                        {stat.label}
                      </span>
                      <span
                        className={`font-sans text-[13px] font-semibold ${stat.green ? 'text-accent' : 'text-foreground'}`}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="rounded-t-[32px] bg-black px-5 py-10 xl:px-[120px] xl:py-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3 [&>span:first-child]:bg-white/40 [&>span:last-child]:text-white/60">
            WHY IT&apos;S SAFE
          </SectionKicker>
          <h2 className="mb-[22px] font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white">
            Trust, by design.
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2 xl:gap-6">
            {TRUST_ROWS.map((row) => (
              <div
                key={row.title}
                className="flex items-start gap-[14px] rounded-[14px] bg-[rgba(255,255,255,0.04)] p-[18px]"
              >
                <div className="bg-accent/[0.12] text-accent flex h-[37px] w-[37px] flex-shrink-0 items-center justify-center rounded-[11px]">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <p className="mb-[5px] font-sans text-[14px] font-semibold text-white">
                    {row.title}
                  </p>
                  <p className="font-body text-[12.5px] leading-[1.5] text-white/55">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function FundingPage(_props: FundingPageProps) {
  return <HeroContent />;
}
