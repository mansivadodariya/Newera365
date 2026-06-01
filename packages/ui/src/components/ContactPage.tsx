'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

interface Channel {
  id: string;
  label: string;
  value: string;
  meta: string;
  metaHighlight?: boolean;
  icon: ReactNode;
  action: string;
  isLink?: boolean;
}

const CHANNELS: Channel[] = [
  {
    id: 'email',
    label: 'Email us',
    value: 'hello@newera365.com',
    meta: '~ 2H REPLY',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    action: 'mailto:hello@newera365.com',
  },
  {
    id: 'call',
    label: 'Call',
    value: '+1 800 555 0136',
    meta: '24 / 5',
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
    action: 'tel:+18005550136',
  },
  {
    id: 'chat',
    label: 'Live chat',
    value: 'Open chat console',
    meta: 'Live now',
    metaHighlight: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3" fill="currentColor" />
      </svg>
    ),
    action: '/live-chat',
    isLink: true,
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

interface ContactPageProps {
  contactDetails?: CmsContactDetails;
}

export function ContactPage({ contactDetails }: ContactPageProps) {
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<Topic>('General');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero — 42px tracking-[-1.26px] per Figma */}
      <section className="bg-background rounded-b-[32px] px-5 pb-7 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px]">
            <span className="text-foreground">We&apos;re here.</span>
            <br />
            <span className="text-accent">Talk to us.</span>
          </h1>
          <p className="font-body text-muted mt-4 max-w-[320px] text-[14px] leading-[1.6]">
            Real people, fast answers. Pick the channel that fits — we monitor all of them around
            the clock.
          </p>
        </div>
      </section>

      {/* Channels — rounded-t-[32px] bg-background per Figma */}
      <section className="bg-background rounded-t-[32px] px-5 pb-8 pt-10 xl:pb-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            QUICK CHANNELS
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px]">
            Choose how to reach us.
          </h2>

          <div className="flex flex-col gap-[14px]">
            {CHANNELS.map((ch) =>
              ch.isLink ? (
                <Link
                  key={ch.id}
                  href={`/${locale}${ch.action}`}
                  className="bg-surface shadow-card flex items-center gap-[14px] rounded-[18px] px-[18px] py-[18px] dark:shadow-none"
                >
                  <div className="text-foreground dark:bg-surface-elevated flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[14px] bg-[#f2f2f4]">
                    {ch.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-sans text-[14px] font-semibold">
                      {ch.label}
                    </p>
                    <p className="font-body text-muted mt-[3px] text-[12.5px]">{ch.value}</p>
                  </div>
                  <span className="text-accent flex-shrink-0 font-mono text-[10px] tracking-[1px]">
                    ● ONLINE NOW
                  </span>
                </Link>
              ) : (
                <a
                  key={ch.id}
                  href={ch.action}
                  className="bg-surface shadow-card flex items-center gap-[14px] rounded-[18px] px-[18px] py-[18px] dark:shadow-none"
                >
                  <div className="text-foreground dark:bg-surface-elevated flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[14px] bg-[#f2f2f4]">
                    {ch.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-sans text-[14px] font-semibold">
                      {ch.label}
                    </p>
                    <p className="font-body text-muted mt-[3px] text-[12.5px]">{ch.value}</p>
                  </div>
                  <span className="text-muted flex-shrink-0 font-mono text-[10px] tracking-[1px]">
                    {ch.meta}
                  </span>
                </a>
              ),
            )}
          </div>

          {/* "Our Promise" dark card — bg-[#111] per Figma */}
          <div className="mt-[14px] rounded-[14px] bg-[#111111] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="bg-accent inline-block h-[7px] w-[7px] rounded-full" />
              <span className="font-body text-[10px] font-medium tracking-[1.4px] text-white">
                OUR PROMISE
              </span>
            </div>
            <p className="font-sans text-[16px] font-semibold text-white">
              Real humans. Fast answers.
            </p>
            <p className="font-body mt-1 text-[12px] leading-[1.5] text-[#b8bfcc]">
              Average first response under 6 minutes during market hours.
            </p>
            <div className="mt-3 flex gap-[24px]">
              {[
                { v: '< 6 min', l: 'First reply' },
                { v: '24/5', l: 'Always on' },
                { v: '8', l: 'Languages' },
              ].map((s) => (
                <div key={s.l} className="flex flex-col gap-[2px]">
                  <span className="font-sans text-[13px] font-semibold text-[#1ad966]">{s.v}</span>
                  <span className="font-body text-[9px] tracking-[0.54px] text-[#8c949e]">
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form section — gradient bg per Figma */}
      <section
        className="rounded-[32px] px-5 pb-9 pt-10"
        style={{ background: 'var(--gradient-features)' }}
      >
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            SEND A MESSAGE
          </SectionKicker>
          <h2 className="text-foreground mb-8 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px]">
            Write us a note.
          </h2>

          {submitted ? (
            <div className="bg-background flex flex-col items-center gap-4 rounded-[22px] px-6 py-10 text-center">
              <div className="bg-accent flex h-14 w-14 items-center justify-center rounded-full">
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
              <h2 className="text-foreground font-sans text-[22px] font-semibold">
                Message received
              </h2>
              <p className="font-body text-muted max-w-[240px] text-[13px] leading-relaxed">
                We&apos;ll get back to you shortly. Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
              {/* Mono labels + bg-[#fafaf9] inputs per Figma */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-name"
                  className="text-muted font-mono text-[10px] tracking-[1.5px]"
                >
                  YOUR NAME
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="font-body text-foreground bg-surface placeholder:text-muted w-full rounded-[14px] px-4 py-[14px] text-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-email"
                  className="text-muted font-mono text-[10px] tracking-[1.5px]"
                >
                  EMAIL
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@email.com"
                  className="font-body text-foreground bg-surface placeholder:text-muted w-full rounded-[14px] px-4 py-[14px] text-[14px] outline-none"
                />
              </div>

              {/* Topic — pill buttons per Figma (not dropdown) */}
              <div className="flex flex-col gap-2">
                <span className="text-muted font-mono text-[10px] tracking-[1.5px]">TOPIC</span>
                <div className="flex flex-wrap gap-[6px]">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`font-body rounded-full px-[14px] py-[8px] text-[12px] font-medium transition-colors ${
                        topic === t
                          ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                          : 'text-foreground dark:bg-surface-elevated bg-[#f2f2f4]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-message"
                  className="text-muted font-mono text-[10px] tracking-[1.5px]"
                >
                  MESSAGE
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind…"
                  className="font-body text-foreground bg-surface placeholder:text-muted w-full resize-none rounded-[14px] px-4 py-[14px] text-[14px] outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-accent font-body hover:bg-accent/90 flex items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
              >
                Send message
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M1 7h9.5M7 3.5l3.5 3.5L7 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <p className="font-body text-muted text-center text-[11px]">
                🔒 Your data is encrypted and never shared.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Offices — bg-black with logo top, cards bg-[rgba(255,255,255,0.04)] per Figma */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3 [&>span:first-child]:bg-white/40 [&>span:last-child]:text-white/60">
            OFFICES
          </SectionKicker>
          <h2 className="mb-7 font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.56px] text-white">
            Three cities.
            <br />
            One trading desk.
          </h2>
          <div className="flex flex-col gap-[10px]">
            {[
              { city: 'London', tag: 'HQ', address: '1 Finsbury Avenue, EC2M' },
              { city: 'Singapore', tag: 'APAC', address: '8 Marina View, #43-01' },
              { city: 'Dubai', tag: 'MENA', address: 'DIFC Gate Village, Tower 4' },
            ].map((office) => (
              <div
                key={office.city}
                className="flex items-center gap-[14px] rounded-[18px] bg-white/[0.04] p-5"
              >
                {/* Icon box — bg-[rgba(0,176,80,0.12)] rounded-[14px] per Figma */}
                <div className="bg-accent/[0.12] flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[14px]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M9 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                      stroke="#00b050"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M9 1C5.69 1 3 3.69 3 7c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z"
                      stroke="#00b050"
                      strokeWidth="1.3"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[17px] font-semibold text-white">
                      {office.city}
                    </span>
                    {/* Tag — bg-[rgba(242,242,244,0.08)] mono per Figma */}
                    <span className="rounded-full bg-[rgba(242,242,244,0.08)] px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px] text-white">
                      {office.tag}
                    </span>
                  </div>
                  <p className="font-body mt-1 text-[12px] text-white/50">{office.address}</p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="flex-shrink-0 text-white/50"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12L12 2M12 2H7M12 2v5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
