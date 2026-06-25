import type { MetadataRoute } from 'next';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

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
