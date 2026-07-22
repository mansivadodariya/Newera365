'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SectionKicker } from '../primitives/SectionKicker';

/**
 * "What traders want" (#16) reframed as a live broker-selection audit. The seven
 * things traders actually weigh are a terminal ledger that verifies ITSELF: on
 * scroll it sweeps top-to-bottom, each row's tick draws in and the row lights
 * up, a progress spine fills down the start edge, and the mono readout climbs
 * 0/7 Scanning -> 7/7 Verified. It enacts "every box, checked" instead of just
 * asserting it. Purposeful motion only, reduced-motion safe (jumps to the
 * fully verified end state), no competitor comparison, no invented numbers.
 */
const ITEMS = [1, 2, 3, 4, 5, 6, 7] as const;
const TOTAL = ITEMS.length;
const STEP_MS = 200; // dwell between each row verifying
const LEAD_MS = 340; // beat before the first tick lands, after the panel reveals

/** A small checklist glyph for the audit header. */
function AuditGlyph() {
  return (
    <span className="text-accent" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2.4 4.3h5.4M2.4 8h5.4M2.4 11.7h3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M10.8 4.1l1.35 1.35L14.6 3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** The per-row status: a hollow ring that fills to an accent circle whose check
 *  draws itself in when the row verifies. */
function CheckGlyph({ verified }: { verified: boolean }) {
  return (
    <span
      className={[
        'relative mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border transition-all duration-300 motion-reduce:transition-none',
        verified
          ? 'bg-accent/[0.12] text-accent scale-100 border-transparent'
          : 'border-border scale-95 text-transparent dark:border-white/[0.14]',
      ].join(' ')}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 8.2l3.2 3.2L13 4.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 17,
            strokeDashoffset: verified ? 0 : 17,
            transition: 'stroke-dashoffset 0.42s ease 0.06s',
          }}
        />
      </svg>
    </span>
  );
}

function Row({
  want,
  proof,
  verified,
  isLast,
}: {
  want: string;
  proof: string;
  verified: boolean;
  isLast: boolean;
}) {
  return (
    <li
      className={[
        // Mobile: stacked. Each row separated by the ul's divide-y.
        'flex flex-col gap-1.5 px-5 py-[18px]',
        // Desktop: horizontal within the grid cell. Own bottom border replaces
        // divide-y (grid + divide-y misbehave — divide adds a top border to
        // every child, which stripes the top of every cell in the right column).
        'xl:border-border xl:flex-row xl:items-center xl:gap-6 xl:border-b xl:px-7 xl:last:border-b-0 xl:dark:border-white/[0.06]',
        // 7 items → 4 rows; item 7 spans both columns so it centers cleanly
        // instead of stranding empty space next to it.
        isLast ? 'xl:col-span-2 xl:justify-center' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-3.5 xl:w-[240px] xl:flex-shrink-0">
        <CheckGlyph verified={verified} />
        <p
          className={[
            'text-body-lg font-sans font-semibold leading-snug transition-colors duration-300 motion-reduce:transition-none',
            verified ? 'text-foreground' : 'text-muted dark:text-white/45',
          ].join(' ')}
        >
          {want}
        </p>
      </div>
      <p
        className={[
          'text-muted text-caption ps-[42px] font-mono tabular-nums leading-snug transition-opacity duration-300 motion-reduce:transition-none xl:flex-1 xl:ps-0 dark:text-white/55',
          verified ? 'opacity-100' : 'opacity-45',
        ].join(' ')}
      >
        {proof}
      </p>
    </li>
  );
}

export function CompareChecklistSection() {
  const t = useTranslations('home');
  const rows = ITEMS.map((n) => ({ want: t(`compareWant${n}`), proof: t(`compareProof${n}`) }));

  const panelRef = useRef<HTMLDivElement>(null);
  // Starts empty and fills as the audit runs. Reduced-motion jumps straight to
  // the verified end state (see effect). The panel lives mid-page, so the empty
  // start is off-screen; the scan plays as the user arrives.
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(TOTAL);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        for (let i = 1; i <= TOTAL; i++) {
          timers.push(setTimeout(() => setCount(i), LEAD_MS + i * STEP_MS));
        }
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const done = count >= TOTAL;
  const pct = (count / TOTAL) * 100;

  return (
    <section className="bg-transparent px-5 py-10 xl:px-[80px] xl:py-14">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <ScrollReveal>
          <SectionKicker className="mb-3">{t('compareKicker')}</SectionKicker>
          <div className="xl:flex xl:items-end xl:justify-between xl:gap-10">
            <h2 className="text-headline text-foreground font-sans [text-wrap:balance]">
              {t('compareHeadingLine1')} <span>{t('compareHeadingAccent')}</span>
            </h2>
            <p className="font-body text-body text-muted mt-3 max-w-[44ch] xl:mt-0 dark:text-white/60">
              {t('compareSubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div
            ref={panelRef}
            className="border-border shadow-card mt-8 overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.06] dark:bg-[#14161c] dark:shadow-none"
          >
            {/* Audit header: label + the live readout that climbs to 7/7 Verified */}
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-3.5 xl:px-7 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <AuditGlyph />
                <span className="text-eyebrow text-muted font-mono uppercase dark:text-white/50">
                  {t('compareLedgerLabel')}
                </span>
              </div>
              <div className="text-caption flex items-center gap-2 font-mono uppercase tracking-[0.08em]">
                <span
                  className={[
                    'h-1.5 w-1.5 rounded-full border transition-all duration-300',
                    done
                      ? 'bg-accent border-transparent shadow-[0_0_8px_1px_rgba(0,176,80,0.55)]'
                      : 'border-border bg-transparent dark:border-white/25',
                  ].join(' ')}
                />
                <span dir="ltr" className="text-foreground tabular-nums">
                  {count}/{TOTAL}
                </span>
                <span className={done ? 'text-accent' : 'text-muted dark:text-white/50'}>
                  {done ? t('compareStatusVerified') : t('compareStatusScanning')}
                </span>
              </div>
            </div>

            {/* Ledger + progress spine that fills top-to-bottom as rows verify */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="bg-border absolute inset-y-0 start-0 w-[2px] dark:bg-white/[0.08]"
              />
              <span
                aria-hidden="true"
                className="bg-accent absolute start-0 top-0 w-[2px] transition-[height] duration-300 ease-out motion-reduce:transition-none"
                style={{ height: `${pct}%` }}
              />
              <ul className="divide-border divide-y xl:grid xl:grid-cols-2 xl:gap-x-10 xl:divide-y-0 dark:divide-white/[0.06]">
                {rows.map((r, i) => (
                  <Row
                    key={r.want}
                    want={r.want}
                    proof={r.proof}
                    verified={i < count}
                    isLast={i === rows.length - 1}
                  />
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
