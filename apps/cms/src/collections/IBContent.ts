import type { CollectionConfig } from 'payload/types';
import { slugify } from './_fields';

// Powers /trade/ib (Partners page). One document per deployment.
// Create with slug "ib-program" to be picked up by getIBContent().
export const IBContent: CollectionConfig = {
  slug: 'ib-content',
  admin: {
    group: 'Trade',
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'status'],
    description: 'IB & Partners page copy. One document per deployment — use slug "ib-program".',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Content identifier. Use "ib-program" (one document per env).' },
      hooks: {
        beforeValidate: [({ value }) => (value ? slugify(String(value)) : value)],
      },
    },
    // Hero
    {
      name: 'heroSubtitle',
      type: 'textarea',
      localized: true,
      maxLength: 220,
      admin: { description: 'Subtitle beneath the hero heading.' },
    },
    // Partner program card descriptions
    {
      name: 'ibDescription',
      type: 'textarea',
      localized: true,
      maxLength: 220,
      admin: { description: 'Introducing Broker card description.' },
    },
    {
      name: 'affiliateDescription',
      type: 'textarea',
      localized: true,
      maxLength: 220,
      admin: { description: 'Affiliate card description.' },
    },
    {
      name: 'whiteLabelDescription',
      type: 'textarea',
      localized: true,
      maxLength: 220,
      admin: { description: 'White Label card description.' },
    },
    // Business-critical commission numbers — not localized (same in all languages)
    {
      name: 'ibRateDisplay',
      type: 'text',
      maxLength: 20,
      admin: { description: 'IB commission rate shown in the stats grid, e.g. "$8/lot".' },
    },
    {
      name: 'affiliateCpaMax',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Max affiliate CPA payout shown in stats, e.g. "$1,200".' },
    },
    // Onboarding steps — 4 items expected
    {
      name: 'steps',
      type: 'array',
      admin: { description: '"How it works" onboarding steps. Keep to 4 items.' },
      fields: [
        { name: 'stepTitle', type: 'text', required: true, localized: true },
        { name: 'stepDescription', type: 'textarea', required: true, localized: true },
      ],
    },
    // Bottom CTA section
    {
      name: 'ctaHeading',
      type: 'text',
      localized: true,
      maxLength: 120,
      admin: { description: 'Bottom CTA section heading.' },
    },
    {
      name: 'ctaSubtitle',
      type: 'textarea',
      localized: true,
      maxLength: 200,
      admin: { description: 'Bottom CTA section body text.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
  ],
};
