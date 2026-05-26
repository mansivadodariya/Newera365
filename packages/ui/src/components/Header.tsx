'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { MobileMenu } from './MobileMenu';

function HamburgerIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
      <rect y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect y="8.4" width="16" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();

  return (
    <>
      <header className="border-border bg-background sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-5">
        <Link href={`/${locale}`} aria-label="NewEra365 — go to home">
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

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="text-foreground flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#f4f4f5] dark:bg-[#1c1c1c]"
        >
          <HamburgerIcon />
        </button>
      </header>

      {/* Backdrop */}
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
