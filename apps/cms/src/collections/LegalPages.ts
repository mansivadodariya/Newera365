import type { CollectionConfig } from 'payload/types';
import { localizationFields, seoFields, slugField } from './_fields';
import { archivePreviousLegalVersion, ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers /terms, /privacy-policy, /risk-disclosure, /aml-policy, /cookie-policy.
// Only one published document per pageType + locale is served — publishing a
// new version auto-archives the previous one (archivePreviousLegalVersion).
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    group: 'Compliance',
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'status', 'locale', 'effectiveDate'],
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('legal-pages')],
    beforeChange: [ensureTranslationKey],
    afterChange: [archivePreviousLegalVersion],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    slugField('title'),
    {
      name: 'pageType',
      type: 'select',
      required: true,
      options: ['terms', 'privacy-policy', 'risk-disclosure', 'aml-policy', 'cookie-policy'],
      admin: { description: 'One published document per type per locale.' },
    },
    { name: 'body', type: 'richText', required: true },
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
    ...localizationFields,
  ],
};
