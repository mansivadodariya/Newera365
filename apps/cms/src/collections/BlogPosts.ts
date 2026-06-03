import type { CollectionConfig } from 'payload/types';
import { seoFields, slugField } from './_fields';

// Powers /blog (listing) and /blog/[slug] (article).
export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    group: 'Editorial',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedDate'],
  },
  access: { read: () => true },
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
    { name: 'publishedDate', type: 'date', admin: { description: 'Sort key on /blog listing.' } },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['market-news', 'analysis', 'tutorials', 'company-updates'],
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
