import {
  Layers,
  Wallet,
  Receipt,
  Gift,
  Handshake,
  ArrowRightLeft,
  BarChart3,
  CandlestickChart,
  Droplet,
  Bitcoin,
  Boxes,
  Monitor,
  Globe,
  Sparkles,
  GraduationCap,
  BookOpen,
  Library,
  BookDown,
  Newspaper,
  LineChart,
  Mail,
  Calculator,
  CalendarDays,
  Eye,
  GitCompare,
  Building2,
  LifeBuoy,
  Scale,
  type LucideIcon,
} from 'lucide-react';

// One line glyph per nav href, shared by the desktop dropdowns (HeaderDemo) and
// the mobile menu (MobileMenuDemo). Lucide icons draw with stroke="currentColor",
// so colour + light/dark theming is driven entirely by the caller's text-* class.
const NAV_ICONS: Record<string, LucideIcon> = {
  // Trade
  '/trade/accounts': Layers,
  '/trade/funding': Wallet,
  '/trade/fees': Receipt,
  '/trade/promotions': Gift,
  '/trade/ib': Handshake,
  // Markets
  '/markets/forex': ArrowRightLeft,
  '/markets/indices': BarChart3,
  '/markets/stocks': CandlestickChart,
  '/markets/commodities': Droplet,
  '/markets/crypto': Bitcoin,
  '/markets/etfs': Boxes,
  // Platform
  '/platform/mt5': Monitor,
  '/platform/webtrader': Globe,
  '/ai-crm': Sparkles,
  // Education — Learn
  '/education': GraduationCap,
  '/guides': BookOpen,
  '/glossary': Library,
  '/ebooks': BookDown,
  // Education — Research
  '/research': Newspaper,
  '/research/analyst-chart': LineChart,
  '/newsletter': Mail,
  // Education — Tools
  '/tools': Calculator,
  '/tools/calendar': CalendarDays,
  '/tools/watchlist': Eye,
  '/tools/spread-comparator': GitCompare,
  // Company
  '/company/about': Building2,
  '/support': LifeBuoy,
  '/legal': Scale,
};

export function NavIcon({
  href,
  className = '',
  size = 18,
  strokeWidth = 1.75,
}: {
  href: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = NAV_ICONS[href];
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={`flex-shrink-0 ${className}`}
      aria-hidden
    />
  );
}
