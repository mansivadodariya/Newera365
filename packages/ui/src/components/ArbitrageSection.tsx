'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useEffect } from 'react';

const CARDS = [
  { valueKey: 'arbStat1Value', labelKey: 'arbStat1Label', descKey: 'arbStat1Desc' },
  { valueKey: 'arbStat2Value', labelKey: 'arbStat2Label', descKey: 'arbStat2Desc' },
  { valueKey: 'arbStat3Value', labelKey: 'arbStat3Label', descKey: 'arbStat3Desc' },
  { valueKey: 'arbStat4Value', labelKey: 'arbStat4Label', descKey: 'arbStat4Desc' },
] as const;

/** Animates numeric value from 0 using GSAP when element enters viewport */
function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Parse: e.g. "32%", "0.0 ms", "99.9%", "$1M+"
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (!match) return;

    const numStr = match[1] ?? match[0];
    const target = parseFloat(numStr);
    const decimals = (numStr.split('.')[1] ?? '').length;
    const prefix = value.slice(0, match.index ?? 0);
    const suffix = value.slice((match.index ?? 0) + numStr.length);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || triggered.current) return;
        triggered.current = true;
        observer.disconnect();

        import('gsap').then(({ gsap }) => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate() {
              if (el) el.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
            },
            onComplete() {
              if (el) el.textContent = value;
            },
          });
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [value]);

  return (
    <p ref={ref} className="text-accent font-sans text-[22px] font-bold leading-none">
      {value}
    </p>
  );
}

/** Individual stat card with fade-up entrance */
function ArbCard({
  value,
  label,
  desc,
  index,
}: {
  value: string;
  label: string;
  desc: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const delay = index * 90;
          el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-[8px] py-[16px] xl:rounded-[14px] xl:bg-white xl:p-[18px] xl:dark:bg-[#1c1c1c]"
    >
      <AnimatedValue value={value} />
      <p className="text-foreground font-body text-[15px] font-semibold leading-tight">{label}</p>
      <p className="font-body text-[13px] leading-[19px] text-[#6B7280] dark:text-[#B8BFCC]">
        {desc}
      </p>
    </div>
  );
}

export function ArbitrageSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-[#fafaf9] px-6 pb-12 pt-12 xl:px-[120px] xl:py-[60px] dark:bg-[#0f0f0f]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        {/* Kicker */}
        <div className="flex items-center gap-[6px]">
          <span className="h-px w-[18px] bg-[#6b7280]" />
          <span className="font-body text-[11px] font-medium uppercase tracking-[1.32px] text-[#6b7280]">
            {t('arbKicker')}
          </span>
        </div>

        <div className="h-[12px]" />

        {/* Heading — two lines stacked: dark + green */}
        <div className="flex flex-col font-sans text-[28px] font-semibold leading-tight tracking-[-0.56px] xl:text-[36px]">
          <span className="text-[#111] dark:text-white">{t('arbHeadingLine1')}</span>
          <span className="text-accent">{t('arbHeadingAccent')}</span>
        </div>

        <div className="h-[10px]" />

        {/* Description */}
        <p className="font-body text-[14px] leading-[22px] text-[#6B7280] dark:text-[#B8BFCC]">
          {t('arbDesc')}
        </p>

        <div className="h-[20px]" />

        {/* 4 rows — list format with dividers (mobile) / 4-col grid (desktop) */}
        <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-[20px]">
          {CARDS.map((card, i) => (
            <div key={card.valueKey}>
              <ArbCard
                value={t(card.valueKey)}
                label={t(card.labelKey)}
                desc={t(card.descKey)}
                index={i}
              />
              {i < CARDS.length - 1 && (
                <div className="h-px bg-[#d9dbe0] xl:hidden dark:bg-[#2a2a2a]" />
              )}
            </div>
          ))}
        </div>

        <div className="h-[10px]" />

        {/* Dark bottom strip */}
        <Link
          href={`/${locale}/trade/accounts`}
          className="flex w-full items-center gap-[10px] rounded-[12px] bg-[#111] px-[14px] py-[14px] transition-opacity hover:opacity-90 dark:bg-[#1c1c1c]"
        >
          {/* Green dot */}
          <span className="bg-accent h-[8px] w-[8px] flex-shrink-0 rounded-full" />
          <p className="font-body flex-1 text-[12px] font-medium text-white">{t('arbStrip')}</p>
          <svg
            viewBox="0 0 24 24"
            className="text-accent h-[14px] w-[14px] flex-shrink-0 rtl:-scale-x-100"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
