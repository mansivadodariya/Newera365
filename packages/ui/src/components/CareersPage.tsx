'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { Pagination } from './Pagination';

const CAREERS_PER_PAGE = 6;

const TYPE_COLORS: Record<string, string> = {
  'Full-time': 'bg-accent/10 text-accent',
  'full-time': 'bg-accent/10 text-accent',
  Contract: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  contract: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Remote: 'bg-[#6B7280]/10 text-[#6B7280]',
  remote: 'bg-[#6B7280]/10 text-[#6B7280]',
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
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const jobs = (cmsJobs ?? []).filter((j) => j.title?.trim());

  const TYPE_I18N: Record<string, string> = {
    'full-time': t('typeFullTime'),
    'part-time': t('typePartTime'),
    contract: t('typeContract'),
    freelance: t('typeFreelance'),
    internship: t('typeInternship'),
  };
  const translateType = (v: string) => TYPE_I18N[v.toLowerCase()] ?? v;

  // Build department list dynamically from CMS data
  const deptIds: string[] = [
    'ALL',
    ...Array.from(new Set(jobs.map((j) => j.department.toUpperCase()))),
  ];

  // Map department id → translated label
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

  const filtered = dept === 'ALL' ? jobs : jobs.filter((j) => j.department.toUpperCase() === dept);
  const totalPages = Math.ceil(filtered.length / CAREERS_PER_PAGE);
  const pagedFiltered = filtered.slice((page - 1) * CAREERS_PER_PAGE, page * CAREERS_PER_PAGE);

  function handleDeptChange(id: string) {
    setDept(id);
    setPage(1);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
            {[
              { value: '120+', label: t('statTeam') },
              { value: '12+', label: t('statCountries') },
              { value: '3', label: t('statOffices') },
              { value: '200K+', label: t('statClients') },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface shadow-card hover-lift rounded-[18px] p-5 dark:shadow-none"
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

      {/* Values — content from i18n */}
      <section className="px-5 pb-8">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('valuesKicker')}
          </SectionKicker>
          <div className="grid grid-cols-2 gap-[10px] xl:gap-5">
            {([1, 2, 3, 4] as const).map((i) => (
              <div
                key={i}
                className="bg-surface shadow-card hover-lift flex flex-col gap-2 rounded-[18px] p-4 dark:shadow-none"
              >
                <p className="text-foreground font-sans text-[13px] font-semibold">
                  {t(`val${i}Title` as 'val1Title')}
                </p>
                <p className="font-body text-muted text-[12px] leading-relaxed">
                  {t(`val${i}Desc` as 'val1Desc')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('rolesHeading')}
          </SectionKicker>

          {/* Department tabs — built from actual CMS data */}
          <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
            {deptIds.map((id) => (
              <button
                key={id}
                onClick={() => handleDeptChange(id)}
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
          <div ref={listRef} className="dark:divide-border flex flex-col divide-y divide-[#e5e7eb]">
            {pagedFiltered.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-foreground font-sans text-[14px] font-semibold">{job.title}</p>
                  <p className="font-body text-muted text-[12px]">{job.location}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={`font-body rounded-full px-2.5 py-[4px] text-[10px] font-semibold ${TYPE_COLORS[job.employmentType] ?? 'bg-[#6B7280]/10 text-[#6B7280]'}`}
                  >
                    {translateType(job.employmentType)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('noRoles')}</p>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            listRef={listRef}
          />
        </div>
      </section>

      {/* Don't see your role CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="rtl:-scale-x-100"
                >
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
            <div className="mt-4 xl:mt-0 xl:flex-shrink-0 xl:text-end">
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
