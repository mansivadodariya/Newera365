import { PageHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 space-y-8">
      <PageHeaderSkeleton />
      <CardGridSkeleton cols={3} cards={3} />
    </main>
  );
}
