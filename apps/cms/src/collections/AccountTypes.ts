import type { CollectionConfig } from 'payload/types';
import Mt5SyncStatusCell from '../components/Mt5SyncStatusCell';

// Powers the /accounts comparison table, /fees-charges, and the Spread
// Comparator widget.
//
// Bilingual support: name, nameAr, features, and featuresAr carry EN and AR
// content respectively. The frontend selects the correct set based on the
// active locale. Using separate fields (rather than Payload's localized:true)
// avoids a destructive drizzle schema migration on existing data.
//
// MT5 DATA TOGGLE (per account type)
// ------------------------------------
// usesMT5Data = true  → the spread and commission values displayed on the
//   frontend are sourced live from the MT5 bridge.
// usesMT5Data = false → the admin fills in spreadFromNumeric and commission
//   manually; those values are served to the frontend.
export const AccountTypes: CollectionConfig = {
  slug: 'account-types',
  admin: {
    group: 'Trading Data',
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'badge',
      'minDeposit',
      'spreadFrom',
      'usesMT5Data',
      'mt5SyncStatus',
      'status',
    ],
    description:
      'Account type records power the comparison table and calculators. Add nameAr / featuresAr for Arabic display.',
  },
  access: { read: () => true },
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: { description: 'Account name in English, e.g. Standard, Professional.' },
    },
    {
      name: 'nameAr',
      type: 'text',
      maxLength: 50,
      admin: { description: 'Account name in Arabic. Shown when the site locale is Arabic.' },
    },
    {
      name: 'badge',
      type: 'select',
      options: [
        { label: 'FREE (Demo)', value: 'free' },
        { label: 'POPULAR (Standard)', value: 'popular' },
        { label: 'PRO (Professional)', value: 'pro' },
        { label: 'ISLAMIC (Swap-Free)', value: 'islamic' },
      ],
      admin: {
        description:
          'Badge displayed on the account card header. Determines subtitle and card styling.',
      },
    },
    {
      name: 'minDeposit',
      type: 'number',
      required: true,
      admin: { description: 'Minimum deposit in USD. Set to 0 for Demo (shown as "Virtual").' },
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
          'ON → live spread and commission figures fetched from the MT5 bridge. ' +
          'OFF → "Manual Spread & Commission" section below becomes editable.',
      },
    },

    // ── Manual Spread & Commission ───────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Manual Spread & Commission  —  visible only when "Use MT5 Live Data" is OFF',
      admin: {
        condition: (data) => data?.usesMT5Data === false,
        initCollapsed: false,
      },
      fields: [
        {
          name: 'spreadFromNumeric',
          type: 'number',
          admin: { description: 'Numeric spread in pips, e.g. 0.0.' },
        },
        {
          name: 'commission',
          type: 'text',
          maxLength: 50,
          admin: { description: 'Commission display string, e.g. "$0" or "$1.5".' },
        },
      ],
    },

    // ── Features (English) ───────────────────────────────────────────────────
    {
      name: 'features',
      type: 'array',
      maxRows: 10,
      labels: { singular: 'Feature (EN)', plural: 'Features (EN)' },
      admin: { description: 'English feature bullet points shown on the comparison card.' },
      fields: [{ name: 'value', type: 'text', required: true, maxLength: 100 }],
    },

    // ── Features (Arabic) ────────────────────────────────────────────────────
    // Stored as newline-separated text to avoid creating a new join table,
    // which would require an interactive Drizzle push confirmation.
    // Frontend splits on '\n' to get the individual feature strings.
    {
      name: 'featuresAr',
      type: 'textarea',
      admin: {
        description: 'Arabic features — one per line. Shown when locale is Arabic.',
      },
    },

    // ── Presentation ─────────────────────────────────────────────────────────
    {
      name: 'isPopular',
      type: 'checkbox',
      admin: {
        description:
          'Renders the green border and "POPULAR" badge (kept for legacy; prefer setting badge = popular).',
      },
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

    // ── MT5 Sync Status ──────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'MT5 Sync Status',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'mt5SyncStatus',
          type: 'select',
          defaultValue: 'never',
          options: [
            { label: 'Never synced', value: 'never' },
            { label: 'Synced', value: 'synced' },
            { label: 'Failed', value: 'failed' },
          ],
          admin: {
            readOnly: true,
            components: { Cell: Mt5SyncStatusCell },
          },
        },
        {
          name: 'mt5LastSyncedAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { displayFormat: 'dd/MM/yyyy HH:mm:ss' },
          },
        },
        {
          name: 'mt5SyncFailureReason',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data) => data?.mt5SyncStatus === 'failed',
          },
        },
      ],
    },
  ],
};
