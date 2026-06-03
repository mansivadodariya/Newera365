import { PageHeaderSkeleton, AccordionSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="space-y-8 py-16">
      <PageHeaderSkeleton />
      {/* Category pills */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap gap-2 px-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-[#f0f0ee] dark:bg-[#1a1c22]"
          />
        ))}
      </div>
      <AccordionSkeleton items={8} />
    </main>
  );
}
