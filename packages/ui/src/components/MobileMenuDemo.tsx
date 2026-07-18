'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { isRtl, type Locale } from '@newera365/types';
import { LanguageToggle } from './LanguageToggle';
import { AuthModal, type AuthModalType } from './AuthModal';
import { NavIcon } from './navIcons';

type NavGroup = { section: string | null; items: { label: string; href: string }[] };

function useNavGroups(t: ReturnType<typeof useTranslations<'nav'>>): NavGroup[] {
  return [
    {
      section: t('sectionTrade'),
      items: [
        { label: t('tradeAccountsLabel'), href: '/trade/accounts' },
        { label: t('tradeFundingLabel'), href: '/trade/funding' },
        { label: t('tradeFeesLabel'), href: '/trade/fees' },
        { label: t('tradePromosLabel'), href: '/trade/promotions' },
        { label: t('tradeIbLabel'), href: '/trade/ib' },
      ],
    },
    {
      section: t('sectionMarkets'),
      items: [
        { label: t('marketsForexLabel'), href: '/markets/forex' },
        { label: t('marketsIndicesLabel'), href: '/markets/indices' },
        { label: t('marketsStocksLabel'), href: '/markets/stocks' },
        { label: t('marketsCommoditiesLabel'), href: '/markets/commodities' },
        { label: t('marketsCryptoLabel'), href: '/markets/crypto' },
        { label: t('marketsEtfsLabel'), href: '/markets/etfs' },
      ],
    },
    {
      section: t('sectionPlatform'),
      items: [
        { label: t('platformOverviewLabel'), href: '/platform/mt5' },
        { label: t('platformWebtraderLabel'), href: '/platform/webtrader' },
        { label: t('toolsAiCrmLabel'), href: '/ai-crm' },
      ],
    },
    {
      // Mirrors the desktop Education mega-panel: Learn, then Research, then Tools.
      section: t('sectionEducation'),
      items: [
        { label: t('eduHubLabel'), href: '/education' },
        { label: t('eduGuidesLabel'), href: '/guides' },
        { label: t('eduGlossaryLabel'), href: '/glossary' },
        { label: t('eduEbooksLabel'), href: '/ebooks' },
        { label: t('researchArticlesLabel'), href: '/research' },
        { label: t('researchAnalystLabel'), href: '/research/analyst-chart' },
        { label: t('researchNewsletterLabel'), href: '/newsletter' },
        { label: t('toolsMarginLabel'), href: '/tools' },
        { label: t('toolsCalendarLabel'), href: '/tools/calendar' },
        { label: t('toolsWatchlistLabel'), href: '/tools/watchlist' },
        { label: t('toolsSpreadLabel'), href: '/tools/spread-comparator' },
      ],
    },
    {
      section: t('sectionCompany'),
      items: [
        { label: t('companyAboutLabel'), href: '/company/about' },
        { label: t('companySupportLabel'), href: '/support' },
        { label: t('companyLegalLabel'), href: '/legal' },
      ],
    },
  ];
}

interface MobileMenuDemoProps {
  open: boolean;
  onClose: () => void;
}

function MobileMenuDemo({ open, onClose }: MobileMenuDemoProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const navGroups = useNavGroups(t);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  useEffect(() => setMounted(true), []);

  const rtl = isRtl(locale as Locale);

  // Resolve the single most-specific nav target for the current path, so only one
  // item — and therefore one section — is highlighted. Without longest-match, a hub
  // item like /tools or /education stays active on every sub-page, and a cross-listed
  // page such as /tools/calendar would light up two sections at once.
  const activeHref = (() => {
    let best: string | null = null;
    let bestLen = -1;
    for (const g of navGroups) {
      for (const { href } of g.items) {
        const full = `/${locale}${href === '/' ? '' : href}`;
        const matches =
          href === '/'
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname === full || pathname.startsWith(`${full}/`);
        if (matches && full.length > bestLen) {
          best = href;
          bestLen = full.length;
        }
      }
    }
    return best;
  })();

  function isActive(href: string): boolean {
    return href === activeHref;
  }

  // Accordion: auto-open the section that contains the active route.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of navGroups) {
      if (g.section && g.items.some((i) => isActive(i.href))) init[g.section] = true;
    }
    return init;
  });

  function toggleSection(section: string) {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // On open, expand the section holding the current page and scroll that page's
  // row into view — so the menu always shows "you are here". This menu persists
  // across client-side navigation, so the initial auto-open state can be stale
  // (it reflects the first page loaded); re-sync the active section here.
  useEffect(() => {
    if (!open) return;
    const activeSection = navGroups.find(
      (g) => g.section && g.items.some((i) => isActive(i.href)),
    )?.section;
    if (activeSection) {
      setOpenSections((prev) => (prev[activeSection] ? prev : { ...prev, [activeSection]: true }));
    }
    // Wait for the open slide + any section expand (both 300ms) to settle — the
    // nav remounts on open and isn't scrollable until laid out — then glide the
    // current page's row to the centre. Query the row from the DOM at fire time
    // (a ref shared across the nav's key-remount can resolve to null).
    const id = window.setTimeout(() => {
      document
        .getElementById('mobile-menu-demo')
        ?.querySelector('[data-active-row="true"]')
        ?.scrollIntoView({ block: 'center' });
    }, 320);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pathname]);

  function go(modal: AuthModalType) {
    onClose();
    setAuthModal(modal);
  }

  return (
    <>
      <div
        id="mobile-menu-demo"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        {...(!open ? ({ inert: '' } as unknown as React.HTMLAttributes<HTMLDivElement>) : {})}
        className={[
          'bg-background fixed inset-0 z-50 flex flex-col',
          'transition-transform duration-300 ease-out will-change-transform',
          open
            ? 'pointer-events-auto translate-x-0'
            : `pointer-events-none ${rtl ? '-translate-x-full' : 'translate-x-full'}`,
        ].join(' ')}
      >
        {/* Top bar */}
        <div className="border-border flex h-16 flex-shrink-0 items-center justify-between border-b px-[18px]">
          <Link href={`/${locale}`} onClick={onClose} aria-label="Go to home">
            <Image
              src="/images/logo-light.png"
              alt="Newera365"
              width={133}
              height={26}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/images/logo-dark.png"
              alt="Newera365"
              width={133}
              height={26}
              className="hidden dark:block"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label={
                  resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
                }
                className="text-foreground dark:bg-surface flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#f4f4f5] transition-colors"
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
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="hover:bg-accent/20 dark:hover:bg-accent/30 flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-black/10 text-black transition-colors dark:bg-white/10 dark:text-white"
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

        {/* Nav — scrollable; remounts on open to replay the staggered entrance */}
        <nav
          key={open ? 'open' : 'closed'}
          className="scrollbar-hide flex-1 overflow-y-auto px-[18px] pb-6 pt-2"
        >
          {navGroups.map((group, gi) => {
            // Home (no section) — direct link
            if (!group.section) {
              const item = group.items[0]!;
              const active = isActive(item.href);
              return (
                <Link
                  key="__home"
                  href={`/${locale}${item.href === '/' ? '' : item.href}`}
                  onClick={onClose}
                  style={{ animationDelay: `${gi * 40}ms` }}
                  className={`${
                    open ? 'motion-safe:animate-rise-in' : ''
                  } -mx-3 mt-1 flex items-center justify-between rounded-[12px] px-3 py-[14px] transition-colors ${
                    active
                      ? 'bg-accent/[0.08]'
                      : 'hover:bg-accent/[0.06] dark:hover:bg-accent/[0.10]'
                  }`}
                >
                  <span
                    className={`font-body text-[18px] font-semibold ${
                      active ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            const sectionOpen = !!openSections[group.section];
            const sectionActive = group.items.some((i) => isActive(i.href));

            return (
              <div
                key={group.section}
                style={{ animationDelay: `${gi * 40}ms` }}
                className={`border-border border-b ${open ? 'motion-safe:animate-rise-in' : ''}`}
              >
                <button
                  onClick={() => toggleSection(group.section!)}
                  aria-expanded={sectionOpen}
                  className="flex w-full items-center justify-between py-[15px] text-start"
                >
                  <span
                    className={`font-body text-[15px] font-semibold tracking-[0.2px] ${
                      sectionActive ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {group.section}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    className={`text-muted flex-shrink-0 transition-transform duration-300 ${
                      sectionOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Collapsible body — grid-rows 0fr→1fr animates to the section's
                    NATURAL height, so tall sections (Education, 11 rows) never
                    clip. A fixed max-height used to cut off the Tools group. */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    sectionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="pb-2">
                      {group.items.map(({ label, href }) => {
                        const active = isActive(href);
                        return (
                          <Link
                            key={href}
                            data-active-row={active ? 'true' : undefined}
                            href={`/${locale}${href === '/' ? '' : href}`}
                            onClick={onClose}
                            className={`group flex items-center justify-between rounded-[12px] px-3 py-[11px] transition-colors ${
                              active
                                ? 'bg-accent/10 dark:bg-accent/[0.11]'
                                : 'hover:bg-accent/[0.06] dark:hover:bg-accent/[0.10]'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <NavIcon
                                href={href}
                                size={19}
                                className={
                                  active
                                    ? 'text-accent'
                                    : 'text-foreground/70 group-hover:text-accent transition-colors'
                                }
                              />
                              <span
                                className={`font-body truncate text-[15px] transition-colors ${
                                  active
                                    ? 'text-accent font-semibold'
                                    : 'text-foreground/70 group-hover:text-accent font-medium'
                                }`}
                              >
                                {label}
                              </span>
                            </span>
                            <svg
                              width="6"
                              height="10"
                              viewBox="0 0 7 12"
                              fill="none"
                              aria-hidden="true"
                              className={`flex-shrink-0 transition-colors ${
                                active ? 'text-accent' : 'text-muted group-hover:text-accent'
                              } ${rtl ? 'rotate-180' : ''}`}
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
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom CTAs */}
        <div className="border-border bg-background flex flex-shrink-0 flex-col gap-2.5 border-t px-[18px] py-4">
          <button
            onClick={() => go('register')}
            className="font-body bg-accent hover:bg-accent-hover flex h-[48px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white transition-colors"
          >
            {t('getStarted')}
          </button>
          <button
            onClick={() => go('demo')}
            className="font-body border-border text-foreground hover:border-accent hover:text-accent flex h-[48px] w-full items-center justify-center rounded-full border text-[15px] font-medium transition-colors"
          >
            {t('signIn')}
          </button>
        </div>
      </div>

      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}

export { MobileMenuDemo };
