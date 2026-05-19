import type { CollectionConfig } from 'payload/types';
import { publishFields, seoField } from './_fields';

// Powers /market-analysis, /currency-forecast (Template D / Unique).
export const MarketAnalysis: CollectionConfig = {
  slug: 'market-analysis',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedAt'] },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    ...publishFields,
    {
      name: 'category',
      type: 'select',
      options: ['technical', 'fundamental', 'currency-forecast'],
    },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'body', type: 'richText', localized: true },
    seoField,
  ],
};
