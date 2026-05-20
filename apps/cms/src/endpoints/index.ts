import type { Express, Request, Response } from 'express';
import type { Payload } from 'payload';
import rateLimit from 'express-rate-limit';
import type { MT5Response, InstrumentSpec } from '@newera365/types';

/**
 * Custom REST endpoints layered on the Payload Express app. These are the
 * non-CMS routes the frontend calls:
 *   /api/mt5/instruments          MT5 proxy — respects global + per-doc toggles
 *   /api/mt5/instruments/:symbol  Single instrument
 *   /api/newsletter/subscribe     double opt-in start (Mailchimp)
 *   /api/newsletter/confirm       opt-in confirmation
 *   /api/newsletter/unsubscribe
 *   /api/contact                  contact form (rate-limited 3/min/IP)
 *   /api/partners/apply           IB registration
 *   /api/education/gate           email gate for /ebooks, /research
 *   /api/webinars/register        Zoom registration (rate-limited 10/min/IP)
 *
 * Phase 3 stubs remain for contact / webinar / newsletter — see NE tickets.
 */
export function registerCustomEndpoints(app: Express, payload: Payload): void {
  const contactLimiter = rateLimit({ windowMs: 60_000, max: 3 });
  const webinarLimiter = rateLimit({ windowMs: 60_000, max: 10 });

  // ── Health ─────────────────────────────────────────────────────────────────
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // ── MT5 Instruments proxy ──────────────────────────────────────────────────
  //
  // Dual-toggle logic:
  //   1. Site Settings → mt5SyncEnabled (global master switch)
  //      OFF → skip the MT5 service entirely; return CMS manual data for ALL instruments.
  //   2. Per-instrument → usesMT5Data (on each products-instruments document)
  //      When global is ON but an individual instrument has usesMT5Data=false,
  //      that specific instrument's live MT5 row is replaced with its CMS values.
  //
  // On any fetch error the endpoint degrades gracefully to CMS manual data and
  // sets source: 'cms-fallback' so the frontend can show a static-data notice.
  app.get('/api/mt5/instruments', async (req: Request, res: Response) => {
    const assetClass = typeof req.query.assetClass === 'string' ? req.query.assetClass : undefined;

    try {
      // Step 1 — read the global master switch from SiteSettings
      const settings = await payload.findGlobal({ slug: 'site-settings' });
      const globalEnabled = (settings as { mt5SyncEnabled?: boolean }).mt5SyncEnabled !== false;

      if (!globalEnabled) {
        // Global switch is OFF → serve all instruments from CMS manual data
        const cmsResult = await payload.find({
          collection: 'products-instruments',
          where: {
            and: [
              { status: { equals: 'active' } },
              ...(assetClass ? [{ assetClass: { equals: assetClass } }] : []),
            ],
          },
          limit: 500,
          depth: 0,
        });

        return res.json({
          usesMT5Data: false,
          source: 'cms-global-override',
          fetchedAt: new Date().toISOString(),
          data: cmsResult.docs,
        } satisfies MT5Response<unknown[]>);
      }

      // Step 2 — global is ON; call the MT5 bridge service
      const mt5Base = process.env.MT5_SERVICE_URL ?? 'http://localhost:4000';
      const mt5Url = new URL(`${mt5Base}/instruments`);
      if (assetClass) mt5Url.searchParams.set('assetClass', assetClass);

      const mt5Res = await fetch(mt5Url.toString());
      if (!mt5Res.ok) throw new Error(`MT5 service responded ${mt5Res.status}`);

      const mt5Payload = (await mt5Res.json()) as MT5Response<InstrumentSpec[]>;

      // Step 3 — per-instrument overrides: find instruments where the
      //          per-doc toggle is OFF so we can substitute CMS values.
      const manualQuery = await payload.find({
        collection: 'products-instruments',
        where: {
          and: [
            { status: { equals: 'active' } },
            { usesMT5Data: { equals: false } },
            ...(assetClass ? [{ assetClass: { equals: assetClass } }] : []),
          ],
        },
        depth: 0,
        limit: 500,
      });

      if (manualQuery.totalDocs === 0) {
        // No per-instrument overrides — return MT5 data as-is
        return res.json(mt5Payload);
      }

      // Build a lookup map: mt5Symbol (or symbol) → CMS doc
      const manualMap = new Map<string, Record<string, unknown>>();
      for (const doc of manualQuery.docs as Array<Record<string, unknown>>) {
        const key = (doc.mt5Symbol as string | undefined) ?? (doc.symbol as string);
        manualMap.set(key, doc);
      }

      // Merge: replace live MT5 rows with CMS values where applicable
      const merged = mt5Payload.data.map((live) => {
        const override = manualMap.get(live.symbol);
        if (override) {
          return {
            ...live,
            spread: (override.spread as number) ?? live.spread,
            swapLong: (override.swapLong as number) ?? live.swapLong,
            swapShort: (override.swapShort as number) ?? live.swapShort,
            _source: 'cms-manual' as const,
          };
        }
        return { ...live, _source: 'mt5-live' as const };
      });

      return res.json({
        usesMT5Data: mt5Payload.usesMT5Data,
        source: 'mt5-live',
        fetchedAt: mt5Payload.fetchedAt,
        data: merged,
      });
    } catch (err) {
      // Graceful degradation — MT5 unreachable or credentials missing
      payload.logger.error({ err }, 'MT5 proxy error — falling back to CMS data');

      const fallback = await payload.find({
        collection: 'products-instruments',
        where: {
          and: [
            { status: { equals: 'active' } },
            ...(assetClass ? [{ assetClass: { equals: assetClass } }] : []),
          ],
        },
        limit: 500,
        depth: 0,
      });

      return res.json({
        usesMT5Data: false,
        source: 'cms-fallback',
        fetchedAt: new Date().toISOString(),
        data: fallback.docs,
      } satisfies MT5Response<unknown[]>);
    }
  });

  // ── Single instrument ──────────────────────────────────────────────────────
  app.get('/api/mt5/instruments/:symbol', async (req: Request, res: Response) => {
    const symbol = req.params.symbol?.toUpperCase();

    try {
      // Check the CMS record first to read per-instrument toggle
      const cmsResult = await payload.find({
        collection: 'products-instruments',
        where: { symbol: { equals: symbol } },
        limit: 1,
        depth: 0,
      });

      const cmsDoc = cmsResult.docs[0] as Record<string, unknown> | undefined;
      if (!cmsDoc) return res.status(404).json({ error: 'Instrument not found' });

      // Read global switch
      const settings = await payload.findGlobal({ slug: 'site-settings' });
      const globalEnabled = (settings as { mt5SyncEnabled?: boolean }).mt5SyncEnabled !== false;
      const docEnabled = cmsDoc.usesMT5Data !== false;

      if (!globalEnabled || !docEnabled) {
        // Either global or per-doc is OFF → return CMS data
        return res.json({
          usesMT5Data: false,
          source: globalEnabled ? 'cms-manual' : 'cms-global-override',
          fetchedAt: new Date().toISOString(),
          data: cmsDoc,
        });
      }

      // Both switches ON → fetch from MT5 service
      const mt5Base = process.env.MT5_SERVICE_URL ?? 'http://localhost:4000';
      const mt5Res = await fetch(`${mt5Base}/instruments`);
      if (!mt5Res.ok) throw new Error(`MT5 service responded ${mt5Res.status}`);

      const mt5Payload = (await mt5Res.json()) as MT5Response<InstrumentSpec[]>;
      const live = mt5Payload.data.find(
        (i) => i.symbol === symbol || i.symbol === (cmsDoc.mt5Symbol as string | undefined),
      );

      if (!live) {
        return res.json({
          usesMT5Data: false,
          source: 'cms-fallback',
          fetchedAt: new Date().toISOString(),
          data: cmsDoc,
        });
      }

      return res.json({
        usesMT5Data: true,
        source: 'mt5-live',
        fetchedAt: mt5Payload.fetchedAt,
        data: { ...live, _source: 'mt5-live' },
      });
    } catch (err) {
      payload.logger.error({ err, symbol }, 'MT5 single-instrument proxy error');
      const fallback = await payload.find({
        collection: 'products-instruments',
        where: { symbol: { equals: symbol } },
        limit: 1,
        depth: 0,
      });
      const doc = fallback.docs[0];
      if (!doc) return res.status(404).json({ error: 'Instrument not found' });
      return res.json({
        usesMT5Data: false,
        source: 'cms-fallback',
        fetchedAt: new Date().toISOString(),
        data: doc,
      });
    }
  });

  // ── Contact form (Phase 3 — NE-039) ──────────────────────────────────────
  app.post('/api/contact', contactLimiter, (_req, res) => {
    res.status(501).json({ error: 'not implemented — Phase 3 (NE-039)' });
  });

  // ── Webinar registration (Phase 3 — NE-033) ───────────────────────────────
  app.post('/api/webinars/register', webinarLimiter, (_req, res) => {
    res.status(501).json({ error: 'not implemented — Phase 3 (NE-033)' });
  });
}
