import type { CollectionConfig } from 'payload/types';
import { publishFields, seoField } from './_fields';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedAt'] },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    ...publishFields,
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'category', type: 'text', localized: true },
    { name: 'body', type: 'richText', localized: true },
    seoField,
  ],
};
