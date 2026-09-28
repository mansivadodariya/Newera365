'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CountUp, CountUpGroup } from '../motion/CountUp';
import { FocusMarkets } from '../market/FocusMap';
import { JourneyTimeline } from '../sections/JourneyTimelineClient';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SectionKicker } from '../primitives/SectionKicker';

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
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: 'Legal & regulation',
    href: '/legal',
    desc: 'Policies and disclosures',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
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
          { year: '2023', label: t('milestone2014Label'), desc: t('milestone2014Desc') },
          { year: '2026', label: t('milestone2016Label'), desc: t('milestone2016Desc') },
          { year: '50,000+', label: t('milestone2019Label'), desc: t('milestone2019Desc') },
          { year: 'Expansion', label: t('milestone2022Label'), desc: t('milestone2022Desc') },
          { year: 'Newera', label: t('milestone2024Label'), desc: t('milestone2024Desc') },
        ];

  const creed = [t('creed1'), t('creed2'), t('creed3')];

  return (
    <>
      {/* Hero — the claim, then a hairline creed of what we hold to */}
      <section className="rounded-b-[32px] px-5 pb-10 pt-9 xl:pb-14 xl:pt-14">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="text-accent-bright mb-5 text-[13px] font-extrabold uppercase tracking-[0.2em] sm:text-[15px]">
            {t('heroKicker')}
          </SectionKicker>
          <h1 className="text-display font-sans">
            <span className="text-foreground">{t('heroLine1')}</span>
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted text-lead mt-5 max-w-[520px]">{t('heroDesc')}</p>

          {/* Conviction creed — a small terminal ledger of tenets */}
          <ul className="border-border shadow-card list-dim mt-9 grid overflow-hidden rounded-[16px] border bg-white sm:grid-cols-3 dark:border-white/[0.06] dark:bg-[#1a1c22] dark:shadow-none">
            {creed.map((line, i) => (
              <li
                key={i}
                className="border-border group flex items-start gap-3 px-[18px] py-4 transition-all duration-300 hover:bg-[#00b050] [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-e"
              >
                <span className="text-muted text-eyebrow mt-px font-mono tabular-nums transition-colors duration-300 group-hover:text-white">
                  0{i + 1}
                </span>
                <span className="font-body text-foreground/85 text-caption leading-snug transition-colors duration-300 group-hover:text-white">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Manifesto — the founder's conviction, oversized on ink */}
      <section className="ink-band rounded-t-[32px] px-5 py-12 xl:py-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-1 items-end justify-between gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <ScrollReveal>
                <SectionKicker className="mb-6">{t('missionKicker')}</SectionKicker>
              </ScrollReveal>

              <div className="relative">
                <span
                  aria-hidden="true"
                  className="text-accent-bright/20 pointer-events-none absolute -start-2 -top-6 select-none font-serif text-[100px] leading-none xl:text-[140px]"
                >
                  &ldquo;
                </span>
                <ScrollReveal delay={0.05}>
                  <blockquote className="relative max-w-[840px]">
                    <p className="text-headline font-sans font-medium leading-[1.2] tracking-[-0.01em] text-white">
                      {t('missionText')}
                    </p>
                  </blockquote>
                </ScrollReveal>
              </div>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <ScrollReveal direction="none" delay={0.1}>
                <CountUpGroup>
                  <div className="shadow-card flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7 lg:min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-accent h-2 w-2 animate-pulse rounded-full shadow-[0_0_8px_var(--color-accent)]" />
                      <span className="text-accent-bright font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {t('missionKicker')}
                      </span>
                    </div>
                    <span
                      dir="ltr"
                      className="text-sheen text-metric w-fit font-sans tabular-nums leading-none"
                    >
                      <CountUp value={manifestoStatValue ?? '100%'} />
                    </span>
                    <span className="max-w-[260px] font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">
                      {t('manifestoStatLabel')}
                    </span>
                  </div>
                </CountUpGroup>
              </ScrollReveal>
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

      {/* Focus markets — the regions the desk is built for, as a bare ledger */}
      <section
        className="rounded-[32px] px-5 pb-12 pt-12 xl:pb-16 xl:pt-16"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('regionsKicker')}</SectionKicker>
            <div className="xl:flex xl:items-end xl:justify-between xl:gap-10">
              <h2 className="text-foreground text-headline font-sans [text-wrap:balance]">
                {t('regionsHeading')}
              </h2>
              <p className="font-body text-body text-muted mt-3 max-w-[46ch] xl:mt-0">
                {t('regionsSubtitle')}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <FocusMarkets
              regions={REGIONS.map((region) => ({
                id: region.id,
                name: t(region.nameKey),
              }))}
              mapAriaLabel={t('regionsMapAria')}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Explore links */}
      <section className="rounded-t-[32px] px-5 pb-12 pt-12 xl:pb-16 xl:pt-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('exploreKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline mb-8 font-sans">{t('exploreHeading')}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
            {EXPLORE_LINKS.map((link, i) => (
              <ScrollReveal key={link.label} index={i} className="h-full">
                <Link
                  href={`/${locale}${link.href}`}
                  className="border-border shadow-card hover:border-accent/45 hover:shadow-card-lg dark:hover:border-accent/40 dark:hover:bg-accent/[0.15] group flex h-full items-center gap-[14px] rounded-[18px] border bg-white px-[18px] py-[18px] transition-[border-color,box-shadow] duration-200 dark:border-white/[0.06] dark:bg-[#1a1c22] dark:shadow-none"
                >
                  <div className="group-hover:bg-accent text-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#F0F4F1] transition-colors duration-200 group-hover:text-white dark:bg-[#22252e] dark:text-white">
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
