import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, slugField } from './_fields';
import CategorySelect from '../components/CategorySelect';

const AWARD_CATEGORIES = [
  'Execution',
  'Service',
  'Innovation',
  'Regulation',
  'Platform',
  'Trading',
];

// Powers the /about → Awards section and any awards carousel on the homepage.
export const Awards: CollectionConfig = {
  slug: 'awards',
  admin: {
    group: 'Company',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'status'],
    description: 'Industry awards and recognition received by NewEra365.',
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      localized: true,
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
      localized: true,
      admin: { description: 'Short summary of the award and awarding body (shown on cards).' },
    },
    {
      name: 'awardCategory',
      type: 'text',
      maxLength: 50,
      admin: {
        description:
          'Filter category on /company/awards (e.g. Execution, Service, Innovation). Pick one or type a new category.',
        components: { Field: CategorySelect(AWARD_CATEGORIES) },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Awarding body logo. SVG or transparent PNG preferred.',
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
      admin: { description: 'Manual display order — lower numbers appear first.' },
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
