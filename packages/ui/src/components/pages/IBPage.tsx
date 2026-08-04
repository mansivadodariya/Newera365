'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';

export interface IBCmsContent {
  heroSubtitle?: string | null;
  ibDescription?: string | null;
  affiliateDescription?: string | null;
  whiteLabelDescription?: string | null;
  ctaHeading?: string | null;
  ctaSubtitle?: string | null;
}

const svgIconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

function ShieldCheckIcon() {
  return (
    <svg {...svgIconProps}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg {...svgIconProps}>
      <path d="m22 7-8.5 8.5-5-5L1 18" />
      <path d="M16 7h6v6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...svgIconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg {...svgIconProps}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function LayoutDashboardIcon() {
  return (
    <svg {...svgIconProps}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg {...svgIconProps}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg {...svgIconProps}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg {...svgIconProps}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a10 10 0 0 1 20 0v7a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg {...svgIconProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg {...svgIconProps}>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg {...svgIconProps}>
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h.01" />
    </svg>
  );
}

export function IBPage({ cmsContent }: { cmsContent?: IBCmsContent | null }) {
  const t = useTranslations('ib');

  // Exact form fields as defined in schema
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    country: '',
    message: '',
  });

  const [applyLoading, setApplyLoading] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const setField =
    (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submitApply(e: FormEvent) {
    e.preventDefault();
    if (applyLoading) return;
    setApplyLoading(true);
    setApplyError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/partners/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      if (res.ok) {
        setApplyDone(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: { message?: string }[];
        };
        setApplyError(data.errors?.[0]?.message ?? data.error ?? t('applyError'));
      }
    } catch {
      setApplyError(t('applyError'));
    } finally {
      setApplyLoading(false);
    }
  }

  const inputCls =
    'font-body text-foreground border-border w-full rounded-[12px] border bg-[#F4F7F5] px-4 py-3 text-[15px] outline-none dark:border-white/10 dark:bg-[#1a1c22]';

  // 9 Hero Pill Tabs (3x3 Grid)
  const heroPills = [
    { title: t('pill1Title'), sub: t('pill1Sub'), icon: <TrendingUpIcon /> },
    { title: t('pill2Title'), sub: t('pill2Sub'), icon: <UsersIcon /> },
    { title: t('pill3Title'), sub: t('pill3Sub'), icon: <LayoutDashboardIcon /> },
    { title: t('pill4Title'), sub: t('pill4Sub'), icon: <ZapIcon /> },
    { title: t('pill5Title'), sub: t('pill5Sub'), icon: <BarChartIcon /> },
    { title: t('pill6Title'), sub: t('pill6Sub'), icon: <GiftIcon /> },
    { title: t('pill7Title'), sub: t('pill7Sub'), icon: <CpuIcon /> },
    { title: t('pill8Title'), sub: t('pill8Sub'), icon: <WalletIcon /> },
    { title: t('pill9Title'), sub: t('pill9Sub'), icon: <HeadphonesIcon /> },
  ];

  const whyPartnerItems = [
    { icon: <TrendingUpIcon />, title: t('why1Title'), desc: t('why1Desc') },
    { icon: <GlobeIcon />, title: t('why2Title'), desc: t('why2Desc') },
    { icon: <GiftIcon />, title: t('why3Title'), desc: t('why3Desc') },
    { icon: <LayoutDashboardIcon />, title: t('why4Title'), desc: t('why4Desc') },
    { icon: <ZapIcon />, title: t('why5Title'), desc: t('why5Desc') },
    { icon: <ShieldCheckIcon />, title: t('why6Title'), desc: t('why6Desc') },
  ];

  const programSteps = [
    { num: '1', title: t('step1Title'), desc: t('step1Desc') },
    { num: '2', title: t('step2Title'), desc: t('step2Desc') },
    { num: '3', title: t('step3Title'), desc: t('step3Desc') },
  ];

  const clientBenefits = [
    { icon: <ZapIcon />, title: t('client1Title'), desc: t('client1Desc') },
    { icon: <CpuIcon />, title: t('client2Title'), desc: t('client2Desc') },
    { icon: <ShieldCheckIcon />, title: t('client3Title'), desc: t('client3Desc') },
    { icon: <HeadphonesIcon />, title: t('client4Title'), desc: t('client4Desc') },
    { icon: <UsersIcon />, title: t('client5Title'), desc: t('client5Desc') },
    { icon: <BarChartIcon />, title: t('client6Title'), desc: t('client6Desc') },
  ];

  return (
    <>
      {/* 1. Hero Section with 9 Feature Pills and Right Registration Form */}
      <section className="relative overflow-hidden bg-transparent px-5 pb-12 pt-10 xl:pb-16 xl:pt-14">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch xl:gap-12">
          {/* Left Content Column */}
          <div>
            <h1 className="text-display text-foreground font-sans">
              {t('heroHeadlinePart1')}
              <span className="text-[#00B050]">{t('heroHeadlineGreen1')}</span>
              {t('heroHeadlinePart2')}
              <span className="text-[#00B050]">{t('heroHeadlineGreen2')}</span>
            </h1>

            <p className="font-body text-body-lg text-muted mb-8 mt-4 max-w-[560px]">
              {t('heroSubtitle')}
            </p>

            {/* 9 Hero Feature Pill Cards (3x3 Grid) */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {heroPills.map((pill, i) => (
                <div
                  key={i}
                  className="border-border shadow-card flex items-center gap-3 rounded-[16px] border bg-white p-3.5 transition-all hover:border-[#00B050]/40 dark:border-white/[0.08] dark:bg-[#15171c]"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#00B050]/10 text-[#00B050]">
                    {pill.icon}
                  </div>
                  <div>
                    <p className="text-foreground font-sans text-[13px] font-bold leading-tight">
                      {pill.title}
                    </p>
                    <p className="font-body text-muted text-[11px] leading-tight">{pill.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Registration Form */}
          <div className="border-border shadow-card mt-10 flex flex-col justify-between rounded-[24px] border bg-white p-7 xl:mt-0 dark:border-white/[0.08] dark:bg-[#11141a]">
            <h3 className="text-headline text-foreground mb-4 font-sans text-[22px] font-bold">
              {t('applyHeading')}
            </h3>

            {applyDone ? (
              <div className="font-body rounded-[16px] bg-[#00B050]/10 px-5 py-6 text-[14px] text-[#00B050]">
                {t('applySuccess')}
              </div>
            ) : (
              <form onSubmit={submitApply} className="flex flex-1 flex-col gap-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <input
                    required
                    type="text"
                    placeholder={t('applyName')}
                    value={form.name}
                    onChange={setField('name')}
                    className={inputCls}
                  />
                  <input
                    required
                    type="email"
                    placeholder={t('applyEmail')}
                    value={form.email}
                    onChange={setField('email')}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder={t('applyCompany')}
                    value={form.company}
                    onChange={setField('company')}
                    className={inputCls}
                  />
                  <input
                    type="url"
                    placeholder={t('applyWebsite')}
                    value={form.website}
                    onChange={setField('website')}
                    className={inputCls}
                  />
                </div>
                <input
                  type="text"
                  placeholder={t('applyCountry')}
                  value={form.country}
                  onChange={setField('country')}
                  className={inputCls}
                />
                <textarea
                  placeholder={t('applyMessage')}
                  value={form.message}
                  onChange={setField('message')}
                  rows={3}
                  className={`${inputCls} min-h-[90px] flex-1 resize-none`}
                />

                {applyError && <p className="font-body text-[12px] text-red-500">{applyError}</p>}

                <button
                  type="submit"
                  disabled={applyLoading}
                  className="font-body mt-auto w-full rounded-full bg-[#00B050] px-6 py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#00B050]/90 disabled:opacity-60"
                >
                  {applyLoading ? t('applySubmitting') : t('applyCta')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 2. Why Partners Choose Newera */}
      <section id="why-choose-us" className="bg-[#FFFFFF] px-5 py-14 xl:py-20 dark:bg-[#07090D]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-center">
            <SectionKicker className="mb-3">{t('whyChooseKicker')}</SectionKicker>
            <h2 className="text-headline text-foreground text-center font-sans">
              {t('whyChooseHeading')}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {whyPartnerItems.map((item, idx) => (
              <div
                key={idx}
                className="border-border shadow-card group relative flex flex-col rounded-[22px] border bg-white p-7 transition-all duration-300 hover:border-[#00B050]/40 hover:shadow-[0_18px_44px_rgba(0,176,80,0.14)] dark:border-white/[0.08] dark:bg-[#15171c]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[16px] bg-[#00B050]/10 text-[#00B050] transition-colors duration-300 group-hover:bg-[#00B050] group-hover:text-white">
                  {item.icon}
                </div>
                <h3 className="text-title text-foreground mt-5 font-sans font-semibold">
                  {item.title}
                </h3>
                <p className="font-body text-body text-muted mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#apply"
              className="font-body inline-flex rounded-full bg-[#00B050] px-8 py-4 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#00B050]/90 active:scale-[0.98]"
            >
              {t('switchBtn')}
            </a>
          </div>
        </div>
      </section>

      {/* 3. Simple Steps to Join Our Partnership Program */}
      <section id="how-it-works" className="bg-transparent px-5 py-14 xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-left">
            <SectionKicker className="mb-3">{t('stepsKicker')}</SectionKicker>
            <h2 className="text-headline text-foreground font-sans text-[32px] font-bold tracking-tight md:text-[40px]">
              {t('stepsHeading')}
            </h2>
            <p className="font-body text-body-lg text-muted mt-2">{t('stepsSub')}</p>
          </div>

          <div className="border-border/70 mt-8 border-t dark:border-white/[0.08]">
            {programSteps.map((st, idx) => {
              const isActive = activeStep === idx;
              const formattedNum = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={st.num}
                  className="border-border/70 border-b py-2.5 dark:border-white/[0.08]"
                >
                  <div
                    onClick={() => setActiveStep(idx)}
                    onMouseEnter={() => setActiveStep(idx)}
                    className={`group cursor-pointer rounded-[20px] px-6 py-6 transition-all duration-300 ${
                      isActive
                        ? 'bg-[#00B050] text-white shadow-md'
                        : 'bg-transparent hover:bg-[#00B050] hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      <span
                        className={`flex-shrink-0 font-mono text-[28px] font-bold leading-none transition-colors duration-300 md:text-[32px] ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-white dark:text-white/40'
                        }`}
                        dir="ltr"
                      >
                        {formattedNum}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-sans text-[20px] font-bold leading-snug transition-colors duration-300 md:text-[22px] ${
                            isActive ? 'text-white' : 'text-foreground group-hover:text-white'
                          }`}
                        >
                          {st.title}
                        </h3>
                        <p
                          className={`font-body mt-2 text-[14px] leading-relaxed transition-colors duration-300 md:text-[15px] ${
                            isActive ? 'text-white/95' : 'text-muted group-hover:text-white/95'
                          }`}
                        >
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#apply"
              className="font-body inline-flex rounded-full bg-[#00B050] px-8 py-4 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#00B050]/90 active:scale-[0.98]"
            >
              {t('joinProgramBtn')}
            </a>
          </div>
        </div>
      </section>

      {/* 4. Why Your Clients Will Love Newera */}
      <section id="client-benefits" className="bg-[#FFFFFF] px-5 py-14 xl:py-20 dark:bg-[#07090D]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-center">
            <SectionKicker className="mb-3">{t('clientKicker')}</SectionKicker>
            <h2 className="text-headline text-foreground font-sans">{t('clientHeading')}</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {clientBenefits.map((cb, idx) => (
              <div
                key={idx}
                className="border-border bg-surface shadow-card flex flex-col rounded-[20px] border p-7 transition-all duration-200 dark:border-white/[0.08] dark:bg-[#15171c]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#00B050]/10 text-[#00B050]">
                  {cb.icon}
                </div>
                <h3 className="text-title text-foreground mt-4 font-sans font-semibold">
                  {cb.title}
                </h3>
                <p className="font-body text-body text-muted mt-2 leading-relaxed">{cb.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Claim Your Partner Starter Pack */}
      <section className="px-5 py-10">
        <div className="ink-band mx-auto max-w-[390px] overflow-hidden rounded-[28px] border border-white/[0.08] p-8 md:max-w-2xl xl:max-w-[1200px] xl:p-12">
          <div className="xl:flex xl:items-center xl:justify-between xl:gap-8">
            <div className="max-w-[640px]">
              <SectionKicker className="mb-3 text-[#00B050]">{t('starterKicker')}</SectionKicker>
              <h2 className="font-sans text-[26px] font-bold text-white xl:text-[32px]">
                {t('starterHeading')}
              </h2>
              <p className="font-body text-body mt-2 text-white/70">{t('starterDesc')}</p>
            </div>
            <a
              href="#apply"
              className="font-body mt-6 inline-flex rounded-full bg-[#00B050] px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#00B050]/90 xl:mt-0"
            >
              {t('registerNowBtn')}
            </a>
          </div>
        </div>
      </section>

      {/* 6. Become Our Partners — Bottom Application Form & Disclaimers */}
      <section id="apply" className="bg-transparent px-5 pb-12 pt-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[760px]">
          <div className="mb-6 text-left">
            <SectionKicker className="mb-3">{t('applyKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline font-sans">{t('applyHeading')}</h2>
          </div>

          {applyDone ? (
            <div className="font-body rounded-[16px] bg-[#00B050]/10 px-5 py-6 text-[14px] text-[#00B050]">
              {t('applySuccess')}
            </div>
          ) : (
            <form onSubmit={submitApply} className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 md:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder={t('applyName')}
                  value={form.name}
                  onChange={setField('name')}
                  className={inputCls}
                />
                <input
                  required
                  type="email"
                  placeholder={t('applyEmail')}
                  value={form.email}
                  onChange={setField('email')}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder={t('applyCompany')}
                  value={form.company}
                  onChange={setField('company')}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder={t('applyWebsite')}
                  value={form.website}
                  onChange={setField('website')}
                  className={inputCls}
                />
              </div>
              <input
                type="text"
                placeholder={t('applyCountry')}
                value={form.country}
                onChange={setField('country')}
                className={inputCls}
              />
              <textarea
                placeholder={t('applyMessage')}
                value={form.message}
                onChange={setField('message')}
                rows={4}
                className={inputCls}
              />

              {applyError && <p className="font-body text-[12px] text-red-500">{applyError}</p>}

              <button
                type="submit"
                disabled={applyLoading}
                className="font-body mt-2 w-full rounded-full bg-[#00B050] px-6 py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#00B050]/90 disabled:opacity-60"
              >
                {applyLoading ? t('applySubmitting') : t('applyCta')}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
