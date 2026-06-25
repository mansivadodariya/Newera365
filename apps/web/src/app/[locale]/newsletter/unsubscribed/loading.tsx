// Centered skeleton — mirrors the unsubscribed confirmation page layout.
// Fluid/centered = responsive on both mobile and desktop.
export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center bg-background px-5 py-20">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-6 text-center">
        <div className="bg-foreground/10 h-[72px] w-[72px] animate-pulse rounded-full" />
        <div className="flex w-full flex-col items-center gap-3">
          <div className="bg-foreground/10 h-8 w-3/4 animate-pulse rounded-md" />
          <div className="bg-foreground/[0.07] h-4 w-full animate-pulse rounded" />
          <div className="bg-foreground/[0.07] h-4 w-2/3 animate-pulse rounded" />
        </div>
        <div className="bg-foreground/10 h-4 w-40 animate-pulse rounded" />
      </div>
    </main>
  );
}
