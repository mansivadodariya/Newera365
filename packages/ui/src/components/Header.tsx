'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { MobileMenu } from './MobileMenu';
import { LanguageToggle } from './LanguageToggle';

type DropdownItem = { label: string; sub: string; href: string };
type NavItem = { label: string; href: string; dropdown?: DropdownItem[] };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Trade',
    href: '/trade/accounts',
    dropdown: [
      {
        label: 'Account types',
        sub: 'Standard, Raw & VIP accounts',
        href: '/trade/accounts',
      },
      { label: 'Payment methods', sub: 'Funding & withdrawals', href: '/trade/funding' },
      { label: 'Fee table', sub: 'Spreads & charges', href: '/trade/fees' },
      { label: 'Promotions', sub: 'Bonuses & active offers', href: '/trade/promotions' },
      { label: 'IB & partners', sub: 'Earn rebates as a partner', href: '/trade/ib' },
    ],
  },
  {
    label: 'Markets',
    href: '/markets/instruments',
    dropdown: [
      {
        label: 'Instruments & specs',
        sub: 'Live MT5 instrument list',
        href: '/markets/instruments',
      },
      { label: 'Forex', sub: 'Majors, minors & exotics', href: '/markets/forex' },
      { label: 'Indices & stocks', sub: 'Global equity exposure', href: '/markets/indices' },
      {
        label: 'Commodities & metals',
        sub: 'Gold, oil, silver & more',
        href: '/markets/commodities',
      },
      { label: 'Crypto', sub: 'BTC, ETH and majors', href: '/markets/crypto' },
    ],
  },
  {
    label: 'Platform',
    href: '/platform/mt5',
    dropdown: [
      { label: 'MetaTrader 5', sub: 'Professional desktop & mobile', href: '/platform/mt5' },
      { label: 'Web Trader', sub: 'Trade from any browser', href: '/platform/webtrader' },
      { label: 'Mobile App', sub: 'iOS & Android', href: '/platform/mobile' },
      { label: 'Tools & automation', sub: 'EAs, VPS & copy trading', href: '/tools' },
    ],
  },
  {
    label: 'Education',
    href: '/education',
    dropdown: [
      { label: 'Education hub', sub: 'Start your learning journey', href: '/education' },
      { label: 'Guides', sub: 'In-depth trading guides', href: '/guides' },
      { label: 'Glossary', sub: 'A-Z trading terms', href: '/glossary' },
      { label: 'Ebooks', sub: 'Gated research & PDFs', href: '/ebooks' },
      { label: 'Media', sub: 'Videos & webinars', href: '/education/media' },
    ],
  },
  {
    label: 'Research',
    href: '/research',
    dropdown: [
      { label: 'Market articles', sub: 'Desk commentary & analysis', href: '/research' },
      { label: 'Blog', sub: 'News & company updates', href: '/blog' },
      { label: 'Daily news', sub: 'Latest market headlines', href: '/daily-news' },
      { label: 'Economic calendar', sub: 'Key market events', href: '/tools/calendar' },
      { label: 'Analyst views', sub: 'Forecasts & signals', href: '/tools/analyst-chart' },
      { label: 'Newsletter', sub: 'The Monday briefing', href: '/newsletter' },
      { label: 'Live watchlist', sub: 'Real-time prices', href: '/tools/watchlist' },
    ],
  },
  {
    label: 'Tools',
    href: '/tools',
    dropdown: [
      { label: 'Margin calculator', sub: 'Margin, pip & swap', href: '/tools' },
      { label: 'Pivot calculator', sub: 'Classical, Camarilla, Woodie', href: '/tools/pivot' },
      { label: 'Profit calculator', sub: 'P&L by instrument & size', href: '/tools/profit' },
      {
        label: 'Fibonacci calculator',
        sub: 'Retracement & extension levels',
        href: '/tools/fibonacci',
      },
      {
        label: 'Spread comparator',
        sub: 'Side-by-side account spreads',
        href: '/tools/spread-comparator',
      },
      { label: 'Live watchlist', sub: 'Real-time market prices', href: '/tools/watchlist' },
      { label: 'Economic calendar', sub: 'Key market events & releases', href: '/tools/calendar' },
      { label: 'AI CRM', sub: 'AI-powered broker tools', href: '/tools/ai-crm' },
    ],
  },
  {
    label: 'Company',
    href: '/company/about',
    dropdown: [
      { label: 'About us', sub: 'Who we are & our mission', href: '/company/about' },
      { label: 'Careers', sub: "We're hiring across 8 cities", href: '/company/careers' },
      { label: 'Legal & policies', sub: 'Terms, privacy & regulation', href: '/legal' },
      { label: 'Newsletter', sub: 'The Monday briefing, weekly', href: '/newsletter' },
      { label: 'FAQ', sub: 'Common questions answered', href: '/faqs' },
      { label: 'Contact', sub: 'Talk to the team directly', href: '/contact' },
      { label: 'Live chat', sub: 'Chat with support now', href: '/live-chat' },
    ],
  },
];

function LocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const otherPath = `/${otherLocale}${pathname.slice(locale.length + 1)}`;
  return (
    <Link
      href={otherPath}
      aria-label={`Switch to ${otherLocale === 'ar' ? 'Arabic' : 'English'}`}
      className="text-foreground dark:bg-surface font-body flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-[#f4f4f5] text-[12px] font-semibold transition-colors hover:opacity-80"
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
      <rect y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect y="8.4" width="16" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="dark:bg-surface h-[38px] w-[38px] flex-shrink-0 rounded-xl bg-[#f4f4f5]" />
    );
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-foreground dark:bg-surface flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-[#f4f4f5] transition-colors"
    >
      {isDark ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
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
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
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
  );
}

function DesktopNavItem({
  item,
  locale,
  pathname,
}: {
  item: NavItem;
  locale: string;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive =
    item.href === '/'
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(`/${locale}${item.href}`);

  function handleMouseEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }
  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/${locale}${item.href === '/' ? '' : item.href}`}
        className={`font-body text-[15px] font-medium transition-colors ${
          isActive ? 'text-accent' : 'text-foreground group-hover:text-accent'
        }`}
      >
        {item.label}
      </Link>

      {item.dropdown && open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div className="bg-background w-[256px] rounded-[14px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {item.dropdown.map((d) => (
              <Link
                key={d.href}
                href={`/${locale}${d.href}`}
                className="hover:bg-surface block rounded-[9px] px-3 py-[9px] transition-colors"
              >
                <span className="font-body text-foreground block text-[14px] font-medium leading-[1.2]">
                  {d.label}
                </span>
                <span className="font-body text-muted mt-[2px] block text-[12px] leading-[1.3]">
                  {d.sub}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface CmsNavItem {
  label: string;
  href: string;
  id?: string | null;
}

function Header({ navItems }: { navItems?: CmsNavItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();

  const displayNav: NavItem[] =
    navItems && navItems.length > 0
      ? navItems.map((n) => ({ label: n.label, href: n.href }))
      : NAV_ITEMS;

  return (
    <>
      <header className="border-border sticky top-0 z-40 h-[72px] w-full border-b bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] dark:border-[#1a1c22] dark:bg-[rgba(7,9,13,0.85)]">
        <div className="flex h-full items-center justify-between px-5 xl:px-[80px]">
          {/* Logo */}
          <Link href={`/${locale}`} aria-label="NewEra365 — go to home" className="flex-shrink-0">
            <Image
              src="/images/logo-light.png"
              alt="NewEra365"
              width={133}
              height={26}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/images/logo-dark.png"
              alt="NewEra365"
              width={133}
              height={26}
              className="hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden h-full items-center gap-7 xl:flex" aria-label="Main navigation">
            {displayNav.map((item) => (
              <DesktopNavItem key={item.label} item={item} locale={locale} pathname={pathname} />
            ))}
          </nav>

          {/* Desktop right CTAs */}
          <div className="hidden items-center gap-3 xl:flex">
            <LocaleToggle />
            <ThemeToggle />
            <div className="bg-border mx-1 h-5 w-px" />
            <Link
              href={`/${locale}/login`}
              className="font-body text-foreground ms-3 text-[15px] font-medium transition-opacity hover:opacity-70"
            >
              {t('signIn')}
            </Link>
            <Link
              href={`/${locale}/register`}
              className="bg-accent hover:bg-accent-hover font-body flex h-[42px] items-center rounded-full px-[22px] text-[15px] font-semibold text-white transition-colors"
            >
              {t('getStarted')}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 xl:hidden">
            <LocaleToggle />
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="text-foreground dark:bg-surface flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#f4f4f5]"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export { Header };
