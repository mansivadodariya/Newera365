'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  /** Convenience stagger: when set (and `delay` is 0) the reveal is delayed by index × 0.06s. */
  index?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  className?: string;
  /** Distance (px) from viewport edge at which trigger fires */
  margin?: string;
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function ScrollReveal({
  children,
  delay = 0,
  index = 0,
  direction = 'up',
  className,
  margin = '-60px',
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  // Reduced motion (and the brief SSR/pre-hydration window): render the content
  // fully visible with no transform. The reveal is a pure enhancement — content
  // must never be trapped at opacity:0 when the animation is skipped.
  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const initial = {
    opacity: 0,
    y: direction === 'up' ? 24 : 0,
    x: direction === 'left' ? 32 : direction === 'right' ? -32 : 0,
  };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin }}
      // Stagger is capped: an item that scrolls into view on its own must not
      // sit invisible for index x 60ms (long lists felt lazy-loaded).
      transition={{ duration: 0.45, delay: delay || Math.min(index, 4) * 0.05, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
