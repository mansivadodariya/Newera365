'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';

const FOOTER_LINKS = [
  {
    heading: 'MARKETS',
    items: [
      { label: 'Forex', href: '/markets/forex' },
      { label: 'Indices', href: '/markets/indices' },
      { label: 'Commodities', href: '/markets/commodities' },
      { label: 'Stocks', href: '/markets/stocks' },
      { label: 'ETFs', href: '/markets/etfs' },
      { label: 'Crypto', href: '/markets/crypto' },
    ],
  },
  {
    heading: 'PLATFORM',
    items: [
      { label: 'MetaTrader 5', href: '/platform/mt5' },
      { label: 'Web Trader', href: '/platform/webtrader' },
      { label: 'Mobile App', href: '/platform/mobile' },
      { label: 'Tools', href: '/tools' },
    ],
  },
  {
    heading: 'COMPANY',
    items: [
      { label: 'About', href: '/company/about' },
      { label: 'Careers', href: '/company/careers' },
      { label: 'Awards', href: '/company/awards' },
      { label: 'Media', href: '/company/media' },
    ],
  },
  {
    heading: 'SUPPORT',
    items: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Live Chat', href: '/live-chat' },
      { label: 'Legal', href: '/legal' },
    ],
  },
];

function Footer() {
  const locale = useLocale();

  return (
    <footer className="rounded-t-[32px] bg-black px-5 pb-8 pt-10 text-white">
      <div className="mx-auto max-w-[350px]">
        {/* Logo */}
        <Image
          src="/images/logo-dark.png"
          alt="NewEra365"
          width={133}
          height={26}
          className="mb-4"
        />

        {/* Tagline */}
        <p
          className="font-body mb-8 text-[13px] leading-[1.6] text-white/80"
          style={{ maxWidth: 280 }}
        >
          A premium global trading platform built for the new era of markets.
        </p>

        {/* Link grid — 2 columns */}
        <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-6">
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-[10px]">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className="font-body text-[13px] text-white/80 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-white/20" />

        {/* Risk disclosure */}
        <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
          RISK DISCLOSURE
        </p>
        <p className="font-body mb-6 text-[11px] leading-[1.6] text-white/60">
          Trading involves risk. Past performance is not indicative of future results. Trade
          responsibly.
        </p>

        {/* Copyright */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-white/60">© 2026 NEWERA365</span>
          <span className="font-mono text-[10px] text-white/40">V 4.0</span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
