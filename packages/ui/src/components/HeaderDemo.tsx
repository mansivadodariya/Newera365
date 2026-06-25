'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { MobileMenuDemo } from './MobileMenuDemo';
import { LanguageToggle } from './LanguageToggle';
import { AuthModal, type AuthModalType } from './AuthModal';

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
      activeFor: ['/trade'],
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
      href: '/markets/forex',
      activeFor: ['/markets'],
      dropdown: [
        { label: t('marketsForexLabel'), sub: t('marketsForexSub'), href: '/markets/forex' },
        { label: t('marketsIndicesLabel'), sub: t('marketsIndicesSub'), href: '/markets/indices' },
        { label: t('marketsStocksLabel'), sub: t('marketsStocksSub'), href: '/markets/stocks' },
        {
          label: t('marketsCommoditiesLabel'),
          sub: t('marketsCommoditiesSub'),
          href: '/markets/commodities',
        },
        { label: t('marketsCryptoLabel'), sub: t('marketsCryptoSub'), href: '/markets/crypto' },
        { label: t('marketsEtfsLabel'), sub: t('marketsEtfsSub'), href: '/markets/etfs' },
      ],
    },
    {
      label: t('platform'),
      href: '/platform/mt5',
      // AI CRM lives at its own top-level /ai-crm route (not under /platform),
      // so it must be listed here to keep the Platform tab highlighted there.
      activeFor: ['/platform', '/ai-crm'],
      dropdown: [
        { label: t('platformOverviewLabel'), sub: t('platformOverviewSub'), href: '/platform/mt5' },
        {
          label: t('platformWebtraderLabel'),
          sub: t('platformWebtraderSub'),
          href: '/platform/webtrader',
        },
        { label: t('platformToolsLabel'), sub: t('platformToolsSub'), href: '/tools' },
        { label: t('toolsAiCrmLabel'), sub: t('toolsAiCrmSub'), href: '/ai-crm' },
      ],
    },
    {
      label: t('education'),
      href: '/education',
      activeFor: ['/education', '/guides', '/glossary', '/ebooks'],
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
      activeFor: ['/research', '/daily-news', '/newsletter'],
      dropdown: [
        { label: t('researchArticlesLabel'), sub: t('researchArticlesSub'), href: '/research' },
        { label: t('researchNewsLabel'), sub: t('researchNewsSub'), href: '/daily-news' },
        {
          label: t('researchAnalystLabel'),
          sub: t('researchAnalystSub'),
          href: '/research/analyst-chart',
        },
        {
          label: t('researchNewsletterLabel'),
          sub: t('researchNewsletterSub'),
          href: '/newsletter',
        },
      ],
    },
    {
      label: t('tools'),
      href: '/tools',
      activeFor: ['/tools'],
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
        { label: t('companyAwardsLabel'), sub: t('companyAwardsSub'), href: '/company/awards' },
        { label: t('companyMediaLabel'), sub: t('companyMediaSub'), href: '/company/media-press' },
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

  // Highlight only the single most-specific dropdown item. Without this, a hub
  // item (e.g. /tools or /education) stays lit on every sub-page alongside the
  // actual active item, so two rows look selected at once.
  const activeDropdownHref =
    item.dropdown
      ?.map((d) => d.href)
      .filter((h) => pathname === `/${locale}${h}` || pathname.startsWith(`/${locale}${h}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null;

  // Two-column panel for the larger menus, single column otherwise.
  const twoCol = (item.dropdown?.length ?? 0) > 4;

  return (
    <div
      className="group relative flex h-full items-center"
      onMouseEnter={onOpen}
      onMouseLeave={onScheduleClose}
    >
      <Link
        href={`/${locale}${item.href === '/' ? '' : item.href}`}
        className={`font-body relative flex h-full items-center text-[15px] font-medium transition-colors ${
          isActive ? 'text-accent' : 'text-foreground hover:text-accent'
        }`}
      >
        {item.label}
        {/* Animated active / hover underline */}
        <span
          className={`bg-accent absolute -bottom-px left-0 h-[2px] w-full origin-center rounded-full transition-transform duration-200 ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </Link>

      {item.dropdown && open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div
            className={`bg-background border-border animate-fade-in rounded-[16px] border p-2 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.6)] ${
              twoCol ? 'grid w-[460px] grid-cols-2 gap-1' : 'w-[264px]'
            }`}
          >
            {item.dropdown.map((d) => {
              const isDropdownActive = d.href === activeDropdownHref;
              return (
                <Link
                  key={d.href}
                  href={`/${locale}${d.href}`}
                  onClick={onCloseNow}
                  className={`relative block rounded-[10px] py-[9px] pe-3 ps-4 transition-colors ${
                    isDropdownActive ? 'bg-accent/[0.08]' : 'hover:bg-surface'
                  } before:bg-accent before:absolute before:bottom-1/2 before:start-1 before:w-[3px] before:translate-y-1/2 before:rounded-full before:transition-all ${
                    isDropdownActive ? 'before:h-5' : 'before:h-0 hover:before:h-5'
                  }`}
                >
                  <span
                    className={`font-body block text-[14px] font-medium leading-[1.2] ${
                      isDropdownActive ? 'text-accent' : 'dark:text-foreground text-[#1a1a1c]'
                    }`}
                  >
                    {d.label}
                  </span>
                  <span className="font-body dark:text-muted mt-[2px] block text-[12px] leading-[1.3] text-[#6b6b73]">
                    {d.sub}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    setOpenNav(null);
  }, [pathname]);

  // Shrink + glassify the header once the user scrolls past the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <header
        className={`border-border sticky top-0 z-40 w-full border-b backdrop-blur-md transition-[height,background-color,box-shadow] duration-300 ${
          scrolled
            ? 'h-[60px] bg-white/80 shadow-[0px_8px_24px_-6px_rgba(0,0,0,0.12)] dark:bg-[#07090d]/80'
            : 'h-[72px] bg-white/90 shadow-[0px_2px_4px_rgba(0,0,0,0.05)] dark:bg-[#07090d]/90'
        }`}
      >
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
            <div className="bg-border ms-3 h-5 w-px" />
            <button
              onClick={() => setAuthModal('demo')}
              className="font-body text-foreground ms-1 text-[15px] font-medium transition-opacity hover:opacity-70"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => setAuthModal('register')}
              className="font-body bg-accent hover:bg-accent-hover flex items-center rounded-full px-[22px] py-[11px] text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,176,80,0.8)] transition-colors"
            >
              {t('getStarted')}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu-demo"
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

      <MobileMenuDemo open={menuOpen} onClose={() => setMenuOpen(false)} />

      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}

export { HeaderDemo };
