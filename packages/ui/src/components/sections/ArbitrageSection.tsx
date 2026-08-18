'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useEffect } from 'react';
import { SectionKicker } from '../primitives/SectionKicker';
import { Spotlight } from '../primitives/Spotlight';

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
    <p ref={ref} className="text-accent font-sans text-[28px] font-bold tabular-nums leading-none">
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
          el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, border-color 0.3s ease, box-shadow 0.3s ease`;
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
      className="border-border shadow-card hover:border-accent/40 hover:shadow-card-lg flex flex-col gap-[6px] rounded-[16px] border bg-white p-[16px] transition-[border-color,box-shadow] duration-300 dark:border-white/[0.06] dark:bg-[#15171c]"
    >
      <AnimatedValue value={value} />
      <p className="text-foreground font-body text-[15px] font-semibold leading-tight">{label}</p>
      <p className="font-body text-caption text-muted leading-snug">{desc}</p>
    </div>
  );
}

/** A one-shot "order to fill" progress bar that completes when scrolled into
    view — motion that demonstrates the execution-speed claim, not decoration. */
function ExecutionBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const fill = el?.querySelector<HTMLElement>('[data-fill]');
    if (!el || !fill) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.style.width = '100%';
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          requestAnimationFrame(() => (fill.style.width = '100%'));
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="mt-6">
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/[0.10]">
        <div
          data-fill
          className="from-accent to-accent-bright h-full rounded-full bg-gradient-to-r transition-[width] duration-[1600ms] ease-out"
          style={{ width: '6%' }}
        />
      </div>
    </div>
  );
}

export function ArbitrageSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-transparent px-5 pb-10 pt-6 xl:px-[80px] xl:pb-14 xl:pt-8">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        {/* Brand-tinted wash band (never a flat black slab): paper deepens a
            step in light, a green-black breath over the canvas in dark. */}
        <div className="rounded-[32px] bg-gradient-to-b from-[#E3EDE7] to-[#F2F5F3] p-6 md:p-8 xl:p-12 dark:from-[#0D1512] dark:to-[#07090D]">
          <div className="grid gap-9 xl:grid-cols-[1.02fr_0.98fr] xl:items-stretch xl:gap-12">
            {/* Left: the claim + the stat ledger + the accounts strip */}
            <div className="flex flex-col">
              <SectionKicker>{t('arbKicker')}</SectionKicker>

              <h2 className="text-headline text-foreground mt-3 flex flex-col font-sans">
                <span>{t('arbHeadingLine1')}</span>
                <span>{t('arbHeadingAccent')}</span>
              </h2>

              <p className="font-body text-body text-muted mt-3 max-w-[52ch]">{t('arbDesc')}</p>

              {/* Supporting metrics ledger (the hero latency stat lives in the panel) */}
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {CARDS.slice(1).map((card, i) => (
                  <ArbCard
                    key={card.valueKey}
                    value={t(card.valueKey)}
                    label={t(card.labelKey)}
                    desc={t(card.descKey)}
                    index={i}
                  />
                ))}
              </div>

              <Link
                href={`/${locale}/trade/accounts`}
                className="bg-ink hover:border-accent/40 group mt-6 flex w-full items-center gap-[10px] rounded-[12px] border border-white/[0.08] px-[14px] py-[14px] transition-colors active:scale-[0.99] dark:border-white/[0.1]"
              >
                <span className="bg-accent-bright h-[8px] w-[8px] flex-shrink-0 rounded-full" />
                <p className="font-body flex-1 text-[12px] font-medium text-white">
                  {t('arbStrip')}
                </p>
                <svg
                  viewBox="0 0 24 24"
                  className="text-accent-bright h-[14px] w-[14px] flex-shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100"
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

            {/* Right: ink-art execution panel — cinematic terminal + live speed,
                with the signal glow tracking the cursor */}
            <Spotlight className="min-h-[300px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]">
              <Image
                src="/images/hero-terminal-macro.jpg"
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 1280px) 100vw, 40vw"
                className="object-cover object-[42%_30%] opacity-[0.5]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.95] via-[#03130B]/[0.58] to-[#03130B]/[0.28]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/[0.06]"
              />
              <div className="relative flex h-full min-h-[300px] flex-col justify-between gap-8 p-7 xl:p-8">
                <span className="text-eyebrow font-mono font-medium uppercase text-white">
                  {t('arbStat1Label')}
                </span>
                <div>
                  <span
                    dir="ltr"
                    className="text-sheen text-metric block w-fit font-sans tabular-nums leading-none"
                  >
                    {t('arbStat1Value')}
                  </span>
                  <p className="font-body text-body mt-2 text-white">{t('arbStat1Desc')}</p>
                  <ExecutionBar />
                </div>
              </div>
            </Spotlight>
          </div>
        </div>
      </div>
    </section>
  );
}
