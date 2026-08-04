/**
 * One-shot content sync: aligns the live account-type docs with the client's
 * partner pitch deck (Newera_IB_Pitch_Deck_Green_V3, p.4). Lineup becomes
 * Demo + Standard / Raw / Pro:
 *   - Swap-Free    -> Raw  (0.2 pips, $7 per standard lot)
 *   - Professional -> Pro  (1.8 pips, $0 commission, premium perks)
 * Deck spreads are quoted in points on FX majors (2-4 / 12-15 / 18-22 = pips /10).
 * Idempotent: matches docs by old OR new name, so re-runs are safe.
 * usesMT5Data is switched off so the mock bridge never overwrites deck values.
 *
 * Run via:
 *   npx cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts ts-node --transpile-only src/scripts/update-account-types-deck.ts
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import payload from 'payload';

const TARGETS: { match: string[]; data: Record<string, any> }[] = [
  {
    match: ['Demo'],
    data: {
      badge: 'free',
      usesMT5Data: false,
      spreadFromNumeric: 1.2,
      spreadFrom: '1.2',
      commission: '$0',
      sortOrder: 1,
    },
  },
  {
    match: ['Standard'],
    data: {
      badge: 'popular',
      isPopular: true,
      minDeposit: 50,
      spreadFrom: '1.2',
      usesMT5Data: false,
      spreadFromNumeric: 1.2,
      commission: '$0',
      leverage: 'Up to 1:500',
      sortOrder: 2,
      nameAr: 'قياسي',
      features: [
        { value: 'All 2000+ instruments' },
        { value: 'Zero commission' },
        { value: 'Swap-free available on request' },
      ],
      featuresAr: 'جميع الأدوات الـ 2000+\nصفر عمولة\nخيار بدون فوائد تبييت عند الطلب',
    },
  },
  {
    match: ['Raw', 'Swap-Free'],
    data: {
      name: 'Raw',
      nameAr: 'خام',
      badge: 'value',
      isPopular: false,
      minDeposit: 50,
      spreadFrom: '0.2',
      usesMT5Data: false,
      spreadFromNumeric: 0.2,
      commission: '$8',
      leverage: 'Up to 1:500',
      sortOrder: 3,
      features: [
        { value: 'Interbank raw pricing' },
        { value: 'Metals commission $10 per lot' },
        { value: 'Built for scalpers and EAs' },
      ],
      featuresAr:
        'تسعير خام من البنوك مباشرة\nعمولة المعادن 10 دولار لكل عقد\nمصمم للمضاربة السريعة والأنظمة الآلية',
    },
  },
  {
    match: ['Pro', 'Professional'],
    data: {
      name: 'Pro',
      nameAr: 'برو',
      badge: 'pro',
      isPopular: false,
      minDeposit: 2500,
      spreadFrom: '1.8',
      usesMT5Data: false,
      spreadFromNumeric: 1.8,
      commission: '$0',
      leverage: 'Up to 1:500',
      sortOrder: 4,
      features: [
        { value: 'Zero commission trading' },
        { value: 'Dedicated account manager' },
        { value: 'Custom spreads and priority execution' },
      ],
      featuresAr: 'تداول بدون عمولة\nمدير حساب مخصص\nفروق مخصصة وتنفيذ ذو أولوية',
    },
  },
];

const main = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET ?? '',
    local: true,
  });

  const { docs } = await payload.find({
    collection: 'account-types',
    limit: 20,
    locale: 'en',
  });

  for (const doc of docs) {
    const target = TARGETS.find((u) => u.match.includes(doc.name as string));
    if (!target) {
      console.log(`skip ${String(doc.name)} (no deck mapping)`);
      continue;
    }
    await payload.update({
      collection: 'account-types',
      id: doc.id,
      locale: 'en',
      data: target.data,
    });
    console.log(`updated ${String(doc.name)} -> ${String(target.data.name ?? doc.name)}`);
  }
  console.log('done');
  process.exit(0);
};

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
