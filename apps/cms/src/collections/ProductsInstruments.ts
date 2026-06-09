import type { CollectionConfig } from 'payload/types';
import Mt5SyncStatusCell from '../components/Mt5SyncStatusCell';

// Powers all 6 Markets pages, the 3 calculator widgets, and /fees-charges.
// Language-neutral — instrument specs are not locale-specific.
//
// MT5 DATA TOGGLE (per instrument)
// ---------------------------------
// usesMT5Data = true  → /api/mt5/instruments fetches live data from the MT5
//   bridge at request time. The "Manual Trading Data" block is hidden in the
//   admin UI — there is nothing for the editor to fill in.
// usesMT5Data = false → The MT5 bridge is bypassed for this instrument. The
//   "Manual Trading Data" block becomes visible and the editor must supply
//   spread / swap values directly. The frontend will display these CMS values
//   instead of live MT5 figures.
//
// A site-wide master switch also exists in Site Settings → MT5 Integration.
// When that global toggle is OFF, ALL instruments fall back to CMS data
// regardless of this per-instrument setting.
export const ProductsInstruments: CollectionConfig = {
  slug: 'products-instruments',
  admin: {
    group: 'Trading Data',
    useAsTitle: 'name',
    defaultColumns: ['name', 'symbol', 'assetClass', 'usesMT5Data', 'mt5SyncStatus', 'status'],
    description:
      'Each instrument can pull live data from MT5 or be updated manually. Use the "Use MT5 Live Data" toggle per row to switch modes.',
  },
  access: { read: () => true },
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: { description: 'Display name shown to traders, e.g. EUR/USD.' },
    },
    {
      name: 'symbol',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Uppercase lookup key used by the frontend and calculators, e.g. EURUSD.',
      },
    },
    {
      name: 'mt5Symbol',
      type: 'text',
      admin: {
        description:
          'Exact symbol string in the MT5 Manager API feed — must match the broker server precisely. Required when "Use MT5 Live Data" is ON.',
      },
    },
    {
      name: 'assetClass',
      type: 'select',
      required: true,
      options: ['forex', 'commodities', 'indices', 'stocks', 'etfs', 'crypto'],
    },

    // ── MT5 Data Toggle ─────────────────────────────────────────────────────
    {
      name: 'usesMT5Data',
      type: 'checkbox',
      label: 'Use MT5 Live Data',
      defaultValue: true,
      admin: {
        description:
          'ON → live spread, swap and price data is fetched from the MT5 bridge at request time (recommended). ' +
          'OFF → the "Manual Trading Data" section below becomes editable and its values are served to the frontend instead.',
      },
    },

    // ── Manual Trading Data (only shown when MT5 toggle is OFF) ─────────────
    {
      type: 'collapsible',
      label: 'Manual Trading Data  —  visible only when "Use MT5 Live Data" is OFF',
      admin: {
        // Reveal this entire block only when the admin has turned MT5 sync OFF.
        condition: (data) => data?.usesMT5Data === false,
        initCollapsed: false,
        description:
          'Fill these values when the MT5 bridge is disabled for this instrument. They will be served directly to the frontend.',
      },
      fields: [
        {
          name: 'spread',
          type: 'number',
          admin: { description: 'Spread in pips, e.g. 0.1 for EUR/USD.' },
        },
        {
          name: 'swapLong',
          type: 'number',
          admin: {
            description: 'Long overnight swap in points/day (negative = cost to hold buy).',
          },
        },
        {
          name: 'swapShort',
          type: 'number',
          admin: { description: 'Short overnight swap in points/day.' },
        },
      ],
    },

    // ── Static Specification (always visible) ───────────────────────────────
    {
      type: 'collapsible',
      label: 'Instrument Specification',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'leverage',
          type: 'text',
          admin: { description: 'Max leverage display string, e.g. 1:500.' },
        },
        {
          name: 'marginRequirement',
          type: 'number',
          admin: { description: 'Margin % — e.g. 0.2 means 0.2%.' },
        },
        {
          name: 'contractSize',
          type: 'number',
          admin: { description: 'Units per standard lot. Used by the Margin Calculator.' },
        },
        {
          name: 'tradingHours',
          type: 'text',
          admin: { description: 'e.g. Mon-Fri 00:00–24:00 UTC.' },
        },
        {
          name: 'minTradeSize',
          type: 'number',
          admin: { description: 'Minimum lots, e.g. 0.01.' },
        },
        {
          name: 'pipValue',
          type: 'number',
          admin: {
            description: 'Value per pip per standard lot in USD. Used by the Pip Value Calculator.',
          },
        },
        {
          name: 'tickSize',
          type: 'number',
          admin: {
            description:
              'Minimum price increment (tick). Used by the Swap and Profit/Loss calculators.',
          },
        },
        // ── Spread Comparator fields ─────────────────────────────────────────
        {
          name: 'spreadIndustry',
          type: 'number',
          admin: {
            description:
              'Industry-average spread (pips/points) used as the benchmark bar in the Spread Comparator.',
          },
        },
        {
          name: 'spreadStandard',
          type: 'number',
          admin: {
            description: 'Standard account spread shown in the Spread Comparator.',
          },
        },
        {
          name: 'spreadRaw',
          type: 'number',
          admin: {
            description: 'Raw account spread (near-zero) shown in the Spread Comparator.',
          },
        },
        {
          name: 'spreadVip',
          type: 'number',
          admin: {
            description: 'VIP account spread shown in the Spread Comparator.',
          },
        },
        // ── Calculator swap rates (static published rates, not live MT5 data) ─
        {
          name: 'swapRateLong',
          type: 'number',
          admin: {
            description:
              'Published long (buy) swap rate per lot per day in USD — shown in the Swap Calculator. Negative = cost to hold.',
          },
        },
        {
          name: 'swapRateShort',
          type: 'number',
          admin: {
            description:
              'Published short (sell) swap rate per lot per day in USD — shown in the Swap Calculator.',
          },
        },
      ],
    },

    // ── Admin / Display ─────────────────────────────────────────────────────
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Left-to-right / top-to-bottom display order within the asset class.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive'],
    },

    // ── MT5 Sync Status (written by the background sync job) ────────────────
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
            description: 'Set automatically by the background MT5 sync job. Not editable here.',
            components: {
              Cell: Mt5SyncStatusCell,
            },
          },
        },
        {
          name: 'mt5LastSyncedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Timestamp of the last MT5 sync attempt for this instrument.',
            date: { displayFormat: 'dd/MM/yyyy HH:mm:ss' },
          },
        },
        {
          name: 'mt5SyncFailureReason',
          type: 'text',
          admin: {
            readOnly: true,
            // Only shown when the last sync failed — no point cluttering the UI otherwise.
            condition: (data) => data?.mt5SyncStatus === 'failed',
            description: 'Error detail from the most recent failed sync attempt.',
          },
        },
      ],
    },
  ],
};
