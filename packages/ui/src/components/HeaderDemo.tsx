'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
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
        { label: t('eduBlogLabel'), sub: t('eduBlogSub'), href: '/education/blog' },
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
      activeFor: ['/company'],
      dropdown: [
        { label: t('companyAboutLabel'), sub: t('companyAboutSub'), href: '/company/about' },
        { label: t('companyCareersLabel'), sub: t('companyCareersSub'), href: '/company/careers' },
        { label: t('companyAwardsLabel'), sub: t('companyAwardsSub'), href: '/company/awards' },
        { label: t('companyMediaLabel'), sub: t('companyMediaSub'), href: '/company/media-press' },
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

// Trigger only — the dropdown panel is a single shared element rendered once at
// the nav level (see HeaderDemo) so it can morph between triggers.
function DesktopNavItem({
  item,
  locale,
  pathname,
  setRef,
  onOpen,
  onScheduleClose,
}: {
  item: NavItem;
  locale: string;
  pathname: string;
  setRef: (el: HTMLDivElement | null) => void;
  onOpen: () => void;
  onScheduleClose: () => void;
}) {
  const isActive = item.activeFor
    ? item.activeFor.some((r) => pathname.startsWith(`/${locale}${r}`))
    : item.href === '/'
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(`/${locale}${item.href}`);

  return (
    <div
      ref={setRef}
      className="flex h-full items-center"
      onMouseEnter={onOpen}
      onMouseLeave={onScheduleClose}
    >
      <Link
        href={`/${locale}${item.href === '/' ? '' : item.href}`}
        className={`font-body flex h-full items-center text-[15px] font-medium transition-colors ${
          isActive ? 'text-accent' : 'text-foreground'
        }`}
      >
        {item.label}
      </Link>
    </div>
  );
}

// Two-column panel for the larger menus, single column otherwise.
const panelWidth = (item: NavItem | null) => ((item?.dropdown?.length ?? 0) > 4 ? 460 : 264);

function HeaderDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [panelX, setPanelX] = useState(0);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();

  const displayNav = useNavItems(t);
  const activeItem = openNav ? (displayNav.find((i) => i.label === openNav) ?? null) : null;
  const twoCol = panelWidth(activeItem) === 460;
  // Highlight the single most-specific dropdown row for the current route.
  const activeDropdownHref =
    activeItem?.dropdown
      ?.map((d) => d.href)
      .filter((h) => pathname === `/${locale}${h}` || pathname.startsWith(`/${locale}${h}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
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

  // Park the shared panel's left edge under the hovered trigger, clamped to the
  // viewport so edge menus never clip. framer-motion's `layout` animates the
  // shift. ponytail: measured on open, not on resize — menus close on
  // scroll/navigate before a resize matters.
  function place(label: string) {
    const el = triggerRefs.current[label];
    const nav = navRef.current;
    if (!el || !nav) return;
    const w = panelWidth(displayNav.find((i) => i.label === label) ?? null);
    const elRect = el.getBoundingClientRect();
    const pad = 12;
    const leftVp = Math.max(
      pad,
      Math.min(elRect.left + elRect.width / 2 - w / 2, window.innerWidth - w - pad),
    );
    setPanelX(leftVp - nav.getBoundingClientRect().left);
  }

  function openMenu(label: string) {
    const item = displayNav.find((i) => i.label === label);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    // Menu-less item (Home) → close any open panel.
    if (!item?.dropdown) {
      setOpenNav(null);
      return;
    }
    // Already open → slide to the new trigger instantly.
    if (openNav !== null) {
      place(label);
      setOpenNav(label);
      return;
    }
    // Cold open → brief hover intent so sweeping the bar doesn't flash menus.
    openTimerRef.current = setTimeout(() => {
      place(label);
      setOpenNav(label);
    }, 80);
  }
  function scheduleClose() {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenNav(null), 140);
  }
  function closeNow() {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
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

            <nav
              ref={navRef}
              className="relative hidden h-full items-center gap-7 xl:flex"
              aria-label="Main navigation"
            >
              {displayNav.map((item) => (
                <DesktopNavItem
                  key={item.label}
                  item={item}
                  locale={locale}
                  pathname={pathname}
                  setRef={(el) => (triggerRefs.current[item.label] = el)}
                  onOpen={() => openMenu(item.label)}
                  onScheduleClose={scheduleClose}
                />
              ))}

              {/* One shared panel that morphs (position + size) between triggers
                  via framer-motion `layout`, instead of a separate panel per
                  item popping in/out at a new spot. */}
              <MotionConfig reducedMotion="user">
                <AnimatePresence>
                  {activeItem?.dropdown && (
                    <motion.div
                      key="nav-dropdown"
                      layout
                      onMouseEnter={() => openMenu(activeItem.label)}
                      onMouseLeave={scheduleClose}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        layout: { type: 'spring', stiffness: 500, damping: 40, mass: 0.7 },
                        opacity: { duration: 0.16, ease: 'easeOut' },
                      }}
                      style={{ left: panelX }}
                      className="absolute top-full z-50 pt-3"
                    >
                      <div className="bg-background border-border overflow-hidden rounded-[16px] border p-2 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.6)]">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.div
                            key={activeItem.label}
                            layout="position"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                            className={twoCol ? 'grid w-[460px] grid-cols-2 gap-1' : 'w-[264px]'}
                          >
                            {activeItem.dropdown.map((d) => {
                              const isDropdownActive = d.href === activeDropdownHref;
                              return (
                                <Link
                                  key={d.href}
                                  href={`/${locale}${d.href}`}
                                  onClick={closeNow}
                                  className={`block rounded-[10px] px-3 py-[9px] transition-colors ${
                                    isDropdownActive ? 'bg-accent/[0.08]' : 'hover:bg-surface'
                                  }`}
                                >
                                  <span
                                    className={`font-body block text-[14px] font-medium leading-[1.2] ${
                                      isDropdownActive
                                        ? 'text-accent'
                                        : 'dark:text-foreground text-[#1a1a1c]'
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
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MotionConfig>
            </nav>
          </div>

          {/* Desktop right CTAs */}
          <div className="hidden items-center gap-3 xl:flex">
            <LanguageToggle />
            <ThemeToggle />
            <div className="bg-border ms-3 h-5 w-px" />
            <button
              onClick={() => setAuthModal('demo')}
              className="font-body text-foreground ms-1 flex min-h-[38px] items-center text-[15px] font-medium transition-opacity hover:opacity-70"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => setAuthModal('register')}
              className="font-body bg-accent hover:bg-accent-hover focus-visible:ring-accent flex items-center rounded-full px-[22px] py-[11px] text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,176,80,0.8)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {t('getStarted')}
            </button>
          </div>

          {/* Mobile controls — no CTA here: the logo needs the width, and the
              scroll-triggered StickyCtaBar owns the mobile conversion slot. */}
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
