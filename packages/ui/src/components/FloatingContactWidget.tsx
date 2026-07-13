'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { NO_CTA_SUFFIXES } from './SmartCtaBanner';

export interface FloatingContactWidgetProps {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
}

// Mirrors StickyCtaBar's threshold — on small screens the FAB lifts above the
// sticky CTA bar once it appears, so the two never overlap in the corner.
const BAR_SCROLL_THRESHOLD = 300;

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.9 7 9.9 9.9 0 0 1-9.9 9.87zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.48-8.41z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="m2 7 10 7L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * First-party floating contact launcher — chat-widget presentation (FAB →
 * mini chat card with support header + channel rows) without any third-party
 * script. Channels render only when their CMS value exists.
 */
export function FloatingContactWidget({ email, phone, whatsapp }: FloatingContactWidgetProps) {
  const t = useTranslations('contactWidget');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [liftAboveBar, setLiftAboveBar] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes and returns focus to the FAB; outside pointerdown closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        fabRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  // Move focus into the panel when it opens so keyboard users land inside it
  // (the panel precedes the FAB in the DOM). Focus the container — not the first
  // link — so mouse-opening doesn't paint a :focus-visible ring on a channel row.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // On small screens, lift above the sticky CTA bar once it appears (same
  // scroll threshold; the lift only applies below sm via responsive classes).
  const barOnThisRoute = !NO_CTA_SUFFIXES.some((s) => pathname.endsWith(s));
  useEffect(() => {
    if (!barOnThisRoute) return;
    const onScroll = () => setLiftAboveBar(window.scrollY > BAR_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [barOnThisRoute]);

  const waDigits = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : null;

  const rowClass =
    'focus-visible:ring-accent flex items-center gap-3 rounded-[12px] px-3 py-[10px] transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-white/[0.06]';
  const iconWrap =
    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent';

  return (
    <div
      ref={rootRef}
      className={`fixed end-4 z-30 transition-[bottom] duration-300 sm:bottom-6 sm:end-6 ${
        liftAboveBar && barOnThisRoute ? 'bottom-[84px]' : 'bottom-4'
      }`}
    >
      {/* Soft mount entrance (the FAB must never pop in), then a gentle
          attention nudge until first interaction — both motion-gated. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes ne-fab-in {
            from { opacity: 0; transform: scale(0.6) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes ne-fab-nudge {
            0%, 90%, 100% { transform: scale(1); }
            94% { transform: scale(1.05); }
            98% { transform: scale(0.99); }
          }
          .ne-fab-enter { animation: ne-fab-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
          .ne-fab-enter.ne-fab-nudge {
            animation:
              ne-fab-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both,
              ne-fab-nudge 9s ease-in-out 5s infinite;
          }
        }
      `}</style>

      {open && (
        <div
          ref={panelRef}
          id="contact-widget-panel"
          tabIndex={-1}
          className="motion-safe:animate-rise-in absolute bottom-[calc(100%+12px)] end-0 w-[280px] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_60px_-16px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:outline-none dark:border-white/[0.08] dark:bg-[#0f0f14]"
        >
          {/* Support header — brand gradient, chat-card presentation */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0c3b24] via-[#071510] to-black px-4 py-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 end-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(0,176,80,0.35),transparent_65%)] blur-xl"
            />
            <div className="relative flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                <ChatIcon />
                <span className="bg-accent absolute -bottom-0 -end-0 block h-2.5 w-2.5 rounded-full border-2 border-[#0a1f14]" />
              </span>
              <div>
                <p className="font-sans text-[14px] font-semibold leading-tight text-white">
                  {t('heading')}
                </p>
                <p className="font-body mt-[2px] text-[11px] text-white/60">{t('replyTime')}</p>
              </div>
            </div>
            <p className="font-body relative mt-3 inline-block rounded-[10px] rounded-es-[2px] bg-white/10 px-3 py-2 text-[12px] leading-snug text-white/90">
              {t('welcome')}
            </p>
          </div>

          {/* Channel rows — each renders only when configured */}
          <div className="flex flex-col gap-[2px] p-2">
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClass}
              >
                <span className={iconWrap}>
                  <WhatsAppIcon />
                </span>
                <span className="min-w-0">
                  <span className="font-body text-foreground block text-[13px] font-semibold">
                    {t('whatsapp')}
                  </span>
                  <span className="font-body text-muted block truncate text-[11px]">
                    {t('whatsappSub')}
                  </span>
                </span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className={rowClass}>
                <span className={iconWrap}>
                  <PhoneIcon />
                </span>
                <span className="min-w-0">
                  <span className="font-body text-foreground block text-[13px] font-semibold">
                    {t('phone')}
                  </span>
                  <span className="font-body text-muted block truncate text-[11px]" dir="ltr">
                    {phone}
                  </span>
                </span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className={rowClass}>
                <span className={iconWrap}>
                  <MailIcon />
                </span>
                <span className="min-w-0">
                  <span className="font-body text-foreground block text-[13px] font-semibold">
                    {t('email')}
                  </span>
                  <span className="font-body text-muted block truncate text-[11px]" dir="ltr">
                    {email}
                  </span>
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setEverOpened(true);
        }}
        aria-expanded={open}
        aria-controls="contact-widget-panel"
        aria-label={open ? t('close') : t('open')}
        className={`bg-accent hover:bg-accent-hover focus-visible:ring-accent ne-fab-enter ms-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_24px_-10px_rgba(0,176,80,0.8)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96] ${
          !everOpened && !open ? 'ne-fab-nudge' : ''
        }`}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
