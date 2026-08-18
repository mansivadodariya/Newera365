'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { CountUp, CountUpGroup } from '../motion/CountUp';
import { Pagination } from '../primitives/Pagination';

const CAREERS_PER_PAGE = 6;

// Employment-type tag styling, keyed by lowercased CMS value. Bordered mono
// chips (no fills that read as pastel cards); default is a quiet muted chip.
const TYPE_STYLES: Record<string, string> = {
  'full-time': 'text-accent border-accent/30 bg-accent/[0.07]',
  contract: 'text-[#B26C05] border-[#B26C05]/30 bg-[#B26C05]/[0.07]',
  freelance: 'text-[#B26C05] border-[#B26C05]/30 bg-[#B26C05]/[0.07]',
};
const DEFAULT_TYPE_STYLE = 'text-muted border-border';

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

function ArrowGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:-scale-x-100">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  // Company facts for the metric ledger. Not CMS-backed (careers-desk stats).
  const stats = [
    { value: '120+', label: t('statTeam') },
    { value: '12+', label: t('statCountries') },
    { value: '3', label: t('statOffices') },
    { value: '200K+', label: t('statClients') },
  ];

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
      {/* Hero - Join the desk */}
      <section className="px-5 pb-10 pt-9 xl:pt-12">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('heroKicker')}</SectionKicker>
          <h1 className="text-foreground text-display font-sans">
            {t('heroLine1')}
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="text-muted text-lead mt-5 max-w-[48ch]">{t('heroDesc')}</p>
        </ScrollReveal>
      </section>

      {/* Stats - the desk by the numbers (metric ledger) */}
      <section className="px-5 pb-12">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('statsKicker')}</SectionKicker>
          <div className="border-border bg-surface shadow-card overflow-hidden rounded-[20px] border dark:shadow-none">
            <CountUpGroup>
              <div className="bg-border grid grid-cols-2 gap-px xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-surface flex flex-col gap-2 p-6 xl:p-7">
                    <p
                      dir="ltr"
                      className="text-foreground text-metric-sm w-fit font-sans tabular-nums"
                    >
                      <CountUp value={stat.value} />
                    </p>
                    <p className="text-muted text-eyebrow font-mono uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CountUpGroup>
          </div>
        </ScrollReveal>
      </section>

      {/* Values - how the desk runs (editorial rows) */}
      <section className="px-5 pb-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('valuesKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline mb-8 max-w-[18ch] font-sans">
              {t('valuesHeading')}
            </h2>
          </ScrollReveal>
          <div className="border-border border-t">
            {([1, 2, 3, 4] as const).map((i, idx) => (
              <ScrollReveal key={i} index={idx}>
                <div className="border-border grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-b py-6 md:grid-cols-[3.5rem_minmax(0,15rem)_1fr] md:gap-x-8 md:py-7">
                  <span className="text-muted text-eyebrow pt-1.5 font-mono tabular-nums">
                    {String(i).padStart(2, '0')}
                  </span>
                  <p className="text-foreground text-title font-sans">
                    {t(`val${i}Title` as 'val1Title')}
                  </p>
                  <p className="text-muted text-body col-span-2 md:col-span-1 md:pt-1">
                    {t(`val${i}Desc` as 'val1Desc')}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles - the ledger */}
      <section className="px-5 pb-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('rolesHeading')}</SectionKicker>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-foreground text-headline font-sans">{t('rolesTitle')}</h2>
              <span
                dir="ltr"
                className="text-muted text-eyebrow whitespace-nowrap font-mono uppercase tabular-nums"
              >
                {filtered.length} {t('openLabel')}
              </span>
            </div>
          </ScrollReveal>

          {/* Department filter - terminal chips (built from CMS data) */}
          <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-1">
            {deptIds.map((id) => {
              const active = dept === id;
              return (
                <button
                  key={id}
                  onClick={() => handleDeptChange(id)}
                  aria-pressed={active}
                  className={`text-eyebrow flex-shrink-0 rounded-full border px-4 py-2 font-mono uppercase transition-colors active:scale-[0.98] ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-border text-muted hover:border-accent/50 hover:text-foreground'
                  }`}
                >
                  {getDeptLabel(id)}
                </button>
              );
            })}
          </div>

          {/* Ledger */}
          <ScrollReveal>
            <div
              ref={listRef}
              className="border-border bg-surface shadow-card overflow-hidden rounded-[20px] border dark:shadow-none"
            >
              {/* Column header - md+ */}
              {filtered.length > 0 && (
                <div className="border-border text-muted text-eyebrow hidden border-b px-6 py-3 font-mono uppercase md:grid md:grid-cols-[3rem_minmax(0,1fr)_10rem_7rem_1.75rem] md:items-center md:gap-4">
                  <span aria-hidden>#</span>
                  <span>{t('ledgerRole')}</span>
                  <span>{t('ledgerDesk')}</span>
                  <span>{t('ledgerLocation')}</span>
                  <span className="sr-only">{t('viewRole')}</span>
                </div>
              )}

              <div className="divide-border divide-y">
                {pagedFiltered.map((job, i) => {
                  const index = (page - 1) * CAREERS_PER_PAGE + i + 1;
                  const url = job.applyUrl?.trim();
                  const external = !!url && /^https?:\/\//i.test(url);
                  const href = url ? url : `/${locale}/support`;

                  const rowClass =
                    'group grid grid-cols-[2rem_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-5 transition-colors hover:bg-accent/[0.05] md:grid-cols-[3rem_minmax(0,1fr)_10rem_7rem_1.75rem] md:gap-4 md:px-6 dark:hover:bg-accent/[0.06]';

                  const typeLabel = translateType(job.employmentType);
                  const typeStyle =
                    TYPE_STYLES[job.employmentType.toLowerCase()] ?? DEFAULT_TYPE_STYLE;

                  const inner = (
                    <>
                      <span className="text-muted text-eyebrow font-mono tabular-nums">
                        {String(index).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <p className="text-foreground group-hover:text-accent text-body-lg truncate font-sans font-semibold transition-colors">
                            {job.title}
                          </p>
                          <span
                            className={`text-eyebrow hidden flex-shrink-0 rounded-full border px-2 py-0.5 font-mono uppercase md:inline-block ${typeStyle}`}
                          >
                            {typeLabel}
                          </span>
                        </div>
                        <p className="text-muted text-caption mt-1 truncate font-mono md:hidden">
                          {getDeptLabel(job.department.toUpperCase())} · {job.location} ·{' '}
                          {typeLabel}
                        </p>
                      </div>
                      <span className="text-muted text-caption hidden truncate font-mono md:block">
                        {getDeptLabel(job.department.toUpperCase())}
                      </span>
                      <span className="text-muted text-caption hidden truncate font-mono md:block">
                        {job.location}
                      </span>
                      <span
                        aria-hidden
                        className="text-muted group-hover:text-accent col-start-3 row-start-1 inline-flex justify-end transition-all duration-200 motion-safe:group-hover:translate-x-1 md:col-start-auto md:row-start-auto rtl:motion-safe:group-hover:-translate-x-1"
                      >
                        <ArrowGlyph />
                      </span>
                    </>
                  );

                  return external ? (
                    <a
                      key={job.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={rowClass}
                      aria-label={`${job.title}: ${t('viewRole')}`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      key={job.id}
                      href={href}
                      className={rowClass}
                      aria-label={`${job.title}: ${t('viewRole')}`}
                    >
                      {inner}
                    </Link>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <p className="text-muted text-body px-6 py-12 text-center">{t('noRoles')}</p>
              )}
            </div>
          </ScrollReveal>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            listRef={listRef}
          />
        </div>
      </section>

      {/* Open application - ink closer */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-12">
        <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:flex-row xl:items-center xl:gap-10">
            {/* Left: text */}
            <div className="xl:flex-1">
              <SectionKicker className="mb-4">{t('openAppKicker')}</SectionKicker>
              <h2 className="text-headline mb-3 font-sans text-white">
                {t('openAppLine1')}
                <br />
                {t('openAppLine2')}
              </h2>
              <p className="text-body mb-8 max-w-[42ch] text-white/60 xl:mb-0">
                {t('openAppDesc')}
              </p>
            </div>

            {/* Middle: CTA button */}
            <div className="xl:flex-shrink-0">
              <Link
                href={`/${locale}/support`}
                className="bg-accent hover:bg-accent-bright text-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-medium text-white transition-all active:scale-[0.98] xl:w-auto xl:px-8"
              >
                {t('openAppCta')}
                <ArrowGlyph />
              </Link>
            </div>

            {/* Right: review note */}
            <div className="mt-4 xl:mt-0 xl:flex-shrink-0 xl:text-end">
              <p className="text-caption max-w-none text-white/40 xl:max-w-[180px]">
                {t('openAppNote')}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
