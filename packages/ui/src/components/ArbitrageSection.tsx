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
    <section className="bg-[#fafaf9] px-5 pb-9 pt-10 xl:px-[120px] xl:py-[60px] dark:bg-[#0f0f0f]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        {/* Kicker */}
        <SectionKicker className="mb-4 text-[#6b7280]">{t('arbKicker')}</SectionKicker>

        {/* Heading — two phrases inline: dark + green */}
        <div className="mb-4 flex flex-wrap items-baseline gap-x-[10px] gap-y-1">
          <span className="font-sans text-[28px] font-semibold leading-tight tracking-[-0.56px] text-[#111] xl:text-[36px] dark:text-white">
            {t('arbHeadingLine1')}
          </span>
          <span className="text-accent font-sans text-[28px] font-semibold leading-tight tracking-[-0.56px] xl:text-[36px]">
            {t('arbHeadingAccent')}
          </span>
        </div>

        {/* Description */}
        <p className="font-body mb-8 max-w-[720px] text-[15px] leading-[24px] text-[#6b7280]">
          {t('arbDesc')}
        </p>

        {/* 4 cards — no icons, green accent value at top */}
        <div className="mb-6 grid grid-cols-2 gap-[10px] xl:grid-cols-4 xl:gap-[20px]">
          {CARDS.map((card) => (
            <div
              key={card.valueKey}
              className="flex flex-col gap-[12px] rounded-[14px] bg-white px-[24px] py-[28px] dark:bg-[#1c1c1c]"
            >
              {/* Green accent stat value */}
              <p className="text-accent font-sans text-[30px] font-bold leading-none">
                {t(card.valueKey)}
              </p>
              {/* Title */}
              <p className="font-sans text-[16px] font-semibold leading-tight text-[#111] dark:text-white">
                {t(card.labelKey)}
              </p>
              {/* Description */}
              <p className="font-body text-[13px] leading-[20px] text-[#6b7280]">
                {t(card.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Dark bottom strip */}
        <Link
          href={`/${locale}/trade/accounts`}
          className="flex w-full items-center gap-[16px] rounded-[12px] bg-[#111] px-[20px] py-[18px] transition-opacity hover:opacity-90"
        >
          {/* Green dot */}
          <span className="bg-accent h-[10px] w-[10px] flex-shrink-0 rounded-full" />
          <p className="font-body flex-1 text-[14px] font-medium text-white">{t('arbStrip')}</p>
          <span className="font-body text-accent text-[18px] font-medium">→</span>
        </Link>
      </div>
    </section>
  );
}
