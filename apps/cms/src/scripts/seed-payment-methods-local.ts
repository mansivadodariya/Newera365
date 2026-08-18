import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import os from 'os';
import sharp from 'sharp';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set in environment');

  console.log('⚡ Initializing Payload Local API...');
  await payload.init({ secret, local: true });

  const webImagesDir = path.resolve(__dirname, '../../../web/public/images/payment');

  const methods = [
    {
      name: 'Visa / Mastercard',
      nameAr: 'فيزا / ماستركارد',
      methodType: 'card' as const,
      fileName: 'pm_visa.jpg',
      depositTime: 'Instant',
      withdrawalTime: '1-3 days',
      minDeposit: '$50',
      fee: 'Free',
      sortOrder: 1,
      status: 'active' as const,
    },
    {
      name: 'Bank wire (SWIFT)',
      nameAr: 'تحويل بنكي (SWIFT)',
      methodType: 'bank' as const,
      fileName: 'pm_bank.jpg',
      depositTime: '1-3 days',
      withdrawalTime: '2-5 days',
      minDeposit: '$500',
      fee: 'Free',
      sortOrder: 2,
      status: 'active' as const,
    },
    {
      name: 'Crypto (USDT, BTC)',
      nameAr: 'عملات رقمية (USDT, BTC)',
      methodType: 'crypto' as const,
      fileName: 'pm_crypto.jpg',
      depositTime: '< 30 min',
      withdrawalTime: 'Within 24h',
      minDeposit: '$50',
      fee: 'Network only',
      sortOrder: 3,
      status: 'active' as const,
    },
  ];

  console.log('💰 Seeding payment methods with real branded images...');

  // Delete existing payment methods to start clean
  const existing = await payload.find({
    collection: 'payment-methods',
    limit: 100,
    overrideAccess: true,
  });
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'payment-methods',
      id: doc.id,
      overrideAccess: true,
    });
  }

  for (const m of methods) {
    let imageId: number | null = null;
    const imgPath = path.join(webImagesDir, m.fileName);

    if (fs.existsSync(imgPath)) {
      // Resize to 480x260 via Sharp into temp file so image passes 200x200 validation
      const tmpPath = path.join(os.tmpdir(), `pay-seed-${m.fileName}`);
      await sharp(imgPath)
        .resize(480, 260, { fit: 'contain', background: { r: 14, g: 42, b: 32, alpha: 1 } })
        .toFile(tmpPath);

      const uploadRes = await payload.create({
        collection: 'media',
        data: { alt: `${m.name} logo` },
        filePath: tmpPath,
        overrideAccess: true,
      });
      imageId = uploadRes.id as number;
      console.log(`   📸 Uploaded image for ${m.name} (Media ID: ${imageId})`);
    } else {
      console.log(`   ⚠️ Image file not found: ${imgPath}`);
    }

    const created = await payload.create({
      collection: 'payment-methods',
      data: {
        name: m.name,
        methodType: m.methodType as 'card' | 'bank' | 'crypto' | 'ewallet' | 'local',
        depositTime: m.depositTime,
        withdrawalTime: m.withdrawalTime,
        minDeposit: m.minDeposit,
        fee: m.fee,
        sortOrder: m.sortOrder,
        status: m.status as 'active' | 'inactive',
        ...(imageId ? { logo: imageId, coverImage: imageId } : {}),
      },
      overrideAccess: true,
    });

    if (m.nameAr) {
      await payload.update({
        collection: 'payment-methods',
        id: created.id,
        locale: 'ar',
        data: { nameAr: m.nameAr },
        overrideAccess: true,
      });
    }

    console.log(`   ✅ Seeded ${m.name}`);
  }

  console.log('\n🎉 Payment methods seeded successfully into database with real images!\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
