// Shared TradingView market-overview widget config — single source for the
// tabs/symbols used by both the /tools/watchlist page and the homepage
// live-markets section. Symbols sourced from TradingView market-overview docs:
// https://www.tradingview.com/widget-docs/widgets/watchlists/market-overview/
export const MARKET_OVERVIEW_CONFIG = {
  colorTheme: 'dark',
  dateRange: '12M',
  showChart: true,
  locale: 'en',
  largeChartUrl: '',
  // isTransparent MUST stay false: TradingView embeds paint a LIGHT surface
  // when transparent (same failure the ticker had) instead of following
  // colorTheme — the widget rendered white inside our dark panel.
  isTransparent: false,
  showSymbolLogo: true,
  showFloatingTooltip: false,
  plotLineColorGrowing: 'rgba(41,98,255,1)',
  plotLineColorFalling: 'rgba(41,98,255,1)',
  gridLineColor: 'rgba(42,46,57,0)',
  scaleFontColor: 'rgba(219,219,219,1)',
  belowLineFillColorGrowing: 'rgba(41,98,255,0.12)',
  belowLineFillColorFalling: 'rgba(41,98,255,0.12)',
  symbolActiveColor: 'rgba(41,98,255,0.12)',
  tabs: [
    // Symbols re-validated against TradingView symbol-search on 2026-07-02:
    // the FOREXCOM: feed was retired (rendered "symbol not available"), and
    // TVC:NATGAS / TVC:COPPER / EUREX continuous futures no longer resolve —
    // replaced with the OANDA CFD equivalents the rest of the site uses.
    {
      title: 'Indices',
      symbols: [
        { s: 'OANDA:SPX500USD', d: 'S&P 500 Index' },
        { s: 'OANDA:NAS100USD', d: 'Nasdaq 100' },
        { s: 'OANDA:US30USD', d: 'Dow 30' },
        { s: 'INDEX:NKY', d: 'Nikkei 225' },
        { s: 'INDEX:DEU40', d: 'DAX Index' },
        { s: 'OANDA:UK100GBP', d: 'UK 100' },
      ],
      originalTitle: 'Indices',
    },
    {
      title: 'Futures',
      symbols: [
        { s: 'TVC:USOIL', d: 'WTI Crude Oil' },
        { s: 'TVC:UKOIL', d: 'Brent Crude' },
        { s: 'OANDA:NATGASUSD', d: 'Natural Gas' },
        { s: 'TVC:GOLD', d: 'Gold' },
        { s: 'TVC:SILVER', d: 'Silver' },
        { s: 'OANDA:XCUUSD', d: 'Copper' },
      ],
      originalTitle: 'Futures',
    },
    {
      title: 'Bonds',
      symbols: [
        { s: 'OANDA:DE10YBEUR', d: 'Euro Bund' },
        { s: 'OANDA:UK10YBGBP', d: 'UK 10Y Gilt' },
        { s: 'OANDA:USB10YUSD', d: 'US 10Y T-Note' },
      ],
      originalTitle: 'Bonds',
    },
    {
      title: 'Forex',
      symbols: [
        { s: 'OANDA:EURUSD', d: 'EUR/USD' },
        { s: 'OANDA:GBPUSD', d: 'GBP/USD' },
        { s: 'OANDA:USDJPY', d: 'USD/JPY' },
        { s: 'OANDA:USDCHF', d: 'USD/CHF' },
        { s: 'OANDA:AUDUSD', d: 'AUD/USD' },
        { s: 'OANDA:USDCAD', d: 'USD/CAD' },
      ],
      originalTitle: 'Forex',
    },
  ],
};
