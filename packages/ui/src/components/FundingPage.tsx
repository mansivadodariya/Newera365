'use client';

import { SectionKicker } from './SectionKicker';

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
        <rect x="1" y="4" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5" />
        <path d="M1 8h18" stroke="white" strokeWidth="1.5" />
        <rect x="4" y="11" width="4" height="2" rx="0.5" fill="white" />
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
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 8h16M2 15h16M10 3L2 8M10 3l8 5M5 8v7M10 8v7M15 8v7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
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
        <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
        <path d="M10 2v16M2 10h16" stroke="white" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="4" ry="8" stroke="white" strokeWidth="1.5" />
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
        <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
        <path d="M10 2v16M2 10h16" stroke="white" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="4" ry="8" stroke="white" strokeWidth="1.5" />
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
        <path d="M9 5v10M11 5v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 8h16M2 15h16M10 3L2 8M10 3l8 5M5 8v7M10 8v7M15 8v7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

const TRUST_ROWS = [
  {
    title: 'Segregated client funds',
    desc: 'Your money is held with tier-1 banks, separated from operating capital.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="white" strokeWidth="1.5" />
        <path d="M7 9V6.5a3 3 0 016 0V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="13" r="1" fill="white" />
      </svg>
    ),
  },
  {
    title: 'No weekend hold',
    desc: 'Withdrawals are processed 7 days a week, including holidays.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.5" />
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
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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

export function FundingPage() {
  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            <span>
              Money in,
              <br /> money out —
            </span>
            <br />
            <span className="text-accent">fast.</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            Free deposits, same-day withdrawals on most methods. Choose the channel that works for
            you.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            PAYMENT METHODS
          </SectionKicker>
          <div className="flex flex-col gap-[14px]">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="dark:bg-surface flex flex-col gap-[14px] rounded-[18px] bg-white p-5"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
              >
                {/* Card header: icon box + type pill */}
                <div className="flex items-center justify-between">
                  <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] bg-[#00b04fbf] dark:bg-[#00b04f61]">
                    {method.icon}
                  </div>
                  <span className="font-body text-muted rounded-full bg-[#1111110D] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] dark:bg-[#363636]">
                    {method.type}
                  </span>
                </div>

                {/* Name */}
                <p className="text-foreground font-sans text-[17px] font-semibold">{method.name}</p>

                {/* Stats 2×2 grid */}
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
                  {[
                    { label: 'DEPOSIT', value: method.deposit },
                    { label: 'WITHDRAW', value: method.withdraw },
                    { label: 'MIN', value: method.min },
                    { label: 'FEE', value: method.fee },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="dark:bg-surface flex flex-col gap-[3px] bg-[#fafafa] px-4 py-3"
                    >
                      <span className="font-body text-[9px] uppercase tracking-[0.12em] text-[#9ca3af]">
                        {stat.label}
                      </span>
                      <span className="font-body text-foreground text-[13px] font-medium">
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
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            WHY IT&apos;S SAFE
          </SectionKicker>
          <h2 className="mb-7 font-sans text-[32px] font-semibold leading-[1.1] text-white">
            Trust, by design.
          </h2>
          <div className="flex flex-col gap-[10px]">
            {TRUST_ROWS.map((row) => (
              <div
                key={row.title}
                className="flex items-start gap-4 rounded-[14px] bg-white/[0.06] px-4 py-4"
              >
                <div className="bg-accent mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px]">
                  {row.icon}
                </div>
                <div>
                  <p className="mb-[5px] font-sans text-[14px] font-semibold text-white">
                    {row.title}
                  </p>
                  <p className="font-body text-[12px] leading-relaxed text-white/60">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
