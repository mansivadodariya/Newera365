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
import { CompanyContent } from './collections/CompanyContent';
import { TeamMembers } from './collections/TeamMembers';
import { SiteSettings } from './globals/SiteSettings';
import { emailTransport } from './email/transport';

// Catch the placeholder value that ships in .env.example. If this reaches
// production it allows trivial JWT forgery — hard-fail on both envs.
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
const corsOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('RESEND_API_KEY must be set in production');
}
if (!process.env.EMAIL_FROM && process.env.NODE_ENV === 'production') {
  throw new Error('EMAIL_FROM must be set in production');
}

// Mirrors the same logic in email/transport.ts and email/resend.ts:
// use Resend's sandbox sender in dev/staging (no domain verification needed),
// and the verified domain address only in production.
const IS_PROD = process.env.NODE_ENV === 'production';
const fromAddress = IS_PROD
  ? (process.env.EMAIL_FROM ?? 'no-reply@newera365.com')
  : 'onboarding@resend.dev';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    // Keep server-only modules (nodemailer + the Resend SMTP transport) out
    // of the admin browser bundle. Aliases swap them for a no-op stub at
    // build time so webpack does not try to resolve `stream`, `os`, `tls`,
    // etc. for the browser.
    webpack: (config) => {
      const transportPath = path.resolve(__dirname, 'email/transport');
      const transportMock = path.resolve(__dirname, 'email/transport.mock');
      // The Resend SDK and endpoints module are server-only (use Node crypto, net, etc.).
      // Alias them to the no-op mock so webpack doesn't try to bundle them for the browser.
      const resendEmailPath = path.resolve(__dirname, 'email/resend');
      const endpointsPath = path.resolve(__dirname, 'endpoints');
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config.resolve?.alias ?? {}),
            [transportPath]: transportMock,
            [resendEmailPath]: transportMock,
            [endpointsPath]: transportMock,
            nodemailer: transportMock,
            resend: transportMock,
          },
        },
      };
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
  }),
  // Locale is an explicit per-document field — see collections/_fields.ts
  // (localizationFields) and hooks/ (ensureTranslationKey, uniqueSlugPerLocale).
  // Payload's native `localization` config is intentionally NOT used.
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
    CompanyContent,
    TeamMembers,
  ],
  globals: [SiteSettings],
  cors: [corsOrigin],
  csrf: [corsOrigin],
  email: {
    fromName: 'NewEra365',
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
