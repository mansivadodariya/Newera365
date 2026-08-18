/**
 * One-shot content sync: aligns the four account-type cards with the Figma
 * design (file yavF4nnHjUYQ2BvkWupyr9, node 102:2) — feature bullets and the
 * Professional commission value. Matches the copy in seed.ts.
 *
 * Run via:
 *   npx cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts ts-node --transpile-only src/scripts/update-account-copy.ts
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import payload from 'payload';

const UPDATES: Record<string, { commission?: string; features: { value: string }[] }> = {
  Demo: {
    features: [
      { value: 'Full platform access' },
      { value: 'Real-time market data' },
      { value: 'No deposit required' },
    ],
  },
  Standard: {
    features: [
      { value: 'All 2000+ instruments' },
      { value: 'Zero commission' },
      { value: '24/7 expert support' },
    ],
  },
  'Swap-Free': {
    features: [
      { value: 'No overnight swaps' },
      { value: 'Sharia-compliant structure' },
      { value: 'Full market access' },
    ],
  },
  Professional: {
    commission: '$1.5',
    features: [
      { value: 'Raw spreads from 0.0' },
      { value: 'Priority execution' },
      { value: 'Dedicated account manager' },
    ],
  },
};

const main = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET ?? '',
    local: true,
  });

  const { docs } = await payload.find({
    collection: 'account-types',
    limit: 20,
    locale: 'en',
  });

  for (const doc of docs) {
    const update = UPDATES[doc.name as string];
    if (!update) {
      console.log(`skip ${String(doc.name)}`);
      continue;
    }
    await payload.update({
      collection: 'account-types',
      id: doc.id,
      locale: 'en',
      data: update,
    });
    console.log(`updated ${String(doc.name)}`);
  }
  console.log('done');
  process.exit(0);
};

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
