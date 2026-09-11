import 'dotenv/config';
import { Client } from 'pg';

const RISK_WARNING_EN = `Trading Contracts for Difference (CFDs), foreign exchange and other leveraged financial products involves a high degree of risk and may not be suitable for all investors.

Leverage can magnify both profits and losses, and you may lose all of the capital invested.

Before trading, you should carefully consider your investment objectives, level of experience, financial circumstances and risk tolerance. You should not trade with funds that you cannot afford to lose.

You should ensure that you fully understand the nature of leveraged products and the risks involved and, where appropriate, obtain independent financial, legal or professional advice.

Please review the applicable Risk Disclosure Statement before opening an account or entering into any transaction.`;

const RISK_WARNING_AR = `ينطوي تداول العقود مقابل الفروقات (CFDs) والعملات الأجنبية والمنتجات المالية الأخرى ذات الرافعة المالية على درجة عالية من المخاطر وقد لا يكون مناسباً لجميع المستثمرين.

يمكن للرافعة المالية أن تضاعف كلاً من الأرباح والخسائر، وقد تفقد كل رأس المال المستثمر.

قبل التداول، يجب عليك أن تدرس بعناية أهدافك الاستثمارية ومستوى خبرتك وظروفك المالية وقدرتك على تحمل المخاطر. يجب ألا تتداول بأموال لا يمكنك تحمل خسارتها.

يجب عليك التأكد من أنك تفهم تماماً طبيعة المنتجات ذات الرافعة المالية والمخاطر التي تنطوي عليها، والحصول على مشورة مالية أو قانونية أو مهنية مستقلة عند الاقتضاء.

يرجى مراجعة بيان الإفصاح عن المخاطر المعمول به قبل فتح حساب أو الدخول في أي معاملة.`;

const REGULATORY_LEGAL_EN = `Newera Capital is used by separate legal entities within the Newera Capital Group. Each entity operates independently under its respective Legal and Regulatory framework, permissions and requirements applicable to it.

The Newera Capital Group operates through separate legal entities in different jurisdictions, each with its own Regulatory status, Permissions and Responsibilities. The legal entity providing or facilitating services to a Client may vary according to the Client’s country of residence, eligibility and applicable regulatory requirements.

Newera Capital Markets Limited - Saint Lucia 

Newera Capital Markets Ltd. is incorporated in Saint Lucia with Registration Number 2023-00564, having its Registered Address at: Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia. Newera Capital Markets Ltd. operates in accordance with applicable laws and requirements governing its activities.

Where a client’s trading account is opened with Newera Capital Markets Ltd., Newera Capital Markets Ltd. is the client’s contracting entity, and the trading relationship is governed by the applicable Client Agreement, Risk Disclosure, Terms and Conditions and other legal documentation of Newera Capital Markets Ltd. 

Newera Capital Markets (Pty) Limited. – South Africa 

Newera Capital Markets (Pty) Ltd. is a Financial Service Provider (FSP) and is authorised and regulated by the Financial Services Conduct Authority (FSCA) of the Republic of South Africa, with FSCA Licence Number: 54447, having its Registered Address at: 1 Edgemere Road Elfindale, CapeTown, Western Cape, 7945, South Africa. The company provides regulated “Category 1 Financial Services in accordance with the permissions granted under its FSCA licence and applicable Republic of South Africa laws and regulations.

The entity responsible for providing or facilitating a particular service will be identified in the applicable account-opening documentation, Client Agreement or other contractual documentation.

Clients should carefully verify the legal entity and applicable regulatory framework under which they are being onboarded before accepting the Account Opening Terms and Conditions and before funding their account.

Regional Restrictions

The products and services described on this website are not intended for distribution to, or use by, any person in any country or jurisdiction where such distribution, offer, solicitation or use would be contrary to applicable law or regulation.

Services are not offered to citizens/residents of certain jurisdictions, including the United States, Cuba, Iraq, North Korea, Myanmar, Russia and UAE, or to persons in jurisdictions that are subject to applicable international sanctions or other regulatory restrictions.

Additional restrictions may apply depending upon the client’s country of residence, nationality, regulatory requirements and the Newera Capital entity providing the relevant service.`;

const REGULATORY_LEGAL_AR = `تُستخدم نيو إيرا كابيتال (Newera Capital) من قِبل كيانات قانونية منفصلة ضمن مجموعة نيو إيرا كابيتال. ويعمل كل كيان بشكل مستقل بموجب الإطار القانوني والتنظيمي والتراخيص والمتطلبات المعمول بها الخاصة به.

تعمل مجموعة نيو إيرا كابيتال من خلال كيانات قانونية منفصلة في ولايات قضائية مختلفة، ولكل منها وضعه التنظيمي وتراخيصه ومسؤولياته الخاصة. قد يختلف الكيان القانوني الذي يقدم الخدمات أو يسهلها للعميل وفقاً لبلد إقامة العميل وأهليته والمتطلبات التنظيمية المعمول بها.

نيو إيرا كابيتال ماركتس المحدودة - سانت لوسيا

شركة Newera Capital Markets Ltd مؤسسة في سانت لوسيا برقم تسجيل 2023-00564، ويقع عنوانها المسجل في: Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia. تعمل شركة Newera Capital Markets Ltd وفقاً للقوانين والمتطلبات المعمول بها التي تحكم أنشطتها.

عند فتح حساب تداول العميل لدى شركة Newera Capital Markets Ltd، فإن Newera Capital Markets Ltd هي الكيان المتعاقد مع العميل، وتخضع علاقة التداول لاتفاقية العميل المعمول بها، والإفصاح عن المخاطر، والشروط والأحكام والوثائق القانونية الأخرى لشركة Newera Capital Markets Ltd.

نيو إيرا كابيتال ماركتس (Pty) المحدودة – جنوب أفريقيا

شركة نيو إيرا كابيتال ماركتس (Pty) المحدودة (Newera Capital Markets (Pty) Ltd) هي مزود خدمات مالية (FSP) ومرخصة وخاضعة لرقابة هيئة سلوك القطاع المالي (FSCA) في جمهورية جنوب أفريقيا، بموجب ترخيص FSCA رقم: 54447، ويقع عنوانها المسجل في: 1 Edgemere Road Elfindale, CapeTown, Western Cape, 7945, South Africa. تقدم الشركة خدمات مالية خاضعة للتنظيم من "الفئة 1" وفقاً للتراخيص الممنوحة بموجب ترخيص FSCA وقوانين ولوائح جمهورية جنوب أفريقيا المعمول بها.

سيتم تحديد الكيان المسؤول عن تقديم أو تسهيل خدمة معينة في وثائق فتح الحساب المعمول بها أو اتفاقية العميل أو غيرها من الوثائق التعاقدية.

يجب على العملاء التحقق بعناية من الكيان القانوني والإطار التنظيمي المعمول به الذي يتم تسجيلهم بموجبه قبل قبول شروط وأحكام فتح الحساب وقبل تمويل حساباتهم.

القيود الإقليمية

المنتجات والخدمات الموضحة في هذا الموقع ليست موجهة للتوزيع أو الاستخدام من قبل أي شخص في أي بلد أو ولاية قضائية يكون فيها هذا التوزيع أو العرض أو الالتماس أو الاستخدام مخالفاً للقانون أو اللوائح المعمول بها.

لا يتم تقديم الخدمات لمواطني/مقيمين في ولايات قضائية معينة، بما في ذلك الولايات المتحدة، وكوبا، والعراق، وكوريا الشمالية، وميانمار، وروسيا، والإمارات العربية المتحدة، أو للأشخاص في ولايات قضائية تخضع لعقوبات دولية سارية أو قيود تنظيمية أخرى.

قد تنطبق قيود إضافية اعتماداً على بلد إقامة العميل، وجنسيته، والمتطلبات التنظيمية، وكيان Newera Capital الذي يقدم الخدمة المعنية.`;

const EMAIL = 'info@newera365sa.com';

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL must be set');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const res = await client.query(
      `UPDATE site_settings
       SET risk_disclaimer_en = $1,
           risk_disclaimer_ar = $2,
           regulatory_disclosure_en = $3,
           regulatory_disclosure_ar = $4,
           contact_email = $5,
           company_registration_en = NULL,
           company_registration_ar = NULL
       WHERE id = 1`,
      [RISK_WARNING_EN, RISK_WARNING_AR, REGULATORY_LEGAL_EN, REGULATORY_LEGAL_AR, EMAIL],
    );
    console.log(`✅ Updated site_settings in database (affected rows: ${res.rowCount})`);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
