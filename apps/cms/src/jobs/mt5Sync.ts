import type { Payload } from 'payload';
import type { InstrumentSpec, MT5Response } from '@newera365/types';
import { cacheSet } from '../cache/mt5Cache';

const DEFAULT_INTERVAL_MS = 60_000;
const FETCH_TIMEOUT_MS = Number(process.env.MT5_FETCH_TIMEOUT_MS ?? 5_000);

type SyncStatus = 'synced' | 'failed';

type SiteSettings = {
  mt5SyncEnabled?: boolean;
  mt5ApiEndpoint?: string;
  mt5ApiKey?: string;
  mt5RefreshIntervalSecs?: number;
};

async function fetchMt5Instruments(
  baseUrl: string,
  token: string | undefined,
): Promise<Map<string, InstrumentSpec>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const headers: Record<string, string> = {};
  if (token) headers['authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${baseUrl}/instruments`, { signal: controller.signal, headers });
    if (!res.ok) throw new Error(`MT5 responded ${res.status}`);
    const body = (await res.json()) as MT5Response<InstrumentSpec[]>;
    return new Map(body.data.map((inst) => [inst.symbol, inst]));
  } finally {
    clearTimeout(timer);
  }
}

async function markInstruments(
  payload: Payload,
  docs: Array<Record<string, unknown>>,
  mt5Map: Map<string, InstrumentSpec> | null,
  overallStatus: SyncStatus,
  overallError: string | null,
  nowIso: string,
): Promise<void> {
  for (const doc of docs) {
    const lookupSymbol =
      (doc.mt5Symbol as string | undefined) ?? (doc.symbol as string | undefined) ?? '';
    let status: SyncStatus;
    let reason: string | null;

    if (overallStatus === 'failed' || mt5Map === null) {
      status = 'failed';
      reason = overallError;
    } else if (!mt5Map.has(lookupSymbol)) {
      status = 'failed';
      reason = `Symbol "${lookupSymbol}" not found in MT5 feed`;
    } else {
      status = 'synced';
      reason = null;
    }

    try {
      await payload.update({
        collection: 'products-instruments',
        id: doc.id as string | number,
        data: {
          mt5SyncStatus: status,
          mt5LastSyncedAt: nowIso,
          mt5SyncFailureReason: reason,
        },
        overrideAccess: true,
        depth: 0,
      });
    } catch (err) {
      payload.logger.error({ err, docId: doc.id }, 'mt5Sync: failed to update instrument status');
    }
  }
}

async function markAccountTypes(
  payload: Payload,
  status: SyncStatus,
  reason: string | null,
  nowIso: string,
): Promise<void> {
  try {
    const result = await payload.find({
      collection: 'account-types',
      where: {
        and: [{ status: { equals: 'active' } }, { usesMT5Data: { equals: true } }],
      },
      limit: 200,
      depth: 0,
    });

    for (const doc of result.docs as Array<Record<string, unknown>>) {
      try {
        await payload.update({
          collection: 'account-types',
          id: doc.id as string | number,
          data: {
            mt5SyncStatus: status,
            mt5LastSyncedAt: nowIso,
            mt5SyncFailureReason: reason,
          },
          overrideAccess: true,
          depth: 0,
        });
      } catch (err) {
        payload.logger.error(
          { err, docId: doc.id },
          'mt5Sync: failed to update account-type status',
        );
      }
    }
  } catch (err) {
    payload.logger.error({ err }, 'mt5Sync: failed to query account-types');
  }
}

async function runSync(payload: Payload): Promise<number> {
  let settings: SiteSettings;
  try {
    settings = (await payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: true,
    })) as SiteSettings;
  } catch (err) {
    payload.logger.error({ err }, 'mt5Sync: could not read site-settings — skipping tick');
    return DEFAULT_INTERVAL_MS;
  }

  const intervalMs =
    Math.min(Math.max(Number(settings.mt5RefreshIntervalSecs ?? 60), 10), 3600) * 1_000;

  if (!settings.mt5SyncEnabled && settings.mt5SyncEnabled !== undefined) {
    // Global kill switch is explicitly OFF — skip fetch, do not touch sync fields.
    return intervalMs;
  }

  const mt5Base =
    (settings.mt5ApiEndpoint?.trim() || undefined) ??
    process.env.MT5_SERVICE_URL ??
    'http://localhost:4000';
  const mt5Token = (settings.mt5ApiKey?.trim() || undefined) ?? process.env.MT5_INTERNAL_API_TOKEN;

  // Fetch only instruments with MT5 sync enabled.
  let cmsDocs: Array<Record<string, unknown>>;
  try {
    const result = await payload.find({
      collection: 'products-instruments',
      where: {
        and: [{ status: { equals: 'active' } }, { usesMT5Data: { equals: true } }],
      },
      limit: 500,
      depth: 0,
    });
    cmsDocs = result.docs as Array<Record<string, unknown>>;
  } catch (err) {
    payload.logger.error({ err }, 'mt5Sync: failed to query products-instruments');
    return intervalMs;
  }

  const nowIso = new Date().toISOString();

  // Fetch the full instrument list from MT5 once, then match per CMS doc.
  let mt5Map: Map<string, InstrumentSpec> | null = null;
  let fetchError: string | null = null;

  try {
    mt5Map = await fetchMt5Instruments(mt5Base, mt5Token);
    payload.logger.info({ count: mt5Map.size }, 'mt5Sync: fetched instruments from MT5 bridge');
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Unknown fetch error';
    payload.logger.error({ err }, 'mt5Sync: MT5 fetch failed — marking all as failed');
  }

  const overallStatus: SyncStatus = mt5Map !== null ? 'synced' : 'failed';

  await markInstruments(payload, cmsDocs, mt5Map, overallStatus, fetchError, nowIso);
  await markAccountTypes(payload, overallStatus, fetchError, nowIso);

  // Populate the bulk 'all' cache entry so the next endpoint request is served
  // without a live MT5 call. Only done on success.
  if (mt5Map !== null) {
    const allInstruments = Array.from(mt5Map.values());
    cacheSet(
      'mt5:instruments:all',
      {
        usesMT5Data: true,
        source: 'mt5-live',
        fetchedAt: nowIso,
        data: allInstruments,
      },
      intervalMs,
    );
  }

  payload.logger.info(
    { status: overallStatus, instruments: cmsDocs.length },
    'mt5Sync: tick complete',
  );
  return intervalMs;
}

/**
 * Start the MT5 background sync job. Self-rescheduling — re-reads the interval
 * from SiteSettings after every tick so admin changes take effect within one cycle.
 * First run is delayed 5 s after server start to let Payload fully initialise.
 */
export function startMt5SyncJob(payload: Payload): void {
  const run = async (): Promise<void> => {
    const nextMs = await runSync(payload);
    setTimeout(run, nextMs);
  };
  setTimeout(run, 5_000);
  payload.logger.info('mt5Sync: background sync job scheduled');
}
