import type { InstrumentSpec, MT5Response } from '@newera365/types';
import fallback from './data/fallback.json';

const credentialsPresent = Boolean(
  process.env.MT5_HOST && process.env.MT5_LOGIN && process.env.MT5_PASSWORD,
);

/**
 * Returns instrument specs. Until real MT5 Manager API credentials are
 * supplied (Day 1-3 BLOCKER, NE-003), this serves the static fallback
 * tables and flags `usesMT5Data: false` so the UI shows a static-data
 * notice. Replace the fallback branch with the real Manager API client
 * once credentials arrive.
 */
export async function getInstruments(
  assetClass?: string,
): Promise<MT5Response<InstrumentSpec[]>> {
  const all = fallback.instruments as InstrumentSpec[];
  const data = assetClass
    ? all.filter((i) => i.assetClass === assetClass)
    : all;

  if (!credentialsPresent) {
    return { usesMT5Data: false, fetchedAt: new Date().toISOString(), data };
  }

  // TODO(NE-003): call the real MT5 Manager API here.
  return { usesMT5Data: true, fetchedAt: new Date().toISOString(), data };
}
