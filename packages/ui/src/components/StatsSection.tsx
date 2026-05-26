'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export function StatsSection() {
  const t = useTranslations('home');

  const stats = [
    { value: t('statsYearsValue'), label: t('statsYearsLabel') },
    { value: t('statsTradersValue'), label: t('statsTradersLabel') },
    { value: t('statsExecValue'), label: t('statsExecLabel') },
    { value: t('statsUptimeValue'), label: t('statsUptimeLabel') },
  ];

  return (
    <section
      className="px-5 pb-9 pt-10"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(17,17,17,0.43) 100%)' }}
    >
      <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
        <SectionKicker className="mb-5">{t('statsByNumbers')}</SectionKicker>

        <h2 className="text-foreground mb-4 whitespace-pre-line font-sans text-[28px] font-semibold leading-[1.1]">
          {t('statsHeading')}
        </h2>

        {/* Stats grid — dark cards, white numbers */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-white">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col justify-center gap-[6px] bg-black p-[22px]"
            >
              <span className="font-sans text-[30px] font-semibold leading-none text-white">
                {stat.value}
              </span>
              <span className="font-body text-[10px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Regulated badge */}
        <div
          className="mt-6 flex items-center gap-[14px] rounded-[16px] px-5 py-[18px]"
          style={{ background: 'linear-gradient(45deg, #00B050 0%, #ffffff 100%)' }}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 2L3 6v4c0 4.4 3.3 8.5 8 9.9C16.7 18.5 20 14.4 20 10V6L11 2z"
                stroke="white"
                strokeWidth="1.4"
                strokeLinejoin="round"
                fill="none"
              />
              <rect x="7" y="10" width="2" height="5" rx="0.5" fill="white" />
              <rect x="10.5" y="8" width="2" height="7" rx="0.5" fill="white" />
              <rect x="14" y="11" width="2" height="4" rx="0.5" fill="white" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[13px] font-medium leading-tight text-white">
              {t('statsRegBadgeTitle')}
            </p>
            <p className="font-body mt-0.5 text-[11px] text-white/80">{t('statsRegBadgeDesc')}</p>
          </div>
          <span className="font-body flex-shrink-0 text-[14px] text-white">›</span>
        </div>
      </div>
    </section>
  );
}
