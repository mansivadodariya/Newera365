import { PageHeaderSkeleton, CardGridSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-16 py-16">
      <PageHeaderSkeleton />
      {/* Team grid */}
      <div className="mx-auto max-w-[1200px] space-y-4 px-5">
        <Skeleton className="h-6 w-32" />
        <CardGridSkeleton cols={4} cards={4} />
      </div>
      {/* Awards row */}
      <div className="mx-auto max-w-[1200px] space-y-4 px-5">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-40 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
