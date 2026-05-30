'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const PARTNER_TYPES = [
  {
    id: 'ib',
    tag: 'MOST POPULAR',
    tagClass: 'bg-[rgba(242,242,244,0.08)] text-white',
    title: 'Introducing Broker',
    desc: 'Earn up to $8 per lot traded by your referrals. Tiered structure with monthly bonus.',
    cardClass: 'bg-[#111111]',
    headColor: 'text-white',
    descColor: 'text-white/60',
    statLabelColor: 'text-white/45',
    statValueColor: 'text-white',
    statRowBg: 'bg-[#111111]',
    statGridBg: 'bg-[rgba(255,255,255,0.1)]',
    ctaClass: 'bg-accent text-white',
    stats: [
      { label: 'UP TO', value: '$8/lot' },
      { label: 'PAYOUTS', value: 'Monthly' },
      { label: 'MINIMUM', value: 'None' },
    ],
  },
  {
    id: 'affiliate',
    tag: 'CPA',
    tagClass: 'bg-accent/10 text-accent',
    title: 'Affiliate',
    desc: 'Fixed cost-per-acquisition payouts up to $1,200 per qualified trader. Built for digital marketers.',
    cardClass: 'bg-surface dark:bg-surface',
    headColor: 'text-foreground',
    descColor: 'text-muted',
    statLabelColor: 'text-muted',
    statValueColor: 'text-foreground',
    statRowBg: 'bg-background',
    statGridBg: 'bg-[rgba(17,17,17,0.08)] dark:bg-[rgba(255,255,255,0.06)]',
    ctaClass: 'bg-foreground text-background',
    stats: [
      { label: 'UP TO', value: '$1,200' },
      { label: 'COOKIE', value: '90 days' },
      { label: 'MIN CPA', value: '$50' },
    ],
  },
  {
    id: 'white-label',
    tag: 'ENTERPRISE',
    tagClass: 'bg-accent/10 text-accent',
    title: 'White Label',
    desc: 'Launch your own brokerage on our infrastructure. Full MT5 stack, KYC, treasury, support.',
    cardClass: 'bg-surface dark:bg-surface',
    headColor: 'text-foreground',
    descColor: 'text-muted',
    statLabelColor: 'text-muted',
    statValueColor: 'text-foreground',
    statRowBg: 'bg-background',
    statGridBg: 'bg-[rgba(17,17,17,0.08)] dark:bg-[rgba(255,255,255,0.06)]',
    ctaClass: 'bg-foreground text-background',
    stats: [
      { label: 'SETUP', value: '< 30 days' },
      { label: 'SPREAD MARK-UP', value: 'Custom' },
      { label: 'TECH', value: 'Turnkey' },
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
      <section className="bg-background px-5 pb-8 pt-9">
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
            <div className="flex flex-1 flex-col gap-3 divide-y divide-[#e5e7eb] dark:divide-border">
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
            <div className="dark:bg-surface flex w-[130px] flex-shrink-0 flex-col overflow-hidden rounded-[18px] bg-surface p-3">
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
      <section id="programs" className="rounded-t-[32px] bg-background px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-muted text-muted">
            CHOOSE YOUR PATH
          </SectionKicker>
          <h2 className="text-foreground mb-[10px] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            Three ways to partner.
          </h2>
          <div className="mt-6 flex flex-col gap-[14px] xl:grid xl:grid-cols-3">
            {PARTNER_TYPES.map((pt) => (
              <div
                key={pt.id}
                className={`flex flex-col gap-[12px] rounded-[22px] p-[22px] shadow-card dark:shadow-card-dark ${pt.cardClass}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-sans text-[22px] font-semibold tracking-[-0.44px] ${pt.headColor}`}>
                    {pt.title}
                  </span>
                  <span className={`font-mono flex-shrink-0 rounded-full px-[10px] py-[6px] text-[10px] tracking-[1.2px] ${pt.tagClass}`}>
                    {pt.tag}
                  </span>
                </div>

                {/* Desc */}
                <p className={`font-body text-[13px] leading-[1.55] ${pt.descColor}`}>{pt.desc}</p>

                {/* Stats */}
                <div className={`flex gap-px overflow-hidden rounded-[12px] ${pt.statGridBg}`}>
                  {pt.stats.map((s) => (
                    <div
                      key={s.label}
                      className={`flex flex-1 flex-col gap-[2px] px-[10px] py-[12px] ${pt.statRowBg}`}
                    >
                      <span className={`font-mono text-[9px] tracking-[1.08px] ${pt.statLabelColor}`}>
                        {s.label}
                      </span>
                      <span className={`font-sans text-[14px] font-semibold ${pt.statValueColor}`}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/register?type=partner&program=${pt.id}`}
                  className={`font-body mt-1 flex items-center justify-center gap-2 rounded-full px-5 py-[14px] text-[14px] font-medium transition-opacity hover:opacity-80 ${pt.ctaClass}`}
                >
                  Apply
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="dark:bg-background rounded-t-[32px] bg-surface px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-muted text-muted">
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
                className={`flex items-start gap-4 py-5 ${i < STEPS.length - 1 ? 'border-b border-[#e5e7eb] dark:border-border' : ''}`}
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
