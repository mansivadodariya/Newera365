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
 * White-flash fix: TradingView's iframe paints its *default* (white) document
 * background for a beat before its dark-theme CSS applies — intermittent on
 * load timing, which the client saw as the ticker "rendering white in dark
 * mode sometimes". We keep the iframe hidden (opacity 0) until it fires `load`
 * (+ a short settle delay) so that during the flash window only the dark
 * `ticker-bg` strip behind it shows. A CSS fallback in globals.css also forces
 * the iframe element's own background to the dark token.
 *
 * CSP: the loader script is served from s3.tradingview.com and the widget
 * iframe from s.tradingview.com — both are allowlisted in
 * apps/web/next.config.mjs.
 */

// Trimmed to 3 instruments (was 5/8) so the tape reads calmer / more premium —
// the TradingView embed exposes no scroll-speed knob, so fewer symbols is the
// lever for the client's "ticker is too fast / distracting" note (feedback #7).
// One per asset class: major FX, metal, index.
const SYMBOLS = [
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
];

export function TradingViewTicker() {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    setReady(false);

    // Reset on every locale change, HMR, or StrictMode double-invoke.
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
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

    // Reveal the widget only after its iframe has loaded so the white pre-CSS
    // flash happens while the iframe is still invisible (dark strip shows through).
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setReady(true);
    };

    const observer = new MutationObserver(() => {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        // Give TradingView a brief moment to paint its dark theme over the
        // default white document before fading the iframe in.
        iframe.addEventListener('load', () => window.setTimeout(reveal, 300), { once: true });
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    // Fallback: never leave the ticker hidden if `load` doesn't fire.
    const fallback = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      container.innerHTML = '';
    };
  }, [mounted, locale]);

  return (
    <div
      className="bg-ticker-bg relative w-full overflow-hidden border-b border-[#1a1c22]"
      aria-label="Live market prices"
    >
      {/* Fixed height reserves space to avoid layout shift while the iframe loads.
          Stays at opacity 0 (showing the dark strip) until the iframe is ready,
          masking TradingView's white-background flash on load. */}
      <div
        ref={containerRef}
        className={`tradingview-widget-container h-[78px] transition-opacity duration-500 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        suppressHydrationWarning
      >
        <div className="tradingview-widget-container__widget" />
      </div>
      {/* Click mask — sits above the iframe so pointer events never reach TradingView */}
      <div className="absolute inset-0 z-10 cursor-default" aria-hidden="true" />
    </div>
  );
}
