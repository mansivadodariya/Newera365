'use client';

import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { Spotlight } from '../primitives/Spotlight';
import { Accordion } from '../primitives/Accordion';
import type { SlateNode } from '../primitives/RichText';
import { norm, humanize } from '../../lib/filterUtils';

/* Shared page wrap: matches the site container rhythm (390 → 2xl → 1200). */
const WRAP = 'mx-auto w-full max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';
/* White bordered card on paper; #111 card in dark. Canon: never gray fills. */
const CARD =
  'border-border bg-white shadow-card dark:border-white/[0.06] dark:bg-[#111] dark:shadow-card-dark';

/* ===== FAQ types, data & helpers (from FaqPage) ===== */

type FaqItem = { id: string; q: string; a: string; popular: boolean };
type FaqGroup = { section: string; items: FaqItem[] };

export interface CmsFaqItem {
  id: number;
  question: string;
  answer: SlateNode[];
  category: string;
  sortOrder?: number | null;
}

const CAT_I18N: Record<
  string,
  | 'catPlatform'
  | 'catSecurity'
  | 'catFunding'
  | 'catTrading'
  | 'catAccounts'
  | 'catDeposits'
  | 'catWithdrawals'
  | 'catPlatforms'
  | 'catRegulation'
  | 'catGeneral'
> = {
  Platform: 'catPlatform',
  Security: 'catSecurity',
  Funding: 'catFunding',
  Trading: 'catTrading',
  Accounts: 'catAccounts',
  Deposits: 'catDeposits',
  Withdrawals: 'catWithdrawals',
  Platforms: 'catPlatforms',
  Regulation: 'catRegulation',
  General: 'catGeneral',
};

const CMS_CATEGORY_LABELS: Record<string, string> = {
  trading: 'Trading',
  accounts: 'Accounts',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  platforms: 'Platforms',
  regulation: 'Regulation',
  general: 'General',
};

function cmsFaqsToGroups(faqs: CmsFaqItem[]): FaqGroup[] {
  const seen = new Set<string>();
  const grouped = new Map<string, FaqItem[]>();
  let counter = 0;
  for (const faq of faqs) {
    if (!faq.question?.trim()) continue;
    if (seen.has(faq.question)) continue;
    seen.add(faq.question);
    // Normalize so "Trading"/"trading"/"TRADING" collapse into one group.
    const label = CMS_CATEGORY_LABELS[norm(faq.category)] ?? humanize(faq.category);
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push({
      // Stable, unique id so the Popular list can deep-link straight to an answer.
      id: `faq-${counter++}`,
      q: faq.question,
      a: (faq.answer ?? []).map((n) => extractPlainText(n)).join(''),
      popular: (faq.sortOrder ?? 100) < 5,
    });
  }
  return Array.from(grouped, ([section, items]) => ({ section, items }));
}

function extractPlainText(node: SlateNode): string {
  if (node.text !== undefined) return node.text;
  return node.children?.map(extractPlainText).join('') ?? '';
}

/* FAQ ledger row: the category context lives in the group header above the
   list, so rows carry only the question (no per-row chip = one clean rail). */
function AccordionItem({
  question,
  answer,
  id,
  openIdx,
  setOpenIdx,
}: {
  question: string;
  answer: string;
  id: string;
  openIdx: string | null;
  setOpenIdx: (v: string | null) => void;
}) {
  const isOpen = openIdx === id;
  return (
    <Accordion
      id={id}
      question={question}
      answer={answer}
      isOpen={isOpen}
      onToggle={() => setOpenIdx(isOpen ? null : id)}
      variant="row"
    />
  );
}

/* ===== Contact types & data (from ContactPage) ===== */

interface Channel {
  id: string;
  action: string;
  value: string;
  icon: ReactNode;
}

const CHANNELS: Channel[] = [
  {
    id: 'email',
    value: 'support@newera.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    action: 'mailto:support@newera.com',
  },
  {
    id: 'call',
    value: '+1 867-778-3511',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 2h3l1.5 4-2 1.5a11 11 0 004 4L13 9.5l4 1.5v3c0 2.5-5 4-10-1S2.5 4.5 5 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    action: 'tel:+18677783511',
  },
];

const TOPICS = ['General', 'Account', 'Funding', 'Technical', 'Partnership'] as const;
type Topic = (typeof TOPICS)[number];

export interface CmsContactDetails {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  supportHours?: string | null;
}

/* ===== Merged Support page ===== */

export interface CmsPromiseStat {
  valueEn: string;
  valueAr: string;
  labelEn: string;
  labelAr: string;
  id?: string | null;
}

interface SupportPageProps {
  faqs?: CmsFaqItem[];
  contactDetails?: CmsContactDetails;
  promiseStats?: CmsPromiseStat[];
}

export function SupportPage({ faqs, contactDetails, promiseStats }: SupportPageProps) {
  // FAQ namespace + derived state (from FaqPage)
  const t = useTranslations('faq');
  // Contact namespace, aliased to avoid the FAQ `t` collision (from ContactPage)
  const tc = useTranslations('contact');
  // Shared support-arc namespace (hero + human seam)
  const ts = useTranslations('support');
  const locale = useLocale();
  const isAr = locale === 'ar';

  // Channels: CMS-sourced email/phone, falling back to the static defaults so the UI never goes blank.
  const channels = CHANNELS.map((ch) => {
    if (ch.id === 'email') {
      const email = contactDetails?.email || ch.value;
      return { ...ch, value: email, action: `mailto:${email}` };
    }
    if (ch.id === 'call') {
      const phone = contactDetails?.phone || ch.value;
      return { ...ch, value: phone, action: `tel:${phone.replace(/[\s-]/g, '')}` };
    }
    return ch;
  });

  // Promise stats: CMS-driven when seeded, falling back to the static defaults otherwise.
  const promiseStatTiles =
    promiseStats && promiseStats.length > 0
      ? promiseStats.map((s, idx) => ({
          v: isAr ? s.valueAr : s.valueEn,
          l: isAr ? s.labelAr : s.labelEn,
          ltr: idx < 2,
        }))
      : [
          { v: '< 6 min', l: tc('promiseStat1'), ltr: true },
          { v: '24/5', l: tc('promiseStat2'), ltr: true },
          { v: '8', l: tc('promiseStat3'), ltr: false },
        ];

  const translateCat = (cat: string) => (CAT_I18N[cat] ? t(CAT_I18N[cat]!) : cat);
  const [openIdx, setOpenIdx] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allGroups = useMemo(() => (faqs && faqs.length > 0 ? cmsFaqsToGroups(faqs) : []), [faqs]);
  const categories = useMemo(() => allGroups.map((g) => g.section), [allGroups]);

  const filteredGroups = useMemo(() => {
    const groups = activeCategory
      ? allGroups.filter((g) => g.section === activeCategory)
      : allGroups;

    if (!search.trim()) return groups;

    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [search, activeCategory, allGroups]);

  const popularItems = useMemo(
    () =>
      allGroups
        .flatMap((g) =>
          g.items.filter((item) => item.popular).map((item) => ({ ...item, section: g.section })),
        )
        .slice(0, 6),
    [allGroups],
  );

  const totalResults = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const showPopular = !search && !activeCategory && popularItems.length > 0;

  // Deep-link a Popular question straight to its open answer in the list below.
  function openQuestion(id: string) {
    setSearch('');
    setActiveCategory(null);
    setOpenIdx(id);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      });
    }
  }

  // Contact form state (from ContactPage)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<Topic>('General');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}/api/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject: topic, message }),
        },
      );
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: { message?: string }[];
        };
        // Endpoint returns validation issues as `errors: [{ message }]` and
        // server faults as `error: string` — surface whichever is present.
        setError(
          data.errors?.[0]?.message ?? data.error ?? 'Something went wrong. Please try again.',
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const tinted =
    'bg-[#F0F4F1] dark:bg-[#1a1c22] border border-transparent focus:ring-2 focus:ring-accent/20 outline-none transition-colors';

  return (
    <>
      {/* ===== ACT 1 · Search-first FAQ ===== */}
      <section className="bg-transparent px-5 pb-6 pt-10 xl:pt-14">
        <ScrollReveal className={WRAP}>
          <SectionKicker className="mb-5">{ts('heroKicker')}</SectionKicker>
          <h1 className="text-foreground text-display mb-4 font-sans">
            {ts('heroLine1')}
            <br />
            <span>{ts('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted text-lead mb-8 max-w-[46ch]">{ts('heroSubtitle')}</p>

          {/* Search bar: the first thing every visitor reaches for. */}
          <div
            className={`flex items-center gap-[12px] rounded-[16px] border px-5 py-4 transition-colors ${CARD}`}
          >
            <svg
              className="text-muted flex-shrink-0"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenIdx(null);
              }}
              aria-label={t('searchPlaceholder')}
              className="font-body text-foreground text-body placeholder:text-muted flex-1 bg-transparent outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label={t('filterAll')}
                className="text-muted hover:text-foreground tap-scale flex-shrink-0 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Category chips: data-driven from the actual FAQ groups. */}
          {categories.length > 0 && (
            <div
              className="scrollbar-hide -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {[t('filterAll'), ...categories].map((cat) => {
                const isAll = cat === t('filterAll');
                const isActive = isAll ? !activeCategory : activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setActiveCategory(isAll ? null : activeCategory === cat ? null : cat)
                    }
                    className={`font-body tap-scale flex-shrink-0 rounded-full border px-4 py-[8px] text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-accent border-accent text-white'
                        : `${CARD} text-muted hover:border-accent/50 hover:text-foreground`
                    }`}
                  >
                    {isAll ? cat : translateCat(cat)}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* Popular questions: shown only when idle; each deep-links to its answer. */}
      {showPopular && (
        <section className="px-5 pb-4 pt-2">
          <ScrollReveal className={WRAP}>
            <SectionKicker className="mb-4">{t('sectionPopular')}</SectionKicker>
            <div className="grid gap-[10px] md:grid-cols-2">
              {popularItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openQuestion(item.id)}
                  className={`tap-scale hover:border-accent/50 group flex items-center gap-[12px] rounded-[14px] border px-4 py-[14px] text-start transition-colors ${CARD}`}
                >
                  <span className="bg-accent/10 text-accent dark:bg-accent/15 flex-shrink-0 rounded-full px-[10px] py-[5px] font-mono text-[9px] uppercase tracking-[1.2px]">
                    {translateCat(item.section)}
                  </span>
                  <span className="font-body text-foreground text-body flex-1 font-medium leading-snug">
                    {item.q}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="text-muted group-hover:text-accent ms-1 flex-shrink-0 transition-[color,transform] motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100"
                  >
                    <path
                      d="M2 7h9.5M7 3.5l3.5 3.5L7 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Result count when searching */}
      {search && (
        <section className="px-5 pb-1 pt-2">
          <div className={WRAP}>
            <p className="font-body text-muted text-caption">
              {totalResults !== 1
                ? t('resultsForPlural', { count: totalResults, query: search })
                : t('resultsFor', { count: totalResults, query: search })}
            </p>
          </div>
        </section>
      )}

      {/* All FAQs: animated accordion */}
      <section className="px-5 pb-8 pt-2">
        <ScrollReveal className={WRAP}>
          <SectionKicker className="mb-4">{t('sectionAll')}</SectionKicker>
          {filteredGroups.length > 0 ? (
            <div className="flex flex-col gap-9">
              {filteredGroups.map((group) => (
                <div key={group.section}>
                  {/* Group header: mono chapter label + rule + count */}
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-eyebrow text-muted font-mono font-semibold uppercase tracking-[0.16em]">
                      {translateCat(group.section)}
                    </span>
                    <span className="bg-border h-px flex-1 dark:bg-white/[0.08]" />
                    <span dir="ltr" className="text-muted text-eyebrow font-mono tabular-nums">
                      {String(group.items.length).padStart(2, '0')}
                    </span>
                  </div>
                  {group.items.map((item) => (
                    <AccordionItem
                      key={item.id}
                      id={item.id}
                      question={item.q}
                      answer={item.a}
                      openIdx={openIdx}
                      setOpenIdx={setOpenIdx}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-muted text-body py-10 text-center">{t('noResults')}</p>
          )}
        </ScrollReveal>
      </section>

      {/* ===== ACT 2 · The seam: escalate to a human (ink anchor) ===== */}
      <section className="px-5 py-6">
        <ScrollReveal className={WRAP}>
          <Spotlight
            size={520}
            className="ink-band overflow-hidden rounded-[32px] p-8 md:p-11 xl:p-14"
          >
            <div className="flex flex-col gap-9 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[560px]">
                <SectionKicker className="mb-5">{ts('seamKicker')}</SectionKicker>
                <h2 className="text-headline font-sans text-white">
                  {t('stuckHeading')} <span>{ts('seamHuman')}</span>
                </h2>
                <p className="font-body text-body mt-4 max-w-[44ch] text-white/70">
                  {ts('seamDesc')}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href="#contact"
                    className="bg-accent font-body text-body hover:bg-accent-bright tap-scale inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-medium text-white transition-colors"
                  >
                    {t('openChat')}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      aria-hidden="true"
                      className="rtl:-scale-x-100"
                    >
                      <path
                        d="M2.5 7.5h10M8 3.5l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1px] text-white/55">
                    <span className="bg-accent-bright inline-block h-[7px] w-[7px] rounded-full" />
                    {ts('seamStatus')}
                  </span>
                </div>
              </div>

              {/* Proof stats: folded into the human moment. */}
              <div className="grid grid-cols-3 gap-3 xl:w-[420px]">
                {promiseStatTiles.map((s) => (
                  <div
                    key={s.l}
                    className="hover:border-accent-bright/40 hover:bg-accent/[0.10] rounded-[16px] border border-white/[0.1] bg-white/[0.05] p-4 transition-colors"
                  >
                    <span
                      className="text-accent-bright block font-sans text-[22px] font-semibold tabular-nums"
                      {...(s.ltr ? { dir: 'ltr' as const } : {})}
                    >
                      {s.v}
                    </span>
                    <span className="font-body mt-1 block text-[10px] uppercase tracking-[0.8px] text-white/50">
                      {s.l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Spotlight>
        </ScrollReveal>
      </section>

      {/* ===== ACT 3 · Talk to us: channels + form ===== */}

      {/* Channels. id="contact" is the seam anchor target (do not rename). */}
      <section id="contact" className="scroll-mt-20 px-5 pb-8 pt-6">
        <ScrollReveal className={WRAP}>
          <SectionKicker className="mb-4">{tc('channelsKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-8 font-sans">{tc('channelsHeading')}</h2>
        </ScrollReveal>
        <div className={`${WRAP} grid gap-[14px] md:grid-cols-2`}>
          {channels.map((ch, i) => (
            <ScrollReveal key={ch.id} index={i}>
              <a
                href={ch.action}
                className={`hover:border-accent/50 group flex items-center gap-[14px] rounded-[18px] border px-5 py-5 transition-colors ${CARD}`}
              >
                <div className="bg-accent-subtle text-accent dark:bg-accent/15 dark:text-accent-bright flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[14px]">
                  {ch.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-body font-sans font-semibold">
                    {ch.id === 'email' ? tc('channelEmail') : tc('channelCall')}
                  </p>
                  <p className="font-body text-muted text-caption mt-[3px]">{ch.value}</p>
                </div>
                <span className="text-muted flex-shrink-0 font-mono text-[10px] tracking-[1px]">
                  {ch.id === 'email' ? tc('channelEmailReply') : tc('channelCallHours')}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="text-muted group-hover:text-accent flex-shrink-0 transition-[color,transform] motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100"
                >
                  <path
                    d="M2 7h9.5M7 3.5l3.5 3.5L7 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact form: POST verbatim to /api/contact (do not alter body/states). */}
      <section className="px-5 pb-10 pt-4">
        <ScrollReveal className={WRAP}>
          <div className={`rounded-[24px] border p-6 md:p-9 ${CARD}`}>
            <SectionKicker className="mb-4">{tc('formKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline mb-8 font-sans">{tc('formHeading')}</h2>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 rounded-[18px] bg-[#F0F4F1] px-6 py-12 text-center dark:bg-[#1a1c22]">
                <div className="bg-accent flex h-14 w-14 items-center justify-center rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-foreground text-title font-sans">{tc('successHeading')}</h3>
                <p className="font-body text-muted text-body max-w-[280px] leading-relaxed">
                  {tc('successDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-[14px] md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-name"
                    className="text-muted font-mono text-[10px] uppercase tracking-[1.5px]"
                  >
                    {tc('fieldName')}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tc('fieldNamePlaceholder')}
                    className={`font-body text-body text-foreground w-full rounded-[14px] px-4 py-[14px] placeholder-[#9ca3af] dark:text-white dark:placeholder-white/30 ${tinted}`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-email"
                    className="text-muted font-mono text-[10px] uppercase tracking-[1.5px]"
                  >
                    {tc('fieldEmail')}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tc('fieldEmailPlaceholder')}
                    className={`font-body text-body text-foreground w-full rounded-[14px] px-4 py-[14px] placeholder-[#9ca3af] dark:text-white dark:placeholder-white/30 ${tinted}`}
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-muted font-mono text-[10px] uppercase tracking-[1.5px]">
                    {tc('fieldTopic')}
                  </span>
                  <div className="flex flex-wrap gap-[6px]">
                    {TOPICS.map((topicVal) => (
                      <button
                        key={topicVal}
                        type="button"
                        onClick={() => setTopic(topicVal)}
                        className={`font-body tap-scale rounded-full border px-[14px] py-[8px] text-[12px] font-medium transition-colors ${
                          topic === topicVal
                            ? 'bg-accent border-accent text-white'
                            : 'text-muted hover:border-accent/50 hover:text-foreground border-transparent bg-[#F0F4F1] dark:bg-[#1a1c22]'
                        }`}
                      >
                        {topicVal === 'General'
                          ? tc('topicGeneral')
                          : topicVal === 'Account'
                            ? tc('topicAccount')
                            : topicVal === 'Funding'
                              ? tc('topicFunding')
                              : topicVal === 'Technical'
                                ? tc('topicTechnical')
                                : tc('topicPartnership')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label
                    htmlFor="contact-message"
                    className="text-muted font-mono text-[10px] uppercase tracking-[1.5px]"
                  >
                    {tc('fieldMessage')}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={tc('fieldMessagePlaceholder')}
                    className={`font-body text-body text-foreground w-full resize-none rounded-[14px] px-4 py-[14px] placeholder-[#9ca3af] dark:text-white dark:placeholder-white/30 ${tinted}`}
                  />
                </div>

                {error && (
                  <p className="font-body text-caption text-red-500 md:col-span-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent font-body text-body hover:bg-accent-bright tap-scale flex items-center justify-center gap-2 rounded-full px-6 py-4 font-medium text-white transition-colors disabled:opacity-60 md:col-span-2"
                >
                  {tc('submitBtn')}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="rtl:-scale-x-100"
                  >
                    <path
                      d="M1 7h9.5M7 3.5l3.5 3.5L7 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <p className="font-body text-muted text-caption text-center md:col-span-2">
                  {tc('submitPrivacy')}
                </p>
              </form>
            )}
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
