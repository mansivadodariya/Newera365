'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Department = 'ALL' | 'ENGINEERING' | 'RESEARCH' | 'TRADING' | 'DESIGN' | 'OPERATIONS';

const DEPARTMENTS: { id: Department; label: string }[] = [
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
  department: Department;
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
  const [dept, setDept] = useState<Department>('ALL');

  const useCms = cmsJobs && cmsJobs.length > 0;

  const allJobDepts = useCms
    ? (['ALL', ...new Set(cmsJobs.map((j) => j.department.toUpperCase()))] as Department[])
    : DEPARTMENTS.map((d) => d.id);

  const filtered = useCms
    ? dept === 'ALL'
      ? cmsJobs
      : cmsJobs.filter((j) => j.department.toUpperCase() === dept)
    : dept === 'ALL'
      ? JOBS
      : JOBS.filter((j) => j.department === dept);

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            Build the next
            <br />
            era of <span className="text-accent">trading.</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            We&apos;re 120+ people across London, Singapore and Dubai. Engineers, traders, analysts,
            designers and compliance experts.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="dark:bg-background bg-white px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
            {[
              { value: '120+', label: 'Team members' },
              { value: '12+', label: 'Countries' },
              { value: '3', label: 'Offices' },
              { value: '200K+', label: 'Clients served' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[18px] bg-[#f9f9f9] p-5 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
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
      <section className="dark:bg-background bg-white px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            How we Work
          </SectionKicker>
          <div className="grid grid-cols-2 gap-[10px] xl:gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="flex flex-col gap-2 rounded-[18px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <p className="text-foreground font-sans text-[13px] font-semibold">{v.title}</p>
                <p className="font-body text-muted text-[12px] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            Open Roles
          </SectionKicker>

          {/* Department tabs */}
          <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
            {(useCms ? allJobDepts : DEPARTMENTS.map((d) => d.id)).map((dId) => {
              const label = useCms
                ? dId === 'ALL'
                  ? 'All'
                  : dId.charAt(0) + dId.slice(1).toLowerCase()
                : (DEPARTMENTS.find((d) => d.id === dId)?.label ?? dId);
              return (
                <button
                  key={dId}
                  onClick={() => setDept(dId as Department)}
                  className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-semibold transition-colors ${
                    dept === dId
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                      : 'bg-[#f3f4f6] text-[#6b7280] dark:bg-[#1c1c1c] dark:text-[#9ca3af]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Job list — stacked on mobile, 3-col grid on desktop */}
          <div className="flex flex-col divide-y divide-[#e5e7eb] xl:grid xl:grid-cols-3 xl:gap-4 xl:divide-y-0 dark:divide-[#2a2a2a]">
            {filtered.map((job) => {
              const href =
                useCms && 'slug' in job
                  ? `/${locale}/company/careers/${(job as CmsJobItem).slug}`
                  : `/${locale}/company/careers/${job.id}`;
              const jobType =
                'type' in job
                  ? (job as { type: string }).type
                  : 'employmentType' in job
                    ? (job as CmsJobItem).employmentType
                    : '';
              const typeColor = TYPE_COLORS[jobType] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
              return (
                <Link
                  key={job.id}
                  href={href}
                  className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 xl:flex-col xl:items-start xl:justify-between xl:rounded-[18px] xl:bg-[#f9f9f9] xl:p-5 xl:py-5 xl:first:pt-5 xl:last:pb-5 xl:hover:bg-[#f0f0ee] xl:dark:bg-[#1c1c1c] xl:dark:hover:bg-[#242424]"
                  style={{ boxShadow: undefined }}
                >
                  <div className="flex flex-1 flex-col gap-1 xl:w-full xl:flex-none">
                    <p className="text-foreground group-hover:text-accent font-sans text-[14px] font-semibold transition-colors">
                      {job.title}
                    </p>
                    <p className="font-body text-muted text-[12px]">{job.location}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2 xl:mt-auto xl:w-full xl:justify-between xl:pt-3">
                    {jobType && (
                      <span
                        className={`font-body rounded-full px-2.5 py-[4px] text-[10px] font-semibold ${typeColor}`}
                      >
                        {jobType}
                      </span>
                    )}
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
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="font-body text-muted py-8 text-center text-[14px]">
              No open roles in this department right now.
            </p>
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
                OPEN APPLICATION
              </SectionKicker>
              <h2 className="mb-3 font-sans text-[28px] font-semibold leading-[1.1] text-white xl:text-[36px]">
                Don&apos;t see
                <br />
                your role?
              </h2>
              <p className="font-body mb-8 text-[13px] leading-relaxed text-white/60 xl:mb-0">
                Send us a thoughtful note — we hire for talent and character, not just job titles.
              </p>
            </div>

            {/* Middle: CTA button */}
            <div className="xl:flex-shrink-0">
              <Link
                href={`/${locale}/contact`}
                className="bg-accent font-body hover:bg-accent/90 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors xl:w-auto xl:px-8"
              >
                Open application
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
                Most applications reviewed same day.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
