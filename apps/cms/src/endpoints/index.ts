import { randomUUID, createHash } from 'crypto';
import type { Express, Request, Response, NextFunction } from 'express';
import type { Payload } from 'payload';
import type { Where } from 'payload/dist/types';
import rateLimit from 'express-rate-limit';
import {
  ASSET_CLASSES,
  isAssetClass,
  type AssetClass,
  type MT5Response,
  type InstrumentSpec,
} from '@newera365/types';
import {
  sendNewsletterConfirmation,
  sendContactNotification,
  sendPartnersNotification,
} from '../email/resend';

/**
 * Custom REST endpoints layered on the Payload Express app. These are the
 * non-CMS routes the frontend calls:
 *   /api/mt5/instruments          MT5 proxy — respects global + per-doc toggles
 *   /api/mt5/instruments/:symbol  Single instrument
 *   /api/newsletter/subscribe     double opt-in start (Mailchimp)
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

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const CONTACT_RATE_LIMIT = Number(process.env.CONTACT_RATE_LIMIT ?? 3);
const WEBINAR_RATE_LIMIT = Number(process.env.WEBINAR_RATE_LIMIT ?? 10);
const NEWSLETTER_RATE_LIMIT = Number(process.env.NEWSLETTER_RATE_LIMIT ?? 5);
const MAX_PAYLOAD_RESULTS = Number(process.env.MAX_PAYLOAD_RESULTS ?? 500);
const MT5_FETCH_TIMEOUT_MS = Number(process.env.MT5_FETCH_TIMEOUT_MS ?? 5_000);
const HEALTH_CHECK_TOKEN = process.env.HEALTH_CHECK_TOKEN;
// Salt for IP hashing — prevents rainbow-table reversal of low-entropy IPv4 space.
// Set CONSENT_IP_SALT to a random string in your environment (.env).
const CONSENT_IP_SALT = process.env.CONSENT_IP_SALT ?? '';

const SYMBOL_PATTERN = /^[A-Z0-9._-]{1,20}$/;

type ReqWithId = Request & { requestId?: string };

const requestIdMiddleware = (req: ReqWithId, _res: Response, next: NextFunction): void => {
  req.requestId = randomUUID();
  next();
};

const MT5_INTERNAL_API_TOKEN = process.env.MT5_INTERNAL_API_TOKEN;

// Returns the fetch Response (Node 18+ global). Return type inferred to avoid
// a name clash with Express's `Response` type in this file.
// Attaches the internal auth token if configured (required in production).
const fetchWithTimeout = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {};
  if (MT5_INTERNAL_API_TOKEN) headers['authorization'] = `Bearer ${MT5_INTERNAL_API_TOKEN}`;
  try {
    return await fetch(url, { signal: controller.signal, headers });
  } finally {
    clearTimeout(timer);
  }
};

export function registerCustomEndpoints(app: Express, payload: Payload): void {
  app.use(requestIdMiddleware);

  const contactLimiter = rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: CONTACT_RATE_LIMIT });
  const webinarLimiter = rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: WEBINAR_RATE_LIMIT });
  const newsletterLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: NEWSLETTER_RATE_LIMIT,
  });

  // ── Health ─────────────────────────────────────────────────────────────────
  // Token-gated to prevent uptime fingerprinting and DDoS amplification.
  app.get('/api/health', (req: Request, res: Response) => {
    const provided = req.header('x-health-token');
    if (!HEALTH_CHECK_TOKEN || provided !== HEALTH_CHECK_TOKEN) {
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

      // Step 2 — global is ON; call the MT5 bridge service
      const mt5Base = process.env.MT5_SERVICE_URL ?? 'http://localhost:4000';
      const mt5Url = new URL(`${mt5Base}/instruments`);
      if (assetClass) mt5Url.searchParams.set('assetClass', assetClass);

      const mt5Res = await fetchWithTimeout(mt5Url.toString(), MT5_FETCH_TIMEOUT_MS);
      if (!mt5Res.ok) {
        payload.logger.error(
          { requestId: req.requestId, status: mt5Res.status },
          'MT5 upstream error',
        );
        throw new Error('Failed to fetch instrument data');
      }

      const mt5Payload = (await mt5Res.json()) as MT5Response<InstrumentSpec[]>;

      // Step 3 — per-instrument overrides: find instruments where the
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

      if (!manualQuery.docs?.length) {
        res.set('Cache-Control', 'public, max-age=60');
        return res.json(mt5Payload);
      }

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

      res.set('Cache-Control', 'public, max-age=60');
      return res.json({
        usesMT5Data: mt5Payload.usesMT5Data,
        source: 'mt5-live',
        fetchedAt: mt5Payload.fetchedAt,
        data: merged,
      } satisfies MT5Response<unknown[]>);
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

      // Read global switch
      const settings = await payload.findGlobal({ slug: 'site-settings' });
      const globalEnabled = (settings as { mt5SyncEnabled?: boolean }).mt5SyncEnabled !== false;
      const docEnabled = cmsDoc.usesMT5Data !== false;

      if (!globalEnabled || !docEnabled) {
        // Either global or per-doc is OFF → return CMS data
        res.set('Cache-Control', 'public, max-age=300');
        return res.json({
          usesMT5Data: false,
          source: globalEnabled ? 'cms-manual' : 'cms-global-override',
          fetchedAt: new Date().toISOString(),
          data: cmsDoc,
        } satisfies MT5Response<unknown>);
      }

      // Both switches ON → fetch the specific instrument from the MT5 service.
      // Previously called /instruments (all) and filtered client-side — wasteful.
      const mt5Base = process.env.MT5_SERVICE_URL ?? 'http://localhost:4000';
      const cmsMt5Symbol = typeof cmsDoc.mt5Symbol === 'string' ? cmsDoc.mt5Symbol : undefined;
      // Prefer the MT5 symbol alias if configured, otherwise use the CMS symbol.
      const lookupSymbol = cmsMt5Symbol ?? symbol;
      const mt5Res = await fetchWithTimeout(
        `${mt5Base}/instruments/${encodeURIComponent(lookupSymbol)}`,
        MT5_FETCH_TIMEOUT_MS,
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
        res.set('Cache-Control', 'public, max-age=300');
        return res.json({
          usesMT5Data: false,
          source: 'cms-fallback',
          fetchedAt: new Date().toISOString(),
          data: cmsDoc,
        } satisfies MT5Response<unknown>);
      }

      res.set('Cache-Control', 'public, max-age=300');
      return res.json({
        usesMT5Data: true,
        source: 'mt5-live',
        fetchedAt: mt5Single.fetchedAt,
        data: { ...live, _source: 'mt5-live' as const },
      } satisfies MT5Response<unknown>);
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
      res.set('Cache-Control', 'public, max-age=300');
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

      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
          return res.json({ message: 'You are already subscribed.' });
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
              doubleOptInTimestamp: null,
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
              // Stable token for unsubscribe links — generated once, never rotated.
              unsubscribeToken: randomUUID(),
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
        // Look up the unsubscribeToken we just wrote so it can go into the email footer.
        const savedDoc = await payload.find({
          collection: 'newsletter-subscribers',
          where: { email: { equals: email.toLowerCase() } },
          limit: 1,
          depth: 0,
        });
        const unsubTok = (savedDoc.docs[0] as Record<string, unknown> | undefined)
          ?.unsubscribeToken as string | undefined;
        try {
          await sendNewsletterConfirmation({
            email: email.toLowerCase(),
            confirmUrl,
            unsubscribeToken: unsubTok,
            locale: safeLocale,
          });
        } catch (emailErr) {
          payload.logger.error(
            { requestId: req.requestId, emailErr },
            'newsletter/subscribe: confirmation email failed — subscriber record saved, manual resend needed',
          );
          // Still return success: the record exists with confirmToken set.
          // Admin can resend the email once Resend domain is verified.
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
          confirmToken: null,
          confirmTokenExpiry: null,
        },
        depth: 0,
      });

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

  // ── Education gate — email capture before gated PDFs / ebooks ─────────────
  // On success returns the content URL (plain in dev; signed R2 URL in prod).
  app.post('/api/education/gate', newsletterLimiter, async (req: ReqWithId, res: Response) => {
    const { email, contentId, locale } = req.body ?? {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!contentId) {
      return res.status(400).json({ error: 'contentId is required.' });
    }

    try {
      // Fetch the content record to validate and get the file URL
      const content = (await payload.findByID({
        collection: 'education-content',
        id: contentId as string,
        depth: 1,
      })) as Record<string, unknown>;

      if (!content || content.status !== 'published') {
        return res.status(404).json({ error: 'Content not found.' });
      }
      if (!content.isGated) {
        return res.status(400).json({ error: 'This content does not require a gate.' });
      }

      const safeLocale = locale === 'ar' ? 'ar' : 'en';

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
            unsubscribeToken: randomUUID(),
          },
          depth: 0,
        });

        // Fire-and-forget — don't block returning the content URL
        sendNewsletterConfirmation({
          email: email.toLowerCase(),
          confirmUrl,
          unsubscribeToken: randomUUID(),
          locale: safeLocale,
        }).catch((err) =>
          payload.logger.error({ err }, 'education gate: confirmation email failed'),
        );
      }
      // If subscriber already exists (any status) their email is captured — proceed to
      // return the content URL. We don't re-subscribe unsubscribed users here.

      // Return the file URL. In production this would be a short-lived signed R2 URL.
      const fileField = content.pdfFile as Record<string, unknown> | null | undefined;
      const fileUrl = (fileField?.url as string | undefined) ?? null;

      return res.json({ url: fileUrl });
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
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      return res
        .status(400)
        .json({
          errors: [{ field: 'subject', message: 'Subject must be 300 characters or fewer.' }],
        });
    }
    if (typeof message !== 'string' || message.trim().length < 10) {
      return res
        .status(400)
        .json({
          errors: [{ field: 'message', message: 'Message must be at least 10 characters.' }],
        });
    }
    if (message.trim().length > 5_000) {
      return res
        .status(400)
        .json({
          errors: [{ field: 'message', message: 'Message must be 5000 characters or fewer.' }],
        });
    }

    try {
      await sendContactNotification({
        name: name.trim(),
        email,
        subject: subject.trim(),
        message: message.trim(),
      });
      return res.json({ message: 'Your message has been sent. We will get back to you shortly.' });
    } catch (err) {
      payload.logger.error({ requestId: req.requestId, err }, 'contact form error');
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
  });

  // ── Partners / IB application ─────────────────────────────────────────────
  app.post('/api/partners/apply', newsletterLimiter, async (req: ReqWithId, res: Response) => {
    const { name, email, company, website, country, message } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ errors: [{ field: 'name', message: 'Name is required.' }] });
    }
    if (name.trim().length > 200) {
      return res
        .status(400)
        .json({ errors: [{ field: 'name', message: 'Name must be 200 characters or fewer.' }] });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      const data: Record<string, string> = {
        name: name.trim().slice(0, 200),
        email,
        ...(company && { company: String(company).trim().slice(0, 200) }),
        ...(website && { website: String(website).trim().slice(0, 500) }),
        ...(country && { country: String(country).trim().slice(0, 100) }),
        ...(message && { message: String(message).trim().slice(0, 5_000) }),
      };
      await sendPartnersNotification(data);
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
  app.post('/api/webinars/register', webinarLimiter, (_req, res) => {
    res.status(501).json({ error: 'This endpoint is not yet available.' });
  });
}
