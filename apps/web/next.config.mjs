import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@newera365/ui', '@newera365/types'],
  images: {
    // Enumerate actual CDN subdomains rather than wildcarding all of *.newera365.com.
    // A broad wildcard would allow any compromised/misconfigured subdomain to serve
    // images through Next.js's image optimisation pipeline.
    remotePatterns: [
      // Cloudflare R2 CDN (NE-027) — add more subdomains as they're provisioned.
      { protocol: 'https', hostname: 'media.newera365.com' },
      { protocol: 'https', hostname: 'cms.newera365.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Disallow embedding in iframes from other origins
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Limit referrer information sent to third-party sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not used by the app
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Enforce HTTPS for 2 years, include subdomains (enable preload before adding
          // to the HSTS preload list — https://hstspreload.org)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          // CSP: allow self + TradingView charts + Resend/email tracking pixels.
          // 'unsafe-inline' for styles is required by Framer Motion and Tailwind.
          // Tighten further once a nonce strategy is implemented (post-launch).
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' https://s3.tradingview.com https://www.tradingview.com",
              "frame-src https://www.tradingview.com https://s.tradingview.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://media.newera365.com https://cms.newera365.com",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
