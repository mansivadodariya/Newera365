import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Custom REST endpoints layered on the Payload Express app. These are the
 * non-CMS routes the frontend calls:
 *   /api/mt5/*                    proxy to apps/mt5-service
 *   /api/newsletter/subscribe     double opt-in start (Mailchimp)
 *   /api/newsletter/confirm       opt-in confirmation
 *   /api/newsletter/unsubscribe
 *   /api/contact                  contact form (rate-limited 3/min/IP)
 *   /api/partners/apply           IB registration
 *   /api/education/gate           email gate for /ebooks, /research
 *   /api/webinars/register        Zoom registration (rate-limited 10/min/IP)
 *
 * Implementations land in Phase 3 — see the matching NE tickets.
 */
export function registerCustomEndpoints(app: Express): void {
  const contactLimiter = rateLimit({ windowMs: 60_000, max: 3 });
  const webinarLimiter = rateLimit({ windowMs: 60_000, max: 10 });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/contact', contactLimiter, (_req, res) => {
    res.status(501).json({ error: 'not implemented — Phase 3 (NE-039)' });
  });

  app.post('/api/webinars/register', webinarLimiter, (_req, res) => {
    res.status(501).json({ error: 'not implemented — Phase 3 (NE-033)' });
  });
}
