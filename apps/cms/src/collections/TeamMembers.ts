import type { CollectionConfig } from 'payload/types';
import { localizationFields, slugField } from './_fields';
import { ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers the /about team section.
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    group: 'Company',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'status', 'locale'],
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('team-members')],
    beforeChange: [ensureTranslationKey],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100 },
    slugField('name'),
    {
      name: 'role',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: { description: 'Job title shown under the name.' },
    },
    { name: 'bio', type: 'textarea', maxLength: 400 },
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
    ...localizationFields,
  ],
};
