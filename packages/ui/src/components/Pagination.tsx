'use client';

import type { RefObject } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  listRef?: RefObject<HTMLElement>;
}

export function Pagination({ page, totalPages, onPageChange, listRef }: PaginationProps) {
  function handleChange(newPage: number) {
    listRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onPageChange(newPage);
  }
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      {/* Prev */}
      <button
        onClick={() => handleChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[13px] text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111] disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:text-white/40 dark:hover:border-white/20 dark:hover:text-white/70"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="rtl:-scale-x-100">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="font-body flex h-9 w-9 items-center justify-center text-[13px] text-[#9ca3af] dark:text-white/30"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => handleChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`font-body flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
              p === page
                ? 'bg-[#111] text-white dark:bg-white dark:text-[#111]'
                : 'border border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db] hover:text-[#111] dark:border-white/10 dark:text-white/40 dark:hover:border-white/20 dark:hover:text-white/70'
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => handleChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[13px] text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111] disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:text-white/40 dark:hover:border-white/20 dark:hover:text-white/70"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="rtl:-scale-x-100">
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
