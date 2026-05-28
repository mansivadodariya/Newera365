'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const PARTNER_TYPES = [
  {
    id: 'ib',
    tag: 'BEST ANNUAL',
    tagClass: 'bg-accent text-white',
    title: 'Introducing Broker',
    desc: 'Up to $4 rebate per lot for lifetime. Minimum 3 active traders per referral.',
    cardClass: 'bg-[#111111]',
    headColor: 'text-white',
    descColor: 'text-white/60',
    statLabelColor: 'text-white/40',
    statValueColor: 'text-white',
    statRowBg: 'bg-[#1a1a1a]',
    statBorderColor: 'border-white/[0.07]',
    ctaClass: 'bg-accent text-white',
    stats: [
      { label: 'REBATE', value: '$4 / lot' },
      { label: 'PAYMENT', value: 'Monthly' },
      { label: 'TERM', value: 'Lifetime' },
    ],
  },
  {
    id: 'affiliate',
    tag: 'FLEXIBLE',
    tagClass: 'bg-[#F59E0B] text-white',
    title: 'Affiliate',
    desc: 'Up to $1,000 per qualified referral. Link-tracked, no minimum volume required.',
    cardClass: 'bg-white dark:bg-[#1c1c1c]',
    headColor: 'text-[#111111] dark:text-white',
    descColor: 'text-[#6b7280] dark:text-[#9ca3af]',
    statLabelColor: 'text-[#9ca3af]',
    statValueColor: 'text-[#111111] dark:text-white',
    statRowBg: 'bg-[#f9f9f9] dark:bg-[#141414]',
    statBorderColor: 'border-[#e5e7eb] dark:border-[#2a2a2a]',
    ctaClass: 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
    stats: [
      { label: 'MAX PAYOUT', value: '$1,000' },
      { label: 'COOKIE', value: '90 days' },
      { label: 'MIN PAYOUT', value: '$50' },
    ],
  },
  {
    id: 'white-label',
    tag: 'ENTERPRISE',
    tagClass: 'bg-[#8B5CF6] text-white',
    title: 'White Label',
    desc: 'Launch your own brokerage on our infrastructure. Full MT5 setup and KYC, turnkey.',
    cardClass: 'bg-white dark:bg-[#1c1c1c]',
    headColor: 'text-[#111111] dark:text-white',
    descColor: 'text-[#6b7280] dark:text-[#9ca3af]',
    statLabelColor: 'text-[#9ca3af]',
    statValueColor: 'text-[#111111] dark:text-white',
    statRowBg: 'bg-[#f9f9f9] dark:bg-[#141414]',
    statBorderColor: 'border-[#e5e7eb] dark:border-[#2a2a2a]',
    ctaClass: 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
    stats: [
      { label: 'SETUP', value: '< 30 days' },
      { label: 'SPREADS', value: 'Custom' },
      { label: 'TURNKEY', value: 'Yes' },
    ],
  },
] as const;

const STEPS = [
  {
    num: '01',
    title: 'Apply online',
    desc: 'Submit our application in 3 minutes. No paperwork, no phone calls required.',
  },
  {
    num: '02',
    title: 'Get approved',
    desc: 'Our compliance team contacts you within 48 hours of submission.',
  },
  {
    num: '03',
    title: 'Get your toolkit',
    desc: 'Login credentials, custom landing pages, live reporting dashboard and tracking links.',
  },
  {
    num: '04',
    title: 'Earn monthly',
    desc: 'Commissions paid on the 5th of every month, straight to your account.',
  },
] as const;

const TRUST_STATS = [
  { value: '$4,820', label: 'Avg. monthly earnings' },
  { value: '320+', label: 'Active partners' },
  { value: '48h', label: 'Approval time' },
] as const;

export function IBPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            Partner with us.
            <br />
            <span className="text-accent">Grow together.</span>
          </h1>
          <p className="font-body text-muted mb-7 max-w-[320px] text-[14px] leading-[1.55]">
            Earn industry-leading commission for every active trader you refer. Transparent payouts,
            reliable settlement, dedicated support.
          </p>

          {/* Stats + mini chart */}
          <div className="mb-7 flex items-stretch gap-3">
            {/* Stats */}
            <div className="flex flex-1 flex-col gap-3 divide-y divide-[#e5e7eb] dark:divide-[#2a2a2a]">
              {TRUST_STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-[2px] pt-3 first:pt-0">
                  <span className="text-foreground font-sans text-[22px] font-semibold">
                    {s.value}
                  </span>
                  <span className="font-body text-muted text-[10px] uppercase tracking-[0.1em]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Earnings bar chart */}
            <div className="dark:bg-surface flex w-[130px] flex-shrink-0 flex-col overflow-hidden rounded-[18px] bg-[#f9f9f9] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-body text-muted text-[9px] uppercase tracking-[0.1em]">
                  Monthly
                </span>
                <span className="bg-accent/10 text-accent font-body rounded-full px-2 py-[2px] text-[8px] font-semibold">
                  Programs
                </span>
              </div>
              <div className="flex flex-1 items-end gap-1">
                {[35, 52, 44, 68, 58, 80, 72, 90].map((h, i) => (
                  <div
                    key={i}
                    className="bg-accent flex-1 rounded-sm"
                    style={{ height: `${h}%`, opacity: i === 7 ? 1 : 0.4 + i * 0.08 }}
                  />
                ))}
              </div>
              <p className="text-foreground mt-2 font-sans text-[11px] font-semibold">$4,820</p>
              <p className="font-body text-muted text-[8px]">avg / mo</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/${locale}/register?type=partner`}
              className="bg-accent hover:bg-accent/90 font-body flex h-[48px] items-center gap-2 rounded-full px-6 text-[14px] font-medium text-white transition-colors"
            >
              Apply now
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
            <a
              href="#programs"
              className="border-border text-foreground font-body hover:border-foreground flex h-[48px] items-center rounded-full border px-5 text-[14px] font-medium transition-colors"
            >
              See programs
            </a>
          </div>
        </div>
      </section>

      {/* Three ways to partner */}
      <section id="programs" className="dark:bg-background mx-auto bg-white px-5 pb-10">
        <div className="">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            Choose Your Path
          </SectionKicker>
          <h1 className="text-foreground mb-7 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.025em]">
            Three ways to partner
          </h1>
          <div className="flex flex-col gap-[14px] md:grid md:grid-cols-3">
            {PARTNER_TYPES.map((pt) => (
              <div
                key={pt.id}
                className={`flex flex-col gap-5 rounded-[22px] p-5 ${pt.cardClass}`}
                style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`font-sans text-[17px] font-semibold leading-[1.2] ${pt.headColor}`}
                  >
                    {pt.title}
                  </span>
                  <span
                    className={`font-body mt-0.5 flex-shrink-0 rounded-full px-2.5 py-[4px] text-[9px] font-semibold uppercase tracking-[0.12em] ${pt.tagClass}`}
                  >
                    {pt.tag}
                  </span>
                </div>

                {/* Desc */}
                <p className={`font-body text-[12px] leading-[1.6] ${pt.descColor}`}>{pt.desc}</p>

                {/* Stats */}
                <div
                  className={`flex flex-col gap-px overflow-hidden rounded-[12px] border ${pt.statBorderColor}`}
                >
                  {pt.stats.map((s) => (
                    <div
                      key={s.label}
                      className={`flex items-center justify-between px-3 py-[10px] ${pt.statRowBg}`}
                    >
                      <span
                        className={`font-body text-[9px] uppercase tracking-[0.1em] ${pt.statLabelColor}`}
                      >
                        {s.label}
                      </span>
                      <span className={`font-body text-[13px] font-semibold ${pt.statValueColor}`}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?type=partner&program=${pt.id}`}
                  className={`font-body flex h-[44px] items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80 ${pt.ctaClass}`}
                >
                  Apply
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
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="dark:bg-background rounded-t-[32px] bg-[#f9f9f9] px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            HOW IT WORKS
          </SectionKicker>
          <h2 className="text-foreground mb-7 font-sans text-[28px] font-semibold leading-[1.1]">
            Onboard in days,
            <br />
            not weeks.
          </h2>
          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`flex items-start gap-4 py-5 ${i < STEPS.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]' : ''}`}
              >
                <div className="bg-accent mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-sans text-[11px] font-bold text-white">{step.num}</span>
                </div>
                <div>
                  <p className="text-foreground mb-1 font-sans text-[15px] font-semibold">
                    {step.title}
                  </p>
                  <p className="font-body text-muted text-[12px] leading-[1.55]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 text-center font-sans text-[28px] font-semibold leading-[1.1] text-white">
            Ready to build a<br />
            new revenue
            <br /> stream?
          </h2>
          <p className="font-body mb-8 text-center text-[13px] leading-relaxed text-white/60">
            Apply in minutes. Our partnership team reviews every application within 48 hours.
          </p>
          <Link
            href={`/${locale}/register?type=partner`}
            className="bg-accent hover:bg-accent/90 font-body mb-3 flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-medium text-white transition-colors"
          >
            Become a partner
          </Link>
          <button className="font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40">
            Download partner deck
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v8M4 9l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}
