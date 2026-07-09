'use client';

import { HeroTerminal } from './HeroTerminal';

/* ─── HeroMarketPanel ────────────────────────────────────────────────────
   The hero's market visual. Now a fully code-built terminal (HeroTerminal):
   SVG candles + ticking quote rail on the ink surface. The previous static
   4K PNG render (and its three TradingView single-quote iframes) is gone —
   client feedback: the image never landed, and the iframes cost ~3 network
   round-trips on the critical path. */
export function HeroMarketPanel() {
  return (
    <div className="relative -mx-1 md:mx-0">
      <HeroTerminal />
    </div>
  );
}
