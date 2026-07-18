'use client';

import type { RefObject } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  listRef?: RefObject<HTMLElement>;
}

// Sticky site header height (~72px) plus a little breathing room, so the first
// row of the new page lands just below the header instead of behind it.
// ponytail: constant header offset; read the header height live only if it ever
// stops being a fixed 72px.
const HEADER_OFFSET = 88;

export function Pagination({ page, totalPages, onPageChange, listRef }: PaginationProps) {
  function handleChange(newPage: number) {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
    const el = listRef?.current;
    if (!el) return;
    // Scroll AFTER the new page has painted (rAF), to the list's real top — not
    // the stale pre-render position. Landing on the first item of the new page.
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
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
        className="font-body text-muted hover:border-accent/40 hover:text-foreground dark:hover:border-accent/40 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[13px] transition-colors disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:text-white/40 dark:hover:text-white/70"
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
            className="font-body text-muted flex h-9 w-9 items-center justify-center text-[13px] dark:text-white/30"
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
                ? 'bg-accent text-white'
                : 'text-muted hover:border-accent/40 hover:text-foreground dark:hover:border-accent/40 border border-[#e5e7eb] dark:border-white/10 dark:text-white/40 dark:hover:text-white/70'
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
        className="font-body text-muted hover:border-accent/40 hover:text-foreground dark:hover:border-accent/40 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[13px] transition-colors disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:text-white/40 dark:hover:text-white/70"
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
