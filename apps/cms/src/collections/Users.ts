import type { CollectionConfig } from 'payload/types';

// CMS admin-panel staff accounts. Not content-locale-specific.
// All users have the admin role — there is no editor tier.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    group: 'Administration',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'enable2fa'],
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'enable2fa',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      label: 'Enable two-factor authentication',
      admin: {
        description:
          'TOTP enforcement (NE-041 / NE-050) is handled by a separate security ticket — this flag records the requirement.',
      },
    },
  ],
};
