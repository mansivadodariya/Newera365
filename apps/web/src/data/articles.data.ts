import type { CmsArticle, CmsBlogPost, CmsMarketAnalysis, CmsResearchReport } from '../lib/cms';

export const STATIC_ARTICLES: CmsArticle[] = [
  {
    id: 5,
    slug: 'us-stocks-all-time-high-earnings',
    title: 'US Stocks Hit All-Time Highs on Strong Earnings Season',
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'indices',
    analyst: 'WSJ',
    publishedDate: '2026-08-30T13:15:54.659Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'US equity indices closed at all-time highs as a stronger-than-expected earnings season lifted megacap technology and financial shares.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Breadth improved with more sectors participating in the advance, though stretched valuations and a still-data-dependent Fed leave the market sensitive to any upside surprise in inflation.',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    slug: 'ecb-minutes-caution-june-meeting',
    title: 'ECB Minutes Signal Caution Ahead of June Meeting',
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'forex',
    analyst: 'FT',
    publishedDate: '2026-08-30T13:15:54.659Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: "Minutes from the European Central Bank's latest meeting struck a cautious tone, with policymakers stressing that any further easing will depend on incoming wage and services-inflation data.",
          },
        ],
      },
      {
        children: [
          {
            text: 'The euro held steady against the dollar as the account offered little new guidance on the pace of cuts. Markets continue to price a gradual path, wary of moving ahead of confirmation from the June projections.',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'bitcoin-surges-70000-etf-inflows',
    title: 'Bitcoin Surges Past $70,000 as ETF Inflows Accelerate',
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'crypto',
    analyst: 'CoinDesk',
    publishedDate: '2026-08-31T05:15:54.659Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'Bitcoin climbed back above $70,000 as spot exchange-traded funds recorded their strongest week of net inflows since launch, signalling renewed institutional appetite.',
          },
        ],
      },
      {
        children: [
          {
            text: 'The rally broadened across major tokens, with traders watching whether ETF demand can absorb supply through the next halving cycle. Thin weekend liquidity, however, leaves the market exposed to sharp two-way swings.',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'gold-record-high-2400-safe-haven',
    title: 'Gold Hits Record High Above $2,400 on Safe-Haven Demand',
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'commodities',
    analyst: 'Bloomberg',
    publishedDate: '2026-08-31T08:15:54.659Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'Gold pushed to a fresh record high above $2,400 an ounce as renewed safe-haven demand and steady central-bank buying outweighed the drag from a firm dollar.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Analysts point to falling real yields and persistent geopolitical risk as the main supports. A sustained close above $2,400 would keep the next psychological target of $2,500 within reach, though a sharp rebound in yields remains the key risk.',
          },
        ],
      },
    ],
  },
  {
    id: 1,
    slug: 'fed-holds-rates-signals-two-cuts-2026',
    title: 'Fed Holds Rates Steady, Signals Two Cuts in 2026',
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'forex',
    analyst: 'Reuters',
    publishedDate: '2026-08-31T11:15:54.659Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'The Federal Reserve left its benchmark rate unchanged at the June meeting, holding the target range steady for a fourth consecutive decision while it waits for clearer evidence that inflation is returning to target.',
          },
        ],
      },
      {
        children: [
          {
            text: 'The updated dot plot now points to two quarter-point cuts before the end of 2026 — a slightly more dovish path than markets had priced. Treasury yields eased and the dollar softened modestly as traders pulled forward the expected timing of the first cut.',
          },
        ],
      },
    ],
  },
  {
    id: 6,
    slug: 'ecb-rate-decision-what-traders-missed',
    title: 'The ECB Rate Decision and What the Market Priced Wrong',
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'forex',
    analyst: 'Marcus Webb',
    publishedDate: '2026-08-19T13:15:09.703Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: "The ECB's June decision was fully priced by markets — or so they thought. The surprise was not the cut itself but the accompanying statement, which removed the phrase 'data-dependent future cuts', signalling a slower path ahead.",
          },
        ],
      },
      {
        children: [
          {
            text: 'EUR/JPY had the largest single-session move of Q2: a 180-pip reversal from session highs. Traders who were positioned for a dovish follow-through were caught offside.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Lesson from the desk: price the press conference, not just the decision. Rate-sensitive pairs move on guidance, not rate changes that were already discounted weeks earlier.',
          },
        ],
      },
    ],
  },
  {
    id: 5,
    slug: 'pip-swap-calculators-on-mobile',
    title: 'How Free Pip & Swap Calculators on Mobile Can Mislead You',
    assetCategory: 'forex',
    editorialCategory: 'education',
    category: 'education',
    analyst: 'Sofia Reyes',
    publishedDate: '2026-08-21T13:15:09.703Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'Free pip and swap calculators in app stores use standardised assumptions: 100,000-unit lots, fixed pip values, and overnight rates sourced from generic benchmarks. Your broker uses different lot sizes, variable spreads, and rollover rates tied to interbank rates.',
          },
        ],
      },
      {
        children: [
          {
            text: "The error compounds when you trade exotic pairs or instruments with non-standard tick sizes. A CFD on an index has a completely different pip value calculation than a forex pair, and most free apps don't account for this.",
          },
        ],
      },
      {
        children: [
          {
            text: "Always use your broker's own calculator — or build your own in a spreadsheet using your account currency, the exact lot size, and the specific overnight swap rate from your platform's specification page.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    slug: 'traders-guide-understanding-slippage',
    title: "A Trader's Guide to Understanding Slippage",
    assetCategory: 'forex',
    editorialCategory: 'education',
    category: 'education',
    analyst: 'Sofia Reyes',
    publishedDate: '2026-08-24T13:15:09.703Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'Slippage is the difference between the price you expected when you placed an order and the price at which it was actually executed. It occurs in all markets but is most pronounced during periods of high volatility or low liquidity.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Positive slippage — getting a better fill than requested — is possible but rarer. Negative slippage is the norm during news events, market opens, and thin overnight sessions. Understanding the mechanics helps you choose the right order type and time of execution.',
          },
        ],
      },
      {
        children: [
          {
            text: "How to minimise slippage: use limit orders instead of market orders where possible, avoid trading during major news releases unless you have a defined edge, and review your broker's execution statistics before sizing up.",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'gold-1400-momentum-or-top',
    title: 'Gold at $2,400 — Momentum or Top? Reading the COT Report',
    assetCategory: 'commodities',
    editorialCategory: null,
    category: 'forex',
    analyst: 'Daniel Osei',
    publishedDate: '2026-08-26T13:15:09.703Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'Gold is consolidating near all-time highs as markets reassess the inflation trajectory. A softer-than-expected CPI print could be the catalyst for a push toward the $2,400 psychological target.',
          },
        ],
      },
      {
        children: [
          {
            text: "The Commitment of Traders report shows managed money net longs at 18-month highs. That's a bullish signal — until it isn't. At extremes, positioning itself becomes the headwind as late longs run out of buyers.",
          },
        ],
      },
      {
        children: [
          {
            text: 'On the 4-hour chart, XAUUSD has built a strong base between $2,290 and $2,320. Strategy: Buy dips to $2,290–2,300 with a target at $2,380, stop at $2,260.',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'volatility-trap-three-setups',
    title: 'The Volatility Trap: Three Setups Professional Traders Avoid',
    assetCategory: 'etfs',
    editorialCategory: null,
    category: 'forex',
    analyst: 'Priya Sharma',
    publishedDate: '2026-08-28T13:15:09.703Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: 'High Average True Range is not the same as tradeable edge. During earnings seasons and macro event weeks, ATR spikes, but bid-ask spreads widen, fills deteriorate, and stop-outs become almost inevitable.',
          },
        ],
      },
      {
        children: [
          {
            text: 'The three setups professionals avoid during high-ATR environments: (1) breakout entries on the first candle close above resistance, (2) mean-reversion fades into a trend driven by fundamentals, (3) any position sized at normal risk when overnight gap risk is elevated.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Edge comes from consistency and repeatability, not volatility. Reduce size, wait for spreads to normalise, and let amateurs pay the premium for excitement.',
          },
        ],
      },
    ],
  },
  {
    id: 1,
    slug: 'dollar-move-starts-frankfurt',
    title: "Why the Dollar's Next Move Starts in Frankfurt, Not Washington",
    assetCategory: 'forex',
    editorialCategory: null,
    category: 'forex',
    analyst: 'Marcus Webb',
    publishedDate: '2026-08-30T13:15:09.703Z',
    status: 'published',
    summary: null,
    body: [
      {
        children: [
          {
            text: "ECB policy divergence is widening the EUR/USD range. The market's obsession with Fed rhetoric is masking the real driver of dollar strength: the pace of ECB rate cuts relative to the Fed hold.",
          },
        ],
      },
      {
        children: [
          {
            text: 'A deeper-than-expected ECB cut cycle would compress the yield differential sharply, pushing EUR/USD toward the 1.05 handle. The key data point to watch is not NFP — it is the EZ flash CPI print on the last Friday of each month.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Outlook: Dollar strength is more likely to originate from Frankfurt dovishness than Washington hawkishness. Position accordingly with a EUR/USD range of 1.0600–1.0950 for Q3.',
          },
        ],
      },
    ],
  },
];

export const STATIC_BLOG_POSTS: CmsBlogPost[] = [
  {
    id: 11,
    title: 'The Monday Briefing: Macro Themes Driving Markets This Week',
    slug: 'monday-briefing-macro-themes-june-2026',
    status: 'published',
    publishedDate: '2026-08-10T13:13:48.063Z',
    category: 'market-news',
    author: 'Newera Research Desk',
    excerpt:
      'Five macro themes shaping forex, commodity and index markets heading into the new trading week.',
    featuredImage: {
      id: 14,
      alt: 'The Monday Briefing: Macro Themes Driving Markets This Week',
      tags: [],
      updatedAt: '2026-08-31T13:15:02.161Z',
      createdAt: '2026-08-31T13:15:02.161Z',
      url: 'http://localhost:3001/media/blog-monday-briefing-macro-themes-june-2027.png',
      filename: 'blog-monday-briefing-macro-themes-june-2027.png',
      mimeType: 'image/png',
      filesize: 28311,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-monday-briefing-macro-themes-june-2027-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11756,
          filename: 'blog-monday-briefing-macro-themes-june-2027-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-monday-briefing-macro-themes-june-2027-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 58460,
          filename: 'blog-monday-briefing-macro-themes-june-2027-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: "THEME 1 — FED REPRICING: Friday's strong payrolls print has markets scaling back rate-cut expectations. The September FOMC is now roughly 50/50 between hold and cut.",
          },
        ],
      },
      {
        children: [
          {
            text: 'THEME 2 — CHINA RECOVERY DOUBTS: Weekend PMI data from China missed expectations for the fourth consecutive month. Watch AUD/USD, commodity currencies and copper as the barometer.',
          },
        ],
      },
      {
        children: [
          {
            text: 'THEME 3 — OIL GEOPOLITICS: Escalating tensions in the Middle East have kept a risk premium in crude oil. If the situation stabilises, a $3–5 pullback is realistic.',
          },
        ],
      },
      {
        children: [
          {
            text: "THEME 4 — DOLLAR FLOWS: Month-end rebalancing added noise to last week's dollar move. The underlying trend is still dollar-positive pending a sustained inflation rollover.",
          },
        ],
      },
      {
        children: [
          {
            text: 'THEME 5 — UK ELECTIONS: Political uncertainty is creating volatility in GBP pairs. Traders are treating this as a binary event and positioning accordingly — reduced exposure, wider stops.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:06.457Z',
    createdAt: '2026-08-31T13:15:04.203Z',
  },
  {
    id: 10,
    title: 'USD/JPY at 155: Is Japan Ready to Intervene Again?',
    slug: 'usdjpy-155-japan-intervention-risk',
    status: 'published',
    publishedDate: '2026-08-12T13:13:48.063Z',
    category: 'analysis',
    author: 'Sarah Mitchell',
    excerpt:
      'USD/JPY is back near the 155 level that triggered Bank of Japan intervention in 2023. Here is what traders need to watch.',
    featuredImage: {
      id: 13,
      alt: 'USD/JPY at 155: Is Japan Ready to Intervene Again?',
      tags: [],
      updatedAt: '2026-08-31T13:14:55.079Z',
      createdAt: '2026-08-31T13:14:55.079Z',
      url: 'http://localhost:3001/media/blog-usdjpy-155-japan-intervention-risk-1.png',
      filename: 'blog-usdjpy-155-japan-intervention-risk-1.png',
      mimeType: 'image/png',
      filesize: 28425,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-usdjpy-155-japan-intervention-risk-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11587,
          filename: 'blog-usdjpy-155-japan-intervention-risk-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-usdjpy-155-japan-intervention-risk-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 57050,
          filename: 'blog-usdjpy-155-japan-intervention-risk-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'USD/JPY has crept back toward 155 — the level that prompted coordinated Bank of Japan intervention in late 2023. Whether authorities intervene again depends on the speed of the move as much as the level itself.',
          },
        ],
      },
      {
        children: [
          {
            text: 'BoJ intervention mechanics: Japan does not typically announce intervention. Dealers watching the spot market identify it by sudden sharp yen-buying orders that have no apparent domestic or overseas catalyst.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Trading around the risk: Many experienced yen traders avoid large short-yen positions above 150, using options instead to express the view while capping downside from a sudden intervention-driven reversal.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:59.427Z',
    createdAt: '2026-08-31T13:14:57.172Z',
  },
  {
    id: 9,
    title: 'AUD/USD: RBA Decision Preview and What AUD Traders Need to Know',
    slug: 'audusd-rba-decision-preview',
    status: 'published',
    publishedDate: '2026-08-14T13:13:48.063Z',
    category: 'market-news',
    author: 'James Thornton',
    excerpt:
      'The Reserve Bank of Australia meets next Tuesday. Here is the full preview for AUD/USD traders.',
    featuredImage: {
      id: 12,
      alt: 'AUD/USD: RBA Decision Preview and What AUD Traders Need to Know',
      tags: [],
      updatedAt: '2026-08-31T13:14:47.953Z',
      createdAt: '2026-08-31T13:14:47.953Z',
      url: 'http://localhost:3001/media/blog-audusd-rba-decision-preview-1.png',
      filename: 'blog-audusd-rba-decision-preview-1.png',
      mimeType: 'image/png',
      filesize: 29195,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-audusd-rba-decision-preview-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 12280,
          filename: 'blog-audusd-rba-decision-preview-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-audusd-rba-decision-preview-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 60246,
          filename: 'blog-audusd-rba-decision-preview-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: "AUD/USD is trading near 0.6580 ahead of next Tuesday's Reserve Bank of Australia policy decision. The market is pricing a hold, but the statement language will drive the pair.",
          },
        ],
      },
      {
        children: [
          {
            text: 'What to watch in the statement: Any shift in the RBA\'s inflation language — from "some time" to "near-term" — would be interpreted as a dovish signal and push AUD/USD toward 0.6500.',
          },
        ],
      },
      {
        children: [
          {
            text: 'China as the wildcard: Australian exports depend heavily on Chinese demand. A deterioration in Chinese PMI data alongside a dovish RBA statement would be a double negative for AUD/USD.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:52.276Z',
    createdAt: '2026-08-31T13:14:50.016Z',
  },
  {
    id: 8,
    title: 'S&P 500 All-Time Highs: What the Rally Means for Forex',
    slug: 'sp500-all-time-highs-forex-implications',
    status: 'published',
    publishedDate: '2026-08-16T13:13:48.063Z',
    category: 'analysis',
    author: 'Newera Research Desk',
    excerpt:
      'US equities at record highs have historically correlated with dollar strength, JPY weakness and commodity-currency gains.',
    featuredImage: {
      id: 11,
      alt: 'S&P 500 All-Time Highs: What the Rally Means for Forex',
      tags: [],
      updatedAt: '2026-08-31T13:14:40.838Z',
      createdAt: '2026-08-31T13:14:40.838Z',
      url: 'http://localhost:3001/media/blog-sp500-all-time-highs-forex-implications-1.png',
      filename: 'blog-sp500-all-time-highs-forex-implications-1.png',
      mimeType: 'image/png',
      filesize: 28569,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-sp500-all-time-highs-forex-implications-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11711,
          filename: 'blog-sp500-all-time-highs-forex-implications-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-sp500-all-time-highs-forex-implications-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 58094,
          filename: 'blog-sp500-all-time-highs-forex-implications-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'The S&P 500 broke to fresh all-time highs this week, continuing a rally that has added over 25% since October 2023. For forex traders, equity strength carries distinct implications.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Risk-on dynamics: Sustained equity gains typically weaken the Japanese yen (a safe haven), support AUD and NZD (commodity currencies) and pressure USD/CHF higher.',
          },
        ],
      },
      {
        children: [
          {
            text: 'The divergence to watch: If equities are rising on rate-cut hopes while the dollar is also strong, something has to give. Historically, one of these correlations breaks — and identifying which is the key trade.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:45.200Z',
    createdAt: '2026-08-31T13:14:42.928Z',
  },
  {
    id: 7,
    title: 'Bitcoin Breaks $70,000: Institutional Demand or Retail FOMO?',
    slug: 'bitcoin-breaks-70000-institutional-demand',
    status: 'published',
    publishedDate: '2026-08-18T13:13:48.063Z',
    category: 'analysis',
    author: 'Sarah Mitchell',
    excerpt:
      'BTC/USD surges through $70,000 for the first time since November 2021. We break down what is driving the move.',
    featuredImage: {
      id: 10,
      alt: 'Bitcoin Breaks $70,000: Institutional Demand or Retail FOMO?',
      tags: [],
      updatedAt: '2026-08-31T13:14:33.715Z',
      createdAt: '2026-08-31T13:14:33.715Z',
      url: 'http://localhost:3001/media/blog-bitcoin-breaks-70000-institutional-demand-1.png',
      filename: 'blog-bitcoin-breaks-70000-institutional-demand-1.png',
      mimeType: 'image/png',
      filesize: 28381,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-bitcoin-breaks-70000-institutional-demand-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11437,
          filename: 'blog-bitcoin-breaks-70000-institutional-demand-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-bitcoin-breaks-70000-institutional-demand-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 57669,
          filename: 'blog-bitcoin-breaks-70000-institutional-demand-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'Bitcoin has broken above the psychologically important $70,000 level, driven by record inflows into spot Bitcoin ETFs and renewed institutional demand ahead of the halving event.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Supply dynamics: The halving — expected in April — will cut the daily supply of new Bitcoin from 900 to 450 coins. Historically, halvings have preceded significant price appreciation, though usually with a 6–12 month lag.',
          },
        ],
      },
      {
        children: [
          {
            text: "Risk considerations for CFD traders: Bitcoin's daily swings can exceed 5-10% during breakout phases. Position sizing is critical — the same leverage that works on EUR/USD can wipe an account in hours on BTC/USD.",
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:38.059Z',
    createdAt: '2026-08-31T13:14:35.802Z',
  },
  {
    id: 6,
    title: 'US Dollar Index Tests 105 — Key Macro Drivers This Week',
    slug: 'usd-index-105-macro-drivers',
    status: 'published',
    publishedDate: '2026-08-20T13:13:48.063Z',
    category: 'market-news',
    author: 'Newera Research Desk',
    excerpt:
      'DXY pushes toward 105 as stronger US data reshapes rate expectations. Here are the macro events that could shift the trend.',
    featuredImage: {
      id: 9,
      alt: 'US Dollar Index Tests 105 — Key Macro Drivers This Week',
      tags: [],
      updatedAt: '2026-08-31T13:14:26.533Z',
      createdAt: '2026-08-31T13:14:26.533Z',
      url: 'http://localhost:3001/media/blog-usd-index-105-macro-drivers-1.png',
      filename: 'blog-usd-index-105-macro-drivers-1.png',
      mimeType: 'image/png',
      filesize: 28194,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-usd-index-105-macro-drivers-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11650,
          filename: 'blog-usd-index-105-macro-drivers-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-usd-index-105-macro-drivers-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 57566,
          filename: 'blog-usd-index-105-macro-drivers-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'The US Dollar Index (DXY) climbed to 104.80 before pulling back slightly, with the dollar strengthening against most G10 currencies. The move is driven by repricing of Federal Reserve rate expectations — markets now price just one cut in 2026, down from three at the start of the quarter.',
          },
        ],
      },
      {
        children: [
          {
            text: "Key data this week: Tuesday's CPI print is the most important near-term catalyst. A reading above 3.3% would validate further dollar strength and likely push EUR/USD below 1.0750.",
          },
        ],
      },
      {
        children: [
          {
            text: 'Trading the dollar: The DXY has historically struggled to sustain above 105 without explicit hawkish Fed guidance. Watch for profit-taking if the level is reached without a data catalyst.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:30.941Z',
    createdAt: '2026-08-31T13:14:28.685Z',
  },
  {
    id: 5,
    title: 'Oil at $85: OPEC+ Cuts Hold — But for How Long?',
    slug: 'oil-opec-cuts-85-dollar-level',
    status: 'published',
    publishedDate: '2026-08-22T13:13:48.063Z',
    category: 'analysis',
    author: 'Sarah Mitchell',
    excerpt:
      'Crude oil is holding above $85/bbl as OPEC+ production cuts support prices, but demand concerns from China cloud the outlook.',
    featuredImage: {
      id: 8,
      alt: 'Oil at $85: OPEC+ Cuts Hold — But for How Long?',
      tags: [],
      updatedAt: '2026-08-31T13:14:19.355Z',
      createdAt: '2026-08-31T13:14:19.355Z',
      url: 'http://localhost:3001/media/blog-oil-opec-cuts-85-dollar-level-1.png',
      filename: 'blog-oil-opec-cuts-85-dollar-level-1.png',
      mimeType: 'image/png',
      filesize: 27874,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-oil-opec-cuts-85-dollar-level-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11384,
          filename: 'blog-oil-opec-cuts-85-dollar-level-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-oil-opec-cuts-85-dollar-level-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 55766,
          filename: 'blog-oil-opec-cuts-85-dollar-level-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'Brent crude has settled into a range between $82 and $87 per barrel following confirmation that OPEC+ will maintain its 1.66 million barrel per day production cut through the end of the year.',
          },
        ],
      },
      {
        children: [
          {
            text: "China demand remains the key downside risk. PMI readings have surprised to the downside for three consecutive months, raising questions about whether the world's largest oil importer is experiencing a structural slowdown or a cyclical soft patch.",
          },
        ],
      },
      {
        children: [
          {
            text: 'From a trading perspective, the $80 level represents a key demand zone supported by OPEC+ rhetoric. On the upside, supply concerns related to the Middle East could push toward $90.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:23.791Z',
    createdAt: '2026-08-31T13:14:21.524Z',
  },
  {
    id: 4,
    title: 'GBP/USD Technical Outlook: BoE Rate Decision in Focus',
    slug: 'gbpusd-technical-outlook-boe-rate-decision',
    status: 'published',
    publishedDate: '2026-08-24T13:13:48.063Z',
    category: 'market-news',
    author: 'James Thornton',
    excerpt:
      'Cable holds above 1.2700 as traders position ahead of the Bank of England monetary policy decision.',
    featuredImage: {
      id: 7,
      alt: 'GBP/USD Technical Outlook: BoE Rate Decision in Focus',
      tags: [],
      updatedAt: '2026-08-31T13:14:12.210Z',
      createdAt: '2026-08-31T13:14:12.210Z',
      url: 'http://localhost:3001/media/blog-gbpusd-technical-outlook-boe-rate-decision-1.png',
      filename: 'blog-gbpusd-technical-outlook-boe-rate-decision-1.png',
      mimeType: 'image/png',
      filesize: 28644,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-gbpusd-technical-outlook-boe-rate-decision-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 12101,
          filename: 'blog-gbpusd-technical-outlook-boe-rate-decision-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-gbpusd-technical-outlook-boe-rate-decision-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 59655,
          filename: 'blog-gbpusd-technical-outlook-boe-rate-decision-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'GBP/USD is consolidating in a tight range between 1.2690 and 1.2790 as market participants await the Bank of England rate decision on Thursday.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Technical picture: The pair is trading above the 200-day moving average but below the key 1.2800 resistance. A sustained break above would target 1.2870 and then the 2024 high near 1.2970.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Fundamentals: UK CPI has been stickier than expected, which could push the BoE to maintain a hawkish tone even if it keeps rates on hold. Watch for the vote split — a 6-3 hold would be more hawkish than a 7-2.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:16.593Z',
    createdAt: '2026-08-31T13:14:14.338Z',
  },
  {
    id: 3,
    title: 'NFP Trading Guide: How to Trade the US Non-Farm Payrolls',
    slug: 'nfp-trading-guide-non-farm-payrolls',
    status: 'published',
    publishedDate: '2026-08-26T13:13:48.063Z',
    category: 'tutorials',
    author: 'James Thornton',
    excerpt:
      'The monthly Non-Farm Payrolls report is one of the most volatile events in forex. Here is how to trade it safely.',
    featuredImage: {
      id: 6,
      alt: 'NFP Trading Guide: How to Trade the US Non-Farm Payrolls',
      tags: [],
      updatedAt: '2026-08-31T13:14:05.131Z',
      createdAt: '2026-08-31T13:14:05.131Z',
      url: 'http://localhost:3001/media/blog-nfp-trading-guide-non-farm-payrolls-1.png',
      filename: 'blog-nfp-trading-guide-non-farm-payrolls-1.png',
      mimeType: 'image/png',
      filesize: 28043,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-nfp-trading-guide-non-farm-payrolls-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11833,
          filename: 'blog-nfp-trading-guide-non-farm-payrolls-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-nfp-trading-guide-non-farm-payrolls-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 57902,
          filename: 'blog-nfp-trading-guide-non-farm-payrolls-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'The US Non-Farm Payrolls (NFP) report, released on the first Friday of every month at 13:30 GMT, measures the change in employment in the US excluding farm workers. It is one of the highest-impact economic events for currency traders.',
          },
        ],
      },
      {
        children: [
          {
            text: 'The key number to watch is the headline payrolls change. Consensus forecasts are published by major financial data providers. A significantly higher-than-expected reading is typically USD-bullish; a miss is USD-bearish.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Risk management is critical during NFP. Spreads can widen significantly in the minutes surrounding the release. Use limit orders where possible, reduce position sizes, and avoid running trades into the number unless you have a clear thesis.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:09.467Z',
    createdAt: '2026-08-31T13:14:07.203Z',
  },
  {
    id: 2,
    title: 'Gold Rally Stalls at $2,350 — What Traders Need to Watch',
    slug: 'gold-rally-stalls-2350-key-levels',
    status: 'published',
    publishedDate: '2026-08-28T13:13:48.063Z',
    category: 'analysis',
    author: 'Sarah Mitchell',
    excerpt:
      'Gold posted its fourth consecutive weekly gain but faces stiff resistance at $2,350. Here are the key levels for the week ahead.',
    featuredImage: {
      id: 5,
      alt: 'Gold Rally Stalls at $2,350 — What Traders Need to Watch',
      tags: [],
      updatedAt: '2026-08-31T13:13:58.035Z',
      createdAt: '2026-08-31T13:13:58.035Z',
      url: 'http://localhost:3001/media/blog-gold-rally-stalls-2350-key-levels-1.png',
      filename: 'blog-gold-rally-stalls-2350-key-levels-1.png',
      mimeType: 'image/png',
      filesize: 28758,
      width: 1200,
      height: 675,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/blog-gold-rally-stalls-2350-key-levels-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 11463,
          filename: 'blog-gold-rally-stalls-2350-key-levels-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/blog-gold-rally-stalls-2350-key-levels-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 57621,
          filename: 'blog-gold-rally-stalls-2350-key-levels-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'Gold (XAUUSD) has delivered a 6.5% rally over the past four weeks, fuelled by central bank buying, geopolitical uncertainty, and a softer US dollar. However, the price has stalled at the psychologically important $2,350 level.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Technical indicators suggest overbought conditions on the daily chart, with RSI touching 72. A pullback to the $2,290–2,300 zone is possible before the rally resumes.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Fundamental support remains strong. Central banks purchased a record 290 tonnes in Q1, and real yields are declining — both traditionally bullish for gold.',
          },
        ],
      },
    ],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:14:02.387Z',
    createdAt: '2026-08-31T13:14:00.139Z',
  },
];

export const STATIC_MARKET_ANALYSIS: CmsMarketAnalysis[] = [
  {
    id: 6,
    title: 'The ECB Rate Decision and What the Market Priced Wrong',
    slug: 'ecb-rate-decision-what-traders-missed',
    status: 'published',
    publishedDate: '2026-08-19T13:15:09.703Z',
    assetCategory: 'forex',
    editorialCategory: null,
    analyst: 'Marcus Webb',
    featuredImage: {
      id: 20,
      alt: 'The ECB Rate Decision and What the Market Priced Wrong',
      tags: [],
      updatedAt: '2026-08-31T13:15:47.050Z',
      createdAt: '2026-08-31T13:15:47.050Z',
      url: 'http://localhost:3001/media/analysis-ecb-rate-decision-what-traders-missed-1.png',
      filename: 'analysis-ecb-rate-decision-what-traders-missed-1.png',
      mimeType: 'image/png',
      filesize: 31591,
      width: 1200,
      height: 800,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/analysis-ecb-rate-decision-what-traders-missed-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 10225,
          filename: 'analysis-ecb-rate-decision-what-traders-missed-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/analysis-ecb-rate-decision-what-traders-missed-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 49758,
          filename: 'analysis-ecb-rate-decision-what-traders-missed-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: "The ECB's June decision was fully priced by markets — or so they thought. The surprise was not the cut itself but the accompanying statement, which removed the phrase 'data-dependent future cuts', signalling a slower path ahead.",
          },
        ],
      },
      {
        children: [
          {
            text: 'EUR/JPY had the largest single-session move of Q2: a 180-pip reversal from session highs. Traders who were positioned for a dovish follow-through were caught offside.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Lesson from the desk: price the press conference, not just the decision. Rate-sensitive pairs move on guidance, not rate changes that were already discounted weeks earlier.',
          },
        ],
      },
    ],
    chartEmbed: null,
    relatedInstruments: [],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:51.431Z',
    createdAt: '2026-08-31T13:15:49.168Z',
  },
  {
    id: 5,
    title: 'How Free Pip & Swap Calculators on Mobile Can Mislead You',
    slug: 'pip-swap-calculators-on-mobile',
    status: 'published',
    publishedDate: '2026-08-21T13:15:09.703Z',
    assetCategory: 'forex',
    editorialCategory: 'education',
    analyst: 'Sofia Reyes',
    featuredImage: {
      id: 19,
      alt: 'How Free Pip & Swap Calculators on Mobile Can Mislead You',
      tags: [],
      updatedAt: '2026-08-31T13:15:39.496Z',
      createdAt: '2026-08-31T13:15:39.496Z',
      url: 'http://localhost:3001/media/analysis-pip-swap-calculators-on-mobile-1.png',
      filename: 'analysis-pip-swap-calculators-on-mobile-1.png',
      mimeType: 'image/png',
      filesize: 31703,
      width: 1200,
      height: 800,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/analysis-pip-swap-calculators-on-mobile-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 10069,
          filename: 'analysis-pip-swap-calculators-on-mobile-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/analysis-pip-swap-calculators-on-mobile-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 49326,
          filename: 'analysis-pip-swap-calculators-on-mobile-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'Free pip and swap calculators in app stores use standardised assumptions: 100,000-unit lots, fixed pip values, and overnight rates sourced from generic benchmarks. Your broker uses different lot sizes, variable spreads, and rollover rates tied to interbank rates.',
          },
        ],
      },
      {
        children: [
          {
            text: "The error compounds when you trade exotic pairs or instruments with non-standard tick sizes. A CFD on an index has a completely different pip value calculation than a forex pair, and most free apps don't account for this.",
          },
        ],
      },
      {
        children: [
          {
            text: "Always use your broker's own calculator — or build your own in a spreadsheet using your account currency, the exact lot size, and the specific overnight swap rate from your platform's specification page.",
          },
        ],
      },
    ],
    chartEmbed: null,
    relatedInstruments: [],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:44.292Z',
    createdAt: '2026-08-31T13:15:42.036Z',
  },
  {
    id: 4,
    title: "A Trader's Guide to Understanding Slippage",
    slug: 'traders-guide-understanding-slippage',
    status: 'published',
    publishedDate: '2026-08-24T13:15:09.703Z',
    assetCategory: 'forex',
    editorialCategory: 'education',
    analyst: 'Sofia Reyes',
    featuredImage: {
      id: 18,
      alt: "A Trader's Guide to Understanding Slippage",
      tags: [],
      updatedAt: '2026-08-31T13:15:32.402Z',
      createdAt: '2026-08-31T13:15:32.402Z',
      url: 'http://localhost:3001/media/analysis-traders-guide-understanding-slippage-1.png',
      filename: 'analysis-traders-guide-understanding-slippage-1.png',
      mimeType: 'image/png',
      filesize: 31902,
      width: 1200,
      height: 800,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/analysis-traders-guide-understanding-slippage-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 10180,
          filename: 'analysis-traders-guide-understanding-slippage-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/analysis-traders-guide-understanding-slippage-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 50236,
          filename: 'analysis-traders-guide-understanding-slippage-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'Slippage is the difference between the price you expected when you placed an order and the price at which it was actually executed. It occurs in all markets but is most pronounced during periods of high volatility or low liquidity.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Positive slippage — getting a better fill than requested — is possible but rarer. Negative slippage is the norm during news events, market opens, and thin overnight sessions. Understanding the mechanics helps you choose the right order type and time of execution.',
          },
        ],
      },
      {
        children: [
          {
            text: "How to minimise slippage: use limit orders instead of market orders where possible, avoid trading during major news releases unless you have a defined edge, and review your broker's execution statistics before sizing up.",
          },
        ],
      },
    ],
    chartEmbed: null,
    relatedInstruments: [],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:36.741Z',
    createdAt: '2026-08-31T13:15:34.485Z',
  },
  {
    id: 3,
    title: 'Gold at $2,400 — Momentum or Top? Reading the COT Report',
    slug: 'gold-1400-momentum-or-top',
    status: 'published',
    publishedDate: '2026-08-26T13:15:09.703Z',
    assetCategory: 'commodities',
    editorialCategory: null,
    analyst: 'Daniel Osei',
    featuredImage: {
      id: 17,
      alt: 'Gold at $2,400 — Momentum or Top? Reading the COT Report',
      tags: [],
      updatedAt: '2026-08-31T13:15:25.336Z',
      createdAt: '2026-08-31T13:15:25.336Z',
      url: 'http://localhost:3001/media/analysis-gold-1400-momentum-or-top-1.png',
      filename: 'analysis-gold-1400-momentum-or-top-1.png',
      mimeType: 'image/png',
      filesize: 31917,
      width: 1200,
      height: 800,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/analysis-gold-1400-momentum-or-top-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 10203,
          filename: 'analysis-gold-1400-momentum-or-top-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/analysis-gold-1400-momentum-or-top-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 50111,
          filename: 'analysis-gold-1400-momentum-or-top-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'Gold is consolidating near all-time highs as markets reassess the inflation trajectory. A softer-than-expected CPI print could be the catalyst for a push toward the $2,400 psychological target.',
          },
        ],
      },
      {
        children: [
          {
            text: "The Commitment of Traders report shows managed money net longs at 18-month highs. That's a bullish signal — until it isn't. At extremes, positioning itself becomes the headwind as late longs run out of buyers.",
          },
        ],
      },
      {
        children: [
          {
            text: 'On the 4-hour chart, XAUUSD has built a strong base between $2,290 and $2,320. Strategy: Buy dips to $2,290–2,300 with a target at $2,380, stop at $2,260.',
          },
        ],
      },
    ],
    chartEmbed: null,
    relatedInstruments: [],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:29.666Z',
    createdAt: '2026-08-31T13:15:27.406Z',
  },
  {
    id: 2,
    title: 'The Volatility Trap: Three Setups Professional Traders Avoid',
    slug: 'volatility-trap-three-setups',
    status: 'published',
    publishedDate: '2026-08-28T13:15:09.703Z',
    assetCategory: 'etfs',
    editorialCategory: null,
    analyst: 'Priya Sharma',
    featuredImage: {
      id: 16,
      alt: 'The Volatility Trap: Three Setups Professional Traders Avoid',
      tags: [],
      updatedAt: '2026-08-31T13:15:18.143Z',
      createdAt: '2026-08-31T13:15:18.143Z',
      url: 'http://localhost:3001/media/analysis-volatility-trap-three-setups-1.png',
      filename: 'analysis-volatility-trap-three-setups-1.png',
      mimeType: 'image/png',
      filesize: 30754,
      width: 1200,
      height: 800,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/analysis-volatility-trap-three-setups-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 9974,
          filename: 'analysis-volatility-trap-three-setups-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/analysis-volatility-trap-three-setups-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 47180,
          filename: 'analysis-volatility-trap-three-setups-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: 'High Average True Range is not the same as tradeable edge. During earnings seasons and macro event weeks, ATR spikes, but bid-ask spreads widen, fills deteriorate, and stop-outs become almost inevitable.',
          },
        ],
      },
      {
        children: [
          {
            text: 'The three setups professionals avoid during high-ATR environments: (1) breakout entries on the first candle close above resistance, (2) mean-reversion fades into a trend driven by fundamentals, (3) any position sized at normal risk when overnight gap risk is elevated.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Edge comes from consistency and repeatability, not volatility. Reduce size, wait for spreads to normalise, and let amateurs pay the premium for excitement.',
          },
        ],
      },
    ],
    chartEmbed: null,
    relatedInstruments: [],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:22.600Z',
    createdAt: '2026-08-31T13:15:20.340Z',
  },
  {
    id: 1,
    title: "Why the Dollar's Next Move Starts in Frankfurt, Not Washington",
    slug: 'dollar-move-starts-frankfurt',
    status: 'published',
    publishedDate: '2026-08-30T13:15:09.703Z',
    assetCategory: 'forex',
    editorialCategory: null,
    analyst: 'Marcus Webb',
    featuredImage: {
      id: 15,
      alt: "Why the Dollar's Next Move Starts in Frankfurt, Not Washington",
      tags: [],
      updatedAt: '2026-08-31T13:15:10.754Z',
      createdAt: '2026-08-31T13:15:10.754Z',
      url: 'http://localhost:3001/media/analysis-dollar-move-starts-frankfurt-1.png',
      filename: 'analysis-dollar-move-starts-frankfurt-1.png',
      mimeType: 'image/png',
      filesize: 31466,
      width: 1200,
      height: 800,
      focalX: 50,
      focalY: 50,
      sizes: {
        thumbnail: {
          url: 'http://localhost:3001/media/analysis-dollar-move-starts-frankfurt-1-400x300.png',
          width: 400,
          height: 300,
          mimeType: 'image/png',
          filesize: 10042,
          filename: 'analysis-dollar-move-starts-frankfurt-1-400x300.png',
        },
        card: {
          url: 'http://localhost:3001/media/analysis-dollar-move-starts-frankfurt-1-768x1024.png',
          width: 768,
          height: 1024,
          mimeType: 'image/png',
          filesize: 48667,
          filename: 'analysis-dollar-move-starts-frankfurt-1-768x1024.png',
        },
      },
    },
    body: [
      {
        children: [
          {
            text: "ECB policy divergence is widening the EUR/USD range. The market's obsession with Fed rhetoric is masking the real driver of dollar strength: the pace of ECB rate cuts relative to the Fed hold.",
          },
        ],
      },
      {
        children: [
          {
            text: 'A deeper-than-expected ECB cut cycle would compress the yield differential sharply, pushing EUR/USD toward the 1.05 handle. The key data point to watch is not NFP — it is the EZ flash CPI print on the last Friday of each month.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Outlook: Dollar strength is more likely to originate from Frankfurt dovishness than Washington hawkishness. Position accordingly with a EUR/USD range of 1.0600–1.0950 for Q3.',
          },
        ],
      },
    ],
    chartEmbed: null,
    relatedInstruments: [],
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:15:15.345Z',
    createdAt: '2026-08-31T13:15:13.041Z',
  },
];

export const STATIC_RESEARCH_REPORTS: CmsResearchReport[] = [
  {
    id: 3,
    title: 'Gold in 2026: Safe-Haven Demand vs Real Yields',
    slug: 'gold-2026-safe-haven-real-yields',
    status: 'published',
    publishedDate: '2026-04-08T00:00:00.000Z',
    summary:
      'How structural central-bank buying, real-yield dynamics and ETF flows are reshaping the gold thesis for the year ahead.',
    reportFile: {
      id: 54,
      alt: 'Gold in 2026: Safe-Haven Demand vs Real Yields',
      tags: [],
      updatedAt: '2026-08-31T13:22:47.694Z',
      createdAt: '2026-08-31T13:22:47.694Z',
      url: '/images/market-commodities-dark.jpg',
      filename: 'gold-report-2026.pdf',
      mimeType: 'application/pdf',
      filesize: 584,
      width: null,
      height: null,
      focalX: null,
      focalY: null,
      sizes: {},
    },
    thumbnail: {
      id: 53,
      alt: 'Gold in 2026: Safe-Haven Demand vs Real Yields — report cover',
      tags: [],
      updatedAt: '2026-08-31T13:22:45.526Z',
      createdAt: '2026-08-31T13:22:45.526Z',
      url: '/images/market-commodities-dark.jpg',
      filename: 'market-commodities-dark.jpg',
      mimeType: 'image/jpeg',
      filesize: 113107,
      width: 800,
      height: 1000,
      focalX: 50,
      focalY: 50,
      sizes: {},
    },
    isGated: false,
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:22:52.158Z',
    createdAt: '2026-08-31T13:22:49.884Z',
  },
  {
    id: 2,
    title: 'MENA FX Quarterly: Dollar Dominance & Oil Crosscurrents',
    slug: 'mena-fx-quarterly-2026',
    status: 'published',
    publishedDate: '2026-05-12T00:00:00.000Z',
    summary:
      'A regional currency report covering AED, SAR, EGP and the trade-weighted dollar, with positioning ideas for MENA-based traders.',
    reportFile: {
      id: 52,
      alt: 'MENA FX Quarterly: Dollar Dominance & Oil Crosscurrents',
      tags: [],
      updatedAt: '2026-08-31T13:22:38.357Z',
      createdAt: '2026-08-31T13:22:38.357Z',
      url: '/images/market-forex-dark.jpg',
      filename: 'mena-fx-quarterly-2026.pdf',
      mimeType: 'application/pdf',
      filesize: 593,
      width: null,
      height: null,
      focalX: null,
      focalY: null,
      sizes: {},
    },
    thumbnail: {
      id: 51,
      alt: 'MENA FX Quarterly: Dollar Dominance & Oil Crosscurrents — report cover',
      tags: [],
      updatedAt: '2026-08-31T13:22:36.211Z',
      createdAt: '2026-08-31T13:22:36.211Z',
      url: '/images/market-forex-dark.jpg',
      filename: 'market-forex-dark.jpg',
      mimeType: 'image/jpeg',
      filesize: 98603,
      width: 800,
      height: 1000,
      focalX: 50,
      focalY: 50,
      sizes: {},
    },
    isGated: true,
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:22:42.797Z',
    createdAt: '2026-08-31T13:22:40.526Z',
  },
  {
    id: 1,
    title: 'Q3 2026 Global Macro Outlook',
    slug: 'q3-2026-global-macro-outlook',
    status: 'published',
    publishedDate: '2026-06-01T00:00:00.000Z',
    summary:
      'Our 28-page deep dive into central bank trajectories, the dollar cycle, and the asset classes positioned to outperform through Q3 2026.',
    reportFile: {
      id: 50,
      alt: 'Q3 2026 Global Macro Outlook',
      tags: [],
      updatedAt: '2026-08-31T13:22:29.011Z',
      createdAt: '2026-08-31T13:22:29.011Z',
      url: '/images/market-indices-dark.jpg',
      filename: 'q3-macro-outlook-2026.pdf',
      mimeType: 'application/pdf',
      filesize: 566,
      width: null,
      height: null,
      focalX: null,
      focalY: null,
      sizes: {},
    },
    thumbnail: {
      id: 49,
      alt: 'Q3 2026 Global Macro Outlook — report cover',
      tags: [],
      updatedAt: '2026-08-31T13:22:26.911Z',
      createdAt: '2026-08-31T13:22:26.911Z',
      url: '/images/market-indices-dark.jpg',
      filename: 'market-indices-dark.jpg',
      mimeType: 'image/jpeg',
      filesize: 50954,
      width: 800,
      height: 1000,
      focalX: 50,
      focalY: 50,
      sizes: {},
    },
    isGated: true,
    seoTitle: null,
    seoDescription: null,
    updatedAt: '2026-08-31T13:22:33.448Z',
    createdAt: '2026-08-31T13:22:31.177Z',
  },
];
