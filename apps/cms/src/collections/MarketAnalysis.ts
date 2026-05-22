import type { CollectionConfig } from 'payload/types';
import { localizationFields, seoFields, slugField } from './_fields';
import { ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers /market-analysis (listing) and /market-analysis/[slug] (article).
export const MarketAnalysis: CollectionConfig = {
  slug: 'market-analysis',
  admin: {
    group: 'Editorial',
    useAsTitle: 'title',
    defaultColumns: ['title', 'assetCategory', 'status', 'locale', 'publishedDate'],
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('market-analysis')],
    beforeChange: [ensureTranslationKey],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
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
      name: 'analyst',
      type: 'text',
      maxLength: 100,
      admin: { description: 'Author display name.' },
    },
    { name: 'body', type: 'richText', required: true },
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

        // Allowlist approach: only a single <iframe> whose src points at
        // tradingview.com is acceptable. A blacklist of event handlers always
        // has gaps (ontouchstart, onanimationend, data: URIs, etc.).
        const trimmed = value.trim();
        // Must be exactly one self-closing or paired iframe tag
        if (!/^<iframe\b[^>]*><\/iframe>$/i.test(trimmed)) {
          return 'Chart embed must be a single TradingView <iframe> tag.';
        }
        // Extract src attribute value
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
        // Reject event handler attributes (on* covers all standard HTML event handlers).
        if (/\bon\w+\s*=/i.test(trimmed)) {
          return 'Chart embed must not contain event handler attributes.';
        }
        // Reject srcdoc — allows arbitrary HTML injection regardless of src.
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
    ...localizationFields,
  ],
};
