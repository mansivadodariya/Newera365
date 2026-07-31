'use client';

import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';

/**
 * Partners & infrastructure wall — liquidity, technology, payment and data
 * providers behind the brokerage (client content brief, CSL-NE365). One
 * seamless infinite scroller runs the full roster inline as
 * `Liquidity Providers : <cells>  Technology Partners : <cells>  …` — two copies
 * + a -50% loop with no seam, pause on hover, edge-faded. Reduced motion gets a
 * static wrapping row (grouped) so no logo is ever hidden behind the scroll.
 *
 * Each cell renders in one of three modes:
 *  - `wordmark`: the brand's real full logo (identity-verified from the brand's
 *    own site), transparent, shown directly on the card — natural colour in
 *    light mode; inverted to a clean white mark in dark.
 *  - `icon`: brand icon-mark + name lockup (used where only a favicon-grade
 *    mark was available); colour marks read on both themes as-is.
 *  - name only, where no verified logo exists.
 *
 * The roster is CMS-driven (SiteSettings `partners` array, resolved in
 * page.tsx and passed down as a flat list) grouped client-side by `groupKey`.
 * To add a logo, drop the file in `apps/web/public/images/partners/` and set
 * `logoType` to `wordmark` or `icon` with the matching `logoFilename`.
 */
export interface PartnerItem {
  groupKey: string;
  name: string;
  logoType?: string | null;
  logoFilename?: string | null;
  id?: string | null;
}

const GROUP_ORDER = ['liquidity', 'technology', 'payments', 'data'] as const;
const GROUP_LABEL_KEYS: Record<string, string> = {
  liquidity: 'partnersLiquidity',
  technology: 'partnersTechnology',
  payments: 'partnersPayments',
  data: 'partnersData',
};

export interface PartnersSectionProps {
  partners?: PartnerItem[];
}

function renderCell(item: PartnerItem, key: string | number, decorative = false) {
  return (
    <div
      key={key}
      className="border-border group/cell relative flex h-[108px] w-[164px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[16px] border bg-white px-5 shadow-[0_1px_2px_rgba(18,46,28,0.04)] xl:w-[184px] dark:border-white/[0.06] dark:bg-[#161922] dark:shadow-none"
    >
      <div className="flex flex-col items-center justify-center gap-2.5 opacity-[0.68] transition-[opacity,transform] duration-300 ease-out group-hover/cell:opacity-100 motion-safe:group-hover/cell:scale-[1.08]">
        {item.logoType === 'wordmark' && item.logoFilename ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/partners/${item.logoFilename}`}
            alt={decorative ? '' : item.name}
            // Eager: the duplicated (off-screen) marquee copy must paint before
            // it scrolls into the window, or logos pop in mid-scroll.
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
              className="text-caption text-center font-sans font-bold tracking-[-0.01em] text-[#2f3a34] dark:text-white/90"
            >
              {item.name}
            </span>
          </>
        ) : (
          <span
            dir="ltr"
            className="text-center font-sans text-lg font-bold tracking-[-0.01em] text-[#2f3a34] xl:text-xl dark:text-white/90"
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

  if (!partners || partners.length === 0) return null;

  const groups = GROUP_ORDER.map((groupKey) => ({
    id: groupKey,
    labelKey: GROUP_LABEL_KEYS[groupKey],
    items: partners.filter((p) => p.groupKey === groupKey),
  })).filter((group) => group.items.length > 0);

  // One copy = the whole roster + its labels, so it comfortably exceeds the
  // container (no per-set repeat needed). Duration scales with content for a
  // constant scroll pace. ponytail: single copy assumed wider than 1200px — true
  // for any real roster (all partners + 4 labels); revisit only if it shrinks.
  const durationS = Math.max(40, Math.round((partners.length + groups.length) * 6.5));

  return (
    <section className="bg-transparent px-5 py-12 xl:py-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-3">{t('partnersKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-2 max-w-[20ch] text-balance font-sans">
            {t('partnersHeading')}
          </h2>
          <p className="text-muted text-lead max-w-[52ch]">{t('partnersSubtitle')}</p>
        </ScrollReveal>

        <ScrollReveal index={1}>
          <div className="mt-5 xl:mt-6">
            {reduce ? (
              // Static, grouped fallback — every label + logo stays visible.
              <div className="flex flex-col gap-8">
                {groups.map((group, gi) => (
                  <div key={group.id}>
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        aria-hidden
                        className="text-foreground dark:text-accent-bright select-none font-sans text-[1.7rem] font-semibold tabular-nums leading-none tracking-tight opacity-[0.08] dark:opacity-[0.25]"
                      >
                        {String(gi + 1).padStart(2, '0')}
                      </span>
                      <span className="bg-accent/70 h-6 w-px flex-shrink-0" />
                      <span className="text-muted text-eyebrow flex-shrink-0 font-mono font-semibold uppercase tracking-[0.16em]">
                        {t(group.labelKey as 'partnersLiquidity')}
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
              // Bare rail on the paper (no container): the roster rides one
              // seamless line, each role a numbered editorial chapter. Edges
              // dissolve into the canvas with a horizontal mask.
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
                          {/* Numbered chapter marker: ghost numeral + accent bar
                              + mono "Label :" on one line (the rail is infinite,
                              so the label never wraps). */}
                          <div className="flex flex-shrink-0 items-center gap-3 pe-4 ps-8">
                            <span
                              aria-hidden
                              className="text-foreground dark:text-accent-bright select-none font-sans text-[2.6rem] font-semibold tabular-nums leading-none tracking-tight opacity-[0.08] dark:opacity-[0.25]"
                            >
                              {String(gi + 1).padStart(2, '0')}
                            </span>
                            <span className="bg-accent/60 dark:bg-accent-bright/50 h-9 w-px flex-shrink-0" />
                            <span className="text-muted text-eyebrow whitespace-nowrap font-mono font-semibold uppercase tracking-[0.18em]">
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
