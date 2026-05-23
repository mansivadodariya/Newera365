import { Pool } from 'pg';
import type { Store, Options, ClientRateLimitInfo } from 'express-rate-limit';

/**
 * A small fixed-window rate-limit store for express-rate-limit v7, backed by the
 * existing Postgres database (DATABASE_URL). Durable across deploys/restarts and a
 * single source of truth across instances — without pulling in a third-party store
 * that requires its own out-of-band schema migrations.
 *
 * One shared pool serves all limiters; each limiter gets a `prefix` so their hit
 * counters never collide. Server-only (lives under endpoints/, which is aliased out
 * of the admin webpack bundle).
 */

let sharedPool: Pool | null = null;

function getPool(): Pool {
  if (!sharedPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    const skipSsl = process.env.MIGRATE_SKIP_SSL === 'true';
    sharedPool = new Pool({
      connectionString,
      ssl: skipSsl ? false : { rejectUnauthorized: true },
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return sharedPool;
}

class PostgresRateLimitStore implements Store {
  private windowMs = 60_000;
  // Named keyPrefix (not `prefix`) — express-rate-limit's Store interface declares
  // an optional public `prefix`, which a private member of the same name conflicts with.
  constructor(private readonly keyPrefix: string) {}

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private fullKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const intervalMs = this.windowMs;
    // Atomic fixed-window upsert: reset count when the window has expired,
    // otherwise increment within the current window.
    const { rows } = await getPool().query(
      `INSERT INTO rate_limit_hits (key, count, expires_at)
       VALUES ($1, 1, now() + ($2::double precision / 1000) * interval '1 second')
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN rate_limit_hits.expires_at < now() THEN 1
                      ELSE rate_limit_hits.count + 1 END,
         expires_at = CASE WHEN rate_limit_hits.expires_at < now()
                           THEN now() + ($2::double precision / 1000) * interval '1 second'
                           ELSE rate_limit_hits.expires_at END
       RETURNING count, expires_at;`,
      [this.fullKey(key), intervalMs],
    );
    const row = rows[0] as { count: number; expires_at: Date };
    return { totalHits: Number(row.count), resetTime: new Date(row.expires_at) };
  }

  async decrement(key: string): Promise<void> {
    await getPool().query(
      `UPDATE rate_limit_hits SET count = GREATEST(count - 1, 0)
       WHERE key = $1 AND expires_at >= now();`,
      [this.fullKey(key)],
    );
  }

  async resetKey(key: string): Promise<void> {
    await getPool().query(`DELETE FROM rate_limit_hits WHERE key = $1;`, [this.fullKey(key)]);
  }
}

/**
 * Ensures the backing table exists (idempotent) and returns a factory that builds
 * a store per limiter prefix. Returns null if the table cannot be provisioned, so
 * callers fall back to express-rate-limit's default in-memory store.
 */
export async function createRateLimitStoreFactory(): Promise<((prefix: string) => Store) | null> {
  try {
    await getPool().query(
      `CREATE TABLE IF NOT EXISTS rate_limit_hits (
         key text PRIMARY KEY,
         count integer NOT NULL DEFAULT 0,
         expires_at timestamptz NOT NULL
       );`,
    );
    return (prefix: string) => new PostgresRateLimitStore(prefix);
  } catch {
    return null;
  }
}
