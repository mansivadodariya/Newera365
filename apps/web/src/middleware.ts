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
    const { pathname } = request.nextUrl;
    // If already on the default locale path, pass through to avoid a redirect loop.
    if (
      pathname === `/${routing.defaultLocale}` ||
      pathname.startsWith(`/${routing.defaultLocale}/`)
    ) {
      return NextResponse.next();
    }
    const url = new URL(`/${routing.defaultLocale}${pathname}`, request.url);
    const response = NextResponse.redirect(url);
    // Cookie ensures subsequent requests don't re-trigger locale negotiation
    // via the same malformed header.
    response.cookies.set('NEXT_LOCALE', routing.defaultLocale, { path: '/', sameSite: 'lax' });
    return response;
  }
}

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
