'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Something went wrong</h2>
      <p className="mb-8 max-w-md text-muted">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="rounded-pill bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}
