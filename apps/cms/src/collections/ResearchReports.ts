import type { CollectionConfig } from 'payload/types';
import { localizationFields, seoFields, slugField } from './_fields';
import { ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers /research — gated PDF download section. PDFs served via R2 signed URL.
export const ResearchReports: CollectionConfig = {
  slug: 'research-reports',
  admin: {
    group: 'Editorial',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'isGated', 'locale', 'publishedDate'],
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('research-reports')],
    beforeChange: [ensureTranslationKey],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    slugField('title'),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
    { name: 'publishedDate', type: 'date', required: true, admin: { description: 'Sort key.' } },
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 500,
      admin: { description: 'Listing card preview text.' },
    },
    {
      name: 'reportFile',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'PDF (max 50 MB). Served via signed URL after the email gate.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Report cover image.' },
    },
    {
      name: 'isGated',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Require an email submission before serving the PDF.' },
    },
    ...seoFields,
    ...localizationFields,
  ],
};
