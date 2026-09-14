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

// WhatsApp quick-action glyph shown in the footer.

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.9 7 9.9 9.9 0 0 1-9.9 9.87zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.48-8.41z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function renderRegulatoryContent(content: string) {
  const blocks = content
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const isHeading = (text: string) => {
    if (/^#{1,4}\s+/.test(text)) return true;
    const lower = text.toLowerCase();
    return (
      (lower.includes('saint lucia') && lower.length < 80) ||
      (lower.includes('south africa') && lower.length < 80) ||
      lower === 'regional restrictions' ||
      text === 'القيود الإقليمية' ||
      (text.includes('سانت لوسيا') && text.length < 80) ||
      (text.includes('جنوب أفريقيا') && text.length < 80)
    );
  };

  return blocks.map((block, idx) => {
    if (isHeading(block)) {
      const headingText = block.replace(/^#{1,4}\s+/, '');
      return (
        <p
          key={idx}
          className={`${idx === 0 ? 'mt-0' : 'mt-6'} mb-2 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`}
        >
          {headingText}
        </p>
      );
    }
    return (
      <p
        key={idx}
        className="font-body mb-3 w-full hyphens-auto whitespace-pre-line text-justify text-[12px] font-normal leading-[165%] text-[rgba(255,255,255,0.45)]"
      >
        {block}
      </p>
    );
  });
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
  const activeEmail = 'info@newera365.com';
  const activePhone = '+44 2070970860';
  const phoneDigits = activePhone.replace(/[^0-9+]/g, '');

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
        // { label: t('linkAiCrm'), href: '/ai-crm' },
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
          {/* Brand block: logo, company info, registered address, social */}
          <div className="xl:w-[320px] xl:shrink-0">
            <Image
              src="/logo-dark.png"
              alt="Newera"
              width={140}
              height={32}
              className="mb-[18px] h-7 w-auto object-contain"
            />

            <div className="font-body mb-6 flex flex-col gap-3 text-[13px] leading-[150%]">
              <div>
                <p className="text-[13px] font-medium text-white">{t('entityName')}</p>
                <p className="text-[12px] text-[rgba(255,255,255,0.6)]">{t('regNumber')}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[1px] text-[rgba(255,255,255,0.4)]">
                  {t('regAddressHeading')}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[rgba(255,255,255,0.6)]">
                  {t('regAddress')}
                </p>
              </div>
            </div>

            {/* Social icons — Flaticon Uicons brand glyphs; conditional on CMS data */}
            {socialLinks && Object.values(socialLinks).some(Boolean) && (
              <div className="mb-6 flex items-center gap-4">
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

            {/* GET IN TOUCH */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[1px] text-[rgba(255,255,255,0.4)]">
                {t('contactHeading')}
              </p>
              <div className="flex flex-col gap-1.5 text-[13px]">
                <a
                  href={`mailto:${activeEmail}`}
                  className="font-body text-[rgba(255,255,255,0.85)] transition-colors hover:text-white"
                >
                  {activeEmail}
                </a>
                {activePhone && (
                  <a
                    href={`tel:${phoneDigits}`}
                    aria-label={t('callAria')}
                    className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.85)] transition-colors hover:text-white"
                  >
                    <span className="text-white/40">
                      <PhoneIcon />
                    </span>
                    <span dir="ltr">{activePhone}</span>
                  </a>
                )}
              </div>
            </div>
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

        {/* Full-width High Risk Investment Warning section */}
        <div className="mb-8 w-full">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
            {t('riskDisclosure')}
          </p>
          <div className="font-body w-full hyphens-auto whitespace-pre-line text-justify text-[12px] font-normal leading-[170%] text-[rgba(255,255,255,0.45)]">
            {t('riskWarning')}
          </div>
        </div>

        {/* Full-width Regulatory & Legal Information section */}
        <div className="mb-8 w-full">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
            {t('regHeading')}
          </p>
          <div>{renderRegulatoryContent(t('regBody'))}</div>
        </div>

        {/* Practical: Payment methods if provided */}
        {paymentMethods && paymentMethods.length > 0 && (
          <div className="mb-8">
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

        {/* Copyright row */}
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-5">
          <span className="font-mono text-[10px] font-medium tracking-[1.5px] text-[rgba(255,255,255,0.35)]">
            {t('copyright')}
          </span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
