import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} />
    </main>
  );
}
