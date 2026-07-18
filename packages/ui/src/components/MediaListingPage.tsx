'use client';

import { useState, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { Pagination } from './Pagination';
import { humanize, distinctCategories, sameCategory } from './filterUtils';
import { WebinarsSection, type WebinarItem } from './WebinarsSection';

const MEDIA_PER_PAGE = 9;

// Fallback type tabs when no categories in CMS
type TypeTab = 'ALL' | 'VIDEO' | 'AUDIO';
const TYPE_TABS: TypeTab[] = ['ALL', 'VIDEO', 'AUDIO'];

export interface CmsVideoItem {
  id: number;
  slug: string;
  title: string;
  contentType: 'video' | 'audio';
  thumbnailUrl?: string | null;
  videoEmbed?: string | null;
  description?: string | null;
  mediaCategory?: string | null;
  isFeatured?: boolean | null;
}

interface EpisodeItem {
  id: string;
  /** Type-based tab (VIDEO/AUDIO) used as fallback when no categories */
  typeTab: TypeTab;
  /** Category-based tab (MACRO/STRATEGY/etc.) from CMS */
  categoryTab: string;
  tagDisplay: string;
  duration: string;
  title: string;
  desc: string;
  type: 'VIDEO' | 'AUDIO';
  featured: boolean;
  thumbnailUrl?: string | null;
  href?: string | null;
}

function videoItemToEpisode(v: CmsVideoItem): EpisodeItem {
  const type: 'VIDEO' | 'AUDIO' = v.contentType === 'audio' ? 'AUDIO' : 'VIDEO';
  const cat = v.mediaCategory ? v.mediaCategory.toUpperCase() : type;
  return {
    id: v.slug,
    typeTab: type,
    categoryTab: cat,
    tagDisplay: cat,
    duration: '',
    title: v.title,
    desc: v.description ?? '',
    type,
    featured: v.isFeatured === true,
    thumbnailUrl: v.thumbnailUrl,
    href: v.videoEmbed ?? null,
  };
}

const TAG_COLORS: Record<string, string> = {
  VIDEO: 'bg-accent/10 text-accent',
  AUDIO: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  MACRO: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  STRATEGY: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  EDUCATION: 'bg-accent/10 text-accent',
  INTERVIEWS: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  LIVE: 'bg-[#EF4444]/15 text-[#EF4444]',
};

interface MediaListingPageProps {
  cmsVideos?: CmsVideoItem[];
  webinars?: WebinarItem[];
}

export function MediaListingPage({ cmsVideos, webinars }: MediaListingPageProps) {
  const locale = useLocale();
  const t = useTranslations('media');

  const CAT_I18N_KEYS: Record<string, string> = {
    MACRO: 'catMacro',
    STRATEGY: 'catStrategy',
    EDUCATION: 'catEducation',
    INTERVIEWS: 'catInterviews',
    LIVE: 'catLive',
  };
  function translateMediaCat(cat: string) {
    if (cat === 'ALL') return t('filterAll');
    if (cat === 'WEBINARS') return t('tabWebinars');
    const key = CAT_I18N_KEYS[(cat ?? '').toUpperCase()];
    return key ? t(key as Parameters<typeof t>[0]) : humanize(cat);
  }

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const episodes = useMemo<EpisodeItem[]>(() => {
    if (cmsVideos?.length) return cmsVideos.map(videoItemToEpisode);
    return [];
  }, [cmsVideos]);

  // Decide whether to show category tabs (Macro/Strategy/etc.) or type tabs (Video/Audio)
  // Use category tabs when at least one episode has a real category set
  const hasCategoryData = episodes.some(
    (ep) => ep.categoryTab !== 'VIDEO' && ep.categoryTab !== 'AUDIO',
  );

  // Build tab list dynamically — only show categories that exist in the data
  const tabs: string[] = useMemo(() => {
    const base: string[] = !hasCategoryData
      ? [...TYPE_TABS]
      : // Data-driven: show every category present (incl. new creatable ones).
        ['ALL', ...distinctCategories(episodes, (ep) => ep.categoryTab)];
    if (webinars?.length) base.push('WEBINARS');
    return base;
  }, [episodes, hasCategoryData, webinars]);

  const isWebinars = activeTab === 'WEBINARS';

  // Honor the CMS isFeatured flag; fall back to the first item so the featured slot is never empty.
  const featured = episodes.find((e) => e.featured) ?? episodes[0];
  const rest = episodes.filter((e) => e !== featured);

  const filtered = rest.filter((ep) => {
    const matchTab =
      activeTab === 'ALL' ||
      (hasCategoryData
        ? sameCategory(ep.categoryTab, activeTab)
        : sameCategory(ep.typeTab, activeTab));
    const matchSearch =
      !search ||
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.desc.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / MEDIA_PER_PAGE);
  const pagedFiltered = filtered.slice((page - 1) * MEDIA_PER_PAGE, page * MEDIA_PER_PAGE);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }
  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground text-display mb-4 font-sans">
            {t('heroLine1')} {t('heroLine2')}
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted mb-6 max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroDesc')}
          </p>

          {/* Search */}
          {!isWebinars && (
            <div className="relative">
              <svg
                className="text-muted pointer-events-none absolute start-4 top-1/2 -translate-y-1/2"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M11 11l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border-border font-body text-foreground placeholder-muted bg-surface w-full rounded-xl py-3 pe-4 ps-10 text-[14px] font-medium outline-none"
              />
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="px-5 pb-4">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'text-muted hover:bg-accent/[0.10] dark:hover:bg-accent/[0.15] bg-[#F2F2F4] dark:bg-[#1a1c22] dark:text-white/50'
                }`}
              >
                {translateMediaCat(tab)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured episode */}
      {!isWebinars &&
        featured &&
        (activeTab === 'ALL' ||
          (hasCategoryData
            ? activeTab === featured.categoryTab
            : activeTab === featured.typeTab)) &&
        !search && (
          <section className="px-5 pb-6">
            <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
              <div
                className="group overflow-hidden rounded-[22px] bg-[#0d0d0d] xl:flex xl:flex-row"
                onClick={() =>
                  featured.href && window.open(featured.href, '_blank', 'noopener,noreferrer')
                }
                style={{ cursor: featured.href ? 'pointer' : 'default' }}
              >
                {/* Thumbnail — real cover when the CMS has one; otherwise the
                    house art plate (green light column) instead of a flat
                    gradient, so the fallback still reads designed. */}
                <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d2b1a] via-[#0a1f12] to-[#111111] xl:h-auto xl:w-[55%] xl:flex-shrink-0 xl:rounded-none">
                  {featured.thumbnailUrl ? (
                    <img
                      src={featured.thumbnailUrl}
                      alt={featured.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 motion-safe:group-hover:scale-[1.05]"
                      onError={(e) => {
                        // Broken CMS media → swap to the house art plate.
                        e.currentTarget.src = '/images/edge-flow.jpg';
                        e.currentTarget.style.objectPosition = '50% 26%';
                        e.currentTarget.classList.remove('opacity-70');
                      }}
                    />
                  ) : (
                    <img
                      src="/images/edge-flow.jpg"
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.05]"
                      style={{ objectPosition: '50% 26%' }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* NEW EPISODE badge */}
                  <div className="bg-accent absolute start-3 top-3 rounded-full px-2.5 py-[3px]">
                    <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                      {t('newEpisodeBadge')}
                    </span>
                  </div>
                  {/* Duration */}
                  <div className="absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
                    <span className="font-body text-[10px] text-white/80">{featured.duration}</span>
                  </div>
                  {/* Play button */}
                  <div className="bg-accent absolute bottom-4 start-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg xl:h-14 xl:w-14">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="xl:scale-125"
                    >
                      <path d="M4 3l10 5-10 5V3z" fill="white" />
                    </svg>
                  </div>
                </div>
                {/* Meta */}
                <div className="p-5 xl:flex xl:flex-1 xl:flex-col xl:justify-center xl:p-8">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${TAG_COLORS[featured.tagDisplay]}`}
                    >
                      {translateMediaCat(featured.tagDisplay)}
                    </span>
                    <span className="font-body text-[11px] text-white/40">{featured.type}</span>
                    <span className="font-body text-[11px] text-white/30">
                      {t('releasedToday')}
                    </span>
                  </div>
                  <p className="mb-2 font-sans text-[17px] font-semibold leading-[1.3] text-white xl:text-[26px]">
                    {featured.title}
                  </p>
                  <p className="font-body text-[12px] leading-[1.55] text-white/60 xl:text-[14px]">
                    {featured.desc}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      {/* Episode grid */}
      {!isWebinars && (
        <section className="px-5 pb-10">
          <div
            ref={listRef}
            className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]"
          >
            <SectionKicker className="mx-auto mb-5 mt-2">{t('latestEpisodes')}</SectionKicker>
            {filtered.length === 0 ? (
              <p className="font-body text-muted py-8 text-center text-[14px]">{t('noResults')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3">
                {pagedFiltered.map((ep, epIndex) => (
                  <div
                    key={ep.id}
                    className="dark:hover:border-accent/20 flex cursor-pointer flex-col gap-3 overflow-hidden rounded-[18px] bg-[#F0F4F1] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,176,80,0.08)] dark:bg-[#1a1c22] dark:shadow-none"
                    onClick={() => ep.href && window.open(ep.href, '_blank', 'noopener,noreferrer')}
                    style={{ cursor: ep.href ? 'pointer' : 'default' }}
                  >
                    {/* Thumbnail — CMS cover, else the silk art plate. Each
                      fallback crops a different slice (by grid position) so
                      neighbouring cards don't repeat. */}
                    <div className="relative flex h-[120px] items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1f12] to-[#111111]">
                      {ep.thumbnailUrl ? (
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          className="absolute inset-0 h-full w-full object-cover opacity-80"
                          onError={(e) => {
                            // Broken CMS media → swap to the house art plate.
                            e.currentTarget.src = '/images/edge-flow.jpg';
                            e.currentTarget.style.objectPosition = `${35 + (epIndex % 3) * 15}% ${24 + (epIndex % 2) * 14}%`;
                            e.currentTarget.classList.remove('opacity-80');
                          }}
                        />
                      ) : (
                        <img
                          src="/images/edge-flow.jpg"
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            objectPosition: `${35 + (epIndex % 3) * 15}% ${24 + (epIndex % 2) * 14}%`,
                          }}
                        />
                      )}
                      <div className="bg-accent/90 relative z-10 flex h-8 w-8 items-center justify-center rounded-full">
                        {ep.type === 'VIDEO' ? (
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M4 3l10 5-10 5V3z" fill="white" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="6" r="3" stroke="white" strokeWidth="1.5" />
                            <path
                              d="M4 14c0-2.2 1.8-4 4-4s4 1.8 4 4"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-[2px]">
                        <span className="font-body text-[9px] text-white">{ep.duration}</span>
                      </div>
                    </div>
                    {/* Content */}
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span
                          className={`font-body rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.08em] ${TAG_COLORS[ep.tagDisplay]}`}
                        >
                          {translateMediaCat(ep.tagDisplay)}
                        </span>
                      </div>
                      <p className="text-foreground font-sans text-[12px] font-semibold leading-[1.4]">
                        {ep.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              listRef={listRef}
            />
          </div>
        </section>
      )}

      {isWebinars && <WebinarsSection webinars={webinars} />}

      {/* Bottom CTA */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('ctaKicker')}</SectionKicker>
          <h2 className="text-headline mb-3 font-sans text-white">{t('ctaHeading')}</h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <div className="flex flex-col gap-3">
            <a
              href={`/${locale}/guides`}
              className="font-body hover:border-accent-bright/60 flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors"
            >
              {t('ctaGuides')}
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                className="rtl:-scale-x-100"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href={`/${locale}/glossary`}
              className="font-body hover:border-accent-bright/60 flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors"
            >
              {t('ctaGlossary')}
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                className="rtl:-scale-x-100"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
