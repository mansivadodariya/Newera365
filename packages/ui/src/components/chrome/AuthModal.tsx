'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('auth');
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
              placeholder={t('searchCountryPlaceholder')}
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
                {t('noCountryFound')}
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
  const t = useTranslations('auth');
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
              placeholder={t('searchCodePlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-foreground font-body border-border/50 w-full rounded-[8px] border bg-slate-50 py-1.5 pe-3 ps-8 text-[12.5px] outline-none dark:border-white/10 dark:bg-[#20232a]"
              autoFocus
            />
          </div>

          {/* Code List */}
          <div className="flex-1 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-muted font-body p-3 text-center text-[12px]">
                {t('noCodeFound')}
              </div>
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
  const t = useTranslations('auth');
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [agreePolicies, setAgreePolicies] = useState(false);
  const [ackRisks, setAckRisks] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  const canStartApp = agreePolicies && ackRisks && confirmAccuracy;

  useEffect(() => {
    if (type) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setAgreePolicies(false);
      setAckRisks(false);
      setConfirmAccuracy(false);
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? t('openAccountTitle') : t('demoTitle')}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
        onClick={onClose}
      />

      {isRegister ? (
        step === 1 ? (
          /* ── Step 1: Key Documents & Disclosures ── */
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)] sm:max-h-[90vh] dark:bg-[#111316]">
            {/* Header Banner */}
            <div className="flex shrink-0 items-center justify-between bg-[#00B050] px-5 py-3.5 sm:px-6 sm:py-4">
              <h2 className="font-sans text-[17px] font-bold text-white sm:text-[18px] md:text-[20px]">
                {t('appTitle')}
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
            <div className="font-body text-foreground flex flex-1 flex-col gap-4 overflow-y-auto p-5 text-[13px] leading-relaxed sm:p-6 sm:text-[13.5px] md:p-8 md:text-[14px]">
              <p>{t('step1Welcome')}</p>

              <ul className="flex list-disc flex-col gap-1.5 pl-6 font-medium">
                <li>
                  <a
                    href="/legal?tab=terms"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    {t('termsOfBusiness')}
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=execution"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    {t('orderExecutionPolicy')}
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=risk-disclosure"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    {t('riskDisclosureStatement')}
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=charges"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    {t('scheduleOfCharges')}
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=conflicts"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    {t('conflictsOfInterestPolicy')}
                  </a>
                </li>
                <li>
                  <a
                    href="/legal?tab=privacy-policy"
                    onClick={onClose}
                    className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                  >
                    {t('privacyPolicy')}
                  </a>
                </li>
              </ul>

              <p>
                {t('step1AgreementDesc')}{' '}
                <a
                  href="/legal?tab=terms"
                  onClick={onClose}
                  className="font-semibold text-[#00B050] underline hover:text-[#00B050]/80"
                >
                  {t('clientAgreement')}
                </a>
                .
              </p>

              <p>
                <strong>{t('step1RiskWarning')}</strong>
              </p>

              {/* Mandatory Confirmations Framework */}
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-3.5">
                  <h3 className="text-foreground font-sans text-[15px] font-bold sm:text-[16px]">
                    {t('beforeYouContinue')}
                  </h3>
                  <p className="text-muted mt-0.5 text-[12.5px] sm:text-[13px]">
                    {t('reviewDocsCarefully')}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex cursor-pointer select-none items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreePolicies}
                      onChange={(e) => setAgreePolicies(e.target.checked)}
                      className="accent-accent text-accent focus:ring-accent mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-foreground text-[12.5px] leading-snug sm:text-[13px]">
                      {t('ackAgreeTermsAndPolicies')}
                    </span>
                  </label>

                  <label className="flex cursor-pointer select-none items-start gap-3">
                    <input
                      type="checkbox"
                      checked={ackRisks}
                      onChange={(e) => setAckRisks(e.target.checked)}
                      className="accent-accent text-accent focus:ring-accent mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-foreground text-[12.5px] leading-snug sm:text-[13px]">
                      {t('ackLeverageRisks')}
                    </span>
                  </label>

                  <label className="flex cursor-pointer select-none items-start gap-3">
                    <input
                      type="checkbox"
                      checked={confirmAccuracy}
                      onChange={(e) => setConfirmAccuracy(e.target.checked)}
                      className="accent-accent text-accent focus:ring-accent mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-foreground text-[12.5px] leading-snug sm:text-[13px]">
                      {t('ackInfoAccurate')}
                    </span>
                  </label>
                </div>

                {!canStartApp && (
                  <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <LockIcon />
                    <span>{t('lockConfirmRequired')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Bar: Start Application Button */}
            <div className="border-border/70 flex shrink-0 items-center justify-end rounded-b-[24px] border-t bg-slate-50/80 px-5 py-3.5 sm:px-6 sm:py-4 dark:border-white/10 dark:bg-[#16181d]">
              <button
                type="button"
                disabled={!canStartApp}
                onClick={() => setStep(2)}
                className={`font-body flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold text-white shadow-md transition-all sm:px-8 sm:py-3 sm:text-[15px] ${
                  canStartApp
                    ? 'cursor-pointer bg-[#00B050] hover:bg-[#00B050]/90 active:scale-[0.98]'
                    : 'cursor-not-allowed bg-gray-400 opacity-60 dark:bg-gray-600'
                }`}
              >
                <span>{t('startMyApplication')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Step 2: Register / Sign In Choice View ── */
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)] sm:max-h-[90vh] dark:bg-[#111316]">
            {/* Header Bar */}
            <div className="border-border/40 flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-6 sm:py-5 dark:border-white/10">
              <div>
                <h2 className="text-foreground font-sans text-[18px] font-bold leading-tight sm:text-[20px] md:text-[22px]">
                  {t('openAccountTitle')}
                </h2>
                <p className="font-body text-muted mt-0.5 text-[12px] sm:text-[12.5px]">
                  {t('openAccountSub')}
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

            {/* Body Content - Scrollable on small screens */}
            <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-5 text-center sm:gap-6 sm:p-8 sm:py-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00B050]/15 text-[#00B050] sm:h-16 sm:w-16">
                <svg
                  width="28"
                  height="28"
                  className="sm:h-8 sm:w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>

              <div className="max-w-[440px]">
                <h3 className="text-foreground font-sans text-[18px] font-bold sm:text-[20px] md:text-[22px]">
                  {t('readyToStart')}
                </h3>
                <p className="font-body text-muted mt-1.5 text-[13px] leading-relaxed sm:mt-2 sm:text-[14px]">
                  {t('readyToStartDesc')}
                </p>
              </div>

              <div className="mt-1 flex w-full flex-col gap-3 sm:mt-2 sm:max-w-[420px] sm:gap-3.5">
                <a
                  href="http://trade.newera365.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#00B050] text-[14px] font-bold text-white shadow-lg transition-all hover:bg-[#00B050]/90 active:scale-[0.98] sm:h-[50px] sm:text-[15px]"
                >
                  <span>{t('registerNow')}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>

                <a
                  href="http://trade.newera365.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-foreground border-border/80 text-foreground/90 hover:text-foreground flex h-[46px] w-full items-center justify-center gap-2 rounded-full border bg-slate-100/90 text-[13.5px] font-semibold shadow-sm transition-all hover:bg-slate-200 active:scale-[0.98] sm:h-[50px] sm:text-[14.5px] dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>{t('alreadyHaveAccount')}</span>
                </a>
              </div>
            </div>

            {/* Footer Bar with Back button */}
            <div className="border-border/70 flex shrink-0 items-center justify-between rounded-b-[24px] border-t bg-slate-50/80 px-5 py-3.5 sm:px-6 sm:py-4 dark:border-white/10 dark:bg-[#16181d]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-body text-foreground border-border/80 text-foreground/90 hover:text-foreground flex h-[38px] items-center justify-center gap-2 rounded-full border bg-white/90 px-5 text-[13.5px] font-semibold shadow-sm transition-all hover:bg-slate-100 active:scale-[0.98] sm:h-[42px] sm:px-6 sm:text-[14px] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
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
                <span>{t('back')}</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* ── Demo Modal ── */
        <div className="relative z-10 flex max-h-[85vh] w-full max-w-[580px] flex-col overflow-y-auto rounded-[24px] bg-white p-5 shadow-[0_32px_80px_rgba(0,0,0,0.22)] sm:max-h-[90vh] md:p-8 dark:bg-[#111316]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors dark:bg-white/10"
          >
            <CloseIcon />
          </button>

          <h2 className="text-foreground mb-1 font-sans text-[20px] font-bold sm:text-[22px]">
            {t('demoTitle')}
          </h2>
          <p className="font-body text-muted mb-5 text-[13px] leading-[1.5] sm:text-[13.5px]">
            {t('demoSub')}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = 'http://trade.newera365.com/register';
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="font-body text-foreground mb-1 block text-[12px] font-medium">
                {t('email')} <span className="text-red-500">*</span>
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
              className="font-body mt-2 flex h-[46px] w-full items-center justify-center rounded-full bg-[#00B050] text-[14px] font-semibold text-white transition-colors hover:bg-[#00B050]/90 sm:h-[48px] sm:text-[14.5px]"
            >
              {t('launchDemo')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
