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
type NavItem = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
  activeFor?: string[];
};

function useNavItems(t: ReturnType<typeof useTranslations<'nav'>>): NavItem[] {
  return [
    { label: t('home'), href: '/' },
    {
      label: t('trade'),
      href: '/trade/accounts',
      dropdown: [
        { label: t('tradeAccountsLabel'), sub: t('tradeAccountsSub'), href: '/trade/accounts' },
        { label: t('tradeFundingLabel'), sub: t('tradeFundingSub'), href: '/trade/funding' },
        { label: t('tradeFeesLabel'), sub: t('tradeFeesSub'), href: '/trade/fees' },
        { label: t('tradePromosLabel'), sub: t('tradePromosSub'), href: '/trade/promotions' },
        { label: t('tradeIbLabel'), sub: t('tradeIbSub'), href: '/trade/ib' },
      ],
    },
    {
      label: t('markets'),
      href: '/markets/instruments',
      dropdown: [
        {
          label: t('marketsInstrumentsLabel'),
          sub: t('marketsInstrumentsSub'),
          href: '/markets/instruments',
        },
        { label: t('marketsForexLabel'), sub: t('marketsForexSub'), href: '/markets/forex' },
        { label: t('marketsIndicesLabel'), sub: t('marketsIndicesSub'), href: '/markets/indices' },
        {
          label: t('marketsCommoditiesLabel'),
          sub: t('marketsCommoditiesSub'),
          href: '/markets/commodities',
        },
        { label: t('marketsCryptoLabel'), sub: t('marketsCryptoSub'), href: '/markets/crypto' },
      ],
    },
    {
      label: t('platform'),
      href: '/platform/mt5',
      dropdown: [
        { label: t('platformOverviewLabel'), sub: t('platformOverviewSub'), href: '/platform/mt5' },
        { label: t('platformMt5Label'), sub: t('platformMt5Sub'), href: '/platform/mt5' },
        {
          label: t('platformWebtraderLabel'),
          sub: t('platformWebtraderSub'),
          href: '/platform/webtrader',
        },
        { label: t('platformMobileLabel'), sub: t('platformMobileSub'), href: '/platform/mobile' },
        { label: t('platformToolsLabel'), sub: t('platformToolsSub'), href: '/tools' },
        { label: t('toolsAiCrmLabel'), sub: t('toolsAiCrmSub'), href: '/tools/ai-crm' },
      ],
    },
    {
      label: t('education'),
      href: '/education',
      dropdown: [
        { label: t('eduHubLabel'), sub: t('eduHubSub'), href: '/education' },
        { label: t('eduGuidesLabel'), sub: t('eduGuidesSub'), href: '/guides' },
        { label: t('eduGlossaryLabel'), sub: t('eduGlossarySub'), href: '/glossary' },
        { label: t('eduMediaLabel'), sub: t('eduMediaSub'), href: '/education/media' },
        { label: t('eduEbooksLabel'), sub: t('eduEbooksSub'), href: '/ebooks' },
      ],
    },
    {
      label: t('research'),
      href: '/research',
      dropdown: [
        { label: t('researchArticlesLabel'), sub: t('researchArticlesSub'), href: '/research' },
        {
          label: t('researchCalendarLabel'),
          sub: t('researchCalendarSub'),
          href: '/tools/calendar',
        },
        {
          label: t('researchAnalystLabel'),
          sub: t('researchAnalystSub'),
          href: '/tools/analyst-chart',
        },
        {
          label: t('researchNewsletterLabel'),
          sub: t('researchNewsletterSub'),
          href: '/newsletter',
        },
        {
          label: t('researchWatchlistLabel'),
          sub: t('researchWatchlistSub'),
          href: '/tools/watchlist',
        },
      ],
    },
    {
      label: t('tools'),
      href: '/tools',
      dropdown: [
        { label: t('toolsMarginLabel'), sub: t('toolsMarginSub'), href: '/tools' },
        { label: t('toolsPivotLabel'), sub: t('toolsPivotSub'), href: '/tools/pivot' },
        { label: t('toolsProfitLabel'), sub: t('toolsProfitSub'), href: '/tools/profit' },
        { label: t('toolsFibonacciLabel'), sub: t('toolsFibonacciSub'), href: '/tools/fibonacci' },
        {
          label: t('toolsSpreadLabel'),
          sub: t('toolsSpreadSub'),
          href: '/tools/spread-comparator',
        },
        { label: t('toolsWatchlistLabel'), sub: t('toolsWatchlistSub'), href: '/tools/watchlist' },
        { label: t('toolsCalendarLabel'), sub: t('toolsCalendarSub'), href: '/tools/calendar' },
      ],
    },
    {
      label: t('company'),
      href: '/company/about',
      activeFor: ['/company', '/blog'],
      dropdown: [
        { label: t('companyAboutLabel'), sub: t('companyAboutSub'), href: '/company/about' },
        { label: t('companyCareersLabel'), sub: t('companyCareersSub'), href: '/company/careers' },
        { label: t('researchBlogLabel'), sub: t('researchBlogSub'), href: '/blog' },
      ],
    },
    {
      label: t('legalSupport'),
      href: '/legal',
      activeFor: ['/legal', '/faqs', '/contact', '/live-chat'],
      dropdown: [
        { label: t('companyLegalLabel'), sub: t('companyLegalSub'), href: '/legal' },
        { label: t('companyFaqLabel'), sub: t('companyFaqSub'), href: '/faqs' },
        { label: t('companyContactLabel'), sub: t('companyContactSub'), href: '/contact' },
        { label: t('companyChatLabel'), sub: t('companyChatSub'), href: '/live-chat' },
      ],
    },
  ];
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
  open,
  onOpen,
  onScheduleClose,
  onCloseNow,
}: {
  item: NavItem;
  locale: string;
  pathname: string;
  open: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCloseNow: () => void;
}) {
  const isActive = item.activeFor
    ? item.activeFor.some((r) => pathname.startsWith(`/${locale}${r}`))
    : item.href === '/'
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(`/${locale}${item.href}`);

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={onOpen}
      onMouseLeave={onScheduleClose}
    >
      <Link
        href={`/${locale}${item.href === '/' ? '' : item.href}`}
        className={`font-body text-[15px] font-medium transition-colors ${
          isActive ? 'text-accent' : 'text-foreground hover:text-accent'
        }`}
      >
        {item.label}
      </Link>

      {item.dropdown && open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <div className="bg-background border-border animate-fade-in w-[256px] rounded-[14px] border p-2 shadow-[0px_12px_28px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0px_12px_28px_-4px_rgba(0,0,0,0.5)]">
            {item.dropdown.map((d) => (
              <Link
                key={d.href}
                href={`/${locale}${d.href}`}
                onClick={onCloseNow}
                className="hover:bg-surface block rounded-[9px] px-3 py-[9px] transition-colors"
              >
                <span className="font-body dark:text-foreground block text-[14px] font-medium leading-[1.2] text-[#1a1a1c]">
                  {d.label}
                </span>
                <span className="font-body dark:text-muted mt-[2px] block text-[12px] leading-[1.3] text-[#6b6b73]">
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

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Single shared dropdown state: hovering a new nav item instantly closes the
  // previous dropdown, so panels can never stack while sweeping across the nav.
  const [openNav, setOpenNav] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();

  const displayNav = useNavItems(t);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Close any open dropdown on navigation.
  useEffect(() => {
    setOpenNav(null);
  }, [pathname]);

  function openMenu(label: string) {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenNav(label);
  }
  function scheduleClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenNav(null), 120);
  }
  function closeNow() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenNav(null);
  }

  return (
    <>
      <header className="border-border sticky top-0 z-40 h-[72px] w-full border-b bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] dark:border-[#1a1c22] dark:bg-[#07090d]">
        <div className="flex h-full items-center justify-between px-5 xl:px-[80px]">
          {/* Left: Logo + desktop nav */}
          <div className="flex h-full items-center gap-11">
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

            <nav className="hidden h-full items-center gap-7 xl:flex" aria-label="Main navigation">
              {displayNav.map((item) => (
                <DesktopNavItem
                  key={item.label}
                  item={item}
                  locale={locale}
                  pathname={pathname}
                  open={openNav === item.label}
                  onOpen={() => openMenu(item.label)}
                  onScheduleClose={scheduleClose}
                  onCloseNow={closeNow}
                />
              ))}
            </nav>
          </div>

          {/* Desktop right CTAs */}
          <div className="hidden items-center gap-3 xl:flex">
            <LanguageToggle />
            <ThemeToggle />
            <div className="bg-border mx-1 h-5 w-px" />
            <Link
              href={`/${locale}/login`}
              className="font-body dark:text-foreground ms-1 text-[15px] font-medium text-[#111] transition-opacity hover:opacity-70"
            >
              {t('signIn')}
            </Link>
            <Link
              href={`/${locale}/register`}
              className="font-body flex h-[42px] items-center rounded-full bg-[#00b04f] px-[22px] text-[15px] font-semibold text-white transition-colors hover:bg-[#009944]"
            >
              {t('getStarted')}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageToggle />
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
