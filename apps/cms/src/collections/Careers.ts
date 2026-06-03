import type { CollectionConfig } from 'payload/types';
import { seoFields, slugField } from './_fields';

// Powers /careers — job listings.
export const Careers: CollectionConfig = {
  slug: 'careers',
  admin: {
    group: 'Company',
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'status', 'publishedDate'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 100, localized: true },
    slugField('title'),
    {
      name: 'department',
      type: 'select',
      required: true,
      options: [
        'engineering',
        'design',
        'marketing',
        'sales',
        'operations',
        'compliance',
        'support',
        'finance',
      ],
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      maxLength: 100,
      localized: true,
      admin: { description: 'e.g. "Remote" or "Dubai, UAE".' },
    },
    {
      name: 'employmentType',
      type: 'select',
      required: true,
      options: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    },
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 300,
      localized: true,
      admin: { description: 'Listing card preview.' },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      admin: { description: 'Responsibilities, requirements, benefits.' },
    },
    {
      name: 'applyUrl',
      type: 'text',
      admin: { description: 'External application URL. Falls back to /contact if empty.' },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { description: 'Sort key on /careers listing.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Manual display order override.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: ['open', 'closed'],
      admin: { description: 'Closed listings are hidden from /careers but retained in the CMS.' },
    },
    ...seoFields,
  ],
};
