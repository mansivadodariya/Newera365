import type { CollectionConfig } from 'payload/types';

// Powers /accounts comparison table (Unique template). MT5 supplies live
// spread figures; this collection holds the editorial copy and ordering.
export const AccountTypes: CollectionConfig = {
  slug: 'account-types',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'minDeposit'] },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'mt5Group', type: 'text', admin: { description: 'MT5 group name for live data lookup' } },
    { name: 'minDeposit', type: 'number' },
    { name: 'maxLeverage', type: 'number' },
    { name: 'spreadType', type: 'select', options: ['raw', 'standard', 'fixed'] },
    { name: 'features', type: 'array', fields: [{ name: 'label', type: 'text', localized: true }] },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
};
