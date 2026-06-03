import { PageHeaderSkeleton, ArticleListSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 space-y-8">
      <PageHeaderSkeleton />
      <ArticleListSkeleton articles={6} />
    </main>
  );
}
