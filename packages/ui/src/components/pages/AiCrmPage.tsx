'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { CountUp, CountUpGroup } from '../motion/CountUp';

const FEATURE_CATEGORIES = ['CRM', 'SYSTEM', 'REPORTING'];

/* Static mockup data — design fixture, not CMS content. */
const KPI_VALUES = ['2,184', '92%', '$1.4M'];
const LEAD_ROWS: Array<[string, number]> = [
  ['Marko V.', 94],
  ['Aiyana P.', 88],
  ['L. Marchetti', 71],
];

/* Automation glyphs — stroke follows currentColor so the tile can recolor them
   on hover (definition, never transform). */
const AUTOMATION_ICONS = [
  /* target — client management */
  <svg key="target" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>,
  /* arrow — lead tracking */
  <svg
    key="arrow"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className="rtl:-scale-x-100"
  >
    <path
      d="M3 10h14M12 5l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  /* bars — broker dashboards */
  <svg key="bars" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M4 16v-5M10 16V4m6 12v-8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>,
  /* shield — admin & compliance */
  <svg key="shield" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M10 2.5 4 5v4.5c0 3.7 2.6 6.6 6 8 3.4-1.4 6-4.3 6-8V5l-6-2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m7.5 10 1.8 1.8 3.2-3.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
];

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
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
  );
}

export function AiCrmPage() {
  const locale = useLocale();
  const t = useTranslations('aiCrm');

  const features = FEATURE_CATEGORIES.map((category, i) => ({
    category,
    title: [t('feat1Title'), t('feat2Title'), t('feat3Title')][i],
    desc: [t('feat1Desc'), t('feat2Desc'), t('feat3Desc')][i],
  }));

  const automations = [
    { title: t('auto1Title'), desc: t('auto1Desc') },
    { title: t('auto2Title'), desc: t('auto2Desc') },
    { title: t('auto3Title'), desc: t('auto3Desc') },
    { title: t('auto4Title'), desc: t('auto4Desc') },
  ];

  const kpis = KPI_VALUES.map((value, i) => ({
    value,
    label: [t('kpiLeads'), t('kpiScore'), t('kpiDeposits')][i],
  }));

  const stages = [t('stageFunded'), t('stageKyc'), t('stageDemo')];

  /* Walkthrough scroll-spy — the sticky index tracks which module row is at the
     centre of the viewport. Active state only; content is never gated behind it. */
  const featureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    featureRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollToFeature = (i: number) => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    featureRefs.current[i]?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  const num = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <>
      {/* ── Hero: the live desk ─────────────────────────────────────────────
          The claim on the start side, the operations desk (co-pilot dashboard)
          on the end side — KPIs tick up on entry so the desk reads as running. */}
      <section className="to-background relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#DCEAE1] px-5 pb-14 pt-9 xl:px-[80px] xl:pb-20 xl:pt-20 dark:from-transparent dark:to-transparent">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 end-[-6%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,176,80,0.18),transparent_66%)] blur-2xl"
        />
        <div className="relative mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:grid xl:grid-cols-[1fr_480px] xl:items-center xl:gap-[60px]">
            {/* Claim */}
            <ScrollReveal>
              <SectionKicker className="mb-5">{t('kicker')}</SectionKicker>

              <h1 className="text-display text-foreground mb-4 font-sans [text-wrap:balance]">
                {t('heroLine1')}
                <br />
                <span>{t('heroLine2')}</span>
              </h1>
              <p className="text-lead font-body text-muted mb-8 max-w-[480px]">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/support`}
                  className="bg-accent hover:bg-accent-hover font-body inline-flex items-center gap-2 rounded-full px-[22px] py-[14px] text-[15px] font-semibold text-white shadow-[0_16px_40px_-14px_rgba(0,176,80,0.8)] transition-all hover:shadow-[0_20px_48px_-14px_rgba(26,217,102,0.9)] active:scale-[0.98]"
                >
                  {t('demoBtn')}
                  <ArrowIcon />
                </Link>
                <Link
                  href={`/${locale}/support`}
                  className="font-body border-border text-foreground hover:border-accent/50 inline-flex items-center rounded-full border bg-white px-5 py-[14px] text-[15px] font-semibold transition-colors dark:bg-white/[0.04]"
                >
                  {t('salesBtn')}
                </Link>
              </div>
            </ScrollReveal>

            {/* Operations desk — ink-art card carrying the live co-pilot mock */}
            <ScrollReveal direction="left" delay={0.12} className="mt-10 xl:mt-0">
              <div className="flex flex-col gap-3.5 rounded-[22px] border border-white/[0.08] bg-[#0A130E] p-[22px] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.6)] ring-1 ring-inset ring-white/[0.06]">
                {/* window bar */}
                <div className="flex items-center gap-2.5">
                  <span className="bg-accent-bright h-2 w-2 rounded-full" />
                  <span className="text-caption font-body flex-1 font-medium text-white">
                    {t('dashboardKicker')}
                  </span>
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </span>
                </div>

                {/* KPIs — count up on entry */}
                <CountUpGroup>
                  <div className="flex gap-2.5">
                    {kpis.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-1 flex-col gap-1 rounded-[16px] border border-white/[0.08] bg-white/[0.05] px-3 py-3.5"
                      >
                        <p
                          dir="ltr"
                          className="text-accent-bright w-fit font-sans text-[20px] font-bold tabular-nums leading-none"
                        >
                          <CountUp value={stat.value} />
                        </p>
                        <p className="text-caption font-body text-white/50">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CountUpGroup>

                {/* AI insight */}
                <div className="border-accent/40 flex flex-col gap-1 rounded-[16px] border bg-white/[0.05] p-3.5">
                  <p className="text-eyebrow text-accent font-mono font-medium uppercase">
                    {t('insightLabel')}
                  </p>
                  <p className="text-caption font-body leading-[18px] text-white/80">
                    {t('insightText')}
                  </p>
                </div>

                {/* Lead table */}
                <div className="overflow-hidden rounded-[16px] border border-white/[0.06] bg-white/[0.04]">
                  <div className="text-eyebrow flex px-3.5 py-2.5 font-mono font-medium uppercase text-white/40">
                    <span className="flex-1">{t('tableLead')}</span>
                    <span className="flex-1">{t('tableStage')}</span>
                    <span className="flex-1">{t('tableScore')}</span>
                  </div>
                  {LEAD_ROWS.map(([name, score], i) => (
                    <div
                      key={name}
                      className="text-caption font-body flex border-t border-white/[0.06] px-3.5 py-2.5"
                    >
                      <span className="flex-1 text-white/85">{name}</span>
                      <span className="flex-1 text-white/55">{stages[i]}</span>
                      <span className="text-accent-bright flex-1 font-semibold tabular-nums">
                        {score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── What it does: sticky walkthrough ────────────────────────────────
          Desktop = sticky module index (start) + a connected pipeline of detail
          rows (end). The index mirrors the pipeline and highlights on scroll. */}
      <section className="bg-background px-5 py-14 xl:px-[80px] xl:py-24 dark:bg-transparent">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:grid xl:grid-cols-[380px_1fr] xl:gap-16">
            {/* Sticky index */}
            <div className="xl:sticky xl:top-28 xl:self-start">
              <SectionKicker className="mb-4">{t('featuresKicker')}</SectionKicker>
              <h2 className="text-headline text-foreground mb-3 font-sans [text-wrap:balance]">
                {t('featuresLine1')} {t('featuresLine2')}
              </h2>
              <p className="text-body font-body text-muted max-w-[520px]">
                {t('featuresSubtitle')}
              </p>

              <ul className="mt-9 hidden flex-col gap-1 xl:flex">
                {features.map((f, i) => {
                  const on = active === i;
                  return (
                    <li key={f.category}>
                      <button
                        type="button"
                        onClick={() => scrollToFeature(i)}
                        className="group/idx flex w-full items-center gap-4 rounded-[10px] py-2.5 text-start transition-colors"
                      >
                        <span
                          dir="ltr"
                          className={`font-mono text-[13px] font-medium tabular-nums transition-colors ${
                            on ? 'text-accent' : 'text-muted'
                          }`}
                        >
                          {num(i)}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-px rounded transition-all duration-300 ${
                            on ? 'bg-accent w-10' : 'bg-border w-6 group-hover/idx:w-8'
                          }`}
                        />
                        <span
                          className={`text-body-lg font-sans font-semibold transition-colors ${
                            on ? 'text-foreground' : 'text-muted group-hover/idx:text-foreground'
                          }`}
                        >
                          {f.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Pipeline of detail rows */}
            <div className="mt-10 flex flex-col xl:mt-0">
              {features.map((f, i) => {
                const on = active === i;
                const last = i === features.length - 1;
                return (
                  <ScrollReveal key={f.category} index={i}>
                    <div
                      data-index={i}
                      ref={(el) => {
                        featureRefs.current[i] = el;
                      }}
                      className="relative grid grid-cols-[auto_1fr] gap-5"
                    >
                      {/* node + connector rail */}
                      <div className="flex flex-col items-center">
                        <span
                          dir="ltr"
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[13px] font-semibold tabular-nums transition-colors duration-300 ${
                            on
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-background text-muted'
                          }`}
                        >
                          {num(i)}
                        </span>
                        {!last && <span aria-hidden="true" className="bg-border w-px flex-1" />}
                      </div>

                      {/* detail card — static info, no hover; life comes from the rail */}
                      <div className="rounded-card border-border shadow-card mb-6 border bg-white p-6 xl:p-7 dark:bg-[#111]">
                        <span className="text-eyebrow bg-accent-subtle text-accent inline-block rounded-[8px] px-2.5 py-1 font-mono font-medium uppercase">
                          {f.category}
                        </span>
                        <p className="text-title text-foreground mt-4 font-sans">{f.title}</p>
                        <p className="text-body-lg font-body text-muted mt-2">{f.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Automation: capabilities that run themselves ────────────────────
          Clean white bordered cards; characterful hover = icon tile fills accent
          + border sharpens (no translate/scale). */}
      <section className="bg-[#F0F4F1] px-5 py-14 xl:px-[80px] xl:py-24 dark:bg-transparent">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('autoKicker')}</SectionKicker>
          <h2 className="text-headline text-foreground mb-3 font-sans [text-wrap:balance]">
            {t('autoLine1')} {t('autoLine2')}
          </h2>
          <p className="text-body font-body text-muted mb-10 max-w-[720px]">{t('autoSubtitle')}</p>

          <div className="grid gap-5 sm:grid-cols-2">
            {automations.map((item, i) => (
              <ScrollReveal key={item.title} index={i} className="h-full">
                <div className="group/card hover-lift rounded-card border-border shadow-card flex h-full flex-col items-start gap-4 border bg-white p-7 dark:bg-[#111]">
                  <span className="text-accent border-accent/25 bg-accent-subtle group-hover/card:bg-accent flex h-12 w-12 items-center justify-center rounded-[12px] border transition-colors duration-300 group-hover/card:text-white">
                    {AUTOMATION_ICONS[i]}
                  </span>
                  <p className="text-title text-foreground font-sans">{item.title}</p>
                  <p className="text-body font-body text-muted">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ink anchor: run a smarter desk ──────────────────────────────────
          Deep green-black closer. Keeps both /support CTAs. */}
      <section className="ink-band relative overflow-hidden rounded-t-[32px] px-5 py-16 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <div className="xl:flex xl:items-end xl:justify-between xl:gap-16">
              <div className="max-w-[560px]">
                <SectionKicker className="mb-5">{t('kicker')}</SectionKicker>
                <h2 className="text-headline font-sans text-white [text-wrap:balance]">
                  {t('ctaHeading')}
                </h2>
                <p className="text-lead font-body mt-4 text-white/60">{t('ctaDesc')}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 xl:mt-0 xl:flex-shrink-0">
                <Link
                  href={`/${locale}/support`}
                  className="bg-accent hover:bg-accent-hover font-body inline-flex items-center gap-2 rounded-full px-6 py-[14px] text-[15px] font-semibold text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] active:scale-[0.98]"
                >
                  {t('ctaDemoBtn')}
                  <ArrowIcon />
                </Link>
                <Link
                  href={`/${locale}/support`}
                  className="font-body hover:border-accent-bright/60 inline-flex items-center rounded-full border border-white/15 px-[22px] py-[14px] text-[15px] font-semibold text-white/85 transition-colors hover:text-white"
                >
                  {t('ctaSalesBtn')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
