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

// Call + WhatsApp quick-action glyphs shown beside the footer phone number.
// ponytail: mirror FloatingContactWidget's PhoneIcon/WhatsAppIcon so both
// surfaces read identically; kept local to avoid a shared export for two SVGs.
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.9 7 9.9 9.9 0 0 1-9.9 9.87zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.48-8.41z" />
    </svg>
  );
}

function Footer({
  riskDisclaimer,
  socialLinks,
  contact,
  whatsapp,
  paymentMethods,
  regulatoryDisclosure,
  companyRegistration,
}: {
  riskDisclaimer?: string | null;
  socialLinks?: CmsSocialLinks;
  contact?: CmsFooterContact | null;
  whatsapp?: string | null;
  paymentMethods?: string[];
  regulatoryDisclosure?: string | null;
  companyRegistration?: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations('footer');
  // WhatsApp mirrors the floating widget's whatsappNumber (same source of
  // truth); wa.me wants digits only. Null → the WhatsApp glyph is hidden.
  const waDigits = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : null;

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
        { label: t('linkSupport'), href: '/support' },
        { label: t('linkLegal'), href: '/legal' },
      ],
    },
  ];

  const columns = FOOTER_LINKS;

  return (
    <footer className="bg-footer-bg px-5 pb-[112px] pt-12 text-white xl:px-[120px] xl:pb-[112px] xl:pt-[64px]">
      <div className="mx-auto max-w-[390px] xl:max-w-[1200px]">
        {/* Top section — on desktop the brand block sits left and the link
            columns spread across the remaining width so the row fills 1200px. */}
        <div className="xl:mb-12 xl:flex xl:items-start xl:justify-between xl:gap-16">
          {/* Brand block: logo, tagline, social */}
          <div className="xl:w-[300px] xl:shrink-0">
            <Image
              src="/images/logo-dark.png"
              alt="Newera365"
              width={133}
              height={26}
              className="mb-[18px]"
            />

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
          <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-8 xl:mb-0 xl:flex-1 xl:grid-cols-3 xl:gap-x-8">
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
                  <p className="font-body mb-3 hyphens-auto whitespace-pre-line text-justify text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.45)]">
                    {regulatoryDisclosure}
                  </p>
                )}
                {companyRegistration && (
                  <p className="font-body hyphens-auto whitespace-pre-line text-justify text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.4)]">
                    {companyRegistration}
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
                {t('riskDisclosure')}
              </p>
              <p className="font-body hyphens-auto whitespace-pre-line text-justify text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.45)]">
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
                    <li className="flex items-center gap-2.5">
                      {/* Call + WhatsApp quick actions prefix the number —
                          monochrome to match the social row above; WhatsApp
                          hides when unset. */}
                      <span className="flex items-center gap-2">
                        <a
                          href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                          aria-label={t('callAria')}
                          className="inline-flex text-white/40 transition-colors hover:text-white/80"
                        >
                          <PhoneIcon />
                        </a>
                        {waDigits && (
                          <a
                            href={`https://wa.me/${waDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('whatsappAria')}
                            className="inline-flex text-white/40 transition-colors hover:text-white/80"
                          >
                            <WhatsAppIcon />
                          </a>
                        )}
                      </span>
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
                    <li className="font-body whitespace-pre-line leading-relaxed text-[rgba(255,255,255,0.55)]">
                      {contact.address}
                    </li>
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
                      className="font-body rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] font-normal text-[rgba(255,255,255,0.8)]"
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
