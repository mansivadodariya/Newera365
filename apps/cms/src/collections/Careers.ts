import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, seoFields, slugField } from './_fields';
import CategorySelect from '../components/CategorySelect';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const careerPaths = () => localePaths(['/company/careers']);

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'Legal',
  'Customer Support',
];
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'];

// Powers /careers — job listings.
export const Careers: CollectionConfig = {
  slug: 'careers',
  admin: {
    group: 'Company',
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'status', 'publishedDate'],
  },
  access: { read: publicReadWhere({ status: { equals: 'open' } }) },
  hooks: {
    afterChange: [createRevalidationHook(careerPaths)],
    afterDelete: [createRevalidationDeleteHook(careerPaths)],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 100, localized: true },
    slugField('title'),
    {
      name: 'department',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: {
        description:
          'Department filter on /careers. Pick an existing one or type a new department.',
        components: { Field: CategorySelect(DEPARTMENTS) },
      },
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
      type: 'text',
      required: true,
      maxLength: 50,
      admin: {
        description:
          'Employment type shown on job cards. Pick an existing one or type a new value.',
        components: { Field: CategorySelect(EMPLOYMENT_TYPES) },
      },
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
