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
      admin: { description: 'TradingView embed code. Sanitised on render.' },
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
