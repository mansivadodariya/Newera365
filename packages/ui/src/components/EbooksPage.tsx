'use client';

import { useState } from 'react';
import { SectionKicker } from './SectionKicker';

const BENEFITS = [
  'Step-by-step framework used by our trading desk',
  'Downloadable worksheet with exact parameters',
  'Risk math worked out in plain numbers',
  'Common mistakes and how to avoid them',
  'Bonus checklist PDF for daily use',
] as const;

const OTHER_EBOOKS = [
  {
    id: 'position',
    title: 'The Position Sizing Blueprint',
    desc: 'A complete guide to calculating lot sizes, risk per trade and account allocation.',
    pages: '12 pages',
  },
  {
    id: 'psychology',
    title: 'Trading Psychology: The Inner Game',
    desc: 'How to eliminate emotional decision-making from your trading process.',
    pages: '18 pages',
  },
  {
    id: 'technical',
    title: 'Technical Analysis Foundations',
    desc: 'Every chart pattern, indicator and setup that has a proven statistical edge.',
    pages: '24 pages',
  },
] as const;

export function EbooksPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/education/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, contentId: '5-percent-rule' }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">Free E-Books</SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[42px] font-semibold leading-[1.05]">
            The 5%
            <br />
            <span className="text-accent">Rule.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            A 5-page framework for never losing more than 5% on a single trade. Used by our desk
            every day.
          </p>
        </div>
      </section>

      {/* Ebook cover + gate form */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Cover */}
          <div className="mb-6 flex items-center justify-center overflow-hidden rounded-[22px] bg-[#111111] px-8 py-10">
            <div className="w-full max-w-[200px] rounded-[16px] bg-[#1a1a1a] p-6 shadow-2xl">
              <div className="bg-accent mb-4 flex h-8 w-8 items-center justify-center rounded-[10px]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="12"
                    height="12"
                    rx="2"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path d="M5 6h6M5 9h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-body mb-1 text-[9px] uppercase tracking-[0.14em] text-white/40">
                NEWERA365 · FREE GUIDE
              </p>
              <p className="font-sans text-[22px] font-semibold leading-[1.1] text-white">
                The 5%
                <br />
                Rule.
              </p>
              <p className="font-body mt-2 text-[11px] leading-relaxed text-white/50">
                A framework for never losing more than 5% on a single trade.
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <div className="bg-accent/30 h-1 flex-1 rounded-full" />
                <div className="bg-accent h-1 flex-1 rounded-full" />
                <div className="bg-accent/30 h-1 flex-1 rounded-full" />
              </div>
            </div>
          </div>

          {/* Gate form */}
          <div
            className="rounded-[22px] bg-[#f9f9f9] p-5 dark:bg-[#1c1c1c]"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
          >
            <p className="text-foreground mb-1 font-sans text-[18px] font-semibold">
              Get the PDF — free
            </p>
            <p className="font-body text-muted mb-5 text-[12px] leading-[1.55]">
              One email, we&apos;ll send it straight away. No drip sequence, no spam.
            </p>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="#00B050"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-foreground font-sans text-[16px] font-semibold">
                  Check your inbox!
                </p>
                <p className="font-body text-muted text-[13px]">The PDF is on its way to {email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-border font-body text-foreground placeholder-muted focus:border-accent w-full rounded-[12px] border bg-white px-4 py-3 text-[13px] outline-none dark:bg-[#141414]"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border font-body text-foreground placeholder-muted focus:border-accent w-full rounded-[12px] border bg-white px-4 py-3 text-[13px] outline-none dark:bg-[#141414]"
                />
                {error && <p className="font-body text-[12px] text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90 font-body flex h-[50px] w-full items-center justify-center rounded-full text-[14px] font-medium text-white transition-colors disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send me the PDF'}
                </button>
              </form>
            )}

            {/* Benefits */}
            <div className="mt-5 flex flex-col gap-[10px]">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <svg
                    className="text-accent mt-0.5 flex-shrink-0"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-body text-muted text-[12px] leading-[1.5]">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* More ebooks */}
      <section className="dark:bg-background bg-[#f9f9f9] px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">MORE FREE GUIDES</SectionKicker>
          <div className="flex flex-col gap-[10px]">
            {OTHER_EBOOKS.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 rounded-[18px] bg-white p-4 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="bg-accent/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-accent"
                  >
                    <rect
                      x="3"
                      y="2"
                      width="14"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 7h6M7 10.5h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-sans text-[13px] font-semibold leading-[1.3]">
                    {book.title}
                  </p>
                  <p className="font-body text-muted mt-0.5 text-[11px] leading-[1.4]">
                    {book.desc}
                  </p>
                </div>
                <span className="font-body text-muted flex-shrink-0 text-[10px]">{book.pages}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            READY TO TRADE?
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Put it into practice.
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Apply the 5% rule on a risk-free demo account — no deposit, no pressure.
          </p>
          <a
            href="/demo-account"
            className="bg-accent hover:bg-accent/90 font-body flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-medium text-white transition-colors"
          >
            Open demo account
          </a>
        </div>
      </section>
    </>
  );
}
