'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { LanguageToggle } from './LanguageToggle';

type NavGroup = { section: string | null; items: { label: string; href: string }[] };

function useNavGroups(t: ReturnType<typeof useTranslations<'nav'>>): NavGroup[] {
  return [
    { section: null, items: [{ label: t('home'), href: '/' }] },
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
      items: [{ label: t('marketsInstrumentsLabel'), href: '/markets/instruments' }],
    },
    {
      section: t('sectionPlatform'),
      items: [
        { label: t('platformOverviewLabel'), href: '/platform/mt5' },
        { label: t('platformWebtraderLabel'), href: '/platform/webtrader' },
        { label: t('toolsAiCrmLabel'), href: '/tools/ai-crm' },
      ],
    },
    {
      section: t('sectionEducationHub'),
      items: [
        { label: t('eduHubLabel'), href: '/education' },
        { label: t('eduMediaLabel'), href: '/education/media' },
        { label: t('eduEbooksLabel'), href: '/ebooks' },
        { label: t('eduGlossaryLabel'), href: '/glossary' },
        { label: t('eduGuidesLabel'), href: '/guides' },
      ],
    },
    {
      section: t('sectionResearchAnalysis'),
      items: [
        { label: t('researchArticlesLabel'), href: '/research' },
        { label: t('researchCalendarLabel'), href: '/tools/calendar' },
        { label: t('researchAnalystLabel'), href: '/tools/analyst-chart' },
        { label: t('researchNewsletterLabel'), href: '/newsletter' },
      ],
    },
    {
      section: t('sectionTools'),
      items: [
        { label: t('toolsMarginLabel'), href: '/tools' },
        { label: t('toolsSpreadLabel'), href: '/tools/spread-comparator' },
        { label: t('toolsWatchlistLabel'), href: '/tools/watchlist' },
        { label: t('toolsPivotLabel'), href: '/tools/pivot' },
        { label: t('toolsProfitLabel'), href: '/tools/profit' },
        { label: t('toolsFibonacciLabel'), href: '/tools/fibonacci' },
      ],
    },
    {
      section: t('sectionCompany'),
      items: [
        { label: t('companyAboutLabel'), href: '/company/about' },
        { label: t('companyCareersLabel'), href: '/company/careers' },
        { label: t('researchBlogLabel'), href: '/blog' },
      ],
    },
    {
      section: t('sectionLegalSupport'),
      items: [
        { label: t('companyLegalLabel'), href: '/legal' },
        { label: t('companyFaqLabel'), href: '/faqs' },
        { label: t('companyContactLabel'), href: '/contact' },
        { label: t('companyChatLabel'), href: '/live-chat' },
      ],
    },
  ];
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

function MobileMenu({ open, onClose }: MobileMenuProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const navGroups = useNavGroups(t);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function isActive(href: string): boolean {
    const full = `/${locale}${href === '/' ? '' : href}`;
    if (href === '/') return pathname === `/${locale}` || pathname === `/${locale}/`;
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
      {...(!open ? ({ inert: '' } as unknown as React.HTMLAttributes<HTMLDivElement>) : {})}
      className={[
        'bg-background fixed inset-0 z-50 flex flex-col',
        'transition-transform duration-300 ease-out will-change-transform',
        open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full',
      ].join(' ')}
    >
      {/* Top bar */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-[13px] py-[13px]">
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
          <LanguageToggle />
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
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[19px] bg-black/10 text-black transition-colors hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
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

      {/* Nav groups — scrollable */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-[20px] pb-10 pt-1">
        {navGroups.map((group) => (
          <div key={group.section ?? '__home'} className={group.section ? 'mt-6' : ''}>
            {group.section && (
              <p className="font-body text-accent mb-1 text-[10px] font-semibold uppercase tracking-[1px]">
                {group.section}
              </p>
            )}
            {group.items.map(({ label, href }) => {
              const active = isActive(href);
              const isHomeItem = group.section === null;
              return (
                <Link
                  key={href}
                  href={`/${locale}${href === '/' ? '' : href}`}
                  onClick={onClose}
                  className="group flex items-center justify-between px-0 py-[14px]"
                >
                  <span
                    className={`font-body transition-colors ${
                      isHomeItem ? 'text-[18px] font-semibold' : 'text-[16px] font-medium'
                    } ${active ? 'text-accent' : 'text-foreground group-hover:text-accent'}`}
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
    </div>
  );
}

export { MobileMenu };
