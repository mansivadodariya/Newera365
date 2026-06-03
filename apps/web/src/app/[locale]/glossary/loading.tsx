import { PageHeaderSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      {/* Search bar */}
      <div className="mx-auto max-w-[800px] px-5">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* A-Z letters */}
      <div className="mx-auto flex max-w-[800px] flex-wrap gap-2 px-5">
        {Array.from({ length: 26 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
      {/* Term rows */}
      <div className="mx-auto max-w-[800px] space-y-3 px-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-[#e8e8e6] py-3 dark:border-[#1a1c22]">
            <Skeleton className="h-4 w-28 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </main>
  );
}
