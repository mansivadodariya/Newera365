import type { SlateNode } from './RichText';

/**
 * Static guide content used as a fallback when the CMS has no guide documents
 * (e.g. local dev without a seeded CMS, or the CMS being unreachable). Mirrors
 * the MT5 / education fallback philosophy elsewhere in the app: the page must
 * render meaningful, navigable content even with no CMS data so the design can
 * be reviewed and links resolve instead of 404-ing. Real CMS guides override
 * these whenever they exist (see apps/web guides routes).
 */

export interface StaticGuide {
  id: number;
  slug: string;
  title: string;
  summary: string;
  author: string;
  featured?: boolean;
  body: SlateNode[];
}

const h2 = (text: string): SlateNode => ({ type: 'h2', children: [{ text }] });
const p = (text: string): SlateNode => ({ type: 'paragraph', children: [{ text }] });

export const STATIC_GUIDES: StaticGuide[] = [
  {
    id: 9001,
    slug: 'macro-outlook-2026',
    title: 'The 2026 macro outlook',
    summary:
      'Rising inflation or rate cuts? We break down what every scenario means for your positions.',
    author: 'Diego Romero',
    featured: true,
    body: [
      p(
        'The year ahead hinges on one question: do central banks cut, hold, or hike? Each path reshapes currency, index and commodity markets in different ways. Here is how to read the signals.',
      ),
      h2('The rate-cut scenario'),
      p(
        'If inflation continues to soften, the Fed and ECB likely begin easing. A weaker dollar tends to lift gold, emerging-market currencies and risk assets — but the move is rarely linear, and positioning matters more than direction.',
      ),
      h2('The higher-for-longer scenario'),
      p(
        'Sticky services inflation could keep policy restrictive well into the year. In that world, the dollar stays bid, growth-sensitive indices wobble, and carry trades in high-yield currencies regain appeal.',
      ),
      h2('What it means for your book'),
      p(
        'Size positions for the scenario you can survive, not just the one you expect. Define invalidation levels before you enter, and let macro shape your bias rather than your stop placement.',
      ),
    ],
  },
  {
    id: 9002,
    slug: 'risk-management-essentials',
    title: 'Risk management essentials',
    summary: 'Four frameworks that protect every account from outsized drawdowns.',
    author: 'Aisha Khan',
    body: [
      p(
        'Most accounts are not lost on bad trades — they are lost on bad sizing. These four frameworks keep a losing streak survivable.',
      ),
      h2('Fixed-fractional sizing'),
      p(
        'Risk a constant percentage of equity per trade — commonly 1%. As the account grows, position size grows with it; as it shrinks, exposure falls automatically, smoothing the equity curve.',
      ),
      h2('Defining your stop first'),
      p(
        'Decide where the trade is wrong before you decide how big it is. Your stop distance and your risk budget together determine size — never the other way around.',
      ),
      h2('Correlation awareness'),
      p(
        'Three correlated longs are one big position wearing a disguise. Treat correlated exposure as a single risk unit so a single news event cannot hit every position at once.',
      ),
    ],
  },
  {
    id: 9003,
    slug: 'reading-candlestick-charts',
    title: 'Reading a candlestick chart',
    summary: 'From opening price to daily wick — everything you need to parse a chart.',
    author: 'Marcus Lee',
    body: [
      p(
        'A candlestick compresses four numbers — open, high, low and close — into one shape. Learn to read the shape and you read the balance between buyers and sellers.',
      ),
      h2('Anatomy of a candle'),
      p(
        'The body spans the open and close; the wicks mark the high and low. A long upper wick says buyers pushed price up but could not hold it — sellers stepped in.',
      ),
      h2('Common single-candle signals'),
      p(
        'Dojis show indecision, hammers hint at rejection of lower prices, and engulfing candles flag a shift in control. None are signals on their own — context and location are everything.',
      ),
    ],
  },
  {
    id: 9004,
    slug: 'leverage-and-margin-explained',
    title: 'Leverage and margin explained',
    summary: 'How leverage amplifies both sides of the trade — and how margin keeps you in it.',
    author: 'Diego Romero',
    body: [
      p(
        'Leverage lets a small deposit control a large position. It is the single most misunderstood tool in trading — powerful, and unforgiving when misused.',
      ),
      h2('How leverage works'),
      p(
        'At 1:100 leverage, $1,000 of margin controls $100,000 of notional exposure. A 1% move is a 100% move on your margin — in either direction.',
      ),
      h2('Margin and the stop-out'),
      p(
        'Used margin is locked while a position is open; free margin absorbs adverse moves. When equity falls below the maintenance level, positions are closed automatically to protect the account.',
      ),
    ],
  },
  {
    id: 9005,
    slug: 'building-a-trading-plan',
    title: 'Building a trading plan',
    summary: 'Turn scattered ideas into a repeatable, reviewable process.',
    author: 'Aisha Khan',
    body: [
      p(
        'A trading plan is the difference between a process and a series of impulses. It does not need to be complex — it needs to be written down and followed.',
      ),
      h2('Your edge, stated plainly'),
      p(
        'Write the exact conditions under which you take a trade. If you cannot describe your setup in two sentences, you do not yet have one.',
      ),
      h2('Rules for entry, exit and review'),
      p(
        'Define entry triggers, profit targets, stop placement and the maximum you will risk per day. Then schedule a weekly review — the plan only compounds if you study your own results.',
      ),
    ],
  },
];

export function getStaticGuide(slug: string): StaticGuide | null {
  return STATIC_GUIDES.find((g) => g.slug === slug) ?? null;
}
