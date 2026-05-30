'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import Image from 'next/image';

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
      className="rounded-t-[32px] px-5 pb-9 pt-10 xl:pb-14 xl:pt-10"
      style={{ background: 'var(--gradient-stats)' }}
    >
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-5 text-[#000000] dark:text-[#FFFFFF]">
          {t('statsByNumbers')}
        </SectionKicker>

        <h2 className="text-foreground mb-4 whitespace-pre-line font-sans text-[28px] font-semibold leading-[110%] tracking-[-0.02em]">
          {t('statsHeading')}
        </h2>

        {/* Stats grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-[#e5e7eb] xl:grid-cols-4 dark:bg-[#2a2a2a]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-center gap-[6px] bg-[#000000BA] p-[22px]"
            >
              <span className="font-sans text-[30px] font-semibold leading-none text-[#FFFFFFC4]">
                {stat.value}
              </span>
              <span className="font-body text-[10px] font-medium uppercase tracking-[0.14em] text-[#FFFFFF]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Regulated badge */}
        <div className="mt-6 flex items-center gap-[14px] rounded-[16px] bg-[linear-gradient(135deg,rgba(0,176,80,0.1)_0%,rgba(255,255,255,0.02)_71.43%)] px-5 py-[18px]">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-none">
            <Image src="/icons/authority.png" alt="Authority" width={28} height={28} />
          </div>
          <div className="min-w-0 flex-1 items-center justify-center">
            <p className="font-body items-center text-[13px] font-medium leading-tight text-white">
              {t('statsRegBadgeTitle')}
            </p>
            <p className="font-body mt-0.5 text-[11px] text-white/50">{t('statsRegBadgeDesc')}</p>
          </div>
          <div>
            <span className="font-body flex-shrink-0 text-[14px] text-white/50">›</span>
          </div>
        </div>
      </div>
    </section>
  );
}
