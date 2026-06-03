'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { LanguageToggle } from './LanguageToggle';

const NAV_GROUPS = [
  {
    section: null,
    items: [{ label: 'Home', href: '/' }],
  },
  {
    section: 'TRADE',
    items: [
      { label: 'Account Types', href: '/trade/accounts' },
      { label: 'Payment Methods', href: '/trade/funding' },
      { label: 'Fee Table', href: '/trade/fees' },
      { label: 'Promotions', href: '/trade/promotions' },
      { label: 'IB & Partners', href: '/trade/ib' },
    ],
  },
  {
    section: 'MARKETS',
    items: [
      { label: 'All Instruments', href: '/markets/instruments' },
      { label: 'Forex', href: '/markets/forex' },
      { label: 'Indices', href: '/markets/indices' },
      { label: 'Commodities', href: '/markets/commodities' },
      { label: 'Crypto', href: '/markets/crypto' },
    ],
  },
  {
    section: 'PLATFORM',
    items: [
      { label: 'MetaTrader 5', href: '/platform/mt5' },
      { label: 'Web Trader', href: '/platform/webtrader' },
      { label: 'Mobile App', href: '/platform/mobile' },
    ],
  },
  {
    section: 'EDUCATION',
    items: [
      { label: 'Education Hub', href: '/education' },
      { label: 'Guides', href: '/guides' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'E-Books', href: '/ebooks' },
      { label: 'Video & Webinars', href: '/education/media' },
    ],
  },
  {
    section: 'RESEARCH',
    items: [
      { label: 'Market Analysis', href: '/research' },
      { label: 'Blog', href: '/blog' },
      { label: 'Daily News', href: '/daily-news' },
      { label: 'Economic Calendar', href: '/tools/calendar' },
      { label: 'Analyst Views', href: '/tools/analyst-chart' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
  {
    section: 'TRADER TOOLS',
    items: [
      { label: 'Margin Calculator', href: '/tools' },
      { label: 'Pivot Calculator', href: '/tools/pivot' },
      { label: 'Profit Calculator', href: '/tools/profit' },
      { label: 'Fibonacci Calculator', href: '/tools/fibonacci' },
      { label: 'Spread Comparator', href: '/tools/spread-comparator' },
      { label: 'Live Watchlist', href: '/tools/watchlist' },
      { label: 'AI CRM', href: '/tools/ai-crm' },
    ],
  },
  {
    section: 'COMPANY',
    items: [
      { label: 'About Us', href: '/company/about' },
      { label: 'Careers', href: '/company/careers' },
    ],
  },
  {
    section: 'SUPPORT & LEGAL',
    items: [
      { label: 'Legal & Policies', href: '/legal' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Contact', href: '/contact' },
      { label: 'Live Chat', href: '/live-chat' },
    ],
  },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

function MobileMenu({ open, onClose }: MobileMenuProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const otherLocalePath = `/${otherLocale}${pathname.slice(locale.length + 1)}`;

  function isActive(href: string): boolean {
    const full = `/${locale}${href === '/' ? '' : href}`;
    if (href === '/') return pathname === full || pathname === `/${locale}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!open}
      className={[
        'bg-background fixed inset-0 z-50 flex flex-col',
        'transition-transform duration-300 ease-out will-change-transform',
        open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full',
      ].join(' ')}
    >
      {/* Top bar */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-5">
        <Link href={`/${locale}`} onClick={onClose} aria-label="Go to home">
          <Image
            src="/images/logo-light.png"
            alt="NewEra365"
            width={120}
            height={24}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/images/logo-dark.png"
            alt="NewEra365"
            width={120}
            height={24}
            className="hidden dark:block"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* Locale toggle */}
          <Link
            href={otherLocalePath}
            onClick={onClose}
            aria-label={`Switch to ${otherLocale === 'ar' ? 'Arabic' : 'English'}`}
            className="text-foreground dark:bg-surface font-body flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] text-[12px] font-semibold transition-colors hover:opacity-80"
          >
            {otherLocale.toUpperCase()}
          </Link>
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-foreground dark:bg-surface flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-foreground dark:bg-surface dark:hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8]"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav groups — scrollable, no scrollbar */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-4 pt-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
            {group.section && (
              <p className="font-body text-accent mb-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                {group.section}
              </p>
            )}
            {group.items.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={label}
                  href={`/${locale}${href === '/' ? '' : href}`}
                  onClick={onClose}
                  className="group flex items-center justify-between py-[15px]"
                >
                  <span
                    className={`font-sans text-[16px] font-medium transition-colors ${
                      active ? 'text-accent' : 'text-foreground group-hover:text-accent'
                    }`}
                  >
                    {label}
                  </span>
                  <svg
                    width="7"
                    height="12"
                    viewBox="0 0 7 12"
                    fill="none"
                    aria-hidden="true"
                    className={`flex-shrink-0 transition-colors ${
                      active ? 'text-accent' : 'text-muted group-hover:text-accent'
                    }`}
                  >
                    <path
                      d="M1 1L6 6L1 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* CTA pair + language toggle */}
      <div className="border-border flex flex-shrink-0 flex-col gap-3 border-t px-5 pb-8 pt-4">
        <Link
          href={`/${locale}/register`}
          onClick={onClose}
          className="bg-accent font-body hover:bg-accent-hover flex h-[52px] items-center justify-center rounded-full text-[15px] font-medium text-white transition-colors"
        >
          {t('openLive')}
        </Link>
        <Link
          href={`/${locale}/demo-account`}
          onClick={onClose}
          className="border-border text-foreground font-body hover:border-foreground flex h-[52px] items-center justify-center rounded-full border text-[15px] font-medium transition-colors"
        >
          {t('tryDemo')}
        </Link>
        {/* Language switcher — full width in mobile menu */}
        <div className="flex items-center justify-center pt-1">
          <LanguageToggle fullWidth />
        </div>
      </div>
    </div>
  );
}

export { MobileMenu };
