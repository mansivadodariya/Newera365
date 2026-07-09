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
    // Hero stat band — 4 headline partnership metrics (client IB deck).
    // Values only; the eyebrow/sub labels stay in next-intl (statUpTo, statPerMonth, etc).
    {
      name: 'heroStat1Value',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Hero stat 1 value, e.g. "$5,000" (up to / per month).' },
    },
    {
      name: 'heroStat2Value',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Hero stat 2 value, e.g. "15" (up to / per lot).' },
    },
    {
      name: 'heroStat3Value',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Hero stat 3 value, e.g. "3" (earning streams).' },
    },
    {
      name: 'heroStat4Value',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Hero stat 4 value, e.g. "4" (target markets).' },
    },
    // Monthly income ladder — balance-to-income slabs. Also drives the
    // interactive estimator's salary lookup so display and calc share one source.
    {
      name: 'incomeLadder',
      type: 'array',
      maxRows: 10,
      labels: { singular: 'Ladder Slab', plural: 'Ladder Slabs' },
      admin: {
        description:
          'Monthly income ladder rows, lowest balance first. Drives both the display table ' +
          'and the interactive estimator’s salary lookup.',
      },
      fields: [
        {
          name: 'balanceLabel',
          type: 'text',
          required: true,
          maxLength: 40,
          admin: { description: 'Balance range shown, e.g. "$30,000 to $50,000" or "$500,000+".' },
        },
        {
          name: 'minBalance',
          type: 'number',
          required: true,
          admin: { description: 'Numeric floor of this slab, used by the estimator lookup.' },
        },
        {
          name: 'incomeValue',
          type: 'text',
          required: true,
          maxLength: 20,
          admin: { description: 'Monthly income for this slab, e.g. "$500".' },
        },
        {
          name: 'isTopSlab',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Highlight as the top slab (accent background + badge).' },
        },
      ],
    },
    // Rebate matrix — per-instrument spread/commission/rebate by tier (Raw/Standard/Pro).
    {
      name: 'rebateTables',
      type: 'array',
      maxRows: 6,
      labels: { singular: 'Rebate Table', plural: 'Rebate Tables' },
      admin: { description: 'One table per instrument group. Tier order: Raw, Standard, Pro.' },
      fields: [
        {
          name: 'instrumentNameEn',
          type: 'text',
          required: true,
          maxLength: 40,
          admin: { description: 'Instrument group name — EN, e.g. "Gold (XAU/USD)".' },
        },
        {
          name: 'instrumentNameAr',
          type: 'text',
          required: true,
          maxLength: 40,
          admin: { description: 'Instrument group name — AR.' },
        },
        {
          name: 'rows',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          labels: { singular: 'Tier Row', plural: 'Tier Rows' },
          admin: { description: 'Exactly 3 rows, in order: Raw, Standard, Pro.' },
          fields: [
            {
              name: 'spread',
              type: 'text',
              required: true,
              maxLength: 20,
              admin: { description: 'Spread in points, e.g. "7-8".' },
            },
            {
              name: 'commission',
              type: 'text',
              required: true,
              maxLength: 20,
              admin: { description: 'Commission per lot, e.g. "10" or "0".' },
            },
            {
              name: 'rebate',
              type: 'text',
              required: true,
              maxLength: 20,
              admin: { description: 'Rebate per lot, e.g. "3".' },
            },
          ],
        },
      ],
    },
    // FTD eligibility — both conditions required in the same monthly cycle.
    {
      name: 'ftdCap',
      type: 'text',
      maxLength: 20,
      admin: { description: 'FTD deposit condition value, e.g. "USD 10,000".' },
    },
    {
      name: 'ftdMinLots',
      type: 'text',
      maxLength: 20,
      admin: { description: 'FTD minimum-lots condition value, e.g. "50".' },
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
