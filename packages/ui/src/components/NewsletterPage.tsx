'use client';

import { useState } from 'react';
import { SectionKicker } from './SectionKicker';

export function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-10 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[44px] font-semibold leading-[1.05]">
            The Monday
            <br />
            <span className="text-accent">briefing.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.6]">
            It&apos;s a 5 minute read on the week ahead, straight from our trading desk to your
            inbox.
          </p>
        </div>
      </section>

      {/* Subscribe form */}
      <section className="bg-background px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {submitted ? (
            <div className="rounded-[20px] bg-surface px-6 py-10 text-center">
              <div className="bg-accent mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-foreground mb-2 font-sans text-[22px] font-semibold">
                You&apos;re in.
              </h2>
              <p className="font-body text-muted text-[13px] leading-relaxed">
                Check your inbox Monday morning — your first briefing lands at 7am.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="font-body text-foreground focus:border-accent flex-1 rounded-full border border-[#e5e7eb] bg-surface px-5 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a]"
                />
                <button
                  type="submit"
                  disabled={!agreed}
                  className="bg-accent font-body hover:bg-accent/90 flex h-[50px] flex-shrink-0 items-center justify-center rounded-full px-5 text-[14px] font-medium text-white transition-colors disabled:opacity-50"
                >
                  Subscribe
                </button>
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors ${
                    agreed
                      ? 'border-accent bg-accent'
                      : 'border-[#d1d5db] bg-white dark:border-[#4b5563] dark:bg-[#1c1c1c]'
                  }`}
                >
                  {agreed && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-body text-muted text-[12px] leading-relaxed">
                  I agree to receive market briefings and related emails from NewEra365. I can
                  unsubscribe at any time.
                </span>
              </label>
            </form>
          )}
        </div>
      </section>

      {/* As read by */}
      <section className="bg-background px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body mb-4 text-[10px] uppercase tracking-[0.12em] text-[#9ca3af]">
            AS READ BY —
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {['Bloomberg', 'Reuters', 'FT', 'CityAM', "Barron's"].map((pub) => (
              <span
                key={pub}
                className="font-sans text-[14px] font-semibold text-[#d1d5db] dark:text-[#4b5563]"
              >
                {pub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-background px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body mb-4 text-[10px] uppercase tracking-[0.12em] text-[#9ca3af]">
            WHAT YOU GET
          </p>
          <div className="flex flex-col gap-4">
            {/* Preview 1 */}
            <div className="overflow-hidden rounded-[18px] bg-surface">
              <div className="h-[100px] bg-gradient-to-br from-[#0d2b1a] via-[#0a1f12] to-[#111111]" />
              <div className="p-4">
                <p className="font-body text-accent mb-1 text-[10px] uppercase tracking-[0.1em]">
                  WEEKLY MARKET FOCUS
                </p>
                <p className="text-foreground font-sans text-[14px] font-semibold">
                  The three trades our desk is watching this week
                </p>
                <p className="font-body text-muted mt-1 text-[12px] leading-relaxed">
                  Macro setups, key levels, and the catalyst that could move each one.
                </p>
              </div>
            </div>

            {/* Preview 2 */}
            <div className="rounded-[18px] bg-surface p-4">
              <p className="font-body mb-1 text-[10px] uppercase tracking-[0.1em] text-[#3B82F6]">
                EDUCATION DROPS
              </p>
              <p className="text-foreground font-sans text-[14px] font-semibold">
                One concept. Explained in under 2 minutes.
              </p>
              <p className="font-body text-muted mt-1 text-[12px] leading-relaxed">
                From reading order flow to understanding the carry trade — one topic per issue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="rounded-t-[32px] bg-[#111111] px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            Social proof
          </SectionKicker>
          <p className="mb-2 font-sans text-[38px] font-semibold leading-[1.1] text-white">
            47,000+
          </p>
          <p className="mb-8 font-sans text-[24px] text-white/60">traders read it weekly.</p>

          <div className="rounded-[18px] bg-white/[0.06] p-5">
            <p className="font-body mb-4 text-[14px] leading-[1.7] text-white/80">
              &ldquo;The Monday Briefing is the only newsletter I actually read. No fluff, no hype —
              just the calls the desk is actually making.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 flex h-9 w-9 items-center justify-center rounded-full">
                <span className="text-accent font-sans text-[12px] font-semibold">JR</span>
              </div>
              <div>
                <p className="font-sans text-[13px] font-semibold text-white">James R.</p>
                <p className="font-body text-[11px] text-white/40">Subscriber since 2022</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
