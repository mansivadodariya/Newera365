'use client';

import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

// Desktop cards show a brand cover banner (matches the desktop Figma). The CMS
// `coverImage` upload wins when set; otherwise we fall back to a bundled brand
// default keyed by method. Mobile cards show the icon header instead (no cover).
function defaultCover(name: string, methodType: string): string {
  const n = name.toLowerCase();
  if (n.includes('skrill')) return '/images/payment/skrill.png';
  if (n.includes('neteller')) return '/images/payment/neteller.png';
  switch (methodType) {
    case 'card':
      return '/images/payment/card.png';
    case 'bank':
      return '/images/payment/bank.png';
    case 'crypto':
      return '/images/payment/crypto.png';
    case 'local':
      return '/images/payment/local.png';
    default:
      return '/images/payment/card.png';
  }
}

function IconCreditCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="10" width="4" height="1.5" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function IconLandmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L2 5.5h14L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="3" y="6.5" width="1.5" height="6" rx="0.4" fill="currentColor" />
      <rect x="7.25" y="6.5" width="1.5" height="6" rx="0.4" fill="currentColor" />
      <rect x="11.5" y="6.5" width="1.5" height="6" rx="0.4" fill="currentColor" />
      <path d="M2 13.5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="9" cy="9" rx="3" ry="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 9h13" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 6h12M3 12h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconBitcoin() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6 3.5h5a2.5 2.5 0 010 5H6m0 0h5.5a2.5 2.5 0 010 5H6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6 3.5v11M8 2.5v12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Icon map by methodType from CMS
const METHOD_TYPE_ICONS: Record<string, React.ReactNode> = {
  card: <IconCreditCard />,
  bank: <IconLandmark />,
  ewallet: <IconGlobe />,
  crypto: <IconBitcoin />,
  local: <IconLandmark />,
};

// Badge label by methodType
const METHOD_TYPE_LABELS: Record<string, string> = {
  card: 'CARD',
  bank: 'BANK',
  ewallet: 'E-WALLET',
  crypto: 'CRYPTO',
  local: 'REGIONAL',
};

function isGreenDepositValue(v: string) {
  const lower = v.toLowerCase();
  // Includes Arabic equivalents — depositTime is CMS-localized, so the value can
  // arrive as "فوري" / "نفس اليوم" instead of the English term.
  return (
    lower === 'instant' ||
    lower === 'same day' ||
    lower.startsWith('same-day') ||
    v === 'فوري' ||
    v === 'نفس اليوم'
  );
}

function isGreenFeeValue(v: string) {
  const lower = v.toLowerCase();
  // "مجاني" / "لا يوجد" = the Arabic localized "Free" / "None".
  return lower === 'free' || lower === 'none' || lower === 'لا يوجد' || v === 'مجاني';
}

const TRUST_ROWS = [
  {
    title: 'Segregated client funds',
    desc: 'Your money is held with tier-1 banks, separated from operating capital.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2L3 5.5V10c0 4 3 7 7 8 4-1 7-4 7-8V5.5L10 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 10l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'PCI-DSS Level 1',
    desc: 'Payment data is encrypted in transit and at rest, audited annually.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 9V6.5a3 3 0 016 0V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'No weekend hold',
    desc: 'Withdrawals are processed 7 days a week, including holidays.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v4l2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'No re-deposit fees',
    desc: 'Deposit and withdraw without per-transaction charges from us.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 10l4 4 8-8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export interface CmsPaymentMethodItem {
  id: number;
  name: string;
  nameAr?: string | null;
  methodType: string;
  depositTime?: string | null;
  withdrawalTime?: string | null;
  minDeposit?: string | null;
  fee?: string | null;
  notes?: string | null;
  coverImage?: string | null;
}

interface FundingPageProps {
  paymentMethods?: CmsPaymentMethodItem[];
}

function HeroContent({ paymentMethods }: { paymentMethods?: CmsPaymentMethodItem[] }) {
  const t = useTranslations('funding');
  const locale = useLocale();

  const translateMethodType = (type: string): string => {
    if (type === 'card') return t('typeCard');
    if (type === 'bank') return t('typeBank');
    if (type === 'ewallet') return t('typeEwallet');
    if (type === 'crypto') return t('typeCrypto');
    if (type === 'local') return t('typeLocal');
    return METHOD_TYPE_LABELS[type] ?? type.toUpperCase();
  };

  const translatePaymentValue = (v: string): string => {
    const lower = v.toLowerCase().trim();
    if (lower === 'instant') return t('valueInstant');
    if (lower === 'same day' || lower === 'same-day') return t('valueSameDay');
    if (lower === 'within 24h') return t('valueWithin24h');
    if (lower === '1-3 days') return t('valueDays13');
    if (lower === '2-5 days') return t('valueDays25');
    if (lower === '1-2 days') return t('valueDays12');
    if (lower.includes('30') && lower.includes('min')) return t('valueMin30');
    if (lower === 'free') return t('valueFree');
    if (lower.includes('network')) return t('valueNetworkOnly');
    return v;
  };

  const trustRows = [
    { key: 'seg1', icon: TRUST_ROWS[0]!.icon, title: t('seg1Title'), desc: t('seg1Desc') },
    { key: 'seg2', icon: TRUST_ROWS[1]!.icon, title: t('seg2Title'), desc: t('seg2Desc') },
    { key: 'seg3', icon: TRUST_ROWS[2]!.icon, title: t('seg3Title'), desc: t('seg3Desc') },
    { key: 'seg4', icon: TRUST_ROWS[3]!.icon, title: t('seg4Title'), desc: t('seg4Desc') },
  ];

  return (
    <>
      {/* Hero — visible on all screen sizes per Figma */}
      <section className="bg-transparent px-5 pb-5 pt-9 xl:px-[120px] xl:pb-8 xl:pt-[48px]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="font-sans text-[36px] font-semibold leading-[1.05] tracking-[-1.08px] xl:text-[48px] xl:tracking-[-1.44px]">
            <span className="text-foreground">{t('heroLine1')}&nbsp;—&nbsp;</span>
            <span className="text-[#00b050]">{t('heroAccent')}</span>
          </h1>
          <p className="font-body mt-4 max-w-[500px] text-[14px] leading-[1.55] text-[#6B7280] dark:text-[#B8BFCC]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-transparent px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted mb-5 text-[#6B7280] dark:text-[#B8BFCC]">
            {t('methodsKicker')}
          </SectionKicker>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {(!paymentMethods || paymentMethods.length === 0) && (
              <p className="font-body col-span-full py-12 text-center text-[14px] text-[#6B7280] dark:text-[#B8BFCC]">
                {t('noMethods')}
              </p>
            )}
            {(paymentMethods ?? [])
              .map((method) => ({
                key: String(method.id),
                icon: METHOD_TYPE_ICONS[method.methodType] ?? <IconCreditCard />,
                typeBadge: translateMethodType(method.methodType),
                name: locale === 'ar' ? (method.nameAr ?? method.name) : method.name,
                cover: method.coverImage || defaultCover(method.name, method.methodType),
                deposit: method.depositTime ?? '—',
                withdraw: method.withdrawalTime ?? '—',
                min: method.minDeposit ?? '—',
                fee: method.fee ?? '—',
                depositGreen: isGreenDepositValue(method.depositTime ?? ''),
                feeGreen: isGreenFeeValue(method.fee ?? ''),
              }))
              .map((method) => (
                <div
                  key={method.key}
                  className="bg-background shadow-card hover-lift flex flex-col gap-[14px] rounded-[18px] p-5 dark:shadow-none"
                >
                  {/* Mobile header: icon box + type pill (hidden on desktop, replaced by cover) */}
                  <div className="flex items-start justify-between md:hidden">
                    <div className="bg-accent/[0.08] text-accent flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px]">
                      {method.icon}
                    </div>
                    <span className="text-foreground dark:bg-surface-elevated dark:text-foreground rounded-full bg-[rgba(17,17,17,0.05)] px-[10px] py-[6px] font-mono text-[10px] tracking-[1.2px]">
                      {method.typeBadge}
                    </span>
                  </div>

                  {/* Desktop cover banner (matches desktop Figma) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={method.cover}
                    alt=""
                    aria-hidden="true"
                    className="hidden h-[110px] self-stretch rounded-[20px] bg-cover bg-center bg-no-repeat md:block"
                  />

                  {/* Name — Outfit SemiBold 17px tracking-[-0.17px] */}
                  <p className="text-foreground font-sans text-[17px] font-semibold tracking-[-0.17px]">
                    {method.name}
                  </p>

                  {/* Stats 2×2 grid — matches Figma rgba(17,17,17,0.08) wrapper, #fafaf9 cells */}
                  <div className="dark:bg-surface-elevated grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-[rgba(17,17,17,0.08)]">
                    {[
                      {
                        label: t('colDeposit'),
                        value: translatePaymentValue(method.deposit),
                        green: method.depositGreen,
                      },
                      {
                        label: t('colWithdraw'),
                        value: translatePaymentValue(method.withdraw),
                        green: false,
                      },
                      { label: t('colMin'), value: method.min, green: false },
                      {
                        label: t('colFee'),
                        value: translatePaymentValue(method.fee),
                        green: method.feeGreen,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="dark:bg-surface flex flex-col gap-[2px] bg-[#fafaf9] px-3 py-[10px]"
                      >
                        <span className="text-muted font-mono text-[9px] tracking-[1.08px]">
                          {stat.label}
                        </span>
                        <span
                          className={`font-sans text-[13px] font-semibold ${stat.green ? 'text-accent' : 'text-foreground'}`}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="rounded-t-[32px] bg-gradient-to-r from-[#000000] to-[#1F262E] px-5 py-10 xl:px-[120px] xl:py-14">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-3 [&>span:first-child]:bg-white/40 [&>span:last-child]:text-white/60">
            {t('safetyKicker')}
          </SectionKicker>
          <h2 className="mb-[22px] font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white">
            {t('safetyHeading')}
          </h2>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2 xl:gap-6">
            {trustRows.map((row) => (
              <div
                key={row.key}
                className="hover-lift flex items-start gap-[14px] rounded-[14px] bg-[rgba(255,255,255,0.04)] p-[18px]"
              >
                <div className="bg-accent/[0.12] text-accent flex h-[37px] w-[37px] flex-shrink-0 items-center justify-center rounded-[11px]">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <p className="mb-[5px] font-sans text-[14px] font-semibold text-white">
                    {row.title}
                  </p>
                  <p className="font-body text-[12.5px] leading-[1.5] text-white/55">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function FundingPage({ paymentMethods }: FundingPageProps) {
  return <HeroContent paymentMethods={paymentMethods} />;
}
