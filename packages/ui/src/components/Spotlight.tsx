'use client';

import { useRef, type ReactNode } from 'react';

/**
 * Cursor-tracked signal glow for ink surfaces: a soft green radial follows the
 * pointer so the terminal-dark panels answer the hand. One pointermove handler
 * writing two CSS vars; the overlay only appears for hover-capable pointers
 * (desktop), never intercepts events, and adds no layout or motion, so it is
 * reduced-motion and touch safe by construction.
 *
 * Use it AS the panel element: pass the panel's own classes (must include
 * `overflow-hidden` + a radius so the glow clips to the surface).
 */
export function Spotlight({
  className = '',
  children,
  size = 380,
  strength = 0.13,
}: {
  className?: string;
  children: ReactNode;
  /** Glow diameter in px. */
  size?: number;
  /** Peak alpha of the accent-bright glow. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`group/spot relative ${className}`}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
        el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
      }}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(${size}px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(26, 217, 102, ${strength}), transparent 65%)`,
        }}
      />
    </div>
  );
}
