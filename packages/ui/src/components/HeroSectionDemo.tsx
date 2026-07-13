'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';

/* ─── HeroSectionDemo ───────────────────────────────────────────────────
   Ink-plate hero (client art drop, 2026-07-13): the whole section rides on a
   full-bleed signal-peak artwork (hero-signal-peak.jpg — glowing price apex +
   faint candles, atmosphere not UI) and the orbit-globe artwork
   (hero-globe-orbit.png) holds the end column. The section is an ink band in
   BOTH themes now — type is white with the accent-bright payoff line — and it
   lands into the Edge ink band below via a gradient seam into var(--ink).

   The standing rule holds: no fake terminal/chart UI in the hero, ever. Both
   plates are brand art, not simulated interfaces. Earlier treatments (typo-
   graphic hero over the aurora mesh, signal-sky photo plate) are retired. */
export function HeroSectionDemo() {
  const t = useTranslations('home');
  const td = useTranslations('demo');
  const locale = useLocale();
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const globeRef = useRef<HTMLDivElement>(null);

  // Slow circular drift on the globe art (client ask 2026-07-13): the artwork
  // translates along a small circle. Translation only, never rotation — the
  // asset tiles on the flat PNG would tip over. House gsap idiom (see
  // ArbitrageSection): reduced-motion early return, dynamic import so the
  // chunk stays out of the critical path, tween killed on unmount. The tween
  // targets a layer NESTED inside the rise-in wrapper — rise-in animates
  // `transform` too, and CSS animations beat inline styles, so sharing one
  // element would freeze then jump the drift during the entrance.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let killed = false;
    let tween: { kill: () => void } | undefined;
    import('gsap').then(({ gsap }) => {
      const el = globeRef.current;
      if (killed || !el) return;
      const proxy = { a: 0 };
      const r = 14;
      tween = gsap.to(proxy, {
        a: Math.PI * 2,
        duration: 16,
        ease: 'none',
        repeat: -1,
        onUpdate() {
          // Starts at (0,0) so there is no jump when the tween takes over.
          gsap.set(el, { x: r * (Math.cos(proxy.a) - 1), y: r * Math.sin(proxy.a) });
        },
      });
    });
    return () => {
      killed = true;
      tween?.kill();
    };
  }, []);

  // Entrance animation is CSS-driven (motion-safe:animate-rise-in + a staggered
  // animationDelay per element). This MUST stay visible-by-default: an earlier
  // version set inline `opacity: 0` and revealed it via a reduced-motion-gated
  // GSAP effect, which left the whole hero invisible for users with "reduce
  // motion" enabled (and if the gsap chunk failed to load). Never re-introduce
  // a base opacity:0 here without a no-JS/reduced-motion fallback.
  const RISE = 'motion-safe:animate-rise-in';

  const specs = [
    { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
    { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
    { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
  ];

  // Headline split into words for a staggered reveal on load. Each word carries
  // motion-safe:animate-rise-in with an incremental delay; reduced motion leaves
  // them plain-visible (never a base opacity:0 — see the note above).
  // Triadic hero (client taste 2026-07-13): each i18n slot is its own line so
  // the "Trade smarter. / Trade faster. / Trade without limits." rhythm reads as
  // three, with the aspirational payoff (heroPremium) carrying the accent as the
  // last line. `i` is a running index across all words so the load stagger keeps
  // flowing line to line. Empty slots drop out, so a two-line hero still works.
  let wordCount = 0;
  const headlineLines = [
    { text: t('heroLine1'), premium: false },
    { text: t('heroLine2'), premium: false },
    { text: t('heroPremium'), premium: true },
  ]
    .filter((l) => l.text.trim().length > 0)
    .map((l) => ({
      premium: l.premium,
      words: l.text
        .split(' ')
        .filter(Boolean)
        .map((text) => ({ text, i: wordCount++ })),
    }));

  return (
    <>
      <section className="relative overflow-hidden bg-[#050B07] px-5 pb-16 pt-24 md:pt-28 xl:pb-20 xl:pt-32">
        {/* Signal-peak plate — full-bleed ink artwork in both themes. A soft
            uniform veil keeps the type crisp over the glow (same move as the
            retired photo plate's opacity-[0.82]), an xl-only start-side scrim
            deepens the text column (flipped for RTL), and a bottom seam lands
            the section into the Edge ink band directly below. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          <Image
            src="/images/hero-signal-peak.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#020704]/[0.72] via-[#020704]/[0.28] to-transparent xl:block rtl:bg-gradient-to-l" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--ink)]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 xl:grid-cols-[minmax(0,1fr)_540px] xl:gap-8">
          <div className="flex flex-col items-center text-center xl:items-start xl:text-start">
            {/* Eyebrow */}
            <div className={`flex items-center gap-2 ${RISE}`} style={{ animationDelay: '80ms' }}>
              <span className="bg-accent-bright block h-px w-[18px] flex-shrink-0" />
              <span className="text-accent-bright text-eyebrow font-mono font-medium uppercase">
                {td('heroEyebrow')}
              </span>
              <span className="bg-accent-bright block h-px w-[18px] flex-shrink-0" />
            </div>

            <h1 className="text-display mt-6 max-w-[900px] font-sans text-white">
              {headlineLines.map((line, li) => (
                <span key={li} className="block">
                  {line.words.map((w) => (
                    <span
                      key={w.i}
                      className={`${RISE} me-[0.22em] inline-block ${line.premium ? 'text-accent-bright' : ''}`}
                      style={{ animationDelay: `${180 + w.i * 55}ms` }}
                    >
                      {w.text}
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <p
              className={`font-body text-lead mt-5 max-w-[620px] text-white/[0.78] ${RISE}`}
              style={{ animationDelay: '320ms' }}
            >
              {t('heroSubtitle')}
            </p>

            <div
              className={`mt-8 flex flex-wrap items-center justify-center gap-3 xl:justify-start ${RISE}`}
              style={{ animationDelay: '440ms' }}
            >
              {/* Primary CTA — deliberately the dominant element on the page:
                  larger, brighter green gradient + glow, presses on click. */}
              <button
                onClick={() => setAuthModal('register')}
                data-primary-cta="hero"
                className="font-body from-accent to-accent-bright inline-flex flex-none items-center gap-2 rounded-full bg-gradient-to-r px-8 py-[18px] text-[16px] font-semibold tracking-[-0.075px] text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] active:scale-[0.98]"
              >
                {t('heroCTALive')}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="rtl:-scale-x-100"
                >
                  <path
                    d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Secondary — clearly subordinate to the primary CTA. */}
              <button
                onClick={() => setAuthModal('demo')}
                className="font-body hover:border-accent-bright hover:text-accent-bright inline-flex flex-none items-center rounded-full border border-white/[0.22] bg-white/[0.06] px-[22px] py-[18px] text-[15px] font-medium tracking-[-0.075px] text-white backdrop-blur-sm transition-colors"
              >
                {t('heroCTADemo')}
              </button>
              {/* Tertiary — quiet text link, no visual weight. */}
              <Link
                href={`/${locale}/support`}
                className="font-body hover:text-accent-bright inline-flex flex-none items-center gap-1 px-2 py-[18px] text-[14px] font-medium text-white/[0.66] transition-colors"
              >
                {t('heroCTAContact')}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="rtl:-scale-x-100"
                >
                  <path
                    d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* Edge bar — the three headline claims in the house hairline lattice,
                on ink glass. Same voice as the Why-band quadrants below. */}
            <div
              className={`mt-10 inline-flex max-w-full flex-col overflow-hidden rounded-[18px] border border-white/[0.14] bg-white/[0.05] backdrop-blur-sm sm:flex-row ${RISE}`}
              style={{ animationDelay: '560ms' }}
            >
              {specs.map((spec, i) => (
                <span
                  key={spec.value}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 ${
                    i > 0 ? 'border-t border-white/[0.14] sm:border-s sm:border-t-0' : ''
                  }`}
                >
                  <span className="bg-accent/[0.22] text-accent-bright flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px]">
                    {spec.label}
                  </span>
                  <span className="whitespace-nowrap font-sans text-[14px] font-semibold text-white">
                    {spec.value}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Orbit globe — brand artwork on the end column (under the copy on
              mobile), nudged toward the page edge on xl (logical: flips in
              RTL). Decorative: empty alt. The signal glow rides inside the
              gsap layer so it drifts with the globe. Layering: static offset
              wrapper → rise-in entrance → gsap circular drift (transforms on
              separate elements so they compose instead of fighting). */}
          <div className="relative mx-auto w-[min(78vw,380px)] xl:w-full xl:translate-x-10 xl:rtl:-translate-x-10">
            <div className={RISE} style={{ animationDelay: '380ms' }}>
              <div ref={globeRef} className="relative will-change-transform">
                <div
                  aria-hidden="true"
                  className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgba(0,176,80,0.22),transparent_66%)]"
                />
                <Image
                  src="/images/hero-globe-orbit.png"
                  alt=""
                  width={1062}
                  height={997}
                  priority
                  sizes="(min-width: 1280px) 540px, min(78vw, 380px)"
                  className="relative h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
