import type { CollectionConfig } from 'payload/types';
import { localizationFields, slugField } from './_fields';
import { ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers the /about → Awards section and any awards carousel on the homepage.
// Dedicated collection so editors manage award entries independently from
// general company content (press mentions, milestones, etc.).
export const Awards: CollectionConfig = {
  slug: 'awards',
  admin: {
    group: 'Company',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'status', 'locale'],
    description: 'Industry awards and recognition received by NewEra365.',
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('awards')],
    beforeChange: [ensureTranslationKey],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: { description: 'Full award name, e.g. "Best Forex Broker MENA 2024".' },
    },
    slugField('title'),
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Date the award was received or announced. Used for sorting.',
        date: { displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 500,
      admin: { description: 'Short summary of the award and awarding body (shown on cards).' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Awarding body logo. SVG or transparent PNG preferred. Displayed alongside the award title.',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Optional link to the award announcement or awarding body website.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Manual display order — lower numbers appear first. Use to pin featured awards to the top.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
    },
    ...localizationFields,
  ],
};
