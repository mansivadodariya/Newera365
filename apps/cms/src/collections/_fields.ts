import type { Field } from 'payload/types';

/** SEO group reused across content collections. */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  fields: [
    { name: 'metaTitle', type: 'text', localized: true },
    { name: 'metaDescription', type: 'textarea', localized: true },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
  ],
};

/** Publish-state + slug pattern shared by article-style collections. */
export const publishFields: Field[] = [
  { name: 'slug', type: 'text', required: true, unique: true, index: true },
  {
    name: 'status',
    type: 'select',
    defaultValue: 'draft',
    options: ['draft', 'published'],
  },
  { name: 'publishedAt', type: 'date' },
];
