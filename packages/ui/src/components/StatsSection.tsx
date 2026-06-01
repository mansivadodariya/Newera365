'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import Image from 'next/image';

export interface CmsKpiStat {
  valueEn: string;
  valueAr: string;
  labelEn: string;
  labelAr: string;
  id?: string | null;
}

export function StatsSection({ kpiStats, locale }: { kpiStats?: CmsKpiStat[]; locale?: string }) {
  const t = useTranslations('home');

  const stats =
    kpiStats && kpiStats.length > 0
      ? kpiStats.map((s) => ({
          value: locale === 'ar' ? s.valueAr : s.valueEn,
          label: locale === 'ar' ? s.labelAr : s.labelEn,
        }))
      : [
          { value: t('statsYearsValue'), label: t('statsYearsLabel') },
          { value: t('statsTradersValue'), label: t('statsTradersLabel') },
          { value: t('statsExecValue'), label: t('statsExecLabel') },
          { value: t('statsUptimeValue'), label: t('statsUptimeLabel') },
        ];

  return (
    <section className="bg-[#f2f2f7] px-5 pb-9 pt-10 xl:pb-16 xl:pt-16 dark:bg-[#0f0f0f]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-5 text-[#000000] dark:text-[#FFFFFF]">
          {t('statsByNumbers')}
        </SectionKicker>

        <h2 className="text-foreground mb-4 whitespace-pre-line font-sans text-[28px] font-semibold leading-[110%] tracking-[-0.02em]">
          {t('statsHeading')}
        </h2>

        {/* Stats grid — 2 cols mobile, 4 cols desktop, max 4 cards */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-[#333] xl:grid-cols-4">
          {stats.slice(0, 4).map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col justify-center gap-[6px] bg-[#111] p-[22px]"
            >
              <span
                className={`font-sans text-[30px] font-semibold leading-none tracking-[-0.6px] ${i === 0 ? 'text-white' : 'text-white/80'}`}
              >
                {stat.value}
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Regulated badge — white card matching Figma */}
        <div className="mt-6 flex items-center gap-[14px] rounded-[16px] bg-white px-5 py-[18px] dark:bg-[#1c1c1c]">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
            <Image
              src="/icons/authority.png"
              alt="Authority"
              width={28}
              height={28}
              className="dark:invert"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[13px] font-medium leading-tight text-[#111] dark:text-white">
              {t('statsRegBadgeTitle')}
            </p>
            <p className="font-body mt-0.5 text-[11px] text-[#6b7280]">{t('statsRegBadgeDesc')}</p>
          </div>
          <span className="font-body flex-shrink-0 text-[16px] text-[#b0b0b0]">›</span>
        </div>
      </div>
    </section>
  );
}
