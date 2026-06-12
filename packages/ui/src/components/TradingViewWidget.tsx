'use client';

import { useEffect, useRef, useState } from 'react';

type WidgetType =
  | 'advanced-chart'
  | 'mini-chart'
  | 'symbol-overview'
  | 'market-overview'
  | 'screener'
  | 'economic-calendar'
  | 'symbol-info'
  | 'ticker-tape';

interface TradingViewWidgetProps {
  type: WidgetType;
  symbol?: string;
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
  className?: string;
  config?: Record<string, unknown>;
}

// External-embedding loaders. MUST be served from s3.tradingview.com — the
// s.tradingview.com / www.tradingview.com hosts return an HTML error page for
// these paths, which the browser then ORB-blocks (net::ERR_BLOCKED_BY_ORB), so
// the chart iframe never mounts. The s3 host is the canonical TradingView CDN
// (it's what the working TradingViewTicker uses). The rendered chart iframe is
// served from www.tradingview-widget.com — see frame-src in apps/web/next.config.mjs.
const WIDGET_URLS: Record<WidgetType, string> = {
  'advanced-chart': 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
  'mini-chart':
    'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js',
  'symbol-overview':
    'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js',
  'market-overview':
    'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js',
  screener: 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
  'economic-calendar': 'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
  'symbol-info': 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js',
  'ticker-tape': 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
};

function buildConfig(type: WidgetType, props: TradingViewWidgetProps): Record<string, unknown> {
  const { symbol = 'OANDA:EURUSD', theme = 'dark', config = {} } = props;

  const baseConfig: Record<string, unknown> =
    type === 'advanced-chart'
      ? {
          autosize: true,
          symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme,
          style: '1',
          locale: 'en',
          enable_publishing: false,
          hide_top_toolbar: false,
          save_image: false,
        }
      : {
          symbol,
          width: '100%',
          height: '100%',
          locale: 'en',
          colorTheme: theme,
          isTransparent: true,
          autosize: true,
        };

  return { ...baseConfig, ...config };
}

export function TradingViewWidget({
  type,
  symbol = 'OANDA:EURUSD',
  width = '100%',
  height = '100%',
  theme = 'dark',
  className = '',
  config = {},
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Two-pass mount: defer script injection until after the container is in the
  // DOM and laid out (non-zero size). Mirrors the proven TradingViewTicker
  // pattern and avoids the StrictMode double-invoke clearing the script mid-load.
  const [mounted, setMounted] = useState(false);
  // 'failed' covers ad-blockers / CSP / network blocking s3.tradingview.com so
  // the UI shows a graceful notice instead of a permanently-empty box.
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => setMounted(true), []);

  const configKey = JSON.stringify(config);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    setStatus('loading');
    container.innerHTML =
      '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';

    const script = document.createElement('script');
    script.src = WIDGET_URLS[type];
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(buildConfig(type, { type, symbol, theme, config }));
    script.onerror = () => setStatus('failed');
    container.appendChild(script);

    // The embed script injects an <iframe> once it loads. Watch for it to flip
    // out of the loading state; if nothing appears in time, assume it's blocked.
    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe')) {
        setStatus('ready');
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const timeout = setTimeout(() => {
      if (!container.querySelector('iframe')) setStatus('failed');
    }, 8000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, type, symbol, theme, configKey]);

  return (
    <div
      className={['relative', className].filter(Boolean).join(' ')}
      style={{ width, height, minHeight: typeof height === 'number' ? height : 180 }}
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
        suppressHydrationWarning
      >
        <div className="tradingview-widget-container__widget" />
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-full animate-pulse rounded-[inherit] bg-black/[0.04] dark:bg-white/[0.04]" />
        </div>
      )}

      {status === 'failed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[inherit] bg-black/[0.03] px-4 text-center dark:bg-white/[0.04]">
          <span className="text-[12px] font-medium text-[#111] dark:text-white">
            Live chart unavailable
          </span>
          <span className="text-[10px] text-[#6b7280] dark:text-white/50">
            Allow tradingview.com to view live prices
          </span>
        </div>
      )}
    </div>
  );
}

export type { WidgetType, TradingViewWidgetProps };
