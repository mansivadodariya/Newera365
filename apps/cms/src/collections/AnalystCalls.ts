import type { CollectionConfig } from 'payload/types';
import { allowAnyCategory, publicReadWhere } from './_fields';
import CategorySelect from '../components/CategorySelect';
import { createRevalidationHook, createRevalidationDeleteHook, localePaths } from '../hooks';

const analystCallPaths = () => localePaths(['/research/analyst-chart']);

const ANALYST_CATEGORIES = ['Majors', 'Crosses', 'Commodities', 'Crypto'];

export const AnalystCalls: CollectionConfig = {
  slug: 'analyst-calls',
  admin: {
    group: 'Editorial',
    useAsTitle: 'symbol',
    defaultColumns: ['symbol', 'sentiment', 'category', 'sortOrder', 'status'],
    description: 'Weekly price-call rows displayed on the Analyst Chart page.',
  },
  access: { read: publicReadWhere({ status: { equals: 'active' } }) },
  hooks: {
    afterChange: [createRevalidationHook(analystCallPaths)],
    afterDelete: [createRevalidationDeleteHook(analystCallPaths)],
  },
  fields: [
    {
      name: 'symbol',
      type: 'text',
      required: true,
      maxLength: 20,
      admin: { description: 'Display symbol, e.g. EUR/USD' },
    },
    {
      name: 'tvSymbol',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: { description: 'TradingView symbol, e.g. OANDA:EURUSD' },
    },
    {
      name: 'currentPrice',
      type: 'text',
      required: true,
      maxLength: 30,
      admin: { description: 'Current price string, e.g. 1.0842' },
    },
    {
      name: 'targetPrice',
      type: 'text',
      required: true,
      maxLength: 30,
      admin: { description: 'Target price string, e.g. + 1.0980 or ± 35.20' },
    },
    {
      name: 'confidence',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      admin: { description: 'Analyst confidence percentage (0–100)' },
    },
    {
      name: 'sentiment',
      type: 'select',
      required: true,
      options: [
        { label: 'Bullish', value: 'BULLISH' },
        { label: 'Bearish', value: 'BEARISH' },
        { label: 'Neutral', value: 'NEUTRAL' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Majors', value: 'Majors' },
        { label: 'Crosses', value: 'Crosses' },
        { label: 'Commodities', value: 'Commodities' },
        { label: 'Crypto', value: 'Crypto' },
      ],
      validate: allowAnyCategory(true),
      admin: { components: { Field: CategorySelect(ANALYST_CATEGORIES) } },
    },
    {
      name: 'sparkPoints',
      type: 'text',
      admin: {
        description:
          'JSON array of 10 numbers for the sparkline, e.g. [28,30,29,33,31,35,34,37,36,40]',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower number = displayed first' },
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
    },
  ],
};
