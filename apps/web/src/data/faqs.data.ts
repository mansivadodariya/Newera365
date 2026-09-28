import type { CmsFaq } from '../lib/cms';

export const STATIC_FAQS: CmsFaq[] = [
  {
    id: 1,
    question: 'What is the minimum deposit to open an account?',
    questionAr: 'ما هو الحد الأدنى للإيداع لفتح حساب؟',
    answer: [
      {
        children: [
          {
            text: 'The minimum deposit is $100 for a Standard account, $500 for a Raw account, and $10,000 for a VIP account.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'الحد الأدنى للإيداع هو 100 دولار للحساب المعياري، و500 دولار للحساب الخام، و10,000 دولار لحساب VIP.',
          },
        ],
      },
    ],
    category: 'accounts',
    sortOrder: 1,
    status: 'active',
    updatedAt: '2026-08-31T13:13:09.930Z',
    createdAt: '2026-08-31T13:13:08.095Z',
  },
  {
    id: 2,
    question: 'What leverage does Newera offer?',
    questionAr: 'ما هي الرافعة المالية التي تقدمها نيو إيرا؟',
    answer: [
      {
        children: [
          {
            text: 'We offer leverage up to 1:500 on forex and major commodity pairs, 1:200 on metals, 1:100 on indices, and 1:20 on stocks, ETFs and crypto.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'نقدم رافعة مالية تصل إلى 1:500 على العملات والسلع الرئيسية، و1:200 على المعادن، و1:100 على المؤشرات، و1:20 على الأسهم والصناديق والعملات الرقمية.',
          },
        ],
      },
    ],
    category: 'trading',
    sortOrder: 2,
    status: 'active',
    updatedAt: '2026-08-31T13:13:13.828Z',
    createdAt: '2026-08-31T13:13:12.001Z',
  },
  {
    id: 3,
    question: 'How long does a withdrawal take?',
    questionAr: 'كم من الوقت تستغرق عملية السحب؟',
    answer: [
      {
        children: [
          {
            text: 'Card withdrawals process within 1–3 business days. Bank wire transfers take 3–5 business days. E-wallet withdrawals are typically completed within 1 business day.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'يتم معالجة سحوبات البطاقات خلال 1-3 أيام عمل. التحويلات البنكية تستغرق 3-5 أيام عمل. سحوبات المحافظ الإلكترونية تستغرق عادةً يوم عمل واحد.',
          },
        ],
      },
    ],
    category: 'withdrawals',
    sortOrder: 3,
    status: 'active',
    updatedAt: '2026-08-31T13:13:17.739Z',
    createdAt: '2026-08-31T13:13:15.907Z',
  },
  {
    id: 4,
    question: 'Is my money safe with Newera?',
    questionAr: 'هل أموالي آمنة مع نيو إيرا؟',
    answer: [
      {
        children: [
          {
            text: 'Yes, We take the security of client funds seriously. Client funds are handled separately from the Company’s operating funds in accordance with our applicable policies and client agreements.\n\nPlease note that Forex and CFD trading involves market risk, and losses can occur as a result of trading activity.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'نعم، نحن نأخذ أمان أموال العملاء على محمل الجد. يتم التعامل مع أموال العملاء بشكل منفصل عن أموال التشغيل الخاصة بالشركة وفقاً لسياساتنا واتفاقيات العملاء المعمول بها.\n\nيرجى ملاحظة أن تداول الفوركس وعقود الفروقات ينطوي على مخاطر السوق، ويمكن أن تحدث خسائر نتيجة لنشاط التداول.',
          },
        ],
      },
    ],
    category: 'regulation',
    sortOrder: 4,
    status: 'active',
    updatedAt: '2026-08-31T13:13:22.076Z',
    createdAt: '2026-08-31T13:13:19.820Z',
  },
  {
    id: 5,
    question: 'What trading platforms do you offer?',
    questionAr: 'ما هي منصات التداول التي تقدمونها؟',
    answer: [
      {
        children: [
          {
            text: 'We offer MetaTrader 5 (desktop, mobile and tablet), our proprietary Web Trader for browser-based trading, and a dedicated mobile app for iOS and Android.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'نقدم MetaTrader 5 (لسطح المكتب والجوال والأجهزة اللوحية)، ومنصة Web Trader الخاصة بنا للتداول عبر المتصفح، وتطبيق الجوال المخصص لـ iOS وAndroid.',
          },
        ],
      },
    ],
    category: 'platforms',
    sortOrder: 5,
    status: 'active',
    updatedAt: '2026-08-31T13:13:25.998Z',
    createdAt: '2026-08-31T13:13:24.155Z',
  },
  {
    id: 6,
    question: 'Are Expert Advisors (EAs) allowed?',
    questionAr: 'هل المستشارون الخبراء (EAs) مسموح بهم؟',
    answer: [
      {
        children: [
          {
            text: 'Yes. All account types support Expert Advisors, scalping, hedging, and copy trading strategies without restrictions. VPS hosting is available free for VIP account holders.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'نعم. جميع أنواع الحسابات تدعم المستشارين الخبراء والمضاربة والتحوط واستراتيجيات نسخ التداول دون قيود. استضافة VPS متاحة مجاناً لأصحاب حسابات VIP.',
          },
        ],
      },
    ],
    category: 'trading',
    sortOrder: 6,
    status: 'active',
    updatedAt: '2026-08-31T13:13:29.905Z',
    createdAt: '2026-08-31T13:13:28.091Z',
  },
  {
    id: 7,
    question: 'How do I deposit funds?',
    questionAr: 'كيف أودع الأموال؟',
    answer: [
      {
        children: [
          {
            text: 'Log in to your client portal, navigate to Deposits, and choose from Visa/Mastercard, bank wire, Skrill, Neteller, or USDT (TRC20/ERC20). Card and e-wallet deposits are processed instantly.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'سجّل الدخول إلى بوابة العميل، وانتقل إلى قسم الإيداع، واختر من بين Visa/Mastercard أو التحويل البنكي أو Skrill أو Neteller أو USDT. ودائع البطاقات والمحافظ الإلكترونية تُعالَج فورياً.',
          },
        ],
      },
    ],
    category: 'deposits',
    sortOrder: 7,
    status: 'active',
    updatedAt: '2026-08-31T13:13:33.792Z',
    createdAt: '2026-08-31T13:13:31.978Z',
  },
  {
    id: 8,
    question: 'What is the spread on EUR/USD?',
    questionAr: 'ما هو فارق السعر على EUR/USD؟',
    answer: [
      {
        children: [
          {
            text: 'On Standard accounts, the EUR/USD spread starts from 1.0 pip. On Raw accounts, the spread is from 0.0 pip plus a commission of $3.50 per lot per side. Live spreads are always visible in the platform.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'في الحسابات المعيارية، يبدأ فارق السعر على EUR/USD من 1.0 نقطة. في الحسابات الخام، الفارق من 0.0 نقطة مع عمولة 3.50 دولار لكل لوط لكل اتجاه. الفروقات المباشرة دائماً مرئية في المنصة.',
          },
        ],
      },
    ],
    category: 'trading',
    sortOrder: 8,
    status: 'active',
    updatedAt: '2026-08-31T13:13:37.683Z',
    createdAt: '2026-08-31T13:13:35.867Z',
  },
  {
    id: 9,
    question: 'Is there a demo account?',
    questionAr: 'هل يوجد حساب تجريبي؟',
    answer: [
      {
        children: [
          {
            text: 'Yes. You can open a free unlimited demo account with $100,000 virtual funds. Demo accounts have no time limit and use real-time market conditions.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'نعم. يمكنك فتح حساب تجريبي مجاني غير محدود بـ 100,000 دولار افتراضي. الحسابات التجريبية بلا حدود زمنية وتستخدم ظروف السوق الفعلية.',
          },
        ],
      },
    ],
    category: 'accounts',
    sortOrder: 9,
    status: 'active',
    updatedAt: '2026-08-31T13:13:41.575Z',
    createdAt: '2026-08-31T13:13:39.753Z',
  },
  {
    id: 10,
    question: 'Is Islamic (swap-free) account available?',
    questionAr: 'هل يتوفر حساب إسلامي (بدون مبادلة)؟',
    answer: [
      {
        children: [
          {
            text: 'Yes. We offer an Islamic account (swap-free) for traders who require Sharia-compliant financing. Apply via the client portal; approval is subject to verification.',
          },
        ],
      },
    ],
    answerAr: [
      {
        children: [
          {
            text: 'نعم. نقدم حساباً إسلامياً (خالياً من الفوائد) للمتداولين الذين يحتاجون تمويلاً متوافقاً مع الشريعة الإسلامية. تقدّم بالطلب عبر بوابة العميل؛ الموافقة خاضعة للتحقق.',
          },
        ],
      },
    ],
    category: 'accounts',
    sortOrder: 10,
    status: 'active',
    updatedAt: '2026-08-31T13:13:45.468Z',
    createdAt: '2026-08-31T13:13:43.644Z',
  },
];
