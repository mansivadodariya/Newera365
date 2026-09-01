import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, seoFields, slugField } from './_fields';
import {
  archivePreviousLegalVersion,
  createRevalidationHook,
  createRevalidationDeleteHook,
  localePaths,
} from '../hooks';

const legalPaths = () => localePaths(['/legal']);

// Powers /terms, /privacy-policy, /client-agreement, /aml-policy, /cookie-policy.
// Only one published document per pageType + locale may be live — publishing a
// new version auto-archives the previous one (archivePreviousLegalVersion).
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    group: 'Compliance',
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'status', 'effectiveDate'],
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  hooks: {
    afterChange: [archivePreviousLegalVersion, createRevalidationHook(legalPaths)],
    afterDelete: [createRevalidationDeleteHook(legalPaths)],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200, localized: true },
    slugField('title'),
    {
      name: 'pageType',
      type: 'select',
      required: true,
      options: [
        'terms',
        'privacy-policy',
        'aml-policy',
        'cookie-policy',
        'website-terms',
        'anti-fraud-policy',
        'conflicts-of-interest',
        'complaint-handling',
        'deposit-withdrawal',
        'order-execution',
        'suspicious-activity-reporting',
        'client-agreement',
      ],
      admin: { description: 'One published document per type per locale.' },
    },
    { name: 'body', type: 'richText', required: true, localized: true },
    {
      name: 'effectiveDate',
      type: 'date',
      required: true,
      admin: { description: 'Date this version came into effect.' },
    },
    {
      name: 'version',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Human-readable label, e.g. "v2.1".' },
    },
    {
      name: 'riskWarningBanner',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'If populated, overrides the global site-wide risk banner on this page. Text supplied by client (NE-038).',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
    ...seoFields,
  ],
};
