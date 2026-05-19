import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@newera365/ui', '@newera365/types'],
  images: {
    // media.newera365.com — Cloudflare R2 CDN subdomain (NE-027)
    remotePatterns: [{ protocol: 'https', hostname: '**.newera365.com' }],
  },
};

export default withNextIntl(nextConfig);
