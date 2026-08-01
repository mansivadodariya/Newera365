'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { SectionKicker } from '../primitives/SectionKicker';

export type Step = { num: string; title: string; desc: string; meta: string };

/* One glyph per step, drawn in the house hairline stroke. The trend glyph
   stays unflipped in RTL (charts keep their LTR time axis). */
const STEP_GLYPHS = [
  // 01 — register (open the account)
  <path
    key="register"
    d="M10 9.6a3.1 3.1 0 100-6.2 3.1 3.1 0 000 6.2zM3.8 16.6c.9-2.7 3.3-4.1 6.2-4.1M15.2 12.4v4.8M12.8 14.8h4.8"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // 02 — verify (shield + check)
  <path
    key="verify"
    d="M10 2.6l6 2.2v4.4c0 3.7-2.5 6.1-6 7.2-3.5-1.1-6-3.5-6-7.2V4.8l6-2.2zM7.6 9.9l1.7 1.7 3.2-3.4"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // 03 — deposit (fund it)
  <path
    key="deposit"
    d="M3.2 9.4h13.6M4.8 5.8h10.4a1.6 1.6 0 011.6 1.6v7.2a1.6 1.6 0 01-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V7.4a1.6 1.6 0 011.6-1.6zM13.4 12.9h.9"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // 04 — trade
  <path
    key="trade"
    d="M3.2 14.6l4.4-4.4 2.9 2.9 6.3-6.3M12.6 6.8h4.2v4.2"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // 05 — withdraw (down to tray)
  <path
    key="withdraw"
    d="M10 12.4V3.4M6.6 9l3.4 3.4L13.4 9M4 14.2v1.2a1.6 1.6 0 001.6 1.6h8.8a1.6 1.6 0 001.6-1.6v-1.2"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
];

/* One distinct, on-context plate per step (client: images must fit the step and
   not just reuse whatever was already in the repo): a laptop sign-up, a
   biometric identity scan, a card deposit, a live candlestick chart, then a
   payout. All dark cinematic photography, portrait-cropped to sit in the cards
   without heavy zoom. */
const STEP_IMAGES = [
  '/images/register-desk-dark.jpg',
  '/images/verify-dark.jpg',
  '/images/deposit-dark.jpg',
  '/images/tradenewera.jpeg',
  '/images/withdraw-dark.jpg',
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
    const max = 4;
    setTilt(
      `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-3px) scale(1.006)`,
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt(null)}
      style={tilt ? { transform: tilt, transition: 'transform 0.12s ease-out' } : undefined}
      className={`hover:border-accent/70 group relative flex min-h-[380px] min-w-0 flex-1 flex-col justify-end overflow-hidden rounded-[24px] border border-white/[0.08] p-6 shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)] transition-[opacity,transform,border-color,box-shadow] duration-500 [transform-style:preserve-3d] hover:shadow-[0_40px_72px_-24px_rgba(4,16,10,0.72)] xl:min-h-[400px] xl:p-5 ${
        revealActive && !on
          ? 'opacity-0 [transform:translateY(1.5rem)]'
          : 'opacity-100 [transform:none]'
      }`}
    >
      <Image
        src={STEP_IMAGES[i] ?? '/images/hero-terminal-macro.jpg'}
        alt=""
        fill
        sizes="(min-width: 1280px) 384px, (min-width: 768px) 640px, 100vw"
        className="object-cover object-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
      />
      {/* Green-black scrim anchors the text zone; hairline ring gives the plate its glass edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#03130B] via-[#03130B]/85 to-[#03130B]/25 transition-opacity duration-500 group-hover:opacity-95"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/[0.06]"
      />
      {/* Ghost numeral — oversized, bleeding off the top corner */}
      <span
        aria-hidden="true"
        className="text-accent-bright/[0.22] pointer-events-none absolute -top-4 end-3 select-none font-sans text-[96px] font-semibold tabular-nums leading-none tracking-tight"
      >
        {step.num}
      </span>
      {/* Glass glyph tile */}
      <span className="group-hover:border-accent-bright/50 group-hover:bg-accent/[0.20] absolute start-6 top-6 flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/[0.16] bg-white/[0.08] text-white backdrop-blur-md transition-colors duration-500 xl:start-5 xl:top-5">
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {STEP_GLYPHS[i]}
        </svg>
      </span>
      <div className="relative z-10">
        <h3 className="text-title mb-2 font-sans text-[20px] font-bold leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover:text-[#00B050]">
          {step.title}
        </h3>
        <p className="font-body text-[14px] font-medium leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] transition-colors duration-300 group-hover:text-[#00B050]">
          {step.desc}
        </p>
        <span className="text-accent-bright mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-[12px] font-bold tracking-[0.08em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6.4l2.3 2.3L9.5 3.5"
              stroke="currentColor"
              strokeWidth="2"
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
        // Reveal card k exactly when the fill reaches node k. Nodes are spaced
        // across (n-1) intervals, so use (n-1) here — using n revealed each card
        // a fifth early, before the sweep reached its step.
        const count = clamp(Math.floor(pc * (n - 1) + 1e-6) + 1, 1, n);
        setActive((prev) => (prev === count ? prev : count));
      } else {
        // Flow (mobile / tablet / reduced-desktop): a scrollspy on the node
        // centres. A step activates the instant its node rises past the trigger
        // line, so the card reveal + rail fill track the scroll exactly — the old
        // whole-section ratio spanned all five cards, lighting nodes long after
        // the card was reached.
        const nodes = nodeRefs.current;
        const first = nodes[0];
        const last = nodes[n - 1];
        if (!first || !last) return;
        const trigger = vh * 0.72;
        const firstTop = first.getBoundingClientRect().top;
        const lastTop = last.getBoundingClientRect().top;
        setFill(clamp((trigger - firstTop) / (lastTop - firstTop || 1), 0, 1));
        let count = 0;
        for (let i = 0; i < n; i++) {
          const el = nodes[i];
          if (el && el.getBoundingClientRect().top <= trigger) count++;
        }
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
  // Reveal cards in BOTH modes once mounted (flow included), so on mobile a card
  // rises in as the scroll reaches its step instead of sitting there from the
  // start. SSR/no-JS keeps armed=false → every card visible; gating on `geo`
  // means a failed rail measurement also degrades to fully-visible rather than a
  // blank section.
  const revealActive = armed && geo !== null;

  return (
    <section className="bg-transparent px-5 pb-8 pt-10 xl:pb-12 xl:pt-12">
      {/* Runway for the pinned reveal — static content height on mobile,
          reduced motion, and repeat visits. Its height must stay constant for
          the entire page-view (see component doc). */}
      <div ref={wrapRef} className={pinActive ? 'xl:h-[120vh]' : ''}>
        {/* Content-height sticky (NOT h-screen — that padded a huge gap above
            the section pre-pin). The computed top parks it mid-viewport. */}
        <div
          ref={contentRef}
          className={pinActive ? 'xl:sticky' : ''}
          style={pinActive ? { top: stickyTop } : undefined}
        >
          <div className="mx-auto w-full max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-[14px]">{kicker}</SectionKicker>

            <h2 className="text-foreground text-headline mb-8 font-sans">{heading}</h2>

            <ol
              ref={olRef}
              className="relative flex flex-col gap-7 xl:grid xl:grid-cols-5 xl:gap-5"
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
