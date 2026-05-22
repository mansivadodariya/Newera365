import 'dotenv/config';
import { timingSafeEqual } from 'crypto';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { ASSET_CLASSES, isAssetClass } from '@newera365/types';
import { getInstruments, getInstrument } from './manager';

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

const app = express();
const port = Number(process.env.PORT ?? 4000);
const HEALTH_CHECK_TOKEN = process.env.HEALTH_CHECK_TOKEN;
// Shared secret between CMS and MT5 service.
// Set MT5_INTERNAL_API_TOKEN in both services' env vars.
// When unset the service logs a warning but remains accessible (dev convenience).
const MT5_INTERNAL_API_TOKEN = process.env.MT5_INTERNAL_API_TOKEN;
if (!MT5_INTERNAL_API_TOKEN) {
  // eslint-disable-next-line no-console
  console.warn(
    '[mt5-service] MT5_INTERNAL_API_TOKEN is not set — /instruments endpoints are unprotected. Set this in production.',
  );
}

app.use(cors());
app.use(express.json());

// Internal auth middleware — applied to all /instruments routes.
// Skipped when the token is not configured (dev mode without env var).
function requireInternalToken(req: Request, res: Response, next: NextFunction): void {
  if (!MT5_INTERNAL_API_TOKEN) {
    next();
    return;
  }
  const provided = req.header('authorization');
  if (!safeTokenCompare(provided, `Bearer ${MT5_INTERNAL_API_TOKEN}`)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.get('/health', (req, res) => {
  const provided = req.header('x-health-token');
  if (!HEALTH_CHECK_TOKEN || !safeTokenCompare(provided, HEALTH_CHECK_TOKEN)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ status: 'ok' });
});

app.get('/instruments', requireInternalToken, async (req, res) => {
  try {
    const raw = req.query.assetClass;
    if (raw !== undefined && !isAssetClass(raw)) {
      return res.status(400).json({ error: 'Invalid assetClass', allowed: ASSET_CLASSES });
    }
    const assetClass = typeof raw === 'string' ? raw : undefined;
    return res.json(await getInstruments(assetClass));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in /instruments handler', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Single-instrument endpoint — avoids fetching the full list just to find one row.
app.get('/instruments/:symbol', requireInternalToken, async (req, res) => {
  try {
    const symbol = req.params.symbol?.toUpperCase();
    if (!symbol || !/^[A-Z0-9._-]{1,20}$/.test(symbol)) {
      return res.status(400).json({ error: 'Invalid symbol' });
    }
    const result = await getInstrument(symbol);
    if (!result.data) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    return res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in /instruments/:symbol handler', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MT5 mock service listening on http://localhost:${port}`);
});

const shutdown = (signal: string): void => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal} — shutting down gracefully`);
  server.close(() => process.exit(0));
  // Force-exit after 10s if requests don't drain.
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
