import type { CollectionConfig } from 'payload/types';
import { publishFields, seoField } from './_fields';

// Powers /research (gated PDFs) — Template I. Downloads served via R2 signed URLs.
export const ResearchReports: CollectionConfig = {
  slug: 'research-reports',
  admin: { useAsTitle: 'title' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    ...publishFields,
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'pdf', type: 'upload', relationTo: 'media', required: true },
    { name: 'gated', type: 'checkbox', defaultValue: true },
    seoField,
  ],
};
