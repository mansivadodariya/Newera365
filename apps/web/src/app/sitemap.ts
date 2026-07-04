import type { MetadataRoute } from 'next';
import { LOCALES } from '@newera365/types';
import { getBlogPosts, getGuides, getResearchArticles } from '@/lib/cms';

// .trim() first: a stray trailing newline in the Vercel env var was leaking into
// sitemap/robots URLs as `https://host%0A/en`. Strip whitespace, then trailing slashes.
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  .trim()
  .replace(/\/+$/, '');

// Curated public routes. Transactional/utility pages (newsletter confirmation
// landings) are intentionally omitted — they should not be indexed.
const STATIC_PATHS = [
  '',
  '/trade/accounts',
  '/trade/funding',
  '/trade/fees',
  '/trade/promotions',
  '/trade/ib',
  '/markets/forex',
  '/markets/indices',
  '/markets/commodities',
  '/markets/stocks',
  '/markets/etfs',
  '/markets/crypto',
  '/platform/mt5',
  '/platform/webtrader',
  '/education',
  '/education/media',
  '/education/webinars',
  '/education/audio',
  '/ebooks',
  '/glossary',
  '/guides',
  '/research',
  '/research/analyst-chart',
  '/education/blog',
  '/daily-news',
  '/tools',
  '/tools/spread-comparator',
  '/tools/calendar',
  '/tools/watchlist',
  '/tools/fibonacci',
  '/tools/pivot',
  '/tools/profit',
  '/company/about',
  '/company/careers',
  '/company/awards',
  '/company/media-press',
  '/faqs',
  '/contact',
  '/legal',
  '/newsletter',
  '/live-chat',
];

// Build one entry per locale, each pointing to all locale alternates (hreflang).
function entry(
  path: string,
  opts: {
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}${path}`]));
  return LOCALES.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency ?? 'weekly',
    priority: opts.priority ?? 0.6,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push(...entry(path, { priority: path === '' ? 1 : 0.6 }));
  }

  // Dynamic, CMS-driven routes. Slugs are locale-neutral, so 'en' is sufficient.
  // Wrapped so a CMS outage at build time degrades to the static map, never a
  // failed build.
  try {
    const [blog, guides, research] = await Promise.all([
      getBlogPosts('en', 100),
      getGuides('en'),
      getResearchArticles('en', 100),
    ]);
    for (const p of blog) entries.push(...entry(`/education/blog/${p.slug}`, { priority: 0.5 }));
    for (const g of guides) entries.push(...entry(`/guides/${g.slug}`, { priority: 0.5 }));
    for (const r of research) entries.push(...entry(`/research/${r.slug}`, { priority: 0.5 }));
  } catch {
    // CMS unreachable — ship the static map only.
  }

  return entries;
}
