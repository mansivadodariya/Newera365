'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { NO_CTA_SUFFIXES } from '../sections/SmartCtaBanner';

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
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
 * script.
 */
export function FloatingContactWidget({
  email = 'info@newera365.com',
  phone = '+44 2070970860',
  whatsapp = '+18677783511',
}: FloatingContactWidgetProps) {
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
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // On small screens, lift above the sticky CTA bar once it appears
  const barOnThisRoute = Boolean(pathname) && !NO_CTA_SUFFIXES.some((s) => pathname?.endsWith(s));
  useEffect(() => {
    if (!barOnThisRoute) return;
    const onScroll = () => setLiftAboveBar(window.scrollY > BAR_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [barOnThisRoute]);

  const activeWhatsapp = whatsapp || '+18677783511';
  const activeEmail = email || 'info@newera365.com';
  const activePhone = phone || '+44 2070970860';
  const waDigits = activeWhatsapp.replace(/[^0-9]/g, '');

  const rowClass =
    'group/row flex items-center gap-3.5 rounded-[14px] p-2.5 transition-colors hover:bg-[#F0FBF5] dark:hover:bg-[#102a1d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#138346]';
  const iconWrap =
    'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F8EF] text-[#138346] dark:bg-[#113322] dark:text-[#1AD966] transition-transform group-hover/row:scale-105';

  return (
    <div
      ref={rootRef}
      className={`pointer-events-auto fixed end-4 right-4 z-[9999] transition-[bottom] duration-300 sm:bottom-6 sm:end-6 sm:right-6 rtl:end-auto rtl:left-4 rtl:right-auto rtl:sm:left-6 rtl:sm:right-auto ${
        liftAboveBar && barOnThisRoute ? 'bottom-[88px]' : 'bottom-4 sm:bottom-6'
      }`}
      style={{
        position: 'fixed',
        zIndex: 99999,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (prefers-reduced-motion: no-preference) {
          @keyframes ne-fab-in {
            from { opacity: 0; transform: scale(0.6) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes ne-fab-nudge {
            0%, 90%, 100% { transform: scale(1); }
            94% { transform: scale(1.06); }
            98% { transform: scale(0.98); }
          }
          .ne-fab-enter { animation: ne-fab-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
          .ne-fab-enter.ne-fab-nudge {
            animation:
              ne-fab-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both,
              ne-fab-nudge 9s ease-in-out 5s infinite;
          }
        }
      `,
        }}
      />

      {open && (
        <div
          ref={panelRef}
          id="contact-widget-panel"
          tabIndex={-1}
          className="motion-safe:animate-rise-in absolute bottom-[calc(100%+14px)] end-0 w-[310px] overflow-hidden rounded-[20px] border border-black/[0.08] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:outline-none dark:border-white/[0.08] dark:bg-[#0c120e]"
        >
          {/* Support header — deep dark emerald background */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#082417] via-[#051b11] to-[#03100a] p-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 end-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(26,217,102,0.3),transparent_65%)] blur-xl"
            />
            <div className="relative flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#123624] text-white">
                <ChatIcon />
                <span className="absolute -bottom-0.5 -end-0.5 block h-2.5 w-2.5 rounded-full bg-[#1AD966] shadow-[0_0_8px_1px_rgba(26,217,102,0.8)] ring-2 ring-[#082417]" />
              </span>
              <div>
                <p className="font-sans text-[15px] font-bold leading-tight text-white">
                  {t('heading')}
                </p>
                <p className="font-body mt-0.5 text-[12px] text-white/70">{t('replyTime')}</p>
              </div>
            </div>
            <p className="font-body relative mt-3.5 block rounded-[12px] border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[13px] leading-snug text-white/95">
              {t('welcome')}
            </p>
            <div className="relative mt-2.5 flex flex-col gap-1.5">
              <a
                href={`tel:${activePhone.replace(/\s+/g, '')}`}
                className="font-body flex items-center gap-2 rounded-lg px-1 py-0.5 text-[12px] text-white/80 transition-colors hover:text-white"
                dir="ltr"
              >
                <PhoneIcon />
                <span>{activePhone}</span>
              </a>
              <a
                href={`mailto:${activeEmail}`}
                className="font-body flex items-center gap-2 rounded-lg px-1 py-0.5 text-[12px] text-white/80 transition-colors hover:text-white"
                dir="ltr"
              >
                <MailIcon />
                <span>{activeEmail}</span>
              </a>
            </div>
          </div>

          {/* Channel rows */}
          <div className="flex flex-col gap-1 p-3">
            {/* WhatsApp Chat */}
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
                <span className="min-w-0 flex-1">
                  <span className="font-body block text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    {t('whatsapp')}
                  </span>
                  <span
                    className="font-body block truncate text-[12px] text-[#64748B] dark:text-[#94a3b8]"
                    dir="ltr"
                  >
                    {activeWhatsapp}
                  </span>
                </span>
              </a>
            )}

            {/* Phone Call */}
            {activePhone && (
              <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className={rowClass}>
                <span className={iconWrap}>
                  <PhoneIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-body block text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    {t('phone')}
                  </span>
                  <span
                    className="font-body block truncate text-[12px] text-[#64748B] dark:text-[#94a3b8]"
                    dir="ltr"
                  >
                    {activePhone}
                  </span>
                </span>
              </a>
            )}

            {/* Email */}
            {activeEmail && (
              <a href={`mailto:${activeEmail}`} className={rowClass}>
                <span className={iconWrap}>
                  <MailIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-body block text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    {t('email')}
                  </span>
                  <span
                    className="font-body block truncate text-[12px] text-[#64748B] dark:text-[#94a3b8]"
                    dir="ltr"
                  >
                    {activeEmail}
                  </span>
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat & Support FAB */}
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
        className="ms-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#138346] text-white shadow-[0_12px_28px_-6px_rgba(19,131,70,0.7)] transition-all duration-200 hover:scale-105 hover:bg-[#0f6f3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#138346] focus-visible:ring-offset-2 active:scale-[0.95]"
        style={{
          width: '56px',
          height: '56px',
          minWidth: '56px',
          minHeight: '56px',
          borderRadius: '50%',
          backgroundColor: '#00b050',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 12px 28px -6px rgba(19, 131, 70, 0.7)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}

export default FloatingContactWidget;
