import 'dotenv/config';
import path from 'path';
import express, { type Request, type Response, type NextFunction } from 'express';
import payload from 'payload';
import { registerCustomEndpoints } from './endpoints';
import { runSlugIndexMigration } from './db/runSlugIndexMigration';
import { startMt5SyncJob } from './jobs/mt5Sync';

const app = express();
const port = Number(process.env.PORT ?? 3001);

// Number of reverse-proxy hops to trust for req.ip / X-Forwarded-For.
// Without this, req.ip resolves to the proxy's internal IP for every request,
// making all rate-limit counters key on the same address → useless. But trusting
// MORE hops than actually exist lets clients spoof X-Forwarded-For to bypass the
// IP rate limits (NE code-review WR-1), so the count MUST match the real edge
// topology (e.g. Cloudflare → Railway = 2). Configurable via TRUST_PROXY_HOPS;
// behind Cloudflare, prefer keying limits on the un-spoofable CF-Connecting-IP.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1);
app.set('trust proxy', Number.isFinite(trustProxyHops) ? trustProxyHops : 1);

// Serve public assets (logo, etc.)
app.use('/public', express.static(path.join(__dirname, '../public')));

// Baseline security headers. CSP allows self + TradingView (used by
// MarketAnalysis chartEmbed) and Cloudflare R2 media domain when configured.
const r2Host = (() => {
  const raw = process.env.R2_PUBLIC_URL;
  if (!raw) return undefined;
  try {
    return new URL(raw).host;
  } catch {
    return undefined;
  }
})();
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip the strict CSP for the Payload admin panel. The admin SPA boots through
  // runtime code generation (ajv compiles field validators via the Function
  // constructor), which a CSP lacking 'unsafe-eval' blocks — leaving a blank
  // white panel. Payload ships no CSP on the admin by default; mirror that and
  // keep the strict CSP on the public API/content routes only. The other
  // hardening headers below still apply everywhere, including /admin.
  const isAdmin = req.path === '/admin' || req.path.startsWith('/admin/');
  if (!isAdmin) {
    const imgSrc = ["'self'", 'data:', 'https://s3.tradingview.com'];
    if (r2Host) imgSrc.push(`https://${r2Host}`);
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        `img-src ${imgSrc.join(' ')}`,
        "script-src 'self' 'unsafe-inline' https://s3.tradingview.com https://www.tradingview.com",
        'frame-src https://www.tradingview.com https://s.tradingview.com',
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self'",
      ].join('; '),
    );
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const start = async (): Promise<void> => {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');

  await payload.init({
    secret,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload admin: ${payload.getAdminURL()}`);
    },
  });

  // Apply the slug unique indexes. Idempotent (CREATE ... IF NOT EXISTS) so
  // it is safe on every boot. Defaults to ON in production; set
  // RUN_MIGRATIONS_ON_START=false to skip. A failure here is non-fatal — log
  // and continue rather than crash the server.
  const runMigrations =
    process.env.RUN_MIGRATIONS_ON_START === 'true' ||
    (process.env.RUN_MIGRATIONS_ON_START !== 'false' && process.env.NODE_ENV === 'production');
  if (runMigrations) {
    try {
      await runSlugIndexMigration();
      payload.logger.info('Slug-locale unique index migration applied (or already present).');
    } catch (err) {
      payload.logger.error(
        { err },
        'Slug-index migration failed — continuing (app hook still enforces uniqueness).',
      );
    }
  }

  // Custom REST endpoints built on the Payload Express app.
  // Pass the initialized payload instance so endpoints can query collections
  // and globals (e.g. reading mt5SyncEnabled from SiteSettings).
  await registerCustomEndpoints(app, payload);

  // Background MT5 sync job — polls the MT5 bridge on the interval configured
  // in Site Settings → MT5 Integration and writes sync status back to each
  // instrument/account-type record. Also pre-populates the in-process cache.
  startMt5SyncJob(payload);

  // Redirect /admin → /admin/ so browsers don't get a bare Express 404.
  app.get('/admin', (_req: Request, res: Response) => res.redirect(301, '/admin/'));

  const server = app.listen(port, () => {
    payload.logger.info(`CMS server listening on http://localhost:${port}`);
  });

  const shutdown = (signal: string): void => {
    payload.logger.info(`Received ${signal} — shutting down gracefully`);
    // closeAllConnections() drains keep-alive sockets immediately (Node 18.2+).
    // Without it, server.close() waits indefinitely for persistent connections,
    // causing Railway rolling deploys to hard-kill in-flight requests.
    server.closeAllConnections?.();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

void start();
