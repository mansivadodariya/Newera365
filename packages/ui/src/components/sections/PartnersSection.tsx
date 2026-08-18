'use client';

import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';

export interface PartnerItem {
  groupKey: string;
  name: string;
  logoType?: string | null;
  logoFilename?: string | null;
  id?: string | null;
}

const DEFAULT_PARTNERS: PartnerItem[] = [
  // 01 Hosting Providers
  {
    groupKey: 'hosting',
    name: 'ForexVPS',
    logoType: 'wordmark',
    logoFilename: 'forexvps-full.png',
  },
  {
    groupKey: 'hosting',
    name: 'Centroid Solutions',
    logoType: 'wordmark',
    logoFilename: 'centroid-full.svg',
  },

  // 02 Liquidity Partners
  { groupKey: 'liquidity', name: 'CQG', logoType: 'wordmark', logoFilename: 'cqg-full.svg' },
  { groupKey: 'liquidity', name: 'Finalto', logoType: 'icon', logoFilename: 'finalto.png' },
  {
    groupKey: 'liquidity',
    name: 'Scope Markets',
    logoType: 'icon',
    logoFilename: 'scope-markets.ico',
  },
  { groupKey: 'liquidity', name: 'Equiti', logoType: 'wordmark', logoFilename: 'equiti-full.svg' },
  { groupKey: 'liquidity', name: 'Amana', logoType: 'icon', logoFilename: 'amana.png' },
  {
    groupKey: 'liquidity',
    name: 'B2Broker',
    logoType: 'wordmark',
    logoFilename: 'b2broker-full.svg',
  },
  {
    groupKey: 'liquidity',
    name: 'LMAX Group',
    logoType: 'wordmark',
    logoFilename: 'lmax-full.png',
  },
  {
    groupKey: 'liquidity',
    name: 'Blueberry',
    logoType: 'wordmark',
    logoFilename: 'blueberry-full.png',
  },
  {
    groupKey: 'liquidity',
    name: 'CMS Prime',
    logoType: 'wordmark',
    logoFilename: 'cms-prime-full.svg',
  },
  { groupKey: 'liquidity', name: 'CME Group', logoType: 'wordmark', logoFilename: 'cme-full.png' },

  // 03 Technology Partners
  {
    groupKey: 'technology',
    name: 'FXCubic',
    logoType: 'wordmark',
    logoFilename: 'fxcubic-full.png',
  },
  {
    groupKey: 'technology',
    name: 'Centroid Solution',
    logoType: 'wordmark',
    logoFilename: 'centroid-full.svg',
  },
  {
    groupKey: 'technology',
    name: 'Tool For Broker',
    logoType: 'wordmark',
    logoFilename: 'tools-for-brokers-full.svg',
  },

  // 04 Payment Gateways
  { groupKey: 'payments', name: 'Cregis', logoType: 'icon', logoFilename: 'cregis.png' },
  { groupKey: 'payments', name: 'Epayme', logoType: 'wordmark', logoFilename: 'epayme-full.png' },
  { groupKey: 'payments', name: 'Liminal', logoType: 'wordmark', logoFilename: 'liminal.svg' },
];

const GROUP_ORDER = ['hosting', 'liquidity', 'technology', 'payments'] as const;
const GROUP_LABEL_KEYS: Record<string, string> = {
  hosting: 'partnersHosting',
  liquidity: 'partnersLiquidity',
  technology: 'partnersTechnology',
  payments: 'partnersPayments',
};

export interface PartnersSectionProps {
  partners?: PartnerItem[];
}

function renderCell(item: PartnerItem, key: string | number, decorative = false) {
  return (
    <div
      key={key}
      className="border-border/80 group/cell relative flex h-[108px] w-[164px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[16px] border bg-white px-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] xl:w-[184px] dark:border-white/[0.12] dark:bg-[#161922] dark:shadow-none"
    >
      <div className="flex flex-col items-center justify-center gap-2.5 opacity-100 transition-transform duration-300 ease-out motion-safe:group-hover/cell:scale-[1.08]">
        {item.logoType === 'wordmark' && item.logoFilename ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/partners/${item.logoFilename}`}
            alt={decorative ? '' : item.name}
            loading="eager"
            className="h-10 w-auto max-w-[165px] object-contain xl:h-12 dark:brightness-0 dark:invert"
          />
        ) : item.logoType === 'icon' && item.logoFilename ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/partners/${item.logoFilename}`}
              alt=""
              loading="eager"
              className="h-11 w-auto max-w-[80%] object-contain"
            />
            <span
              dir="ltr"
              className="text-center font-sans text-xs font-bold tracking-[-0.01em] text-slate-900 sm:text-sm dark:text-white"
            >
              {item.name}
            </span>
          </>
        ) : (
          <span
            dir="ltr"
            className="text-center font-sans text-lg font-extrabold tracking-[-0.01em] text-slate-900 xl:text-xl dark:text-white"
          >
            {item.name}
          </span>
        )}
      </div>
    </div>
  );
}

export function PartnersSection({ partners }: PartnersSectionProps) {
  const t = useTranslations('home');
  const reduce = useReducedMotion();

  const defaultMap = new Map(DEFAULT_PARTNERS.map((p) => [p.name.toLowerCase().trim(), p]));

  const basePartners = partners && partners.length > 0 ? partners : DEFAULT_PARTNERS;

  const activePartners = basePartners.map((p) => {
    const normName = (p.name || '').toLowerCase().trim();
    const def = defaultMap.get(normName);
    if (def && (!p.logoFilename || p.logoType === 'none')) {
      return { ...p, logoType: def.logoType, logoFilename: def.logoFilename };
    }
    return p;
  });

  const groups = GROUP_ORDER.map((groupKey) => ({
    id: groupKey,
    labelKey: GROUP_LABEL_KEYS[groupKey],
    items: activePartners.filter((p) => p.groupKey === groupKey),
  })).filter((group) => group.items.length > 0);

  const durationS = Math.max(40, Math.round((activePartners.length + groups.length) * 6.5));

  return (
    <section className="bg-transparent px-5 py-12 xl:py-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-3">{t('partnersKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-2 max-w-[20ch] text-balance font-sans font-bold">
            {t('partnersHeading')}
          </h2>
          <p className="text-muted text-lead max-w-[52ch]">{t('partnersSubtitle')}</p>
        </ScrollReveal>

        <ScrollReveal index={1}>
          <div className="mt-6 xl:mt-8">
            {reduce ? (
              // Static, grouped fallback — every label + logo stays visible.
              <div className="flex flex-col gap-8">
                {groups.map((group, gi) => (
                  <div key={group.id}>
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        aria-hidden
                        className="select-none font-sans text-[1.8rem] font-black tabular-nums leading-none tracking-tight text-slate-900 dark:text-white"
                      >
                        {String(gi + 1).padStart(2, '0')}
                      </span>
                      <span className="h-7 w-[2px] flex-shrink-0 bg-[#00B050]" />
                      <span className="font-sans text-[15px] font-bold uppercase tracking-[0.14em] text-slate-900 md:text-[17px] dark:text-white">
                        {t(group.labelKey as 'partnersLiquidity')} :
                      </span>
                      <span className="bg-border h-px flex-1 dark:bg-white/[0.08]" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {group.items.map((item, ii) =>
                        renderCell(item, item.id ?? `${item.name}-${ii}`),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="group/marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]"
                style={{ '--marquee-duration': `${durationS}s` } as CSSProperties}
              >
                <div className="animate-marquee flex w-max py-2 group-hover/marquee:[animation-play-state:paused] rtl:[animation-direction:reverse]">
                  {[0, 1].map((copy) => (
                    <div
                      key={copy}
                      aria-hidden={copy === 1}
                      className="flex shrink-0 items-center gap-3 pe-3"
                    >
                      {groups.map((group, gi) => (
                        <Fragment key={group.id}>
                          {/* Section marker: Bold crisp numeral + accent bar + bold dark title */}
                          <div className="flex flex-shrink-0 items-center gap-3 pe-4 ps-8">
                            <span
                              aria-hidden
                              className="select-none font-sans text-[1.8rem] font-black tabular-nums leading-none tracking-tight text-slate-900 dark:text-white"
                            >
                              {String(gi + 1).padStart(2, '0')}
                            </span>
                            <span className="h-7 w-[2px] flex-shrink-0 bg-[#00B050]" />
                            <span className="whitespace-nowrap font-sans text-[15px] font-bold uppercase tracking-[0.14em] text-slate-900 md:text-[17px] dark:text-white">
                              {t(group.labelKey as 'partnersLiquidity')} :
                            </span>
                          </div>
                          {group.items.map((item, ii) =>
                            renderCell(item, `${group.id}-${ii}`, copy === 1),
                          )}
                        </Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
