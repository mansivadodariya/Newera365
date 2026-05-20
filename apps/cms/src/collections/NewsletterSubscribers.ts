import type { CollectionConfig } from 'payload/types';

// Powers the /newsletter double opt-in flow. Synced to Mailchimp via
// /api/newsletter/*. Not publicly readable — admin only. Most fields are
// system-managed and read-only in the admin panel.
export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    group: 'Marketing',
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'locale', 'doubleOptInConfirmed'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      name: 'locale',
      type: 'select',
      required: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: ['pending', 'subscribed', 'unsubscribed'],
      admin: { readOnly: true },
    },
    {
      name: 'source',
      type: 'text',
      admin: { readOnly: true, description: 'Page path where signup occurred.' },
    },
    {
      name: 'consentTimestamp',
      type: 'date',
      admin: { readOnly: true, description: 'GDPR Article 7 — when consent was given.' },
    },
    {
      name: 'consentIpHash',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'SHA-256 hash of the consent IP. Raw IP is never stored.',
      },
    },
    {
      name: 'doubleOptInConfirmed',
      type: 'checkbox',
      admin: { readOnly: true, description: 'Set when the confirmation email link is clicked.' },
    },
    {
      name: 'doubleOptInTimestamp',
      type: 'date',
      admin: { readOnly: true, description: 'When the confirmation link was clicked.' },
    },
    {
      name: 'externalId',
      type: 'text',
      admin: { readOnly: true, description: 'Mailchimp subscriber ID after sync.' },
    },
    {
      name: 'utmParams',
      type: 'json',
      admin: { readOnly: true, description: 'UTM attribution: source, medium, campaign, content.' },
    },
  ],
};
