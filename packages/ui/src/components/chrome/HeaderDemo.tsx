'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { MobileMenuDemo } from './MobileMenuDemo';
import { LanguageToggle } from './LanguageToggle';
import { AuthModal, type AuthModalType } from './AuthModal';
import { NavIcon } from '../../lib/navIcons';

type DropdownItem = { label: string; sub: string; href: string };
type DropdownGroup = { heading: string; items: DropdownItem[] };
type NavItem = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
  /** Grouped mega-panel (Education): rendered as titled columns instead of a flat list. */
  groups?: DropdownGroup[];
  activeFor?: string[];
};

function useNavItems(t: ReturnType<typeof useTranslations<'nav'>>): NavItem[] {
  return [
    {
      label: t('trade'),
      href: '/trade/accounts',
      activeFor: ['/trade'],
      dropdown: [
        { label: t('tradeAccountsLabel'), sub: t('tradeAccountsSub'), href: '/trade/accounts' },
        { label: t('tradeFundingLabel'), sub: t('tradeFundingSub'), href: '/trade/funding' },
        { label: t('tradeFeesLabel'), sub: t('tradeFeesSub'), href: '/trade/fees' },
        { label: t('tradePromosLabel'), sub: t('tradePromosSub'), href: '/trade/promotions' },
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
      activeFor: ['/platform'],
      dropdown: [
        { label: t('platformOverviewLabel'), sub: t('platformOverviewSub'), href: '/platform/mt5' },
        {
          label: t('platformWebtraderLabel'),
          sub: t('platformWebtraderSub'),
          href: '/platform/webtrader',
        },
        // { label: t('toolsAiCrmLabel'), sub: t('toolsAiCrmSub'), href: '/ai-crm' },
      ],
    },
    {
      // Education absorbs the old Research and Tools tabs into one grouped panel.
      label: t('education'),
      href: '/education',
      activeFor: [
        '/education',
        '/guides',
        '/glossary',
        '/ebooks',
        '/research',
        '/analysis',
        '/daily-news',
        '/newsletter',
        '/tools',
      ],
      groups: [
        {
          heading: t('groupLearn'),
          items: [{ label: t('eduHubLabel'), sub: t('eduHubSub'), href: '/education' }],
        },
        {
          heading: t('groupResearch'),
          items: [
            { label: t('researchArticlesLabel'), sub: t('researchArticlesSub'), href: '/research' },
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
          heading: t('groupTools'),
          items: [
            { label: t('toolsMarginLabel'), sub: t('toolsMarginSub'), href: '/tools' },
            { label: t('toolsCalendarLabel'), sub: t('toolsCalendarSub'), href: '/tools/calendar' },
            {
              label: t('toolsWatchlistLabel'),
              sub: t('toolsWatchlistSub'),
              href: '/tools/watchlist',
            },
            {
              label: t('toolsSpreadLabel'),
              sub: t('toolsSpreadSub'),
              href: '/tools/spread-comparator',
            },
          ],
        },
      ],
    },
    {
      // Company absorbs the old Legal & Support tab.
      label: t('company'),
      href: '/company/about',
      activeFor: ['/company', '/support', '/legal'],
      dropdown: [
        { label: t('companyAboutLabel'), sub: t('companyAboutSub'), href: '/company/about' },
        { label: t('companySupportLabel'), sub: t('companySupportSub'), href: '/support' },
        { label: t('companyLegalLabel'), sub: t('companyLegalSub'), href: '/legal' },
      ],
    },
  ];
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={`ms-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

// Shared square-chip styling for the header utility buttons (hamburger)
// and the language toggle. Keep in sync with LanguageToggle.tsx.
const CHIP =
  'flex h-[38px] items-center justify-center rounded-xl bg-[#f4f4f5] text-foreground transition-[background-color,transform] hover:bg-accent/[0.10] active:scale-[0.94] dark:bg-surface dark:hover:bg-accent/[0.10]';

// Trigger only — the dropdown panel is a single shared element rendered once at
// the nav level (see HeaderDemo) so it can morph between triggers.
function DesktopNavItem({
  item,
  locale,
  pathname,
  isOpen,
  setRef,
  onOpen,
  onScheduleClose,
}: {
  item: NavItem;
  locale: string;
  pathname: string;
  isOpen: boolean;
  setRef: (el: HTMLDivElement | null) => void;
  onOpen: () => void;
  onScheduleClose: () => void;
}) {
  const isActive = item.activeFor
    ? item.activeFor.some((r) => pathname.startsWith(`/${locale}${r}`))
    : item.href === '/'
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(`/${locale}${item.href}`);

  const hasMenu = Boolean(item.dropdown || item.groups);

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
        {hasMenu && <ChevronDown open={isOpen} />}
      </Link>
    </div>
  );
}

// A single dropdown row — shared by the flat menus and the grouped mega-panel.
function DropdownLink({
  d,
  isActive,
  locale,
  onClose,
}: {
  d: DropdownItem;
  isActive: boolean;
  locale: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/${locale}${d.href}`}
      onClick={onClose}
      className={`group flex items-start gap-2.5 rounded-[10px] px-3 py-[9px] transition-colors ${
        isActive ? 'bg-accent/[0.08]' : 'hover:bg-accent/[0.06] dark:hover:bg-accent/[0.10]'
      }`}
    >
      <NavIcon
        href={d.href}
        size={19}
        className={`mt-[2px] transition-colors ${
          isActive ? 'text-accent' : 'dark:text-foreground group-hover:text-accent text-foreground'
        }`}
      />
      <span className="min-w-0 flex-1">
        <span
          className={`font-body block text-[15px] font-medium leading-[1.2] transition-colors ${
            isActive
              ? 'text-accent'
              : 'dark:text-foreground group-hover:text-accent text-foreground'
          }`}
        >
          {d.label}
        </span>
        <span className="font-body dark:text-muted text-muted mt-[2px] block text-[13px] leading-[1.35]">
          {d.sub}
        </span>
      </span>
    </Link>
  );
}

// Grouped mega-panel (Education) is widest; two-column for the larger flat menus.
const panelWidth = (item: NavItem | null) =>
  item?.groups ? 720 : (item?.dropdown?.length ?? 0) > 4 ? 460 : 264;

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
  const safePathname = pathname || '';

  const displayNav = useNavItems(t);
  const activeItem = openNav ? (displayNav.find((i) => i.label === openNav) ?? null) : null;
  const twoCol = panelWidth(activeItem) === 460;
  // Highlight the single most-specific dropdown row for the current route.
  const activeDropdownItems = activeItem?.groups
    ? activeItem.groups.flatMap((g) => g.items)
    : (activeItem?.dropdown ?? []);
  const activeDropdownHref =
    activeDropdownItems
      .map((d) => d.href)
      .filter(
        (h) => safePathname === `/${locale}${h}` || safePathname.startsWith(`/${locale}${h}/`),
      )
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

  // Glassify the header (deeper shadow + more translucent bar) once the user
  // scrolls past the top. Height stays constant at 72px on purpose: this header
  // is sticky/in-flow, so animating its height reflowed everything below it (the
  // ticker + hero jumped up), which read as a glitch. Shadow/bg only = no jump.
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
    // Menu-less item → close any open panel.
    if (!item?.dropdown && !item?.groups) {
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
        className={`border-border sticky top-0 z-40 h-[72px] w-full border-b transition-shadow duration-300 ${
          scrolled
            ? 'shadow-[0px_8px_24px_-6px_rgba(0,0,0,0.12)]'
            : 'shadow-[0px_2px_4px_rgba(0,0,0,0.05)]'
        }`}
      >
        {/* Blur + tint live on a layer confined to the bar — NOT on the <header>
            element. A backdrop-filter on <header> would make it a backdrop root
            and silently kill the dropdown's own blur (nested backdrop-filter is
            a no-op). Keeping the header filter-free lets the dropdown below
            frost the page exactly like this bar does. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 backdrop-blur-md transition-colors duration-300 ${
            scrolled ? 'bg-white/80 dark:bg-[#07090d]/80' : 'bg-white/90 dark:bg-[#07090d]/90'
          }`}
        />
        {/* Mobile: flex row (logo left, controls right). The 3-column grid only
            engages at xl — on mobile the middle nav is display:none, which under
            grid auto-placement pulled the right-hand controls into the centre.
            gap-x-6: a guaranteed column gap so the centered nav can never collide
            with the logo / control chips (fr slack alone vanished on devices that
            render the nav wider, letting "Company" touch the language toggle).
            px trims to 40px in the tight 1280-1535 band so that gap survives;
            the roomy 80px is restored at 2xl where collisions can't happen. */}
        <div className="flex h-full items-center justify-between px-5 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-x-6 xl:px-10 2xl:px-[80px]">
          {/* Left: Logo */}
          <Link
            href={`/${locale}`}
            aria-label="Newera, go to home"
            className="flex-shrink-0 justify-self-start"
          >
            <Image
              src="/logo-light.png"
              alt="Newera"
              width={140}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          <nav
            ref={navRef}
            className="relative hidden h-full items-center justify-center gap-7 justify-self-center xl:flex"
            aria-label="Main navigation"
          >
            {displayNav.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                locale={locale}
                pathname={pathname}
                isOpen={openNav === item.label}
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
                {(activeItem?.dropdown || activeItem?.groups) && (
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
                    <div className="border-border overflow-hidden rounded-[16px] border bg-white/90 p-2 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md dark:bg-[#07090d]/90 dark:shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.6)]">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={activeItem.label}
                          layout="position"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12, ease: 'easeOut' }}
                          className={
                            activeItem.groups
                              ? 'grid w-[720px] grid-cols-3 gap-2'
                              : twoCol
                                ? 'grid w-[460px] grid-cols-2 gap-1'
                                : 'w-[264px]'
                          }
                        >
                          {activeItem.groups
                            ? activeItem.groups.map((g) => (
                                <div key={g.heading} className="flex flex-col">
                                  <span className="font-body text-muted block px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
                                    {g.heading}
                                  </span>
                                  {g.items.map((d) => (
                                    <DropdownLink
                                      key={d.href}
                                      d={d}
                                      isActive={d.href === activeDropdownHref}
                                      locale={locale}
                                      onClose={closeNow}
                                    />
                                  ))}
                                </div>
                              ))
                            : activeItem.dropdown?.map((d) => (
                                <DropdownLink
                                  key={d.href}
                                  d={d}
                                  isActive={d.href === activeDropdownHref}
                                  locale={locale}
                                  onClose={closeNow}
                                />
                              ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionConfig>
          </nav>

          {/* Right: actions cluster (desktop CTAs / mobile controls) */}
          <div className="flex items-center justify-self-end">
            {/* Desktop right CTAs. whitespace-nowrap: the symmetric 1fr_auto_1fr
                grid splits side-space equally, so at the xl breakpoint (~1280px)
                the right track is capped at the left track's width and starves
                this cluster — without nowrap "Sign in" / "Open Account" wrap to
                two lines. nowrap makes the track claim its content width instead. */}
            <div className="hidden items-center gap-3 whitespace-nowrap xl:flex">
              <LanguageToggle />
              <div className="bg-border mx-1 h-5 w-px" />
              <a
                href="https://webtrading.newera365.com/terminal"
                className="font-body text-foreground flex min-h-[38px] items-center text-[15px] font-medium transition-opacity hover:opacity-70"
              >
                {t('signIn')}
              </a>
              <Link
                href={`/${locale}/trade/ib`}
                className="font-body border-accent/40 text-accent hover:bg-accent hover:border-accent flex items-center rounded-full border px-[18px] py-[10px] text-[14px] font-semibold transition-colors hover:text-white"
              >
                {t('tradeIbLabel')}
              </Link>
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
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu-demo"
                className={`${CHIP} w-[38px]`}
              >
                <HamburgerIcon />
              </button>
            </div>
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
