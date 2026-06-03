import { PageHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      <CardGridSkeleton cols={4} cards={8} />
    </main>
  );
}
