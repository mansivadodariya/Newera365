'use client';

import Image from 'next/image';

export interface TrustLogo {
  url: string;
  alt: string;
  href?: string | null;
}

interface TrustStripDemoProps {
  logos?: TrustLogo[];
}

/**
 * Evenly-spaced, larger grayscale social-proof / partner logos that lift to
 * full colour on hover. Driven by the `socialProofLogos` array in site-settings;
 * renders nothing when no logos are provided.
 */
export function TrustStripDemo({ logos }: TrustStripDemoProps) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="border-border bg-background border-y px-5 py-6">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <p className="text-muted mb-5 text-center font-mono text-[10px] uppercase tracking-[0.22em]">
          As seen in
        </p>
        <div className="scrollbar-hide flex items-center justify-start gap-10 overflow-x-auto xl:justify-center xl:gap-14">
          {logos.map((logo, i) => {
            const img = (
              <Image
                src={logo.url}
                alt={logo.alt}
                width={92}
                height={30}
                className="max-h-[30px] w-auto flex-shrink-0 object-contain opacity-45 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
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
