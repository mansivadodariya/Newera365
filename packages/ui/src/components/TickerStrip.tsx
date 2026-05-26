'use client';

export interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
  /** 'pair' renders two colored half-icons; 'solid' renders a single colored square */
  iconType: 'pair' | 'solid';
  iconLeft?: string;
  iconRight?: string;
  iconBg?: string;
  iconLabel?: string;
}

const DEFAULT_TICKERS: TickerItem[] = [
  {
    symbol: 'EURUSD',
    price: '1.0856',
    change: '+0.14%',
    positive: true,
    iconType: 'pair',
    iconLeft: '#003399',
    iconRight: '#AF212B',
  },
  {
    symbol: 'XAUUSD',
    price: '2,418.50',
    change: '+1.24%',
    positive: true,
    iconType: 'pair',
    iconLeft: '#D3A533',
    iconRight: '#AF212B',
  },
  {
    symbol: 'GBPUSD',
    price: '1.2741',
    change: '-0.08%',
    positive: false,
    iconType: 'pair',
    iconLeft: '#0A2166',
    iconRight: '#AF212B',
  },
  {
    symbol: 'USDJPY',
    price: '156.42',
    change: '+0.21%',
    positive: true,
    iconType: 'pair',
    iconLeft: '#AF212B',
    iconRight: '#F9F9F9',
  },
  {
    symbol: 'NDX',
    price: '18,742.30',
    change: '+0.67%',
    positive: true,
    iconType: 'solid',
    iconBg: '#2860FF',
    iconLabel: 'NDX',
  },
  {
    symbol: 'BTCUSD',
    price: '67,250.00',
    change: '-1.12%',
    positive: false,
    iconType: 'solid',
    iconBg: '#F79319',
    iconLabel: '₿',
  },
];

function TickerIcon({ item }: { item: TickerItem }) {
  if (item.iconType === 'pair') {
    return (
      <span className="flex h-[26px] w-[26px] shrink-0 overflow-hidden rounded-sm">
        <span className="h-full w-[13px]" style={{ backgroundColor: item.iconLeft }} />
        <span className="h-full w-[13px]" style={{ backgroundColor: item.iconRight }} />
      </span>
    );
  }
  return (
    <span
      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-sm text-[9px] font-medium text-white"
      style={{ backgroundColor: item.iconBg }}
    >
      {item.iconLabel}
    </span>
  );
}

function TickerCell({ item }: { item: TickerItem }) {
  return (
    <span className="flex shrink-0 items-center gap-[8px] px-[14px]">
      <TickerIcon item={item} />
      <span className="flex flex-col gap-[2px]">
        <span className="font-body text-[13px] font-normal leading-none text-white">
          {item.symbol}
        </span>
        <span className="flex items-center gap-[4px]">
          <span className="font-body text-[12px] leading-none text-white">{item.price}</span>
          <span className="font-body text-[9px] leading-none text-[#8C939E]">USD</span>
          <span
            className={[
              'font-body text-[11px] leading-none',
              item.positive ? 'text-up' : 'text-down',
            ].join(' ')}
          >
            {item.change}
          </span>
        </span>
      </span>
    </span>
  );
}

interface TickerStripProps {
  items?: TickerItem[];
}

function TickerStrip({ items = DEFAULT_TICKERS }: TickerStripProps) {
  const allItems = [...items, ...items];

  return (
    <div
      className="bg-ticker-bg h-[52px] w-full overflow-hidden"
      aria-label="Live market prices"
      aria-live="off"
    >
      <div className="animate-ticker flex h-full items-center whitespace-nowrap will-change-transform">
        {allItems.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <TickerCell item={item} />
            <span
              className="h-[40px] w-px shrink-0"
              style={{ backgroundColor: '#191E26' }}
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

export { TickerStrip };
