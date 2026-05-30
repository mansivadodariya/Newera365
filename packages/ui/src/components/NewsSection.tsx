'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export interface NewsSectionItem {
  id: number;
  headline: string;
  slug: string;
  category: string;
  publishedDate: string;
  source?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  forex: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  commodities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  indices: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  crypto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  company: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  regulation: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

interface NewsSectionProps {
  news: NewsSectionItem[];
}

export function NewsSection({ news }: NewsSectionProps) {
  const locale = useLocale();
  const t = useTranslations('home');

  if (!news.length) return null;

  return (
    <section className="bg-surface px-5 pb-10 pt-10">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <SectionKicker className="mb-2">NEWS</SectionKicker>
            <h2 className="text-foreground font-sans text-[26px] font-semibold leading-[1.1] md:text-[32px]">
              {t('newsTitle')}
            </h2>
          </div>
          <Link
            href={`/${locale}/news`}
            className="font-body text-muted hover:text-foreground flex flex-shrink-0 items-center gap-1 text-[12px] font-medium transition-colors"
          >
            {t('newsViewAll')}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="flex flex-col gap-[10px] md:grid md:grid-cols-2 lg:grid-cols-4">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/news/${item.slug}`}
              className="dark:bg-surface-elevated group flex flex-col gap-3 rounded-[18px] bg-white p-4 transition-shadow hover:shadow-md dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-body rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {item.category}
                </span>
                <span className="font-body text-muted text-[11px]">
                  {formatDate(item.publishedDate)}
                </span>
              </div>

              <p className="text-foreground group-hover:text-accent line-clamp-3 font-sans text-[15px] font-semibold leading-[1.35] transition-colors">
                {item.headline}
              </p>

              <div className="font-body text-accent mt-auto flex items-center gap-1 text-[12px] font-medium">
                {t('newsReadMore')}
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
