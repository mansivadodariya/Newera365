'use client';

import type { TradingViewWidgetProps } from './TradingViewWidget';

// MT5 web-terminal chart provider (NE-003). Placeholder until the broker's MT5
// web-terminal iframe URL is provisioned. It accepts the SAME props shape as the
// TradingView widget so ChartWidget can swap providers with zero call-site
// changes. When the URL is ready, render:
//   <iframe src={`${MT5_WEBTERMINAL_URL}?symbol=${mt5Symbol(symbol)}`} ... />
export function Mt5ChartWidget({
  symbol = '',
  height = '100%',
  width = '100%',
}: TradingViewWidgetProps) {
  const url = process.env.NEXT_PUBLIC_MT5_WEBTERMINAL_URL;

  if (url) {
    const src = `${url}${url.includes('?') ? '&' : '?'}symbol=${encodeURIComponent(symbol)}`;
    return (
      <iframe
        src={src}
        title={`MT5 chart ${symbol}`}
        style={{ width, height, minHeight: typeof height === 'number' ? height : 180, border: 0 }}
        className="rounded-[inherit]"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-[inherit] bg-black/[0.03] px-4 text-center dark:bg-white/[0.04]"
      style={{ width, height, minHeight: typeof height === 'number' ? height : 180 }}
    >
      <span className="text-[12px] font-medium text-foreground dark:text-white">MT5 chart</span>
      <span className="text-[10px] text-muted dark:text-white/50">
        Set NEXT_PUBLIC_MT5_WEBTERMINAL_URL to enable
      </span>
    </div>
  );
}
