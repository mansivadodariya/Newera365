/**
 * seed-extra-content.ts
 *
 * ADDITIVE, idempotent UAT filler for the two main content listings:
 *   - news            (/news)      → +5 bilingual items
 *   - market-analysis (/research)  → +4 bilingual articles
 *
 * Unlike the per-collection seeders in seed.ts, this script NEVER deletes — it
 * only creates rows whose slug does not already exist, so it is safe to re-run
 * and safe to run against a populated database. Uses Payload's LOCAL API
 * (overrideAccess) so no admin login is required.
 *
 * Run: ts-node --transpile-only src/scripts/seed-extra-content.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
// Slate-style rich text: array of paragraph nodes (matches seed.ts bodyBlocks()).
const rt = (...paras: string[]) => paras.map((p) => ({ children: [{ text: p }] }));

const news: Array<{
  en: { headline: string; slug: string; source: string; category: string };
  ar: { headline: string };
  publishedDate: string;
}> = [
  {
    en: {
      headline: 'Oil Steadies Near $82 as OPEC+ Extends Voluntary Cuts',
      slug: 'oil-steadies-82-opec-extends-cuts',
      source: 'Reuters',
      category: 'commodities',
    },
    ar: { headline: 'النفط يستقر قرب 82 دولاراً مع تمديد أوبك+ للتخفيضات الطوعية' },
    publishedDate: daysAgo(0),
  },
  {
    en: {
      headline: 'Dollar Index Slips as Treasury Yields Retreat From Highs',
      slug: 'dollar-index-slips-yields-retreat',
      source: 'Bloomberg',
      category: 'forex',
    },
    ar: { headline: 'مؤشر الدولار يتراجع مع انحسار عوائد سندات الخزانة عن قممها' },
    publishedDate: daysAgo(1),
  },
  {
    en: {
      headline: 'Nikkei 225 Closes at Multi-Decade High on Yen Weakness',
      slug: 'nikkei-225-multi-decade-high-yen',
      source: 'FT',
      category: 'indices',
    },
    ar: { headline: 'نيكاي 225 يغلق عند أعلى مستوى منذ عقود مع ضعف الين' },
    publishedDate: daysAgo(2),
  },
  {
    en: {
      headline: 'Ethereum Rallies on Spot ETF Approval Speculation',
      slug: 'ethereum-rallies-spot-etf-speculation',
      source: 'CoinDesk',
      category: 'crypto',
    },
    ar: { headline: 'الإيثيريوم يرتفع وسط تكهنات بالموافقة على صندوق ETF الفوري' },
    publishedDate: daysAgo(3),
  },
  {
    en: {
      headline: 'Sterling Firms Ahead of Bank of England Policy Decision',
      slug: 'sterling-firms-boe-policy-decision',
      source: 'WSJ',
      category: 'forex',
    },
    ar: { headline: 'الجنيه الإسترليني يتماسك قبيل قرار بنك إنجلترا للسياسة النقدية' },
    publishedDate: daysAgo(4),
  },
];

const analyses: Array<{
  assetCategory: string;
  publishedDate: string;
  en: {
    title: string;
    slug: string;
    analyst: string;
    summary: string;
    body: ReturnType<typeof rt>;
  };
  ar: { title: string; analyst: string; summary: string; body: ReturnType<typeof rt> };
}> = [
  {
    assetCategory: 'commodities',
    publishedDate: daysAgo(1),
    en: {
      title: "Gold's Real-Yield Anchor: Why $2,400 Isn't the Ceiling",
      slug: 'gold-real-yield-anchor-2400',
      analyst: 'Layla Haddad',
      summary:
        'Gold trades less on headlines and more on real yields. With 10-year TIPS drifting lower, the metal has room above $2,400.',
      body: rt(
        'The popular narrative ties every gold move to geopolitics, but the cleaner signal is the 10-year real yield. When inflation-protected yields fall, the opportunity cost of holding a non-yielding asset drops — and gold bids.',
        'Central-bank buying has put a structural floor under the market that did not exist a decade ago. Reserve diversification away from the dollar is a multi-year flow, not a single-quarter trade.',
        'Outlook: a break and hold above $2,400 opens $2,520 as the next measured target, provided real yields stay capped. A sharp rebound in yields is the main risk to the thesis.',
      ),
    },
    ar: {
      title: 'مرساة الذهب في العوائد الحقيقية: لماذا لا يمثّل 2,400 دولار سقفاً',
      analyst: 'ليلى حداد',
      summary:
        'يتحرك الذهب وفق العوائد الحقيقية أكثر من العناوين. ومع تراجع عوائد السندات المحمية من التضخم لأجل عشر سنوات، يملك المعدن مجالاً فوق 2,400 دولار.',
      body: rt(
        'تربط الرواية الشائعة كل حركة للذهب بالجغرافيا السياسية، لكن الإشارة الأوضح هي العائد الحقيقي لأجل عشر سنوات. فحين تتراجع العوائد المحمية من التضخم، تنخفض كلفة الفرصة البديلة لحيازة أصل لا يدرّ عائداً، فيرتفع الطلب على الذهب.',
        'وضعت مشتريات البنوك المركزية أرضية هيكلية للسوق لم تكن موجودة قبل عقد. فتنويع الاحتياطيات بعيداً عن الدولار تدفّق ممتد لسنوات وليس صفقة ربع واحد.',
        'النظرة المستقبلية: يفتح الاختراق والثبات فوق 2,400 دولار الباب نحو 2,520 دولاراً كهدف قياسي تالٍ، شريطة بقاء العوائد الحقيقية مكبوحة. ويبقى الارتداد الحاد في العوائد الخطر الأبرز على هذه الفرضية.',
      ),
    },
  },
  {
    assetCategory: 'forex',
    publishedDate: daysAgo(2),
    en: {
      title: 'The Yen Carry Trade Is Quietly Rebuilding',
      slug: 'yen-carry-trade-rebuilding',
      analyst: 'Marcus Webb',
      summary:
        'A wide rate differential and low volatility are coaxing carry positions back into USD/JPY. The setup rhymes with prior unwinds.',
      body: rt(
        'With the Fed on hold and the BoJ normalising at a glacial pace, the yield gap remains the widest in the G10. That differential is the fuel for carry, and positioning data shows it quietly rebuilding.',
        'The danger is not the carry itself but the exit. Crowded carry trades unwind violently when volatility spikes, and USD/JPY has a history of 5-figure single-session moves on intervention or risk-off shocks.',
        'Outlook: trend-followers stay long the differential while implied vol is suppressed, but tight risk controls are non-negotiable into any BoJ meeting.',
      ),
    },
    ar: {
      title: 'صفقة المناقلة على الين تُعاد بناؤها بهدوء',
      analyst: 'ماركوس ويب',
      summary:
        'فارق فائدة واسع وتذبذب منخفض يعيدان صفقات المناقلة إلى الدولار/الين. والإعداد يشبه عمليات التصفية السابقة.',
      body: rt(
        'مع ثبات الفيدرالي وتطبيع بنك اليابان ببطء شديد، يبقى فارق العائد الأوسع في مجموعة العملات العشر الكبرى. وهذا الفارق هو وقود المناقلة، وتُظهر بيانات المراكز أنه يُعاد بناؤه بهدوء.',
        'الخطر ليس في المناقلة ذاتها بل في الخروج منها. فصفقات المناقلة المزدحمة تُصفّى بعنف عند ارتفاع التذبذب، وللدولار/الين تاريخ في تحركات حادة خلال جلسة واحدة عند التدخل أو صدمات تجنّب المخاطر.',
        'النظرة المستقبلية: يبقى متتبعو الاتجاه على مراكز شرائية على الفارق طالما بقي التذبذب الضمني مكبوحاً، لكن ضوابط المخاطر الصارمة غير قابلة للتفاوض قبيل أي اجتماع لبنك اليابان.',
      ),
    },
  },
  {
    assetCategory: 'crypto',
    publishedDate: daysAgo(3),
    en: {
      title: "Crypto's Correlation Break: BTC vs the Nasdaq in 2026",
      slug: 'crypto-correlation-break-2026',
      analyst: 'Daniel Cho',
      summary:
        'Bitcoin spent years trading like a leveraged tech stock. The 2026 data shows that link finally loosening.',
      body: rt(
        'For most of the last cycle, Bitcoin behaved like high-beta Nasdaq exposure — up on risk-on days, down when rates spiked. That made it easy to model but hard to justify as a diversifier.',
        'The rolling 90-day correlation has compressed sharply this year as spot-ETF flows introduced a buyer base with a different time horizon than leveraged crypto-natives.',
        'Outlook: a durable correlation break would strengthen the portfolio case for a small structural allocation, but liquidity remains thin enough that macro shocks can still re-couple the assets overnight.',
      ),
    },
    ar: {
      title: 'كسر الارتباط في الكريبتو: البيتكوين مقابل ناسداك في 2026',
      analyst: 'دانيال تشو',
      summary:
        'تداولت البيتكوين لسنوات كسهم تقني برافعة مالية. وتُظهر بيانات 2026 أن هذا الارتباط يتراخى أخيراً.',
      body: rt(
        'خلال معظم الدورة السابقة، تصرّفت البيتكوين كأداة عالية الحساسية مرتبطة بناسداك — ترتفع في أيام الإقبال على المخاطر وتهبط عند قفزات الفائدة. وهذا جعل نمذجتها سهلة لكن تبريرها كأداة تنويع صعباً.',
        'انضغط الارتباط المتحرك على مدى تسعين يوماً بحدّة هذا العام مع إدخال تدفقات صناديق ETF الفورية قاعدة مشترين بأفق زمني مختلف عن المتداولين الأصليين بالرافعة.',
        'النظرة المستقبلية: من شأن كسر دائم للارتباط أن يعزّز مبرّر تخصيص هيكلي صغير في المحفظة، لكن السيولة تبقى رقيقة بما يكفي لأن تعيد الصدمات الكلية ربط الأصول بين ليلة وضحاها.',
      ),
    },
  },
  {
    assetCategory: 'commodities',
    publishedDate: daysAgo(5),
    en: {
      title: 'Why the Brent–WTI Spread Is the Trade Few Are Watching',
      slug: 'brent-wti-spread-trade',
      analyst: 'Layla Haddad',
      summary:
        'Outright crude grabs headlines, but the Brent–WTI spread quietly prices freight, shale supply, and export policy.',
      body: rt(
        'Most retail flow chases the outright oil price, yet the relative-value story sits in the Brent–WTI spread. It encodes transatlantic freight costs, US shale output, and the politics of export licences in a single number.',
        'A widening spread typically signals abundant landlocked US supply relative to seaborne demand; a narrowing spread often precedes export bottlenecks or Gulf-coast disruptions.',
        'Outlook: range-trade the spread around its seasonal mean and fade extremes, but respect that a single hurricane or pipeline outage can reset the regime within days.',
      ),
    },
    ar: {
      title: 'لماذا يُعدّ فارق برنت–غرب تكساس الصفقة التي يراقبها قلّة',
      analyst: 'ليلى حداد',
      summary:
        'يخطف السعر المطلق للنفط العناوين، لكن فارق برنت–غرب تكساس يسعّر بهدوء الشحن والإمداد الصخري وسياسة التصدير.',
      body: rt(
        'يلاحق معظم تدفق الأفراد السعر المطلق للنفط، بينما تكمن قصة القيمة النسبية في فارق برنت–غرب تكساس. فهو يختزل كلفة الشحن عبر الأطلسي وإنتاج الصخر الأمريكي وسياسات تراخيص التصدير في رقم واحد.',
        'يشير اتساع الفارق عادةً إلى وفرة الإمداد الأمريكي المحصور برّياً مقابل الطلب المنقول بحراً؛ بينما يسبق ضيق الفارق غالباً اختناقات التصدير أو اضطرابات ساحل الخليج.',
        'النظرة المستقبلية: تداول الفارق ضمن نطاق حول متوسطه الموسمي مع تلاشي التطرفات، مع احترام أن إعصاراً واحداً أو تعطّل أنبوب قد يعيد ضبط النظام خلال أيام.',
      ),
    },
  },
];

async function ensureNews(item: (typeof news)[number]): Promise<'created' | 'skipped'> {
  const existing = await payload.find({
    collection: 'news',
    where: { slug: { equals: item.en.slug } },
    limit: 1,
    locale: 'en',
  });
  if (existing.docs.length) return 'skipped';
  const doc = await payload.create({
    collection: 'news',
    locale: 'en',
    data: {
      headline: item.en.headline,
      slug: item.en.slug,
      source: item.en.source,
      category: item.en.category,
      publishedDate: item.publishedDate,
      status: 'published',
    } as never,
  });
  await payload.update({
    collection: 'news',
    id: doc.id,
    locale: 'ar',
    data: { headline: item.ar.headline } as never,
  });
  return 'created';
}

async function ensureAnalysis(item: (typeof analyses)[number]): Promise<'created' | 'skipped'> {
  const existing = await payload.find({
    collection: 'market-analysis',
    where: { slug: { equals: item.en.slug } },
    limit: 1,
    locale: 'en',
  });
  if (existing.docs.length) return 'skipped';
  const doc = await payload.create({
    collection: 'market-analysis',
    locale: 'en',
    data: {
      title: item.en.title,
      slug: item.en.slug,
      analyst: item.en.analyst,
      summary: item.en.summary,
      body: item.en.body,
      assetCategory: item.assetCategory,
      publishedDate: item.publishedDate,
      status: 'published',
    } as never,
  });
  await payload.update({
    collection: 'market-analysis',
    id: doc.id,
    locale: 'ar',
    data: {
      title: item.ar.title,
      analyst: item.ar.analyst,
      summary: item.ar.summary,
      body: item.ar.body,
    } as never,
  });
  return 'created';
}

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  let created = 0;
  let skipped = 0;
  console.log('\n📰 News (additive)...');
  for (const item of news) {
    const r = await ensureNews(item);
    console.log(`   ${r === 'created' ? '✅ created' : '⏭️  exists '} ${item.en.slug}`);
    if (r === 'created') created++;
    else skipped++;
  }
  console.log('\n📊 Market analysis (additive)...');
  for (const item of analyses) {
    const r = await ensureAnalysis(item);
    console.log(`   ${r === 'created' ? '✅ created' : '⏭️  exists '} ${item.en.slug}`);
    if (r === 'created') created++;
    else skipped++;
  }

  console.log(`\n✅ Done — ${created} created, ${skipped} already present (EN + AR).`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-extra-content failed:', err);
  process.exit(1);
});
