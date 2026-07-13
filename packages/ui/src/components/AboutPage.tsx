'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CountUp, CountUpGroup } from './CountUp';
import { JourneyTimeline } from './JourneyTimelineClient';
import { ScrollReveal } from './ScrollReveal';
import { SectionKicker } from './SectionKicker';

// Focus regions from the client's partner deck (2026-07): the four
// high-growth markets the desk is built around. Replaced the placeholder
// team grid (client feedback 2026-07-13).
const REGIONS = [
  { id: 'india', nameKey: 'regionIndiaName', descKey: 'regionIndiaDesc' },
  { id: 'mena', nameKey: 'regionMenaName', descKey: 'regionMenaDesc' },
  { id: 'indonesia', nameKey: 'regionIndonesiaName', descKey: 'regionIndonesiaDesc' },
  { id: 'vietnam', nameKey: 'regionVietnamName', descKey: 'regionVietnamDesc' },
] as const;

const EXPLORE_LINKS = [
  {
    label: 'Get in touch',
    href: '/support',
    desc: 'Talk to the team directly',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Legal & regulation',
    href: '/legal',
    desc: 'Policies and disclosures',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 1.5l5 2v3.5c0 3-2.1 5.2-5 6-2.9-.8-5-3-5-6V3.5l5-2z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M5.8 8l1.6 1.6L10.4 6.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

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
  milestones?: CmsMilestoneItem[];
  manifestoStatValue?: string | null;
}

export function AboutPage({ milestones: cmsMilestones, manifestoStatValue }: AboutPageProps) {
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

  const creed = [t('creed1'), t('creed2'), t('creed3')];

  return (
    <>
      {/* Hero — the claim, then a hairline creed of what we hold to */}
      <section className="rounded-b-[32px] px-5 pb-10 pt-9 xl:pb-14 xl:pt-14">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('heroKicker')}
          </SectionKicker>
          <h1 className="text-display font-sans">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted text-lead mt-5 max-w-[520px]">{t('heroDesc')}</p>

          {/* Conviction creed — a small terminal ledger of tenets */}
          <ul className="border-border shadow-card list-dim mt-9 grid overflow-hidden rounded-[16px] border bg-white sm:grid-cols-3 dark:border-white/[0.06] dark:bg-[#1a1c22] dark:shadow-none">
            {creed.map((line, i) => (
              <li
                key={i}
                className="border-border hover:bg-accent/[0.03] flex items-start gap-3 px-[18px] py-4 transition-colors [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-e"
              >
                <span className="text-accent mt-px font-mono text-[11px] font-bold tabular-nums tracking-[0.12em]">
                  0{i + 1}
                </span>
                <span className="font-body text-foreground/85 text-caption leading-snug">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Manifesto — the founder's conviction, oversized on ink */}
      <section className="ink-band rounded-t-[32px] px-5 pb-14 pt-14 xl:pb-20 xl:pt-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="[&>span:first-child]:bg-accent-bright text-accent-bright mb-7">
              {t('missionKicker')}
            </SectionKicker>
          </ScrollReveal>

          <div className="relative">
            <span
              aria-hidden="true"
              className="text-accent-bright/20 pointer-events-none absolute -start-2 -top-6 select-none font-serif text-[120px] leading-none xl:text-[180px]"
            >
              &ldquo;
            </span>
            <ScrollReveal delay={0.05}>
              <blockquote className="relative max-w-[920px]">
                <p className="text-headline font-sans font-medium leading-[1.14] tracking-[-0.01em] text-white">
                  {t('missionText')}
                </p>
              </blockquote>
            </ScrollReveal>
          </div>

          <div className="my-10 h-px w-full bg-white/10 xl:my-12" />

          <div className="flex flex-col gap-9 sm:flex-row sm:items-end sm:justify-between">
            <ScrollReveal direction="none">
              <div>
                <p className="text-title font-sans text-white">Alex M.</p>
                <p className="font-body text-caption mt-1 text-white/60">{t('ceoTitle')}</p>
                <p className="text-accent-bright mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em]">
                  {t('founderLetterLabel')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="none" delay={0.1}>
              <CountUpGroup>
                <div className="flex flex-col gap-2 sm:items-end sm:text-end">
                  <span
                    dir="ltr"
                    className="text-sheen text-metric w-fit font-sans tabular-nums leading-none"
                  >
                    <CountUp value={manifestoStatValue ?? '100%'} />
                  </span>
                  <span className="max-w-[300px] font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
                    {t('manifestoStatLabel')}
                  </span>
                </div>
              </CountUpGroup>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline — scroll-coupled rail fill + lighting nodes (matches landing's three-step stepper) */}
      <JourneyTimeline
        kicker={t('timelineKicker')}
        heading={t('timelineHeading')}
        milestones={milestones}
      />

      {/* Focus markets — the regions the desk is built for, as a bare ledger */}
      <section
        className="rounded-[32px] px-5 pb-12 pt-12 xl:pb-16 xl:pt-16"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
              {t('regionsKicker')}
            </SectionKicker>
            <div className="xl:flex xl:items-end xl:justify-between xl:gap-10">
              <h2 className="text-foreground text-headline font-sans [text-wrap:balance]">
                {t('regionsHeading')}
              </h2>
              <p className="font-body text-body text-muted mt-3 max-w-[46ch] xl:mt-0">
                {t('regionsSubtitle')}
              </p>
            </div>
          </ScrollReveal>
          <div className="list-dim mt-9">
            {REGIONS.map((region, i) => (
              <ScrollReveal key={region.id} index={i}>
                <div className="border-border hover:bg-accent/[0.03] grid grid-cols-[44px_1fr] items-baseline gap-x-4 border-t py-5 transition-colors md:grid-cols-[64px_260px_1fr] md:gap-x-6 dark:border-white/[0.08]">
                  <span className="text-accent font-mono text-[11px] font-bold tabular-nums tracking-[0.12em]">
                    0{i + 1}
                  </span>
                  <p className="text-foreground text-title font-sans">{t(region.nameKey)}</p>
                  <p className="font-body text-body text-muted col-span-2 mt-2 ps-[60px] md:col-span-1 md:mt-0 md:ps-0">
                    {t(region.descKey)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
            <div className="border-border border-t dark:border-white/[0.08]" />
          </div>
        </div>
      </section>

      {/* Explore links */}
      <section className="rounded-t-[32px] px-5 pb-12 pt-12 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
              {t('exploreKicker')}
            </SectionKicker>
            <h2 className="text-foreground text-headline mb-8 font-sans">{t('exploreHeading')}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
            {EXPLORE_LINKS.map((link, i) => (
              <ScrollReveal key={link.label} index={i} className="h-full">
                <Link
                  href={`/${locale}${link.href}`}
                  className="border-border shadow-card hover:border-accent/45 hover:shadow-card-lg dark:hover:border-accent/40 group flex h-full items-center gap-[14px] rounded-[18px] border bg-white px-[18px] py-[18px] transition-[border-color,box-shadow] duration-200 dark:border-white/[0.06] dark:bg-[#1a1c22] dark:shadow-none dark:hover:bg-[#22252e]"
                >
                  <div className="group-hover:bg-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#F0F4F1] text-[#111] transition-colors duration-200 group-hover:text-white dark:bg-[#22252e] dark:text-white">
                    {link.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-body-lg font-sans font-semibold leading-normal">
                      {link.href === '/legal' ? t('exploreLegal') : t('exploreContact')}
                    </p>
                    <p className="font-body text-muted text-caption mt-[2px]">
                      {link.href === '/legal' ? t('exploreLegalDesc') : t('exploreContactDesc')}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="text-muted h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100"
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
