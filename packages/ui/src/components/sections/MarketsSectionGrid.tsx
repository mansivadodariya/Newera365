'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { LiveSpark, useLiveInstrumentPrices } from '../market/LiveSpark';

export interface MarketItem {
  key: string;
  bg: string;
  name: string;
  count: string;
  href: string;
  /** Representative MT5 symbol for the live quote board (e.g. 'EURUSD'). When
   * omitted, or when no live price is available, the tile shows only its count. */
  symbol?: string;
}

function MarketCard({ item, index, price }: { item: MarketItem; index: number; price?: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Staggered upward slide-in: reads coherently across the two desktop rows
    // (a left/right alternation would scatter direction within each column).
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const delay = index * 60;
          el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [index]);

  return (
    <Link
      ref={ref}
      href={item.href}
      style={{ transformStyle: 'preserve-3d' }}
      className="hover:border-accent/45 group relative flex h-[168px] transform-gpu flex-col justify-end overflow-hidden rounded-[20px] border border-white/[0.08] px-4 py-4 shadow-[0_18px_40px_-20px_rgba(4,16,10,0.45)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:shadow-[0_28px_54px_-18px_rgba(0,176,80,0.42)] motion-safe:hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(-4deg)] xl:h-[210px]"
    >
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#0A130E]" />
      {/* Background photo — full presence, sharp by default; on hover it brightens
          further and zooms in slightly (client-requested push-in; clipped by the
          card's overflow-hidden). The filter adds a small brightness/contrast
          boost so the vibrant `cpt_*.png` sources don't read muted through the
          scrim below. */}
      <Image
        src={item.bg}
        alt=""
        fill
        sizes="(min-width: 1280px) 200px, 50vw"
        style={{ filter: 'brightness(1.08) contrast(1.06) saturate(1.08)' }}
        className="pointer-events-none object-cover opacity-100 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.08]"
        aria-hidden="true"
      />
      {/* Label-zone scrim — high contrast gradient at the bottom so all titles & counts read sharp */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/5"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/[0.12]"
      />
      {/* Explore affordance — slides in on hover (RTL-aware) */}
      <span
        aria-hidden="true"
        className="absolute end-3 top-3 z-10 flex h-7 w-7 -translate-y-1 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="rtl:-scale-x-100">
          <path
            d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {/* Content: label, live quote, count anchored to the bottom */}
      <div className="relative z-10">
        <p className="font-sans text-[20px] font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] transition-colors duration-300 group-hover:text-[#00b050] xl:text-[22px]">
          {item.name}
        </p>
        {/* Living quote board: renders nothing until a live price arrives, so
            the count line below always keeps the tile complete. */}
        {item.symbol ? <LiveSpark symbol={item.symbol} price={price} className="mt-[5px]" /> : null}
        <p className="mt-1 font-mono text-[13px] font-bold tracking-[0.05em] text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] transition-colors duration-300 group-hover:text-white">
          {item.count}
        </p>
      </div>
    </Link>
  );
}

export function MarketsSectionGrid({ items }: { items: MarketItem[] }) {
  // Single shared poll for the whole grid (see LiveSpark). One request per
  // interval feeds all six tiles rather than six independent fetch loops.
  const prices = useLiveInstrumentPrices();
  return (
    <div className="mb-[14px] grid grid-cols-2 gap-[10px] overflow-x-clip xl:grid-cols-3">
      {items.map((item, i) => (
        <MarketCard
          key={item.key}
          item={item}
          index={i}
          price={item.symbol ? prices[item.symbol] : undefined}
        />
      ))}
    </div>
  );
}
