import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 space-y-8">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} />
    </main>
  );
}
