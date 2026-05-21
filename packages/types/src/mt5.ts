/** Asset classes mirrored from the 6 Markets pages (Template A). */
export const ASSET_CLASSES = [
  'forex',
  'commodities',
  'indices',
  'stocks',
  'etfs',
  'crypto',
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export const isAssetClass = (value: unknown): value is AssetClass =>
  typeof value === 'string' && (ASSET_CLASSES as readonly string[]).includes(value);

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
 * Identifies where the data in an MT5Response originated.
 *
 * 'mt5-live'            — fetched from the MT5 Manager API bridge in real time.
 * 'cms-manual'          — a per-instrument toggle is OFF; CMS manual values used.
 * 'cms-global-override' — the site-wide master switch (mt5SyncEnabled) is OFF;
 *                         all instruments served from CMS regardless of per-doc setting.
 * 'cms-fallback'        — MT5 service was unreachable; degraded to CMS data.
 */
export type MT5DataSource = 'mt5-live' | 'cms-manual' | 'cms-global-override' | 'cms-fallback';

/**
 * Wrapper returned by all MT5-backed API responses.
 *
 * `usesMT5Data` — false when ANY fallback path was taken; the frontend should
 *   surface a "last updated" / static-data notice instead of implying prices
 *   are live.
 *
 * `source` — discriminator that tells the UI (and logging) exactly why the
 *   data came from where it did. See MT5DataSource for the four states.
 */
export interface MT5Response<T> {
  usesMT5Data: boolean;
  source: MT5DataSource;
  fetchedAt: string;
  data: T;
}
