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

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
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
  cors: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
  csrf: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  // R2 cloud storage (@payloadcms/plugin-cloud-storage) is added once the
  // Cloudflare account is provisioned — see NE-027.
  plugins: [],
});
