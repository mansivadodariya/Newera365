import type { CollectionConfig } from 'payload/types';
import { allowAnyCategory, publicReadWhere, seoFields, slugField } from './_fields';
import CategorySelect from '../components/CategorySelect';

const BLOG_CATEGORIES = ['market-news', 'analysis', 'tutorials', 'company-updates'];

// Powers /blog (listing) and /blog/[slug] (article).
export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    group: 'Editorial',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedDate'],
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
      defaultValue: () => new Date().toISOString(),
      admin: { description: 'Sort key on /blog listing. Defaults to creation time if left blank.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: BLOG_CATEGORIES,
      validate: allowAnyCategory(true),
      admin: { components: { Field: CategorySelect(BLOG_CATEGORIES) } },
    },
    {
      name: 'author',
      type: 'text',
      maxLength: 100,
      localized: true,
      admin: { description: 'Display name only.' },
    },
    { name: 'excerpt', type: 'textarea', maxLength: 300, localized: true },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', required: true, localized: true },
    ...seoFields,
  ],
};
