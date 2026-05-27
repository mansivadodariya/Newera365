'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const MILESTONES = [
  { year: '2012', event: 'Founded with a focus on institutional-grade retail trading.' },
  { year: '2015', event: 'Received FCA authorisation and launched MT4 platform.' },
  { year: '2018', event: 'Expanded to ASIC and CySEC jurisdictions, surpassed 50k clients.' },
  { year: '2021', event: 'Launched MetaTrader 5 with 200+ instruments and Web Trader.' },
  { year: '2023', event: 'Reached 180k active traders across 100+ countries.' },
  { year: '2024', event: 'Released NewEra365 platform — built from the ground up.' },
] as const;

const REGULATORS = [
  { name: 'FCA', full: 'Financial Conduct Authority', country: 'United Kingdom' },
  { name: 'ASIC', full: 'Australian Securities & Investments Commission', country: 'Australia' },
  { name: 'CySEC', full: 'Cyprus Securities & Exchange Commission', country: 'Cyprus' },
] as const;

const VALUES = [
  {
    title: 'Transparency',
    desc: 'Every fee is published. Every policy is plain-English. No surprises.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
        <path
          d="M10 7v3l2 2"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Client-first',
    desc: 'Segregated funds, fast withdrawals, 24/5 support — because it should be the standard.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3l1.8 3.6L16 7.3l-3 2.9.7 4.1L10 12.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    desc: 'We build the tools we would want as traders — and then we ship them.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v16M2 10h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="3" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Reliability',
    desc: '99.99% platform uptime, under-12ms execution, and zero re-quotes.',
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
] as const;

export function AboutPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">About Us</SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05]">
            Trading, built for the new era.
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            NewEra365 is a globally regulated multi-asset broker with over 12 years of experience
            serving retail and professional traders across 100+ countries.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="dark:bg-background bg-white px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
            {[
              { value: '12+', label: 'Years in markets' },
              { value: '180k', label: 'Active traders' },
              { value: '100+', label: 'Countries served' },
              { value: '200+', label: 'Instruments' },
            ].map((s) => (
              <div key={s.label} className="dark:bg-surface flex flex-col gap-1 bg-white px-4 py-5">
                <span className="text-accent font-sans text-[28px] font-semibold leading-none">
                  {s.value}
                </span>
                <span className="font-body text-muted text-[12px]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50 [&>span]:bg-white/40">
            OUR VALUES
          </SectionKicker>
          <h2 className="mb-7 font-sans text-[32px] font-semibold leading-[1.1] text-white">
            What we stand for.
          </h2>
          <div className="flex flex-col gap-[10px]">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="flex items-start gap-4 rounded-[14px] bg-white/[0.06] px-4 py-4"
              >
                <div className="bg-accent mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px]">
                  {v.icon}
                </div>
                <div>
                  <p className="mb-[5px] font-sans text-[14px] font-semibold text-white">
                    {v.title}
                  </p>
                  <p className="font-body text-[12px] leading-relaxed text-white/60">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulation */}
      <section className="dark:bg-background bg-white px-5 pb-10 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">REGULATION</SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[1.1]">
            Regulated where it matters.
          </h2>
          <div className="flex flex-col gap-[10px]">
            {REGULATORS.map((r) => (
              <div
                key={r.name}
                className="dark:bg-surface flex items-center justify-between rounded-[14px] bg-[#FAFAF9] px-5 py-4"
              >
                <div>
                  <p className="text-foreground font-sans text-[16px] font-semibold">{r.name}</p>
                  <p className="font-body text-muted mt-[3px] text-[12px]">{r.full}</p>
                </div>
                <span className="font-body text-muted text-[11px]">{r.country}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">MILESTONES</SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[28px] font-semibold leading-[1.1]">
            12 years of building trust.
          </h2>
          <div className="flex flex-col">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-accent mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
                  {i < MILESTONES.length - 1 && (
                    <div className="my-1 w-px flex-1 bg-[#e5e7eb] dark:bg-[#2a2a2a]" />
                  )}
                </div>
                <div className="pb-6">
                  <span className="text-accent font-mono text-[11px] font-semibold tracking-[0.1em]">
                    {m.year}
                  </span>
                  <p className="font-body text-foreground mt-1 text-[13px] leading-relaxed">
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-5 font-sans text-[32px] font-semibold leading-[1.1] text-white">
            Ready to trade with us?
          </h2>
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Open an account
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
      </section>
    </>
  );
}
