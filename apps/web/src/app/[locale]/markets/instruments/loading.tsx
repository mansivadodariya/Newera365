import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      {/* Asset class tabs */}
      <div className="mx-auto flex max-w-[1200px] gap-2 px-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <TableSkeleton rows={10} />
    </main>
  );
}
