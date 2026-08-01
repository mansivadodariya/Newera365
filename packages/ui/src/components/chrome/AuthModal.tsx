'use client';

import { useEffect, useRef, useState } from 'react';

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (type) {
      document.body.style.overflow = 'hidden';
      setStep(1);
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

      {isRegister ? (
        step === 1 ? (
          /* ── Step 1: Key Documents & Risk Disclosure (First Image) ── */
          <div className="relative z-10 flex w-full max-w-[720px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)] dark:bg-[#111316]">
            {/* Header Banner */}
            <div className="flex items-center justify-between bg-[#00B050] px-6 py-4">
              <h2 className="font-sans text-[18px] font-bold text-white md:text-[20px]">
                Trading Account Application Form
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="font-body text-foreground flex max-h-[65vh] flex-col gap-4 overflow-y-auto p-6 text-[13.5px] leading-relaxed md:p-8 md:text-[14px]">
              <p>
                Welcome to Newera365. Embark on a trading journey with our diverse offerings of
                Shares and CFDs across commodities, individual stocks, currencies, and indices.
                Prior to completing this application, please ensure that you&apos;ve read and
                understood our key documents:
              </p>

              <ul className="flex list-disc flex-col gap-1.5 pl-6 font-medium">
                <li>
                  <a
                    href="/legal?tab=terms"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    Terms of Business
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=execution"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    Order Execution Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=risk-disclosure"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    Risk Disclosure Statement
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=charges"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    Schedule of Charges
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=conflicts"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    Conflicts of Interest Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=privacy-policy"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>

              <p>
                These documents, along with your application, form our{' '}
                <a
                  href="/legal?tab=terms"
                  onClick={onClose}
                  className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                >
                  Client Agreement
                </a>
                . We will use the information you provide in this application form to assess the
                level of appropriateness of the products and services we provide to you. Please
                ensure all details are accurate and keep us updated if anything changes.
              </p>

              <p>
                <strong>
                  Remember, trading using leverage carries significant risks, including the
                  potential to lose more than your initial investment.
                </strong>{' '}
                If you&apos;re unsure about the nature of these risks, we encourage you to seek
                independent financial advice before proceeding.
              </p>

              <div className="mt-1">
                <p className="font-semibold">Are you ready to start?</p>
                <p className="text-muted mt-1">
                  Complete the application form below to commence your trading experience with
                  Newera365.
                </p>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="border-border/70 flex items-center justify-end border-t bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-[#16181d]">
              <button
                onClick={() => setStep(2)}
                className="font-body rounded-full bg-[#00B050] px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-[#00B050]/90 active:scale-[0.98]"
              >
                Start Application
              </button>
            </div>
          </div>
        ) : (
          /* ── Step 2: Account Credentials Form (Second Image) ── */
          <div className="relative z-10 w-full max-w-[380px] rounded-[24px] bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.22)] dark:bg-[#111316]">
            {/* Top Navigation Row */}
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-muted hover:text-foreground font-body flex items-center gap-1 text-[12px] font-medium transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-full bg-black/5 transition-colors dark:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>

            <h2 className="text-foreground text-title mb-1 font-sans">Open your account</h2>
            <p className="font-body text-muted mb-5 text-[13px] leading-[1.5]">
              Enjoy 0% hidden fees, backed by regulators, supporting your growth.
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
                className="font-body bg-accent hover:bg-accent-hover mt-1 flex h-[48px] w-full items-center justify-center rounded-full text-[14px] font-semibold text-white transition-colors"
              >
                Create account
              </button>
            </form>
          </div>
        )
      ) : (
        /* ── Demo Modal ── */
        <div className="relative z-10 w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.22)] dark:bg-[#111316]">
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/5 transition-colors dark:bg-white/10"
          >
            <CloseIcon />
          </button>

          <h2 className="text-foreground text-title mb-1 font-sans">Start a free demo</h2>
          <p className="font-body text-muted mb-5 text-[13px] leading-[1.5]">
            $50,000 virtual funds for demo, no deposit, no pressure.
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
              className="font-body bg-accent hover:bg-accent-hover mt-1 flex h-[48px] w-full items-center justify-center rounded-full text-[14px] font-semibold text-white transition-colors"
            >
              Launch demo account
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
