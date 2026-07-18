import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';
// Only an actual production build (`next build` / Vercel set NODE_ENV=production)
// must enforce the guard below. `next lint` and `tsc` also load this config but
// leave NODE_ENV unset — they bake no bundle, so they must not trip the guard.
// (Using `!isDev` before tripped CI's lint step, which has no CMS URL set.)
const isProd = process.env.NODE_ENV === 'production';

// Fail the production build loudly if the CMS URL is unset rather than silently
// baking in http://localhost:3001 — under upgrade-insecure-requests that localhost
// connect-src blocks every client fetch, and the same fallback points public forms
// at the visitor's own machine (NE code-review WR-12).
const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL?.trim();
if (isProd && !cmsUrl) {
  throw new Error('NEXT_PUBLIC_CMS_URL must be set for production builds (NE code-review WR-12).');
}

// The CMS serves uploaded media from its own origin (Payload bakes serverURL into
// each media `url`). Derive that host from NEXT_PUBLIC_CMS_URL so its images pass
// CSP img-src and next/image wherever the CMS currently lives — today the Railway
// URL, automatically cms.newera365.com once that domain is pointed at the CMS — with
// no further code change. The explicit media./cms.newera365.com entries below remain
// for the R2 + custom-domain end state.
const cmsHost = cmsUrl ? new URL(cmsUrl).hostname : null;
// Protocol/port from the same URL — hardcoding https broke local prod smoke tests
// (`next start` against http://localhost:3001 got 400s from /_next/image). Real
// deployments set an https CMS URL, so the allowed pattern is unchanged there.
const cmsProtocol = cmsUrl ? new URL(cmsUrl).protocol.replace(':', '') : null;
const cmsPort = cmsUrl ? new URL(cmsUrl).port : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@newera365/ui', '@newera365/types'],
  // /platform/mobile was a duplicate of /platform/mt5 (same PlatformPage) and has
  // been removed. Redirect it to the canonical page: this also guarantees the old
  // path never serves a stale prerendered copy (Vercel does not purge the CDN entry
  // for a path that simply dropped out of generateStaticParams). localePrefix is
  // 'always', so only the /en and /ar prefixed forms exist.
  async redirects() {
    return [
      {
        source: '/:locale(en|ar)/platform/mobile',
        destination: '/:locale/platform/mt5',
        permanent: true,
      },
      // /tools/ai-crm was a page-level permanentRedirect; the route file was
      // removed, so keep the path resolving (and CDN-purgeable) via config.
      {
        source: '/:locale(en|ar)/tools/ai-crm',
        destination: '/:locale/ai-crm',
        permanent: true,
      },
      // /markets/instruments was the standalone full-spec table; its route was removed
      // and instrument specs now live within /markets/[category]. Without this redirect
      // the path falls through to the [category] segment and soft-404s (HTTP 200 + "Page
      // not found" UI), which is bad for SEO — send it to the canonical markets entry.
      {
        source: '/:locale(en|ar)/markets/instruments',
        destination: '/:locale/markets/forex',
        permanent: true,
      },
      // The old /blog listing now resolves to the merged /research desk. /blog/:slug
      // still points at the live article detail under /education/blog/:slug, so shared
      // links and search-indexed URLs keep resolving instead of 404ing.
      {
        source: '/:locale(en|ar)/blog',
        destination: '/:locale/research',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/blog/:slug',
        destination: '/:locale/education/blog/:slug',
        permanent: true,
      },
      // IA consolidation (5-tab nav): calculators merged into /tools; webinars and audio
      // into /education/media; awards and media-press into /company/recognition; faqs and
      // contact into /support; daily-news and blog listings into the /research desk.
      { source: '/:locale(en|ar)/tools/pivot', destination: '/:locale/tools', permanent: true },
      { source: '/:locale(en|ar)/tools/profit', destination: '/:locale/tools', permanent: true },
      {
        source: '/:locale(en|ar)/tools/fibonacci',
        destination: '/:locale/tools',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/education/audio',
        destination: '/:locale/education/media',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/education/webinars',
        destination: '/:locale/education/media',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/company/awards',
        destination: '/:locale/company/recognition',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/company/media-press',
        destination: '/:locale/company/recognition',
        permanent: true,
      },
      { source: '/:locale(en|ar)/faqs', destination: '/:locale/support', permanent: true },
      { source: '/:locale(en|ar)/contact', destination: '/:locale/support', permanent: true },
      { source: '/:locale(en|ar)/daily-news', destination: '/:locale/research', permanent: true },
      {
        source: '/:locale(en|ar)/education/blog',
        destination: '/:locale/research',
        permanent: true,
      },
      // Landing redesign was promoted to the live homepage; the demo route is gone.
      {
        source: '/:locale(en|ar)/landing-demo',
        destination: '/:locale',
        permanent: true,
      },
      // Careers + Recognition temporarily hidden (client request, 2026-07-09).
      // permanent:false so they can be re-enabled later without cached 308s.
      {
        source: '/:locale(en|ar)/company/careers',
        destination: '/:locale/company/about',
        permanent: false,
      },
      {
        source: '/:locale(en|ar)/company/recognition',
        destination: '/:locale/company/about',
        permanent: false,
      },
    ];
  },
  images: {
    // Enumerate actual CDN subdomains rather than wildcarding all of *.newera365.com.
    // A broad wildcard would allow any compromised/misconfigured subdomain to serve
    // images through Next.js's image optimisation pipeline.
    remotePatterns: [
      // Cloudflare R2 CDN (NE-027) — add more subdomains as they're provisioned.
      { protocol: 'https', hostname: 'media.newera365.com' },
      { protocol: 'https', hostname: 'cms.newera365.com' },
      // Current CMS upload host from NEXT_PUBLIC_CMS_URL (the Railway URL until the
      // custom domain is live). Skipped in dev — localhost is handled below.
      ...(cmsHost && !isDev
        ? [{ protocol: cmsProtocol, hostname: cmsHost, ...(cmsPort ? { port: cmsPort } : {}) }]
        : []),
      // Local Payload CMS uploads in development (served from port 3001).
      ...(isDev ? [{ protocol: 'http', hostname: 'localhost', port: '3001' }] : []),
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
              // 'unsafe-inline' is required in both dev and prod: Next.js App Router embeds
              // RSC payload and hydration bootstrapping as inline scripts — blocking them
              // prevents React from hydrating and makes all interactive elements non-functional.
              // 'unsafe-eval' is dev-only (webpack HMR). Tighten to a nonce strategy post-launch (NE-028).
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://s3.tradingview.com https://s.tradingview.com https://www.tradingview.com https://www.googletagmanager.com https://connect.facebook.net`,
              // TradingView embed widgets render their chart inside an iframe served from
              // www.tradingview-widget.com (NOT tradingview.com) — it must be in frame-src or
              // every chart silently fails to mount. See TradingViewWidget.tsx.
              'frame-src https://www.tradingview.com https://s.tradingview.com https://www.tradingview-widget.com',
              // frame-ancestors: more authoritative than X-Frame-Options in modern browsers.
              // Restricts who can embed Newera365 pages in an iframe.
              "frame-ancestors 'self'",
              "style-src 'self' 'unsafe-inline'",
              // next/font self-hosts Google Fonts at build time — no external font CDN needed.
              "font-src 'self' data:",
              `img-src 'self' data: blob: https://media.newera365.com https://cms.newera365.com${cmsUrl ? ` ${cmsUrl}` : ''} https://www.facebook.com https://www.google-analytics.com${isDev ? ' http://localhost:3001' : ''}`,
              // worker-src: TradingView charts use Web Workers for rendering.
              "worker-src 'self' blob:",
              // Analytics domains: GA4 and Meta Pixel fire only after cookie consent (Analytics.tsx),
              // but CSP must whitelist their domains or the browser blocks the requests entirely.
              // MT5 service URL is included so live instrument data can be fetched from the browser.
              `connect-src 'self' ${cmsUrl || 'http://localhost:3001'}${process.env.NEXT_PUBLIC_MT5_SERVICE_URL ? ` ${process.env.NEXT_PUBLIC_MT5_SERVICE_URL.trim()}` : ''} https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://s3.tradingview.com`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // Upgrade insecure requests in production (HTTP → HTTPS).
              ...(isDev ? [] : ["upgrade-insecure-requests"]),
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
