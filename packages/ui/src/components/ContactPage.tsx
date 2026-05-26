'use client';

import { useState } from 'react';
import { SectionKicker } from './SectionKicker';

const TOPICS = [
  'Account opening',
  'Deposits & withdrawals',
  'Platform & technical',
  'Trading conditions',
  'Compliance & legal',
  'Other',
] as const;

const CONTACT_METHODS = [
  {
    label: 'Live Chat',
    desc: 'Instant answers during market hours.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 4h12a1 1 0 011 1v7a1 1 0 01-1 1H7l-4 3V5a1 1 0 011-1z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Email',
    desc: 'support@newera365.com — reply in 2h.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5" />
        <path d="M2 7l8 5 8-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    desc: 'Message us on WhatsApp anytime.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2C5.58 2 2 5.58 2 10c0 1.52.4 2.94 1.1 4.17L2 18l3.95-1.04A7.96 7.96 0 0010 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 8.5c.5 1.5 2.5 3 3.5 3.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export function ContactPage() {
  const [topic, setTopic] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <SectionKicker className="mb-4">Contact</SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05]">
            We&apos;re here to help.
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Reach us by form, chat or email. Our team responds within minutes during trading hours.
          </p>
        </div>
      </section>

      {/* Quick contact methods */}
      <section className="dark:bg-background bg-white px-5 pb-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <div className="flex flex-col gap-[10px]">
            {CONTACT_METHODS.map((m) => (
              <div
                key={m.label}
                className="dark:bg-surface flex items-center gap-4 rounded-[14px] bg-[#FAFAF9] px-4 py-4"
              >
                <div className="bg-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px]">
                  {m.icon}
                </div>
                <div>
                  <p className="text-foreground font-sans text-[14px] font-semibold">{m.label}</p>
                  <p className="font-body text-muted text-[12px]">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="dark:bg-background bg-white px-5 pb-12">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <SectionKicker className="mb-4">SEND A MESSAGE</SectionKicker>

          {submitted ? (
            <div className="dark:bg-surface flex flex-col items-center gap-4 rounded-[22px] bg-[#FAFAF9] px-6 py-10 text-center">
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
                We&apos;ll get back to you within 2 hours. Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
              {/* Topic selector */}
              <div>
                <label className="font-body text-muted mb-2 block text-[11px] uppercase tracking-[0.1em]">
                  Topic
                </label>
                <div className="flex flex-wrap gap-[8px]">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`font-body rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                        topic === t
                          ? 'bg-foreground text-background'
                          : 'text-foreground bg-[#f2f2f4] hover:bg-[#e5e5e5] dark:bg-[#1c1c1c] dark:hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="font-body text-muted mb-2 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Full name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="text-foreground dark:bg-surface font-body focus:border-accent w-full rounded-[14px] border border-[#e5e7eb] bg-[#FAFAF9] px-4 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="font-body text-muted mb-2 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Email address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="text-foreground dark:bg-surface font-body focus:border-accent w-full rounded-[14px] border border-[#e5e7eb] bg-[#FAFAF9] px-4 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a]"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="font-body text-muted mb-2 block text-[11px] uppercase tracking-[0.1em]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="text-foreground dark:bg-surface font-body focus:border-accent w-full resize-none rounded-[14px] border border-[#e5e7eb] bg-[#FAFAF9] px-4 py-[13px] text-[14px] placeholder:text-[#9ca3af] focus:outline-none dark:border-[#2a2a2a]"
                />
              </div>

              <button
                type="submit"
                className="bg-accent font-body hover:bg-accent-hover mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
              >
                Send message
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
    </>
  );
}
