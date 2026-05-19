import path from 'path';
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { BlogPosts } from './collections/BlogPosts';
import { MarketAnalysis } from './collections/MarketAnalysis';
import { ResearchReports } from './collections/ResearchReports';
import { EducationContent } from './collections/EducationContent';
import { Webinars } from './collections/Webinars';
import { ProductsInstruments } from './collections/ProductsInstruments';
import { AccountTypes } from './collections/AccountTypes';
import { News } from './collections/News';
import { FAQs } from './collections/FAQs';
import { NewsletterSubscribers } from './collections/NewsletterSubscribers';
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
  // EN default (LTR) + AR (RTL). RTL layout flip is handled in the frontend.
  localization: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Users,
    Media,
    BlogPosts,
    MarketAnalysis,
    ResearchReports,
    EducationContent,
    Webinars,
    ProductsInstruments,
    AccountTypes,
    News,
    FAQs,
    NewsletterSubscribers,
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
