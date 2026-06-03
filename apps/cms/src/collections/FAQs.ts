import type { CollectionConfig } from 'payload/types';

// Powers /faqs — searchable accordion.
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    group: 'Support',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'status'],
  },
  access: { read: () => true },
  fields: [
    { name: 'question', type: 'text', required: true, maxLength: 300, localized: true },
    { name: 'answer', type: 'richText', required: true, localized: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        'trading',
        'accounts',
        'deposits',
        'withdrawals',
        'platforms',
        'regulation',
        'general',
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order within category.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive'],
    },
  ],
};
