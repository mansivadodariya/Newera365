import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

// Locale negotiation: cookie (manual toggle) > Accept-Language > default.
// Cloudflare adds CF-IPCountry for IP-based detection — wire that in here
// once the Cloudflare account is provisioned (NE-007).
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  try {
    return intlMiddleware(request);
  } catch (err) {
    // Locale negotiation failed (e.g. malformed Accept-Language). Fall back
    // to the default locale rather than returning a 500.
    // eslint-disable-next-line no-console
    console.error('Locale negotiation failed', err);
    const url = new URL(`/${routing.defaultLocale}`, request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
