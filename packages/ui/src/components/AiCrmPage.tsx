'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export function AiCrmPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="bg-[#07090d] px-5 pb-10 pt-9 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#00B050]/20 [&>span:last-child]:text-[#00B050]">
            AI CRM
          </SectionKicker>

          <h1 className="mb-3 font-sans text-[40px] font-semibold leading-[1.05] text-white xl:text-[56px]">
            Built for brokers.
            <br />
            <span className="text-[#00B050]">Powered by AI.</span>
          </h1>
          <p className="font-body mb-8 max-w-[340px] text-[14px] leading-[1.6] text-white/60 xl:max-w-[480px] xl:text-[16px]">
            An AI-native CRM purpose-built for brokerages. Automate onboarding, score every lead,
            read your book in real time.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/contact`}
              className="font-body flex h-[48px] items-center gap-2 rounded-full bg-[#00B050] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90"
            >
              Request demo
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
            <Link
              href={`/${locale}/contact`}
              className="font-body flex h-[48px] items-center rounded-full border border-white/20 px-6 text-[14px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Talk to sales
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-10 overflow-hidden rounded-[20px] border border-white/10 bg-[#111316]">
            {/* Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00B050]" />
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
                  AI CoPilot · live
                </span>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/10 px-0">
              {[
                { value: '2.1k', label: 'Leads' },
                { value: '92%', label: 'Score' },
                { value: '$1.4M', label: 'ATC' },
              ].map((stat) => (
                <div key={stat.label} className="px-5 py-4">
                  <p className="font-sans text-[22px] font-semibold text-white">{stat.value}</p>
                  <p className="font-body text-[10px] uppercase tracking-[0.08em] text-white/40">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            {/* Insight */}
            <div className="border-t border-white/10 px-5 py-4">
              <p className="font-body mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#00B050]">
                AI INSIGHT
              </p>
              <p className="font-body text-[13px] leading-[1.5] text-white/80">
                148 dormant accounts likely to fund this week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="bg-white px-5 py-12 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-[#6B7280]/20 [&>span:last-child]:text-[#6B7280]">
            WHAT IT DOES
          </SectionKicker>
          <h2 className="mb-10 font-sans text-[30px] font-semibold leading-[1.1] text-[#07090d] xl:text-[40px]">
            AI at the heart of
            <br />
            every workflow.
          </h2>

          <div className="flex flex-col gap-8 xl:grid xl:grid-cols-3 xl:gap-6">
            {[
              {
                category: 'CRM',
                dot: '#00B050',
                title: 'AI Based CRM',
                desc: 'Every contact, ticket and KYC in one place with an AI co-pilot.',
              },
              {
                category: 'SYSTEM',
                dot: '#3B82F6',
                title: 'AI Integrated System',
                desc: 'One platform connected to MT5, payments and KYC providers.',
              },
              {
                category: 'REPORTING',
                dot: '#8B5CF6',
                title: 'AI Trading Reports',
                desc: 'Daily desk reports written by AI — exposure, P&L, churn signals.',
              },
            ].map((item) => (
              <div
                key={item.category}
                className="flex flex-col gap-3 rounded-[18px] border border-[#f0f0f0] bg-[#fafafa] p-6"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.dot }}
                  />
                  <span
                    className="font-body text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: item.dot }}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="font-sans text-[16px] font-semibold text-[#07090d]">{item.title}</p>
                <p className="font-body text-[13px] leading-[1.6] text-[#6b7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="bg-white px-5 pb-14 xl:px-[80px] xl:pb-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-6 [&>span:first-child]:bg-[#6B7280]/20 [&>span:last-child]:text-[#6B7280]">
            AUTOMATION
          </SectionKicker>
          <h2 className="mb-10 font-sans text-[30px] font-semibold leading-[1.1] text-[#07090d] xl:text-[40px]">
            Less ops.
            <br />
            More signal.
          </h2>

          <div className="flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-6">
            {[
              {
                title: 'Client management automation',
                desc: 'Onboarding, KYC and renewals run on their own.',
              },
              {
                title: 'Smart lead tracking',
                desc: 'Scored by funding likelihood. Auto-routes by region.',
              },
              {
                title: 'Broker dashboards',
                desc: 'Real-time exposure, deposits, sessions.',
              },
              {
                title: 'Admin & compliance',
                desc: 'Audit trail, RBAC, one-click reports.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[16px] border border-[#f0f0f0] bg-[#fafafa] p-5"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="#07090d"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-[#07090d]">{item.title}</p>
                  <p className="font-body mt-1 text-[13px] leading-[1.55] text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#07090d] px-5 py-14 xl:px-[80px] xl:py-20">
        <div className="mx-auto max-w-[390px] text-center md:max-w-2xl xl:max-w-[700px]">
          <h2 className="mb-3 font-sans text-[30px] font-semibold leading-[1.1] text-white xl:text-[40px]">
            Run a smarter desk.
          </h2>
          <p className="font-body mb-8 text-[14px] leading-[1.6] text-white/60">
            Sign up to Newera365 AI CRM on a 14-day trial.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/${locale}/contact`}
              className="font-body flex h-[48px] items-center gap-2 rounded-full bg-[#00B050] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90"
            >
              Request demo
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
            <Link
              href={`/${locale}/contact`}
              className="font-body flex h-[48px] items-center rounded-full border border-white/20 px-6 text-[14px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
