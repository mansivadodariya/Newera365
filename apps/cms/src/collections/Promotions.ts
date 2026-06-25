import type { CollectionConfig } from 'payload/types';
import { publicReadWhere, seoFields, slugField } from './_fields';
import CategorySelect from '../components/CategorySelect';

const PROMO_TAGS = ['NEW', 'MONTHLY', 'PERMANENT', 'LIMITED', 'EXCLUSIVE'];

// Powers /trade/promotions — promotional offers, bonuses, and campaigns.
export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    group: 'Trading',
    useAsTitle: 'title',
    defaultColumns: ['title', 'tag', 'status', 'activeTo'],
    description: 'Manage promotional cards shown on the /trade/promotions page.',
  },
  access: { read: publicReadWhere({ status: { equals: 'active' } }) },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      localized: true,
      admin: { description: 'Promotion headline, e.g. "Welcome Boost — Up to $5,000".' },
    },
    slugField('title'),
    {
      name: 'valueDisplay',
      type: 'text',
      maxLength: 60,
      localized: true,
      admin: {
        description:
          'Large hero value shown on the card in accent colour, e.g. "Up to $5,000", "50% rebate", "$500". Keep it short.',
      },
    },
    {
      name: 'tag',
      type: 'text',
      maxLength: 20,
      localized: true,
      admin: {
        description: 'Short badge label shown on the card. Pick one or type a new tag.',
        components: { Field: CategorySelect(PROMO_TAGS) },
      },
    },
    {
      name: 'tagColor',
      type: 'select',
      defaultValue: 'accent',
      options: [
        { label: 'Green (accent)', value: 'accent' },
        { label: 'Amber', value: 'amber' },
        { label: 'Blue', value: 'blue' },
        { label: 'Purple', value: 'purple' },
        { label: 'Red', value: 'red' },
        { label: 'Grey', value: 'grey' },
      ],
      admin: { description: 'Badge colour.' },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 300,
      required: true,
      localized: true,
      admin: { description: 'Card body — visible at a glance.' },
    },
    {
      name: 'terms',
      type: 'textarea',
      maxLength: 500,
      localized: true,
      admin: { description: 'Small-print terms shown at the bottom of the card.' },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      maxLength: 50,
      localized: true,
      admin: { description: 'Button text, e.g. "Claim Now".' },
    },
    {
      name: 'ctaHref',
      type: 'text',
      admin: { description: 'Button destination URL (absolute or /en/register style).' },
    },
    {
      name: 'isHighlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Pin this promo to the top of the listing.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Manual display order (lower = higher on page).' },
    },
    {
      name: 'activeFrom',
      type: 'date',
      admin: { description: 'Optional: promo start date. Leave blank for evergreen promos.' },
    },
    {
      name: 'activeTo',
      type: 'date',
      admin: { description: 'Optional: promo expiry date. Leave blank for evergreen promos.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: { description: 'Inactive promos are hidden from the website.' },
    },
    ...seoFields,
  ],
};
