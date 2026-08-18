import type { CollectionConfig } from 'payload/types';
import { allowAnyCategory, publicReadWhere, seoFields, slugField } from './_fields';
import CategorySelect from '../components/CategorySelect';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const newsPaths = (doc: { slug?: string }) =>
  localePaths(['/research', ...(doc.slug ? [`/daily-news/${doc.slug}`] : [])]);

const NEWS_CATEGORIES = ['forex', 'commodities', 'indices', 'crypto', 'company', 'regulation'];

// Powers /daily-news and /news-feed.
export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    group: 'Editorial',
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'category', 'status', 'publishedDate'],
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  hooks: {
    afterChange: [createRevalidationHook(newsPaths)],
    afterDelete: [createRevalidationDeleteHook(newsPaths)],
  },
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
      options: NEWS_CATEGORIES,
      validate: allowAnyCategory(true),
      admin: { components: { Field: CategorySelect(NEWS_CATEGORIES) } },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Article image — shown as the card thumbnail on /daily-news.' },
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
