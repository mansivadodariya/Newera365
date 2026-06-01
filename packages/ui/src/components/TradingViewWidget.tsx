'use client';

import { useEffect, useRef } from 'react';

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

const WIDGET_URLS: Record<WidgetType, string> = {
  'advanced-chart':
    'https://s.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en',
  'mini-chart': 'https://s.tradingview.com/embed-widget/mini-symbol-overview/',
  'symbol-overview': 'https://s.tradingview.com/embed-widget/symbol-overview/',
  'market-overview': 'https://s.tradingview.com/embed-widget/market-overview/',
  screener: 'https://s.tradingview.com/embed-widget/screener/',
  'economic-calendar': 'https://s.tradingview.com/embed-widget/events/',
  'symbol-info': 'https://s.tradingview.com/embed-widget/symbol-info/',
  'ticker-tape': 'https://s.tradingview.com/embed-widget/ticker-tape/',
};

function buildScriptWidget(
  container: HTMLDivElement,
  type: WidgetType,
  props: TradingViewWidgetProps,
) {
  const { symbol = 'OANDA:EURUSD', theme = 'dark', config = {} } = props;

  if (type === 'advanced-chart') {
    const script = document.createElement('script');
    script.src = 'https://s.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          container_id: container.id,
          autosize: true,
          symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          ...config,
        });
      }
    };
    container.appendChild(script);
    return;
  }

  const widgetConfig: Record<string, unknown> = {
    symbol,
    width: '100%',
    height: '100%',
    locale: 'en',
    colorTheme: theme,
    isTransparent: true,
    ...config,
  };

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = WIDGET_URLS[type];
  script.async = true;
  script.innerHTML = JSON.stringify(widgetConfig);

  const widgetDiv = document.createElement('div');
  widgetDiv.className = 'tradingview-widget-container__widget';
  container.appendChild(widgetDiv);
  container.appendChild(script);
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
  const idRef = useRef(`tv-widget-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    container.id = idRef.current;

    buildScriptWidget(container, type, { type, symbol, theme, config });

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [type, symbol, theme, JSON.stringify(config)]);

  return (
    <div
      ref={containerRef}
      className={['tradingview-widget-container', className].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  );
}

export type { WidgetType, TradingViewWidgetProps };
