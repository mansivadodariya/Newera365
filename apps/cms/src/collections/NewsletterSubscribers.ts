import type { CollectionConfig } from 'payload/types';

// Double opt-in subscriber records. Synced to Mailchimp via /api/newsletter/*.
// Not publicly readable — admin only.
export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'status', 'locale'] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'confirmed', 'unsubscribed'],
    },
    { name: 'locale', type: 'select', options: ['en', 'ar'], defaultValue: 'en' },
    { name: 'confirmationToken', type: 'text', index: true },
    { name: 'consentAt', type: 'date' },
    {
      name: 'utm',
      type: 'group',
      fields: [
        { name: 'source', type: 'text' },
        { name: 'medium', type: 'text' },
        { name: 'campaign', type: 'text' },
      ],
    },
  ],
};
