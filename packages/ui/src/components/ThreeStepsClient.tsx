'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionKicker } from './SectionKicker';

export type Step = { num: string; title: string; desc: string };

type Geo = {
  x: number;
  y: number;
  len: number;
  horizontal: boolean;
  originEnd: boolean;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Interactive "three steps" stepper (DEMO).
 *
 * The numbered nodes are connected by a single rail whose accent fill grows as
 * the section scrolls through the viewport, and each node lights up as the fill
 * reaches it. The rail measures the node centres on mount/resize, so the same
 * code renders a vertical stepper on mobile and a horizontal one on desktop —
 * and it honours RTL (the fill originates from the first node either way).
 *
 * Scroll updates mutate the fill transform via a ref (no per-frame React
 * render); only the discrete active-step count is React state. Under
 * `prefers-reduced-motion` everything is shown filled with no scroll coupling.
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
  const olRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(0);

  // Measure node centres → rail geometry. Re-measures when the list's own box
  // changes (font reflow, content, orientation / breakpoint flip) via a
  // ResizeObserver — deliberately NOT on window 'resize', because on mobile the
  // address bar show/hide fires constant height-only resizes that must not churn
  // the geometry.
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
    // Late web-font load can reflow node spacing after the first measure.
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [steps.length]);

  // Couple the fill + active node count to scroll progress through the section.
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
    // Cache the viewport height; refresh it only when the WIDTH changes
    // (orientation / desktop resize). Reading window.innerHeight live made the
    // fill jitter on mobile, where the address bar show/hide changes the height
    // continuously during a scroll.
    let vh = window.innerHeight || 800;
    let vw = window.innerWidth;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = ol.getBoundingClientRect();
      // Fill progress spans the stepper's whole pass through the lower half of
      // the viewport (client feedback round 3, #5 — the old centre-crossing
      // window started late and finished early): p=0 the moment the stepper's
      // top enters the viewport (still fully below the page midpoint), p=1 when
      // its bottom edge rises above the midpoint.
      const center = vh * 0.5;
      const p = clamp((vh - rect.top) / (rect.height + (vh - center)), 0, 1);
      setFill(p);
      const n = steps.length;
      // Each node lights as the fill reaches it; the first lights only once the
      // fill has actually begun (p > 0), so nothing is pre-activated above centre.
      const count = p <= 0 ? 0 : steps.reduce((acc, _s, i) => (p >= i / (n - 1) ? i + 1 : acc), 0);
      setActive((prev) => (prev === count ? prev : count));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      if (window.innerWidth === vw) return; // height-only (mobile address bar) → ignore
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
  }, [geo, steps]);

  const railStyle = geo
    ? {
        left: geo.horizontal ? geo.x : geo.x - 1.5,
        top: geo.horizontal ? geo.y - 1.5 : geo.y,
        width: geo.horizontal ? geo.len : 3,
        height: geo.horizontal ? 3 : geo.len,
      }
    : undefined;

  return (
    <section className="bg-transparent px-5 pb-9 pt-12 xl:pb-16 xl:pt-14">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-foreground [&>span:first-child]:bg-accent mb-[14px]">
          {kicker}
        </SectionKicker>

        <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[38px]">
          {heading}
        </h2>

        <ol ref={olRef} className="relative flex flex-col gap-7 xl:grid xl:grid-cols-3 xl:gap-6">
          {/* Rail track + scroll-coupled fill (rendered once geometry is known) */}
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
              <li key={step.num} className="relative flex gap-4 xl:flex-col xl:gap-5">
                <span
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-sans text-[18px] font-semibold transition-all duration-500 ${
                    on
                      ? 'bg-accent text-white shadow-[0_0_0_6px_rgba(0,176,80,0.14)]'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {step.num}
                </span>
                <div className="xl:pt-1">
                  <h3 className="text-foreground mb-2 font-sans text-[17px] font-semibold leading-normal">
                    {step.title}
                  </h3>
                  <p className="font-body text-[13px] leading-[1.55] text-[#6B7280] dark:text-[#B8BFCC]">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
