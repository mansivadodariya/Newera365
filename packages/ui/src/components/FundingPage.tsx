'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
import { CountUp } from './CountUp';

// Desktop cards show a brand cover banner (matches the desktop Figma). The CMS
// `coverImage` upload wins when set; otherwise we fall back to a bundled brand
// default keyed by method. The cover is presented as a tactile bordered logo
// tile (grayscale → colour on hover).
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

/* ─── Flow beat icons (money in motion) ──────────────────────────────────── */

// Deposit — arrow falling into a tray (money in).
function IconDeposit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6 xl:h-8 xl:w-8">
      <path
        d="M12 3v9m0 0l-3.4-3.4M12 12l3.4-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5V17a2.5 2.5 0 002.5 2.5h11A2.5 2.5 0 0020 17v-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Trade — an upward price move.
function IconTrade() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6 xl:h-8 xl:w-8">
      <path
        d="M4 15.5l4.5-4.5 3 3L20 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 6H20v4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Withdraw — arrow lifting out of a tray (money out).
function IconWithdraw() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6 xl:h-8 xl:w-8">
      <path
        d="M12 12V3m0 0L8.6 6.4M12 3l3.4 3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5V17a2.5 2.5 0 002.5 2.5h11A2.5 2.5 0 0020 17v-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
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
  withdrawalStatValue?: string | null;
}

/* ─── Money in motion — Deposit → Trade → Withdraw ────────────────────────────
   The signature moment: three beats connected by a drawn SVG connector that
   traces in on scroll (stroke-dashoffset). Horizontal on desktop, vertical on
   mobile; the connector mirrors correctly in RTL so the flow always reads from
   the logical start to the logical end. A faint static track guarantees the
   line reads even before (or without) the draw, and reduced-motion draws it
   instantly — content visibility is never gated behind the animation. */
function MoneyFlow() {
  const t = useTranslations('funding');
  const railRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [drawn, setDrawn] = useState(false);
  // Measured geometry for the mobile vertical connector so it spans exactly
  // first-icon-centre → last-icon-centre (never overshooting past the last
  // step, whatever the description height / locale) and mirrors in RTL.
  const [vline, setVline] = useState<{ top: number; height: number; left: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      const first = iconRefs.current[0];
      const last = iconRefs.current[iconRefs.current.length - 1];
      if (!rail || !first || !last) return;
      const rb = rail.getBoundingClientRect();
      const fb = first.getBoundingClientRect();
      const lb = last.getBoundingClientRect();
      const top = fb.top - rb.top + fb.height / 2;
      const bottom = lb.top - rb.top + lb.height / 2;
      const left = fb.left - rb.left + fb.width / 2;
      setVline({ top, height: Math.max(0, bottom - top), left: left - 1 });
    };
    measure();
    const rail = railRef.current;
    const ro = rail && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(rail as Element);
    window.addEventListener('resize', measure);
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(true);
      return;
    }
    const el = railRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const beats = [
    { n: '01', label: t('flowStep1'), desc: t('flowStep1Desc'), icon: <IconDeposit /> },
    { n: '02', label: t('flowStep2'), desc: t('flowStep2Desc'), icon: <IconTrade /> },
    { n: '03', label: t('flowStep3'), desc: t('flowStep3Desc'), icon: <IconWithdraw /> },
  ];

  const drawTransition = 'stroke-dashoffset 1.15s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <div ref={railRef} className="relative">
      {/* Horizontal connector — desktop. Mirrors in RTL so it traces start → end. */}
      <div className="pointer-events-none absolute inset-x-0 top-[37px] hidden xl:block">
        <svg
          viewBox="0 0 1000 4"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          className="h-1 w-full rtl:-scale-x-100"
        >
          <line
            x1="120"
            y1="2"
            x2="880"
            y2="2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 9"
            className="stroke-[#C6D6CC] dark:stroke-white/15"
          />
          <line
            x1="120"
            y1="2"
            x2="880"
            y2="2"
            stroke="#00B050"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 800,
              strokeDashoffset: drawn ? 0 : 800,
              transition: drawTransition,
            }}
          />
        </svg>
      </div>

      {/* Vertical connector — mobile / tablet. Measured to span exactly the
          first icon centre → the last, so it never overshoots the last step. */}
      {vline && (
        <div className="xl:hidden" aria-hidden="true">
          <span
            className="pointer-events-none absolute w-[2px] rounded-full bg-[#C6D6CC] dark:bg-white/15"
            style={{ top: vline.top, height: vline.height, left: vline.left }}
          />
          <span
            className="bg-accent pointer-events-none absolute w-[2px] origin-top rounded-full"
            style={{
              top: vline.top,
              height: vline.height,
              left: vline.left,
              transform: drawn ? 'scaleY(1)' : 'scaleY(0)',
              transition: drawTransition,
            }}
          />
        </div>
      )}

      {/* Beats — stacked rows on mobile, centred columns on desktop */}
      <div className="flex flex-col gap-9 xl:grid xl:grid-cols-3 xl:gap-8">
        {beats.map((beat, i) => (
          <ScrollReveal key={beat.n} index={i} className="relative">
            <div className="flex items-start gap-4 xl:flex-col xl:items-center xl:gap-0 xl:text-center">
              <div
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                className="border-border text-accent relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[15px] border bg-white shadow-[0_6px_18px_-6px_rgba(8,19,12,0.22)] xl:h-[76px] xl:w-[76px] xl:rounded-[22px] dark:border-white/[0.08] dark:bg-[#14161c]"
              >
                {beat.icon}
              </div>
              <div className="xl:mt-6">
                <div className="mb-1.5 flex items-center gap-2 xl:justify-center">
                  <span
                    dir="ltr"
                    className="text-accent text-caption font-mono font-semibold tabular-nums"
                  >
                    {beat.n}
                  </span>
                  <p className="text-title text-foreground font-sans">{beat.label}</p>
                </div>
                <p className="font-body text-body text-muted max-w-[38ch] leading-[1.6] xl:mx-auto dark:text-white/60">
                  {beat.desc}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

function HeroContent({
  paymentMethods,
  withdrawalStatValue,
}: {
  paymentMethods?: CmsPaymentMethodItem[];
  withdrawalStatValue?: string | null;
}) {
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

  const methods = (paymentMethods ?? []).map((method) => ({
    key: String(method.id),
    icon: METHOD_TYPE_ICONS[method.methodType] ?? <IconCreditCard />,
    typeBadge: translateMethodType(method.methodType),
    name: locale === 'ar' ? (method.nameAr ?? method.name) : method.name,
    cover: method.coverImage || defaultCover(method.name, method.methodType),
    deposit: method.depositTime ?? '-',
    withdraw: method.withdrawalTime ?? '-',
    min: method.minDeposit ?? '-',
    fee: method.fee ?? '-',
    depositGreen: isGreenDepositValue(method.depositTime ?? ''),
    feeGreen: isGreenFeeValue(method.fee ?? ''),
  }));

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9 xl:px-[120px] xl:pb-8 xl:pt-[52px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <h1 className="text-display text-foreground font-sans [text-wrap:balance]">
              {t('heroLine1')} <span>{t('heroAccent')}</span>
            </h1>
            <p className="font-body text-lead text-muted mt-4 max-w-[540px] dark:text-white/70">
              {t('heroSubtitle')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Money in motion — the three-beat flow */}
      <section className="bg-transparent px-5 py-10 xl:px-[120px] xl:py-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-3">{t('flowKicker')}</SectionKicker>
            <h2 className="text-headline text-foreground font-sans [text-wrap:balance]">
              {t('flowHeading')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="border-border shadow-card mt-9 rounded-[28px] border bg-gradient-to-b from-[#E7F1EA] to-white px-6 py-12 xl:px-14 xl:py-16 dark:border-white/[0.06] dark:from-[#0e1218] dark:to-[#0a0c11] dark:shadow-none">
              <MoneyFlow />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Payment methods — tactile logo chips */}
      <section className="bg-transparent px-5 pb-12 xl:px-[120px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-5">{t('methodsKicker')}</SectionKicker>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {methods.length === 0 && (
              <p className="font-body text-body text-muted col-span-full py-12 text-center dark:text-white/60">
                {t('noMethods')}
              </p>
            )}
            {methods.map((method, i) => (
              <ScrollReveal key={method.key} index={i}>
                <div className="border-border shadow-card hover-lift group flex h-full flex-col gap-4 rounded-[20px] border bg-white p-5 dark:border-white/[0.06] dark:bg-[#14161c] dark:shadow-none">
                  {/* Cover tile — borderless, always in full colour (client
                      feedback); the banner fills the frame and zooms in slightly
                      on hover. */}
                  <div className="relative h-[92px] overflow-hidden rounded-[14px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={method.cover}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.05]"
                    />
                  </div>

                  {/* Name + type badge */}
                  <div className="flex items-center gap-2.5">
                    <span className="bg-accent/[0.08] text-accent group-hover:bg-accent flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] transition-colors duration-300 group-hover:text-white">
                      {method.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-body-lg truncate font-sans font-semibold tracking-[-0.17px]">
                        {method.name}
                      </p>
                      <span className="text-muted font-mono text-[10px] uppercase tracking-[1.2px] dark:text-white/50">
                        {method.typeBadge}
                      </span>
                    </div>
                  </div>

                  {/* Spec read-out — terminal ledger rows (hairline rules, mono
                      tabular values, best values in signal green), not a gray
                      stat grid. */}
                  <div className="border-border mt-auto border-t pt-1 dark:border-white/[0.08]">
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
                        className="border-border flex items-center justify-between gap-3 border-b py-[8px] last:border-b-0 dark:border-white/[0.05]"
                      >
                        <span className="text-muted font-mono text-[10px] uppercase tracking-[0.1em]">
                          {stat.label}
                        </span>
                        <span
                          dir="auto"
                          className={`font-mono text-[13px] font-semibold tabular-nums ${stat.green ? 'text-accent' : 'text-foreground'}`}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ink closer — the withdrawal cadence metric + why it's safe */}
      <section className="ink-band rounded-t-[32px] px-5 py-14 xl:px-[120px] xl:py-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Oversized withdrawal metric */}
          <ScrollReveal>
            <div className="xl:flex xl:items-end xl:justify-between xl:gap-12">
              <div>
                <SectionKicker className="mb-5">{t('withdrawMetricEyebrow')}</SectionKicker>
                <span
                  dir="ltr"
                  className="text-sheen text-metric block w-fit font-sans tabular-nums"
                >
                  <CountUp value={withdrawalStatValue ?? '24/7'} />
                </span>
              </div>
              <p className="font-body text-lead mt-4 max-w-[400px] text-white/60 xl:mt-0">
                {t('withdrawMetricLabel')}
              </p>
            </div>
          </ScrollReveal>

          {/* Why it's safe — static trust ledger (no hover: static info) */}
          <div className="mt-12 border-t border-white/10 pt-10 xl:mt-16 xl:pt-14">
            <ScrollReveal>
              <SectionKicker className="mb-3">{t('safetyKicker')}</SectionKicker>
              <h2 className="text-headline mb-7 font-sans text-white">{t('safetyHeading')}</h2>
            </ScrollReveal>
            <div className="grid gap-3 xl:grid-cols-2 xl:gap-5">
              {trustRows.map((row, i) => (
                <ScrollReveal key={row.key} index={i}>
                  <div className="hover:border-accent-bright/25 hover:bg-accent/[0.08] group flex h-full items-start gap-4 rounded-[14px] border border-white/[0.06] bg-white/[0.03] p-[18px] transition-colors duration-300">
                    <div className="bg-accent/[0.12] text-accent-bright group-hover:bg-accent/[0.25] flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] transition-colors duration-300">
                      {row.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-body-lg mb-1 font-sans font-semibold text-white">
                        {row.title}
                      </p>
                      <p className="font-body text-body leading-[1.55] text-white/55">{row.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function FundingPage({ paymentMethods, withdrawalStatValue }: FundingPageProps) {
  return <HeroContent paymentMethods={paymentMethods} withdrawalStatValue={withdrawalStatValue} />;
}
