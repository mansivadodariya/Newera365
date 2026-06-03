import type { CollectionConfig } from 'payload/types';
import { seoFields, slugField } from './_fields';

// Powers /daily-news and /news-feed.
export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    group: 'Editorial',
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'category', 'status', 'publishedDate'],
  },
  access: { read: () => true },
  fields: [
    { name: 'headline', type: 'text', required: true, maxLength: 200, localized: true },
    slugField('headline'),
    {
      name: 'source',
      type: 'text',
      maxLength: 100,
      admin: { description: 'Publication or wire service.' },
    },
    { name: 'sourceUrl', type: 'text', admin: { description: 'External link to original story.' } },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      index: true,
      admin: { description: 'Sort key on /daily-news.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['forex', 'commodities', 'indices', 'crypto', 'company', 'regulation'],
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      admin: { description: 'Optional full article body.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
    ...seoFields,
  ],
};
