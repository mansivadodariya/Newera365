'use client';

import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Tab = 'ALL' | 'VIDEO' | 'AUDIO';

const TABS: Tab[] = ['ALL', 'VIDEO', 'AUDIO'];

// Kept for backward-compat — no longer used by the page
export interface CmsWebinarItem {
  id: number;
  title: string;
  slug: string;
  speaker: string;
  speakerBio?: string | null;
  scheduledAt: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  replayUrl?: string | null;
}

export interface CmsVideoItem {
  id: number;
  slug: string;
  title: string;
  contentType: 'video' | 'audio';
  thumbnailUrl?: string | null;
  videoEmbed?: string | null;
  description?: string | null;
}

interface EpisodeItem {
  id: string;
  tab: Tab;
  tagDisplay: string;
  duration: string;
  title: string;
  desc: string;
  type: 'VIDEO' | 'AUDIO';
  featured: boolean;
  thumbnailUrl?: string | null;
  href?: string | null;
}

const FALLBACK_EPISODES: EpisodeItem[] = [
  {
    id: 'fed-trader',
    tab: 'VIDEO',
    tagDisplay: 'VIDEO',
    duration: '42 min',
    title: "Inside the Fed: a former trader's view",
    desc: 'Ex-Goldman macro desk head on reading Fed minutes, rate expectations and what the bond market is pricing.',
    type: 'VIDEO',
    featured: true,
  },
  {
    id: 'cot-report',
    tab: 'VIDEO',
    tagDisplay: 'VIDEO',
    duration: '18 min',
    title: 'Reading the COT report',
    desc: 'How institutional positioning data can give retail traders a real edge.',
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'why-moves',
    tab: 'AUDIO',
    tagDisplay: 'AUDIO',
    duration: '24 min',
    title: 'Why oil moves on Tuesday',
    desc: 'EIA inventory data, production caps and the weekly cycle that drives crude.',
    type: 'AUDIO',
    featured: false,
  },
  {
    id: 'carry-trade',
    tab: 'VIDEO',
    tagDisplay: 'VIDEO',
    duration: '31 min',
    title: 'The carry trade explained',
    desc: 'Currency pairs, interest rate differentials and how to run a carry position through volatility.',
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'boe',
    tab: 'VIDEO',
    tagDisplay: 'VIDEO',
    duration: '15 min',
    title: 'Live BOE rate decision',
    desc: "Real-time breakdown of the Bank of England's rate decision and market reaction.",
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'london',
    tab: 'AUDIO',
    tagDisplay: 'AUDIO',
    duration: '22 min',
    title: 'Interview: a London market maker',
    desc: 'What actually happens on the other side of your trade — a rare look inside market making.',
    type: 'AUDIO',
    featured: false,
  },
  {
    id: 'position',
    tab: 'VIDEO',
    tagDisplay: 'VIDEO',
    duration: '19 min',
    title: 'Position sizing without the guesswork',
    desc: 'A practical framework for calculating lot size based on account risk, not gut feel.',
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'tech-analysis',
    tab: 'VIDEO',
    tagDisplay: 'VIDEO',
    duration: '27 min',
    title: 'Technical analysis that actually works',
    desc: 'Which chart setups have a statistical edge — and which ones traders just like the look of.',
    type: 'VIDEO',
    featured: false,
  },
];

function videoItemToEpisode(v: CmsVideoItem, index: number): EpisodeItem {
  const type: 'VIDEO' | 'AUDIO' = v.contentType === 'audio' ? 'AUDIO' : 'VIDEO';
  return {
    id: v.slug,
    tab: type,
    tagDisplay: type,
    duration: '',
    title: v.title,
    desc: v.description ?? '',
    type,
    featured: index === 0,
    thumbnailUrl: v.thumbnailUrl,
    href: v.videoEmbed ?? null,
  };
}

function webinarToEpisode(w: CmsWebinarItem, index: number): EpisodeItem {
  const tab: Tab = w.status === 'upcoming' || w.status === 'live' ? 'VIDEO' : 'VIDEO';
  return {
    id: w.slug,
    tab,
    tagDisplay: tab,
    duration: '',
    title: w.title,
    desc: w.speakerBio ?? `Presented by ${w.speaker}`,
    type: 'VIDEO',
    featured: index === 0,
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

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
      <path d="M8 7l6 3-6 3V7z" fill="white" />
    </svg>
  );
}

function AudioIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
      <path d="M7 12V9a3 3 0 016 0v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 11h2v3H5zM13 11h2v3h-2z" fill="white" />
    </svg>
  );
}

interface MediaListingPageProps {
  cmsVideos?: CmsVideoItem[];
  /** @deprecated use cmsVideos */
  cmsWebinars?: CmsWebinarItem[];
}

export function MediaListingPage({ cmsVideos, cmsWebinars }: MediaListingPageProps) {
  const locale = useLocale();
  const t = useTranslations('media');
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [search, setSearch] = useState('');

  const episodes = useMemo<EpisodeItem[]>(() => {
    if (cmsVideos?.length) return cmsVideos.map(videoItemToEpisode);
    if (cmsWebinars?.length)
      return cmsWebinars.filter((w) => w.status !== 'cancelled').map(webinarToEpisode);
    return FALLBACK_EPISODES;
  }, [cmsVideos, cmsWebinars]);

  const featured = episodes.find((e) => e.featured);
  const rest = episodes.filter((e) => !e.featured);

  const filtered = rest.filter((ep) => {
    const matchTab = activeTab === 'ALL' || ep.tab === activeTab;
    const matchSearch =
      !search ||
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.desc.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.08] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            {t('heroLine2')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted mb-6 max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroDesc')}
          </p>

          {/* Search */}
          <div className="relative">
            <svg
              className="text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border font-body text-foreground placeholder-muted focus:border-accent bg-surface w-full rounded-xl py-3 pl-10 pr-4 text-[14px] font-medium outline-none"
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'border-border text-muted hover:border-foreground dark:bg-surface-elevated dark:hover:bg-surface-elevated bg-[#F2F2F4] hover:bg-[#e5e5e5]'
                }`}
              >
                {tab === 'ALL' ? t('filterAll') : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured episode */}
      {featured && (activeTab === 'ALL' || activeTab === featured.tab) && !search && (
        <section className="bg-background px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div
              className="overflow-hidden rounded-[22px] bg-[#0d0d0d] xl:flex xl:flex-row"
              onClick={() =>
                featured.href && window.open(featured.href, '_blank', 'noopener,noreferrer')
              }
              style={{ cursor: featured.href ? 'pointer' : 'default' }}
            >
              {/* Thumbnail */}
              <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d2b1a] via-[#0a1f12] to-[#111111] xl:h-auto xl:w-[55%] xl:flex-shrink-0 xl:rounded-none">
                {featured.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* NEW EPISODE badge */}
                <div className="bg-accent absolute left-3 top-3 rounded-full px-2.5 py-[3px]">
                  <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                    {t('newEpisodeBadge')}
                  </span>
                </div>
                {/* Duration */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
                  <span className="font-body text-[10px] text-white/80">{featured.duration}</span>
                </div>
                {/* Play button */}
                <div className="bg-accent absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg xl:h-14 xl:w-14">
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
                    {featured.tagDisplay}
                  </span>
                  <span className="font-body text-[11px] text-white/40">{featured.type}</span>
                  <span className="font-body text-[11px] text-white/30">{t('releasedToday')}</span>
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
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mx-auto mb-5 mt-2">
            {t('latestEpisodes')}
          </SectionKicker>
          {filtered.length === 0 ? (
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('noResults')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3">
              {filtered.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-surface shadow-card flex flex-col gap-3 overflow-hidden rounded-[18px] p-4 dark:shadow-none"
                  onClick={() => ep.href && window.open(ep.href, '_blank', 'noopener,noreferrer')}
                  style={{ cursor: ep.href ? 'pointer' : 'default' }}
                >
                  {/* Thumbnail */}
                  <div className="relative flex h-[90px] items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1f12] to-[#111111]">
                    {ep.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-80"
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
                    <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-[2px]">
                      <span className="font-body text-[9px] text-white">{ep.duration}</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span
                        className={`font-body rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.08em] ${TAG_COLORS[ep.tagDisplay]}`}
                      >
                        {ep.tagDisplay}
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
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            {t('ctaHeading')}
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <div className="flex flex-col gap-3">
            <a
              href={`/${locale}/guides`}
              className="font-body flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
            >
              {t('ctaGuides')}
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
              className="font-body flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
            >
              {t('ctaGlossary')}
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
