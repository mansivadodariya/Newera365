'use client';

import { SectionKicker } from './SectionKicker';

const LEGAL_SECTIONS = [
  {
    title: 'Terms of Use',
    slug: 'terms',
    body: `By accessing and using the NewEra365 trading platform and website, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.

NewEra365 provides online trading services for financial instruments including foreign exchange, contracts for difference (CFDs), indices, commodities, stocks, ETFs and cryptocurrencies. Trading in these instruments carries a high level of risk and may not be suitable for all investors.`,
  },
  {
    title: 'Risk Disclosure',
    slug: 'risk',
    body: `Trading in financial instruments involves substantial risk of loss and is not suitable for all investors. The value of financial instruments can fall as well as rise. Past performance is not a reliable indicator of future performance.

Leverage products such as CFDs and margin FX can amplify gains as well as losses. You may lose all of your initial investment and may be required to make additional payments if your losses exceed your initial margin.

Before deciding to trade, carefully consider your investment objectives, level of experience, and risk appetite. Seek independent financial advice if necessary.`,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    body: `We are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.

We collect information you provide directly to us (such as name, email address, identification documents) and information collected automatically through your use of our services (such as IP address, browser type, usage data).

We use your information to provide and improve our services, comply with legal obligations, and communicate with you. We do not sell your personal data to third parties.`,
  },
  {
    title: 'AML Policy',
    slug: 'aml',
    body: `NewEra365 is committed to preventing money laundering and terrorist financing. We comply with all applicable Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations.

All clients are required to provide valid identification documents before their account can be approved. We conduct ongoing monitoring of transactions and may request additional documentation at any time.

Suspicious transactions are reported to the relevant financial intelligence units as required by law.`,
  },
  {
    title: 'Cookie Policy',
    slug: 'cookies',
    body: `We use cookies and similar tracking technologies to improve your browsing experience, analyse site traffic, and understand where our visitors are coming from.

Essential cookies are required for the platform to function. Analytics cookies help us understand how users interact with our services. You may disable non-essential cookies through your browser settings.`,
  },
] as const;

export function LegalPage() {
  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <SectionKicker className="mb-4">Legal</SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05]">
            Legal documents.
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Our terms, policies and regulatory disclosures — written in plain language.
          </p>
        </div>
      </section>

      {/* Legal sections */}
      {LEGAL_SECTIONS.map((section) => (
        <section key={section.slug} className="dark:bg-background bg-white px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
            <div className="dark:bg-surface rounded-[18px] bg-[#FAFAF9] p-5">
              <h2 className="text-foreground mb-3 font-sans text-[18px] font-semibold">
                {section.title}
              </h2>
              {section.body.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className="font-body text-muted mb-3 text-[13px] leading-[1.65] last:mb-0"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Last updated */}
      <section className="dark:bg-background bg-white px-5 pb-12">
        <div className="mx-auto max-w-[390px] md:max-w-2xl lg:max-w-5xl">
          <p className="font-body text-muted text-[11px]">
            Last updated: January 2026. Subject to change with 30 days notice.
          </p>
        </div>
      </section>
    </>
  );
}
