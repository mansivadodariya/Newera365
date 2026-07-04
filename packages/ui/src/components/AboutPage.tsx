'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { JourneyTimeline } from './JourneyTimelineClient';
import { SectionKicker } from './SectionKicker';

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
    href: '/company/media-press',
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

export interface CmsMilestoneItem {
  year: string;
  label: string;
  description?: string | null;
}

interface AboutPageProps {
  team?: CmsTeamMemberItem[];
  milestones?: CmsMilestoneItem[];
}

export function AboutPage({ team: cmsTeam, milestones: cmsMilestones }: AboutPageProps) {
  const locale = useLocale();
  const t = useTranslations('about');

  // Prefer CMS-managed, localized milestones; fall back to the i18n copy so the
  // timeline still renders if the collection is empty or the CMS is unreachable.
  const milestones =
    cmsMilestones && cmsMilestones.length > 0
      ? cmsMilestones.map((m) => ({ year: m.year, label: m.label, desc: m.description ?? '' }))
      : [
          { year: '2014', label: t('milestone2014Label'), desc: t('milestone2014Desc') },
          { year: '2016', label: t('milestone2016Label'), desc: t('milestone2016Desc') },
          { year: '2019', label: t('milestone2019Label'), desc: t('milestone2019Desc') },
          { year: '2022', label: t('milestone2022Label'), desc: t('milestone2022Desc') },
          { year: '2024', label: t('milestone2024Label'), desc: t('milestone2024Desc') },
        ];

  // Use CMS team members when available; fall back to the static design roster.
  // Normalise both shapes to { initials, name, title, photoUrl } so the grid
  // renders identically regardless of source.
  const displayTeam =
    cmsTeam && cmsTeam.length > 0
      ? cmsTeam.map((m) => ({
          name: m.name,
          title: m.role,
          initials: (m.name ?? '')
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase(),
          photoUrl: m.photoUrl ?? null,
          photoAlt: m.photoAlt ?? m.name,
        }))
      : TEAM.map((m) => ({
          name: m.name,
          title: m.title,
          initials: m.initials,
          photoUrl: null as string | null,
          photoAlt: m.name,
        }));

  return (
    <>
      {/* Hero — 42px tracking-[-1.26px] per Figma */}
      <section className="rounded-b-[32px] bg-transparent px-5 pb-7 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
            <div className="text-end">
              <p className="font-mono text-[9px] tracking-[1.35px] text-white/40">
                {t('founderLetterLabel')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline — scroll-coupled rail fill + lighting nodes (matches landing's three-step stepper) */}
      <JourneyTimeline
        kicker={t('timelineKicker')}
        heading={t('timelineHeading')}
        milestones={milestones}
      />

      {/* Team — gradient section, white cards per Figma */}
      <section
        className="rounded-[32px] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('teamKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
            {t('teamHeading')}
          </h2>
          <div className="grid grid-cols-2 gap-[10px]">
            {displayTeam.map((member, i) => (
              <div
                key={`team-${i}-${member.name}`}
                className="flex h-[145px] flex-col gap-[14px] rounded-[18px] bg-white p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-[#1a1c22] dark:shadow-none"
              >
                {/* Avatar — CMS photo when present, else initials on the Figma gradient */}
                <div
                  className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[16px]"
                  style={{ background: 'linear-gradient(135deg, #111111 0%, #333333 71.43%)' }}
                >
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoUrl}
                      alt={member.photoAlt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-sans text-[16px] font-semibold tracking-[-0.16px] text-white">
                      {member.initials}
                    </span>
                  )}
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
      <section className="rounded-t-[32px] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                className="group flex items-center gap-[14px] rounded-[18px] bg-[#fafaf9] px-[18px] py-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f0f0ee] hover:shadow-[0_6px_20px_rgba(0,176,80,0.08)] dark:bg-[#1a1c22] dark:shadow-none dark:hover:bg-[#22252e]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#f2f2f4] text-[#111] dark:bg-[#22252e] dark:text-white">
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-sans text-[15px] font-semibold leading-normal">
                    {link.href === '/company/careers'
                      ? t('exploreCareers')
                      : link.href === '/company/awards'
                        ? t('exploreAwards')
                        : link.href === '/company/media-press'
                          ? t('exploreMedia')
                          : t('exploreContact')}
                  </p>
                  <p className="font-body text-muted mt-[2px] text-[12px]">
                    {link.href === '/company/careers'
                      ? t('exploreCareersDesc')
                      : link.href === '/company/awards'
                        ? t('exploreAwardsDesc')
                        : link.href === '/company/media-press'
                          ? t('exploreMediaDesc')
                          : t('exploreContactDesc')}
                  </p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  className="text-muted h-[18px] w-[18px] flex-shrink-0 rtl:-scale-x-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
