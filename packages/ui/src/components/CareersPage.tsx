'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

// Departments used in the static mock data
type MockDept = 'ALL' | 'ENGINEERING' | 'RESEARCH' | 'TRADING' | 'DESIGN' | 'OPERATIONS';

const DEPARTMENTS: { id: MockDept; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ENGINEERING', label: 'Engineering' },
  { id: 'RESEARCH', label: 'Research' },
  { id: 'TRADING', label: 'Trading' },
  { id: 'DESIGN', label: 'Design' },
  { id: 'OPERATIONS', label: 'Operations' },
];

const VALUES = [
  {
    title: 'Move fast, ship right',
    desc: "We ship daily, not quarterly. Speed and quality aren't trade-offs here — they're the expectation.",
  },
  {
    title: 'Traders first',
    desc: 'Every product decision starts with one question: does this make life better for the trader?',
  },
  {
    title: 'Operate as owners',
    desc: 'No hand-offs, no bureaucracy. You own the outcome end-to-end and are trusted to deliver.',
  },
  {
    title: 'Respect how',
    desc: 'High standards for the work and high standards for how we treat each other. Both matter equally.',
  },
];

const JOBS: {
  id: string;
  title: string;
  department: MockDept;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
}[] = [
  {
    id: '1',
    title: 'Senior Backend Engineer — Trading Infrastructure',
    department: 'ENGINEERING',
    location: 'London · Dubai',
    type: 'Full-time',
  },
  {
    id: '2',
    title: 'Product Designer — Mobile',
    department: 'DESIGN',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    id: '3',
    title: 'Quantitative Analyst',
    department: 'RESEARCH',
    location: 'London',
    type: 'Full-time',
  },
  {
    id: '4',
    title: 'Compliance Officer',
    department: 'OPERATIONS',
    location: 'Dubai',
    type: 'Full-time',
  },
  {
    id: '5',
    title: 'Customer Success Lead',
    department: 'OPERATIONS',
    location: 'Singapore',
    type: 'Full-time',
  },
  {
    id: '6',
    title: 'Content Strategist',
    department: 'OPERATIONS',
    location: 'Remote',
    type: 'Contract',
  },
  { id: '7', title: 'FX Dealer', department: 'TRADING', location: 'London', type: 'Full-time' },
  {
    id: '8',
    title: 'iOS Engineer',
    department: 'ENGINEERING',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    id: '9',
    title: 'Market Analyst',
    department: 'RESEARCH',
    location: 'Dubai',
    type: 'Full-time',
  },
];

const TYPE_COLORS: Record<string, string> = {
  'Full-time': 'bg-accent/10 text-accent',
  Contract: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Remote: 'bg-[#6B7280]/10 text-[#6B7280]',
};

export interface CmsJobItem {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  summary?: string | null;
  applyUrl?: string | null;
}

interface CareersPageProps {
  jobs?: CmsJobItem[];
}

export function CareersPage({ jobs: cmsJobs }: CareersPageProps) {
  const locale = useLocale();
  const t = useTranslations('careers');
  const [dept, setDept] = useState('ALL');

  const validCmsJobs = cmsJobs?.filter((j) => j.title?.trim()) ?? [];
  const useCms = validCmsJobs.length > 0;

  // Build department list from CMS data or fall back to static list
  const deptIds: string[] = useCms
    ? ['ALL', ...Array.from(new Set(validCmsJobs.map((j) => j.department.toUpperCase())))]
    : DEPARTMENTS.map((d) => d.id);

  // Map department id → translated label. Falls back to the raw id for any
  // CMS department value that doesn't have a dedicated i18n key.
  function getDeptLabel(id: string): string {
    const map: Record<string, string> = {
      ALL: t('filterAll'),
      ENGINEERING: t('deptEngineering'),
      RESEARCH: t('deptResearch'),
      TRADING: t('deptTrading'),
      DESIGN: t('deptDesign'),
      OPERATIONS: t('deptOperations'),
      MARKETING: t('deptMarketing'),
      SALES: t('deptSales'),
      COMPLIANCE: t('deptCompliance'),
      SUPPORT: t('deptSupport'),
      FINANCE: t('deptFinance'),
    };
    return map[id.toUpperCase()] ?? id;
  }

  const filtered = useCms
    ? dept === 'ALL'
      ? validCmsJobs
      : validCmsJobs.filter((j) => j.department.toUpperCase() === dept)
    : dept === 'ALL'
      ? JOBS
      : JOBS.filter((j) => j.department === (dept as MockDept));

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
            {[
              { value: '120+', label: t('statTeam') },
              { value: '12+', label: t('statCountries') },
              { value: '3', label: t('statOffices') },
              { value: '200K+', label: t('statClients') },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface shadow-card rounded-[18px] p-5 dark:shadow-none"
              >
                <p className="text-foreground font-sans text-[28px] font-semibold leading-[1]">
                  {stat.value}
                </p>
                <p className="font-body text-muted mt-1 text-[12px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('valuesKicker')}
          </SectionKicker>
          <div className="grid grid-cols-2 gap-[10px] xl:gap-5">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="bg-surface shadow-card flex flex-col gap-2 rounded-[18px] p-4 dark:shadow-none"
              >
                <p className="text-foreground font-sans text-[13px] font-semibold">
                  {t(`val${i + 1}Title` as 'val1Title')}
                </p>
                <p className="font-body text-muted text-[12px] leading-relaxed">
                  {t(`val${i + 1}Desc` as 'val1Desc')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('rolesHeading')}
          </SectionKicker>

          {/* Department tabs — built from actual data, not a hardcoded static list */}
          <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
            {deptIds.map((id) => (
              <button
                key={id}
                onClick={() => setDept(id)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                  dept === id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'dark:bg-surface dark:text-muted bg-[#f3f4f6] text-[#6b7280]'
                }`}
              >
                {getDeptLabel(id)}
              </button>
            ))}
          </div>

          {/* Job list */}
          <div className="dark:divide-border flex flex-col divide-y divide-[#e5e7eb]">
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/${locale}/company/careers/${job.id}`}
                className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-foreground group-hover:text-accent font-sans text-[14px] font-semibold transition-colors">
                    {job.title}
                  </p>
                  <p className="font-body text-muted text-[12px]">{job.location}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={`font-body rounded-full px-2.5 py-[4px] text-[10px] font-semibold ${TYPE_COLORS['type' in job ? (job as (typeof JOBS)[0]).type : (job as CmsJobItem).employmentType] ?? 'bg-[#6B7280]/10 text-[#6B7280]'}`}
                  >
                    {'type' in job
                      ? (job as (typeof JOBS)[0]).type
                      : (job as CmsJobItem).employmentType}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="group-hover:text-accent text-[#9ca3af] transition-colors"
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('noRoles')}</p>
          )}
        </div>
      </section>

      {/* Don't see your role CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:flex-row xl:items-center xl:gap-10">
            {/* Left: text */}
            <div className="xl:flex-1">
              <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
                {t('openAppKicker')}
              </SectionKicker>
              <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white xl:text-[36px]">
                {t('openAppLine1')}
                <br />
                {t('openAppLine2')}
              </h2>
              <p className="font-body mb-8 text-[13px] leading-relaxed text-white/60 xl:mb-0">
                {t('openAppDesc')}
              </p>
            </div>

            {/* Middle: CTA button */}
            <div className="xl:flex-shrink-0">
              <Link
                href={`/${locale}/contact`}
                className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-8"
              >
                {t('openAppCta')}
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

            {/* Right: review note */}
            <div className="mt-4 xl:mt-0 xl:flex-shrink-0 xl:text-right">
              <p className="font-body text-[12px] text-white/40 xl:max-w-[180px]">
                {t('openAppNote')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
