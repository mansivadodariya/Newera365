'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const MILESTONES = [
  {
    year: '2014',
    label: 'Founded',
    desc: 'Started with a single broker license and a focus on institutional-grade retail trading.',
  },
  {
    year: '2016',
    label: 'First license',
    desc: 'Granted FCA authorisation — regulated where it matters to clients in Singapore, EU and the UK.',
  },
  {
    year: '2019',
    label: '500k traders',
    desc: 'Crossed half a million active accounts during a period of global expansion across 6 countries.',
  },
  {
    year: '2022',
    label: 'Global expansion',
    desc: 'Expanded to ASIC and CySEC jurisdictions. Offices opened in Dubai and Singapore.',
  },
  {
    year: '2024',
    label: 'New era',
    desc: 'Released the NewEra365 platform — built from the ground up with every tool a trader needs.',
  },
] as const;

const TEAM = [
  { initials: 'AM', name: 'Alex M.', title: 'Head of Trading' },
  { initials: 'SG', name: 'Sara G.', title: 'Co-Founder' },
  { initials: 'DR', name: 'Diego R.', title: 'Chief Compliance' },
  { initials: 'MK', name: 'Maya K.', title: 'Chief Dealer' },
] as const;

const EXPLORE_LINKS = [
  {
    label: 'Careers',
    href: '/company/careers',
    desc: 'We are hiring across 8 cities',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M2.5 13.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Awards & recognition',
    href: '/company/awards',
    desc: 'Industry honors and press',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 10l-3.1 1.5.6-3.5L3 5.5 6.5 5 8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Media & press',
    href: '/company/media',
    desc: 'Latest coverage of NewEra365',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Get in touch',
    href: '/contact',
    desc: 'Talk to the team directly',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function AboutPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-10 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-6 font-sans text-[38px] font-semibold leading-[1.08]">
            A new era of trading, <span className="text-accent">built by traders.</span>
          </h1>

          {/* Quote card */}
          <div
            className="rounded-[20px] bg-[#111111] p-5"
            style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.10)' }}
          >
            <p className="font-body mb-4 text-[14px] leading-[1.65] text-white/80">
              &ldquo;To give every trader — from first deposit to first million — the tools, the
              speed, and the trust they need to compete on a level field.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-accent flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                <span className="font-sans text-[13px] font-semibold text-white">AM</span>
              </div>
              <div>
                <p className="font-sans text-[13px] font-semibold text-white">Alex M.</p>
                <p className="font-body text-[11px] text-white/40">CEO &amp; Co-Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-t-[32px] bg-background px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-muted text-muted">
            THE ROAD SO FAR
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            A decade of compounding.
          </h2>
          <div className="flex flex-col">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-[18px] pb-[22px]">
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`mt-1 h-[22px] w-[22px] flex-shrink-0 rounded-full border-2 ${i === MILESTONES.length - 1 ? 'border-accent bg-accent' : 'border-border bg-background'}`}
                  />
                  {i < MILESTONES.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1">
                  <span className="font-mono text-[11px] font-bold text-accent tracking-[1.32px]">
                    {m.year}
                  </span>
                  <p className="text-foreground font-sans text-[17px] font-semibold leading-normal">
                    {m.label}
                  </p>
                  <p className="font-body text-muted mt-1 text-[13px] leading-[1.55]">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="gap-[14px] rounded-[32px] bg-white bg-[linear-gradient(180deg,#F8F8F7_0%,#FFFFFF_100%)] pb-[36px] pl-[20px] pr-[20px] pt-[40px] dark:bg-[linear-gradient(180deg,#07090D_0%,#07090D_100%)]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            THE TEAM
          </SectionKicker>
          <h1 className="text-foreground mb-5 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.025em]">
            Operators not
            <br /> marketers.
          </h1>
          <div className="grid grid-cols-2 gap-[10px]">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-[18px] bg-surface p-4 shadow-card dark:shadow-none"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#111111]">
                  <span className="font-sans text-[14px] font-semibold text-white">
                    {member.initials}
                  </span>
                </div>
                <p className="text-foreground font-sans text-[14px] font-semibold">{member.name}</p>
                <p className="font-body text-muted mt-0.5 text-[12px]">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore links */}
      <section className="rounded-t-[32px] bg-background px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-muted text-muted">
            MORE FROM THE COMPANY
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            Explore.
          </h2>
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {EXPLORE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className="group flex items-center gap-[14px] rounded-[18px] bg-surface px-[18px] py-[18px] shadow-card transition-shadow hover:shadow-card-dark dark:shadow-none"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#f2f2f4] text-foreground dark:bg-[#2a2a2a]">
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-sans text-[15px] font-semibold leading-normal">
                    {link.label}
                  </p>
                  <p className="font-body text-muted mt-[2px] text-[12px]">{link.desc}</p>
                </div>
                <span className="text-muted flex-shrink-0 text-[18px]">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            GET STARTED
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            A premium global
            <br />
            <span className="text-accent">trading platform.</span>
          </h2>
          <p className="font-body mb-8 text-[13px] leading-relaxed text-white/60">
            Built for the new era of markets.
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Open an account
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
      </section>
    </>
  );
}
