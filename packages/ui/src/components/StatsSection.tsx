'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { CountUp } from './CountUp';
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
    <section className="rounded-t-[32px] bg-transparent px-5 pb-9 pt-10 xl:pb-14 xl:pt-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-foreground [&>span:first-child]:bg-foreground mb-5">
          {t('statsByNumbers')}
        </SectionKicker>

        <h2 className="text-foreground mb-4 whitespace-pre-line font-sans text-[28px] font-semibold leading-[110%] tracking-[-0.56px]">
          {t('statsHeading')}
        </h2>

        {/* Stats grid — per Figma (78:87) the cells form a single rounded-[20px]
            cluster with 1px gutters; cells are square and the outer radius is
            clipped by the wrapper. 2×2 on mobile, 4-across from md. */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] shadow-[0px_4px_8px_rgba(0,0,0,0.06)] md:grid-cols-4 dark:shadow-none">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-[6px] bg-[#111] p-[22px] dark:bg-[#15171c]"
            >
              <span className="font-sans text-[30px] font-semibold tracking-[-0.6px] text-white">
                <CountUp value={stat.value} />
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[1.2px] text-[#8c949e]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Regulated badge — white card (light) / dark card (dark) */}
        <div className="mt-6 flex items-center gap-[14px] rounded-[16px] border border-border bg-background px-5 py-[18px] dark:bg-[#15171c]">
          {/* Circular emblem — light-grey circle in light theme, dark circle in dark;
              the black line-art icon is inverted to white so it stays visible. */}
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f2f4f7] dark:bg-[#23262d]">
            <Image
              src="/icons/authority.png"
              alt="Authority"
              width={22}
              height={22}
              className="dark:invert"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[13px] font-medium leading-tight text-[#111] dark:text-white">
              {t('statsRegBadgeTitle')}
            </p>
            <p className="font-body mt-0.5 text-[11px] text-[#6b7280]">{t('statsRegBadgeDesc')}</p>
          </div>
          <span className="font-body flex-shrink-0 text-[16px] text-black dark:text-white">›</span>
        </div>
      </div>
    </section>
  );
}
