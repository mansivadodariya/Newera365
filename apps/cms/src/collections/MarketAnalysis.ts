import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, seoFields, slugField } from './_fields';

// Powers /market-analysis (listing) and /market-analysis/[slug] (article).
export const MarketAnalysis: CollectionConfig = {
  slug: 'market-analysis',
  admin: {
    group: 'Editorial',
    useAsTitle: 'title',
    defaultColumns: ['title', 'assetCategory', 'status', 'publishedDate'],
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200, localized: true },
    slugField('title'),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: { description: 'Drives listing sort order.' },
    },
    {
      name: 'assetCategory',
      type: 'select',
      required: true,
      options: ['forex', 'commodities', 'indices', 'stocks', 'etfs', 'crypto'],
    },
    {
      name: 'editorialCategory',
      type: 'select',
      options: ['macro', 'strategy', 'analysis', 'education'],
      admin: {
        description:
          'Overrides the asset-based Research page filter. Set to "education" for how-to articles that don\'t belong to a specific asset class.',
      },
    },
    {
      name: 'analyst',
      type: 'text',
      maxLength: 100,
      localized: true,
      admin: { description: 'Author display name.' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Hero image — shown on the /research listing card and the article detail page.',
      },
    },
    { name: 'body', type: 'richText', required: true, localized: true },
    {
      name: 'chartEmbed',
      type: 'textarea',
      admin: {
        description:
          'TradingView embed code only. Server-validated — script tags and inline event handlers are rejected.',
      },
      validate: (value: unknown): true | string => {
        if (value === null || value === undefined || value === '') return true;
        if (typeof value !== 'string') return 'Chart embed must be a string.';

        const trimmed = value.trim();
        if (!/^<iframe\b[^>]*><\/iframe>$/i.test(trimmed)) {
          return 'Chart embed must be a single TradingView <iframe> tag.';
        }
        const srcMatch = trimmed.match(/\bsrc=["']([^"']+)["']/i);
        if (!srcMatch) {
          return 'Chart embed <iframe> must have a src attribute.';
        }
        try {
          const url = new URL(srcMatch[1]);
          const allowed = ['tradingview.com', 's3.tradingview.com', 's.tradingview.com'];
          if (!allowed.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
            return 'Chart embed src must be a tradingview.com URL.';
          }
          if (url.protocol !== 'https:') {
            return 'Chart embed src must use HTTPS.';
          }
        } catch {
          return 'Chart embed src is not a valid URL.';
        }
        if (/\bon\w+\s*=/i.test(trimmed)) {
          return 'Chart embed must not contain event handler attributes.';
        }
        if (/\bsrcdoc\s*=/i.test(trimmed)) {
          return 'Chart embed must not contain a srcdoc attribute.';
        }
        return true;
      },
    },
    {
      name: 'relatedInstruments',
      type: 'relationship',
      relationTo: 'products-instruments',
      hasMany: true,
    },
    ...seoFields,
  ],
};
