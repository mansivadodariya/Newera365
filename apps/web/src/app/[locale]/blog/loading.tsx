import { PageHeaderSkeleton, ArticleListSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      <ArticleListSkeleton articles={6} />
    </main>
  );
}
