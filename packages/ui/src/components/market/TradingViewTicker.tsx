'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

/**
 * Official TradingView "Ticker Tape" embed — live prices + sparklines rendered
 * in a sandboxed iframe (handles its own scrolling + RTL via the `locale`
 * config). Pinned to `colorTheme: 'dark'` + `isTransparent: false`.
 *
 * `isTransparent: false` is load-bearing: with `isTransparent: true` the embed
 * rendered an opaque WHITE (light-theme) strip even with colorTheme:'dark' and
 * the OS in dark mode (verified on the client's machine via DevTools). Making it
 * opaque forces TradingView to paint its own dark-theme background. globals.css
 * also forces `color-scheme: dark` + a dark background on the iframe.
 *
 * CSP: the loader script is served from s3.tradingview.com and the widget iframe
 * from s.tradingview.com — both allowlisted in apps/web/next.config.mjs.
 */
const SYMBOLS = [
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'FX:GBPUSD', title: 'GBP/USD' },
  { proName: 'FX:USDJPY', title: 'USD/JPY' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'TVC:SILVER', title: 'Silver' },
  { proName: 'TVC:USOIL', title: 'Oil' },
  // FOREXCOM: feed was retired by TradingView — OANDA CFDs replace it.
  { proName: 'OANDA:SPX500USD', title: 'S&P 500' },
  { proName: 'OANDA:NAS100USD', title: 'Nasdaq 100' },
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      // isTransparent stays false (true renders a light/transparent strip — the
      // tape has no black backing of its own). The tape's fixed dark blue-gray
      // (#131722) is crushed to true black by a CSS contrast filter on the iframe
      // in globals.css, since the ticker-tape embed ignores `backgroundColor`.
      isTransparent: false,
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
      className="relative w-full overflow-hidden border-b border-[#16181d] bg-black"
      aria-label="Live market prices"
    >
      {/* Reserve exactly the tape's rendered height (46px, measured) so the
          strip doesn't collapse thick→thin when the iframe swaps in. */}
      <div
        ref={containerRef}
        className="tradingview-widget-container tradingview-widget-container--ticker h-[46px]"
        suppressHydrationWarning
      >
        <div className="tradingview-widget-container__widget" />
      </div>
      {/* Click mask — sits above the iframe so pointer events never reach TradingView */}
      <div className="absolute inset-0 z-10 cursor-default" aria-hidden="true" />
    </div>
  );
}
