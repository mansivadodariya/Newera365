'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export interface TrustLogo {
  url: string;
  alt: string;
  href?: string | null;
}

interface TrustStripDemoProps {
  logos?: TrustLogo[];
}

/**
 * Social-proof strip: each outlet wordmark sits in its own bordered pill card
 * on a white surface (kept white in dark mode too, so brand logos stay
 * accurate). Driven by the `socialProofLogos` array in site-settings; renders
 * nothing when no logos are provided.
 */
export function TrustStripDemo({ logos }: TrustStripDemoProps) {
  const t = useTranslations('home');

  if (!logos || logos.length === 0) return null;

  return (
    <section className="border-border bg-background border-y px-5 py-7">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <p className="text-muted mb-5 text-center font-mono text-[10px] uppercase tracking-[0.22em]">
          {t('trustStripLabel')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 xl:gap-4">
          {logos.map((logo, i) => {
            const pill = (
              <span className="border-border flex h-[52px] min-w-[148px] items-center justify-center rounded-[14px] border bg-white px-6 transition-colors duration-200 hover:border-black/20 dark:border-white/[0.12] dark:hover:border-white/[0.28]">
                <Image
                  src={logo.url}
                  alt={logo.alt}
                  width={120}
                  height={28}
                  className="max-h-[24px] w-auto object-contain"
                />
              </span>
            );
            if (logo.href) {
              return (
                <a
                  key={i}
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  {pill}
                </a>
              );
            }
            return (
              <span key={i} className="flex-shrink-0">
                {pill}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
