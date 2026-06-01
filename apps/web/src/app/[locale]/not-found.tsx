import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-5 text-center">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">404</p>
      <h1 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1] text-foreground">
        Page not found
      </h1>
      <p className="mb-8 max-w-[300px] font-body text-[14px] leading-[1.55] text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex h-[46px] items-center rounded-full bg-accent px-6 font-body text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Go to homepage
      </Link>
    </div>
  );
}
