import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, slugify } from './_fields';

// Powers /trade/ib (Partners page). One document per deployment — getIBContent()
// reads the first published document, so the slug value is not significant.
export const IBContent: CollectionConfig = {
  slug: 'ib-content',
  admin: {
    group: 'Trading',
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'status'],
    description: 'IB & Partners page copy. The first published document is used.',
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
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
    // Commission $-values stay global; word-label stats are localized for Arabic.
    {
      name: 'ibTag',
      type: 'text',
      localized: true,
      maxLength: 40,
      admin: { description: 'Badge label on the IB card, e.g. "MOST POPULAR".' },
    },
    {
      name: 'ibRateDisplay',
      type: 'text',
      maxLength: 20,
      admin: { description: 'IB commission rate shown in the stats grid, e.g. "$8/lot".' },
    },
    {
      name: 'ibPayoutsFrequency',
      type: 'text',
      localized: true,
      maxLength: 20,
      admin: { description: 'Payout frequency stat, e.g. "Monthly".' },
    },
    {
      name: 'ibMinimum',
      type: 'text',
      localized: true,
      maxLength: 20,
      admin: { description: 'Minimum requirement stat, e.g. "None".' },
    },
    {
      name: 'affiliateTag',
      type: 'text',
      maxLength: 40,
      admin: { description: 'Badge label on the Affiliate card, e.g. "CPA".' },
    },
    {
      name: 'affiliateCpaMax',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Max affiliate CPA payout shown in stats, e.g. "$1,200".' },
    },
    {
      name: 'affiliateCookieDays',
      type: 'text',
      localized: true,
      maxLength: 20,
      admin: { description: 'Cookie window stat, e.g. "90 days".' },
    },
    {
      name: 'affiliateMinCpa',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Minimum CPA stat, e.g. "$50".' },
    },
    {
      name: 'wlTag',
      type: 'text',
      localized: true,
      maxLength: 40,
      admin: { description: 'Badge label on the White Label card, e.g. "ENTERPRISE".' },
    },
    {
      name: 'wlSetupTime',
      type: 'text',
      localized: true,
      maxLength: 20,
      admin: { description: 'Setup time stat, e.g. "< 30 days".' },
    },
    {
      name: 'wlSpreadMarkup',
      type: 'text',
      localized: true,
      maxLength: 20,
      admin: { description: 'Spread mark-up stat, e.g. "Custom".' },
    },
    {
      name: 'wlTechStack',
      type: 'text',
      localized: true,
      maxLength: 20,
      admin: { description: 'Tech stack stat, e.g. "Turnkey".' },
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
