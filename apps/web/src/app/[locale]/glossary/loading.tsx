import { PageHeaderSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 space-y-8">
      <PageHeaderSkeleton />
      {/* Search bar */}
      <div className="px-5 max-w-[800px] mx-auto">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* A-Z letters */}
      <div className="px-5 max-w-[800px] mx-auto flex gap-2 flex-wrap">
        {Array.from({ length: 26 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
      {/* Term rows */}
      <div className="px-5 max-w-[800px] mx-auto space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-[#e8e8e6] dark:border-[#1a1c22]">
            <Skeleton className="h-4 w-28 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </main>
  );
}
