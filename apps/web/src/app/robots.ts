import type { MetadataRoute } from 'next';

// .trim() first: a stray trailing newline in the Vercel env var was leaking into
// sitemap/robots URLs as `https://host%0A/en`. Strip whitespace, then trailing slashes.
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  .trim()
  .replace(/\/+$/, '');

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
