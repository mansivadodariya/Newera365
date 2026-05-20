import type { CollectionConfig } from 'payload/types';
import { localizationFields, slugField } from './_fields';
import { ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers /awards and /media (press mentions).
export const CompanyContent: CollectionConfig = {
  slug: 'company-content',
  admin: {
    group: 'Company',
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'status', 'locale', 'date'],
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('company-content')],
    beforeChange: [ensureTranslationKey],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: { description: 'Award name or press headline.' },
    },
    slugField('title'),
    {
      name: 'section',
      type: 'select',
      required: true,
      options: ['awards', 'press'],
      admin: { description: 'Determines which page this item appears on.' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { description: 'Award or article date. Drives sort order.' },
    },
    { name: 'description', type: 'textarea', maxLength: 300 },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description: 'Optional extended content. Shown on the detail view for press items.',
        condition: (data) => data?.section === 'press',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: { description: 'Link to the original article or award body.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Awarding body logo or publication masthead.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Manual display order within section.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
    ...localizationFields,
  ],
};
