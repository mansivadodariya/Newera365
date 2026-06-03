'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const CARDS = [
  { valueKey: 'arbStat1Value', labelKey: 'arbStat1Label', descKey: 'arbStat1Desc' },
  { valueKey: 'arbStat2Value', labelKey: 'arbStat2Label', descKey: 'arbStat2Desc' },
  { valueKey: 'arbStat3Value', labelKey: 'arbStat3Label', descKey: 'arbStat3Desc' },
  { valueKey: 'arbStat4Value', labelKey: 'arbStat4Label', descKey: 'arbStat4Desc' },
] as const;

export function ArbitrageSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="bg-[#fafaf9] px-6 pb-12 pt-12 xl:px-[120px] xl:py-[60px] dark:bg-[#0f0f0f]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        {/* Kicker */}
        <div className="flex items-center gap-[6px]">
          <span className="h-px w-[18px] bg-[#6b7280]" />
          <span className="font-body text-[11px] font-medium uppercase tracking-[1.32px] text-[#6b7280]">
            {t('arbKicker')}
          </span>
        </div>

        <div className="h-[12px]" />

        {/* Heading — two lines stacked: dark + green */}
        <div className="flex flex-col font-sans text-[28px] font-semibold leading-tight tracking-[-0.56px] xl:text-[36px]">
          <span className="text-[#111] dark:text-white">{t('arbHeadingLine1')}</span>
          <span className="text-accent">{t('arbHeadingAccent')}</span>
        </div>

        <div className="h-[10px]" />

        {/* Description */}
        <p className="font-body text-[14px] leading-[22px] text-[#6b7280]">
          {t('arbDesc')}
        </p>

        <div className="h-[20px]" />

        {/* 4 rows — list format with dividers (mobile) / 4-col grid (desktop) */}
        <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-[20px]">
          {CARDS.map((card, i) => (
            <div key={card.valueKey}>
              <div className="flex flex-col gap-[8px] py-[16px] xl:rounded-[14px] xl:bg-white xl:p-[18px] xl:dark:bg-[#1c1c1c]">
                <p className="text-accent font-sans text-[22px] font-bold leading-none">
                  {t(card.valueKey)}
                </p>
                <p className="font-body text-[15px] font-semibold leading-tight text-[#111] dark:text-white">
                  {t(card.labelKey)}
                </p>
                <p className="font-body text-[13px] leading-[19px] text-[#6b7280]">
                  {t(card.descKey)}
                </p>
              </div>
              {i < CARDS.length - 1 && (
                <div className="h-px bg-[#d9dbe0] dark:bg-[#2a2a2a] xl:hidden" />
              )}
            </div>
          ))}
        </div>

        <div className="h-[10px]" />

        {/* Dark bottom strip */}
        <Link
          href={`/${locale}/trade/accounts`}
          className="flex w-full items-center gap-[10px] rounded-[12px] bg-[#111] px-[14px] py-[14px] transition-opacity hover:opacity-90 dark:bg-[#1c1c1c]"
        >
          {/* Green dot */}
          <span className="bg-accent h-[8px] w-[8px] flex-shrink-0 rounded-full" />
          <p className="font-body flex-1 text-[12px] font-medium text-white">{t('arbStrip')}</p>
          <span className="text-accent text-[14px] font-medium">→</span>
        </Link>
      </div>
    </section>
  );
}
