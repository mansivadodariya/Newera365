'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { RichText, extractHeadings } from './RichText';
import type { SlateNode } from './RichText';

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

const TOC: Record<DocId, { num: string; title: string }[]> = {
  terms: [
    { num: '1', title: 'Introduction' },
    { num: '2', title: 'Definitions' },
    { num: '3', title: 'Account opening' },
    { num: '4', title: 'Trading policy' },
    { num: '5', title: 'Order execution' },
    { num: '6', title: 'Fees and charges' },
    { num: '7', title: 'Limitation of liability' },
    { num: '8', title: 'Governing law' },
  ],
  privacy: [
    { num: '1', title: 'Data we collect' },
    { num: '2', title: 'How we use it' },
    { num: '3', title: 'Third parties' },
    { num: '4', title: 'Your rights' },
    { num: '5', title: 'Retention' },
    { num: '6', title: 'Contact' },
  ],
  risk: [
    { num: '1', title: 'Nature of CFDs' },
    { num: '2', title: 'Leverage risk' },
    { num: '3', title: 'Market risk' },
    { num: '4', title: 'Liquidity risk' },
    { num: '5', title: 'Technology risk' },
  ],
  aml: [
    { num: '1', title: 'Policy scope' },
    { num: '2', title: 'Customer due diligence' },
    { num: '3', title: 'Monitoring' },
    { num: '4', title: 'Reporting' },
  ],
  cookies: [
    { num: '1', title: 'What are cookies' },
    { num: '2', title: 'Types we use' },
    { num: '3', title: 'Managing cookies' },
  ],
};

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="flex flex-col gap-3">
      <h2 className="text-foreground font-sans text-[24px] font-semibold tracking-[-0.48px]">
        {title}
      </h2>
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
            <div key={item.term} className="bg-surface rounded-[12px] p-4">
              <span className="font-body text-foreground text-[13px] font-semibold">
                {item.term}
              </span>
              <span className="font-body text-muted text-[13px]"> — {item.def}</span>
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
          Financial markets can be highly volatile. Prices may gap significantly — particularly
          around major economic announcements — resulting in execution at prices materially
          different from your order price.
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
            <div key={c.type} className="bg-surface rounded-[12px] p-4">
              <p className="font-body text-foreground text-[13px] font-semibold">{c.type}</p>
              <p className="font-body text-muted mt-0.5 text-[12px]">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  ),
};

interface LegalPageProps {
  documents?: CmsLegalDocument[];
}

export function LegalPage({ documents }: LegalPageProps) {
  const hasCms = documents && documents.length > 0;

  const cmsDocList = hasCms
    ? documents.map((d) => ({ id: d.pageType, label: PAGE_TYPE_LABELS[d.pageType] ?? d.title }))
    : null;

  const [activeDoc, setActiveDoc] = useState<DocId>('terms');

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground font-sans text-[36px] font-semibold leading-[1.08] tracking-[-1.08px]">
            Terms &amp;
            <br />
            <span className="text-accent">Conditions.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            All regulatory documents, policies and disclosures governing your account.
          </p>
        </div>
      </section>

      {/* Document selector */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {(cmsDocList ?? DOCUMENTS).map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id as DocId)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                  activeDoc === doc.id
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'text-muted dark:bg-surface-elevated dark:hover:bg-surface-elevated bg-[#F2F2F4] hover:bg-[#e5e5e5]'
                }`}
              >
                {doc.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="bg-surface rounded-[14px] p-4">
            <p className="text-muted mb-3 font-mono text-[10px] tracking-[1.4px]">Contents</p>
            <div className="flex flex-col gap-2">
              {TOC[activeDoc].map((item) => (
                <a
                  key={item.num}
                  href={`#section-${item.num}`}
                  className="font-body text-foreground/75 hover:text-accent flex items-center gap-3 text-[13px] transition-colors dark:text-white/75"
                >
                  <span className="text-muted w-5">{item.num}.</span>
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Document body */}
      <section className="bg-background px-5 pb-12">
        <div className="mx-auto flex max-w-[390px] flex-col gap-6 md:max-w-2xl xl:max-w-[1200px]">
          {DOC_CONTENT[activeDoc]}
        </div>
      </section>

      {/* Footer note */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body mb-5 text-[12px] leading-[1.7] text-white/50">
            Trading involves risk. Past performance is not indicative of future results. Trade
            responsibly. NewEra365 Ltd is regulated by FCA, ASIC, and CySEC.
          </p>
          <div className="flex flex-wrap gap-3">
            {DOCUMENTS.filter((d) => d.id !== activeDoc).map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className="font-body rounded-full border border-white/20 px-4 py-2 text-[12px] text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                {doc.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
