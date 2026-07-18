'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionKicker } from '../primitives/SectionKicker';

export type Milestone = { year: string; label: string; desc: string };

type Geo = {
  x: number; // rail centre x relative to the <ol>
  top: number; // rail top y (first node centre) relative to the <ol>
  len: number; // rail length (first → last node centre)
  fractions: number[]; // each node's fractional position along the rail [0..1]
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// A node activates as its centre crosses this line down the viewport (0.5 = dead
// centre; 0.6 fires just before centre, as nodes rise into view). The rail
// fill's leading edge is pinned to the same line.
const ACTIVATE_LINE = 0.6;

/**
 * Vertical "journey" timeline using the same scroll-coupled animation as the
 * landing page's three-step stepper (ThreeStepsClient): a rail whose accent
 * fill grows as the section scrolls through the viewport, lighting each
 * milestone node as the fill reaches it. Because nodes are unevenly spaced
 * here, each node's fractional position is measured so the lighting stays in
 * sync with the visible fill.
 *
 * Driven by the scroll event + rAF — the fill transform is mutated via a ref
 * (no per-frame React render); only the discrete lit-node count is state. Under
 * `prefers-reduced-motion` everything is shown filled with no scroll coupling.
 */
export function JourneyTimeline({
  kicker,
  heading,
  milestones,
}: {
  kicker: string;
  heading: string;
  milestones: Milestone[];
}) {
  const olRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(0);

  // Measure node centres → vertical rail geometry. Re-measures via a
  // ResizeObserver on the list (font reflow, content, orientation) rather than
  // window 'resize', so the mobile address bar show/hide — a height-only window
  // resize that doesn't change the <ol> — never churns the geometry.
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
      const len = last.y - first.y;
      setGeo({
        x: first.x,
        top: first.y,
        len,
        fractions: centers.map((c) => (len > 0 ? (c.y - first.y) / len : 0)),
      });
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
  }, [milestones.length]);

  // Couple the fill + lit-node count to scroll progress through the section.
  useEffect(() => {
    const ol = olRef.current;
    if (!ol || !geo) return;
    const setFill = (p: number) => {
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFill(1);
      setActive(milestones.length);
      return;
    }
    // Cache the viewport height; refresh only on WIDTH change (orientation /
    // desktop resize). Reading window.innerHeight live made the fill jitter on
    // mobile, where the address bar show/hide changes the height continuously
    // during a scroll.
    let vh = window.innerHeight || 800;
    let vw = window.innerWidth;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = vh * ACTIVATE_LINE;
      // Raw progress = how far the activation line has travelled down the rail.
      // Pinning the fill's leading edge to `line` means each node lights exactly
      // as its centre reaches the viewport centre (not when the section scrolls
      // out the top).
      const railTopVp = ol.getBoundingClientRect().top + geo.top;
      const pr = geo.len > 0 ? (line - railTopVp) / geo.len : 1;
      setFill(clamp(pr, 0, 1));
      const count = geo.fractions.reduce((acc, f) => (pr >= f - 0.0001 ? acc + 1 : acc), 0);
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
  }, [geo, milestones]);

  const railStyle = geo ? { left: geo.x - 1, top: geo.top, width: 2, height: geo.len } : undefined;

  return (
    <section className="rounded-t-[32px] px-5 pb-10 pt-10 xl:pb-16 xl:pt-16">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-4">{kicker}</SectionKicker>
        <h2 className="text-foreground text-headline mb-8 font-sans">{heading}</h2>

        <ol ref={olRef} className="relative flex flex-col">
          {/* Rail track + scroll-coupled accent fill (rendered once geometry is known) */}
          {geo && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full bg-[#e5e7eb] dark:bg-white/[0.07]"
                style={railStyle}
              />
              <span
                ref={fillRef}
                aria-hidden="true"
                className="bg-accent pointer-events-none absolute rounded-full"
                style={{
                  ...railStyle,
                  transformOrigin: 'top',
                  transform: 'scaleY(0)',
                  transition: 'transform 0.18s linear',
                }}
              />
            </>
          )}

          {milestones.map((m, i) => {
            const on = i < active;
            return (
              <li key={m.year} className="flex gap-[18px] pb-[22px]">
                {/* Node — lights up as the fill reaches it */}
                <div className="flex flex-col items-center">
                  <span
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    className={`relative z-10 mt-1 h-[22px] w-[22px] flex-shrink-0 rounded-full border-2 transition-all duration-500 ${
                      on
                        ? 'border-accent bg-accent shadow-[0_0_0_5px_rgba(0,176,80,0.14)]'
                        : 'border-[#e5e7eb] bg-white dark:border-white/[0.12] dark:bg-[#111316]'
                    }`}
                  />
                </div>
                {/* Content */}
                <div className="flex-1">
                  <span className="text-accent font-mono text-[11px] font-bold tracking-[1.32px]">
                    {m.year}
                  </span>
                  <p className="text-foreground font-sans text-[17px] font-semibold leading-normal">
                    {m.label}
                  </p>
                  <p className="font-body text-muted mt-1 text-[13px] leading-[1.55]">{m.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
