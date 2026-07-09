'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export interface TrustLogo {
  url: string;
  alt: string;
  href?: string | null;
}

interface TrustStripDemoProps {
  logos?: TrustLogo[];
}

/**
 * Social-proof strip — editorial press row, not pill cards: a kicker label and
 * the bare outlet wordmarks sitting directly on the canvas, hairline-framed.
 * Wordmarks render grayscale (dark mode inverts them to white on ink) and only
 * linked ones respond to hover — with opacity, not movement. Driven by the
 * `socialProofLogos` array in site-settings; renders nothing when empty.
 */
export function TrustStripDemo({ logos }: TrustStripDemoProps) {
  const t = useTranslations('home');
  const reduce = useReducedMotion();

  if (!logos || logos.length === 0) return null;

  const mark = (logo: TrustLogo, key: number, decorative = false) => {
    const wordmark = (
      <Image
        src={logo.url}
        alt={decorative ? '' : logo.alt}
        width={150}
        height={36}
        // Eager so the duplicated (off-screen) marquee copy is painted before it
        // scrolls into the window — lazy-loading made logos pop in mid-scroll.
        loading="eager"
        className="max-h-[32px] w-auto object-contain opacity-70 grayscale dark:invert"
      />
    );
    return logo.href ? (
      <a
        key={key}
        href={logo.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={decorative ? -1 : 0}
        className="flex-shrink-0 transition-opacity duration-200 hover:opacity-100 [&:hover>img]:opacity-100 [&>img]:transition-opacity [&>img]:duration-200"
      >
        {wordmark}
      </a>
    ) : (
      <span key={key} className="flex-shrink-0">
        {wordmark}
      </span>
    );
  };

  // Repeat the set so one animated half always exceeds the widest container;
  // otherwise the -50% loop shows an empty gap at the wrap point (the strip
  // "disappeared" between loops on desktop). ~190px is a safe per-wordmark
  // budget (150px cap + gap). Duration scales with content for a constant pace.
  const repeats = Math.max(1, Math.ceil(1300 / (logos.length * 190)));
  const half = Array.from({ length: repeats }, () => logos).flat();
  const durationS = Math.round(half.length * 8.5);

  return (
    <section className="border-border border-y bg-transparent px-5 py-7 xl:py-8">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:flex xl:max-w-[1200px] xl:items-center xl:gap-10">
        {/* Label cell — same kicker voice as every section eyebrow */}
        <div className="xl:border-border mb-6 flex items-center gap-2.5 xl:mb-0 xl:w-[190px] xl:flex-shrink-0 xl:border-e xl:pe-8">
          <span className="bg-accent h-px w-[26px] flex-shrink-0" />
          <span className="text-foreground/80 text-eyebrow font-mono font-semibold uppercase tracking-[0.16em]">
            {t('trustStripLabel')}
          </span>
        </div>

        {/* Wordmark row — a seamless marquee (two copies + a -50% loop with no
            seam, pause on hover, edge-faded, RTL-reversed). Reduced motion gets
            the static wrapping row so no logo is ever hidden behind the scroll. */}
        {reduce ? (
          <div className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-6">
            {logos.map((logo, i) => mark(logo, i))}
          </div>
        ) : (
          <div
            className="group relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
            style={{ '--marquee-duration': `${durationS}s` } as CSSProperties}
          >
            <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] rtl:[animation-direction:reverse]">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center gap-x-12 pe-12"
                >
                  {half.map((logo, i) => mark(logo, i, copy === 1))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
