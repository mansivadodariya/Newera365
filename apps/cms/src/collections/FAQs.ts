import type { CollectionConfig } from 'payload/types';

// Powers /faqs searchable accordion (Unique template).
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'category'] },
  access: { read: () => true },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'richText', required: true, localized: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['trading', 'accounts', 'platform', 'deposits', 'legal'],
    },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
};
