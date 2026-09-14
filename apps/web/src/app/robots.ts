import type { MetadataRoute } from 'next';

const defaultUrl =
  process.env.NODE_ENV === 'production' ? 'https://newera365.com' : 'http://localhost:3000';
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? defaultUrl).trim().replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep transactional/utility landings and API proxies out of the index.
      disallow: ['/api/', '/*/newsletter/confirmed', '/*/newsletter/unsubscribed'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
