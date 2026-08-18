'use client';

import dynamic from 'next/dynamic';
import type { TradingViewWidgetProps } from './TradingViewWidget';

export type ChartProvider = 'tradingview' | 'mt5';

// Single seam for the live-chart backend. TradingView today; MT5 web-terminal
// iframes later (NE-003). Flip NEXT_PUBLIC_CHART_PROVIDER=mt5 (and set
// NEXT_PUBLIC_MT5_WEBTERMINAL_URL) and ONLY this file changes — the ~5 consumer
// pages keep rendering <ChartWidget .../> unchanged. Both providers are
// dynamically imported (ssr:false) so the heavy embed/iframe stays off the
// initial bundle and critical path.
const PROVIDER: ChartProvider =
  process.env.NEXT_PUBLIC_CHART_PROVIDER === 'mt5' ? 'mt5' : 'tradingview';

const fallback = () => (
  <div className="h-full min-h-[180px] w-full animate-pulse rounded-[inherit] bg-black/[0.04] dark:bg-white/[0.04]" />
);

const TradingView = dynamic(() => import('./TradingViewWidget').then((m) => m.TradingViewWidget), {
  ssr: false,
  loading: fallback,
});

const Mt5 = dynamic(() => import('./Mt5ChartWidget').then((m) => m.Mt5ChartWidget), {
  ssr: false,
  loading: fallback,
});

export function ChartWidget(props: TradingViewWidgetProps) {
  return PROVIDER === 'mt5' ? <Mt5 {...props} /> : <TradingView {...props} />;
}
