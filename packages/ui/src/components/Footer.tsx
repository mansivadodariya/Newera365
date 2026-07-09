'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export interface CmsFooterColumn {
  heading?: string | null;
  links?: { label?: string | null; href?: string | null; id?: string | null }[] | null;
  id?: string | null;
}

export interface CmsSocialLinks {
  facebook?: string | null;
  x?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  telegram?: string | null;
  tiktok?: string | null;
}

export interface CmsFooterContact {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  hours?: string | null;
}

function Footer({
  riskDisclaimer,
  socialLinks,
  contact,
  paymentMethods,
  regulatoryDisclosure,
  companyRegistration,
}: {
  riskDisclaimer?: string | null;
  socialLinks?: CmsSocialLinks;
  contact?: CmsFooterContact | null;
  paymentMethods?: string[];
  regulatoryDisclosure?: string | null;
  companyRegistration?: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations('footer');

  // Navigation columns are deliberately frontend-owned (client feedback round
  // 3): they must render even when the CMS is unreachable, and they change
  // with code (routes), not with content. CMS keeps the content-ish footer
  // fields (regulatory, contact, social, payments).
  const FOOTER_LINKS = [
    {
      heading: t('headingMarkets'),
      items: [
        { label: t('linkForex'), href: '/markets/forex' },
        { label: t('linkIndices'), href: '/markets/indices' },
        { label: t('linkCommodities'), href: '/markets/commodities' },
        { label: t('linkStocks'), href: '/markets/stocks' },
        { label: t('linkEtfs'), href: '/markets/etfs' },
        { label: t('linkCrypto'), href: '/markets/crypto' },
      ],
    },
    {
      heading: t('headingPlatform'),
      items: [
        { label: t('linkMT5'), href: '/platform/mt5' },
        { label: t('linkWebTrader'), href: '/platform/webtrader' },
        { label: t('linkTools'), href: '/tools' },
        { label: t('linkAiCrm'), href: '/ai-crm' },
      ],
    },
    {
      heading: t('headingCompany'),
      items: [
        { label: t('linkAbout'), href: '/company/about' },
      ],
    },
    {
      heading: t('headingSupport'),
      items: [
        { label: t('linkSupport'), href: '/support' },
        { label: t('linkLegal'), href: '/legal' },
      ],
    },
  ];

  const columns = FOOTER_LINKS;

  return (
    <footer className="bg-footer-bg px-5 pb-14 pt-12 text-white xl:px-[120px] xl:py-[64px]">
      <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
        {/* Top section — on desktop the brand block sits left and the link
            columns spread across the remaining width so the row fills 1200px. */}
        <div className="xl:mb-12 xl:flex xl:items-start xl:justify-between xl:gap-16">
          {/* Brand block: logo, tagline, social */}
          <div className="xl:w-[300px] xl:shrink-0">
            <Image
              src="/images/logo-dark.png"
              alt="NewEra365"
              width={133}
              height={26}
              className="mb-[18px]"
            />

            <p className="font-body mb-8 max-w-[300px] text-[14px] leading-[160%] text-[rgba(255,255,255,0.55)]">
              {t('tagline')}
            </p>

            {/* Social icons — Flaticon Uicons brand glyphs; conditional on CMS data */}
            {socialLinks && Object.values(socialLinks).some(Boolean) && (
              <div className="mb-8 flex items-center gap-4 xl:mb-0">
                {[
                  { key: 'facebook', href: socialLinks.facebook, icon: 'fi-brands-facebook' },
                  { key: 'x', href: socialLinks.x, icon: 'fi-brands-twitter-alt' },
                  { key: 'linkedin', href: socialLinks.linkedin, icon: 'fi-brands-linkedin' },
                  { key: 'instagram', href: socialLinks.instagram, icon: 'fi-brands-instagram' },
                  { key: 'youtube', href: socialLinks.youtube, icon: 'fi-brands-youtube' },
                  { key: 'telegram', href: socialLinks.telegram, icon: 'fi-brands-telegram' },
                  { key: 'tiktok', href: socialLinks.tiktok, icon: 'fi-brands-tik-tok' },
                ]
                  .filter((s) => Boolean(s.href))
                  .map((s) => (
                    <a
                      key={s.key}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.key.charAt(0).toUpperCase() + s.key.slice(1)}
                      className="inline-flex text-white/40 transition-colors hover:text-white/80"
                    >
                      <i className={`fi ${s.icon} text-[18px] leading-none`} aria-hidden="true" />
                    </a>
                  ))}
              </div>
            )}
          </div>

          {/* Link grid — 2 cols mobile, 4 cols desktop (fills the row) */}
          <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-8 xl:mb-0 xl:flex-1 xl:grid-cols-4 xl:gap-x-8">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="mb-3 font-mono text-[11px] font-medium uppercase leading-[100%] tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-[8px]">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href.startsWith('http') ? item.href : `/${locale}${item.href}`}
                        className="font-body text-[14px] font-normal leading-[110%] text-[rgba(255,255,255,0.85)] transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Thin divider — full width on desktop */}
        <div className="mb-8 h-px w-full bg-[rgba(255,255,255,0.08)]" />

        {/* Bottom legal zone (client feedback #6) — all CMS-driven. Two balanced
            columns: the regulatory pair (company registration + risk disclosure)
            on the left, the practical pair (contact + payment methods) on the
            right — so neither column leaves the dead space the single long risk
            block used to. Each block hides when its data is empty; the risk
            warning always shows. */}
        <div className="grid gap-x-16 gap-y-10 xl:grid-cols-2">
          {/* Regulatory: company registration + risk disclosure */}
          <div className="flex flex-col gap-8">
            {(regulatoryDisclosure || companyRegistration) && (
              <div>
                <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                  {t('regHeading')}
                </p>
                {regulatoryDisclosure && (
                  <p className="font-body mb-3 whitespace-pre-line text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.45)]">
                    {regulatoryDisclosure}
                  </p>
                )}
                {companyRegistration && (
                  <p className="font-body whitespace-pre-line text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.4)]">
                    {companyRegistration}
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                {t('riskDisclosure')}
              </p>
              <p className="font-body whitespace-pre-line text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.45)]">
                {riskDisclaimer ?? t('riskWarning')}
              </p>
            </div>
          </div>
          {/* Practical: contact details + payment methods */}
          <div className="flex flex-col gap-8">
            {(contact?.email || contact?.phone || contact?.address) && (
              <div>
                <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                  {t('contactHeading')}
                </p>
                <ul className="flex flex-col gap-2 text-[14px]">
                  {contact?.email && (
                    <li>
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-body text-[rgba(255,255,255,0.85)] transition-colors hover:text-white"
                      >
                        {contact.email}
                      </a>
                    </li>
                  )}
                  {contact?.phone && (
                    <li>
                      <a
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        className="font-body text-[rgba(255,255,255,0.85)] transition-colors hover:text-white"
                      >
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {contact?.hours && (
                    <li className="font-body text-[rgba(255,255,255,0.55)]">{contact.hours}</li>
                  )}
                  {contact?.address && (
                    <li className="font-body text-[rgba(255,255,255,0.55)]">{contact.address}</li>
                  )}
                </ul>
              </div>
            )}
            {paymentMethods && paymentMethods.length > 0 && (
              <div>
                <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                  {t('paymentsHeading')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((m) => (
                    <span
                      key={m}
                      className="font-body rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-[rgba(255,255,255,0.75)]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright row */}
        <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-5">
          <span className="font-mono text-[10px] font-medium tracking-[1.5px] text-[rgba(255,255,255,0.35)]">
            {t('copyright')}
          </span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
