'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRef, useEffect } from 'react';
import { SectionKicker } from './SectionKicker';

// Inline line icons (Lucide) drawn with `currentColor` so they invert with the
// theme — an <img> SVG would lock to its baked-in stroke and vanish on dark.
const stroke = {
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function IconExecution() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="h-6 w-6"
      stroke="currentColor"
      {...stroke}
      aria-hidden="true"
    >
      <path d="M23 26C23.5795 25.9992 24.1467 26.1663 24.6333 26.481C25.1198 26.7957 25.5048 27.2446 25.7417 27.7735C25.9787 28.3023 26.0573 28.8884 25.9683 29.461C25.8793 30.0336 25.6263 30.5681 25.24 31" />
      <path d="M28 22H28.01" />
      <path d="M30 18.54V14C30 13.4696 29.7893 12.9609 29.4142 12.5858C29.0391 12.2107 28.5304 12 28 12C27.4696 12 26.9609 12.2107 26.5858 12.5858C26.2107 12.9609 26 13.4696 26 14V17" />
      <path d="M17.612 22.524C17.3308 22.0263 16.9133 21.6194 16.4086 21.351C15.9039 21.0826 15.333 20.964 14.7632 21.0092C14.1934 21.0543 13.6483 21.2613 13.1922 21.6058C12.736 21.9503 12.3878 22.4179 12.1884 22.9536C11.9891 23.4893 11.947 24.0709 12.067 24.6297C12.187 25.1886 12.4642 25.7015 12.8659 26.1082C13.2676 26.5148 13.7772 26.7982 14.3345 26.925C14.8919 27.0519 15.4739 27.0168 16.012 26.824" />
      <path d="M28 30.9999H20C18.9391 30.9999 17.9217 30.5785 17.1716 29.8283C16.4214 29.0782 16 28.0608 16 26.9999C16 25.1434 16.7375 23.3629 18.0503 22.0502C19.363 20.7374 21.1435 19.9999 23 19.9999H23.2L19.6 16.3999C19.4161 16.2161 19.2703 15.9978 19.1708 15.7576C19.0713 15.5174 19.0201 15.2599 19.0201 14.9999C19.0201 14.4748 19.2287 13.9712 19.6 13.5999C19.9713 13.2286 20.4749 13.02 21 13.02C21.26 13.02 21.5175 13.0712 21.7577 13.1707C21.9979 13.2702 22.2161 13.4161 22.4 13.5999L25.8 16.9999H26C29.3 16.9999 32 19.6999 32 22.9999V23.9999C32 24.5304 31.7893 25.0391 31.4142 25.4141C31.0391 25.7892 30.5304 25.9999 30 25.9999H29C28.2044 25.9999 27.4413 26.316 26.8787 26.8786C26.3161 27.4412 26 28.2043 26 28.9999" />
    </svg>
  );
}

function IconSegregated() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      stroke="currentColor"
      {...stroke}
      aria-hidden="true"
    >
      <path d="M7 3.34V5C7 5.79565 7.31607 6.55871 7.87868 7.12132C8.44129 7.68393 9.20435 8 10 8" />
      <path d="M11 21.95V18C11 17.4696 10.7893 16.9609 10.4142 16.5858C10.0391 16.2107 9.53043 16 9 16C8.46957 16 7.96086 15.7893 7.58579 15.4142C7.21071 15.0391 7 14.5304 7 14V13C7 12.4696 6.78929 11.9609 6.41421 11.5858C6.03914 11.2107 5.53043 11 5 11H2.05" />
      <path d="M21.54 15H17C16.4696 15 15.9609 15.2107 15.5858 15.5858C15.2107 15.9609 15 16.4696 15 17V21.54" />
      <path d="M12 2C10.1518 2.00011 8.33975 2.51243 6.76508 3.48007C5.19041 4.4477 3.91472 5.83281 3.07962 7.4816C2.24452 9.1304 1.88269 10.9784 2.03431 12.8204C2.18593 14.6623 2.84506 16.4263 3.93853 17.9163C5.032 19.4064 6.51701 20.5642 8.22871 21.2614C9.94042 21.9585 11.8118 22.1676 13.6352 21.8655C15.4585 21.5634 17.1625 20.7619 18.5579 19.55C19.9533 18.338 20.9855 16.7631 21.54 15" />
      <path d="M20 6V4C20 3.46957 19.7893 2.96086 19.4142 2.58579C19.0391 2.21071 18.5304 2 18 2C17.4696 2 16.9609 2.21071 16.5858 2.58579C16.2107 2.96086 16 3.46957 16 4V6" />
      <path d="M21 6H15C14.4477 6 14 6.44772 14 7V10C14 10.5523 14.4477 11 15 11H21C21.5523 11 22 10.5523 22 10V7C22 6.44772 21.5523 6 21 6Z" />
    </svg>
  );
}

function IconSpreads() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      stroke="currentColor"
      {...stroke}
      aria-hidden="true"
    >
      <path d="M19 5L5 19" />
      <path d="M6.5 9C7.88071 9 9 7.88071 9 6.5C9 5.11929 7.88071 4 6.5 4C5.11929 4 4 5.11929 4 6.5C4 7.88071 5.11929 9 6.5 9Z" />
      <path d="M17.5 20C18.8807 20 20 18.8807 20 17.5C20 16.1193 18.8807 15 17.5 15C16.1193 15 15 16.1193 15 17.5C15 18.8807 16.1193 20 17.5 20Z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      stroke="currentColor"
      {...stroke}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const FEATURES = [
  { Icon: IconExecution, titleKey: 'whyExecutionTitle', descKey: 'whyExecutionDesc' },
  { Icon: IconSegregated, titleKey: 'whySegregatedTitle', descKey: 'whySegregatedDesc' },
  { Icon: IconSpreads, titleKey: 'whySpreadsTitle', descKey: 'whySpreadsDesc' },
  { Icon: IconClock, titleKey: 'whyClockTitle', descKey: 'whyClockDesc' },
] as const satisfies readonly { Icon: () => ReactNode; titleKey: string; descKey: string }[];

// Explicit "why us" reasons surfaced as a quick-scan checklist (client feedback
// #3 — the homepage should spell out the concrete USPs, not just imply them).
const USPS = ['usp1', 'usp2', 'usp3', 'usp4', 'usp5', 'usp6', 'usp7'] as const;

/** Individual feature card — animates in via Intersection Observer */
function FeatureCard({
  Icon,
  title,
  desc,
  index,
}: {
  Icon: () => ReactNode;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const delay = index * 80;
          el.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`;
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
      className="hover:border-accent/40 dark:hover:border-accent/30 group relative flex items-start gap-4 overflow-hidden rounded-[20px] border border-transparent bg-white p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,176,80,0.14)] dark:bg-[#111316] dark:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]"
    >
      {/* Accent wash that fades in on hover */}
      <span
        aria-hidden="true"
        className="bg-accent/10 pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="group-hover:bg-accent/10 group-hover:text-accent flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(166,166,166,0.08)] text-[#6b7280] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:text-white/60">
        <Icon />
      </div>
      <div className="relative flex-1 pt-0.5">
        <h3 className="mb-[6px] font-sans text-[16px] font-semibold leading-normal text-[#111] dark:text-white">
          {title}
        </h3>
        <p className="font-body text-[13px] leading-[1.5] text-[#6B7280] dark:text-[#B8BFCC]">
          {desc}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations('home');

  return (
    <section className="rounded-e-[32px] bg-gradient-to-l from-[#E2E2E2] to-white px-5 pb-9 pt-10 xl:pb-16 xl:pt-16 rtl:bg-gradient-to-r dark:from-[#1F262E] dark:to-[#000000]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-muted mb-4 [&>span:first-child]:bg-[#6b7280]">
          {t('whyKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-[10px] font-sans text-[32px] font-semibold leading-[108%] tracking-[-0.8px] xl:text-[36px]">
          {t('whyTitle')}
        </h2>

        <div className="h-[10px]" />

        <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2">
          {FEATURES.map(({ Icon, titleKey, descKey }, i) => (
            <FeatureCard
              key={titleKey}
              Icon={Icon}
              title={t(titleKey)}
              desc={t(descKey)}
              index={i}
            />
          ))}
        </div>

        {/* USP checklist — explicit reasons to choose NewEra365 (feedback #3). */}
        <div className="border-border mt-9 border-t pt-7">
          <p className="text-muted mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em]">
            {t('uspHeading')}
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
            {USPS.map((key) => (
              <li key={key} className="flex items-center gap-2.5">
                <span className="bg-accent/[0.12] text-accent flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 6.4l2.3 2.3L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="font-body text-foreground text-[14px] font-medium">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
