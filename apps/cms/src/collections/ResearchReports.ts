import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, seoFields, slugField } from './_fields';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const researchReportPaths = (doc: { slug?: string }) =>
  localePaths(['/research', ...(doc.slug ? [`/research/${doc.slug}`] : [])]);

// Powers /research — gated PDF download section. PDFs served via R2 signed URL.
export const ResearchReports: CollectionConfig = {
  slug: 'research-reports',
  admin: {
    group: 'Editorial',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'isGated', 'publishedDate'],
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  hooks: {
    afterChange: [createRevalidationHook(researchReportPaths)],
    afterDelete: [createRevalidationDeleteHook(researchReportPaths)],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200, localized: true },
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
      localized: true,
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
  ],
};
