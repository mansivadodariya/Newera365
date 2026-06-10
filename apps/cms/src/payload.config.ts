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
import { CompanyContent } from './collections/CompanyContent';
import { TeamMembers } from './collections/TeamMembers';
import { WebinarRegistrations } from './collections/WebinarRegistrations';
import { Promotions } from './collections/Promotions';
import { PaymentMethods } from './collections/PaymentMethods';
import { IBContent } from './collections/IBContent';
import { ContactSubmissions } from './collections/ContactSubmissions';
import { MediaPress } from './collections/MediaPress';
import { SiteSettings } from './globals/SiteSettings';
import { emailTransport } from './email/transport';
import Logo from './graphics/Logo';
import Icon from './graphics/Icon';
import TwoFactorLoginField from './components/TwoFactorLoginField';

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
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
    throw new Error('RESEND_API_KEY must be set in production');
  }
  if (!process.env.EMAIL_FROM && process.env.NODE_ENV === 'production') {
    throw new Error('EMAIL_FROM must be set in production');
  }
  if (!process.env.CONSENT_IP_SALT && process.env.NODE_ENV === 'production') {
    throw new Error('CONSENT_IP_SALT must be set in production — generate: openssl rand -hex 16');
  }
}

const corsOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Mirrors the same logic in email/transport.ts and email/resend.ts:
// use Resend's sandbox sender in dev/staging (no domain verification needed),
// and the verified domain address only in production.
const IS_PROD = process.env.NODE_ENV === 'production';
const fromAddress = IS_PROD
  ? (process.env.EMAIL_FROM ?? 'no-reply@newera365.com')
  : 'onboarding@resend.dev';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  localization: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    fallback: true,
  },
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
      // The TOTP module imports otplib + qrcode (Node crypto) — swap it for the
      // browser-safe mock so the Users collection config still resolves in the bundle.
      const totpPath = path.resolve(__dirname, 'auth/totp');
      const totpMock = path.resolve(__dirname, 'auth/totp.mock');
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config.resolve?.alias ?? {}),
            [transportPath]: transportMock,
            [resendEmailPath]: transportMock,
            [endpointsPath]: transportMock,
            [totpPath]: totpMock,
            // npm packages aliased to false → webpack emits empty modules,
            // preventing their Node-only internals from crashing the browser bundle.
            nodemailer: false,
            resend: false,
            otplib: false,
            qrcode: false,
          },
        },
      };
    },
    meta: {
      titleSuffix: '— NEWERA',
    },
    css: path.resolve(__dirname, 'admin.scss'),
    components: {
      graphics: {
        Logo,
        Icon,
      },
      // Renders a 2FA code input on the login screen and injects `otp` into the
      // login request. Enforcement is server-side in the Users beforeLogin hook.
      beforeLogin: [TwoFactorLoginField],
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
    // Schema managed via migrations; push disabled to prevent interactive Drizzle prompts.
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
    MediaPress,
    CompanyContent,
    TeamMembers,
    WebinarRegistrations,
    Promotions,
    PaymentMethods,
    IBContent,
    ContactSubmissions,
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
