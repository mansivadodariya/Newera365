/**
 * Targeted education-content re-seed (runs standalone, CMS must be on :3001)
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CMS = 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'demo@newera.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS || 'password123';
let token = '';

async function api(method, p, body, params) {
  const url = new URL(CMS + '/api' + p);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'JWT ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`${method} ${p} → ${res.status}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

async function post(col, data, locale = 'en') {
  try {
    const res = await api('POST', '/' + col, data, { locale });
    return res.doc ?? res;
  } catch (e) {
    const m = e.message;
    if (m.includes('unique') || m.includes('400') || m.includes('500')) return { id: -1 };
    throw e;
  }
}

async function patch(col, id, data, locale) {
  if (id === -1) return {};
  try {
    const res = await api('PATCH', '/' + col + '/' + id, data, { locale });
    return res.doc ?? res;
  } catch {
    return {};
  }
}

async function deleteAll(col) {
  const res = await api('GET', '/' + col, undefined, { limit: '200', depth: '0' }).catch(() => ({
    docs: [],
  }));
  const docs = res.docs || [];
  for (const doc of docs) await api('DELETE', '/' + col + '/' + doc.id).catch(() => {});
  if (docs.length) console.log(`  🗑️  Deleted ${docs.length} ${col} docs`);
}

const richText = (t) => [{ children: [{ text: t }] }];
const bodyBlocks = (...ps) => ps.flatMap((p) => [{ children: [{ text: p }] }]);

async function main() {
  console.log('\n🌱 Education Content Re-seed\n');

  console.log('🔑 Logging in...');
  const d = await api('POST', '/users/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
  token = d.token;
  console.log('   ✅ Authenticated as', ADMIN_EMAIL);

  console.log('🎓 Education Content...');
  await deleteAll('education-content');

  // ── Guides ──────────────────────────────────────────────────────────────
  const guides = [
    {
      slug: 'introduction-to-forex-trading',
      seoDescription:
        'Learn forex trading from scratch with our beginner guide to currency pairs, quotes and how to place your first trade.',
      en: {
        title: 'Introduction to Forex Trading',
        body: bodyBlocks(
          'Forex (foreign exchange) is the largest financial market in the world, with over $7 trillion traded daily. In this guide, you will learn the fundamentals of forex trading — how currency pairs work, how to read quotes, and how to place your first trade.',
          'THE FOREX MARKET: Currency pairs are quoted as the price of one currency in terms of another. EUR/USD at 1.0850 means it costs $1.0850 to buy 1 EUR.',
          'HOW TO GET STARTED: Open a demo account, practice reading charts, learn to manage risk, and only move to live trading once you are consistently profitable on the demo.',
        ),
      },
      ar: {
        title: 'مقدمة في تداول الفوركس',
        body: bodyBlocks(
          'الفوركس (تبادل العملات الأجنبية) هو أكبر سوق مالي في العالم، حيث يتم تداول ما يزيد على 7 تريليون دولار يومياً.',
          'كيف تعمل أزواج العملات: يُقتبس زوج EUR/USD عند 1.0850 مما يعني أن 1 يورو يساوي 1.0850 دولار.',
          'كيف تبدأ: افتح حساباً تجريبياً، وتدرّب على قراءة الرسوم البيانية، وتعلّم إدارة المخاطر.',
        ),
      },
    },
    {
      slug: 'metatrader-5-complete-guide',
      seoDescription:
        'The complete guide to MetaTrader 5 — installation, placing orders, using EAs, and advanced chart analysis.',
      en: {
        title: 'MetaTrader 5 Complete Guide',
        body: bodyBlocks(
          'MetaTrader 5 (MT5) is the industry-standard trading platform used by millions of traders worldwide. This guide covers everything from installation to advanced order types.',
          'INSTALLING MT5: Download MT5 from the NewEra365 client portal or directly from MetaQuotes. Enter your account credentials to log in.',
          'PLACING ORDERS: Click New Order or press F9. Enter the symbol, volume, stop loss and take profit. Choose between market order (instant fill) or limit/stop orders.',
        ),
      },
      ar: {
        title: 'الدليل الكامل لـ MetaTrader 5',
        body: bodyBlocks(
          'MetaTrader 5 هي منصة التداول المعيارية في الصناعة التي يستخدمها الملايين حول العالم.',
          'تثبيت MT5: نزّل MT5 من بوابة عميل نيو إيرا 365 مباشرة. أدخل بيانات حسابك لتسجيل الدخول.',
          'تنفيذ الأوامر: انقر على أمر جديد أو اضغط F9. أدخل الرمز والحجم ووقف الخسارة وجني الأرباح.',
        ),
      },
    },
    {
      slug: 'risk-management-for-traders',
      seoDescription:
        'Master risk management in trading. Learn position sizing, stop-loss strategies, and risk-to-reward ratios.',
      en: {
        title: 'Risk Management for Traders',
        body: bodyBlocks(
          'Proper risk management separates successful traders from those who blow their accounts. This guide covers position sizing, stop-loss placement, and risk-to-reward ratios.',
          'THE 1-2% RULE: Never risk more than 1-2% of your trading capital on a single trade. This ensures you can survive a run of losses without depleting your account.',
          'STOP-LOSS PLACEMENT: Always place a stop loss when entering a trade. Use technical levels (support/resistance, recent swing highs/lows) rather than arbitrary pip values.',
        ),
      },
      ar: {
        title: 'إدارة المخاطر للمتداولين',
        body: bodyBlocks(
          'إدارة المخاطر الصحيحة تميّز المتداولين الناجحين عن غيرهم.',
          'قاعدة 1-2%: لا تخاطر بأكثر من 1-2% من رأس مالك في صفقة واحدة.',
          'وضع وقف الخسارة: ضع دائماً وقف خسارة عند الدخول في صفقة.',
        ),
      },
    },
  ];

  for (const g of guides) {
    const doc = await post('education-content', {
      title: g.en.title,
      slug: g.slug,
      contentType: 'guide',
      body: g.en.body,
      seoDescription: g.seoDescription,
      status: 'published',
    });
    await patch('education-content', doc.id, { title: g.ar.title, body: g.ar.body }, 'ar');
  }

  // ── Glossary Terms ────────────────────────────────────────────────────────
  const terms = [
    {
      slug: 'pip',
      glossaryCategory: 'PRICING',
      en: {
        glossaryTerm: 'Pip',
        body: richText(
          'A pip (percentage in point) is the smallest standard price movement in forex trading. For most currency pairs, 1 pip equals 0.0001.',
        ),
      },
      ar: {
        glossaryTerm: 'نقطة (بيب)',
        body: richText(
          'النقطة (pip) هي أصغر حركة سعرية معيارية في تداول الفوركس. لمعظم أزواج العملات، 1 نقطة تساوي 0.0001.',
        ),
      },
    },
    {
      slug: 'spread',
      glossaryCategory: 'PRICING',
      en: {
        glossaryTerm: 'Spread',
        body: richText(
          'The spread is the difference between the bid (sell) price and the ask (buy) price. It is the primary cost of trading.',
        ),
      },
      ar: {
        glossaryTerm: 'فارق السعر',
        body: richText(
          'فارق السعر هو الفرق بين سعر العرض (البيع) وسعر الطلب (الشراء). هو التكلفة الرئيسية للتداول.',
        ),
      },
    },
    {
      slug: 'leverage',
      glossaryCategory: 'RISK',
      en: {
        glossaryTerm: 'Leverage',
        body: richText(
          'Leverage allows traders to control a larger position size than their capital alone would permit. 1:100 leverage means $1,000 controls $100,000 in the market.',
        ),
      },
      ar: {
        glossaryTerm: 'الرافعة المالية',
        body: richText(
          'تسمح الرافعة المالية للمتداولين بالتحكم في حجم مركز أكبر مما يسمح به رأس مالهم.',
        ),
      },
    },
    {
      slug: 'margin',
      glossaryCategory: 'RISK',
      en: {
        glossaryTerm: 'Margin',
        body: richText(
          'Margin is the collateral required to open and maintain a leveraged position. It is expressed as a percentage of the full position value.',
        ),
      },
      ar: {
        glossaryTerm: 'الهامش',
        body: richText(
          'الهامش هو الضمان المطلوب لفتح والحفاظ على مركز مرفوع. يُعبَّر عنه كنسبة مئوية من القيمة الكاملة للمركز.',
        ),
      },
    },
    {
      slug: 'stop-loss',
      glossaryCategory: 'ORDER/EXEC',
      en: {
        glossaryTerm: 'Stop Loss',
        body: richText(
          'A stop-loss order automatically closes a trade at a specified price to limit losses. It is an essential risk management tool.',
        ),
      },
      ar: {
        glossaryTerm: 'وقف الخسارة',
        body: richText(
          'أمر وقف الخسارة يغلق تلقائياً صفقة عند سعر محدد للحد من الخسائر. هو أداة أساسية لإدارة المخاطر.',
        ),
      },
    },
  ];

  for (const t of terms) {
    const doc = await post('education-content', {
      title: t.en.glossaryTerm,
      slug: t.slug,
      contentType: 'glossary',
      glossaryTerm: t.en.glossaryTerm,
      body: t.en.body,
      glossaryCategory: t.glossaryCategory,
      status: 'published',
    });
    await patch(
      'education-content',
      doc.id,
      {
        title: t.ar.glossaryTerm,
        glossaryTerm: t.ar.glossaryTerm,
        body: t.ar.body,
      },
      'ar',
    );
  }

  // ── Media (Videos + Audio) ────────────────────────────────────────────────
  const videos = [
    {
      slug: 'inside-the-fed-traders-view',
      contentType: 'video',
      mediaCategory: 'macro',
      videoEmbed: 'https://www.youtube.com/watch?v=example1',
      en: { title: "Inside the Fed: a former trader's view" },
      ar: { title: 'داخل الفيدرالي: رأي متداول سابق' },
    },
    {
      slug: 'reading-the-cot-report',
      contentType: 'video',
      mediaCategory: 'strategy',
      videoEmbed: 'https://www.youtube.com/watch?v=example2',
      en: { title: 'Reading the COT report' },
      ar: { title: 'قراءة تقرير المضاربين والتحوطيين' },
    },
    {
      slug: 'carry-trade-explained',
      contentType: 'video',
      mediaCategory: 'strategy',
      videoEmbed: 'https://www.youtube.com/watch?v=example3',
      en: { title: 'The carry trade explained' },
      ar: { title: 'شرح تجارة الفائدة' },
    },
    {
      slug: 'position-sizing-without-guesswork',
      contentType: 'video',
      mediaCategory: 'education',
      videoEmbed: 'https://www.youtube.com/watch?v=example4',
      en: { title: 'Position sizing without the guesswork' },
      ar: { title: 'تحديد حجم المركز بدون تخمين' },
    },
    {
      slug: 'technical-analysis-that-works',
      contentType: 'video',
      mediaCategory: 'education',
      videoEmbed: 'https://www.youtube.com/watch?v=example5',
      en: { title: 'Technical analysis that actually works' },
      ar: { title: 'التحليل الفني الذي يعمل فعلاً' },
    },
    {
      slug: 'interview-london-market-maker',
      contentType: 'audio',
      mediaCategory: 'interviews',
      videoEmbed: null,
      en: { title: 'Interview: a London market maker' },
      ar: { title: 'مقابلة: صانع سوق في لندن' },
    },
    {
      slug: 'why-oil-moves-tuesday',
      contentType: 'audio',
      mediaCategory: 'macro',
      videoEmbed: null,
      en: { title: 'Why oil moves on Tuesday' },
      ar: { title: 'لماذا يتحرك النفط يوم الثلاثاء' },
    },
    {
      slug: 'live-boe-rate-decision',
      contentType: 'video',
      mediaCategory: 'live',
      videoEmbed: 'https://www.youtube.com/watch?v=example6',
      en: { title: 'Live BOE rate decision' },
      ar: { title: 'قرار سعر الفائدة لبنك إنجلترا مباشر' },
    },
  ];

  for (const v of videos) {
    const doc = await post('education-content', {
      title: v.en.title,
      slug: v.slug,
      contentType: v.contentType,
      mediaCategory: v.mediaCategory,
      videoEmbed: v.videoEmbed,
      status: 'published',
    });
    await patch('education-content', doc.id, { title: v.ar.title }, 'ar');
  }

  console.log(
    `   ✅ ${guides.length} guides + ${terms.length} glossary terms + ${videos.length} media items created`,
  );
  console.log('\n✅ Done!\n');
}

main().catch((e) => {
  console.error('\n❌ Failed:', e.message);
  process.exit(1);
});
