import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 space-y-8">
      <PageHeaderSkeleton />
      {/* Asset class tabs */}
      <div className="px-5 max-w-[1200px] mx-auto flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <TableSkeleton rows={10} />
    </main>
  );
}
