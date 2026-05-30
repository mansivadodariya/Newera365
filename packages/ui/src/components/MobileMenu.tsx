'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

const NAV_GROUPS = [
  {
    section: null,
    items: [{ label: 'Home', href: '/' }],
  },
  {
    section: 'TRADE',
    items: [
      { label: 'Account Comparison', href: '/trade/accounts' },
      { label: 'Payment Info', href: '/trade/funding' },
      { label: 'Fee Table', href: '/trade/fees' },
      { label: 'Promo Cards', href: '/trade/promotions' },
      { label: 'IB Registration', href: '/trade/ib' },
    ],
  },
  {
    section: 'MARKETS',
    items: [{ label: 'MT5 Instrument Spec Table', href: '/markets/instruments' }],
  },
  {
    section: 'PLATFORM',
    items: [
      { label: 'Platform Feature Page', href: '/platform/mt5' },
      { label: 'WebTrader Embed', href: '/platform/webtrader' },
    ],
  },
  {
    section: 'EDUCATION HUB',
    items: [
      { label: 'Section Hub Landing', href: '/education' },
      { label: 'Media Content Listing', href: '/education/media' },
      { label: 'Gated Content Page', href: '/ebooks' },
      { label: 'A-Z Glossary', href: '/glossary' },
      { label: 'Long-form Guide', href: '/guides' },
    ],
  },
  {
    section: 'RESEARCH & ANALYSIS',
    items: [
      { label: 'CMS Article Listing', href: '/research' },
      { label: 'Economic Calendar', href: '/tools/calendar' },
      { label: 'Analyst Chart', href: '/tools/analyst-chart' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
  {
    section: 'TRADER TOOLS',
    items: [
      { label: 'Calculator Widget', href: '/tools' },
      { label: 'Spread Comparator', href: '/tools/spread-comparator' },
      { label: 'Live Watchlist', href: '/tools/watchlist' },
    ],
  },
  {
    section: 'BLOG',
    items: [{ label: 'Blog', href: '/blog' }],
  },
  {
    section: 'COMPANY',
    items: [
      { label: 'About Company', href: '/company/about' },
      { label: 'CMS Info Page', href: '/company/careers' },
    ],
  },
  {
    section: 'LEGAL & SUPPORT',
    items: [
      { label: 'Legal Prose Page', href: '/legal' },
      { label: 'FAQ Accordion', href: '/faqs' },
      { label: 'Contact Form', href: '/contact' },
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

        <button
          onClick={onClose}
          aria-label="Close menu"
          className="text-foreground flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8] dark:bg-surface dark:hover:bg-surface"
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

      {/* CTA pair */}
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
      </div>
    </div>
  );
}

export { MobileMenu };
