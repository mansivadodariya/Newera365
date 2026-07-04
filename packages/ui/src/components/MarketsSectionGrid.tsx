'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useEffect } from 'react';

export interface MarketItem {
  key: string;
  bg: string;
  name: string;
  count: string;
  href: string;
}

function MarketCard({ item, index }: { item: MarketItem; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Alternate slide direction: even = left, odd = right
    const xStart = index % 2 === 0 ? -32 : 32;
    el.style.opacity = '0';
    el.style.transform = `translateX(${xStart}px)`;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const delay = index * 60;
          el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
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
      className="group relative flex h-[110px] flex-col justify-end overflow-hidden rounded-[18px] border border-transparent px-4 py-[18px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
    >
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#111]" />
      {/* Background photo — dims + zooms on hover */}
      <Image
        src={item.bg}
        alt=""
        fill
        sizes="(min-width: 1280px) 180px, 50vw"
        className="pointer-events-none object-cover opacity-40 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-25"
        aria-hidden="true"
      />
      {/* Explore affordance — slides in on hover (RTL-aware) */}
      <span
        aria-hidden="true"
        className="absolute end-3 top-3 z-10 flex h-7 w-7 -translate-y-1 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
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
      {/* Content — no icon per Figma; label + count anchored to the bottom */}
      <div className="relative z-10">
        <p className="group-hover:text-accent font-sans text-[16px] font-medium text-white transition-colors duration-300">
          {item.name}
        </p>
        <p className="font-body mt-[2px] text-[11px] text-[#FFFFFFCC] transition-colors duration-300 group-hover:text-white dark:text-[#FFFFFF]">
          {item.count}
        </p>
      </div>
    </Link>
  );
}

export function MarketsSectionGrid({ items }: { items: MarketItem[] }) {
  return (
    <div className="mb-[14px] grid grid-cols-2 gap-[10px] overflow-x-clip xl:grid-cols-6">
      {items.map((item, i) => (
        <MarketCard key={item.key} item={item} index={i} />
      ))}
    </div>
  );
}
