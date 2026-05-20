import type { InstrumentSpec, MT5Response } from '@newera365/types';
import fallback from './data/fallback.json';

const credentialsPresent = Boolean(
  process.env.MT5_HOST && process.env.MT5_LOGIN && process.env.MT5_PASSWORD,
);

/**
 * Returns instrument specs from the MT5 Manager API bridge.
 *
 * Until real MT5 Manager API credentials are supplied (Day 1-3 BLOCKER,
 * NE-003), this serves the static fallback tables and sets:
 *   usesMT5Data: false, source: 'cms-fallback'
 * so the CMS proxy and frontend can show a static-data notice.
 *
 * When credentials are present the function returns:
 *   usesMT5Data: true, source: 'mt5-live'
 *
 * Replace the credential check branch with the real Manager API client call
 * once NE-003 credentials arrive.
 */
export async function getInstruments(assetClass?: string): Promise<MT5Response<InstrumentSpec[]>> {
  const all = fallback.instruments as InstrumentSpec[];
  const data = assetClass ? all.filter((i) => i.assetClass === assetClass) : all;

  if (!credentialsPresent) {
    return {
      usesMT5Data: false,
      source: 'cms-fallback',
      fetchedAt: new Date().toISOString(),
      data,
    };
  }

  // TODO(NE-003): replace this stub with the real MT5 Manager API call.
  // The real call should fetch live tick data and map it to InstrumentSpec[].
  return {
    usesMT5Data: true,
    source: 'mt5-live',
    fetchedAt: new Date().toISOString(),
    data,
  };
}
