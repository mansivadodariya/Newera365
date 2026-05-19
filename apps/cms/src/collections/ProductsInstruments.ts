import type { CollectionConfig } from 'payload/types';

// Static product metadata for the 6 Markets pages (Template A). Live spreads/
// swaps come from the MT5 bridge at request time — NOT stored here.
export const ProductsInstruments: CollectionConfig = {
  slug: 'products-instruments',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'assetClass', 'mt5Symbol'] },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'mt5Symbol', type: 'text', required: true, unique: true, index: true },
    {
      name: 'assetClass',
      type: 'select',
      required: true,
      options: ['forex', 'commodities', 'indices', 'stocks', 'etfs', 'crypto'],
    },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
};
