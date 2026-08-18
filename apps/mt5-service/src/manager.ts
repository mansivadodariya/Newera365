import type { InstrumentSpec, MT5Response } from '@newera365/types';
import fallback from './data/fallback.json';

// Round `value` to the same number of decimal places the base price uses, so
// jittered numbers keep a realistic shape (e.g. EURUSD stays 5dp, US500 stays 1dp).
function roundLike(value: number, base: number): number {
  const decimals = (String(base).split('.')[1] ?? '').length;
  return Number(value.toFixed(Math.min(decimals, 8)));
}

/**
 * Simulates a live tick: bid/ask drift together by ±0.02%, spread wobbles ±10%
 * (clamped ≥ 0). Swaps/leverage/specs are static (they don't change intraday).
 * This is the MOCK feed — TODO(NE-003) replace with the real MT5 Manager API.
 */
function simulateLive(base: InstrumentSpec): InstrumentSpec {
  const priceFactor = 1 + (Math.random() * 2 - 1) * 0.0002;
  const bid = roundLike(base.bid * priceFactor, base.bid);
  const ask = roundLike(base.ask * priceFactor, base.ask);
  const spread = Math.max(
    0,
    roundLike(base.spread * (1 + (Math.random() * 2 - 1) * 0.1), base.spread),
  );
  return { ...base, bid, ask: Math.max(ask, bid), spread };
}

/**
 * Returns instrument specs from the MT5 Manager API bridge.
 *
 * This is a MOCK: it simulates a live feed (usesMT5Data: true, source: 'mt5-live')
 * with jittered prices so the CMS proxy + frontend exercise the real live-data path.
 * It is intended for local development; the service is not deployed (the CMS proxy
 * gracefully falls back to CMS data when the service is unreachable in production).
 *
 * TODO(NE-003): when real MT5 Manager API credentials arrive (MT5_HOST / MT5_LOGIN /
 * MT5_PASSWORD), replace simulateLive with the actual Manager API client call.
 */
export async function getInstruments(assetClass?: string): Promise<MT5Response<InstrumentSpec[]>> {
  const all = fallback.instruments as InstrumentSpec[];
  const base = assetClass ? all.filter((i) => i.assetClass === assetClass) : all;
  const data = base.map(simulateLive);

  return {
    usesMT5Data: true,
    source: 'mt5-live',
    fetchedAt: new Date().toISOString(),
    data,
  };
}

/** Returns a single instrument by symbol, or null data if not found. */
export async function getInstrument(symbol: string): Promise<MT5Response<InstrumentSpec | null>> {
  const all = fallback.instruments as InstrumentSpec[];
  const found = all.find((i) => i.symbol === symbol);

  if (!found) {
    return {
      usesMT5Data: true,
      source: 'mt5-live',
      fetchedAt: new Date().toISOString(),
      data: null,
    };
  }

  // TODO(NE-003): fetch live data for a single instrument from the real MT5 Manager API.
  return {
    usesMT5Data: true,
    source: 'mt5-live',
    fetchedAt: new Date().toISOString(),
    data: simulateLive(found),
  };
}
