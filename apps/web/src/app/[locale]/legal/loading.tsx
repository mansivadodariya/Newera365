import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 px-5 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-[220px_1fr] gap-10">
        {/* Sidebar doc list */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        {/* Document body */}
        <div className="space-y-5">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-40" />
          <SkeletonText lines={12} />
        </div>
      </div>
    </main>
  );
}
