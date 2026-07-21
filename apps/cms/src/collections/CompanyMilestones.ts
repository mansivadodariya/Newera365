import type { CollectionConfig } from 'payload/types';
import { publicReadWhere } from './_fields';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const companyMilestonePaths = () => localePaths(['/company/about']);

// Powers the /company/about "journey" timeline (the scroll-coupled rail).
// `label` + `description` are localized so EN and AR each carry their own copy;
// `year` and `sortOrder` are non-localized (a number/label shared across locales).
export const CompanyMilestones: CollectionConfig = {
  slug: 'company-milestones',
  admin: {
    group: 'Company',
    useAsTitle: 'year',
    defaultColumns: ['year', 'label', 'sortOrder', 'status'],
    description: 'Timeline milestones shown on the About page journey, in display order.',
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
  hooks: {
    afterChange: [createRevalidationHook(companyMilestonePaths)],
    afterDelete: [createRevalidationDeleteHook(companyMilestonePaths)],
  },
  fields: [
    {
      name: 'year',
      type: 'text',
      required: true,
      maxLength: 10,
      admin: { description: 'Year shown in the mono label, e.g. "2014".' },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      maxLength: 120,
      localized: true,
      admin: { description: 'Short milestone title, e.g. "Founded".' },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 400,
      localized: true,
      admin: { description: 'One-sentence detail about the milestone.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order — lower numbers appear first (top of the timeline).' },
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
