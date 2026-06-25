import 'dotenv/config';
import { Mt5WebApiClient, type PasswordEncoding } from './client';

// Standalone MT5 Web API connectivity + discovery probe.
//   npx ts-node src/webapi/verify.ts   (from apps/mt5-service, with .env populated)
//
// 1. Auto-tries password encodings until auth succeeds (reveals what the server wants).
// 2. Dumps raw symbol/tick responses so we map to the REAL field names, not guesses.

const { MT5_HOST, MT5_PORT, MT5_LOGIN, MT5_PASSWORD, MT5_CERT_SHA256, MT5_WEBAPI_VERSION } =
  process.env;

function need(name: string, v: string | undefined): string {
  if (!v) {
    console.error(`Missing ${name} — set it in apps/mt5-service/.env (never commit real creds).`);
    process.exit(2);
  }
  return v;
}

const trunc = (o: unknown): string => {
  const s = JSON.stringify(o);
  return s.length > 600 ? s.slice(0, 600) + '…' : s;
};

async function main(): Promise<void> {
  const host = need('MT5_HOST', MT5_HOST);
  const port = Number(MT5_PORT ?? 443);
  const login = need('MT5_LOGIN', MT5_LOGIN);
  const password = need('MT5_PASSWORD', MT5_PASSWORD);

  console.log(`Connecting to ${host}:${port} as manager ${login} …`);

  let client: Mt5WebApiClient | null = null;
  let usedEncoding: PasswordEncoding | null = null;

  for (const enc of ['utf16le', 'utf8'] as PasswordEncoding[]) {
    const c = new Mt5WebApiClient({
      host,
      port,
      login,
      password,
      passwordEncoding: enc,
      certSha256: MT5_CERT_SHA256 || undefined,
      version: MT5_WEBAPI_VERSION || undefined,
    });
    try {
      await c.connect();
      client = c;
      usedEncoding = enc;
      console.log(`✅ AUTH OK with passwordEncoding="${enc}"`);
      break;
    } catch (e) {
      console.log(`✗ auth failed with encoding="${enc}": ${(e as Error).message}`);
    }
  }

  if (!client) {
    console.error(
      '\n❌ Could not authenticate with any encoding. Check login/password (is it the API Password, not Master?).',
    );
    process.exit(1);
  }
  console.log(
    `\n--- discovery (encoding=${usedEncoding}) — dumping raw responses to map fields ---`,
  );

  // Probe the likely read commands. We print whatever comes back (incl. error
  // retcodes / 404s) so the real paths + field names are revealed in one run.
  const probes = [
    '/api/symbol/total',
    '/api/symbol/get?symbol=EURUSD',
    '/api/symbol/get?symbol=EURUSD.r',
    '/api/tick/last?symbol=EURUSD',
    '/api/tick/last?group=*&symbol=EURUSD',
    '/api/symbol/index_get?index=0',
  ];
  for (const path of probes) {
    try {
      const res = await client.getRaw(path);
      console.log(`\nGET ${path}\n  -> ${trunc(res)}`);
    } catch (e) {
      console.log(`\nGET ${path}\n  -> ERROR ${(e as Error).message}`);
    }
  }
  console.log(
    '\nDone. Paste the symbol/tick field names and I will finish the mapping into InstrumentSpec.',
  );
}

main().catch((e) => {
  console.error('verify failed:', e);
  process.exit(1);
});
