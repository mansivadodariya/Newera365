import type { CollectionConfig } from 'payload/types';

// Powers /trade/funding — deposit and withdrawal methods.
// Not locale-aware: payment method names and specs are global.
// UI labels (e.g. "Instant", "None") are translated via i18n in the component.
export const PaymentMethods: CollectionConfig = {
  slug: 'payment-methods',
  admin: {
    group: 'Trading',
    useAsTitle: 'name',
    defaultColumns: ['name', 'methodType', 'status', 'sortOrder'],
    description: 'Manage deposit/withdrawal methods shown on the /trade/funding page.',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: { description: 'Display name, e.g. "Visa / Mastercard".' },
    },
    {
      name: 'methodType',
      type: 'select',
      required: true,
      options: [
        { label: 'Card (Visa / Mastercard)', value: 'card' },
        { label: 'Bank Wire (SWIFT / SEPA)', value: 'bank' },
        { label: 'E-Wallet (Skrill, Neteller…)', value: 'ewallet' },
        { label: 'Cryptocurrency', value: 'crypto' },
        { label: 'Local Bank Transfer', value: 'local' },
      ],
      admin: { description: 'Used for grouping and icon selection.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Payment method logo (optional). Shown alongside the name.' },
    },
    {
      name: 'depositTime',
      type: 'text',
      maxLength: 80,
      localized: true,
      admin: { description: 'Deposit processing time, e.g. "Instant" or "1–2 business days".' },
    },
    {
      name: 'withdrawalTime',
      type: 'text',
      maxLength: 80,
      localized: true,
      admin: { description: 'Withdrawal processing time, e.g. "1–3 business days".' },
    },
    {
      name: 'minDeposit',
      type: 'text',
      maxLength: 30,
      localized: true,
      admin: { description: 'Minimum deposit amount, e.g. "$10" or "€50".' },
    },
    {
      name: 'fee',
      type: 'text',
      maxLength: 50,
      localized: true,
      admin: { description: 'Fee description, e.g. "None" or "1.5%".' },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 200,
      localized: true,
      admin: { description: 'Optional small-print notes shown under the method row.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order on the funding page (lower = higher).' },
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
      admin: { description: 'Inactive methods are hidden from the website.' },
    },
  ],
};
