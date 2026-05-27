'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const FAQ_GROUPS = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'How do I open an account?',
        a: 'Click "Open Live Account" from any page, complete the online form, verify your identity, and fund your account. The entire process takes under 10 minutes.',
      },
      {
        q: 'What documents do I need to register?',
        a: 'A government-issued photo ID (passport or national ID) and proof of address (utility bill or bank statement dated within 3 months).',
      },
      {
        q: 'Is there a minimum deposit?',
        a: 'Standard accounts require a $100 minimum. Raw accounts require $500, and VIP accounts require $10,000.',
      },
      {
        q: 'Can I open a demo account?',
        a: 'Yes. A demo account gives you $10,000 in virtual funds to practice trading with real market conditions and zero risk.',
      },
    ],
  },
  {
    section: 'Trading',
    items: [
      {
        q: 'What markets can I trade?',
        a: 'Forex, indices, commodities, stocks, ETFs and crypto — over 200 instruments across 6 asset classes on MetaTrader 5.',
      },
      {
        q: 'What leverage is available?',
        a: 'Up to 1:500 on forex, 1:200 on indices, 1:100 on commodities, and 1:10 on crypto. Leverage depends on your account type and regulatory jurisdiction.',
      },
      {
        q: 'What is the minimum lot size?',
        a: 'The minimum trade size is 0.01 lots (1 micro-lot) across all instruments.',
      },
      {
        q: 'Do you charge commissions?',
        a: 'Standard accounts have no commissions — the cost is built into the spread. Raw accounts charge $3.50 per lot per side with raw spreads from 0.0 pip. VIP accounts receive custom pricing from $1.50 per lot.',
      },
      {
        q: 'Are Expert Advisors (EAs) allowed?',
        a: 'Yes. MT5 supports Expert Advisors, algorithmic strategies, and custom scripts. Scalping and hedging are permitted.',
      },
    ],
  },
  {
    section: 'Deposits & Withdrawals',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'Visa/Mastercard, bank wire (SWIFT), Skrill, Neteller, crypto (USDT, BTC), and local bank transfers in supported regions.',
      },
      {
        q: 'How long do withdrawals take?',
        a: 'Card withdrawals process within 1–3 business days. E-wallets (Skrill, Neteller) within 24 hours. Bank wire takes 2–5 business days. Crypto within 30 minutes.',
      },
      {
        q: 'Are there any withdrawal fees?',
        a: 'We charge no withdrawal fees. However, your bank or payment provider may charge network or processing fees on their end.',
      },
      {
        q: 'Is my money safe?',
        a: 'Yes. Client funds are held in segregated accounts at tier-1 banks, fully separated from company operating capital. We are PCI-DSS Level 1 certified.',
      },
    ],
  },
  {
    section: 'Platform & Technology',
    items: [
      {
        q: 'Which trading platforms do you offer?',
        a: 'MetaTrader 5 (desktop, iOS, Android), a browser-based Web Trader, and a mobile app for iOS and Android. All sync to the same account.',
      },
      {
        q: 'How fast is order execution?',
        a: 'Average execution speed is under 12 milliseconds with no dealing desk intervention.',
      },
      {
        q: 'Do you offer a VPS?',
        a: 'Yes. Raw and VIP account holders receive free VPS hosting to run Expert Advisors 24/7 without needing a local machine.',
      },
    ],
  },
] as const;

export function FaqPage() {
  const locale = useLocale();
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">FAQ</SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05]">
            Quick answers.
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Everything you need to know before you trade. Can&apos;t find your answer?{' '}
            <Link
              href={`/${locale}/contact`}
              className="text-accent underline-offset-2 hover:underline"
            >
              Contact us.
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ accordion groups */}
      {FAQ_GROUPS.map((group) => (
        <section key={group.section} className="dark:bg-background bg-white px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-3">{group.section.toUpperCase()}</SectionKicker>
            <div className="flex flex-col gap-px overflow-hidden rounded-[18px] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
              {group.items.map((item, idx) => {
                const key = `${group.section}-${idx}`;
                const isOpen = openIdx === key;
                return (
                  <div key={idx} className="dark:bg-surface bg-white">
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : key)}
                      className="flex w-full items-start justify-between px-5 py-[15px] text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-foreground mr-4 font-sans text-[14px] font-semibold leading-snug">
                        {item.q}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`text-muted mt-0.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                      >
                        <path
                          d="M8 3v10M3 8h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    {isOpen && (
                      <p className="font-body text-muted px-5 pb-[15px] text-[13px] leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Dark CTA */}
      <section className="bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50 [&>span]:bg-white/40">
            STILL HAVE QUESTIONS?
          </SectionKicker>
          <h2 className="mb-5 font-sans text-[32px] font-semibold leading-[1.1] text-white">
            Talk to our team.
          </h2>
          <p className="font-body mb-8 max-w-[280px] text-[14px] leading-relaxed text-white/60">
            Our support team is available 24/5. We reply within minutes during market hours.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="bg-accent font-body hover:bg-accent-hover flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Contact support
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
      </section>
    </>
  );
}
