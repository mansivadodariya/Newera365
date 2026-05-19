/** Asset classes mirrored from the 6 Markets pages (Template A). */
export type AssetClass =
  | 'forex'
  | 'commodities'
  | 'indices'
  | 'stocks'
  | 'etfs'
  | 'crypto';

/** Live instrument spec sourced from the MT5 Manager API bridge. */
export interface InstrumentSpec {
  symbol: string;
  assetClass: AssetClass;
  bid: number;
  ask: number;
  spread: number;
  swapLong: number;
  swapShort: number;
  leverage: number;
  contractSize: number;
  marginCurrency: string;
  tradingHours: string;
}

/**
 * Wrapper returned by all MT5-backed API responses. `usesMT5Data` is false
 * when the bridge fell back to the static JSON data tables (Gate 1 fallback
 * agreement) — the UI should surface a "last updated" / static-data notice.
 */
export interface MT5Response<T> {
  usesMT5Data: boolean;
  fetchedAt: string;
  data: T;
}
