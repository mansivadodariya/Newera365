import type { CollectionConfig } from 'payload/types';

// Captures POST /api/webinars/register submissions. Admin-only (mirrors
// NewsletterSubscribers). Written via the local API from the custom endpoint,
// which enforces validation + rate limiting. No Zoom dependency — registrations
// are stored here and confirmed by a Resend email.
export const WebinarRegistrations: CollectionConfig = {
  slug: 'webinar-registrations',
  admin: {
    group: 'Education',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'webinar', 'locale', 'registeredAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'webinar',
      type: 'relationship',
      relationTo: 'webinars',
      required: true,
      admin: { readOnly: true },
    },
    { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true, index: true, admin: { readOnly: true } },
    {
      name: 'locale',
      type: 'select',
      required: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
      ],
      admin: { readOnly: true },
    },
    { name: 'registeredAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'consentIpHash',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'SHA-256 hash of the registration IP. Raw IP is never stored.',
      },
    },
  ],
};
