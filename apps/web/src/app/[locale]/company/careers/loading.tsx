import { PageHeaderSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      {/* Department filters */}
      <div className="mx-auto flex max-w-[1200px] gap-2 px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      {/* Job list */}
      <div className="mx-auto max-w-[1200px] space-y-3 px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
