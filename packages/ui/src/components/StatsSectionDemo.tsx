import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { SectionKicker } from './SectionKicker';
import { CountUp, CountUpGroup } from './CountUp';
import { RevealDemo } from './RevealDemo';

export interface CmsKpiStat {
  valueEn: string;
  valueAr: string;
  labelEn: string;
  labelAr: string;
  id?: string | null;
}

/**
 * Dark KPI cards with a lift + corner accent wash on hover, a standardised
 * scroll-reveal, and the regulated badge. Reuses CountUp + the CmsKpiStat shape.
 */
export async function StatsSectionDemo({
  kpiStats,
  locale,
}: {
  kpiStats?: CmsKpiStat[];
  locale?: string;
}) {
  const t = await getTranslations('home');

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
    <section className="bg-transparent px-5 pb-9 pt-12 xl:pb-14 xl:pt-14">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-foreground [&>span:first-child]:bg-accent mb-5">
          {t('statsByNumbers')}
        </SectionKicker>

        <h2 className="text-foreground mb-6 whitespace-pre-line font-sans text-[28px] font-semibold leading-[110%] tracking-[-0.56px] xl:text-[34px]">
          {t('statsHeading')}
        </h2>

        <RevealDemo>
          {/* Desktop columns follow the card count so the last row is never
              left ragged (6 CMS tiles → 3×2, 4 fallback tiles → 4×1).
              CountUpGroup starts every tile's animation on the same frame so
              mixed-size stats begin and end in sync. */}
          <CountUpGroup>
            <div
              className={`grid grid-cols-2 gap-3 ${
                stats.length % 3 === 0 ? 'md:grid-cols-3' : 'md:grid-cols-4'
              }`}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative flex flex-col gap-[6px] overflow-hidden rounded-[18px] bg-[#111] p-[22px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,176,80,0.16)] dark:bg-[#15171c]"
                >
                  {/* Corner accent wash on hover */}
                  <span
                    aria-hidden="true"
                    className="bg-accent/20 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="relative font-sans text-[30px] font-semibold tracking-[-0.6px] text-white">
                    <CountUp value={stat.value} />
                  </span>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[1.2px] text-[#8c949e]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </CountUpGroup>
        </RevealDemo>

        {/* Regulated badge */}
        <div className="border-border bg-background mt-6 flex items-center gap-[14px] rounded-[16px] border px-5 py-[18px] dark:bg-[#15171c]">
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
            <p className="font-body mt-0.5 text-[11px] text-[#6b7280] dark:text-[#B8BFCC]">
              {t('statsRegBadgeDesc')}
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 flex-shrink-0 text-black rtl:-scale-x-100 dark:text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
