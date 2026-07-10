'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

/**
 * "Two paths" fork band — the funnel hinge that sits after the three-steps rig.
 * Splits the audience into two doors: beginners routed into Education (an
 * ink-art card, the signature dark plate) and veterans routed straight to a
 * live account (a white bordered card with a terminal-ledger proof block). The
 * switch line above the cards is the metaphor made literal: one track forking.
 * Whole cards are the link (big target); no levitation on hover — border and
 * shadow sharpen, the CTA arrow nudges. Numbers come from the client USP deck.
 */
function CtaArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 rtl:-scale-x-100"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TwoPathsSection() {
  const t = useTranslations('twoPaths');
  const locale = useLocale();

  const ledger = [
    { k: t('rowSpreadK'), v: t('rowSpreadV'), hot: true },
    { k: t('rowExecK'), v: t('rowExecV'), hot: false },
    { k: t('rowRouteK'), v: t('rowRouteV'), hot: false },
  ];
  const chips = [t('chipGuides'), t('chipGlossary'), t('chipEbooks'), t('chipWebinars')];

  return (
    <section className="bg-transparent px-5 py-12 xl:py-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-4">{t('kicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-3 max-w-[16ch] text-balance font-sans">
            {t('headline')}
          </h2>
          <p className="text-muted text-lead max-w-[46ch]">{t('subtitle')}</p>
        </ScrollReveal>

        <div className="relative mt-12 xl:mt-16">
          {/* Switch line — one track forking into the two cards (desktop only).
              Centered with inset-x-0 + mx-auto (NOT start-1/2 + -translate-x-1/2:
              the logical start swaps sides in RTL but translateX is physical, so
              in RTL the 680px SVG was flung off the left edge and created a
              horizontal page overflow). inset-x-0 + mx-auto is symmetric. */}
          <svg
            className="pointer-events-none absolute inset-x-0 top-[-30px] mx-auto hidden h-[46px] w-[min(680px,90%)] overflow-visible xl:block"
            viewBox="0 0 680 46"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <circle cx="340" cy="4" r="4" className="fill-accent" />
            <path
              d="M340 6 L340 20 Q340 40 300 42 L172 44"
              className="stroke-accent fill-none opacity-50 [stroke-width:1.5]"
            />
            <path
              d="M340 6 L340 20 Q340 40 380 42 L508 44"
              className="stroke-accent fill-none opacity-50 [stroke-width:1.5]"
            />
          </svg>

          <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
            {/* ── Education path: ink-art card ────────────────────────────── */}
            <ScrollReveal index={0}>
              <Link
                href={`/${locale}/education`}
                className="hover:border-accent/45 group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[22px] border border-white/[0.08] p-7 shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)] ring-1 ring-inset ring-white/[0.06] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[0_38px_72px_-24px_rgba(4,16,10,0.8)] motion-safe:hover:-translate-y-1.5"
                style={{
                  backgroundColor: '#0A130E',
                  backgroundImage:
                    'radial-gradient(ellipse 120% 80% at 20% -10%, rgba(0,176,80,0.18), transparent 60%)',
                }}
              >
                {/* Glow grows on hover — the ink card's signature response. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      'radial-gradient(ellipse 120% 80% at 20% -10%, rgba(0,176,80,0.32), transparent 62%)',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 end-3 select-none font-sans text-[104px] font-bold leading-none tracking-[-0.04em] text-white/[0.055] xl:text-[128px]"
                >
                  01
                </span>
                <span className="mb-5 grid h-[46px] w-[46px] place-items-center rounded-[14px] border border-white/[0.16] bg-white/[0.08]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 7l9-4 9 4-9 4-9-4z" />
                    <path d="M7 9v5c0 1.1 2.2 2 5 2s5-.9 5-2V9" />
                  </svg>
                </span>
                <span className="text-accent-bright font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {t('eduEyebrow')}
                </span>
                <h3 className="text-title mt-3 font-sans text-white">{t('eduTitle')}</h3>
                <p className="text-body mt-3 max-w-[34ch] text-white/[0.72]">{t('eduBody')}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-white/[0.14] bg-white/[0.09] px-[11px] py-1.5 font-mono text-[11px] tracking-[0.04em] text-white/[0.86] backdrop-blur"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <span className="text-accent-bright mt-auto inline-flex items-center gap-2.5 pt-7 font-mono text-[13px] font-semibold">
                  {t('eduCta')}
                  <CtaArrow />
                </span>
              </Link>
            </ScrollReveal>

            {/* ── Trade path: ink-art card + terminal ledger ──────────────── */}
            <ScrollReveal index={1}>
              <Link
                href={`/${locale}/trade/accounts`}
                className="hover:border-accent/45 group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[22px] border border-white/[0.08] p-7 shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)] ring-1 ring-inset ring-white/[0.06] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[0_38px_72px_-24px_rgba(4,16,10,0.8)] motion-safe:hover:-translate-y-1.5"
                style={{
                  backgroundColor: '#0A130E',
                  backgroundImage:
                    'radial-gradient(ellipse 120% 80% at 20% -10%, rgba(0,176,80,0.18), transparent 60%)',
                }}
              >
                {/* Glow grows on hover — the ink card's signature response. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      'radial-gradient(ellipse 120% 80% at 20% -10%, rgba(0,176,80,0.32), transparent 62%)',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 end-3 select-none font-sans text-[104px] font-bold leading-none tracking-[-0.04em] text-white/[0.055] xl:text-[128px]"
                >
                  02
                </span>
                <span className="mb-5 grid h-[46px] w-[46px] place-items-center rounded-[14px] border border-white/[0.16] bg-white/[0.08]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 17l5-5 4 3 6-7" />
                    <path d="M18 8h3v3" />
                  </svg>
                </span>
                <span className="text-accent-bright font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {t('tradeEyebrow')}
                </span>
                <h3 className="text-title mt-3 font-sans text-white">{t('tradeTitle')}</h3>
                <p className="text-body mt-3 max-w-[34ch] text-white/[0.72]">{t('tradeBody')}</p>
                <div className="mt-5 flex flex-col">
                  {ledger.map((row) => (
                    <div
                      key={row.k}
                      className="flex items-baseline justify-between border-b border-white/[0.08] py-[9px] text-[13px] last:border-b-0"
                    >
                      <span className="text-white/[0.55]">{row.k}</span>
                      <span
                        dir="ltr"
                        className={`font-mono font-semibold tabular-nums ${row.hot ? 'text-accent-bright' : 'text-white'}`}
                      >
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-accent-bright mt-auto inline-flex items-center gap-2.5 pt-7 font-mono text-[13px] font-semibold">
                  {t('tradeCta')}
                  <CtaArrow />
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
