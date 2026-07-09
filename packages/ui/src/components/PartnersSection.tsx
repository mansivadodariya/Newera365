'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

/**
 * Partners & infrastructure wall — liquidity, technology, payment and data
 * providers behind the brokerage (client content brief, CSL-NE365). Layout
 * follows the Brdge partner-wall reference: each role opens with a mono label
 * + a hairline rule sweeping to the right edge, below a clean grid of white
 * bordered cells.
 *
 * Each cell renders in one of three modes:
 *  - `wordmark`: the brand's real full logo (identity-verified from the brand's
 *    own site), transparent, shown directly on the card — natural colour in
 *    light mode; inverted to a clean white mark in dark (dark-ink wordmarks
 *    would otherwise vanish). No white pad.
 *  - `icon`: brand icon-mark + name lockup (used where only a favicon-grade
 *    mark was available); colour marks read on both themes as-is.
 *  - name only (Brdge cells render this way too), where no verified logo exists.
 *
 * Every cell hovers identically: a subtle content zoom + a background shift.
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

export function PartnersSection({ partners }: PartnersSectionProps) {
  const t = useTranslations('home');

  if (!partners || partners.length === 0) return null;

  const groups = GROUP_ORDER.map((groupKey) => ({
    id: groupKey,
    labelKey: GROUP_LABEL_KEYS[groupKey],
    items: partners.filter((p) => p.groupKey === groupKey),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="bg-transparent px-5 py-16 xl:py-20">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-4">{t('partnersKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-3 max-w-[20ch] text-balance font-sans">
            {t('partnersHeading')}
          </h2>
          <p className="text-muted text-lead max-w-[52ch]">{t('partnersSubtitle')}</p>
        </ScrollReveal>

        <div className="mt-10 flex flex-col gap-10 xl:mt-14">
          {groups.map((group, gi) => (
            <ScrollReveal key={group.id} index={gi}>
              <div>
                {/* Brdge-style group header: mono label + hairline rule to the edge */}
                <div className="mb-5 flex items-center gap-4">
                  <span className="bg-accent/70 h-px w-6 flex-shrink-0" />
                  <span className="text-muted text-eyebrow flex-shrink-0 font-mono font-semibold uppercase tracking-[0.14em]">
                    {t(group.labelKey as 'partnersLiquidity')}
                  </span>
                  <span className="bg-border h-px flex-1 dark:bg-white/[0.08]" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {group.items.map((item, ii) => (
                    <div
                      key={item.id ?? `${item.name}-${ii}`}
                      className="border-border shadow-card group relative flex min-h-[112px] items-center justify-center overflow-hidden rounded-[16px] border bg-white px-5 py-6 transition-colors duration-300 hover:bg-[#EEF3EF] dark:border-white/[0.06] dark:bg-[#14161c] dark:hover:bg-white/[0.05]"
                    >
                      {/* One content wrapper so every cell hovers identically:
                          a subtle content zoom (clipped by the card) + the card's
                          background shift. No white pad — dark-ink wordmarks are
                          inverted to clean white marks in dark instead of boxed. */}
                      <div className="flex flex-col items-center justify-center gap-2.5 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.07]">
                        {item.logoType === 'wordmark' && item.logoFilename ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/images/partners/${item.logoFilename}`}
                            alt={item.name}
                            loading="lazy"
                            className="h-8 w-auto max-w-[150px] object-contain dark:brightness-0 dark:invert xl:h-9"
                          />
                        ) : item.logoType === 'icon' && item.logoFilename ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/images/partners/${item.logoFilename}`}
                              alt=""
                              loading="lazy"
                              className="h-9 w-auto max-w-[70%] object-contain"
                            />
                            <span
                              dir="ltr"
                              className="text-caption text-center font-sans font-semibold tracking-[-0.01em] text-[#2f3a34] dark:text-white/80"
                            >
                              {item.name}
                            </span>
                          </>
                        ) : (
                          <span
                            dir="ltr"
                            className="text-center font-sans text-base font-semibold tracking-[-0.01em] text-[#2f3a34] dark:text-white/80"
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
