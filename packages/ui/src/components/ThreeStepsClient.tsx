'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { SectionKicker } from './SectionKicker';

export type Step = { num: string; title: string; desc: string; meta: string };

/* One glyph per step, drawn in the house hairline stroke. The trend glyph
   stays unflipped in RTL (charts keep their LTR time axis). */
const STEP_GLYPHS = [
  // 01 — open the account
  <path
    key="account"
    d="M10 9.6a3.1 3.1 0 100-6.2 3.1 3.1 0 000 6.2zM3.8 16.6c.9-2.7 3.3-4.1 6.2-4.1M15.2 12.4v4.8M12.8 14.8h4.8"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // 02 — fund it
  <path
    key="fund"
    d="M3.2 9.4h13.6M4.8 5.8h10.4a1.6 1.6 0 011.6 1.6v7.2a1.6 1.6 0 01-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V7.4a1.6 1.6 0 011.6-1.6zM13.4 12.9h.9"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // 03 — trade
  <path
    key="trade"
    d="M3.2 14.6l4.4-4.4 2.9 2.9 6.3-6.3M12.6 6.8h4.2v4.2"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
];

/* One distinct plate per step (client asked for relevant, per-step imagery,
   replacing the single sliced silk artwork): open the account on the terminal,
   fund it, then trade the markets. All dark cinematic house art. */
const STEP_IMAGES = [
  '/images/hero-terminal-macro.jpg',
  '/images/fund-dark.jpg',
  '/images/market-forex-dark.jpg',
];

type Geo = {
  x: number;
  y: number;
  len: number;
  horizontal: boolean;
  originEnd: boolean;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * One step card with a pointer-tracked 3D tilt on hover (client request). The
 * tilt is an inline transform that only takes over once the card is revealed —
 * during the scroll-coupled reveal the className transform drives the slide-in,
 * so the two never fight. Touch / coarse pointers and reduced-motion are
 * skipped; on mouse-leave the inline transform is dropped and the 500ms class
 * transition settles the card flat again.
 */
function StepCard({
  step,
  i,
  on,
  revealActive,
}: {
  step: Step;
  i: number;
  on: boolean;
  revealActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<string | null>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (revealActive && !on) return; // don't fight the reveal slide-in
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    }
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const max = 7;
    setTilt(
      `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-6px) scale(1.015)`,
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt(null)}
      style={tilt ? { transform: tilt, transition: 'transform 0.12s ease-out' } : undefined}
      className={`group relative flex min-h-[400px] min-w-0 flex-1 flex-col justify-end overflow-hidden rounded-[24px] border p-6 shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)] transition-[opacity,transform,border-color,box-shadow] duration-500 [transform-style:preserve-3d] hover:border-accent/70 hover:shadow-[0_40px_72px_-24px_rgba(4,16,10,0.72)] xl:min-h-[460px] xl:p-7 ${
        on ? 'border-accent/45' : 'border-white/[0.08]'
      } ${
        revealActive && !on
          ? 'opacity-0 [transform:translateX(2rem)_translateZ(-2.5rem)_rotateY(8deg)] rtl:[transform:translateX(-2rem)_translateZ(-2.5rem)_rotateY(-8deg)]'
          : 'opacity-100 [transform:none]'
      }`}
    >
      <Image
        src={STEP_IMAGES[i] ?? '/images/hero-terminal-macro.jpg'}
        alt=""
        fill
        sizes="(min-width: 1280px) 384px, (min-width: 768px) 640px, 100vw"
        className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
      />
      {/* Green-black scrim anchors the text zone; hairline ring gives the plate
          its glass edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.92] via-[#03130B]/[0.38] to-[#03130B]/[0.12] transition-opacity duration-500 group-hover:opacity-[0.78]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/[0.06]"
      />
      {/* Ghost numeral — oversized, bleeding off the top corner */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 end-3 select-none font-sans text-[96px] font-semibold leading-none tracking-[-0.04em] text-white/[0.08]"
      >
        {step.num}
      </span>
      {/* Glass glyph tile */}
      <span className="group-hover:border-white/[0.3] group-hover:bg-white/[0.16] absolute start-6 top-6 flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/[0.16] bg-white/[0.08] text-white backdrop-blur-md transition-colors duration-500 xl:start-7 xl:top-7">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {STEP_GLYPHS[i]}
        </svg>
      </span>
      <div className="relative">
        <h3 className="mb-2 font-sans text-[22px] font-semibold leading-snug text-white">
          {step.title}
        </h3>
        <p className="font-body text-body text-white/[0.72]">{step.desc}</p>
        <span className="border-white/[0.14] bg-white/[0.09] text-accent-bright mt-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] backdrop-blur-sm">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6.4l2.3 2.3L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span dir="ltr">{step.meta}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Interactive "three steps" stepper.
 *
 * Desktop (≥1280px, motion allowed): a scroll-coupled pinned reveal. The
 * section sits in a 170vh runway; the content itself is `position: sticky` with
 * a computed top offset that parks it mid-viewport, so BEFORE the pin there is
 * no extra whitespace — the section flows in naturally, then holds while scroll
 * progress sweeps the rail sideways revealing each step card. The reveal is
 * fully reversible and tied to scroll position: scroll back up and the cards
 * slide out again, so it replays on every pass (not a one-shot).
 *
 * CRITICAL: the runway must NEVER change height while the user is on the page
 * (a mid-interaction collapse deletes page height under live wheel momentum
 * and catapults the viewport into a later section — shipped bug, 2026-07-06).
 * The runway is applied once on mount (`armed`) and stays for the whole
 * page-view — nothing ever tears it down mid-interaction.
 *
 * Mobile / tablet / prefers-reduced-motion: the classic scroll-coupled rail
 * fill, no pinning, cards always visible.
 */
export function ThreeStepsClient({
  kicker,
  heading,
  steps,
}: {
  kicker: string;
  heading: string;
  steps: Step[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const olRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(0);
  // 'flow' = classic scroll-coupled behaviour; 'pinned' = one-way reveal.
  // SSR renders 'flow' (fully visible, no runway) so no-JS/SEO get the whole
  // section; the mode settles on mount, long before the fold reaches it.
  const [mode, setMode] = useState<'flow' | 'pinned'>('flow');
  // Runway + sticky mount once armed (on mount) and stay for the whole
  // page-view — the runway height must never change mid-interaction (see the
  // height-collapse warning above).
  const [armed, setArmed] = useState(false);
  // Sticky offset that parks the pinned content mid-viewport (px).
  const [stickyTop, setStickyTop] = useState(96);

  // Decide the mode on mount + when the environment changes.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1280px)');
    setArmed(true);
    const decide = () => {
      setMode(!reduce.matches && desktop.matches ? 'pinned' : 'flow');
    };
    decide();
    reduce.addEventListener('change', decide);
    desktop.addEventListener('change', decide);
    return () => {
      reduce.removeEventListener('change', decide);
      desktop.removeEventListener('change', decide);
    };
  }, []);

  // Park the pinned content mid-viewport: top = (vh - contentH) / 2.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const compute = () => {
      const vh = window.innerHeight || 800;
      setStickyTop(Math.round(clamp((vh - content.offsetHeight) / 2, 24, 200)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(content);
    return () => ro.disconnect();
  }, [mode]);

  // Measure node centres → rail geometry (unchanged from the classic stepper).
  useEffect(() => {
    const ol = olRef.current;
    if (!ol) return;
    const measure = () => {
      const nodes = nodeRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (nodes.length < 2) return;
      const base = ol.getBoundingClientRect();
      const centers = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
      });
      const first = centers[0]!;
      const last = centers[centers.length - 1]!;
      const dx = last.x - first.x;
      const dy = last.y - first.y;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      setGeo(
        horizontal
          ? {
              x: Math.min(first.x, last.x),
              y: first.y,
              len: Math.abs(dx),
              horizontal: true,
              originEnd: dx < 0,
            }
          : {
              x: first.x,
              y: Math.min(first.y, last.y),
              len: Math.abs(dy),
              horizontal: false,
              originEnd: dy < 0,
            },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [steps.length, mode]);

  // Couple fill + active count to scroll.
  useEffect(() => {
    const ol = olRef.current;
    if (!ol || !geo) return;
    const setFill = (p: number) => {
      if (fillRef.current)
        fillRef.current.style.transform = geo.horizontal ? `scaleX(${p})` : `scaleY(${p})`;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFill(1);
      setActive(steps.length);
      return;
    }

    let vh = window.innerHeight || 800;
    let vw = window.innerWidth;
    let raf = 0;
    const n = steps.length;

    const update = () => {
      raf = 0;
      if (mode === 'pinned') {
        const wrap = wrapRef.current;
        const content = contentRef.current;
        if (!wrap || !content) return;
        const rect = wrap.getBoundingClientRect();
        // Scroll distance the content stays pinned for (sticky travel).
        const travel = wrap.offsetHeight - content.offsetHeight;
        if (travel <= 0) return; // runway not applied yet — skip this frame
        const p = (stickyTop - rect.top) / travel;
        const pc = clamp(p, 0, 1);
        setFill(pc);
        // Card i reveals as the sweep passes its share; step 1 anchors at p=0.
        const count = clamp(Math.floor(pc * n) + 1, 1, n);
        setActive((prev) => (prev === count ? prev : count));
      } else {
        // Classic behaviour: fill spans the section's pass through the lower
        // half of the viewport.
        const rect = ol.getBoundingClientRect();
        const center = vh * 0.5;
        const p = clamp((vh - rect.top) / (rect.height + (vh - center)), 0, 1);
        setFill(p);
        const count =
          p <= 0 ? 0 : steps.reduce((acc, _s, i) => (p >= i / (n - 1) ? i + 1 : acc), 0);
        setActive((prev) => (prev === count ? prev : count));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      if (window.innerWidth === vw) return; // height-only (mobile address bar)
      vw = window.innerWidth;
      vh = window.innerHeight || 800;
      schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, steps, mode, stickyTop]);

  const railStyle = geo
    ? {
        left: geo.horizontal ? geo.x : geo.x - 1.5,
        top: geo.horizontal ? geo.y - 1.5 : geo.y,
        width: geo.horizontal ? geo.len : 3,
        height: geo.horizontal ? 3 : geo.len,
      }
    : undefined;

  // Runway + sticky live for the whole armed page-view (height stability).
  // The reveal is scroll-coupled both ways — cards hide/show as `active`
  // tracks scroll, so it replays on every pass.
  const pinActive = mode === 'pinned' && armed;
  const revealActive = pinActive;

  return (
    <section className="bg-transparent px-5 pb-9 pt-12 xl:pb-16 xl:pt-14">
      {/* Runway for the pinned reveal — static content height on mobile,
          reduced motion, and repeat visits. Its height must stay constant for
          the entire page-view (see component doc). */}
      <div ref={wrapRef} className={pinActive ? 'xl:h-[170vh]' : ''}>
        {/* Content-height sticky (NOT h-screen — that padded a huge gap above
            the section pre-pin). The computed top parks it mid-viewport. */}
        <div
          ref={contentRef}
          className={pinActive ? 'xl:sticky' : ''}
          style={pinActive ? { top: stickyTop } : undefined}
        >
          <div className="mx-auto w-full max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="text-foreground [&>span:first-child]:bg-accent mb-[14px]">
              {kicker}
            </SectionKicker>

            <h2 className="text-foreground text-headline mb-8 font-sans">{heading}</h2>

            <ol
              ref={olRef}
              className="relative flex flex-col gap-7 xl:grid xl:grid-cols-3 xl:gap-6"
            >
              {/* Rail track + scroll-coupled fill */}
              {geo && (
                <>
                  <span
                    aria-hidden="true"
                    className="bg-border pointer-events-none absolute rounded-full"
                    style={railStyle}
                  />
                  <span
                    ref={fillRef}
                    aria-hidden="true"
                    className="bg-accent pointer-events-none absolute rounded-full"
                    style={{
                      ...railStyle,
                      transform: geo.horizontal ? 'scaleX(0)' : 'scaleY(0)',
                      transformOrigin: geo.horizontal
                        ? geo.originEnd
                          ? 'right'
                          : 'left'
                        : geo.originEnd
                          ? 'bottom'
                          : 'top',
                      transition: 'transform 0.18s linear',
                    }}
                  />
                </>
              )}

              {steps.map((step, i) => {
                const on = i < active;
                return (
                  <li
                    key={step.num}
                    className="relative flex gap-5 xl:flex-col xl:gap-6 xl:[perspective:1200px]"
                  >
                    <span
                      ref={(el) => {
                        nodeRefs.current[i] = el;
                      }}
                      className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-sans text-[17px] font-semibold transition-all duration-500 ${
                        on
                          ? 'bg-accent text-white shadow-[0_0_0_6px_rgba(0,176,80,0.14)]'
                          : 'bg-accent/10 text-accent'
                      }`}
                    >
                      {step.num}
                    </span>
                    {/* Step card, an ink art card. Each step now carries its
                        own relevant plate (open on the terminal, fund, trade),
                        replacing the single sliced silk artwork. During the
                        pinned reveal the card slides in from the inline side as
                        the rail reaches its node. Hover zooms the plate and
                        deepens the shadow (a client-approved override of the
                        no-zoom card rule). */}
                    <StepCard step={step} i={i} on={on} revealActive={revealActive} />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
