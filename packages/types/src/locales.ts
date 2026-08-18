export const LOCALES = ['en', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Locales that render right-to-left and require a full layout flip. */
export const RTL_LOCALES: readonly Locale[] = ['ar'];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function dir(locale: Locale): 'ltr' | 'rtl' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}
