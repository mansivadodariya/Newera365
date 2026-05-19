import type { CollectionConfig } from 'payload/types';
import { publishFields, seoField } from './_fields';

// Powers /daily-news and /news-feed (Template D).
export const News: CollectionConfig = {
  slug: 'news',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedAt'] },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    ...publishFields,
    { name: 'source', type: 'text' },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'body', type: 'richText', localized: true },
    seoField,
  ],
};
