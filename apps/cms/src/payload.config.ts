import path from 'path';
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { BlogPosts } from './collections/BlogPosts';
import { MarketAnalysis } from './collections/MarketAnalysis';
import { News } from './collections/News';
import { ResearchReports } from './collections/ResearchReports';
import { EducationContent } from './collections/EducationContent';
import { Webinars } from './collections/Webinars';
import { ProductsInstruments } from './collections/ProductsInstruments';
import { AccountTypes } from './collections/AccountTypes';
import { FAQs } from './collections/FAQs';
import { NewsletterSubscribers } from './collections/NewsletterSubscribers';
import { Careers } from './collections/Careers';
import { LegalPages } from './collections/LegalPages';
import { Awards } from './collections/Awards';
import { CompanyMilestones } from './collections/CompanyMilestones';
import { TeamMembers } from './collections/TeamMembers';
import { WebinarRegistrations } from './collections/WebinarRegistrations';
import { Promotions } from './collections/Promotions';
import { PaymentMethods } from './collections/PaymentMethods';
import { IBContent } from './collections/IBContent';
import { ContactSubmissions } from './collections/ContactSubmissions';
import { MediaPress } from './collections/MediaPress';
import { AnalystCalls } from './collections/AnalystCalls';
import { SiteSettings } from './globals/SiteSettings';
import { emailTransport } from './email/transport';
import Logo from './graphics/Logo';
import Icon from './graphics/Icon';

// These checks run server-side only. payload.config.ts is also bundled by
// webpack for the browser admin UI — in that context process.env vars are
// undefined and NODE_ENV is 'production', so top-level throws would crash
// the admin panel before React mounts (blank white screen).
if (typeof window === 'undefined') {
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET === 'change-me-in-production') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PAYLOAD_SECRET must be set to a strong random secret in production');
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        '\n⚠️  PAYLOAD_SECRET is still the placeholder value "change-me-in-production".\n' +
          '   Generate a real secret: openssl rand -hex 32\n' +
          '   Leaving this in place means admin JWTs are signed with a public string.\n',
      );
    }
  }
  if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL must be set in production');
  }
  if (!process.env.SMTP_PASS && process.env.NODE_ENV === 'production') {
    throw new Error('SMTP_PASS (ZeptoMail Send Mail Token) must be set in production');
  }
  if (!process.env.EMAIL_FROM && process.env.NODE_ENV === 'production') {
    throw new Error('EMAIL_FROM must be set in production');
  }
  if (!process.env.CONSENT_IP_SALT && process.env.NODE_ENV === 'production') {
    throw new Error('CONSENT_IP_SALT must be set in production — generate: openssl rand -hex 16');
  }
}

// Canonical site URL — used to build email links and redirect host checks
// (see endpoints/index.ts). Must remain a single, valid URL.
const corsOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Browser origins allowed for CORS + CSRF. Payload's corsHeaders middleware only
// echoes back an `Access-Control-Allow-Origin` when the request's Origin EXACTLY
// matches a list entry, so every origin the site is actually served from must be
// listed here — the apex domain, www, the Vercel deployment alias
// (…-app.vercel.app), and any preview URLs. FRONTEND_URL is always included;
// CORS_ORIGINS adds extras as a comma-separated list. Values are trimmed so a
// stray space/newline from the hosting provider's env UI can't silently break
// the exact-match comparison.
//
// The canonical public origins are baked in as a safety net: a missing/reset
// FRONTEND_URL or CORS_ORIGINS on the CMS host silently breaks EVERY browser
// form (newsletter, contact, IB, webinars, ebook gate) — the POST preflight gets
// no Access-Control-Allow-Origin and is blocked — while server-side content GETs
// (which bypass CORS) keep rendering, so the site looks healthy. This gap has
// recurred; hardcoding the known production origins here means a redeploy always
// self-heals it regardless of the env, and survives an env typo like a trailing
// slash. Overriding env vars still add anything extra (preview URLs, new domains).
const PRODUCTION_ORIGINS = [
  'https://newera365-app.vercel.app', // current Vercel production alias
  'https://newera365.com', // custom domain (live post-DNS-cutover)
  'https://www.newera365.com',
];

const allowedOrigins = Array.from(
  new Set(
    [corsOrigin, ...PRODUCTION_ORIGINS, ...(process.env.CORS_ORIGINS ?? '').split(',')]
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
);

// Single from-address for Payload's built-in email pipeline (forgot-password).
// ZeptoMail has no sandbox sender, so the verified-domain address is used in every
// environment — mirrors FROM in email/transport.ts.
const fromAddress = process.env.EMAIL_FROM ?? 'no-reply@newera365.com';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  // Payload's default limiter (500 req / 15 min / IP) covers EVERY REST route,
  // including the public GETs the frontend depends on. A single `next build`
  // makes hundreds of CMS fetches from one IP, and ISR fetch failures render
  // silently empty — so the default cap can starve the site of its own content
  // (observed live: 429s mid-audit after two local builds). Keep the limiter as
  // an abuse backstop but give read traffic ample headroom; the public form
  // endpoints keep their own much stricter Postgres-backed per-route limits.
  rateLimit: {
    window: 15 * 60 * 1000,
    max: 10000,
  },
  localization: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    fallback: true,
  },
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    // Keep server-only modules (nodemailer + the ZeptoMail SMTP transport) out
    // of the admin browser bundle. Aliases swap them for a no-op stub at
    // build time so webpack does not try to resolve `stream`, `os`, `tls`,
    // etc. for the browser.
    webpack: (config) => {
      const transportPath = path.resolve(__dirname, 'email/transport');
      const transportMock = path.resolve(__dirname, 'email/transport.mock');
      // The mailer module and endpoints module are server-only (use Node net/tls, etc.).
      // Alias them to the no-op mock so webpack doesn't try to bundle them for the browser.
      const mailerPath = path.resolve(__dirname, 'email/mailer');
      const endpointsPath = path.resolve(__dirname, 'endpoints');
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config.resolve?.alias ?? {}),
            [transportPath]: transportMock,
            [mailerPath]: transportMock,
            [endpointsPath]: transportMock,
            // npm packages aliased to false → webpack emits empty modules,
            // preventing their Node-only internals from crashing the browser bundle.
            nodemailer: false,
          },
        },
      };
    },
    meta: {
      titleSuffix: '— NEWERA',
      // Match the public site's browser-tab icon instead of Payload's default.
      // Served by the Express static mount in server.ts (/public → apps/cms/public).
      favicon: '/public/favicon.png',
    },
    css: path.resolve(__dirname, 'admin.scss'),
    components: {
      graphics: {
        Logo,
        Icon,
      },
    },
  },
  editor: slateEditor({}),
  db: postgresAdapter({
    // Neon serverless has tight connection limits on starter/free tiers.
    // Cap the pool well below those limits; add timeouts so exhaustion surfaces
    // fast rather than hanging indefinitely.
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    },
    // Schema managed via migrations/seeds; push disabled to prevent Drizzle relation conflicts.
    push: false,
  }),
  collections: [
    Users,
    Media,
    BlogPosts,
    MarketAnalysis,
    News,
    ResearchReports,
    EducationContent,
    Webinars,
    ProductsInstruments,
    AccountTypes,
    FAQs,
    NewsletterSubscribers,
    Careers,
    LegalPages,
    Awards,
    CompanyMilestones,
    MediaPress,
    TeamMembers,
    WebinarRegistrations,
    Promotions,
    PaymentMethods,
    IBContent,
    ContactSubmissions,
    AnalystCalls,
  ],
  globals: [SiteSettings],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  email: {
    fromName: 'Newera',
    fromAddress,
    transport: emailTransport,
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  // R2 cloud storage (@payloadcms/plugin-cloud-storage) is added once the
  // Cloudflare account is provisioned — see NE-027.
  plugins: [],
});
