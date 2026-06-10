'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

/**
 * Official TradingView "Ticker Tape" embed widget.
 *
 * Replaces the previous hand-rolled CSS marquee (TickerStrip) which the client
 * flagged as looking glitchy/unprofessional. The widget renders its own
 * sparklines + live prices inside a sandboxed iframe and handles its own
 * scrolling, so RTL/LTR is driven by the `locale` config rather than CSS.
 *
 * Per the Figma design the ticker is a dark strip in both light and dark
 * themes (it sits on the near-black `ticker-bg` token), so the widget is
 * pinned to `colorTheme: 'dark'` with a transparent background.
 *
 * CSP: the loader script is served from s3.tradingview.com and the widget
 * iframe from s.tradingview.com — both are allowlisted in
 * apps/web/next.config.mjs.
 */

const SYMBOLS = [
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'FX:GBPUSD', title: 'GBP/USD' },
  { proName: 'FX:USDJPY', title: 'USD/JPY' },
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
];

export function TradingViewTicker() {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    // Reset on every locale change, HMR, or StrictMode double-invoke.
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'regular',
      colorTheme: 'dark',
      locale: locale === 'ar' ? 'ar_AE' : 'en',
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [mounted, locale]);

  return (
    <div
      className="bg-ticker-bg w-full overflow-hidden border-b border-[#1a1c22]"
      aria-label="Live market prices"
    >
      {/* Fixed height reserves space to avoid layout shift while the iframe loads. */}
      <div
        ref={containerRef}
        className="tradingview-widget-container h-[78px]"
        suppressHydrationWarning
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}
