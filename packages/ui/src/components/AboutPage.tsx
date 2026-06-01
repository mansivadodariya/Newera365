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
  { label: 'Careers', href: '/company/careers', desc: 'Join our growing team of 120+' },
  {
    label: 'Awards & recognition',
    href: '/company/awards',
    desc: 'Industry awards we are proud of',
  },
  { label: 'Media & press', href: '/company/media', desc: 'Press kit, logos and media contacts' },
  { label: 'Get in touch', href: '/contact', desc: 'Real people. Real answers.' },
] as const;

export interface CmsTeamMemberItem {
  id: number;
  name: string;
  role: string;
  bio?: string | null;
  photoUrl?: string | null;
  photoAlt?: string | null;
}

export interface CmsAwardItem {
  id: number;
  title: string;
  date: string;
  description?: string | null;
  logoUrl?: string | null;
  logoAlt?: string | null;
  externalUrl?: string | null;
}

interface AboutPageProps {
  team?: CmsTeamMemberItem[];
  awards?: CmsAwardItem[];
}

export function AboutPage({ team: cmsTeam, awards: _awards }: AboutPageProps) {
  const locale = useLocale();

  const displayTeam = cmsTeam && cmsTeam.length > 0 ? cmsTeam : null;

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-10 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:flex-row xl:items-start xl:gap-12">
            {/* Left: heading */}
            <div className="xl:flex-1">
              <h1 className="text-foreground mb-6 font-sans text-[38px] font-semibold leading-[1.08] xl:text-[56px] xl:leading-[1.04]">
                A new era of trading, <span className="text-accent">built by traders.</span>
              </h1>
            </div>

            {/* Right: CEO quote card */}
            <div className="xl:w-[480px] xl:flex-shrink-0">
              <div
                className="rounded-[20px] bg-[#111111] p-5 xl:p-7"
                style={{ boxShadow: '0 4px 32px rgba(0,176,80,0.10)' }}
              >
                <p className="font-body mb-4 text-[14px] leading-[1.65] text-white/80 xl:text-[15px]">
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
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body mb-5 text-[10px] uppercase tracking-[0.12em] text-[#9ca3af]">
            A DECADE OF COMPOUNDING
          </p>
          <div className="flex flex-col">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-4">
                {/* Connector */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${i === MILESTONES.length - 1 ? 'bg-accent' : 'border-accent border-2 bg-transparent'}`}
                  />
                  {i < MILESTONES.length - 1 && (
                    <div className="my-1 w-px flex-1 bg-[#e5e7eb] dark:bg-[#2a2a2a]" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-accent text-[10px] font-semibold uppercase tracking-[0.1em]">
                      {m.year}
                    </span>
                    <span className="font-body text-[10px] text-[#9ca3af]">· {m.label}</span>
                  </div>
                  <p className="font-body text-muted mt-1 text-[13px] leading-relaxed">{m.desc}</p>
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
          <div className="grid grid-cols-2 gap-[10px] xl:gap-5">
            {(displayTeam ?? TEAM).map((member) => {
              const isCms = displayTeam !== null;
              const name = member.name;
              const title = isCms
                ? (member as CmsTeamMemberItem).role
                : (member as (typeof TEAM)[0]).title;
              const initials = isCms
                ? name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : (member as (typeof TEAM)[0]).initials;
              const photoUrl = isCms ? (member as CmsTeamMemberItem).photoUrl : null;
              return (
                <div
                  key={name}
                  className="rounded-[18px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#111111]">
                    {photoUrl ? (
                      <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-sans text-[14px] font-semibold text-white">
                        {initials}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground font-sans text-[14px] font-semibold">{name}</p>
                  <p className="font-body text-muted mt-0.5 text-[12px]">{title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore links */}
      <section className="dark:bg-background bg-white px-5 pb-10 pt-[40px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            More from the company
          </SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.025em]">
            Explore
          </h1>
          <div className="flex flex-col divide-y divide-[#e5e7eb] xl:grid xl:grid-cols-2 xl:divide-y-0 xl:border-t xl:border-[#e5e7eb] dark:divide-[#2a2a2a] dark:xl:border-[#2a2a2a]">
            {EXPLORE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 xl:border-b xl:border-[#e5e7eb] xl:py-5 xl:first:pt-5 xl:last:pb-5 dark:xl:border-[#2a2a2a]"
              >
                <div>
                  <p className="text-foreground group-hover:text-accent font-sans text-[14px] font-semibold transition-colors">
                    {link.label}
                  </p>
                  <p className="font-body text-muted mt-0.5 text-[12px]">{link.desc}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="group-hover:text-accent flex-shrink-0 text-[#9ca3af] transition-colors"
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
            className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-8"
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
