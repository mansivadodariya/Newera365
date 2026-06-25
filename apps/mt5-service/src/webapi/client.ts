import https from 'https';
import { createHash, randomBytes } from 'crypto';

// Minimal MetaTrader 5 Manager Web API client (HTTP/JSON over TLS).
//
// Why hand-rolled: public MT5 Web API libraries are DMCA-encumbered (MetaQuotes
// takes them down) and we will not hand the manager password to an unvetted
// dependency. This implements only the handshake + the read commands the site
// needs. The protocol is the standard MT5 Web API challenge-response; the exact
// shape is verified empirically against the live server (see webapi/verify.ts).
//
// Session model: the server ties auth state to the TCP connection, so every
// request goes through ONE keep-alive socket (maxSockets:1). The first command
// after connect() reuses the authenticated socket.

export type PasswordEncoding = 'utf16le' | 'utf8';

export interface Mt5ClientOptions {
  host: string;
  port: number;
  login: string;
  password: string;
  /** API build advertised in auth/start. Server reported version_access 5830. */
  version?: string;
  agent?: string;
  /** MetaQuotes hashes the password as UTF-16LE; UTF-8 kept as a fallback to try. */
  passwordEncoding?: PasswordEncoding;
  /** Optional sha256 fingerprint (hex, no colons) to pin the self-signed cert. */
  certSha256?: string;
  timeoutMs?: number;
}

export interface Mt5ApiResponse {
  retcode?: string;
  [k: string]: unknown;
}

const isOk = (retcode: unknown): boolean =>
  String(retcode ?? '')
    .trim()
    .startsWith('0');

// Tracks sockets we've already attached the cert-pin check to, so reusing the
// keep-alive socket across many requests doesn't pile up secureConnect listeners.
const pinnedSockets = new WeakSet<object>();

export class Mt5WebApiClient {
  private readonly o: Required<Omit<Mt5ClientOptions, 'certSha256'>> & { certSha256?: string };
  private readonly httpsAgent: https.Agent;
  private authed = false;

  constructor(opts: Mt5ClientOptions) {
    // Per-field with ?? — a spread `{...defaults, ...opts}` would let an explicit
    // `version: undefined` from a caller clobber the default and send "undefined".
    this.o = {
      host: opts.host,
      port: opts.port,
      login: opts.login,
      password: opts.password,
      version: opts.version ?? '5830',
      agent: opts.agent ?? 'NewEra365',
      passwordEncoding: opts.passwordEncoding ?? 'utf16le',
      certSha256: opts.certSha256,
      timeoutMs: opts.timeoutMs ?? 8_000,
    };
    // Self-signed cert on the broker host → skip CA chain validation; pin the
    // leaf fingerprint instead when MT5_CERT_SHA256 is configured (checked below).
    this.httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 1,
      rejectUnauthorized: false,
    });
  }

  private get base(): string {
    return `https://${this.o.host}:${this.o.port}`;
  }

  private request(path: string): Promise<Mt5ApiResponse> {
    return new Promise((resolve, reject) => {
      if (process.env.MT5_DEBUG) console.error('[mt5] GET', this.base + path);
      const req = https.request(
        this.base + path,
        { agent: this.httpsAgent, method: 'GET', timeout: this.o.timeoutMs },
        (res) => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (c) => (body += c));
          res.on('end', () => {
            if (process.env.MT5_DEBUG)
              console.error('[mt5] <-', res.statusCode, body.slice(0, 80).replace(/\s+/g, ' '));
            try {
              resolve(JSON.parse(body) as Mt5ApiResponse);
            } catch {
              reject(new Error(`MT5 non-JSON response (${res.statusCode}): ${body.slice(0, 200)}`));
            }
          });
        },
      );
      // Pin the self-signed leaf cert — once per socket (keep-alive reuses it).
      req.on('socket', (socket) => {
        if (!this.o.certSha256 || pinnedSockets.has(socket)) return;
        pinnedSockets.add(socket);
        socket.once('secureConnect', () => {
          const tls = socket as import('tls').TLSSocket;
          const fp = (tls.getPeerCertificate?.().fingerprint256 ?? '')
            .replace(/:/g, '')
            .toLowerCase();
          if (fp && fp !== this.o.certSha256!.replace(/:/g, '').toLowerCase()) {
            req.destroy(new Error('MT5 cert fingerprint mismatch — refusing to send credentials'));
          }
        });
      });
      req.on('timeout', () => req.destroy(new Error('MT5 request timed out')));
      req.on('error', reject);
      req.end();
    });
  }

  /** MT5 "WebAPI" password hash: MD5( MD5(encoded(password)) + "WebAPI" ). */
  private passwordHash(): Buffer {
    const pw = Buffer.from(this.o.password, this.o.passwordEncoding);
    const h1 = createHash('md5').update(pw).digest();
    return createHash('md5')
      .update(Buffer.concat([h1, Buffer.from('WebAPI', 'utf8')]))
      .digest();
  }

  /** Performs the auth_start / auth_answer challenge-response. crypt_method=NONE
   *  (TLS already encrypts the transport, so the AES session layer is redundant). */
  async connect(): Promise<void> {
    const q = new URLSearchParams({
      version: this.o.version,
      agent: this.o.agent,
      login: this.o.login,
      type: 'manager',
      crypt_method: 'NONE',
    });
    const start = await this.request(`/api/auth/start?${q.toString()}`);
    const srvRand = typeof start.srv_rand === 'string' ? start.srv_rand : '';
    if (!isOk(start.retcode) || !srvRand) {
      throw new Error(`MT5 auth/start failed: ${JSON.stringify(start)}`);
    }

    const authHash = this.passwordHash();
    const srvRandAnswer = createHash('md5')
      .update(Buffer.concat([authHash, Buffer.from(srvRand, 'hex')]))
      .digest('hex');
    const cliRand = randomBytes(16).toString('hex');

    const answer = await this.request(
      `/api/auth/answer?${new URLSearchParams({ srv_rand_answer: srvRandAnswer, cli_rand: cliRand }).toString()}`,
    );
    if (!isOk(answer.retcode)) {
      throw new Error(
        `MT5 auth/answer rejected (wrong password/login/encoding?): ${JSON.stringify(answer)}`,
      );
    }

    // Mutual auth: confirm the server proved it knows the password hash too.
    const expected = createHash('md5')
      .update(Buffer.concat([authHash, Buffer.from(cliRand, 'hex')]))
      .digest('hex');
    if (
      typeof answer.cli_rand_answer === 'string' &&
      answer.cli_rand_answer.toLowerCase() !== expected
    ) {
      throw new Error('MT5 server failed mutual auth (cli_rand_answer mismatch)');
    }
    this.authed = true;
  }

  /** Issues an authenticated GET; connects (auths) on first use. */
  async command(path: string): Promise<Mt5ApiResponse> {
    if (!this.authed) await this.connect();
    const res = await this.request(path);
    if (!isOk(res.retcode)) {
      // Re-auth once in case the session dropped, then retry.
      this.authed = false;
      await this.connect();
      return this.request(path);
    }
    return res;
  }

  /** Single authenticated request with NO retcode check or retry — for the
   *  discovery/verify script that needs to see the raw response (incl. errors). */
  async getRaw(path: string): Promise<Mt5ApiResponse> {
    if (!this.authed) await this.connect();
    return this.request(path);
  }

  get isAuthed(): boolean {
    return this.authed;
  }
}
