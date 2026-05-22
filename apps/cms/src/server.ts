import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import payload from 'payload';
import { registerCustomEndpoints } from './endpoints';

const app = express();
const port = Number(process.env.PORT ?? 3001);

// Trust the first reverse-proxy hop (Railway / Cloudflare).
// Without this, req.ip resolves to the proxy's internal IP for every request,
// making all express-rate-limit counters key on the same address → useless.
app.set('trust proxy', 1);

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
app.use((_req: Request, res: Response, next: NextFunction) => {
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

  // Custom REST endpoints built on the Payload Express app.
  // Pass the initialized payload instance so endpoints can query collections
  // and globals (e.g. reading mt5SyncEnabled from SiteSettings).
  registerCustomEndpoints(app, payload);

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
