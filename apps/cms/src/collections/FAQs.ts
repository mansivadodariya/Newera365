import type { CollectionConfig } from 'payload/types';
import { publicReadWhere } from './_fields';
import CategorySelect from '../components/CategorySelect';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const faqPaths = () => localePaths(['/support']);

const FAQ_CATEGORIES = [
  'trading',
  'accounts',
  'deposits',
  'withdrawals',
  'platforms',
  'regulation',
  'general',
];

// Powers /faqs — searchable accordion.
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    group: 'Support',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'status'],
  },
  access: { read: publicReadWhere({ status: { equals: 'active' } }) },
  hooks: {
    afterChange: [createRevalidationHook(faqPaths)],
    afterDelete: [createRevalidationDeleteHook(faqPaths)],
  },
  fields: [
    { name: 'question', type: 'text', required: true, maxLength: 300, localized: true },
    { name: 'answer', type: 'richText', required: true, localized: true },
    {
      name: 'category',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: {
        description:
          'Category filter on the FAQ page. Pick an existing one or type a new category.',
        components: { Field: CategorySelect(FAQ_CATEGORIES) },
      },
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
