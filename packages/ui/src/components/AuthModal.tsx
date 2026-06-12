'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export type AuthModalType = 'register' | 'demo' | null;

interface AuthModalProps {
  type: AuthModalType;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M1 1L11 11M11 1L1 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthModal({ type, onClose }: AuthModalProps) {
  const locale = useLocale();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [type]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!type) return null;

  const isRegister = type === 'register';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? 'Open your account' : 'Start a free demo'}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.22)] dark:bg-[#111316]">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-muted hover:text-foreground absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/5 transition-colors dark:bg-white/10"
        >
          <CloseIcon />
        </button>

        {isRegister ? (
          /* ── Register ── */
          <>
            <h2 className="text-foreground mb-1 font-sans text-[20px] font-semibold">
              Open your account
            </h2>
            <p className="font-body text-muted mb-5 text-[13px] leading-[1.5]">
              Enjoy 0% hidden fees, backed by regulators — supporting your growth.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <div>
                <label className="font-body text-foreground mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  className="border-border bg-background text-foreground placeholder:text-muted font-body w-full rounded-[12px] border px-4 py-[11px] text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-[#00b050]/40"
                />
              </div>
              <div>
                <label className="font-body text-foreground mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@mail.com"
                  autoComplete="email"
                  className="border-border bg-background text-foreground placeholder:text-muted font-body w-full rounded-[12px] border px-4 py-[11px] text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-[#00b050]/40"
                />
              </div>
              <div>
                <label className="font-body text-foreground mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="border-border bg-background text-foreground placeholder:text-muted font-body w-full rounded-[12px] border px-4 py-[11px] text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-[#00b050]/40"
                />
              </div>

              <button
                type="submit"
                className="font-body mt-1 flex h-[48px] w-full items-center justify-center rounded-full bg-[#00b050] text-[14px] font-semibold text-white transition-colors hover:bg-[#009944]"
              >
                Create account
              </button>
            </form>

            <p className="font-body mt-4 text-center text-[12px] text-[#6b7280]">
              Already registered?{' '}
              <Link
                href={`/${locale}/login`}
                onClick={onClose}
                className="text-foreground font-medium underline-offset-2 hover:underline"
              >
                Log in
              </Link>
            </p>
          </>
        ) : (
          /* ── Demo ── */
          <>
            <h2 className="text-foreground mb-1 font-sans text-[20px] font-semibold">
              Start a free demo
            </h2>
            <p className="font-body text-muted mb-5 text-[13px] leading-[1.5]">
              $50,000 virtual funds for demo — no deposit, no pressure.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <div>
                <label className="font-body text-foreground mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@mail.com"
                  autoComplete="email"
                  className="border-border bg-background text-foreground placeholder:text-muted font-body w-full rounded-[12px] border px-4 py-[11px] text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-[#00b050]/40"
                />
              </div>

              <button
                type="submit"
                className="font-body mt-1 flex h-[48px] w-full items-center justify-center rounded-full bg-[#00b050] text-[14px] font-semibold text-white transition-colors hover:bg-[#009944]"
              >
                Launch demo account
              </button>
            </form>

            <p className="font-body mt-4 text-center text-[12px] text-[#6b7280]">
              Have an account?{' '}
              <Link
                href={`/${locale}/login`}
                onClick={onClose}
                className="text-foreground font-medium underline-offset-2 hover:underline"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
