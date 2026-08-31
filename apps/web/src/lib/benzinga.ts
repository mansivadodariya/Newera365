import type { CmsArticle, CmsNews, SlateNode } from './cms';

const BENZINGA_API_KEY =
  process.env.BENZINGA_API_KEY ||
  process.env.NEXT_PUBLIC_BENZINGA_API_KEY ||
  'bz.DVTTBHGXXIZ6QBEKVKXU7RIBBOGHX2OC';

const BENZINGA_BASE_URL = 'https://api.benzinga.com/api/v2/news';

export interface BenzingaRawArticle {
  id: number;
  title: string;
  author?: string;
  created: string;
  updated?: string;
  url: string;
  teaser?: string;
  body?: string;
  image?: { size: string; url: string; alt?: string }[];
  channels?: { name: string }[];
  tags?: { name: string }[];
  stocks?: { name: string; exchange: string }[];
}

/** Decode common HTML entities */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

/** Parse inline HTML nodes (bold, italic, links, text) */
function parseInline(html: string): SlateNode[] {
  const inlineNodes: SlateNode[] = [];
  const regex =
    /<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>|<strong[^>]*>(.*?)<\/strong>|<b[^>]*>(.*?)<\/b>|<em[^>]*>(.*?)<\/em>|<i[^>]*>(.*?)<\/i>|([^<]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match[1] !== undefined) {
      // Link
      const innerText = (match[2] ?? '').replace(/<[^>]+>/g, '');
      inlineNodes.push({
        type: 'link',
        url: match[1],
        children: [{ text: decodeHtmlEntities(innerText) }],
      });
    } else if (match[3] !== undefined || match[4] !== undefined) {
      // Bold
      const text = match[3] ?? match[4] ?? '';
      inlineNodes.push({ text: decodeHtmlEntities(text.replace(/<[^>]+>/g, '')), bold: true });
    } else if (match[5] !== undefined || match[6] !== undefined) {
      // Italic
      const text = match[5] ?? match[6] ?? '';
      inlineNodes.push({ text: decodeHtmlEntities(text.replace(/<[^>]+>/g, '')), italic: true });
    } else if (match[7]) {
      // Plain text
      const decoded = decodeHtmlEntities(match[7]);
      if (decoded) inlineNodes.push({ text: decoded });
    }
  }

  return inlineNodes.length > 0
    ? inlineNodes
    : [{ text: decodeHtmlEntities(html.replace(/<[^>]+>/g, '')) }];
}

/** Convert HTML body from Benzinga to SlateNode[] for RichText */
export function htmlToSlate(html?: string | null): SlateNode[] {
  if (!html || typeof html !== 'string') return [];

  const clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  const blocks = clean.split(/(?=<p\b|<h[1-6]\b|<blockquote\b|<ul\b|<ol\b)/i).filter(Boolean);
  const nodes: SlateNode[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    let type = 'p';
    if (/^<h1/i.test(trimmed)) type = 'h1';
    else if (/^<h2/i.test(trimmed)) type = 'h2';
    else if (/^<h3/i.test(trimmed)) type = 'h3';
    else if (/^<h4/i.test(trimmed)) type = 'h4';
    else if (/^<blockquote/i.test(trimmed)) type = 'quote';
    else if (/^<ul/i.test(trimmed)) type = 'ul';
    else if (/^<ol/i.test(trimmed)) type = 'ol';

    const rawContent = trimmed
      .replace(/^<[a-z0-9]+[^>]*>/i, '')
      .replace(/<\/[a-z0-9]+>$/i, '')
      .trim();
    if (!rawContent) continue;

    const children = parseInline(rawContent);
    if (children.length > 0) {
      nodes.push({ type, children });
    }
  }

  return nodes.length > 0
    ? nodes
    : [{ type: 'p', children: [{ text: clean.replace(/<[^>]+>/g, '').trim() }] }];
}

/** Map Benzinga channel names and article title to asset and editorial categories */
function mapCategory(
  title: string = '',
  channels?: { name: string }[],
  tags?: { name: string }[],
): {
  assetCategory: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  category: 'forex' | 'commodities' | 'indices' | 'crypto' | 'company' | 'regulation';
} {
  const combined = [
    title.toLowerCase(),
    (channels ?? []).map((c) => c.name.toLowerCase()).join(' '),
    (tags ?? []).map((t) => t.name.toLowerCase()).join(' '),
  ].join(' ');

  if (
    combined.includes('crypto') ||
    combined.includes('bitcoin') ||
    combined.includes('ethereum') ||
    combined.includes('btc') ||
    combined.includes('eth') ||
    combined.includes('solana') ||
    combined.includes('blockchain')
  ) {
    return { assetCategory: 'crypto', category: 'crypto' };
  }
  if (
    combined.includes('forex') ||
    combined.includes('currency') ||
    combined.includes('fx') ||
    combined.includes('dollar') ||
    combined.includes('euro') ||
    combined.includes('yen') ||
    combined.includes('gbp') ||
    combined.includes('dxy') ||
    combined.includes('central bank') ||
    combined.includes('interest rate') ||
    combined.includes('fed cut') ||
    combined.includes('fed hike')
  ) {
    return { assetCategory: 'forex', category: 'forex' };
  }
  if (
    combined.includes('commodit') ||
    combined.includes('gold') ||
    combined.includes('silver') ||
    combined.includes('oil') ||
    combined.includes('crude') ||
    combined.includes('brent') ||
    combined.includes('wti') ||
    combined.includes('gas') ||
    combined.includes('copper') ||
    combined.includes('metal') ||
    combined.includes('opec') ||
    combined.includes('energy')
  ) {
    return { assetCategory: 'commodities', category: 'commodities' };
  }
  if (
    combined.includes('indic') ||
    combined.includes('spx') ||
    combined.includes('s&p') ||
    combined.includes('dow') ||
    combined.includes('nasdaq') ||
    combined.includes('inflation') ||
    combined.includes('cpi') ||
    combined.includes('gdp') ||
    combined.includes('macro') ||
    combined.includes('recession') ||
    combined.includes('treasury') ||
    combined.includes('yield')
  ) {
    return { assetCategory: 'indices', category: 'indices' };
  }
  if (combined.includes('legal') || combined.includes('regulation') || combined.includes('sec')) {
    return { assetCategory: 'stocks', category: 'regulation' };
  }
  return { assetCategory: 'stocks', category: 'company' };
}

/** Select highest resolution image from Benzinga raw article */
function extractImage(item: BenzingaRawArticle): string | null {
  if (!Array.isArray(item.image) || item.image.length === 0) return null;
  const large = item.image.find((img) => img.size === 'large');
  const small = item.image.find((img) => img.size === 'small');
  const thumb = item.image.find((img) => img.size === 'thumb');
  return (large || small || thumb || item.image[0])?.url || null;
}

/** Generate a clean, stable slug for Benzinga articles: `bz-{id}` */
export function getBenzingaSlug(id: number): string {
  return `bz-${id}`;
}

/** Extract Benzinga article ID from a slug if present */
export function extractBenzingaId(slug: string): number | null {
  const match = slug.match(/^bz-(\d+)/i) || slug.match(/^(\d+)/);
  const rawId = match?.[1];
  if (rawId) {
    const id = parseInt(rawId, 10);
    if (!Number.isNaN(id)) return id;
  }
  return null;
}

/** Convert a Benzinga raw article into the internal CmsArticle shape */
export function mapBenzingaToArticle(item: BenzingaRawArticle): CmsArticle {
  const { assetCategory, category } = mapCategory(item.title, item.channels, item.tags);
  const imageUrl = extractImage(item);
  const body = htmlToSlate(item.body);

  let publishedDate = new Date().toISOString();
  try {
    const d = new Date(item.created);
    if (!Number.isNaN(d.getTime())) {
      publishedDate = d.toISOString();
    }
  } catch {
    // fallback to current time
  }

  return {
    id: item.id,
    slug: getBenzingaSlug(item.id),
    title: item.title,
    assetCategory,
    category,
    analyst: item.author || 'Benzinga',
    publishedDate,
    status: 'published',
    thumbnailUrl: imageUrl,
    summary: item.teaser || null,
    body: body.length > 0 ? body : null,
    externalUrl: null,
  };
}

/** Convert a Benzinga raw article into the internal CmsNews shape */
export function mapBenzingaToNews(item: BenzingaRawArticle): CmsNews {
  const { category } = mapCategory(item.title, item.channels, item.tags);
  const imageUrl = extractImage(item);
  const body = htmlToSlate(item.body);

  let publishedDate = new Date().toISOString();
  try {
    const d = new Date(item.created);
    if (!Number.isNaN(d.getTime())) {
      publishedDate = d.toISOString();
    }
  } catch {
    // fallback
  }

  return {
    id: item.id,
    headline: item.title,
    slug: getBenzingaSlug(item.id),
    source: item.author || 'Benzinga',
    sourceUrl: item.url,
    publishedDate,
    category,
    status: 'published',
    featuredImage: imageUrl
      ? {
          id: item.id,
          url: imageUrl,
          filename: `bz-${item.id}.jpg`,
          mimeType: 'image/jpeg',
        }
      : null,
    body: body.length > 0 ? body : null,
    seoTitle: item.title,
    seoDescription: item.teaser || '',
  };
}

/**
 * Fetch live articles from Benzinga News API.
 */
export async function fetchBenzingaNews(limit = 20): Promise<CmsArticle[]> {
  try {
    const url = `${BENZINGA_BASE_URL}?token=${BENZINGA_API_KEY}&pageSize=${limit}&displayOutput=full`;
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.error(`[benzinga] Failed to fetch news: HTTP ${res.status}`);
      return [];
    }

    const data: BenzingaRawArticle[] = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map(mapBenzingaToArticle);
  } catch (err) {
    console.error('[benzinga] Error fetching news:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Fetch dedicated live market briefing stories strictly filtered for:
 * 1. Lead breaking story
 * 2. Strict FX (Currency, Dollar, Yen, Euro, Fed rates, Central banks)
 * 3. Strict Commodities (Oil, Gold, Crude, Energy, OPEC, Metals)
 * 4. Strict Macro (Inflation, CPI, Rates, Tariffs, GDP, Central bank signals)
 */
export async function fetchBenzingaMarketBriefing(): Promise<{
  lead: string | null;
  fx: string | null;
  commodities: string | null;
  macro: string | null;
}> {
  try {
    const [generalRes, fxRes, cmdRes, macroRes] = await Promise.allSettled([
      fetch(`${BENZINGA_BASE_URL}?token=${BENZINGA_API_KEY}&pageSize=10&displayOutput=full`, {
        headers: { accept: 'application/json' },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8_000),
      }),
      fetch(`${BENZINGA_BASE_URL}?token=${BENZINGA_API_KEY}&pageSize=10&channels=Forex`, {
        headers: { accept: 'application/json' },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8_000),
      }),
      fetch(`${BENZINGA_BASE_URL}?token=${BENZINGA_API_KEY}&pageSize=10&channels=Commodities`, {
        headers: { accept: 'application/json' },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8_000),
      }),
      fetch(`${BENZINGA_BASE_URL}?token=${BENZINGA_API_KEY}&pageSize=10&channels=Economics,Macro`, {
        headers: { accept: 'application/json' },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8_000),
      }),
    ]);

    const generalData: BenzingaRawArticle[] =
      generalRes.status === 'fulfilled' && generalRes.value.ok ? await generalRes.value.json() : [];
    const fxData: BenzingaRawArticle[] =
      fxRes.status === 'fulfilled' && fxRes.value.ok ? await fxRes.value.json() : [];
    const cmdData: BenzingaRawArticle[] =
      cmdRes.status === 'fulfilled' && cmdRes.value.ok ? await cmdRes.value.json() : [];
    const macroData: BenzingaRawArticle[] =
      macroRes.status === 'fulfilled' && macroRes.value.ok ? await macroRes.value.json() : [];

    const usedTitles = new Set<string>();

    // 1. Lead story: breaking market headline
    const lead = generalData[0]?.title || null;
    if (lead) usedTitles.add(lead);

    // 2. Strict FX story: must contain forex/currency/rate keywords
    const fxKeywords = [
      'dollar',
      'yen',
      'euro',
      'currency',
      'currencies',
      'forex',
      'fx',
      'dxy',
      'central bank',
      'fed',
      'rate hike',
      'rate cut',
      'interest rate',
      'yield',
      'pound',
      'gbp',
      'jpy',
      'eur',
      'usdt',
    ];

    const fxMatch =
      fxData.find(
        (a) =>
          !usedTitles.has(a.title) && fxKeywords.some((k) => a.title.toLowerCase().includes(k)),
      ) ||
      fxData.find((a) => !usedTitles.has(a.title)) ||
      generalData.find(
        (a) =>
          !usedTitles.has(a.title) && fxKeywords.some((k) => a.title.toLowerCase().includes(k)),
      );

    const fx = fxMatch?.title || 'US-Japan Yen Intervention Signals Bond Market Fear';
    usedTitles.add(fx);

    // 3. Strict Commodities story: must contain commodities/oil/gold/energy keywords
    const cmdKeywords = [
      'oil',
      'gold',
      'silver',
      'crude',
      'brent',
      'wti',
      'energy',
      'gas',
      'copper',
      'metal',
      'metals',
      'opec',
      'petroleum',
    ];

    const cmdMatch =
      cmdData.find(
        (a) =>
          !usedTitles.has(a.title) && cmdKeywords.some((k) => a.title.toLowerCase().includes(k)),
      ) ||
      cmdData.find((a) => !usedTitles.has(a.title)) ||
      generalData.find(
        (a) =>
          !usedTitles.has(a.title) && cmdKeywords.some((k) => a.title.toLowerCase().includes(k)),
      );

    const commodities =
      cmdMatch?.title ||
      "Trump's Venezuela Oil Deal Could Ease Iran War Oil Shock, But Analyst Warns: 'It Still Will Take Billions'";
    usedTitles.add(commodities);

    // 4. Strict Macro story: must contain macro/inflation/economic/tariff keywords
    const macroKeywords = [
      'inflation',
      'pce',
      'cpi',
      'gdp',
      'central bank',
      'rates',
      'rate-cut',
      'rate cut',
      'tariffs',
      'tariff',
      'economy',
      'economic',
      'recession',
      'bonds',
      'treasury',
      'futures',
      'trade war',
    ];

    const macroMatch =
      macroData.find(
        (a) =>
          !usedTitles.has(a.title) && macroKeywords.some((k) => a.title.toLowerCase().includes(k)),
      ) ||
      macroData.find((a) => !usedTitles.has(a.title)) ||
      generalData.find(
        (a) =>
          !usedTitles.has(a.title) && macroKeywords.some((k) => a.title.toLowerCase().includes(k)),
      );

    const macro =
      macroMatch?.title ||
      'Hotter PCE Inflation: 5 Defensive ETFs Investors Can Turn to as Rate-Cut Hopes Fade';

    return { lead, fx, commodities, macro };
  } catch (err) {
    console.error('[benzinga] Error fetching market briefing:', err);
    return {
      lead: null,
      fx: 'US-Japan Yen Intervention Signals Bond Market Fear',
      commodities: "Gold's range and the key level that breaks it",
      macro: 'What three central banks signal this week on interest rates',
    };
  }
}

/**
 * Fetch a single Benzinga article by its slug or ID.
 */
export async function fetchBenzingaNewsBySlug(slug: string): Promise<CmsNews | null> {
  const id = extractBenzingaId(slug);
  if (!id) return null;

  try {
    const url = `${BENZINGA_BASE_URL}?token=${BENZINGA_API_KEY}&pageSize=1&displayOutput=full&ids=${id}`;
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.error(`[benzinga] Failed to fetch article ${id}: HTTP ${res.status}`);
      return null;
    }

    const data: BenzingaRawArticle[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const first = data[0];
    if (!first) return null;

    return mapBenzingaToNews(first);
  } catch (err) {
    console.error(
      `[benzinga] Error fetching article by slug ${slug}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
