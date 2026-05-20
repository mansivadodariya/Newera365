import type { CollectionConfig } from 'payload/types';
import { localizationFields } from './_fields';
import { ensureTranslationKey } from '../hooks';

// Powers /faqs — searchable accordion.
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    group: 'Support',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'status', 'locale'],
  },
  access: { read: () => true },
  hooks: {
    beforeChange: [ensureTranslationKey],
  },
  fields: [
    { name: 'question', type: 'text', required: true, maxLength: 300 },
    { name: 'answer', type: 'richText', required: true },
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
    ...localizationFields,
  ],
};
