'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
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
    label: '100k traders',
    desc: 'Crossed six figures of active accounts during a period of rapid expansion across 6 countries.',
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
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M2.5 13.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Awards & recognition',
    href: '/company/awards',
    desc: 'Industry honors and press',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 10l-3.1 1.5.6-3.5L3 5.5 6.5 5 8 2z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Media & press',
    href: '/company/media',
    desc: 'Latest coverage of NewEra365',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Get in touch',
    href: '/contact',
    desc: 'Talk to the team directly',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

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
  const t = useTranslations('about');

  const displayTeam = cmsTeam && cmsTeam.length > 0 ? cmsTeam : null;

  return (
    <>
      {/* Hero — 42px tracking-[-1.26px] per Figma */}
      <section className="bg-background rounded-b-[32px] px-5 pb-7 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px]">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted mt-4 max-w-[320px] text-[14px] leading-[1.6]">
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Mission section — bg-[#111] per Figma, Outfit Medium 24px quote */}
      <section className="rounded-t-[32px] bg-[#111111] px-5 pb-11 pt-11">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 text-white [&>span:first-child]:bg-white">
            {t('missionKicker')}
          </SectionKicker>
          <p className="font-sans text-[24px] font-medium leading-[1.3] tracking-[-0.36px] text-white">
            {t('missionText')}
          </p>
          <div className="my-6 border-t border-white/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[18px] font-semibold text-white">Alex M.</p>
              <p className="font-body text-[12px] text-white/55">{t('ceoTitle')}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] tracking-[1.35px] text-white/40">
                {t('founderLetterLabel')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-background rounded-t-[32px] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('timelineKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            {t('timelineHeading')}
          </h2>
          <div className="flex flex-col">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-[18px] pb-[22px]">
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`mt-1 h-[22px] w-[22px] flex-shrink-0 rounded-full border-2 ${i === MILESTONES.length - 1 ? 'border-accent bg-accent' : 'border-border bg-background'}`}
                  />
                  {i < MILESTONES.length - 1 && <div className="bg-border mt-1 w-px flex-1" />}
                </div>
                {/* Content */}
                <div className="flex-1">
                  <span className="text-accent font-mono text-[11px] font-bold tracking-[1.32px]">
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

      {/* Team — gradient section, white cards per Figma */}
      <section
        className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('teamKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            {t('teamHeading')}
          </h2>
          <div className="grid grid-cols-2 gap-[10px]">
            {TEAM.map((member, i) => (
              <div
                key={`team-${i}-${member.name}`}
                className="bg-background shadow-card flex h-[145px] flex-col gap-[14px] rounded-[18px] p-[18px] dark:shadow-none"
              >
                {/* Avatar — dark gradient per Figma */}
                <div
                  className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-[16px]"
                  style={{ background: 'linear-gradient(135deg, #111111 0%, #333333 71.43%)' }}
                >
                  <span className="font-sans text-[16px] font-semibold tracking-[-0.16px] text-white">
                    {member.initials}
                  </span>
                </div>
                <div>
                  <p className="text-foreground font-sans text-[15px] font-semibold">
                    {member.name}
                  </p>
                  <p className="font-body text-muted mt-[2px] text-[12px]">{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore links */}
      <section className="bg-background rounded-t-[32px] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('exploreKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            {t('exploreHeading')}
          </h2>
          <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
            {EXPLORE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className="bg-surface shadow-card dark:hover:bg-surface-elevated group flex items-center gap-[14px] rounded-[18px] px-[18px] py-[18px] transition-colors hover:bg-[#f0f0ee] dark:shadow-none"
              >
                <div className="text-foreground dark:bg-surface-elevated flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#f2f2f4]">
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-sans text-[15px] font-semibold leading-normal">
                    {link.href === '/company/careers'
                      ? t('exploreCareers')
                      : link.href === '/company/awards'
                        ? t('exploreAwards')
                        : link.href === '/company/media'
                          ? t('exploreMedia')
                          : t('exploreContact')}
                  </p>
                  <p className="font-body text-muted mt-[2px] text-[12px]">
                    {link.href === '/company/careers'
                      ? t('exploreCareersDesc')
                      : link.href === '/company/awards'
                        ? t('exploreAwardsDesc')
                        : link.href === '/company/media'
                          ? t('exploreMediaDesc')
                          : t('exploreContactDesc')}
                  </p>
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
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            {t('ctaLine1')}
            <br />
            <span className="text-accent">{t('ctaLine2')}</span>
          </h2>
          <p className="font-body mb-8 text-[13px] leading-relaxed text-white/60">
            {t('ctaLine3')}
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-8"
          >
            {t('ctaBtn')}
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
