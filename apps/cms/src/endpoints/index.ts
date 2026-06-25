import { randomUUID, createHash, timingSafeEqual } from 'crypto';
import type { Express, Request, Response, NextFunction } from 'express';
import type { Payload } from 'payload';
import type { Where } from 'payload/dist/types';
import rateLimit from 'express-rate-limit';
import { createRateLimitStoreFactory } from '../rateLimit/postgresStore';
import { cacheGet, cacheSet } from '../cache/mt5Cache';
import {
  ASSET_CLASSES,
  isAssetClass,
  type AssetClass,
  type MT5Response,
  type InstrumentSpec,
} from '@newera365/types';
import {
  sendNewsletterConfirmation,
  sendEbookDelivery,
  sendContactNotification,
  sendPartnersNotification,
  sendWebinarRegistrationConfirmation,
  sendWebinarRegistrationNotification,
  sendNewsletterWelcome,
} from '../email/mailer';

/**
 * Custom REST endpoints layered on the Payload Express app. These are the
 * non-CMS routes the frontend calls:
 *   /api/mt5/instruments          MT5 proxy — respects global + per-doc toggles
 *   /api/mt5/instruments/:symbol  Single instrument
 *   /api/newsletter/subscribe     double opt-in start (optional Resend Audience sync)
 *   /api/newsletter/confirm       opt-in confirmation
 *   /api/newsletter/unsubscribe
 *   /api/contact                  contact form (rate-limited)
 *   /api/partners/apply           IB registration
 *   /api/education/gate           email gate for /ebooks, /research
 *   /api/webinars/register        Zoom registration (rate-limited)
 *
 * Phase 3 stubs remain for contact / webinar / newsletter — owned by separate
 * tickets; do not surface ticket IDs in client responses.
 */

// Parse a numeric env var, falling back when unset OR non-numeric. Plain
// `Number(process.env.X ?? d)` yields NaN for a malformed value, which would
// silently disable a rate limit or fetch timeout (NE code-review I-4).
const numEnv = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

const RATE_LIMIT_WINDOW_MS = numEnv(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
const CONTACT_RATE_LIMIT = numEnv(process.env.CONTACT_RATE_LIMIT, 3);
const WEBINAR_RATE_LIMIT = numEnv(process.env.WEBINAR_RATE_LIMIT, 10);
const NEWSLETTER_RATE_LIMIT = numEnv(process.env.NEWSLETTER_RATE_LIMIT, 5);
const MAX_PAYLOAD_RESULTS = numEnv(process.env.MAX_PAYLOAD_RESULTS, 500);
const MT5_FETCH_TIMEOUT_MS = numEnv(process.env.MT5_FETCH_TIMEOUT_MS, 5_000);
const HEALTH_CHECK_TOKEN = process.env.HEALTH_CHECK_TOKEN;

// Salt for IP hashing — prevents rainbow-table reversal of low-entropy IPv4 space.
// An empty salt makes all hashes trivially reversible via precomputed tables.
// The hard production requirement is enforced once in payload.config.ts alongside
// the other required-env checks; here we only warn in dev so both error paths can't diverge.
if (!process.env.CONSENT_IP_SALT && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[newsletter] CONSENT_IP_SALT not set — IP hashes have no rainbow-table protection. Add it to .env',
  );
}
const CONSENT_IP_SALT = process.env.CONSENT_IP_SALT ?? '';

const SYMBOL_PATTERN = /^[A-Z0-9._-]{1,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ReqWithId = Request & { requestId?: string };

// Timing-safe string comparison — prevents token enumeration via response-time side-channel.
function safeTokenCompare(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const requestIdMiddleware = (req: ReqWithId, _res: Response, next: NextFunction): void => {
  req.requestId = randomUUID();
  next();
};

const MT5_INTERNAL_API_TOKEN = process.env.MT5_INTERNAL_API_TOKEN;

// Optional allow-list (comma-separated host[:port]) for the admin-configurable
// MT5 endpoint. When set, only these hosts may be targeted.
const MT5_ALLOWED_HOSTS = (process.env.MT5_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

// Validate the admin-supplied SiteSettings.mt5ApiEndpoint BEFORE the server
// fetches it with the internal bearer token. Without this, a malicious/internal
// URL saved in the CMS becomes an SSRF + token-exfil vector (NE code-review WR-3).
// Returns the URL only when it is an absolute http(s) URL (and, if an allow-list
// is configured, the host is permitted); otherwise undefined so the caller falls
// back to the env/default endpoint instead of blindly fetching it.
const safeMt5Endpoint = (candidate: string | undefined): string | undefined => {
  if (!candidate) return undefined;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
  if (MT5_ALLOWED_HOSTS.length > 0 && !MT5_ALLOWED_HOSTS.includes(url.host.toLowerCase())) {
    return undefined;
  }
  return candidate;
};

// Returns the fetch Response (Node 18+ global). Return type inferred to avoid
// a name clash with Express's `Response` type in this file.
// tokenOverride takes precedence over the MT5_INTERNAL_API_TOKEN env var so
// the admin can rotate the key via SiteSettings without a redeploy.
const fetchWithTimeout = async (url: string, timeoutMs: number, tokenOverride?: string | null) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {};
  const token = tokenOverride != null ? tokenOverride : MT5_INTERNAL_API_TOKEN;
  if (token) headers['authorization'] = `Bearer ${token}`;
  try {
    return await fetch(url, { signal: controller.signal, headers });
  } finally {
    clearTimeout(timer);
  }
};

export async function registerCustomEndpoints(app: Express, payload: Payload): Promise<void> {
  app.use(requestIdMiddleware);

  // Durable, Postgres-backed rate limiting (survives deploys/restarts). Falls back
  // to express-rate-limit's in-memory store if the backing table can't be provisioned,
  // so a transient DB issue can't take the API down.
  const storeFactory = await createRateLimitStoreFactory();
  if (!storeFactory) {
    payload.logger.warn(
      'Rate-limit Postgres store unavailable — falling back to in-memory limiting (resets on restart).',
    );
  }
  const makeLimiter = (max: number, prefix: string) =>
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max,
      ...(storeFactory ? { store: storeFactory(prefix) } : {}),
    });

  const contactLimiter = makeLimiter(CONTACT_RATE_LIMIT, 'contact');
  const webinarLimiter = makeLimiter(WEBINAR_RATE_LIMIT, 'webinar');
  const newsletterLimiter = makeLimiter(NEWSLETTER_RATE_LIMIT, 'newsletter');
  const partnersLimiter = makeLimiter(NEWSLETTER_RATE_LIMIT, 'partners');

  // ── Health ─────────────────────────────────────────────────────────────────
  // Token-gated to prevent uptime fingerprinting and DDoS amplification.
  app.get('/api/health', (req: Request, res: Response) => {
    const provided = req.header('x-health-token');
    if (!HEALTH_CHECK_TOKEN || !safeTokenCompare(provided, HEALTH_CHECK_TOKEN)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ status: 'ok' });
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
  app.get('/api/mt5/instruments', async (req: ReqWithId, res: Response) => {
    const rawAssetClass = req.query.assetClass;
    if (rawAssetClass !== undefined && !isAssetClass(rawAssetClass)) {
      return res.status(400).json({
        error: 'Invalid assetClass',
        allowed: ASSET_CLASSES,
      });
    }
    const assetClass =
      typeof rawAssetClass === 'string' ? (rawAssetClass as AssetClass) : undefined;

    try {
      // Step 1 — read global settings (overrideAccess so API key field is included).
      const settings = (await payload.findGlobal({
        slug: 'site-settings',
        overrideAccess: true,
      })) as {
        mt5SyncEnabled?: boolean;
        mt5ApiEndpoint?: string;
        mt5ApiKey?: string;
        mt5RefreshIntervalSecs?: number;
      };
      const globalEnabled = settings.mt5SyncEnabled !== false;
      const cacheTtlMs =
        Math.min(Math.max(Number(settings.mt5RefreshIntervalSecs ?? 60), 10), 3600) * 1_000;

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
          limit: MAX_PAYLOAD_RESULTS,
          depth: 0,
        });

        res.set('Cache-Control', 'public, max-age=60');
        return res.json({
          usesMT5Data: false,
          source: 'cms-global-override',
          fetchedAt: new Date().toISOString(),
          data: cmsResult.docs,
        } satisfies MT5Response<unknown[]>);
      }

      // Step 2 — check in-process cache before calling the MT5 bridge.
      // The cron job pre-populates 'mt5:instruments:all' after every successful sync.
      // Per-asset-class keys are populated lazily on first miss.
      const cacheKey = `mt5:instruments:${assetClass ?? 'all'}`;
      const cached = cacheGet<MT5Response<unknown[]>>(cacheKey);
      if (cached) {
        res.set('Cache-Control', `public, max-age=${Math.round(cacheTtlMs / 1000)}`);
        return res.json(cached);
      }

      // Step 3 — global is ON and cache miss; call the MT5 bridge service.
      const mt5Base =
        safeMt5Endpoint(settings.mt5ApiEndpoint?.trim() || undefined) ??
        process.env.MT5_SERVICE_URL ??
        'http://localhost:4000';
      const mt5ApiKey = settings.mt5ApiKey?.trim() || undefined;
      const mt5Url = new URL(`${mt5Base}/instruments`);
      if (assetClass) mt5Url.searchParams.set('assetClass', assetClass);

      const mt5Res = await fetchWithTimeout(mt5Url.toString(), MT5_FETCH_TIMEOUT_MS, mt5ApiKey);
      if (!mt5Res.ok) {
        payload.logger.error(
          { requestId: req.requestId, status: mt5Res.status },
          'MT5 upstream error',
        );
        throw new Error('Failed to fetch instrument data');
      }

      const mt5Payload = (await mt5Res.json()) as MT5Response<InstrumentSpec[]>;

      // Step 4 — per-instrument overrides: find instruments where the
      //          per-doc toggle is OFF so we can substitute CMS values.
      // NOTE: Hard-capped at MAX_PAYLOAD_RESULTS to prevent memory exhaustion.
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
        limit: MAX_PAYLOAD_RESULTS,
      });

      if (manualQuery.totalDocs > MAX_PAYLOAD_RESULTS) {
        payload.logger.warn(
          { requestId: req.requestId, totalDocs: manualQuery.totalDocs },
          'Manual instrument overrides exceed cap; some overrides will not be applied',
        );
      }

      let responseBody: MT5Response<unknown[]>;

      if (!manualQuery.docs?.length) {
        responseBody = mt5Payload;
      } else {
        // Build a lookup map: mt5Symbol (or symbol) → CMS doc
        const manualMap = new Map<string, Record<string, unknown>>();
        for (const doc of manualQuery.docs as Array<Record<string, unknown>>) {
          const mt5Sym = doc.mt5Symbol as string | undefined;
          const sym = doc.symbol as string | undefined;
          const key = mt5Sym ?? sym;
          if (!key) {
            payload.logger.warn(
              { requestId: req.requestId, docId: doc.id },
              'products-instruments doc missing both symbol and mt5Symbol — skipping override',
            );
            continue;
          }
          manualMap.set(key, doc);
        }

        // Merge: replace live MT5 rows with CMS values where applicable
        const merged = mt5Payload.data.map((live) => {
          const override = manualMap.get(live.symbol);
          if (override) {
            return {
              ...live,
              spread:
                typeof override.spread === 'number' && !Number.isNaN(override.spread)
                  ? override.spread
                  : live.spread,
              swapLong:
                typeof override.swapLong === 'number' && !Number.isNaN(override.swapLong)
                  ? override.swapLong
                  : live.swapLong,
              swapShort:
                typeof override.swapShort === 'number' && !Number.isNaN(override.swapShort)
                  ? override.swapShort
                  : live.swapShort,
              _source: 'cms-manual' as const,
            };
          }
          return { ...live, _source: 'mt5-live' as const };
        });

        responseBody = {
          usesMT5Data: mt5Payload.usesMT5Data,
          source: 'mt5-live',
          fetchedAt: mt5Payload.fetchedAt,
          data: merged,
        };
      }

      // Populate cache so subsequent requests within the TTL window skip the MT5 call.
      cacheSet(cacheKey, responseBody, cacheTtlMs);

      res.set('Cache-Control', `public, max-age=${Math.round(cacheTtlMs / 1000)}`);
      return res.json(responseBody);
    } catch (err) {
      // Graceful degradation — MT5 unreachable, timed out, or credentials missing.
      // Never expose upstream status to the client.
      payload.logger.error(
        { requestId: req.requestId, err },
        'MT5 proxy error — falling back to CMS data',
      );

      const fallback = await payload.find({
        collection: 'products-instruments',
        where: {
          and: [
            { status: { equals: 'active' } },
            ...(assetClass ? [{ assetClass: { equals: assetClass } }] : []),
          ],
        },
        limit: MAX_PAYLOAD_RESULTS,
        depth: 0,
      });

      res.set('Cache-Control', 'public, max-age=60');
      return res.json({
        usesMT5Data: false,
        source: 'cms-fallback',
        fetchedAt: new Date().toISOString(),
        data: fallback.docs,
      } satisfies MT5Response<unknown[]>);
    }
  });

  // ── Single instrument ──────────────────────────────────────────────────────
  app.get('/api/mt5/instruments/:symbol', async (req: ReqWithId, res: Response) => {
    const symbol = req.params.symbol?.toUpperCase();
    if (!symbol || !SYMBOL_PATTERN.test(symbol)) {
      return res.status(400).json({ error: 'Invalid symbol' });
    }

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

      // Read global settings (overrideAccess so API key field is included).
      const settings = (await payload.findGlobal({
        slug: 'site-settings',
        overrideAccess: true,
      })) as {
        mt5SyncEnabled?: boolean;
        mt5ApiEndpoint?: string;
        mt5ApiKey?: string;
        mt5RefreshIntervalSecs?: number;
      };
      const globalEnabled = settings.mt5SyncEnabled !== false;
      const docEnabled = cmsDoc.usesMT5Data !== false;
      const cacheTtlMs =
        Math.min(Math.max(Number(settings.mt5RefreshIntervalSecs ?? 60), 10), 3600) * 1_000;

      if (!globalEnabled || !docEnabled) {
        // Either global or per-doc is OFF → return CMS data (no cache needed)
        res.set('Cache-Control', `public, max-age=${Math.round(cacheTtlMs / 1000)}`);
        return res.json({
          usesMT5Data: false,
          source: globalEnabled ? 'cms-manual' : 'cms-global-override',
          fetchedAt: new Date().toISOString(),
          data: cmsDoc,
        } satisfies MT5Response<unknown>);
      }

      // Check in-process cache before calling MT5.
      const cacheKey = `mt5:instrument:${symbol}`;
      const cached = cacheGet<MT5Response<unknown>>(cacheKey);
      if (cached) {
        res.set('Cache-Control', `public, max-age=${Math.round(cacheTtlMs / 1000)}`);
        return res.json(cached);
      }

      // Both switches ON and cache miss → fetch the specific instrument from the MT5 service.
      const mt5Base =
        safeMt5Endpoint(settings.mt5ApiEndpoint?.trim() || undefined) ??
        process.env.MT5_SERVICE_URL ??
        'http://localhost:4000';
      const mt5ApiKey = settings.mt5ApiKey?.trim() || undefined;
      const cmsMt5Symbol = typeof cmsDoc.mt5Symbol === 'string' ? cmsDoc.mt5Symbol : undefined;
      // Prefer the MT5 symbol alias if configured, otherwise use the CMS symbol.
      const lookupSymbol = cmsMt5Symbol ?? symbol;
      const mt5Res = await fetchWithTimeout(
        `${mt5Base}/instruments/${encodeURIComponent(lookupSymbol)}`,
        MT5_FETCH_TIMEOUT_MS,
        mt5ApiKey,
      );
      if (!mt5Res.ok) {
        payload.logger.error(
          { requestId: req.requestId, symbol, status: mt5Res.status },
          'MT5 upstream error',
        );
        throw new Error('Failed to fetch instrument data');
      }

      const mt5Single = (await mt5Res.json()) as MT5Response<InstrumentSpec | null>;
      const live = mt5Single.data;

      if (!live) {
        res.set('Cache-Control', `public, max-age=${Math.round(cacheTtlMs / 1000)}`);
        return res.json({
          usesMT5Data: false,
          source: 'cms-fallback',
          fetchedAt: new Date().toISOString(),
          data: cmsDoc,
        } satisfies MT5Response<unknown>);
      }

      const responseBody: MT5Response<unknown> = {
        usesMT5Data: true,
        source: 'mt5-live',
        fetchedAt: mt5Single.fetchedAt,
        data: { ...live, _source: 'mt5-live' as const },
      };

      cacheSet(cacheKey, responseBody, cacheTtlMs);

      res.set('Cache-Control', `public, max-age=${Math.round(cacheTtlMs / 1000)}`);
      return res.json(responseBody);
    } catch (err) {
      payload.logger.error(
        { requestId: req.requestId, err, symbol },
        'MT5 single-instrument proxy error',
      );
      const fallback = await payload.find({
        collection: 'products-instruments',
        where: { symbol: { equals: symbol } },
        limit: 1,
        depth: 0,
      });
      const doc = fallback.docs[0];
      if (!doc) return res.status(404).json({ error: 'Instrument not found' });
      res.set('Cache-Control', 'public, max-age=60');
      return res.json({
        usesMT5Data: false,
        source: 'cms-fallback',
        fetchedAt: new Date().toISOString(),
        data: doc,
      } satisfies MT5Response<unknown>);
    }
  });

  // ── Newsletter — double opt-in ─────────────────────────────────────────────
  // Rate-limited at NEWSLETTER_RATE_LIMIT req/min/IP.
  // Security: email validated server-side; IP hashed (never stored raw); token
  // is a UUID stored on the subscriber record and cleared after confirmation.
  app.post(
    '/api/newsletter/subscribe',
    newsletterLimiter,
    async (req: ReqWithId, res: Response) => {
      const { email, locale, source, utmParams } = req.body ?? {};

      if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }
      const safeLocale = locale === 'ar' ? 'ar' : 'en';

      try {
        // Check for existing record
        const existing = await payload.find({
          collection: 'newsletter-subscribers',
          where: { email: { equals: email.toLowerCase() } },
          limit: 1,
          depth: 0,
        });

        const existingDoc = existing.docs[0] as Record<string, unknown> | undefined;

        if (existingDoc?.status === 'subscribed') {
          // Generic response — identical to the fresh-subscribe message below so the
          // endpoint can't be used to enumerate which emails are subscribed (NE WR-4).
          return res.json({ message: 'Please check your email to confirm your subscription.' });
        }

        // Generate confirmation token and hash the IP.
        // Salted SHA-256 — CONSENT_IP_SALT prevents rainbow-table reversal
        // of the low-entropy IPv4 address space.
        const confirmToken = randomUUID();
        const confirmTokenExpiry = new Date(Date.now() + 72 * 60 * 60 * 1_000).toISOString();
        const rawIp = req.ip ?? req.socket.remoteAddress ?? '';
        const consentIpHash = createHash('sha256')
          .update(CONSENT_IP_SALT + rawIp)
          .digest('hex');
        const now = new Date().toISOString();

        // Validate and sanitize utmParams — only known keys, string values, bounded length.
        const ALLOWED_UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;
        const safeUtmParams =
          utmParams && typeof utmParams === 'object' && !Array.isArray(utmParams)
            ? Object.fromEntries(
                ALLOWED_UTM_KEYS.filter(
                  (k) => typeof (utmParams as Record<string, unknown>)[k] === 'string',
                ).map((k) => [k, String((utmParams as Record<string, unknown>)[k]).slice(0, 200)]),
              )
            : undefined;

        // Reuse existing unsubscribeToken (stable, never rotated) or generate one for new subscribers.
        const unsubscribeToken = existingDoc
          ? (existingDoc.unsubscribeToken as string | undefined)
          : randomUUID();

        if (existingDoc) {
          await payload.update({
            collection: 'newsletter-subscribers',
            id: existingDoc.id as string | number,
            data: {
              status: 'pending',
              locale: safeLocale,
              confirmToken,
              confirmTokenExpiry,
              consentTimestamp: now,
              consentIpHash,
              doubleOptInConfirmed: false,
            },
            depth: 0,
          });
        } else {
          await payload.create({
            collection: 'newsletter-subscribers',
            data: {
              email: email.toLowerCase(),
              locale: safeLocale,
              status: 'pending',
              source: typeof source === 'string' ? source.slice(0, 200) : undefined,
              consentTimestamp: now,
              consentIpHash,
              doubleOptInConfirmed: false,
              confirmToken,
              confirmTokenExpiry,
              unsubscribeToken,
              utmParams: safeUtmParams,
            },
            depth: 0,
          });
        }

        // Build the confirmation URL — always on the CMS so no frontend dep needed
        const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        const confirmUrl = `${serverUrl}/api/newsletter/confirm?token=${confirmToken}&redirect=${encodeURIComponent(frontendUrl)}`;

        // DB write succeeded — attempt email send separately so an email misconfiguration
        // (e.g. unverified Resend domain) does not roll back the subscriber record.
        try {
          await sendNewsletterConfirmation({
            email: email.toLowerCase(),
            confirmUrl,
            unsubscribeToken,
            locale: safeLocale,
          });
        } catch (emailErr) {
          payload.logger.error(
            { requestId: req.requestId, emailErr },
            'newsletter/subscribe: confirmation email failed — subscriber record saved, manual resend needed',
          );
          // Still return success: the record exists with confirmToken set.
          // Admin can resend the email once the ZeptoMail sending domain is verified.
        }

        return res.json({ message: 'Please check your email to confirm your subscription.' });
      } catch (err) {
        payload.logger.error({ requestId: req.requestId, err }, 'newsletter/subscribe error');
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
      }
    },
  );

  // GET /api/newsletter/confirm?token=...&redirect=...
  // Linked from the confirmation email. On success redirects to the frontend
  // success page (or returns JSON if redirect is absent / invalid).
  app.get('/api/newsletter/confirm', async (req: ReqWithId, res: Response) => {
    const token = typeof req.query.token === 'string' ? req.query.token : undefined;
    const rawRedirect = typeof req.query.redirect === 'string' ? req.query.redirect : undefined;

    if (!token || !/^[0-9a-f-]{36}$/.test(token)) {
      return res.status(400).json({ error: 'Invalid or missing confirmation token.' });
    }

    try {
      const result = await payload.find({
        collection: 'newsletter-subscribers',
        where: { confirmToken: { equals: token } },
        limit: 1,
        depth: 0,
      });

      const doc = result.docs[0] as Record<string, unknown> | undefined;
      if (!doc) {
        return res.status(400).json({ error: 'Invalid or expired confirmation link.' });
      }

      // Enforce the 72-hour expiry window stated in the confirmation email.
      const expiry = doc.confirmTokenExpiry as string | null | undefined;
      if (expiry && new Date(expiry) < new Date()) {
        return res
          .status(400)
          .json({ error: 'This confirmation link has expired. Please subscribe again.' });
      }

      await payload.update({
        collection: 'newsletter-subscribers',
        id: doc.id as string | number,
        data: {
          status: 'subscribed',
          doubleOptInConfirmed: true,
          doubleOptInTimestamp: new Date().toISOString(),
          // null (not undefined) is required to actually clear the field in Payload v2.
          // undefined is silently ignored and leaves the token in the DB indefinitely.
          confirmToken: null as unknown as string,
          confirmTokenExpiry: null as unknown as string,
        },
        depth: 0,
      });

      // Send welcome email — non-fatal, must never block the confirmation redirect.
      try {
        await sendNewsletterWelcome({
          email: doc.email as string,
          unsubscribeToken: doc.unsubscribeToken as string | undefined,
          locale: (doc.locale as string | undefined) === 'ar' ? 'ar' : 'en',
        });
      } catch (welcomeErr) {
        payload.logger.error(
          { requestId: req.requestId, welcomeErr },
          'newsletter/confirm: welcome email failed — subscriber still confirmed',
        );
      }

      // Redirect to frontend success page, falling back to a plain JSON response
      if (rawRedirect) {
        try {
          const target = new URL(rawRedirect);
          const allowedHost = new URL(process.env.FRONTEND_URL ?? 'http://localhost:3000').host;
          if (target.host === allowedHost) {
            target.pathname = target.pathname.replace(/\/$/, '') + '/newsletter/confirmed';
            return res.redirect(302, target.toString());
          }
        } catch {
          // malformed redirect — fall through to JSON
        }
      }
      return res.json({ message: 'Subscription confirmed. Thank you!' });
    } catch (err) {
      payload.logger.error({ requestId: req.requestId, err }, 'newsletter/confirm error');
      return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
  });

  // POST /api/newsletter/unsubscribe — { token } (preferred) or { email } (fallback)
  //
  // Token-based unsubscribe: the unsubscribeToken UUID is embedded in outgoing
  // email footers. Accepting only an email address allows anyone who knows a
  // subscriber's email to unsubscribe them (competitor abuse, mass-unsubscribe).
  app.post(
    '/api/newsletter/unsubscribe',
    newsletterLimiter,
    async (req: ReqWithId, res: Response) => {
      const { token, email } = req.body ?? {};

      // Prefer token lookup; fall back to email for backward compatibility.
      const isTokenRequest = typeof token === 'string' && token.length > 0;
      const isEmailRequest = typeof email === 'string' && email.length > 0;

      if (!isTokenRequest && !isEmailRequest) {
        return res.status(400).json({ error: 'Provide either a token or an email address.' });
      }

      try {
        let where: Where;
        if (isTokenRequest) {
          where = { unsubscribeToken: { equals: token as string } };
        } else {
          where = { email: { equals: (email as string).toLowerCase() } };
        }

        const result = await payload.find({
          collection: 'newsletter-subscribers',
          where,
          limit: 1,
          depth: 0,
        });

        const doc = result.docs[0] as Record<string, unknown> | undefined;
        if (!doc) {
          // Don't reveal whether the token/email exists.
          return res.json({ message: 'Unsubscribed.' });
        }

        await payload.update({
          collection: 'newsletter-subscribers',
          id: doc.id as string | number,
          data: { status: 'unsubscribed' },
          depth: 0,
        });

        return res.json({ message: 'Unsubscribed.' });
      } catch (err) {
        payload.logger.error({ requestId: req.requestId, err }, 'newsletter/unsubscribe error');
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
      }
    },
  );

  // GET /api/newsletter/unsubscribe?token=...
  // Linked from unsubscribe footers in outgoing emails. Email clients follow
  // href links as GET requests — the POST handler alone is unreachable from email.
  // Token-based only (no email fallback) to prevent cross-origin unsubscribe abuse.
  app.get(
    '/api/newsletter/unsubscribe',
    newsletterLimiter,
    async (req: ReqWithId, res: Response) => {
      const token = typeof req.query.token === 'string' ? req.query.token : undefined;
      if (!token) {
        return res.status(400).send('Missing unsubscribe token.');
      }

      try {
        const result = await payload.find({
          collection: 'newsletter-subscribers',
          where: { unsubscribeToken: { equals: token } },
          limit: 1,
          depth: 0,
        });

        const doc = result.docs[0] as Record<string, unknown> | undefined;
        if (doc) {
          await payload.update({
            collection: 'newsletter-subscribers',
            id: doc.id as string | number,
            data: { status: 'unsubscribed' },
            depth: 0,
          });
        }
        // Always redirect — don't reveal whether the token exists.
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        try {
          const target = new URL(frontendUrl);
          target.pathname = '/newsletter/unsubscribed';
          return res.redirect(302, target.toString());
        } catch {
          return res.json({ message: 'Unsubscribed.' });
        }
      } catch (err) {
        payload.logger.error({ requestId: req.requestId, err }, 'newsletter/unsubscribe GET error');
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
      }
    },
  );

  // ── Education gate — email capture before gated PDFs / ebooks ─────────────
  // On success returns the content URL (plain in dev; signed R2 URL in prod).
  app.post('/api/education/gate', newsletterLimiter, async (req: ReqWithId, res: Response) => {
    const { email, contentId, locale } = req.body ?? {};
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!contentId) {
      return res.status(400).json({ error: 'contentId is required.' });
    }

    const safeLocale = locale === 'ar' ? 'ar' : 'en';

    try {
      // Fetch the content record to validate and get the file URL.
      // payload.findByID throws NotFound when the id doesn't exist (Payload v2
      // behaviour), so we need an inner try-catch to return 404 rather than 500.
      let content: Record<string, unknown>;
      try {
        content = (await payload.findByID({
          collection: 'education-content',
          id: contentId as string,
          depth: 1,
          locale: safeLocale,
        })) as Record<string, unknown>;
      } catch {
        return res.status(404).json({ error: 'Content not found.' });
      }

      if (!content || content.status !== 'published') {
        return res.status(404).json({ error: 'Content not found.' });
      }
      if (!content.isGated) {
        return res.status(400).json({ error: 'This content does not require a gate.' });
      }

      // Upsert subscriber (pending if new — they get a confirmation for the newsletter too)
      const existing = await payload.find({
        collection: 'newsletter-subscribers',
        where: { email: { equals: email.toLowerCase() } },
        limit: 1,
        depth: 0,
      });

      const existingSubscriber = existing.docs[0] as Record<string, unknown> | undefined;

      if (!existingSubscriber) {
        // New email — create a pending subscriber and fire a confirmation email.
        const confirmToken = randomUUID();
        const confirmTokenExpiry = new Date(Date.now() + 72 * 60 * 60 * 1_000).toISOString();
        const rawIp = req.ip ?? req.socket.remoteAddress ?? '';
        const consentIpHash = createHash('sha256')
          .update(CONSENT_IP_SALT + rawIp)
          .digest('hex');
        const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        const confirmUrl = `${serverUrl}/api/newsletter/confirm?token=${confirmToken}&redirect=${encodeURIComponent(frontendUrl)}`;

        const unsubscribeToken = randomUUID();
        await payload.create({
          collection: 'newsletter-subscribers',
          data: {
            email: email.toLowerCase(),
            locale: safeLocale,
            status: 'pending',
            source: '/education-gate',
            consentTimestamp: new Date().toISOString(),
            consentIpHash,
            doubleOptInConfirmed: false,
            confirmToken,
            confirmTokenExpiry,
            unsubscribeToken,
          },
          depth: 0,
        });

        // Fire-and-forget — don't block returning the content URL.
        // unsubscribeToken reuses the same value stored in the DB above.
        sendNewsletterConfirmation({
          email: email.toLowerCase(),
          confirmUrl,
          unsubscribeToken,
          locale: safeLocale,
        }).catch((err) =>
          payload.logger.error({ err }, 'education gate: confirmation email failed'),
        );
      }
      // If subscriber already exists (any status) their email is captured — proceed to
      // return the content URL. We don't re-subscribe unsubscribed users here.

      // Resolve the file URL. In production this would be a short-lived signed R2 URL.
      const fileField = content.pdfFile as Record<string, unknown> | null | undefined;
      const fileUrl = (fileField?.url as string | undefined) ?? null;

      // Email the PDF to the requester (the primary delivery channel for ebooks).
      // Fire-and-forget so a slow SMTP hop doesn't block the response; in dev with
      // no SMTP_PASS this is logged via jsonTransport instead of sent.
      if (fileUrl) {
        const title = (content.title as string | undefined) ?? 'Your ebook';
        sendEbookDelivery({
          email: email.toLowerCase(),
          ebookTitle: title,
          fileUrl,
          locale: safeLocale,
        }).catch((err) => payload.logger.error({ err }, 'education gate: ebook email failed'));
      }

      // Still return the URL so the client can confirm delivery / offer a fallback.
      return res.json({ url: fileUrl, delivered: Boolean(fileUrl) });
    } catch (err) {
      payload.logger.error({ requestId: req.requestId, err }, 'education/gate error');
      return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
  });

  // ── Contact form ─────────────────────────────────────────────────────────
  app.post('/api/contact', contactLimiter, async (req: ReqWithId, res: Response) => {
    const { name, email, subject, message } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ errors: [{ field: 'name', message: 'Name is required.' }] });
    }
    if (name.trim().length > 200) {
      return res
        .status(400)
        .json({ errors: [{ field: 'name', message: 'Name must be 200 characters or fewer.' }] });
    }
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return res
        .status(400)
        .json({ errors: [{ field: 'email', message: 'A valid email address is required.' }] });
    }
    if (typeof subject !== 'string' || !subject.trim()) {
      return res
        .status(400)
        .json({ errors: [{ field: 'subject', message: 'Subject is required.' }] });
    }
    if (subject.trim().length > 300) {
      return res.status(400).json({
        errors: [{ field: 'subject', message: 'Subject must be 300 characters or fewer.' }],
      });
    }
    if (typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({
        errors: [{ field: 'message', message: 'Message must be at least 10 characters.' }],
      });
    }
    if (message.trim().length > 5_000) {
      return res.status(400).json({
        errors: [{ field: 'message', message: 'Message must be 5000 characters or fewer.' }],
      });
    }

    try {
      // Persist the submission first — so a misconfigured email transport never loses the data.
      const rawIp = req.ip ?? req.socket.remoteAddress ?? '';
      const ipHash = createHash('sha256')
        .update(CONSENT_IP_SALT + rawIp)
        .digest('hex');
      await payload.create({
        collection: 'contact-submissions',
        data: {
          name: name.trim(),
          email,
          subject: subject.trim(),
          message: message.trim(),
          submittedAt: new Date().toISOString(),
          ipHash,
          status: 'new',
        },
        depth: 0,
      });

      // Email notification is best-effort — DB record is the source of truth.
      try {
        await sendContactNotification({
          name: name.trim(),
          email,
          subject: subject.trim(),
          message: message.trim(),
        });
      } catch (emailErr) {
        payload.logger.error(
          { requestId: req.requestId, emailErr },
          'contact form: notification email failed — submission saved to CMS',
        );
      }

      return res.json({ message: 'Your message has been sent. We will get back to you shortly.' });
    } catch (err) {
      payload.logger.error({ requestId: req.requestId, err }, 'contact form error');
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
  });

  // ── Partners / IB application ─────────────────────────────────────────────
  app.post('/api/partners/apply', partnersLimiter, async (req: ReqWithId, res: Response) => {
    const { name, email, company, website, country, message } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ errors: [{ field: 'name', message: 'Name is required.' }] });
    }
    if (name.trim().length > 200) {
      return res
        .status(400)
        .json({ errors: [{ field: 'name', message: 'Name must be 200 characters or fewer.' }] });
    }
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return res
        .status(400)
        .json({ errors: [{ field: 'email', message: 'A valid email address is required.' }] });
    }
    // Validate website URL if provided
    if (website) {
      try {
        const u = new URL(String(website).trim());
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
          return res
            .status(400)
            .json({ errors: [{ field: 'website', message: 'Website must be a valid URL.' }] });
        }
      } catch {
        return res
          .status(400)
          .json({ errors: [{ field: 'website', message: 'Website must be a valid URL.' }] });
      }
    }

    try {
      const safeName = name.trim().slice(0, 200);
      const safeCompany = company ? String(company).trim().slice(0, 200) : '';
      const safeWebsite = website ? String(website).trim().slice(0, 500) : '';
      const safeCountry = country ? String(country).trim().slice(0, 100) : '';
      const safeMessage = message ? String(message).trim().slice(0, 5_000) : '';

      // Persist submission first — email notification is best-effort.
      // Stored in contact-submissions with subject 'Partnership Application' so it
      // surfaces in the admin Support inbox without needing a separate collection.
      const rawIp = req.ip ?? req.socket.remoteAddress ?? '';
      const ipHash = createHash('sha256')
        .update(CONSENT_IP_SALT + rawIp)
        .digest('hex');
      const details = [
        safeCompany && `Company: ${safeCompany}`,
        safeWebsite && `Website: ${safeWebsite}`,
        safeCountry && `Country: ${safeCountry}`,
        safeMessage && `Message: ${safeMessage}`,
      ]
        .filter(Boolean)
        .join('\n');

      await payload.create({
        collection: 'contact-submissions',
        data: {
          name: safeName,
          email,
          subject: 'Partnership Application',
          message: details || '(no additional details)',
          submittedAt: new Date().toISOString(),
          ipHash,
          status: 'new',
        },
        depth: 0,
      });

      // Email notification is best-effort — DB record is the source of truth.
      try {
        await sendPartnersNotification({
          name: safeName,
          email,
          ...(safeCompany && { company: safeCompany }),
          ...(safeWebsite && { website: safeWebsite }),
          ...(safeCountry && { country: safeCountry }),
          ...(safeMessage && { message: safeMessage }),
        });
      } catch (emailErr) {
        payload.logger.error(
          { requestId: req.requestId, emailErr },
          'partners/apply: notification email failed — application saved to CMS',
        );
      }

      return res.json({
        message: 'Your application has been received. Our partnerships team will be in touch.',
      });
    } catch (err) {
      payload.logger.error({ requestId: req.requestId, err }, 'partners/apply error');
      return res
        .status(500)
        .json({ error: 'Failed to submit application. Please try again later.' });
    }
  });

  // ── Webinar registration ─────────────────────────────────────────────────
  // Captures a registration + sends a Resend confirmation. No Zoom dependency.
  app.post('/api/webinars/register', webinarLimiter, async (req: ReqWithId, res: Response) => {
    const { name, email, webinarId, locale } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ errors: [{ field: 'name', message: 'Name is required.' }] });
    }
    if (name.trim().length > 200) {
      return res
        .status(400)
        .json({ errors: [{ field: 'name', message: 'Name must be 200 characters or fewer.' }] });
    }
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return res
        .status(400)
        .json({ errors: [{ field: 'email', message: 'A valid email address is required.' }] });
    }
    if (!webinarId) {
      return res
        .status(400)
        .json({ errors: [{ field: 'webinarId', message: 'webinarId is required.' }] });
    }
    const safeLocale = locale === 'ar' ? 'ar' : 'en';

    try {
      let webinar: Record<string, unknown>;
      try {
        webinar = (await payload.findByID({
          collection: 'webinars',
          id: webinarId as string,
          depth: 0,
        })) as Record<string, unknown>;
      } catch {
        return res.status(404).json({ error: 'Webinar not found.' });
      }
      if (!webinar) return res.status(404).json({ error: 'Webinar not found.' });

      const status = webinar.status as string | undefined;
      if (status !== 'upcoming' && status !== 'live') {
        return res.status(400).json({ error: 'Registration is not open for this webinar.' });
      }

      // Prevent duplicate registrations for the same email + webinar.
      const duplicate = await payload.find({
        collection: 'webinar-registrations',
        where: {
          and: [
            { email: { equals: email.toLowerCase() } },
            { webinar: { equals: webinar.id as number } },
          ],
        },
        limit: 1,
        depth: 0,
      });
      if (duplicate.docs.length > 0) {
        return res.json({ message: 'You are already registered for this webinar.' });
      }

      // Persist first (so an email failure doesn't lose the registration), then email.
      const rawIp = req.ip ?? req.socket.remoteAddress ?? '';
      const consentIpHash = createHash('sha256')
        .update(CONSENT_IP_SALT + rawIp)
        .digest('hex');

      await payload.create({
        collection: 'webinar-registrations',
        data: {
          webinar: webinar.id as number,
          name: name.trim().slice(0, 200),
          email: email.toLowerCase(),
          locale: safeLocale,
          registeredAt: new Date().toISOString(),
          consentIpHash,
        },
        depth: 0,
      });

      const webinarTitle = (webinar.title as string | undefined) ?? 'NewEra365 Webinar';
      const scheduledAt = webinar.scheduledAt as string | undefined;

      try {
        await sendWebinarRegistrationConfirmation({
          email: email.toLowerCase(),
          name: name.trim(),
          webinarTitle,
          scheduledAt,
          locale: safeLocale,
        });
        // Internal notify is best-effort — don't fail the request if it errors.
        await sendWebinarRegistrationNotification({
          name: name.trim(),
          email: email.toLowerCase(),
          webinarTitle,
        }).catch((notifyErr) =>
          payload.logger.error({ requestId: req.requestId, notifyErr }, 'webinar notify failed'),
        );
      } catch (emailErr) {
        payload.logger.error(
          { requestId: req.requestId, emailErr },
          'webinars/register: confirmation email failed — registration saved',
        );
      }

      return res.json({ message: 'You are registered. Check your email for confirmation.' });
    } catch (err) {
      payload.logger.error({ requestId: req.requestId, err }, 'webinars/register error');
      return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
  });
}
