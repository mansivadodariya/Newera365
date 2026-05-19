import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale negotiation: cookie (manual toggle) > Accept-Language > default.
// Cloudflare adds CF-IPCountry for IP-based detection — wire that in here
// once the Cloudflare account is provisioned (NE-007).
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
