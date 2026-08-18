import type { CollectionConfig } from 'payload/types';
import { publicReadWhere } from './_fields';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const mediaPressPaths = () => localePaths(['/company/recognition']);

// Powers the /company/media-press page — press coverage, media kit downloads, media inquiries.
export const MediaPress: CollectionConfig = {
  slug: 'media-press',
  admin: {
    group: 'Company',
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'publication', 'date', 'status'],
    description: 'Press coverage, media mentions, and brand asset downloads for Newera365.',
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  hooks: {
    afterChange: [createRevalidationHook(mediaPressPaths)],
    afterDelete: [createRevalidationDeleteHook(mediaPressPaths)],
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      maxLength: 300,
      localized: true,
      admin: { description: 'Article headline as it appeared in the publication.' },
    },
    {
      name: 'publication',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: { description: 'Name of the publication or outlet (e.g. "Bloomberg", "Reuters").' },
    },
    {
      name: 'publicationAr',
      type: 'text',
      maxLength: 100,
      admin: {
        description:
          'Arabic name of the publication (optional). The Arabic site falls back to the English name when blank.',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Publication date.',
        date: { displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'url',
      type: 'text',
      maxLength: 500,
      admin: { description: 'External link to the article (optional — may be behind paywall).' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 400,
      localized: true,
      admin: { description: 'Short excerpt or summary of the article shown on the press card.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Publication logo. SVG or transparent PNG preferred.' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Show this item in the "Latest from the newsroom" featured section.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first in the listing.' },
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
  ],
};
