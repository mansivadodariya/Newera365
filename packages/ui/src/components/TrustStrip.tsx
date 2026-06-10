'use client';

import Image from 'next/image';

export interface TrustLogo {
  url: string;
  alt: string;
  href?: string | null;
}

interface TrustStripProps {
  logos?: TrustLogo[];
}

/**
 * Horizontal strip of social-proof / partner logos.
 * Driven by the `socialProofLogos` array in site-settings.
 * Renders nothing when no logos are provided.
 */
export function TrustStrip({ logos }: TrustStripProps) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="border-border bg-background border-b px-5 py-5">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <p className="font-body text-muted mb-4 text-center text-[10px] uppercase tracking-[0.14em]">
          As seen in
        </p>
        <div className="scrollbar-hide flex items-center justify-start gap-8 overflow-x-auto xl:justify-center">
          {logos.map((logo, i) => {
            const img = (
              <Image
                key={i}
                src={logo.url}
                alt={logo.alt}
                width={80}
                height={28}
                className="max-h-[28px] w-auto flex-shrink-0 object-contain opacity-50 grayscale transition-opacity hover:opacity-80"
              />
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
                  {img}
                </a>
              );
            }
            return (
              <span key={i} className="flex-shrink-0">
                {img}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
