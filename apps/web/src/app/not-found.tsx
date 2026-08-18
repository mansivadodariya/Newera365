import './globals.css';

// Root not-found. Next.js renders this for any unmatched URL and returns a
// proper HTTP 404 (unlike a catch-all page calling notFound(), which renders a
// soft-404 with a 200 status). It sits OUTSIDE [locale], so it has no locale
// context and must render its own <html>/<body>. Kept self-contained and
// English-only — it is the last-resort boundary for genuinely unknown URLs.
export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">404</p>
          <h1 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1]">Page not found</h1>
          <p className="mb-8 max-w-[300px] font-body text-[14px] leading-[1.55] text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a
            href="/en"
            className="flex h-[46px] items-center rounded-full bg-accent px-6 font-body text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Go to homepage
          </a>
        </main>
      </body>
    </html>
  );
}
