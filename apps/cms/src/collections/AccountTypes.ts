import type { CollectionConfig } from 'payload/types';

// Powers the /accounts comparison table, /fees-charges, and the Spread
// Comparator widget. Language-neutral.
//
// MT5 DATA TOGGLE (per account type)
// ------------------------------------
// usesMT5Data = true  → the spread and commission values displayed on the
//   frontend are sourced live from the MT5 bridge. "Manual Spread & Commission"
//   is hidden in the admin UI.
// usesMT5Data = false → the admin fills in spreadFromNumeric and commission
//   manually; those values are served to the frontend.
//
// The site-wide master switch in Site Settings → MT5 Integration overrides this
// per-account-type toggle when set to OFF.
export const AccountTypes: CollectionConfig = {
  slug: 'account-types',
  admin: {
    group: 'Trading Data',
    useAsTitle: 'name',
    defaultColumns: ['name', 'minDeposit', 'spreadFrom', 'usesMT5Data', 'status'],
    description:
      'Account type records power the comparison table and calculators. Toggle "Use MT5 Live Data" per account to switch between live and manual spread data.',
  },
  access: { read: () => true },
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: { description: 'Account type name shown to traders, e.g. Standard, Pro, ECN.' },
    },
    {
      name: 'minDeposit',
      type: 'number',
      required: true,
      admin: { description: 'Minimum deposit in USD.' },
    },
    {
      name: 'spreadFrom',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: { description: 'Human-readable display string, e.g. "From 0.0 pips". Always shown.' },
    },
    {
      name: 'leverage',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: { description: 'Max leverage display string, e.g. "Up to 1:500".' },
    },
    {
      name: 'platforms',
      type: 'select',
      required: true,
      hasMany: true,
      options: ['mt5', 'web-trader', 'mobile'],
    },

    // ── MT5 Data Toggle ─────────────────────────────────────────────────────
    {
      name: 'usesMT5Data',
      type: 'checkbox',
      label: 'Use MT5 Live Data',
      defaultValue: true,
      admin: {
        description:
          'ON → live spread and commission figures for this account type are fetched from the MT5 bridge. ' +
          'OFF → the "Manual Spread & Commission" section below becomes editable and its values are displayed to traders.',
      },
    },

    // ── Manual Spread & Commission (only shown when MT5 toggle is OFF) ───────
    {
      type: 'collapsible',
      label: 'Manual Spread & Commission  —  visible only when "Use MT5 Live Data" is OFF',
      admin: {
        condition: (data) => data?.usesMT5Data === false,
        initCollapsed: false,
        description:
          'Fill these when the MT5 bridge is disabled for this account type. They replace live MT5 figures in the Spread Comparator and fees table.',
      },
      fields: [
        {
          name: 'spreadFromNumeric',
          type: 'number',
          admin: {
            description:
              'Numeric spread in pips used for sorting in the Spread Comparator widget, e.g. 0.0.',
          },
        },
        {
          name: 'commission',
          type: 'text',
          maxLength: 50,
          admin: {
            description: 'Commission display string, e.g. "$0" or "$7 per lot round-turn".',
          },
        },
      ],
    },

    // ── Features & Presentation ─────────────────────────────────────────────
    {
      name: 'features',
      type: 'array',
      maxRows: 10,
      labels: { singular: 'Feature', plural: 'Features' },
      admin: { description: 'Bullet-point feature list displayed on the comparison card.' },
      fields: [{ name: 'value', type: 'text', required: true, maxLength: 100 }],
    },
    {
      name: 'isPopular',
      type: 'checkbox',
      admin: { description: 'Renders the "Most Popular" badge on this account card.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Left-to-right display order on the comparison table.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive'],
    },
  ],
};
