function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#f0f0ee] dark:bg-[#1a1c22] ${className}`}
      style={style}
    />
  );
}

function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`space-y-3 rounded-2xl border border-[#e8e8e6] p-5 dark:border-[#1a1c22] ${className}`}
    >
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <SkeletonText lines={2} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };

// ─── Page-level skeletons ───────────────────────────────────────────────────

export function PageHeaderSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-3 px-5 pb-6 pt-10">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function CardGridSkeleton({ cols = 3, cards = 6 }: { cols?: number; cards?: number }) {
  return (
    <div
      className="mx-auto max-w-[1200px] px-5"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: '1.5rem',
      }}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-2 px-5">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function AccordionSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="mx-auto max-w-[800px] space-y-2 px-5">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ArticleListSkeleton({ articles = 5 }: { articles?: number }) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-4 px-5">
      {Array.from({ length: articles }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 border-b border-[#e8e8e6] py-4 dark:border-[#1a1c22]"
        >
          <Skeleton className="h-20 w-24 flex-shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
