import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { LOCALES, DEFAULT_LOCALE } from '@newera365/types';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Always prefix: /en/... and /ar/... — IP detection happens in middleware.
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
