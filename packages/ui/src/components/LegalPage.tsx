'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RichText, extractHeadings } from './RichText';
import type { SlateNode } from './RichText';
import { SectionKicker } from './SectionKicker';
import { ReadingProgress } from './ReadingProgress';

export interface CmsLegalDocument {
  id: number;
  pageType: string;
  title: string;
  body: SlateNode[];
  effectiveDate?: string | null;
  version?: string | null;
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  terms: 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy',
  'risk-disclosure': 'Risk Warning',
  'aml-policy': 'AML Policy',
  'cookie-policy': 'Cookie Policy',
};

const DOCUMENTS = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'risk', label: 'Risk Warning' },
  { id: 'aml', label: 'AML Policy' },
  { id: 'cookies', label: 'Cookie Policy' },
] as const;

type DocId = (typeof DOCUMENTS)[number]['id'];

const DOC_ALIAS: Record<string, string> = {
  privacy: 'privacy-policy',
  risk: 'risk-disclosure',
  aml: 'aml-policy',
  cookies: 'cookie-policy',
};

const TOC_KEYS: Record<string, string[]> = {
  terms: [
    'tocIntro',
    'tocDefinitions',
    'tocAccountOpening',
    'tocTradingPolicy',
    'tocOrderExecution',
    'tocFees',
    'tocLiability',
    'tocGoverningLaw',
  ],
  'privacy-policy': [
    'tocDataCollect',
    'tocDataUse',
    'tocThirdParties',
    'tocYourRights',
    'tocRetention',
    'tocContactUs',
  ],
  'risk-disclosure': [
    'tocCfdNature',
    'tocLeverageRisk',
    'tocMarketRisk',
    'tocLiquidityRisk',
    'tocTechRisk',
  ],
  'aml-policy': ['tocPolicyScope', 'tocCdd', 'tocMonitoring', 'tocReporting'],
  'cookie-policy': ['tocWhatAreCookies', 'tocCookieTypes', 'tocManageCookies'],
};

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

// Editorial section: a mono ghost numeral (derived from the anchor id) sits
// beside a de-numbered heading, with a hairline rule above for clear rhythm.
// scroll-mt keeps in-page anchors clear of the sticky header.
function Section({ id, title, children }: SectionProps) {
  const numMatch = /(\d+)/.exec(id);
  const num = numMatch && numMatch[1] ? numMatch[1].padStart(2, '0') : '';
  const heading = title.replace(/^\s*\d+\.\s*/, '');
  return (
    <section
      id={id}
      className="flex scroll-mt-[88px] flex-col gap-3 border-t border-black/[0.06] pt-7 first:border-t-0 first:pt-0 dark:border-white/10"
    >
      <div className="flex items-baseline gap-3">
        {num && <span className="text-accent/70 text-caption font-mono tabular-nums">{num}</span>}
        <h2 className="text-foreground text-title font-sans">{heading}</h2>
      </div>
      {children}
    </section>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[15px] leading-[1.8] text-[rgba(17,17,17,0.85)] dark:text-white/85">
      {children}
    </p>
  );
}

function RiskBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-[14px] bg-[#fef3f2] p-4 dark:bg-[#2a1a00]">
      <svg
        className="mt-0.5 flex-shrink-0 text-[#F59E0B]"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M8 2L1 14h14L8 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8 6v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="font-body text-[12px] leading-[1.6] text-[#7f1d1d] dark:text-[#F59E0B]/80">
        {children}
      </p>
    </div>
  );
}

const DOC_CONTENT: Record<DocId, React.ReactNode> = {
  terms: (
    <>
      <p className="text-muted font-mono text-[11px] tracking-[1.54px]">
        Effective Jan 2024 · Updated 26 May 2025
      </p>
      <Section id="section-1" title="1. Introduction">
        <Para>
          These Terms and Conditions (&ldquo;Terms&rdquo;) govern the relationship between you (the
          &ldquo;Client&rdquo;) and NewEra365 Ltd (&ldquo;NewEra365&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;), a company duly authorised and regulated by the Financial Conduct
          Authority (FCA), the Australian Securities and Investments Commission (ASIC), and the
          Cyprus Securities and Exchange Commission (CySEC).
        </Para>
        <Para>
          By opening an account or using any of our services, you acknowledge that you have read,
          understood, and accepted these Terms in their entirety. If you do not agree, please do not
          use our services.
        </Para>
      </Section>
      <Section id="section-2" title="2. Definitions">
        <Para>The following definitions apply throughout these Terms:</Para>
        <div className="flex flex-col gap-3">
          {[
            {
              term: '"Platform"',
              def: 'means the MetaTrader 5 platform and any related software used to access trading accounts.',
            },
            {
              term: '"Order"',
              def: 'means an instruction to buy or sell and/or maintain a leveraged position.',
            },
            {
              term: '"Margin"',
              def: 'means the funds required as a deposit to open and maintain a leveraged position.',
            },
          ].map((item) => (
            <div key={item.term} className="rounded-[12px] bg-[#F0F4F1] p-4 dark:bg-[#1a1c22]">
              <span className="font-body text-foreground text-[13px] font-semibold">
                {item.term}
              </span>
              <span className="font-body text-muted text-[13px]">: {item.def}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section id="section-3" title="3. Account opening">
        <Para>
          To open an account, you must be at least 18 years old, of legal capacity in your
          jurisdiction, and not resident in a jurisdiction where the provision of our services is
          prohibited. You agree to provide accurate and complete information during the account
          opening process and to keep that information up-to-date throughout our relationship.
        </Para>
        <RiskBox>
          <strong>Risk warning:</strong> Trading leveraged products such as CFDs carries a high
          level of risk. You may lose more than your initial deposit. Ensure you understand the
          risks and seek independent advice if needed.
        </RiskBox>
      </Section>
      <Section id="section-4" title="4. Trading policy">
        <Para>
          All trades are executed on a &lsquo;best execution&rsquo; basis. We do not act as a market
          maker on your behalf. Orders are routed to our liquidity providers, and execution quality
          is monitored quarterly. We reserve the right to refuse or cancel orders where they
          conflict with our risk management parameters or applicable regulations.
        </Para>
      </Section>
      <Section id="section-5" title="5. Order execution">
        <Para>
          Orders are generally executed within milliseconds during normal market conditions. During
          periods of high volatility, execution may be subject to slippage. Stop-loss orders are not
          guaranteed unless explicitly stated as &lsquo;guaranteed stop-loss orders&rsquo; (GSLOs).
        </Para>
      </Section>
    </>
  ),
  privacy: (
    <>
      <p className="text-muted font-mono text-[11px] tracking-[1.54px]">
        Effective Jan 2024 · Updated 26 May 2025
      </p>
      <Section id="section-1" title="1. Data we collect">
        <Para>
          We collect personal data necessary for account management, regulatory compliance, and
          service delivery. This includes identity verification documents, contact details,
          financial information, and trading activity data.
        </Para>
      </Section>
      <Section id="section-2" title="2. How we use it">
        <Para>
          Your data is used to provide and improve our services, meet our regulatory obligations,
          prevent fraud, and communicate with you about your account and relevant offers. We do not
          sell your personal data to third parties.
        </Para>
      </Section>
      <Section id="section-3" title="3. Third parties">
        <Para>
          We may share data with regulated third parties including payment processors, identity
          verification providers, and regulatory bodies where required by law. All third-party
          processors are bound by data processing agreements meeting GDPR standards.
        </Para>
      </Section>
      <Section id="section-4" title="4. Your rights">
        <Para>
          Under applicable data protection law you have the right to access, rectify, erase, and
          port your personal data. You may also object to certain processing or restrict it. To
          exercise these rights, contact privacy@newera365.com.
        </Para>
      </Section>
    </>
  ),
  risk: (
    <>
      <p className="text-muted font-mono text-[11px] tracking-[1.54px]">
        Effective Jan 2024 · Updated 26 May 2025
      </p>
      <div className="rounded-[14px] bg-[#fef3f2] p-5 dark:bg-[#2a1a00]">
        <p className="font-body text-[14px] font-semibold text-[#7f1d1d] dark:text-[#F59E0B]">
          Important: Trading involves significant risk
        </p>
        <p className="font-body mt-2 text-[13px] leading-[1.65] text-[#7f1d1d] dark:text-[#F59E0B]/80">
          CFDs are complex instruments and come with a high risk of losing money rapidly due to
          leverage. You should consider whether you understand how CFDs work and whether you can
          afford to take the high risk of losing your money.
        </p>
      </div>
      <Section id="section-1" title="1. Nature of CFDs">
        <Para>
          A Contract for Difference (CFD) is a derivative product that allows you to speculate on
          the price movement of an underlying asset without owning it. Your profit or loss is
          determined by the difference between the opening and closing price of the position.
        </Para>
      </Section>
      <Section id="section-2" title="2. Leverage risk">
        <Para>
          Leverage amplifies both gains and losses. A 1% adverse move on a 1:100 leveraged position
          results in a 100% loss of the margin deployed. Only trade with funds you can afford to
          lose.
        </Para>
      </Section>
      <Section id="section-3" title="3. Market risk">
        <Para>
          Financial markets can be highly volatile. Prices may gap significantly, particularly
          around major economic announcements, resulting in execution at prices materially different
          from your order price.
        </Para>
      </Section>
    </>
  ),
  aml: (
    <>
      <p className="text-muted font-mono text-[11px] tracking-[1.54px]">
        Effective Jan 2024 · Updated 26 May 2025
      </p>
      <Section id="section-1" title="1. Policy scope">
        <Para>
          This AML policy applies to all clients and transactions processed through NewEra365 Ltd.
          We are committed to the highest standards of anti-money laundering and counter-terrorist
          financing compliance.
        </Para>
      </Section>
      <Section id="section-2" title="2. Customer due diligence">
        <Para>
          All clients are subject to Know-Your-Customer (KYC) checks prior to account activation.
          Enhanced due diligence is applied to higher-risk profiles including Politically Exposed
          Persons (PEPs) and clients from high-risk jurisdictions.
        </Para>
      </Section>
    </>
  ),
  cookies: (
    <>
      <p className="text-muted font-mono text-[11px] tracking-[1.54px]">
        Effective Jan 2024 · Updated 26 May 2025
      </p>
      <Section id="section-1" title="1. What are cookies">
        <Para>
          Cookies are small text files placed on your device when you visit our website. They help
          us provide a better experience by remembering your preferences, analysing site usage, and
          enabling certain features.
        </Para>
      </Section>
      <Section id="section-2" title="2. Types we use">
        <div className="flex flex-col gap-3">
          {[
            {
              type: 'Essential',
              desc: 'Required for core site functionality. Cannot be disabled.',
            },
            {
              type: 'Analytics',
              desc: 'Help us understand how visitors use the site (anonymised).',
            },
            { type: 'Marketing', desc: 'Used to deliver relevant advertising. Can be opted out.' },
          ].map((c) => (
            <div key={c.type} className="rounded-[12px] bg-[#F0F4F1] p-4 dark:bg-[#1a1c22]">
              <p className="font-body text-foreground text-[13px] font-semibold">{c.type}</p>
              <p className="font-body text-muted mt-0.5 text-[12px]">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  ),
};

// Deterministic so server and client render identically (no hydration mismatch):
// fixed UTC timezone + Latin digits regardless of locale.
function formatLegalDate(iso: string, locale: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

interface LegalPageProps {
  documents?: CmsLegalDocument[];
}

export function LegalPage({ documents }: LegalPageProps) {
  const t = useTranslations('legal');
  const locale = useLocale();

  const normalizeDocId = (id: string) => DOC_ALIAS[id] ?? id;
  const docLabel = (id: string) => {
    const nid = normalizeDocId(id);
    return nid === 'terms'
      ? t('docTerms')
      : nid === 'privacy-policy'
        ? t('docPrivacy')
        : nid === 'risk-disclosure'
          ? t('docRisk')
          : nid === 'aml-policy'
            ? t('docAml')
            : t('docCookies');
  };
  const getStaticToc = (docId: string) =>
    (TOC_KEYS[normalizeDocId(docId)] ?? []).map((key, idx) => ({
      num: String(idx + 1),
      title: t(key as Parameters<typeof t>[0]),
      id: `section-${idx + 1}`,
    }));

  const hasCms = documents && documents.length > 0;

  const uniqueDocs = hasCms
    ? documents
        .filter((d) => {
          if (!d.title?.trim()) return false;
          return true;
        })
        .filter((d, i, arr) => arr.findIndex((x) => x.pageType === d.pageType) === i)
    : null;

  const cmsDocList = uniqueDocs
    ? uniqueDocs.map((d) => ({ id: d.pageType, label: PAGE_TYPE_LABELS[d.pageType] ?? d.title }))
    : null;

  const [activeDoc, setActiveDoc] = useState<string>(uniqueDocs?.[0]?.pageType ?? 'terms');
  const cmsDoc = uniqueDocs?.find((d) => d.pageType === activeDoc) ?? null;
  const tocItems = cmsDoc
    ? extractHeadings(cmsDoc.body).map((h, idx) => ({
        num: String(idx + 1),
        title: h.text,
        id: h.id,
      }))
    : getStaticToc(activeDoc);

  // Scroll-spy: highlight the TOC anchor for the section currently in view.
  // A pure observer (no animation), so it stays on for reduced-motion users.
  const [activeId, setActiveId] = useState<string>('');
  const tocKey = tocItems.map((it) => it.id).join('|');
  useEffect(() => {
    const ids = tocKey ? tocKey.split('|') : [];
    if (ids.length === 0) {
      setActiveId('');
      return;
    }
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    setActiveId(ids[0] ?? '');

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) setActiveId(top.target.id);
      },
      { rootMargin: '-88px 0px -66% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocKey]);

  const hasToc = tocItems.length > 0;

  return (
    <>
      <ReadingProgress />

      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground text-display font-sans">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Document selector */}
      <section className="px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {(cmsDocList ?? DOCUMENTS).map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id as DocId)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                  activeDoc === doc.id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#F2F2F4] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e]'
                }`}
              >
                {docLabel(doc.id)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky TOC rail + document body */}
      <section className="px-5 pb-12">
        <div
          className={`mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px] ${
            hasToc ? 'xl:grid xl:grid-cols-[260px_1fr] xl:gap-12' : ''
          }`}
        >
          {/* Table of contents: collapses above the body on mobile, sticky rail on xl */}
          {hasToc && (
            <aside className="motion-safe:animate-rise-in mb-8 xl:mb-0">
              <nav
                aria-label={t('tocHeading')}
                className="rounded-[16px] border border-black/[0.06] bg-[#F0F4F1] p-4 xl:sticky xl:top-[88px] xl:p-5 dark:border-white/10 dark:bg-[#1a1c22]"
              >
                <SectionKicker className="text-muted mb-4">{t('tocHeading')}</SectionKicker>
                <ol className="flex flex-col gap-0.5">
                  {tocItems.map((item) => {
                    const active = item.id === activeId;
                    return (
                      <li key={item.num}>
                        <a
                          href={`#${item.id}`}
                          aria-current={active ? 'true' : undefined}
                          className={`group flex items-baseline gap-3 border-s-2 py-1.5 ps-3 text-[13px] transition-colors ${
                            active
                              ? 'border-accent text-foreground font-medium dark:text-white'
                              : 'text-foreground/60 hover:text-foreground border-transparent dark:text-white/55 dark:hover:text-white'
                          }`}
                        >
                          <span
                            className={`font-mono text-[11px] tabular-nums ${
                              active ? 'text-accent' : 'text-muted'
                            }`}
                          >
                            {item.num.padStart(2, '0')}
                          </span>
                          <span className="link-underline">{item.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </aside>
          )}

          {/* Document body */}
          <div className="flex min-w-0 flex-col gap-6">
            {cmsDoc ? (
              <>
                {(cmsDoc.effectiveDate || cmsDoc.version) && (
                  <p className="text-muted font-mono text-[11px] tracking-[1.54px]">
                    {[
                      cmsDoc.effectiveDate
                        ? `${t('effectivePrefix')} ${formatLegalDate(cmsDoc.effectiveDate, locale)}`
                        : null,
                      cmsDoc.version || null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                <RichText
                  content={cmsDoc.body}
                  className="[&_a]:link-underline flex flex-col gap-3 [&_h2]:scroll-mt-[88px] [&_h3]:scroll-mt-[88px]"
                />
              </>
            ) : (
              DOC_CONTENT[activeDoc as DocId]
            )}
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body mb-5 text-[12px] leading-[1.7] text-white/50">
            {t('footerDisclaimer')}
          </p>
          <div className="flex flex-wrap gap-3">
            {(cmsDocList ?? DOCUMENTS)
              .filter((d) => d.id !== activeDoc)
              .map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className="font-body rounded-full border border-white/20 px-4 py-2 text-[12px] text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  {docLabel(doc.id)}
                </button>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
