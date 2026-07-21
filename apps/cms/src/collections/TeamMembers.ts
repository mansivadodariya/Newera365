import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, slugField } from './_fields';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const teamMemberPaths = () => localePaths(['/company/about']);

// Powers the /about team section.
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    group: 'Company',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'status'],
  },
  access: { read: publicReadWhere({ status: { equals: 'active' } }) },
  hooks: {
    afterChange: [createRevalidationHook(teamMemberPaths)],
    afterDelete: [createRevalidationDeleteHook(teamMemberPaths)],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100, localized: true },
    slugField('name'),
    {
      name: 'role',
      type: 'text',
      required: true,
      maxLength: 100,
      localized: true,
      admin: { description: 'Job title shown under the name.' },
    },
    { name: 'bio', type: 'textarea', maxLength: 400, localized: true },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Headshot — 400x400px minimum.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order in the team grid.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive'],
      admin: { description: 'Inactive members are hidden from /about without deletion.' },
    },
  ],
};
