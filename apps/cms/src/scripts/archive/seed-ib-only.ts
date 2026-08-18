/**
 * seed-ib-only.ts
 *
 * Targeted seed for the `ib-content` collection (powers /trade/ib). Creates the
 * single IB document with all scalar stat fields, the "How it works" steps
 * array, and the bottom CTA — in English, then patches the Arabic translation.
 *
 * Requires the running CMS (HTTP API on :3001). Deterministic reseed: any
 * existing ib-content document is deleted first, then recreated.
 *
 * NOTE ON LOCALIZED ARRAYS: `steps` subfields are localized, but the array row
 * structure is not. We capture the row ids returned by the EN create and reuse
 * them in the AR patch so Payload updates the locale subfields on the SAME rows
 * (sending AR rows without ids would delete the EN rows and re-insert new ones,
 * losing the EN step copy).
 *
 * Run: ts-node --transpile-only src/scripts/seed-ib-only.ts
 */

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';

let token = '';

async function api(method: string, path: string, body?: unknown, params?: Record<string, string>) {
  const url = new URL(`${CMS}/api${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${method} ${path} → ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

// "How it works" onboarding steps — 4 items (matches seedIBContent() in seed.ts)
const stepsEn = [
  {
    stepTitle: 'Apply online',
    stepDescription: 'Submit our application in 3 minutes. No paperwork, no phone calls required.',
  },
  {
    stepTitle: 'Get approved',
    stepDescription: 'Our compliance team contacts you within 48 hours of submission.',
  },
  {
    stepTitle: 'Get your toolkit',
    stepDescription:
      'Login credentials, custom landing pages, live reporting dashboard and tracking links.',
  },
  {
    stepTitle: 'Earn monthly',
    stepDescription: 'Commissions paid on the 5th of every month, straight to your account.',
  },
];

const stepsAr = [
  {
    stepTitle: 'تقدّم عبر الإنترنت',
    stepDescription: 'أرسل طلبك في 3 دقائق. لا أوراق عمل، ولا مكالمات هاتفية مطلوبة.',
  },
  {
    stepTitle: 'احصل على الموافقة',
    stepDescription: 'يتصل بك فريق الامتثال لدينا خلال 48 ساعة من تقديم الطلب.',
  },
  {
    stepTitle: 'احصل على أدواتك',
    stepDescription: 'بيانات تسجيل الدخول، صفحات هبوط مخصصة، لوحة تقارير مباشرة وروابط تتبع.',
  },
  {
    stepTitle: 'اكسب شهرياً',
    stepDescription: 'العمولات تُدفع في الخامس من كل شهر، مباشرةً إلى حسابك.',
  },
];

async function main() {
  console.log('\n🤝 Seeding IB content only\n');
  console.log('🔑 Logging in...');
  const auth = await api('POST', '/users/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
  token = auth.token;
  console.log('   ✅ Authenticated as', ADMIN_EMAIL);

  // Deterministic reseed: remove any existing ib-content document(s) first.
  const existing = await api('GET', '/ib-content', undefined, { limit: '100', depth: '0' });
  for (const d of existing.docs ?? []) {
    await api('DELETE', `/ib-content/${d.id}`);
    console.log(`   🗑️  Deleted existing ib-content doc ${d.id}`);
  }

  console.log('🤝 Creating IB document (EN, with steps)...');
  const created = await api(
    'POST',
    '/ib-content',
    {
      slug: 'ib-program',
      heroSubtitle:
        'Take your partner business to the next level with advanced tools, high rebate payouts, and full partner support from Newera365.',
      ibDescription:
        'Earn up to $8 per lot traded by your referrals. Tiered structure with monthly bonus.',
      affiliateDescription:
        'Fixed cost-per-acquisition payouts up to $1,200 per qualified trader. Built for digital marketers.',
      whiteLabelDescription:
        'Launch your own brokerage on our infrastructure. Full MT5 stack, KYC, treasury, support.',
      ibTag: 'MOST POPULAR',
      ibRateDisplay: '$8/lot',
      ibPayoutsFrequency: 'Monthly',
      ibMinimum: 'None',
      affiliateTag: 'CPA',
      affiliateCpaMax: '$1,200',
      affiliateCookieDays: '90 days',
      affiliateMinCpa: '$50',
      wlTag: 'ENTERPRISE',
      wlSetupTime: '< 30 days',
      wlSpreadMarkup: 'Custom',
      wlTechStack: 'Turnkey',
      // Hero stat band + income ladder + rebate matrix + FTD condition — global
      // (not localized), matching the ibRateDisplay-style fields above.
      heroStat1Value: '$5,000',
      heroStat2Value: '15',
      heroStat3Value: '3',
      heroStat4Value: '4',
      incomeLadder: [
        { balanceLabel: '$30,000 to $50,000', minBalance: 30000, incomeValue: '$500' },
        { balanceLabel: '$50,000 to $100,000', minBalance: 50000, incomeValue: '$750' },
        { balanceLabel: '$100,000 to $200,000', minBalance: 100000, incomeValue: '$1,250' },
        { balanceLabel: '$200,000 to $300,000', minBalance: 200000, incomeValue: '$2,000' },
        { balanceLabel: '$300,000 to $400,000', minBalance: 300000, incomeValue: '$3,000' },
        { balanceLabel: '$400,000 to $500,000', minBalance: 400000, incomeValue: '$4,000' },
        { balanceLabel: '$500,000+', minBalance: 500000, incomeValue: '$5,000', isTopSlab: true },
      ],
      rebateTables: [
        {
          instrumentNameEn: 'Gold, XAU/USD',
          instrumentNameAr: 'الذهب، XAU/USD',
          rows: [
            { spread: '7-8', commission: '10', rebate: '3' },
            { spread: '20', commission: '0', rebate: '5' },
            { spread: '30', commission: '0', rebate: '15' },
          ],
        },
        {
          instrumentNameEn: 'FX majors',
          instrumentNameAr: 'أزواج الفوركس الرئيسية',
          rows: [
            { spread: '2-4', commission: '7', rebate: '2' },
            { spread: '12-15', commission: '0', rebate: '4' },
            { spread: '18-22', commission: '0', rebate: '8' },
          ],
        },
        {
          instrumentNameEn: 'Silver, XAG/USD',
          instrumentNameAr: 'الفضة، XAG/USD',
          rows: [
            { spread: '15-20', commission: '10', rebate: '3' },
            { spread: '35-45', commission: '0', rebate: '8' },
            { spread: '50-70', commission: '0', rebate: '15' },
          ],
        },
      ],
      ftdCap: 'USD 10,000',
      ftdMinLots: '50',
      steps: stepsEn,
      ctaHeading: 'Ready to build a new revenue stream?',
      ctaSubtitle: 'Apply today. A partner manager will reach out within 48 hours.',
      status: 'published',
    },
    { locale: 'en' },
  );
  const doc = created.doc ?? created;
  const id = doc.id;

  // Capture the array-row ids so the AR patch updates the SAME rows.
  let createdSteps: Array<{ id?: string }> = doc.steps ?? [];
  if (!createdSteps.length || !createdSteps[0]?.id) {
    const fetched = await api('GET', `/ib-content/${id}`, undefined, { locale: 'en', depth: '0' });
    createdSteps = (fetched.doc ?? fetched).steps ?? [];
  }
  console.log(`   ✅ Created doc ${id} with ${createdSteps.length} step(s)`);

  const stepsArWithIds = stepsAr.map((s, i) => ({
    ...(createdSteps[i]?.id ? { id: createdSteps[i].id } : {}),
    ...s,
  }));

  console.log('🤝 Adding Arabic translation (with steps)...');
  await api(
    'PATCH',
    `/ib-content/${id}`,
    {
      heroSubtitle:
        'انتقل بأعمال الشراكة الخاصة بك إلى المستوى التالي مع أدوات متقدمة، ودفعات عمولات مرتفعة، ودعم كامل للشركاء من نيو إيرا 365.',
      ibDescription:
        'اكسب ما يصل إلى 8 دولارات لكل لوط يتداوله إحالاتك. هيكل متدرج مع مكافأة شهرية.',
      affiliateDescription:
        'مدفوعات ثابتة بتكلفة الاستحواذ تصل إلى 1,200 دولار لكل متداول مؤهل. مصمم للمسوقين الرقميين.',
      whiteLabelDescription:
        'أطلق وساطتك الخاصة على بنيتنا التحتية. مجموعة MT5 كاملة، KYC، الخزينة، الدعم.',
      steps: stepsArWithIds,
      ctaHeading: 'هل أنت مستعد لبناء تدفق إيرادات جديد؟',
      ctaSubtitle: 'تقدّم اليوم. سيتواصل معك مدير شريك خلال 48 ساعة.',
    },
    { locale: 'ar' },
  );

  console.log('\n✅ IB content created (EN + AR, with steps)\n');
}

main().catch((err) => {
  console.error('\n❌ IB seed failed:', err);
  process.exit(1);
});

export {};
