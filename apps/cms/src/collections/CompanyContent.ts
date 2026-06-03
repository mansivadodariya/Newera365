import type { CollectionConfig } from 'payload/types';
import { slugField } from './_fields';

// Powers /about (press mentions section).
export const CompanyContent: CollectionConfig = {
  slug: 'company-content',
  admin: {
    group: 'Company',
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'status', 'date'],
  },
  access: { read: () => true },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      localized: true,
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
    { name: 'description', type: 'textarea', maxLength: 300, localized: true },
    {
      name: 'body',
      type: 'richText',
      localized: true,
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
  ],
};
