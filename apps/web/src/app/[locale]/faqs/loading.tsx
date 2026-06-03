import { PageHeaderSkeleton, AccordionSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-16 space-y-8">
      <PageHeaderSkeleton />
      {/* Category pills */}
      <div className="px-5 max-w-[1200px] mx-auto flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-[#f0f0ee] dark:bg-[#1a1c22]" />
        ))}
      </div>
      <AccordionSkeleton items={8} />
    </main>
  );
}
