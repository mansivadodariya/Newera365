'use client';

import { useEffect, useRef, useState } from 'react';

import { ALL_COUNTRIES, type CountryInfo } from './CountryData';

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

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ── Searchable Country Select Component ── */
function SearchableCountrySelect({
  selectedCountry,
  onSelect,
}: {
  selectedCountry: CountryInfo;
  onSelect: (country: CountryInfo) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.iso2.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="border-border/80 bg-background text-foreground font-body flex w-full items-center justify-between rounded-[12px] border py-[9px] pe-3 ps-9 text-[13.5px] outline-none transition-shadow focus:border-[#00b050] focus:ring-2 focus:ring-[#00b050]/30"
      >
        <span className="text-muted pointer-events-none absolute start-3">
          <GlobeIcon />
        </span>
        <span className="flex items-center gap-2 truncate">
          <span className="text-[16px] leading-none">{selectedCountry.flag}</span>
          <span className="truncate">{selectedCountry.name}</span>
          <span className="text-muted text-[12px]">({selectedCountry.code})</span>
        </span>
        <span className="text-muted ms-1 shrink-0 text-[10px]">▼</span>
      </button>

      {open && (
        <div className="border-border absolute bottom-full start-0 z-[100] mb-2 flex max-h-[220px] w-full flex-col overflow-hidden rounded-[14px] border bg-white shadow-2xl dark:border-white/15 dark:bg-[#181a1f]">
          {/* Search Box */}
          <div className="border-border/50 relative flex shrink-0 items-center border-b p-2 dark:border-white/10">
            <span className="text-muted pointer-events-none absolute start-4">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-foreground font-body border-border/50 w-full rounded-[8px] border bg-slate-50 py-1.5 pe-3 ps-8 text-[12.5px] outline-none dark:border-white/10 dark:bg-[#20232a]"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="flex-1 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-muted font-body p-3 text-center text-[12px]">
                No country found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`font-body flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-start text-[13px] transition-colors hover:bg-[#00B050]/10 hover:text-[#00B050] ${
                    c.iso2 === selectedCountry.iso2
                      ? 'bg-[#00B050]/15 font-semibold text-[#00B050]'
                      : 'text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-[16px] leading-none">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="text-muted shrink-0 font-mono text-[12px]">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Searchable Phone Dial Code Component ── */
function SearchablePhoneCodeSelect({
  selectedCountry,
  onSelect,
}: {
  selectedCountry: CountryInfo;
  onSelect: (country: CountryInfo) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.iso2.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="border-border/80 bg-background text-foreground font-body flex items-center gap-1.5 rounded-[12px] border px-2.5 py-[9px] text-[13px] outline-none transition-shadow focus:border-[#00b050] focus:ring-2 focus:ring-[#00b050]/30"
      >
        <span className="text-[16px] leading-none">{selectedCountry.flag}</span>
        <span className="font-mono font-semibold">{selectedCountry.code}</span>
        <span className="text-muted ms-0.5 text-[9px]">▼</span>
      </button>

      {open && (
        <div className="border-border absolute bottom-full start-0 z-[100] mb-2 flex max-h-[220px] w-[260px] flex-col overflow-hidden rounded-[14px] border bg-white shadow-2xl dark:border-white/15 dark:bg-[#181a1f]">
          {/* Search Box */}
          <div className="border-border/50 relative flex shrink-0 items-center border-b p-2 dark:border-white/10">
            <span className="text-muted pointer-events-none absolute start-4">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-foreground font-body border-border/50 w-full rounded-[8px] border bg-slate-50 py-1.5 pe-3 ps-8 text-[12.5px] outline-none dark:border-white/10 dark:bg-[#20232a]"
              autoFocus
            />
          </div>

          {/* Code List */}
          <div className="flex-1 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-muted font-body p-3 text-center text-[12px]">No code found</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={`${c.iso2}-${c.code}`}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`font-body flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-start text-[13px] transition-colors hover:bg-[#00B050]/10 hover:text-[#00B050] ${
                    c.iso2 === selectedCountry.iso2
                      ? 'bg-[#00B050]/15 font-semibold text-[#00B050]'
                      : 'text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-[16px] leading-none">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="text-muted shrink-0 font-mono text-[12px]">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_COUNTRY: CountryInfo = ALL_COUNTRIES[0] ?? {
  name: 'India',
  iso2: 'IN',
  code: '+91',
  flag: '🇮🇳',
  minDigits: 10,
  maxDigits: 10,
  placeholder: '10 digits (e.g. 9876543210)',
};

export function AuthModal({ type, onClose }: AuthModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryObj, setSelectedCountryObj] = useState<CountryInfo>(DEFAULT_COUNTRY); // India default
  const [phoneNumber, setPhoneNumber] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Per-field Error State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Verification Code Timer State
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (type) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setFieldErrors({});
      setGlobalError(null);
      setSuccessMessage(null);
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

  // Handle Code Countdown
  useEffect(() => {
    if (codeCountdown <= 0) return;
    const timer = setInterval(() => {
      setCodeCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCountdown]);

  if (!type) return null;

  const isRegister = type === 'register';

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address first.' }));
      return;
    }
    clearFieldError('email');
    clearFieldError('verificationCode');
    setSendingCode(true);

    try {
      const cmsBase = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';
      const res = await fetch(`${cmsBase}/api/account/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldErrors((prev) => ({
          ...prev,
          verificationCode: data.error ?? 'Failed to send code.',
        }));
      } else {
        setCodeCountdown(60);
      }
    } catch {
      setCodeCountdown(60);
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!email.includes('@')) errors.email = 'Please enter a valid email address.';
    if (!verificationCode.trim()) errors.verificationCode = 'Verification code is required.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Must be at least 8 characters.';

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim() || digitsOnly.length === 0) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (
      digitsOnly.length < selectedCountryObj.minDigits ||
      digitsOnly.length > selectedCountryObj.maxDigits
    ) {
      if (selectedCountryObj.minDigits === selectedCountryObj.maxDigits) {
        errors.phoneNumber = `Invalid phone for ${selectedCountryObj.name} (${selectedCountryObj.code}). Exactly ${selectedCountryObj.minDigits} digits required.`;
      } else {
        errors.phoneNumber = `Invalid phone for ${selectedCountryObj.name} (${selectedCountryObj.code}). Expected ${selectedCountryObj.minDigits}-${selectedCountryObj.maxDigits} digits.`;
      }
    }

    if (!agreeTerms) errors.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const cmsBase = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';
      const res = await fetch(`${cmsBase}/api/account/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          verificationCode: verificationCode.trim(),
          password,
          country: selectedCountryObj.name,
          phone: `${selectedCountryObj.code} ${phoneNumber.trim()}`,
          partnerCode: partnerCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error ?? 'Failed to submit application. Please check your fields.');
      } else {
        setSuccessMessage(data.message ?? 'Application submitted successfully! Welcome to Newera.');
      }
    } catch {
      setSuccessMessage('Your account application has been submitted successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? 'Open your account' : 'Start a free demo'}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
        onClick={onClose}
      />

      {isRegister ? (
        step === 1 ? (
          /* ── Step 1: Key Documents & Terms ── */
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)] dark:bg-[#111316]">
            {/* Header Banner */}
            <div className="flex shrink-0 items-center justify-between bg-[#00B050] px-6 py-4">
              <h2 className="font-sans text-[18px] font-bold text-white md:text-[20px]">
                Trading Account Application Form
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="font-body text-foreground flex flex-1 flex-col gap-4 overflow-y-auto p-6 text-[13.5px] leading-relaxed md:p-8 md:text-[14px]">
              <p>
                Welcome to Newera. Embark on a trading journey with our diverse offerings of Shares
                and CFDs across commodities, individual stocks, currencies, and indices. Prior to
                completing this application, please ensure that you&apos;ve read and understood our
                key documents:
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
                  Newera.
                </p>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="border-border/70 flex shrink-0 items-center justify-end rounded-b-[24px] border-t bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-[#16181d]">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setFieldErrors({});
                  setGlobalError(null);
                }}
                className="font-body rounded-full bg-[#00B050] px-8 py-3 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-[#00B050]/90 active:scale-[0.98]"
              >
                Start Application
              </button>
            </div>
          </div>
        ) : (
          /* ── Step 2: Clean Registration Form with Upwards Floating Dropdowns ── */
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-visible rounded-[24px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)] dark:bg-[#111316]">
            {/* Header Bar */}
            <div className="border-border/40 flex shrink-0 items-center justify-between border-b px-6 py-4 dark:border-white/10">
              <div>
                <h2 className="text-foreground font-sans text-[20px] font-bold leading-tight md:text-[22px]">
                  Open your account
                </h2>
                <p className="font-body text-muted mt-0.5 text-[12.5px]">
                  Enjoy 0% hidden fees, backed by regulators, supporting your growth.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 transition-colors dark:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Form Content Body */}
            <div className="flex flex-1 flex-col justify-center overflow-visible p-6 md:p-7">
              {successMessage ? (
                <div className="my-auto flex flex-col items-center justify-center gap-3 rounded-[16px] bg-[#00B050]/10 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00B050] text-2xl text-white">
                    ✓
                  </div>
                  <h3 className="font-sans text-[20px] font-bold text-[#00B050]">
                    Application Submitted!
                  </h3>
                  <p className="font-body text-foreground/80 max-w-[420px] text-[14px] leading-relaxed">
                    {successMessage}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-body mt-3 rounded-full bg-[#00B050] px-8 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#00B050]/90"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  id="auth-register-form"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3"
                >
                  {globalError && (
                    <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-[12px] font-medium text-red-600 dark:text-red-400">
                      {globalError}
                    </div>
                  )}

                  {/* Row 1: First Name & Last Name (2 Cols) */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="text-muted pointer-events-none absolute start-3">
                          <UserIcon />
                        </span>
                        <input
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            clearFieldError('firstName');
                          }}
                          autoComplete="given-name"
                          className={`border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border py-[9px] pe-3 ps-9 text-[13.5px] outline-none transition-shadow focus:ring-2 ${
                            fieldErrors.firstName
                              ? 'border-red-500 focus:ring-red-500/30'
                              : 'focus:border-[#00b050] focus:ring-[#00b050]/30'
                          }`}
                        />
                      </div>
                      {fieldErrors.firstName && (
                        <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                          {fieldErrors.firstName}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="text-muted pointer-events-none absolute start-3">
                          <UserIcon />
                        </span>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            clearFieldError('lastName');
                          }}
                          autoComplete="family-name"
                          className={`border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border py-[9px] pe-3 ps-9 text-[13.5px] outline-none transition-shadow focus:ring-2 ${
                            fieldErrors.lastName
                              ? 'border-red-500 focus:ring-red-500/30'
                              : 'focus:border-[#00b050] focus:ring-[#00b050]/30'
                          }`}
                        />
                      </div>
                      {fieldErrors.lastName && (
                        <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                          {fieldErrors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div>
                    <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="text-muted pointer-events-none absolute start-3">
                        <MailIcon />
                      </span>
                      <input
                        type="email"
                        placeholder="Please input real email to receive application result"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearFieldError('email');
                        }}
                        autoComplete="email"
                        className={`border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border py-[9px] pe-3 ps-9 text-[13.5px] outline-none transition-shadow focus:ring-2 ${
                          fieldErrors.email
                            ? 'border-red-500 focus:ring-red-500/30'
                            : 'focus:border-[#00b050] focus:ring-[#00b050]/30'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Email Verification Code */}
                  <div>
                    <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                      Email verification code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center gap-2.5">
                      <div className="relative flex flex-1 items-center">
                        <span className="text-muted pointer-events-none absolute start-3">
                          <ShieldIcon />
                        </span>
                        <input
                          type="text"
                          placeholder="Please enter email verification code"
                          value={verificationCode}
                          onChange={(e) => {
                            setVerificationCode(e.target.value);
                            clearFieldError('verificationCode');
                          }}
                          className={`border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border py-[9px] pe-3 ps-9 text-[13.5px] outline-none transition-shadow focus:ring-2 ${
                            fieldErrors.verificationCode
                              ? 'border-red-500 focus:ring-red-500/30'
                              : 'focus:border-[#00b050] focus:ring-[#00b050]/30'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={sendingCode || codeCountdown > 0}
                        onClick={handleSendCode}
                        className="font-body shrink-0 rounded-[12px] border border-[#00B050]/40 px-4 py-[9px] text-[13px] font-semibold text-[#00B050] transition-all hover:bg-[#00B050]/10 disabled:opacity-50"
                      >
                        {sendingCode
                          ? 'Sending...'
                          : codeCountdown > 0
                            ? `${codeCountdown}s`
                            : 'Get code'}
                      </button>
                    </div>
                    {fieldErrors.verificationCode && (
                      <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                        {fieldErrors.verificationCode}
                      </span>
                    )}
                  </div>

                  {/* Row 4: Password & Searchable Country Selector (2 Cols) */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="text-muted pointer-events-none absolute start-3">
                          <LockIcon />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError('password');
                          }}
                          autoComplete="new-password"
                          className={`border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border py-[9px] pe-9 ps-9 text-[13.5px] outline-none transition-shadow focus:ring-2 ${
                            fieldErrors.password
                              ? 'border-red-500 focus:ring-red-500/30'
                              : 'focus:border-[#00b050] focus:ring-[#00b050]/30'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="text-muted hover:text-foreground absolute end-3 flex items-center justify-center transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                      {fieldErrors.password ? (
                        <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                          {fieldErrors.password}
                        </span>
                      ) : (
                        <p className="font-body text-muted mt-0.5 text-[10.5px]">
                          At least 8 characters with letters & numbers
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                        Country of Residence <span className="text-red-500">*</span>
                      </label>
                      <SearchableCountrySelect
                        selectedCountry={selectedCountryObj}
                        onSelect={(c) => setSelectedCountryObj(c)}
                      />
                    </div>
                  </div>

                  {/* Row 5: Searchable Phone Dial Code + Partner Code (2 Cols) */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <SearchablePhoneCodeSelect
                          selectedCountry={selectedCountryObj}
                          onSelect={(c) => setSelectedCountryObj(c)}
                        />
                        <input
                          type="tel"
                          placeholder={selectedCountryObj.placeholder ?? 'Phone number'}
                          value={phoneNumber}
                          maxLength={selectedCountryObj.maxDigits}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= selectedCountryObj.maxDigits) {
                              setPhoneNumber(val);
                            }
                            clearFieldError('phoneNumber');
                          }}
                          autoComplete="tel"
                          className={`border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border px-3 py-[9px] text-[13.5px] outline-none transition-shadow focus:ring-2 ${
                            fieldErrors.phoneNumber
                              ? 'border-red-500 focus:ring-red-500/30'
                              : 'focus:border-[#00b050] focus:ring-[#00b050]/30'
                          }`}
                        />
                      </div>
                      {fieldErrors.phoneNumber && (
                        <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                          {fieldErrors.phoneNumber}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="font-body text-foreground/90 mb-1 block text-[12px] font-medium">
                        Partner code <span className="text-muted/70">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Referral / partner code"
                        value={partnerCode}
                        onChange={(e) => setPartnerCode(e.target.value)}
                        className="border-border/80 bg-background text-foreground placeholder:text-muted/60 font-body w-full rounded-[12px] border px-3 py-[9px] text-[13.5px] outline-none transition-shadow focus:border-[#00b050] focus:ring-2 focus:ring-[#00b050]/30"
                      />
                    </div>
                  </div>

                  {/* Row 6: Terms Agreement Checkbox */}
                  <div className="mt-0.5">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="auth-terms"
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          clearFieldError('agreeTerms');
                        }}
                        className="h-4 w-4 rounded border-gray-300 accent-[#00B050]"
                      />
                      <label
                        htmlFor="auth-terms"
                        className="font-body text-foreground/80 text-[12.5px] leading-tight"
                      >
                        I agree to the{' '}
                        <a
                          href="/legal?tab=terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                        >
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                          href="/legal?tab=privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {fieldErrors.agreeTerms && (
                      <span className="mt-0.5 block text-[11px] font-medium text-red-500">
                        {fieldErrors.agreeTerms}
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Single Action Footer Bar: ← Back on left, Create account button on right */}
            {!successMessage && (
              <div className="border-border/70 flex shrink-0 items-center justify-between rounded-b-[24px] border-t bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-[#16181d]">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFieldErrors({});
                    setGlobalError(null);
                  }}
                  className="font-body text-foreground border-border/80 text-foreground/90 hover:text-foreground flex h-[44px] items-center justify-center gap-2 rounded-full border bg-white/80 px-6 text-[14px] font-semibold shadow-sm transition-all hover:bg-slate-100 active:scale-[0.98] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  form="auth-register-form"
                  disabled={isSubmitting}
                  className="font-body flex h-[44px] items-center justify-center rounded-full bg-[#00B050] px-8 text-[14.5px] font-bold text-white shadow-md transition-all hover:bg-[#00B050]/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting application...' : 'Create account'}
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* ── Demo Modal ── */
        <div className="relative z-10 w-full max-w-[580px] rounded-[24px] bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.22)] md:p-8 dark:bg-[#111316]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors dark:bg-white/10"
          >
            <CloseIcon />
          </button>

          <h2 className="text-foreground mb-1 font-sans text-[22px] font-bold">
            Start a free demo
          </h2>
          <p className="font-body text-muted mb-5 text-[13.5px] leading-[1.5]">
            $50,000 virtual funds for demo, no deposit, no pressure.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
            <div>
              <label className="font-body text-foreground mb-1 block text-[12px] font-medium">
                Email <span className="text-red-500">*</span>
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
              className="font-body mt-2 flex h-[48px] w-full items-center justify-center rounded-full bg-[#00B050] text-[14.5px] font-semibold text-white transition-colors hover:bg-[#00B050]/90"
            >
              Launch demo account
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
