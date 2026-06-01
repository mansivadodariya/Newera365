'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-5 text-center">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">Error</p>
      <h1 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1] text-foreground">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-[300px] font-body text-[14px] leading-[1.55] text-muted">
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex h-[46px] items-center rounded-full border border-border px-6 font-body text-[14px] font-medium text-foreground transition-colors hover:border-foreground"
        >
          Try again
        </button>
        <Link
          href="/"
          className="flex h-[46px] items-center rounded-full bg-accent px-6 font-body text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
