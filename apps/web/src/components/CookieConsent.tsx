'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

export function CookieConsent() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  function accept(type: 'all' | 'necessary') {
    localStorage.setItem('cookie_consent', type);
    setVisible(false);
    window.dispatchEvent(new Event('cookie_consent_updated'));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={isAr ? 'إشعار ملفات تعريف الارتباط' : 'Cookie consent'}
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:border-[#1a1c22] dark:bg-[#0f0f14]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="font-body text-[13px] leading-relaxed text-[#374151] dark:text-white/70">
          {isAr
            ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة الموقع. يمكنك اختيار قبولها أو الاكتفاء بالضروري منها فقط.'
            : 'We use cookies to improve your experience and analyse site traffic. You can accept all or use only necessary cookies.'}{' '}
          <a
            href={`/${locale}/legal`}
            className="text-[#00b050] underline-offset-2 hover:underline"
          >
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </a>
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => accept('necessary')}
            className="rounded-full border border-[#d1d5db] bg-transparent px-4 py-2 font-body text-[13px] text-[#374151] transition-colors hover:bg-[#f3f4f6] dark:border-[#2a2d36] dark:text-white/70 dark:hover:bg-[#1a1c22]"
          >
            {isAr ? 'الضروري فقط' : 'Necessary only'}
          </button>
          <button
            onClick={() => accept('all')}
            className="rounded-full bg-[#00b050] px-5 py-2 font-body text-[13px] font-medium text-white transition-colors hover:bg-[#009040]"
          >
            {isAr ? 'قبول الكل' : 'Accept all'}
          </button>
        </div>
      </div>
    </div>
  );
}
