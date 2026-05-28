'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const DEPARTMENTS = ['Account', 'Funding', 'Technical', 'Compliance', 'Other'] as const;

interface Channel {
  id: string;
  label: string;
  value: string;
  meta: string;
  metaHighlight?: boolean;
  icon: ReactNode;
  action: string;
  actionLabel: string;
  isLink?: boolean;
}

const CHANNELS: Channel[] = [
  {
    id: 'email',
    label: 'Email us',
    value: 'hello@newera365.com',
    meta: '5h average reply',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    action: 'mailto:hello@newera365.com',
    actionLabel: 'Send email →',
  },
  {
    id: 'call',
    label: 'Call us',
    value: '+44 20 333 0106',
    meta: 'Callback option available',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 2h3l1.5 4-2 1.5a11 11 0 004 4L13 9.5l4 1.5v3c0 2.5-5 4-10-1S2.5 4.5 5 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    action: 'tel:+442033300106',
    actionLabel: 'Call now →',
  },
  {
    id: 'chat',
    label: 'Live chat',
    value: 'Open chat console',
    meta: 'Live now',
    metaHighlight: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 4h12a1 1 0 011 1v7a1 1 0 01-1 1H7l-4 3V5a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    action: '/live-chat',
    actionLabel: 'Open chat →',
    isLink: true,
  },
];

const OFFICES = [
  {
    city: 'London',
    flag: '🇬🇧',
    address: '1 Canary Wharf, Level 39\nLondon, E14 5AB',
    hours: 'Mon–Fri 08:00–17:00 GMT',
  },
  {
    city: 'Singapore',
    flag: '🇸🇬',
    address: '1 Raffles Quay, #35-01\nSingapore 048583',
    hours: 'Mon–Fri 09:00–18:00 SGT',
  },
  {
    city: 'Dubai',
    flag: '🇦🇪',
    address: 'DIFC, Gate Village 3\nDubai, UAE',
    hours: 'Mon–Fri 09:00–18:00 GST',
  },
];

export function ContactPage() {
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState<string>('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05]">
            We&apos;re here.
            <br />
            <span className="text-accent">Talk to us.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Real people. Real answers. Pick the channel that fits — we monitor all of them around
            the clock.
          </p>
        </div>
      </section>

      {/* Quick channels */}
      <section className="dark:bg-background bg-white px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            Quick channels
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.025em]">
            Choose how to reach us.
          </h1>
          <div className="flex flex-col gap-[10px]">
            {CHANNELS.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center gap-4 rounded-[16px] bg-[#f9f9f9] px-4 py-4 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#111111] text-white dark:bg-white dark:text-[#111111]">
                  {ch.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-sans text-[13px] font-semibold">{ch.label}</p>
                  <p className="font-body text-muted truncate text-[12px]">{ch.value}</p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  {ch.metaHighlight ? (
                    <span className="bg-accent/10 font-body text-accent rounded-full px-2 py-[2px] text-[10px] font-semibold">
                      {ch.meta}
                    </span>
                  ) : (
                    <span className="font-body text-muted text-[10px]">{ch.meta}</span>
                  )}
                  {ch.isLink ? (
                    <Link
                      href={`/${locale}/live-chat`}
                      className="font-body text-accent text-[11px] font-medium hover:underline"
                    >
                      {ch.actionLabel}
                    </Link>
                  ) : (
                    <a
                      href={ch.action}
                      className="font-body text-accent text-[11px] font-medium hover:underline"
                    >
                      {ch.actionLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="gap-[14px] rounded-[32px] bg-[linear-gradient(180deg,#F8F8F7_0%,#FFFFFF_100%)] pb-[36px] pl-[20px] pr-[20px] pt-[40px] dark:bg-[linear-gradient(180deg,#07090D_0%,#07090D_100%)]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            Send us a message
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.025em]">
            Leave us a note.
          </h1>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 rounded-[22px] bg-[#f9f9f9] px-6 py-10 text-center dark:bg-[#1c1c1c]">
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
                We&apos;ll get back to you within 5 hours. Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="font-body text-muted mb-1.5 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="font-body text-foreground focus:border-accent w-full rounded-[14px] border border-[#e5e7eb] bg-[#f9f9f9] px-4 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a] dark:bg-[#1c1c1c]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="font-body text-muted mb-1.5 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="janedoe@gmail.com"
                  className="font-body text-foreground focus:border-accent w-full rounded-[14px] border border-[#e5e7eb] bg-[#f9f9f9] px-4 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a] dark:bg-[#1c1c1c]"
                />
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="contact-dept"
                  className="font-body text-muted mb-1.5 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Department
                </label>
                <select
                  id="contact-dept"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="font-body text-foreground focus:border-accent w-full appearance-none rounded-[14px] border border-[#e5e7eb] bg-[#f9f9f9] px-4 py-[13px] text-[14px] focus:outline-none dark:border-[#2a2a2a] dark:bg-[#1c1c1c]"
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="font-body text-muted mb-1.5 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Tell us what&apos;s on your mind
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="font-body text-foreground focus:border-accent w-full resize-none rounded-[14px] border border-[#e5e7eb] bg-[#f9f9f9] px-4 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a] dark:bg-[#1c1c1c]"
                />
              </div>

              <button
                type="submit"
                className="bg-accent font-body hover:bg-accent/90 mt-1 flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
              >
                Send message
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Three cities */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            OUR OFFICES
          </SectionKicker>
          <h2 className="mb-6 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            Three cities.
            <br />
            One trading desk.
          </h2>
          <div className="flex flex-col gap-3">
            {OFFICES.map((office) => (
              <div key={office.city} className="rounded-[16px] bg-white/[0.06] px-4 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[18px]">{office.flag}</span>
                  <span className="font-sans text-[14px] font-semibold text-white">
                    {office.city}
                  </span>
                  <span className="bg-accent/20 font-body text-accent ml-auto rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.08em]">
                    Open
                  </span>
                </div>
                <p className="font-body whitespace-pre-line text-[12px] leading-relaxed text-white/50">
                  {office.address}
                </p>
                <p className="font-body mt-1 text-[11px] text-white/30">{office.hours}</p>
              </div>
            ))}
          </div>
          <p className="font-body mt-5 text-[12px] text-white/30">
            Support open 24/5 · Trading hours
          </p>
        </div>
      </section>
    </>
  );
}
