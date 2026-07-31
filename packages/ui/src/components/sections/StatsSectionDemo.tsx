import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { SectionKicker } from '../primitives/SectionKicker';
import { CountUp, CountUpGroup } from '../motion/CountUp';
import { ScrollReveal } from '../motion/ScrollReveal';
import { Spotlight } from '../primitives/Spotlight';

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
    <section className="bg-transparent px-5 pb-8 pt-10 xl:pb-10 xl:pt-12">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-5">{t('statsByNumbers')}</SectionKicker>

        <h2 className="text-foreground text-headline mb-8 whitespace-pre-line font-sans">
          {t('statsHeading')}
        </h2>

        {/* Desktop columns follow the card count so the last row is never left
            ragged (6 CMS tiles → 3×2, 4 fallback tiles → 4×1). CountUpGroup
            starts every tile on the same frame; each tile reveals on its own
            stagger for a cascade, and the sheen'd numbers count as they land.
            `flat` keeps grouped values (e.g. "25,000") on the single-node render
            so the .text-sheen gradient paints them (the odometer would blank). */}
        <CountUpGroup>
          <div
            className={`grid grid-cols-2 gap-3 ${
              stats.length % 3 === 0 ? 'md:grid-cols-3' : 'md:grid-cols-4'
            }`}
          >
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} index={i} className="h-full">
                <Spotlight
                  size={260}
                  className="bg-ink-soft shadow-card hover:ring-accent/30 flex h-full flex-col gap-6 overflow-hidden rounded-[18px] p-[26px] ring-1 ring-inset ring-white/[0.04] transition-[transform,box-shadow] duration-300 motion-safe:hover:scale-[1.02] dark:bg-[#15171c]"
                >
                  {/* Accent tick stretches while the tile is read */}
                  <span
                    className="bg-accent/70 group-hover/spot:bg-accent-bright mb-1 block h-[3px] w-7 rounded-full transition-[width,background-color] duration-300 group-hover/spot:w-11"
                    aria-hidden="true"
                  />
                  <span
                    dir="ltr"
                    className="text-sheen text-metric-sm relative block w-fit font-sans tabular-nums"
                  >
                    <CountUp flat value={stat.value} />
                  </span>
                  <span className="font-mono text-[14px] font-medium uppercase tracking-[0.13em] text-white/55 transition-colors duration-300 group-hover/spot:text-white/80">
                    {stat.label}
                  </span>
                </Spotlight>
              </ScrollReveal>
            ))}
          </div>
        </CountUpGroup>

        {/* Regulated badge */}
        {/* <div className="border-border bg-surface shadow-card hover:border-accent/40 hover:shadow-card-lg mt-6 flex items-center gap-[14px] rounded-[16px] border px-5 py-[18px] transition-[transform,box-shadow,border-color] duration-300 motion-safe:hover:-translate-y-0.5 dark:bg-[#15171c]">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eef3ef] dark:bg-[#23262d]">
            <Image
              src="/icons/authority.png"
              alt="Authority"
              width={22}
              height={22}
              className="dark:invert"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-body text-foreground font-semibold leading-tight dark:text-white">
              {t('statsRegBadgeTitle')}
            </p>
            <p className="font-body text-caption text-muted mt-0.5">{t('statsRegBadgeDesc')}</p>
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
        </div> */}
      </div>
    </section>
  );
}
