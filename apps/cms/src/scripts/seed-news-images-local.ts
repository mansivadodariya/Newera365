import 'dotenv/config';
import fs from 'fs';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

/**
 * Seed script to populate News and Blog posts in Payload CMS with real uploaded media images.
 * Run with: npx tsx src/scripts/seed-news-images-local.ts
 */
async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error('PAYLOAD_SECRET environment variable must be set');
  }

  console.log('🚀 Initializing Payload CMS for News & Blog Media Seeding...');
  await payload.init({ secret, local: true });

  const webImagesDir = path.resolve(__dirname, '../../../web/public/images');
  console.log(`📁 Web images directory: ${webImagesDir}`);

  // Helper to upload media file to Payload CMS Media collection
  const uploadedMediaCache: Record<string, number> = {};
  async function getOrUploadMedia(fileName: string, altText: string): Promise<number | null> {
    if (uploadedMediaCache[fileName]) {
      return uploadedMediaCache[fileName];
    }
    const filePath = path.join(webImagesDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️ Image file not found: ${filePath}`);
      return null;
    }
    try {
      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: altText },
        filePath,
        overrideAccess: true,
      });
      const id = mediaDoc.id as number;
      uploadedMediaCache[fileName] = id;
      console.log(`   📸 Uploaded media "${fileName}" (ID: ${id})`);
      return id;
    } catch (err) {
      console.error(`   ❌ Failed to upload media "${fileName}":`, err);
      return null;
    }
  }

  // 1. Seed News Articles
  console.log('\n📰 Seeding News Articles with CMS Media...');
  const existingNews = await payload.find({ collection: 'news', limit: 100 });
  for (const doc of existingNews.docs) {
    await payload.delete({ collection: 'news', id: doc.id, overrideAccess: true });
  }

  const newsItems = [
    {
      headline: 'Fed Holds Rates Steady, Signals Two Cuts in 2026',
      headlineAr: 'الفيدرالي يثبّت الفائدة ويشير إلى خفضين في 2026',
      slug: 'fed-holds-rates-signals-two-cuts-2026',
      source: 'Reuters',
      category: 'forex',
      fileName: 'market-forex-dark.jpg',
      publishedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      headline: 'Gold Hits Record High Above $2,400 on Safe-Haven Demand',
      headlineAr: 'الذهب يسجّل أعلى مستوياته التاريخية فوق 2,400 دولار',
      slug: 'gold-record-high-2400-safe-haven',
      source: 'Bloomberg',
      category: 'commodities',
      fileName: 'market-commodities-dark.jpg',
      publishedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      headline: 'Bitcoin Surges Past $70,000 as ETF Inflows Accelerate',
      headlineAr: 'البيتكوين يتجاوز 70,000 دولار مع تسارع تدفقات ETF',
      slug: 'bitcoin-surges-70000-etf-inflows',
      source: 'CoinDesk',
      category: 'crypto',
      fileName: 'market-crypto-dark.jpg',
      publishedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      headline: 'ECB Minutes Signal Caution Ahead of June Meeting',
      headlineAr: 'محاضر البنك المركزي الأوروبي تشير إلى تحفظ قبيل اجتماع يونيو',
      slug: 'ecb-minutes-caution-june-meeting',
      source: 'FT',
      category: 'forex',
      fileName: 'market-forex-dark.jpg',
      publishedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      headline: 'US Stocks Hit All-Time Highs on Strong Earnings Season',
      headlineAr: 'الأسهم الأمريكية تسجّل مستويات قياسية مع موسم أرباح قوي',
      slug: 'us-stocks-all-time-high-earnings',
      source: 'WSJ',
      category: 'indices',
      fileName: 'market-indices-dark.jpg',
      publishedDate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ] as const;

  for (const n of newsItems) {
    const mediaId = await getOrUploadMedia(n.fileName, n.headline);
    const created = await payload.create({
      collection: 'news',
      data: {
        headline: n.headline,
        slug: n.slug,
        source: n.source,
        category: n.category as
          | 'forex'
          | 'commodities'
          | 'indices'
          | 'crypto'
          | 'company'
          | 'regulation',
        publishedDate: n.publishedDate,
        status: 'published',
        ...(mediaId ? { featuredImage: mediaId } : {}),
      },
      overrideAccess: true,
    });
    if (n.headlineAr) {
      await payload.update({
        collection: 'news',
        id: created.id,
        locale: 'ar',
        data: { headline: n.headlineAr },
        overrideAccess: true,
      });
    }
    console.log(`   ✅ News created: "${n.headline}" (Media ID: ${mediaId ?? 'none'})`);
  }

  // 2. Seed Blog Posts
  console.log('\n📝 Seeding Blog Posts with CMS Media...');
  const existingBlog = await payload.find({ collection: 'blog-posts', limit: 100 });
  for (const doc of existingBlog.docs) {
    await payload.delete({ collection: 'blog-posts', id: doc.id, overrideAccess: true });
  }

  const blogItems = [
    {
      title: 'EUR/USD Weekly Outlook: Fed Signals Limit Upside',
      titleAr: 'توقعات يورو/دولار الأسبوعية: إشارات الفيدرالي تحد من الارتفاع',
      slug: 'eurusd-weekly-outlook-fed-signals',
      category: 'market-news',
      fileName: 'market-forex-dark.jpg',
      publishedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      excerpt:
        'EUR/USD trades near 1.0850 as Federal Reserve commentary dampens expectations of near-term rate cuts.',
    },
    {
      title: 'Gold Rally Stalls at $2,350 — What Traders Need to Watch',
      titleAr: 'استقرار ارتفاع الذهب عند 2,350 دولار — ما يجب على المتداولين مراقبته',
      slug: 'gold-rally-stalls-2350-traders-watch',
      category: 'analysis',
      fileName: 'market-commodities-dark.jpg',
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt:
        'Gold posted its fourth consecutive weekly gain but faces stiff resistance at $2,350. Here are key technical levels.',
    },
    {
      title: 'NFP Trading Guide: How to Trade the US Non-Farm Payrolls',
      titleAr: 'دليل تداول الوظائف غير الزراعية: كيف تتداول تقرير NFP الأمريكي',
      slug: 'nfp-trading-guide-non-farm-payrolls',
      category: 'tutorials',
      fileName: 'hero-green-chart.jpg',
      publishedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt:
        'The monthly Non-Farm Payrolls report is one of the most volatile events in forex. Here is how to trade it safely.',
    },
    {
      title: 'GBP/USD Technical Outlook: BoE Rate Decision in Focus',
      titleAr: 'التوقعات الفنية للباوند/دولار: قرار الفائدة للبنك المركزي في بؤرة الاهتمام',
      slug: 'gbpusd-technical-outlook-boe-rate',
      category: 'market-news',
      fileName: 'market-forex-dark.jpg',
      publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt:
        'Cable holds above 1.2700 as traders position ahead of Bank of England monetary policy decision.',
    },
    {
      title: 'Oil at $85: OPEC+ Cuts Hold — But for How Long?',
      titleAr: 'النفط عند 85 دولار: تخفيضات أوبك+ تستمر — ولكن إلى متى؟',
      slug: 'oil-85-opec-cuts-hold-how-long',
      category: 'analysis',
      fileName: 'market-commodities-dark.jpg',
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt:
        'Crude oil is holding above $85/bbl as OPEC+ production cuts support prices, but demand concerns from Asia remain.',
    },
    {
      title: 'US Dollar Index Tests 105 — Key Macro Drivers This Week',
      titleAr: 'مؤشر الدولار الأمريكي يختبر 105 — المحركات الاقتصادية الكلية هذا الأسبوع',
      slug: 'us-dollar-index-tests-105-macro-drivers',
      category: 'market-news',
      fileName: 'market-indices-dark.jpg',
      publishedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt:
        'DXY pushes toward 105 as stronger US data reshapes rate expectations. Here are the macro events that could shift momentum.',
    },
  ] as const;

  for (const b of blogItems) {
    const mediaId = await getOrUploadMedia(b.fileName, b.title);
    const created = await payload.create({
      collection: 'blog-posts',
      data: {
        title: b.title,
        slug: b.slug,
        category: b.category as 'market-news' | 'analysis' | 'tutorials' | 'company-updates',
        publishedDate: b.publishedDate,
        excerpt: b.excerpt,
        body: [
          {
            children: [{ text: b.excerpt }],
          },
        ],
        status: 'published',
        ...(mediaId ? { featuredImage: mediaId } : {}),
      },
      overrideAccess: true,
    });
    if (b.titleAr) {
      await payload.update({
        collection: 'blog-posts',
        id: created.id,
        locale: 'ar',
        data: { title: b.titleAr },
        overrideAccess: true,
      });
    }
    console.log(`   ✅ Blog post created: "${b.title}" (Media ID: ${mediaId ?? 'none'})`);
  }

  console.log('\n🎉 News & Blog Media Seeding Completed Successfully!\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ News Media Seeding Failed:', err);
  process.exit(1);
});
