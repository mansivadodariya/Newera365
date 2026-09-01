import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

function paragraph(text: string) {
  return [{ children: [{ text }] }];
}

function legalSections(sections: { heading: string; body: string }[]) {
  return sections.flatMap((s) => [
    { type: 'h2', children: [{ text: s.heading }] },
    ...paragraph(s.body),
  ]);
}

function legalBody(intro: string, sections: { heading: string; body: string }[]) {
  return [...paragraph(intro), ...legalSections(sections)];
}

function legalBodyWithLead(
  lead: string,
  rest: string,
  sections: { heading: string; body: string }[],
) {
  return [
    { children: [{ text: lead, bold: true }] },
    ...paragraph(rest),
    ...legalSections(sections),
  ];
}

async function run() {
  const secret = process.env.PAYLOAD_SECRET || 'change-me-in-production';

  console.log('⚡ Initializing Payload Local API...');
  await payload.init({ secret, local: true });

  console.log('⚖️  Cleaning existing legal pages...');
  const existing = await payload.find({
    collection: 'legal-pages',
    limit: 100,
    overrideAccess: true,
  });
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'legal-pages',
      id: doc.id,
      overrideAccess: true,
    });
  }

  const pages = [
    // 1. Terms & Conditions (from Website-Terms-Conditions.pdf)
    {
      pageType: 'terms',
      en: {
        title: 'Terms and Conditions',
        slug: 'terms-and-conditions',
        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED ("the Company / NCML") (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of International Business Companies Act, Saint Lucia. Your access to and use of this website is subject to these terms and conditions, our Terms and Conditions of Service (as applicable to your jurisdiction of residence), and any notices, disclaimers or other statements contained on this website (referred to collectively as "Terms"). By using this website, you agree to be subject to the Terms.',
          [
            {
              heading: 'PREAMBLE',
              body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company / NCML”) (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of the International Business Companies Act, Saint Lucia. Your access to and use of this website is subject to these terms and conditions, our Terms and Conditions of Service (as applicable to your jurisdiction of residence), and any notices, disclaimers or other statements contained on this website (referred to collectively as “Terms”). By using this website, you agree to be subject to the Terms.',
            },
            {
              heading: 'ACCURACY OF INFORMATION',
              body: 'Although the content of this website is based on information that we consider to be reliable and endeavour to keep current, we do not warrant that any information on this website is current or accurate as of the date (and time) of its availability. To the extent permitted by laws, we do not accept any responsibility arising in any way from errors in, or omissions from, the information on this website. The products and services described on this website vary from time to time and may not always be available or may be restricted.',
            },
            {
              heading: 'VISITORS TO THIS WEBSITE',
              body: 'The information on this website is not intended for distribution to, or use by, any person in any country or jurisdiction where its distribution or use would be contrary to local laws or regulations. Visitors to this website are responsible for ascertaining the terms of and complying with any local laws or regulations that they are subject to. Strictly, you must be over eighteen (18) years of age to use our services.',
            },
            {
              heading: 'GENERAL INFORMATION ONLY',
              body: 'The information on this website is general in nature and does not take into account your personal investment objectives, financial situation or means. It also does not constitute a recommendation that you enter into a particular transaction, nor is it a representation that any product described on this website is suitable or appropriate for you. The Company is not a financial advisor. None of the material contained on this website should be construed as business, financial, investment, hedging, trading, legal, regulatory, tax, or accounting advice. Nor should you use the content of this website as the primary basis for any investment decisions that you wish to make. We encourage you to seek independent advice before deciding whether to acquire our services. Also, please ensure that you read and understand our legal documents before you decide whether to use our services.',
            },
            {
              heading: 'COPYRIGHT AND TRADEMARK',
              body: 'Except where it is necessary for you to view this website on your browser, or as permitted under the applicable laws or the Terms, none of the information or content on this website is permitted to be reproduced, adapted, uploaded to a third party, distributed or transmitted in any form by any process without the Company’s written consent. Newera Capital Markets Limited and the NCML logo are registered trademarks of the Company. Apple, the Apple logo, Mac, iPhone, iPad, and iPod touch are trademarks of Apple Inc., registered in the United States and other countries. App Store is a service mark of Apple Inc. Android is a trademark of Google Inc., while Windows is a registered trademark of Microsoft Corporation in the United States and other countries.',
            },
            {
              heading: 'THIRD PARTY CONTENT',
              body: 'From time to time, this website may contain links to other websites or resources provided by third parties. We provide you with third-party links/resources solely for your information and convenience. We do not make any representations or warranties about the content, suitability or appropriateness of the content or products contained in any third-party websites or resources.',
            },
            {
              heading: 'DISCLAIMER AND LIMITATION OF LIABILITY',
              body: 'To the maximum extent permitted by laws, we will not be liable in any way for loss or damage suffered by you through use of or access to this website, or our failure to provide this website.',
            },
            {
              heading: 'REVIEW OF WEBSITE TERMS & CONDITIONS',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated. This Website Terms & Conditions is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },
      ar: {
        title: 'الشروط والأحكام',
        body: legalBody(
          'تأسست شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / NCML") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، المادة 6 من قانون الشركات التجارية الدولية في سانت لوسيا. يخضع وصولك إلى هذا الموقع واستخدامك له لهذه الشروط والأحكام، وشروط وأحكام الخدمة الخاصة بنا (حسب ما ينطبق على ولايتك القضائية)، وأي إشعارات أو إخلاء مسؤولية أو بيانات أخرى واردة في هذا الموقع (المشار إليها مجتمعة باسم "الشروط"). من خلال استخدام هذا الموقع، فإنك توافق على الالتزام بهذه الشروط.',
          [
            {
              heading: 'مقدمة',
              body: 'تم تأسيس شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / NCML") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، القسم 6 من قانون الشركات التجارية الدولية في سانت لوسيا. يخضع وصولك إلى هذا الموقع الإلكتروني واستخدامك له لهذه الشروط والأحكام، وشروط وأحكام الخدمة الخاصة بنا (حسبما ينطبق على الولاية القضائية لمحل إقامتك)، وأي إشعارات أو إخلاءات مسؤولية أو بيانات أخرى واردة في هذا الموقع الإلكتروني (ويُشار إليها مجتمعة باسم "الشروط"). باستخدامك لهذا الموقع الإلكتروني، فإنك توافق على الالتزام بهذه الشروط.',
            },
            {
              heading: 'دقة المعلومات',
              body: 'على الرغم من أن محتوى هذا الموقع يستند إلى معلومات نعتبرها موثوقة ونسعى جاهدين لإبقائها محدثة، إلا أننا لا نضمن أن أي معلومات على هذا الموقع محدثة أو دقيقة اعتبارًا من تاريخ (ووقت) توفرها. وإلى الحد الذي تسمح به القوانين، فإننا لا نتحمل أي مسؤولية تنشأ بأي شكل من الأشكال عن الأخطاء أو السهو في المعلومات الواردة في هذا الموقع. تختلف المنتجات والخدمات الموضحة على هذا الموقع من وقت لآخر، وقد لا تكون متاحة دائمًا أو قد تكون خاضعة لقيود.',
            },
            {
              heading: 'زوار هذا الموقع',
              body: 'المعلومات الواردة في هذا الموقع ليست مخصصة للتوزيع على أو الاستخدام من قبل أي شخص في أي بلد أو ولاية قضائية يكون فيها هذا التوزيع أو الاستخدام مخالفًا للقوانين أو اللوائح المحلية. يتحمل زوار هذا الموقع مسؤولية التحقق من الشروط والامتثال لأي قوانين أو لوائح محلية يخضعون لها. يجب أن يكون عمرك أكثر من ثمانية عشر (18) عامًا لاستخدام خدماتنا.',
            },
            {
              heading: 'معلومات عامة فقط',
              body: 'المعلومات الواردة في هذا الموقع عامة بطبيعتها ولا تأخذ في الاعتبار أهدافك الاستثمارية الشخصية أو وضعك المالي أو إمكانياتك. كما أنها لا تشكل توصية بالدخول في معاملة معينة، وليست إقرارًا بأن أي منتج موضح على هذا الموقع مناسب أو ملائم لك. الشركة ليست مستشارًا ماليًا. لا ينبغي تفسير أي من المواد الواردة في هذا الموقع على أنها نصيحة تجارية أو مالية أو استثمارية أو تحوطية أو تداولية أو قانونية أو تنظيمية أو ضريبية أو محاسبية. ولا ينبغي استخدام محتوى هذا الموقع كأساس رئيسي لأي قرارات استثمارية ترغب في اتخاذها. نشجعك على طلب مشورة مستقلة قبل اتخاذ قرار بشأن الحصول على خدماتنا. كما يرجى التأكد من قراءة وفهم وثائقنا القانونية قبل اتخاذ قرار بشأن استخدام خدماتنا.',
            },
            {
              heading: 'حقوق الطبع والنشر والعلامات التجارية',
              body: 'باستثناء ما هو ضروري لعرض هذا الموقع على متصفحك، أو كما هو مسموح به بموجب القوانين المعمول بها أو الشروط، لا يُسمح بإعادة إنتاج أي من المعلومات أو المحتوى الموجود على هذا الموقع أو تكييفه أو تحميله إلى طرف ثالث أو توزيعه أو نقله بأي شكل من الأشكال أو بأي وسيلة دون موافقة خطية من الشركة. تعد Newera Capital Markets Limited وشعار NCML علامات تجارية مسجلة للشركة. وتعد Apple وشعار Apple وMac وiPhone وiPad وiPod touch علامات تجارية لشركة Apple Inc. مسجلة في الولايات المتحدة وبلدان أخرى. App Store هي علامة خدمة لشركة Apple Inc. Android هي علامة تجارية لشركة Google Inc.، بينما Windows هي علامة تجارية مسجلة لشركة Microsoft Corporation في الولايات المتحدة وبلدان أخرى.',
            },
            {
              heading: 'محتوى الأطراف الثالثة',
              body: 'من وقت لآخر، قد يحتوي هذا الموقع على روابط لمواقع إلكترونية أو موارد أخرى تقدمها أطراف ثالثة. نحن نقدم لك روابط وموارد الأطراف الثالثة فقط لأغراض المعلومات والراحة. ولا نقدم أي تعهدات أو ضمانات بشأن المحتوى أو ملاءمة أو مناسبة المحتوى أو المنتجات الموجودة في أي مواقع إلكترونية أو موارد تابعة لأطراف ثالثة.',
            },
            {
              heading: 'إخلاء المسؤولية وتحديد المسؤولية',
              body: 'إلى أقصى حد تسمح به القوانين، لن نكون مسؤولين بأي شكل من الأشكال عن أي خسارة أو ضرر تتكبده من خلال استخدام هذا الموقع أو الوصول إليه، أو نتيجة لفشلنا في توفير هذا الموقع.',
            },
            {
              heading: 'مراجعة الشروط والأحكام الخاصة بالموقع',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) لتقييم فعاليتها وتحديثها. هذه الشروط والأحكام الخاصة بالموقع مدعومة من الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 2. Privacy Policy (from Privacy Policies.docx)
    {
      pageType: 'privacy-policy',
      en: {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED ("the Company / Newera Capital") is committed to protecting its customers\' and other website users\' ("the Client / the Clients") privacy and developing technology that gives the Clients the most powerful, satisfying, and safe online experience. This Privacy Policy (the "Policy") applies to the Newera Capital website and governs data collection and usage. By using the Newera Capital website, the Clients indicate their consent to the data practices described in this Policy.',
          [
            {
              heading: 'COLLECTION OF THE CLIENTS’ PERSONAL INFORMATION',
              body: 'In accordance with applicable Anti-Money Laundering and Counter-Terrorism Financing regulations and laws, Newera Capital has an obligation to collect information and verify the identity of its Clients. This information is referred to as Know Your Client information or KYC information. Specifically, the information we collect for KYC identification may include identity, contact details, National Identifier, Socio-demographic, transactional, financial, contractual, documentary data, etc. Newera Capital will carry out its customer identification and verification procedures.\n\nWhen submitting a Client’s application form to open a live or demo account with Newera Capital, he/she will be providing entities within the Newera Capital group of companies (collectively, the “Newera Capital Group”), and its affiliated entities with their personal information. By applying for and/or opening a live or demo Newera Capital account, the Client acknowledges and agrees that their consent is voluntarily provided to the Newera Capital Group and its affiliated entities, including Newera Capital Markets Limited.\n\nPersonal information refers to any information about the Client that identifies the Client or by which the Client’s identity can reasonably be ascertained.\n\nNewera Capital will also maintain records of all transactions and activities on the Client’s account(s), including, but not limited to, details of liquidations on the Client’s account(s). Newera Capital may also collect information about the Client from publicly available sources such as company registers. At any time, upon request, the Client may gain access to the information Newera Capital holds about the Client. Newera Capital may also record telephone conversations between the Client and persons working for Newera Capital. Such recordings, or transcripts from such recordings, may be used to resolve any dispute between the Client and Newera Capital and with a view to satisfying Newera Capital’s statutory obligations, including requests from regulators and other government bodies. Newera Capital will also collect and hold information about the Client when the Client completes an online application or other type of form or operates and deals on the Client’s Account through Newera Capital’s websites.\n\nNewera Capital may collect sensitive information about a Client if:\n\n• The collection is required or authorized by applicable laws or court/tribunal order;\n• The Client consents to the collection and the information is reasonably necessary for Newera Capital’s functions and activities;\n• Newera Capital reasonably believes that collection is necessary to lessen or prevent a serious threat to the life, health, or safety of an individual or the public, and it is unreasonable or impracticable to obtain the Clients’ consent to the collection;\n• Newera Capital has reason to suspect that unlawful activity or misconduct of a serious nature that relates to Newera Capital’s functions or activities is being or may be engaged in;\n• Newera Capital believes that the collection is reasonably necessary to assist in locating a person who has been reported as missing.\n\nThe Clients are not directly imposed to give Newera Capital their personal information in the application forms. However, without the information required, Newera Capital may not be able to open an account and/or provide services to them. While Newera Capital makes every effort to ensure that all information it holds about Clients is accurate, complete, and up to date, Clients need to notify Newera Capital promptly if there are any changes to the Clients’ personal information. Should the Clients have any questions or complaints about their privacy, the Clients should contact Newera Capital. From time to time, Newera Capital may receive personal information about the Clients from third-party sources, but only where Newera Capital has checked that these third parties either have their consent or are otherwise legally permitted or required to disclose their personal information to us. Newera Capital uses the information received from these third parties to enhance services provided to the Clients, such as providing curated content that is relevant to services and topics they are interested in.\n\nWhen the Clients visit Newera Capital website, Newera Capital may collect certain information automatically from the Clients’ devices. In some countries, including countries in the European Economic Area (EEA) and PRC, this information may be considered personal information under applicable data protection laws. Specifically, the information collected automatically may include information like the Clients’ IP address, device type, unique device identification numbers, browser-type, broad geographic location (for example, country or city-level location), and other technical information. Newera Capital may also collect information about how the Clients’ devices interact with Newera Capital website, including the pages accessed and links clicked. Collecting this information enables Newera Capital to better understand the visitors who come to its website, where they come from, and which content at Newera Capital website they are interested in. Also, Newera Capital uses this information for its internal analytics purposes and to improve the quality and relevance of Newera Capital website. Newera Capital encourages the Clients to review the privacy policies of websites they choose to link so that they can understand how those websites collect, use, and share the Clients’ information. Newera Capital is not responsible for the privacy policies or other content on websites outside of the Newera Capital (and its sister Companies) websites. In all cases, Newera Capital strives to limit the amount of information to be collected and stored to only those that are necessary, so that it could provide the Clients with the relevant services.',
            },
            {
              heading: 'USE OF THE CLIENTS’ PERSONAL INFORMATION',
              body: 'Newera Capital collects and uses the Clients’ personal information to operate its website and deliver the services that the Clients need. Newera Capital also uses the Clients’ personally identifiable information to inform them of other products or services offered by Newera Capital and its affiliates. Newera Capital does not sell, rent, or lease its customer lists to third parties. Newera Capital may, from time to time, contact the Clients on behalf of external business partners about a particular offering that may be of their interest. In those cases, the Clients’ unique identifiable information (e-mail, name, address, telephone number) is not transferred to the third party. In addition, Newera Capital may share data with trusted partners for a business purpose, for instance, to perform statistical analysis, send them email or postal mail, provide customer support, amongst others. All such third parties are prohibited from using the Clients’ personal information except to provide Newera Capital related services and they are required to maintain the confidentiality of the Clients’ information.\n\nNewera Capital does not use or disclose sensitive personal information, such as race, religion, or political affiliations, without the Clients’ explicit consent. Newera Capital keeps track of the websites and pages that the Clients visit within Newera Capital, in order to determine what Newera Capital services are most popular. This data is used to deliver customized content and advertising within Newera Capital to Clients, whose behavior indicates that they are interested in a particular subject.\n\nNewera Capital websites will disclose the Clients’ personal information, without notice, only if required to do so by law or in the good faith belief that such action is necessary to:\n\n• Conform to the requirements of the law or comply with legal process served on Newera Capital or the website;\n• Protect and defend the rights or property of Newera Capital; and,\n• Act under exigent circumstances to protect the personal safety of users of Newera Capital, or the public.',
            },
            {
              heading: 'USE OF COOKIES',
              body: 'The Newera Capital website uses “cookies” to help the Clients personalize their online experience. A cookie is a text file that is placed on the Client’s hard disk by a Web page server. Cookies cannot be used to run programs or deliver viruses to their computer.\n\nCookies are uniquely assigned to the Clients and can only be read by a web server in the domain that issued the cookies to the Clients. One of the primary purposes of cookies is to provide a convenience feature to save the Clients’ time. The purpose of a cookie is to tell the Web server that the Clients have returned to a specific page. For example, if the Clients personalize Newera Capital pages or register with Newera Capital’s website or services, a cookie helps to recall the Clients’ specific information on subsequent visits. This simplifies the process of recording the Clients’ personal information, such as billing addresses, shipping addresses, and so on. When a particular Client returns to the same Newera Capital website, the information he/she previously provided can be retrieved, so that they can easily use the customized Newera Capital website. The Clients have the ability to accept or decline cookies.\n\nMost Web browsers automatically accept cookies, but the Clients can usually modify their browser setting to decline cookies if they prefer. If the Clients choose to decline cookies, they may not be able to fully experience the interactive features of the Newera Capital services or websites visited.',
            },
            {
              heading: 'SECURITY OF THE CLIENTS’ PERSONAL INFORMATION',
              body: 'Newera Capital secures the Clients’ personal information from unauthorized access, use, or disclosure. Newera Capital secures the personally identifiable information that the Clients provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. When Newera Capital transmits personal information (such as a credit card number) to other websites, it is protected through the use of encryption, which includes (but is not limited to) Secure Socket Layer (SSL) protocol.',
            },
            {
              heading: 'LANGUAGES',
              body: 'Language of communication between the Company and the Client shall be in English. All binding contractual documentation is available in English. Upon its sole discretion, the Company may communicate with the Client in another language than English; however, in case of any discrepancy between the meanings of any communications and/or meanings, or any other communications forming part of this Policy or any other agreements, information or communication in any other language, the meaning of the English Language version shall prevail. The Company or third parties may have provided the Client with translations of this Policy. The original English versions shall be the only legally binding version. In case of discrepancies between the English version and other translations in the Client’s possession, the original English version provided by the Company on the website shall prevail.',
            },
            {
              heading: 'REVIEW OF PRIVACY POLICY',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy, and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Privacy Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة الخصوصية',
        body: legalBody(
          'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / Newera Capital") بحماية خصوصية عملائها ومستخدمي موقعها الإلكتروني الآخرين ("العميل / العملاء") وتطوير التقنيات التي تمنح العملاء تجربة رقمية آمنة وموثوقة. تنطبق سياسة الخصوصية هذه ("السياسة") على موقع Newera Capital الإلكتروني وتحكم جمع البيانات واستخدامها. ويُعد استخدام موقع Newera Capital موافقة صريحة من العميل على ممارسات البيانات الموضحة في هذه السياسة.',
          [
            {
              heading: 'جمع المعلومات الشخصية للعملاء',
              body: 'وفقًا للوائح والقوانين المعمول بها لمكافحة غسل الأموال وتمويل الإرهاب، تلتزم Newera Capital بجمع المعلومات والتحقق من هوية عملائها. ويُشار إلى هذه المعلومات باسم معلومات اعرف عميلك أو معلومات KYC. وعلى وجه التحديد، قد تشمل المعلومات التي نجمعها لأغراض التحقق من هوية العميل بيانات الهوية، وبيانات الاتصال، ورقم الهوية الوطنية، والبيانات الاجتماعية والديموغرافية، وبيانات المعاملات، والبيانات المالية، والتعاقدية، والمستندية، وما إلى ذلك. وستقوم Newera Capital بتنفيذ إجراءات تحديد هوية العملاء والتحقق منها.\n\nعند تقديم العميل طلبًا لفتح حساب حقيقي أو تجريبي لدى Newera Capital، فإنه سيقدم معلوماته الشخصية إلى الكيانات التابعة لمجموعة شركات Newera Capital (ويُشار إليها مجتمعة باسم "مجموعة Newera Capital") والكيانات التابعة لها. ومن خلال التقدم بطلب و/أو فتح حساب حقيقي أو تجريبي لدى Newera Capital، يقر العميل ويوافق على أن موافقته قد تم تقديمها طوعًا إلى مجموعة Newera Capital والكيانات التابعة لها، بما في ذلك NEWERA CAPITAL MARKETS LIMITED.\n\nتشير المعلومات الشخصية إلى أي معلومات تتعلق بالعميل تحدد هويته أو يمكن من خلالها التحقق من هويته بشكل معقول.\n\nتحتفظ Newera Capital أيضًا بسجلات لجميع المعاملات والأنشطة التي تتم على حسابات العميل، بما في ذلك، على سبيل المثال لا الحصر، تفاصيل عمليات التصفية على حسابات العميل. وقد تقوم Newera Capital أيضًا بجمع معلومات عن العميل من مصادر متاحة للعامة، مثل سجلات الشركات. ويجوز للعميل، في أي وقت وبناءً على طلبه، الوصول إلى المعلومات التي تحتفظ بها Newera Capital عنه. وقد تقوم Newera Capital أيضًا بتسجيل المحادثات الهاتفية بين العميل والأشخاص العاملين لدى Newera Capital. ويجوز استخدام هذه التسجيلات أو النصوص المستخرجة منها لحل أي نزاع بين العميل وNewera Capital، وكذلك للوفاء بالالتزامات القانونية المفروضة على Newera Capital، بما في ذلك الطلبات الواردة من الجهات التنظيمية والهيئات الحكومية الأخرى. كما ستقوم Newera Capital بجمع والاحتفاظ بالمعلومات المتعلقة بالعميل عندما يكمل العميل طلبًا عبر الإنترنت أو أي نوع آخر من النماذج، أو عندما يقوم بتشغيل حسابه وإجراء المعاملات عليه من خلال مواقع Newera Capital.\n\nيجوز لـ Newera Capital جمع معلومات حساسة عن العميل إذا:\n\n• كان جمع هذه المعلومات مطلوبًا أو مصرحًا به بموجب القوانين المعمول بها أو بموجب أمر صادر عن محكمة أو هيئة قضائية؛\n• وافق العميل على جمع المعلومات وكانت المعلومات ضرورية بشكل معقول لأداء وظائف وأنشطة Newera Capital؛\n• اعتقدت Newera Capital بشكل معقول أن جمع المعلومات ضروري لتقليل أو منع تهديد خطير لحياة أو صحة أو سلامة فرد أو الجمهور، وكان الحصول على موافقة العميل على جمع المعلومات أمرًا غير معقول أو غير عملي؛\n• كان لدى Newera Capital سبب للاشتباه في أن نشاطًا غير قانوني أو سوء سلوك ذي طبيعة خطيرة يتعلق بوظائف أو أنشطة Newera Capital يتم أو قد يتم ارتكابه؛\n• اعتقدت Newera Capital أن جمع المعلومات ضروري بشكل معقول للمساعدة في تحديد مكان شخص تم الإبلاغ عن فقدانه.\n\nلا يُفرض على العملاء بشكل مباشر تقديم معلوماتهم الشخصية إلى Newera Capital في نماذج الطلبات. ومع ذلك، من دون المعلومات المطلوبة، قد لا تتمكن Newera Capital من فتح حساب و/أو تقديم الخدمات لهم. وبينما تبذل Newera Capital كل جهد ممكن لضمان أن تكون جميع المعلومات التي تحتفظ بها عن العملاء دقيقة وكاملة ومحدثة، يجب على العملاء إخطار Newera Capital فورًا بأي تغييرات تطرأ على معلوماتهم الشخصية. وفي حال وجود أي أسئلة أو شكاوى لدى العملاء بشأن خصوصيتهم، يجب عليهم التواصل مع Newera Capital. ومن وقت لآخر، قد تتلقى Newera Capital معلومات شخصية عن العملاء من مصادر تابعة لأطراف ثالثة، ولكن فقط بعد التحقق من أن هذه الأطراف الثالثة قد حصلت على موافقة العملاء أو أنها مخولة أو ملزمة قانونًا بالكشف عن معلوماتهم الشخصية لنا. وتستخدم Newera Capital المعلومات الواردة من هذه الأطراف الثالثة لتحسين الخدمات المقدمة للعملاء، مثل توفير محتوى منسق ذي صلة بالخدمات والموضوعات التي يهتمون بها.\n\nعندما يزور العملاء موقع Newera Capital، قد تقوم Newera Capital بجمع معلومات معينة تلقائيًا من أجهزة العملاء. وفي بعض البلدان، بما في ذلك البلدان الواقعة في المنطقة الاقتصادية الأوروبية (EEA) وجمهورية الصين الشعبية (PRC)، قد تُعتبر هذه المعلومات معلومات شخصية بموجب قوانين حماية البيانات المعمول بها. وعلى وجه التحديد، قد تشمل المعلومات التي يتم جمعها تلقائيًا عنوان IP الخاص بالعميل، ونوع الجهاز، وأرقام تعريف الجهاز الفريدة، ونوع المتصفح، والموقع الجغرافي العام (مثل مستوى الدولة أو المدينة)، وغيرها من المعلومات التقنية. وقد تقوم Newera Capital أيضًا بجمع معلومات حول كيفية تفاعل أجهزة العملاء مع موقع Newera Capital، بما في ذلك الصفحات التي تم الوصول إليها والروابط التي تم النقر عليها. ويتيح جمع هذه المعلومات لـ Newera Capital فهم الزوار الذين يأتون إلى موقعها الإلكتروني بشكل أفضل، ومصدر زياراتهم، والمحتوى الذي يهتمون به على موقع Newera Capital. كما تستخدم Newera Capital هذه المعلومات لأغراض التحليلات الداخلية ولتحسين جودة موقعها الإلكتروني وملاءمته. وتشجع Newera Capital العملاء على مراجعة سياسات الخصوصية للمواقع التي يختارون الانتقال إليها لفهم كيفية جمع تلك المواقع لمعلوماتهم واستخدامها ومشاركتها. ولا تتحمل Newera Capital مسؤولية سياسات الخصوصية أو أي محتوى آخر على المواقع الإلكترونية خارج مواقع Newera Capital (وشركاتها الشقيقة). وفي جميع الحالات، تسعى Newera Capital إلى الحد من كمية المعلومات التي يتم جمعها وتخزينها لتقتصر على المعلومات الضرورية فقط، حتى تتمكن من تقديم الخدمات ذات الصلة للعملاء.',
            },
            {
              heading: 'استخدام المعلومات الشخصية للعملاء',
              body: 'تجمع Newera Capital المعلومات الشخصية للعملاء وتستخدمها لتشغيل موقعها الإلكتروني وتقديم الخدمات التي يحتاجها العملاء. كما تستخدم Newera Capital المعلومات الشخصية القابلة للتعريف الخاصة بالعملاء لإبلاغهم بالمنتجات أو الخدمات الأخرى التي تقدمها Newera Capital والشركات التابعة لها. ولا تبيع Newera Capital قوائم عملائها أو تؤجرها أو تؤجرها من الباطن لأطراف ثالثة. وقد تتواصل Newera Capital من وقت لآخر مع العملاء نيابةً عن شركاء تجاريين خارجيين بشأن عرض معين قد يهمهم. وفي هذه الحالات، لا يتم نقل المعلومات الفريدة التي تحدد هوية العملاء (البريد الإلكتروني والاسم والعنوان ورقم الهاتف) إلى الطرف الثالث. بالإضافة إلى ذلك، قد تشارك Newera Capital البيانات مع شركاء موثوقين لأغراض تجارية، مثل إجراء التحليلات الإحصائية، وإرسال البريد الإلكتروني أو البريد العادي، وتقديم دعم العملاء، وغير ذلك. ويُحظر على جميع هذه الأطراف الثالثة استخدام المعلومات الشخصية للعملاء إلا لتقديم الخدمات المتعلقة بـ Newera Capital، كما يُطلب منهم الحفاظ على سرية معلومات العملاء.\n\nلا تستخدم Newera Capital أو تفصح عن المعلومات الشخصية الحساسة، مثل العِرق أو الدين أو الانتماءات السياسية، دون موافقة صريحة من العملاء. وتقوم Newera Capital بتتبع المواقع والصفحات التي يزورها العملاء داخل Newera Capital لتحديد خدمات Newera Capital الأكثر شعبية. وتُستخدم هذه البيانات لتقديم محتوى وإعلانات مخصصة داخل Newera Capital للعملاء الذين يشير سلوكهم إلى اهتمامهم بموضوع معين.\n\nتفصح مواقع Newera Capital عن المعلومات الشخصية للعملاء، دون إشعار، فقط إذا كان ذلك مطلوبًا بموجب القانون أو بناءً على اعتقاد حسن النية بأن هذا الإجراء ضروري من أجل:\n\n• الامتثال لمتطلبات القانون أو الإجراءات القانونية المقدمة إلى Newera Capital أو الموقع الإلكتروني؛\n• حماية والدفاع عن حقوق أو ممتلكات Newera Capital؛ و\n• التصرف في الظروف الطارئة لحماية السلامة الشخصية لمستخدمي Newera Capital أو الجمهور.',
            },
            {
              heading: 'استخدام ملفات تعريف الارتباط (Cookies)',
              body: 'يستخدم موقع Newera Capital الإلكتروني "ملفات تعريف الارتباط" لمساعدة العملاء على تخصيص تجربتهم عبر الإنترنت. وملف تعريف الارتباط هو ملف نصي يتم وضعه على القرص الصلب الخاص بالعميل بواسطة خادم صفحة ويب. ولا يمكن استخدام ملفات تعريف الارتباط لتشغيل البرامج أو نقل الفيروسات إلى جهاز الكمبيوتر الخاص بالعميل.\n\nيتم تخصيص ملفات تعريف الارتباط للعملاء بشكل فريد، ولا يمكن قراءتها إلا بواسطة خادم ويب في النطاق الذي أصدر ملفات تعريف الارتباط للعملاء. ويتمثل أحد الأغراض الرئيسية لملفات تعريف الارتباط في توفير ميزة مريحة لتوفير وقت العملاء. ويهدف ملف تعريف الارتباط إلى إبلاغ خادم الويب بأن العملاء قد عادوا إلى صفحة معينة. فعلى سبيل المثال، إذا قام العملاء بتخصيص صفحات Newera Capital أو سجلوا في موقع Newera Capital أو خدماتها، فإن ملف تعريف الارتباط يساعد على تذكر معلومات العملاء المحددة في الزيارات اللاحقة. وهذا يبسط عملية تسجيل المعلومات الشخصية للعملاء، مثل عناوين الفوترة وعناوين الشحن وما إلى ذلك. وعندما يعود عميل معين إلى موقع Newera Capital نفسه، يمكن استرجاع المعلومات التي قدمها سابقًا، بحيث يتمكن بسهولة من استخدام موقع Newera Capital المخصص. ويتمتع العملاء بالقدرة على قبول ملفات تعريف الارتباط أو رفضها.\n\nتقبل معظم متصفحات الويب ملفات تعريف الارتباط تلقائيًا، ولكن يمكن للعملاء عادةً تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط إذا رغبوا في ذلك. وإذا اختار العملاء رفض ملفات تعريف الارتباط، فقد لا يتمكنون من الاستفادة بشكل كامل من الميزات التفاعلية لخدمات Newera Capital أو المواقع التي تتم زيارتها.',
            },
            {
              heading: 'أمان المعلومات الشخصية للعملاء',
              body: 'تحمي Newera Capital المعلومات الشخصية للعملاء من الوصول أو الاستخدام أو الإفصاح غير المصرح به. كما تؤمّن Newera Capital المعلومات الشخصية القابلة للتعريف التي يقدمها العملاء على خوادم كمبيوتر في بيئة آمنة وخاضعة للرقابة، ومحمية من الوصول أو الاستخدام أو الإفصاح غير المصرح به. وعندما تنقل Newera Capital المعلومات الشخصية (مثل رقم بطاقة الائتمان) إلى مواقع إلكترونية أخرى، يتم حمايتها باستخدام التشفير، بما في ذلك، على سبيل المثال لا الحصر، بروتوكول طبقة المقابس الآمنة (SSL).',
            },
            {
              heading: 'اللغات',
              body: 'تكون لغة التواصل بين الشركة والعميل هي اللغة الإنجليزية. وتتوفر جميع الوثائق التعاقدية الملزمة باللغة الإنجليزية. ويجوز للشركة، وفقًا لتقديرها وحدها، التواصل مع العميل بلغة أخرى غير اللغة الإنجليزية؛ ومع ذلك، في حالة وجود أي تعارض بين معاني أي مراسلات و/أو معانٍ أخرى، أو أي مراسلات أخرى تشكل جزءًا من هذه السياسة أو أي اتفاقيات أو معلومات أو مراسلات أخرى بأي لغة أخرى، فإن معنى النسخة باللغة الإنجليزية هو الذي يسود. وقد تكون الشركة أو أطراف ثالثة قد زودت العميل بترجمات لهذه السياسة. وتكون النسخ الأصلية باللغة الإنجليزية هي النسخ الوحيدة الملزمة قانونًا. وفي حالة وجود أي تعارض بين النسخة الإنجليزية وأي ترجمات أخرى بحوزة العميل، تسود النسخة الإنجليزية الأصلية التي توفرها الشركة على الموقع الإلكتروني.',
            },
            {
              heading: 'مراجعة سياسة الخصوصية',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) لتقييم فعاليتها وتحديثها.\n\nتحظى سياسة الخصوصية هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v2.1',
    },

    // 3. Cookie Policy (from Cookie-Policy.pdf)
    {
      pageType: 'cookie-policy',
      en: {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED ("the Company") (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of International Business Companies Act, Saint Lucia. When you use our Website, NCML will use cookies to distinguish you from other users of the NCML Website. This enables the Company to provide you with a more relevant and effective experience when browsing the NCML Website, including presenting pages in accordance with your needs or preferences, and allowing us to improve the site generally. This Cookie Policy provides you with comprehensive information about the cookies we use and the way we are using them. You should also read the NCML Privacy Policy in conjunction with this Policy.',
          [
            {
              heading: 'What is a Cookie?',
              body: 'Cookies are small files of information that often include a unique identification number or value, which are stored on your computer’s hard drive as a result of using the NCML Website. Unless you have adjusted your browser setting so that it will refuse cookies, the NCML system will issue cookies as soon as you visit the NCML Website. Cookies are frequently used on many websites on the internet and you can choose if and how a cookie will be accepted by changing your preferences and options in your browser. Some of our business partners (e.g. advertisers) use cookies on the NCML Website. We have no access to, or control over, these cookies. The cookies do not contain personally identifying information nor are they used to identify you. You may choose to disable cookies; however, you may not be able to access some parts of the NCML Website if you choose to disable cookie acceptance in your browser, particularly the secure parts of the Website.',
            },
            {
              heading: 'How to Delete and Block Cookies',
              body: 'You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website. For further information about disabling cookies, please refer to www.allaboutcookies.org.',
            },
            {
              heading: 'Your Consent',
              body: 'By continuing to use the NCML Website, you are agreeing to the Company placing cookies on your computer for analyzing the way you use the NCML Website. If you do not wish to accept cookies in connection with your use of this Website, you must stop using the NCML Website.',
            },
            {
              heading: 'Session Cookies',
              body: 'We use session cookies for the following purposes: (i) To allow you to carry information across pages of the NCML site and avoid having to re-enter information; (ii) Within registration to allow you to access stored information; (iii) Non-personal data for tagging purposes only (by random number).',
            },
            {
              heading: 'Persistent Cookies',
              body: 'The Company uses persistent cookies for the following purposes: (i) To help us recognize you as a unique visitor (by number) when you return to the NCML website, tailor content or advertisements to match your preferred interests, and avoid showing you the same adverts repeatedly; (ii) To compile anonymous, aggregated statistics to understand how users use the site and improve the structure of the NCML Website; (iii) To internally identify you by account name, name, email address, customer identification number, currency, and location (geographic and computer ID/IP address); (iv) To differentiate users who are on the same network and correctly allocate transactions to the appropriate account; (v) Within research surveys to ensure you are not invited to complete a questionnaire too often or after you have already done so.',
            },
            {
              heading: 'Third Party Cookies',
              body: 'Third parties serve cookies via this site for the following purposes: (i) To serve advertisements on the NCML site and track whether these advertisements are clicked on by users; (ii) To control how often you are shown a particular advertisement; (iii) To tailor content to your preferences; (iv) To count the number of anonymous users of the NCML site; (v) For website usage analysis.',
            },
            {
              heading: 'Use of Web Beacons',
              body: 'Some of the NCML web pages may contain electronic images known as Web beacons (sometimes known as clear gifs) that allow the Company to count users who have visited these pages. Web beacons collect only limited information including a cookie number, time and date of a page view, and a description of the page on which the Web beacon resides. NCML could also carry web beacons placed by third-party advertisers. These beacons do not carry any personally identifiable information and are only used to track the effectiveness of a particular campaign. If you wish to know more about cookies, please consult the help menu on your web browser or visit independent information providers such as www.allaboutcookies.org. If you have any questions regarding NCML privacy or security measures, please email info@newera365.com.',
            },
            {
              heading: 'Review of Cookie Policy',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated. This Cookie Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة ملفات تعريف الارتباط',
        body: legalBody(
          'تأسست شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، المادة 6 من قانون الشركات التجارية الدولية في سانت لوسيا. عند استخدام موقعنا الإلكتروني، ستستخدم الشركة ملفات تعريف الارتباط لتمييزك عن المستخدمين الآخرين لموقع NCML، مما يتيح تقديم تجربة أكثر ملاءمة وفاعلية، وتخصيص الصفحات وفقاً لاحتياجاتك وتفضيلاتك، وتحسين الموقع بشكل عام. توفر هذه السياسة معلومات شاملة حول ملفات تعريف الارتباط التي نستخدمها وكيفية استخدامها بالتكامل مع سياسة الخصوصية.',
          [
            {
              heading: 'ما هي ملفات تعريف الارتباط (Cookies)؟',
              body: 'ملفات تعريف الارتباط هي ملفات معلومات صغيرة تتضمن غالبًا رقمًا أو قيمة تعريف فريدة، ويتم تخزينها على القرص الصلب لجهاز الكمبيوتر الخاص بك نتيجة استخدام موقع NCML الإلكتروني. ما لم تقم بتعديل إعدادات متصفحك بحيث يرفض ملفات تعريف الارتباط، فسيقوم نظام NCML بإصدار ملفات تعريف الارتباط بمجرد زيارتك لموقع NCML الإلكتروني. تُستخدم ملفات تعريف الارتباط بشكل متكرر على العديد من المواقع الإلكترونية على الإنترنت، ويمكنك اختيار ما إذا كنت ستقبل ملفات تعريف الارتباط وكيفية قبولها من خلال تغيير تفضيلات وإعدادات متصفحك. يستخدم بعض شركائنا التجاريين (مثل المعلنين) ملفات تعريف الارتباط على موقع NCML الإلكتروني. ولا نملك إمكانية الوصول إلى ملفات تعريف الارتباط هذه أو التحكم فيها. ولا تحتوي ملفات تعريف الارتباط على معلومات تعريف شخصية، كما أنها لا تُستخدم لتحديد هويتك. يمكنك اختيار تعطيل ملفات تعريف الارتباط؛ ومع ذلك، قد لا تتمكن من الوصول إلى بعض أجزاء موقع NCML الإلكتروني إذا اخترت تعطيل قبول ملفات تعريف الارتباط في متصفحك، وخاصة الأجزاء الآمنة من الموقع.',
            },
            {
              heading: 'كيفية حذف وحظر ملفات تعريف الارتباط',
              body: 'يمكنك اختيار قبول ملفات تعريف الارتباط أو رفضها. تقبل معظم متصفحات الويب ملفات تعريف الارتباط تلقائيًا، ولكن يمكنك عادةً تعديل إعدادات متصفحك لرفضها إذا كنت تفضل ذلك. وقد يمنعك هذا من الاستفادة الكاملة من الموقع الإلكتروني. لمزيد من المعلومات حول تعطيل ملفات تعريف الارتباط، يرجى الرجوع إلى www.allaboutcookies.org.',
            },
            {
              heading: 'موافقتك',
              body: 'من خلال الاستمرار في استخدام موقع NCML الإلكتروني، فإنك توافق على قيام الشركة بوضع ملفات تعريف الارتباط على جهاز الكمبيوتر الخاص بك لتحليل الطريقة التي تستخدم بها موقع NCML الإلكتروني. إذا كنت لا ترغب في قبول ملفات تعريف الارتباط فيما يتعلق باستخدامك لهذا الموقع الإلكتروني، فيجب عليك التوقف عن استخدام موقع NCML الإلكتروني.',
            },
            {
              heading: 'ملفات تعريف الارتباط المؤقتة (Session Cookies)',
              body: 'نستخدم ملفات تعريف الارتباط المؤقتة للأغراض التالية: (1) السماح لك بنقل المعلومات عبر صفحات موقع NCML وتجنب الحاجة إلى إعادة إدخال المعلومات؛ (2) أثناء التسجيل، للسماح لك بالوصول إلى المعلومات المخزنة؛ (3) استخدام البيانات غير الشخصية لأغراض وضع العلامات فقط (عن طريق رقم عشوائي).',
            },
            {
              heading: 'ملفات تعريف الارتباط الدائمة (Persistent Cookies)',
              body: 'تستخدم الشركة ملفات تعريف الارتباط الدائمة للأغراض التالية: (1) مساعدتنا في التعرف عليك كزائر فريد (عن طريق رقم) عند عودتك إلى موقع NCML، والسماح لنا بتخصيص المحتوى أو الإعلانات لتتناسب مع اهتماماتك المفضلة، بالإضافة إلى تجنب عرض الإعلانات نفسها عليك بشكل متكرر؛ (2) تجميع إحصاءات مجهولة ومجمعة لفهم كيفية استخدام المستخدمين لموقع NCML حتى نتمكن من تحسين هيكل الموقع؛ (3) التعرف عليك داخليًا من خلال اسم الحساب والاسم وعنوان البريد الإلكتروني ورقم تعريف العميل والعملة والموقع (الجغرافي ومعرّف الكمبيوتر/عنوان IP)؛ (4) التمييز بين المستخدمين الموجودين على نفس الشبكة، مما يمكننا من تخصيص المعاملات بشكل صحيح للحساب المناسب؛ (5) ضمن استطلاعات البحث لضمان عدم دعوتك لإكمال استبيان بشكل متكرر أو بعد إكماله بالفعل.',
            },
            {
              heading: 'ملفات تعريف الارتباط للأطراف الثالثة',
              body: 'تقوم أطراف ثالثة بتقديم ملفات تعريف الارتباط عبر هذا الموقع للأغراض التالية: (1) عرض الإعلانات على موقع NCML وتتبع ما إذا كان المستخدمون قد نقروا على هذه الإعلانات؛ (2) التحكم في عدد المرات التي يتم فيها عرض إعلان معين عليك؛ (3) تخصيص المحتوى وفقًا لتفضيلاتك؛ (4) حساب عدد المستخدمين المجهولين لموقع NCML؛ (5) تحليل استخدام الموقع الإلكتروني.',
            },
            {
              heading: 'استخدام إشارات الويب (Web Beacons)',
              body: 'قد تحتوي بعض صفحات الويب الخاصة بـ NCML على صور إلكترونية تُعرف باسم إشارات الويب (وتُعرف أحيانًا باسم clear gifs)، والتي تتيح للشركة حساب عدد المستخدمين الذين زاروا هذه الصفحات. تجمع إشارات الويب معلومات محدودة فقط، بما في ذلك رقم ملف تعريف الارتباط ووقت وتاريخ مشاهدة الصفحة ووصف الصفحة التي توجد فيها إشارة الويب. وقد تستخدم NCML أيضًا إشارات ويب موضوعة من قبل معلنين من أطراف ثالثة. ولا تحتوي هذه الإشارات على أي معلومات تعريف شخصية، وتُستخدم فقط لتتبع فعالية حملة معينة. إذا كنت ترغب في معرفة المزيد عن ملفات تعريف الارتباط، يرجى الرجوع إلى قائمة المساعدة في متصفح الويب الخاص بك أو زيارة موفري المعلومات المستقلين مثل www.allaboutcookies.org. وإذا كانت لديك أي أسئلة تتعلق بإجراءات الخصوصية أو الأمان لدى NCML، يرجى إرسال بريد إلكتروني إلى info@newera365.com.',
            },
            {
              heading: 'مراجعة سياسة ملفات تعريف الارتباط',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) لتقييم فعاليتها وتحديثها. تحظى سياسة ملفات تعريف الارتباط هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 4. AML, KYC & Due Diligence Policy (from AML-KYC-Due-Diligence.pdf)
    {
      pageType: 'aml-policy',
      en: {
        title: 'AML, KYC & Due Diligence Policy',
        slug: 'aml-policy',
        body: legalBody(
          'The Anti-Money Laundering, Know Your Customer & Due Diligence Policy of NEWERA CAPITAL MARKETS LIMITED ("the Company") is formulated in accordance with Saint Lucia legislation (Money Laundering Prevention Act, Anti-Terrorism Act, Proceeds of Crime Act) and FATF 40 Recommendations under the Financial Services Regulatory Authority (FSRA).',
          [
            {
              heading: '1. Regulatory Framework & Policy Objectives',
              body: 'Our policy implements a comprehensive risk-based framework to combat money laundering and terrorist financing, strictly prohibiting dealings with shell banks, anonymous accounts, and jurisdictions blacklisted by FATF.',
            },
            {
              heading: '2. Five Core Anti-Money Laundering Pillars',
              body: 'Our AML program rests upon: (i) Customer identification procedures (KYC); (ii) Robust record-keeping; (iii) Internal suspicious activity reporting to the Compliance Officer; (iv) Internal preventative controls; and (v) Ongoing employee compliance training.',
            },
            {
              heading: '3. Compliance Standards & Staff Responsibilities',
              body: 'Full compliance with AML procedures is mandatory for all personnel. Failure to report suspicious activities or comply with AML mandates constitutes grounds for summary dismissal and regulatory referral.',
            },
            {
              heading: '4. Targeted Financial Sanctions & UN Sanctions Screening',
              body: 'The Company screens all prospective and existing clients against the United Nations Security Council Resolutions (UNSCR) consolidated sanctions list and domestic enforcement databases prior to account onboarding.',
            },
            {
              heading: '5. Client Due Diligence (CDD) Protocols',
              body: 'No funds may be disbursed or transactions executed until satisfactory identity verification is obtained. Third-party representation requires complete documentation of beneficial ownership and authority.',
            },
            {
              heading: '6. Identification Verification Standards',
              body: 'Identity verification uses cumulative, reliable documentation. Single unverified data sources are not accepted. The legal responsibility for verification rests entirely with the Company.',
            },
            {
              heading: '7. Source of Wealth & Enhanced Due Diligence',
              body: 'Enhanced due diligence is required for high-net-worth applicants, complex corporate structures, and Politically Exposed Persons (PEPs), including documented verification of source of wealth and economic background.',
            },
            {
              heading: '8. Individual Customer Requirements',
              body: 'Individual applicants must provide valid government-issued photographic ID (passport or national ID card) and independent proof of residential address (utility bill or bank statement within 90 days).',
            },
            {
              heading: '9. Corporate Customer Due Diligence Standards',
              body: 'Corporate applicants must furnish a Certificate of Incorporation, Memorandum and Articles of Association, Certificate of Incumbency listing current directors, and full identity records for all Ultimate Beneficial Owners (UBOs holding 25% or more).',
            },
            {
              heading: '10. Bi-Annual Review and Corporate Governance',
              body: 'This Policy is reviewed at least every six months for operational effectiveness and updated in accordance with statutory directives issued by the Saint Lucia FSRA.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة مكافحة غسل الأموال والعناية الواجبة (AML/KYC)',
        body: legalBody(
          'تمت صياغة سياسة مكافحة غسل الأموال والتحقق من هوية العميل لشركة NEWERA CAPITAL MARKETS LIMITED وفقاً لقوانين سانت لوسيا (قانون منع غسل الأموال، قانون مكافحة الإرهاب) وتوصيات مجموعة العمل المالي (FATF) بإشراف هيئة تنظيم الخدمات المالية (FSRA).',
          [
            {
              heading: '1. الإطار التنظيمي وأهداف السياسة',
              body: 'تطبق سياستنا إطارًا شاملاً قائمًا على تقييم المخاطر لمكافحة غسل الأموال وتمويل الإرهاب، مع الحظر التام للتعامل مع البنوك الوهمية والحسابات مجهولة الهوية والولايات القضائية المدرجة على القائمة السوداء لمجموعة العمل المالي (FATF).',
            },
            {
              heading: '2. الركائز الخمس الأساسية لمكافحة غسل الأموال',
              body: 'يرتكز برنامج مكافحة غسل الأموال لدينا على: (1) إجراءات تحديد هوية العملاء (KYC)؛ (2) حفظ السجلات بشكل شامل؛ (3) الإبلاغ الداخلي عن الأنشطة المشبوهة إلى مسؤول الامتثال؛ (4) الضوابط الوقائية الداخلية؛ و(5) التدريب المستمر للموظفين على متطلبات الامتثال.',
            },
            {
              heading: '3. معايير الامتثال ومسؤوليات الموظفين',
              body: 'يُعد الامتثال الكامل لإجراءات مكافحة غسل الأموال إلزاميًا لجميع الموظفين. ويُعتبر عدم الإبلاغ عن الأنشطة المشبوهة أو عدم الالتزام بمتطلبات مكافحة غسل الأموال سببًا للفصل الفوري والإحالة إلى الجهات التنظيمية المختصة.',
            },
            {
              heading: '4. العقوبات المالية المستهدفة وفحص قوائم عقوبات الأمم المتحدة',
              body: 'تقوم الشركة بفحص جميع العملاء المحتملين والحاليين مقابل قائمة العقوبات الموحدة لقرارات مجلس الأمن التابع للأمم المتحدة (UNSCR) وقواعد بيانات الإنفاذ المحلية قبل فتح الحساب وتفعيله.',
            },
            {
              heading: '5. إجراءات العناية الواجبة بالعملاء (CDD)',
              body: 'لا يجوز صرف أي أموال أو تنفيذ أي معاملات حتى يتم الحصول على تحقق مرضٍ من هوية العميل. ويتطلب تمثيل العميل من قبل طرف ثالث تقديم وثائق كاملة تثبت الملكية المستفيدة والصلاحية القانونية للتصرف نيابةً عن العميل.',
            },
            {
              heading: '6. معايير التحقق من الهوية',
              body: 'تعتمد عملية التحقق من الهوية على وثائق موثوقة ومتعددة ومتكاملة. ولا يتم قبول مصادر البيانات المنفردة غير الموثقة للتحقق من الهوية. وتقع المسؤولية القانونية عن التحقق بالكامل على عاتق الشركة.',
            },
            {
              heading: '7. مصدر الثروة والعناية الواجبة المعززة',
              body: 'تُطلب العناية الواجبة المعززة للمتقدمين من ذوي الملاءة المالية العالية، والهياكل المؤسسية المعقدة، والأشخاص السياسيين البارزين (PEPs)، بما في ذلك التحقق الموثق من مصدر الثروة والخلفية الاقتصادية.',
            },
            {
              heading: '8. متطلبات العملاء الأفراد',
              body: 'يجب على المتقدمين الأفراد تقديم وثيقة هوية سارية المفعول تحمل صورة صادرة عن جهة حكومية (جواز سفر أو بطاقة هوية وطنية)، بالإضافة إلى إثبات مستقل لعنوان الإقامة (فاتورة خدمات أو كشف حساب بنكي صادر خلال 90 يومًا).',
            },
            {
              heading: '9. معايير العناية الواجبة للعملاء من الشركات',
              body: 'يجب على المتقدمين من الشركات تقديم شهادة التأسيس، وعقد التأسيس والنظام الأساسي، وشهادة الصلاحية (Certificate of Incumbency) التي توضح أسماء المديرين الحاليين، بالإضافة إلى سجلات الهوية الكاملة لجميع المستفيدين الحقيقيين النهائيين (UBOs) الذين يمتلكون 25% أو أكثر.',
            },
            {
              heading: '10. المراجعة نصف السنوية والحوكمة المؤسسية',
              body: 'تتم مراجعة هذه السياسة مرة واحدة على الأقل كل ستة أشهر لضمان فعاليتها التشغيلية، ويتم تحديثها وفقًا للتوجيهات القانونية والتنظيمية الصادرة عن هيئة تنظيم الخدمات المالية في سانت لوسيا (FSRA).',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 5. Risk Disclosure (Existing standard disclosure)
    {
      pageType: 'risk-disclosure',
      en: {
        title: 'Risk Disclosure',
        slug: 'risk-disclosure',
        body: legalBodyWithLead(
          'IMPORTANT RISK WARNING',
          'Trading in Contracts for Difference (CFDs) and other leveraged instruments carries a high level of risk to your capital. You may lose more than your initial deposit.',
          [
            {
              heading: '1. Nature of Leveraged Products & CFDs',
              body: 'CFDs are complex derivative instruments. Between 70% and 80% of retail investor accounts lose money when trading CFDs due to the effects of leverage and rapid market shifts.',
            },
            {
              heading: '2. Assessing Suitability & Experience',
              body: 'Before opening an account, you should carefully evaluate your investment objectives, trading experience, and risk tolerance, ensuring you fully comprehend product mechanics.',
            },
            {
              heading: '3. Market Volatility & Gapping Risks',
              body: 'Financial markets experience sharp price swings, slippage, and weekend gap events during which stop-loss orders may execute at prices significantly different from requested levels.',
            },
            {
              heading: '4. Past Performance Disclaimer',
              body: 'Past trading results, backtests, and historical chart patterns are not indicative of future performance. Never invest discretionary capital you cannot afford to lose entirely.',
            },
            {
              heading: '5. Independent Professional Advice',
              body: 'If you do not fully understand the risks associated with derivative and foreign exchange trading, you should consult an independent, licensed financial advisor before trading.',
            },
          ],
        ),
      },
      ar: {
        title: 'إفصاح وتحذير المخاطر',
        body: legalBodyWithLead(
          'تحذير مهم من المخاطر',
          'التداول في عقود الفروقات (CFDs) والمنتجات المالية ذات الرافعة ينطوي على مستوى عالٍ من المخاطر لرأس مالك. قد تخسر أكثر من مبلغ إيداعك الأولي.',
          [
            {
              heading: '1. طبيعة المنتجات ذات الرافعة وعقود الفروقات',
              body: 'عقود الفروقات أدوات مشتقة معقدة. تخسر نسبة كبيرة من حسابات المستثمرين الأفراد أموالها نتيجة تأثير الرافعة المالية والتقلبات السريعة في السوق.',
            },
            {
              heading: '2. تقييم الملاءمة والخبرة الاستثمارية',
              body: 'يجب عليك قبل التداول تقييم أهدافك وخبرتك وقدرتك على تحمل المخاطر والتأكد من استيعابك لكيفية عمل هذه الأدوات المالية.',
            },
            {
              heading: '3. تقلبات الأسواق ومخاطر الفجوات السعرية',
              body: 'تشهد الأسواق المالية تقلبات حادة وانزلاقات سعرية وفجوات افتتاحية قد تؤدي لتنفيذ أوامر وقف الخسارة عند مستويات مختلفة عن السعر المحدد.',
            },
            {
              heading: '4. الأداء السابق لا يضمن النتائج المستقبلية',
              body: 'النتائج التاريخية ونماذج التداول السابقة ليست مؤشراً على الأداء المستقبلي. لا تتداول أبداً بأموال لا تستطيع تحمل خسارتها بالكامل.',
            },
            {
              heading: '5. طلب المشورة المالية المستقلة',
              body: 'إذا كانت لديك أي شكوك بشأن ملائمة هذه المنتجات لظروفك المالية، نوصي باستشارة مستشار مالي مستقل ومرخص قبل اتخاذ أي قرار.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 6. Website Terms & Conditions (from Website-Terms-Conditions.pdf)
    {
      pageType: 'website-terms',

      en: {
        title: 'Website Terms & Conditions',
        slug: 'website-terms',

        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED(“the Company / NCML”)(Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of International Business Companies Act, Saint Lucia.Your access to and use of this website is subject to these terms and conditions, our Terms and Conditions of Service(as applicable to your jurisdiction of residence), and any notices, disclaimers or other statements contained on this website(referred to collectively as “Terms”).By using this website, you agree to be subject to the Terms.',

          [
            {
              heading: '1. Preamble',
              body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company / NCML”) (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of International Business Companies Act, Saint Lucia. Your access to and use of this website is subject to these terms and conditions, our Terms and Conditions of Service, as applicable to your jurisdiction of residence, and any notices, disclaimers or other statements contained on this website, collectively referred to as the “Terms”. By using this website, you agree to be subject to the Terms.',
            },

            {
              heading: '2. Accuracy of Information',
              body: 'Although the content of this website is based on information that we consider to be reliable and we endeavour to keep current, we do not warrant that any information on this website is current or accurate as of the date and time of its availability. To the extent permitted by laws, we do not accept any responsibility arising in any way from errors in, or omissions from, the information on this website. The products and services described on this website may vary from time to time and may not always be available or may be restricted.',
            },

            {
              heading: '3. Visitors to This Website',
              body: 'The information on this website is not intended for distribution to, or use by, any person in any country or jurisdiction where its distribution or use would be contrary to local laws or regulations. Visitors to this website are responsible for ascertaining the terms of and complying with any local laws or regulations that they are subject to. Strictly, you must be over eighteen (18) years of age to use our services.',
            },

            {
              heading: '4. General Information Only',
              body: 'The information on this website is general in nature and does not take into account your personal investment objectives, financial situation or means. It does not constitute a recommendation that you enter into a particular transaction, nor is it a representation that any product described on this website is suitable or appropriate for you.',
            },

            {
              heading: '5. No Financial or Professional Advice',
              body: 'The Company is not a financial advisor. None of the material contained on this website should be construed as business, financial, investment, hedging, trading, legal, regulatory, tax, or accounting advice. Nor should you use the content of this website as the primary basis for any investment decisions that you wish to engage into. We encourage you to seek independent advice before deciding whether to acquire our services. You should also ensure that you read and understand our legal documents before deciding whether to use our services.',
            },

            {
              heading: '6. Copyright and Trademark',
              body: 'Except where it is necessary for you to view this website on your browser, or as permitted under the applicable laws or the Terms, none of the information or content on this website may be reproduced, adapted, uploaded to a third party, distributed or transmitted in any form or by any process without the Company’s written consent.',
            },

            {
              heading: '7. Trademarks and Third-Party Brand References',
              body: 'Newera Capital Markets Limited and the NCML logo are registered trademarks of the Company. Apple, the Apple logo, Mac, iPhone, iPad and iPod touch are trademarks of Apple Inc., registered in the United States and other countries. App Store is a service mark of Apple Inc. Android is a trademark of Google Inc., while Windows is a registered trademark of Microsoft Corporation in the United States and other countries.',
            },

            {
              heading: '8. Third-Party Content',
              body: 'From time to time, this website may contain links to other websites or resources provided by third parties. We provide third-party links and resources solely for your information and convenience. We do not make any representations or warranties about the content, suitability or appropriateness of the content or products contained in any third-party websites or resources.',
            },

            {
              heading: '9. Disclaimer and Limitation of Liability',
              body: 'To the maximum extent permitted by laws, we will not be liable in any way for loss or damage suffered by you through use of or access to this website, or our failure to provide this website.',
            },

            {
              heading: '10. Review of Website Terms & Conditions',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly, at least every six months, for effectiveness and updated.',
            },

            {
              heading: '11. Management Support and Availability',
              body: 'This Website Terms & Conditions is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },

      ar: {
        title: 'شروط وأحكام الموقع الإلكتروني',
        slug: 'website-terms',

        body: legalBody(
          'تأسست شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / NCML") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، المادة 6 من قانون الشركات الدولية في سانت لوسيا. يخضع وصولك إلى هذا الموقع واستخدامه لهذه الشروط والأحكام، وشروط وأحكام الخدمة المطبقة وفقاً لولاية إقامتك، وأي إشعارات أو إخلاءات مسؤولية أو بيانات أخرى واردة على هذا الموقع، ويُشار إليها مجتمعة باسم "الشروط". باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط.',

          [
            {
              heading: '1. المقدمة',
              body: 'تأسست شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / NCML") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، المادة 6 من قانون الشركات الدولية في سانت لوسيا. يخضع وصولك إلى هذا الموقع واستخدامه لهذه الشروط والأحكام، وشروط وأحكام الخدمة، حسبما ينطبق على ولاية إقامتك، وأي إشعارات أو إخلاءات مسؤولية أو بيانات أخرى واردة على هذا الموقع، ويُشار إليها مجتمعة باسم "الشروط". باستخدام هذا الموقع، فإنك توافق على الالتزام بهذه الشروط.',
            },

            {
              heading: '2. دقة المعلومات',
              body: 'على الرغم من أن محتوى هذا الموقع يستند إلى معلومات نعتبرها موثوقة ونسعى إلى إبقائها محدثة، فإننا لا نضمن أن أي معلومات موجودة على هذا الموقع تكون محدثة أو دقيقة في تاريخ ووقت توفرها. وإلى الحد الذي يسمح به القانون، لا نتحمل أي مسؤولية تنشأ بأي شكل من الأشكال عن الأخطاء أو السهو في المعلومات الموجودة على هذا الموقع. قد تختلف المنتجات والخدمات الموضحة على هذا الموقع من وقت لآخر، وقد لا تكون متاحة دائماً أو قد تكون خاضعة لقيود.',
            },

            {
              heading: '3. زوار هذا الموقع',
              body: 'المعلومات الموجودة على هذا الموقع ليست مخصصة للتوزيع أو الاستخدام من قبل أي شخص في أي دولة أو ولاية قضائية يكون فيها توزيع هذه المعلومات أو استخدامها مخالفاً للقوانين أو اللوائح المحلية. يتحمل زوار هذا الموقع مسؤولية التحقق من القوانين واللوائح المحلية التي يخضعون لها والامتثال لها. يجب أن يكون عمرك أكثر من ثمانية عشر (18) عاماً بشكل صارم لاستخدام خدماتنا.',
            },

            {
              heading: '4. المعلومات العامة فقط',
              body: 'المعلومات الموجودة على هذا الموقع عامة بطبيعتها ولا تأخذ في الاعتبار أهدافك الاستثمارية الشخصية أو وضعك المالي أو إمكانياتك المالية. كما أنها لا تشكل توصية بالدخول في معاملة معينة، ولا تمثل تأكيداً بأن أي منتج موصوف على هذا الموقع مناسب أو ملائم لك.',
            },

            {
              heading: '5. عدم تقديم المشورة المالية أو المهنية',
              body: 'الشركة ليست مستشاراً مالياً. لا ينبغي تفسير أي من المواد الموجودة على هذا الموقع على أنها مشورة تجارية أو مالية أو استثمارية أو للتحوط أو التداول أو قانونية أو تنظيمية أو ضريبية أو محاسبية. كما لا ينبغي استخدام محتوى هذا الموقع كأساس رئيسي لأي قرارات استثمارية ترغب في اتخاذها. نشجعك على طلب مشورة مستقلة قبل اتخاذ قرار بشأن الحصول على خدماتنا. كما يرجى التأكد من قراءة وفهم مستنداتنا القانونية قبل اتخاذ قرار باستخدام خدماتنا.',
            },

            {
              heading: '6. حقوق الطبع والنشر والعلامات التجارية',
              body: 'باستثناء ما هو ضروري لعرض هذا الموقع على متصفحك، أو ما تسمح به القوانين المعمول بها أو الشروط، لا يجوز إعادة إنتاج أي من المعلومات أو المحتوى الموجود على هذا الموقع أو تكييفه أو تحميله إلى طرف ثالث أو توزيعه أو نقله بأي شكل أو من خلال أي عملية دون الحصول على موافقة خطية من الشركة.',
            },

            {
              heading: '7. العلامات التجارية والإشارات إلى علامات تجارية تابعة لأطراف ثالثة',
              body: 'تعد Newera Capital Markets Limited وشعار NCML علامات تجارية مسجلة للشركة. Apple وشعار Apple وMac وiPhone وiPad وiPod touch هي علامات تجارية لشركة Apple Inc. ومسجلة في الولايات المتحدة ودول أخرى. App Store هي علامة خدمة لشركة Apple Inc. Android هي علامة تجارية لشركة Google Inc.، بينما Windows هي علامة تجارية مسجلة لشركة Microsoft Corporation في الولايات المتحدة ودول أخرى.',
            },

            {
              heading: '8. محتوى الأطراف الثالثة',
              body: 'قد يحتوي هذا الموقع من وقت لآخر على روابط لمواقع إلكترونية أو موارد أخرى مقدمة من أطراف ثالثة. نقدم روابط وموارد الأطراف الثالثة فقط لأغراض المعلومات والراحة. ولا نقدم أي إقرارات أو ضمانات بشأن محتوى أو ملاءمة أو مناسبة المحتوى أو المنتجات الموجودة في أي مواقع أو موارد تابعة لأطراف ثالثة.',
            },

            {
              heading: '9. إخلاء المسؤولية وحدود المسؤولية',
              body: 'إلى أقصى حد يسمح به القانون، لن نكون مسؤولين بأي شكل من الأشكال عن أي خسارة أو ضرر تتعرض له نتيجة استخدام هذا الموقع أو الوصول إليه، أو نتيجة عدم قدرتنا على توفير هذا الموقع.',
            },

            {
              heading: '10. مراجعة شروط وأحكام الموقع',
              body: 'تلتزم NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، وعلى الأقل كل ستة أشهر، للتأكد من فعاليتها وتحديثها عند الضرورة.',
            },

            {
              heading: '11. دعم الإدارة وإتاحة السياسة',
              body: 'تحظى شروط وأحكام الموقع هذه بدعم الإدارة. وتلتزم NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في مقر أعمالها والتعريف بها لدى العملاء.',
            },
          ],
        ),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 7. Anti-Fraud & Financial Crime Policy (from Anti-Fraud-and-Financial-Crime-Policy.pdf)
    {
      pageType: 'anti-fraud-policy',

      en: {
        title: 'Anti-Fraud & Financial Crime Policy',
        slug: 'anti-fraud-policy',

        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED (“the Company”) is committed to the highest possible standards for openness, transparency and accountability in all of its affairs. We wish to promote a culture of honesty and opposition to fraud (and financial crime) in any form. The purpose of this policy is to provide a clear definition of what we mean by “Fraud”; a definitive statement to employees forbidding fraudulent activity in all its forms; a summary to staff regarding their responsibilities for identifying exposure to fraudulent activity and/or detecting such fraudulent activity when it occurs; guidance to employees as to action which should be taken where they suspect any fraudulent activity; clear guidance as to responsibilities for conducting investigations into fraud related activities; and protection to employees in circumstances where they may be victimized as a consequence of reporting, or being a witness to, fraudulent activities.',

          [
            {
              heading: '1. Policy Objective',
              body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company”) is committed to the highest possible standards for openness, transparency and accountability in all of its affairs. The Company promotes a culture of honesty and opposition to fraud and financial crime in any form. This policy establishes a clear definition of fraud, prohibits fraudulent activity, outlines employee responsibilities for identifying and detecting fraudulent activity, provides guidance on reporting suspected fraud, establishes responsibilities for fraud investigations, and provides protection to employees who report or witness fraudulent activities.',
            },

            {
              heading: '2. What Is Fraud',
              body: 'Fraud involves an act of intentional deceit to secure, by the act or omission of another person, an unfair or unlawful gain for oneself or another, or a loss to another. Acts such as deception, bribery, forgery, extortion, corruption, conspiracy, embezzlement, misappropriation and collusion may or may not constitute fraud, but are also included within the scope of this policy.',
            },

            {
              heading: '3. Main Types of Fraud',
              body: 'The main types of fraud include Theft, which may involve the removal or misuse of funds, assets or cash; and False Accounting, which includes dishonestly destroying, defacing, concealing or falsifying any account, record or document required for any accounting purpose for personal gain or the gain of another, or with the intent to cause loss to the Company, or furnishing information which is or may be misleading, false or deceptive.',
            },

            {
              heading: '4. Examples of Fraud',
              body: 'Examples of fraud include false accounting, including deliberate misstatement of financial information for personal and/or financial gain; theft including trade secrets, intellectual property, equipment and other Company assets; using false payment instructions, invoices or cheques in order to receive a payment to one’s own account or to a third-party account in exchange for a benefit; falsification of payroll records; unsubstantiated expense claims; accepting or providing bribes or kickbacks in exchange for business whether or not for the Company’s benefit; acts by intermediaries knowingly committed with the intent to obtain a benefit through deceit; forgery or intentionally presenting false information on an application or in connection with renewal, reinstatement, claims or refunds; manipulation of customer information in order to unlawfully obtain customer funds; fraudulent representations in sales and marketing activities; embezzlement or theft of Company or client assets; and any other act which Management or the Board of Directors determines to be inappropriate, dishonest and contrary to the Company’s regulations and/or laws imposed by the Competent Authorities.',
            },

            {
              heading: '5. Responsibilities of Employees',
              body: 'It is the responsibility of all employees to carry out their work in such a way as to prevent fraud or financial crime from occurring in the workplace. Employees must remain alert to occurrences of fraud, be aware that unusual transactions or behaviours could indicate fraud, and report potential cases of fraud. Employees must stay alert to signs of fraud and report any suspicion of fraud immediately, regardless of value, to the Senior Manager, Manager or Compliance Officer, or anonymously via the Company’s website. The Board of Directors must immediately be notified if the alleged fraud involves manipulation, omissions or misrepresentation of financial reports or results.',
            },

            {
              heading: '6. Employee Reporting Obligations and Controls',
              body: 'If a subordinate reports suspected fraud, the matter must in turn be reported to the Board of Directors and/or Compliance Officer. Employees must not alert the suspected individual or other unauthorized persons in an effort to determine facts or suspicion. All cases of suspected fraud must be handled with utmost care and confidentiality. Employees must attend relevant training programs provided by the Company to understand their obligations and work in accordance with the Company’s Operating Principles. Line Functions are required to establish and maintain sufficient controls to ensure that fraud risk is properly monitored and mitigated, and all employees must adhere to relevant procedures in their areas of responsibility.',
            },

            {
              heading: '7. Cooperation with Fraud Investigations',
              body: 'Employees are required to cooperate fully in investigations into suspected fraud or financial crime and must not willfully or knowingly state anything which they believe to be false or which they do not believe to be true. Employees must provide relevant information and assistance as required while maintaining the confidentiality of the investigation.',
            },

            {
              heading: '8. Dealing with Reports of Suspected Fraud or Financial Crime',
              body: 'The Company is committed to fraud control with an emphasis on proactive prevention and the implementation of detection measures designed to reduce possibilities which could lead to fraud. The Company maintains a zero-tolerance approach to fraud. When fraud is detected, suspected or alleged, the Company is committed to fully investigating the matter. The Company will work closely with relevant authorities to ensure that justice is served and will implement relevant measures to recover losses and minimize further loss.',
            },

            {
              heading: '9. Confidentiality',
              body: 'The Company treats all information received pertaining to fraud and financial crime as strictly confidential. Any employee who suspects dishonest or fraudulent activity must notify the Board of Directors and should not attempt to personally conduct investigations or interviews or interrogations relating to any suspected fraudulent act. Investigations must be handled by the persons authorized by the Company, with appropriate confidentiality maintained throughout the process.',
            },

            {
              heading: '10. Actions Arising from Fraud Investigations',
              body: 'Persons who are found to be guilty of fraud and/or any other financial crime will be dealt with in accordance with the Company’s fraud policy. A proven allegation of fraud may result in dismissal and any other action in accordance with applicable laws and regulations.',
            },

            {
              heading: '11. Protection of Employees Reporting Fraud',
              body: 'The Company recognizes the importance of employees being able to report suspected fraudulent activities or act as witnesses without fear of victimization. The policy therefore provides protection to employees in circumstances where they may be victimized as a consequence of reporting or being a witness to fraudulent activities, subject to applicable Company procedures and laws.',
            },

            {
              heading: '12. Review of Anti-Fraud and Financial Crime Policy',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly, at least every six months, for effectiveness and updated where necessary.',
            },

            {
              heading: '13. Management Support and Employee Awareness',
              body: 'This Anti-Fraud (and Financial Crime) Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },

      ar: {
        title: 'سياسة مكافحة الاحتيال والجرائم المالية',
        slug: 'anti-fraud-policy',

        body: legalBody(
          'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بأعلى معايير الانفتاح والشفافية والمساءلة في جميع أعمالها، وتسعى إلى تعزيز ثقافة النزاهة ومناهضة الاحتيال والجرائم المالية بكافة أشكالها. تهدف هذه السياسة إلى تقديم تعريف واضح لمفهوم الاحتيال، وحظر جميع أشكال الأنشطة الاحتيالية، وتوضيح مسؤوليات الموظفين في تحديد مخاطر الاحتيال والكشف عنها، وتقديم الإرشادات المتعلقة بالإبلاغ عن الأنشطة الاحتيالية المشتبه بها، وتحديد المسؤوليات المتعلقة بإجراء التحقيقات، وحماية الموظفين الذين يقومون بالإبلاغ عن الأنشطة الاحتيالية أو يشهدون عليها.',

          [
            {
              heading: '1. هدف السياسة',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بأعلى معايير الانفتاح والشفافية والمساءلة في جميع أعمالها، وتسعى إلى تعزيز ثقافة النزاهة ومناهضة الاحتيال والجرائم المالية بكافة أشكالها. تحدد هذه السياسة مفهوم الاحتيال بوضوح، وتحظر الأنشطة الاحتيالية، وتوضح مسؤوليات الموظفين في تحديد وكشف الاحتيال، وتوفر إرشادات بشأن الإبلاغ عن حالات الاحتيال المشتبه بها، وتحدد المسؤوليات المتعلقة بالتحقيقات، وتوفر الحماية للموظفين الذين يبلغون عن الأنشطة الاحتيالية أو يشهدون عليها.',
            },

            {
              heading: '2. ما هو الاحتيال',
              body: 'يشمل الاحتيال أي فعل من أفعال الخداع المتعمد بهدف الحصول، من خلال فعل أو امتناع شخص آخر، على مكسب غير عادل أو غير مشروع للنفس أو للغير، أو التسبب في خسارة لشخص آخر. وتشمل نطاق هذه السياسة أيضاً أعمال الخداع والرشوة والتزوير والابتزاز والفساد والتآمر والاختلاس والاستيلاء غير المشروع والتواطؤ، سواء شكلت هذه الأفعال احتيالاً بالمعنى المباشر أم لا.',
            },

            {
              heading: '3. الأنواع الرئيسية للاحتيال',
              body: 'تشمل الأنواع الرئيسية للاحتيال السرقة، والتي قد تتضمن إزالة أو إساءة استخدام الأموال أو الأصول أو النقد؛ والمحاسبة الزائفة، والتي تشمل إتلاف أو تشويه أو إخفاء أو تزوير أي حساب أو سجل أو مستند مطلوب لأغراض محاسبية بصورة غير نزيهة لتحقيق مكاسب شخصية أو مكاسب للغير، أو بقصد التسبب في خسارة للشركة، أو تقديم معلومات قد تكون مضللة أو كاذبة أو خادعة.',
            },

            {
              heading: '4. أمثلة على الاحتيال',
              body: 'تشمل أمثلة الاحتيال المحاسبة الزائفة، بما في ذلك التلاعب المتعمد بالمعلومات المالية لتحقيق مكاسب شخصية و/أو مالية؛ وسرقة الأسرار التجارية والملكية الفكرية والمعدات وغيرها من أصول الشركة؛ واستخدام تعليمات دفع أو فواتير أو شيكات مزيفة للحصول على دفعة إلى الحساب الشخصي أو حساب طرف ثالث مقابل منفعة؛ وتزوير سجلات الرواتب؛ والمطالبات غير المدعومة بالمصروفات؛ وقبول أو تقديم الرشاوى أو العمولات غير المشروعة مقابل الأعمال؛ والأفعال التي يرتكبها الوسطاء بقصد الحصول على منفعة من خلال الخداع؛ والتزوير أو تقديم معلومات كاذبة عمداً في الطلبات أو في عمليات التجديد أو إعادة التفعيل أو المطالبات أو استرداد الأموال؛ والتلاعب بمعلومات العملاء للحصول بصورة غير مشروعة على أموال العملاء؛ والتصريحات الاحتيالية في أنشطة المبيعات والتسويق؛ واختلاس أو سرقة أصول الشركة أو العملاء؛ وأي أفعال أخرى تعتبرها الإدارة أو مجلس الإدارة غير مناسبة أو غير نزيهة أو مخالفة لأنظمة الشركة و/أو القوانين المفروضة من قبل الجهات المختصة.',
            },

            {
              heading: '5. مسؤوليات الموظفين',
              body: 'تقع على عاتق جميع الموظفين مسؤولية أداء أعمالهم بطريقة تمنع حدوث الاحتيال أو الجرائم المالية في مكان العمل. ويجب على الموظفين الانتباه إلى حالات الاحتيال المحتملة، وإدراك أن المعاملات أو السلوكيات غير المعتادة قد تكون مؤشراً على الاحتيال، والإبلاغ عن الحالات المحتملة. يجب على الموظفين البقاء يقظين تجاه علامات الاحتيال والإبلاغ فوراً عن أي اشتباه، بغض النظر عن قيمة المعاملة، إلى المدير الأعلى أو المدير أو ضابط الامتثال، أو بشكل مجهول عبر موقع الشركة. ويجب إخطار مجلس الإدارة فوراً إذا كان الاحتيال المزعوم يتضمن تلاعباً أو حذفاً أو تحريفاً في التقارير أو النتائج المالية.',
            },

            {
              heading: '6. التزامات الموظفين بالإبلاغ والضوابط',
              body: 'إذا أبلغ أحد المرؤوسين عن احتيال مشتبه به، فيجب بدوره رفع الأمر إلى مجلس الإدارة و/أو ضابط الامتثال. يجب عدم تنبيه الشخص المشتبه به أو أي أشخاص غير مخولين أثناء محاولة تحديد الحقائق أو التحقق من الشبهة. يجب التعامل مع جميع حالات الاحتيال المشتبه بها بأقصى درجات العناية والسرية. كما يجب على الموظفين حضور برامج التدريب ذات الصلة التي تقدمها الشركة لفهم التزاماتهم والعمل وفقاً لمبادئ التشغيل المعتمدة لدى الشركة. ويتعين على الوظائف التشغيلية إنشاء والحفاظ على ضوابط كافية لضمان مراقبة مخاطر الاحتيال والتخفيف منها بصورة مناسبة، وعلى جميع الموظفين الالتزام بالإجراءات ذات الصلة في مجالات مسؤولياتهم.',
            },

            {
              heading: '7. التعاون في تحقيقات الاحتيال',
              body: 'يتعين على الموظفين التعاون الكامل في التحقيقات المتعلقة بالاحتيال أو الجرائم المالية المشتبه بها، وألا يقدموا عمداً أو عن علم أي معلومات يعتقدون أنها كاذبة أو لا يعتقدون أنها صحيحة. ويجب تقديم المعلومات والمساعدة ذات الصلة عند الطلب مع الحفاظ على سرية التحقيق.',
            },

            {
              heading: '8. التعامل مع بلاغات الاحتيال أو الجرائم المالية المشتبه بها',
              body: 'تلتزم الشركة بمكافحة الاحتيال مع التركيز على الوقاية الاستباقية ووضع إجراءات للكشف تهدف إلى تقليل الاحتمالات التي قد تؤدي إلى الاحتيال. وتتبع الشركة سياسة عدم التسامح مطلقاً مع الاحتيال. وعند اكتشاف أو الاشتباه أو الادعاء بوجود احتيال، تلتزم الشركة بإجراء تحقيق كامل في الأمر. كما ستعمل الشركة بشكل وثيق مع الجهات المختصة لضمان تحقيق العدالة، وتنفيذ التدابير المناسبة لاسترداد الخسائر وتقليل أي خسائر إضافية.',
            },

            {
              heading: '9. السرية',
              body: 'تتعامل الشركة مع جميع المعلومات المتعلقة بالاحتيال والجرائم المالية بسرية تامة. ويجب على أي موظف يشتبه في وجود نشاط غير نزيه أو احتيالي إخطار مجلس الإدارة، ولا يجوز له محاولة إجراء تحقيقات أو مقابلات أو استجوابات شخصية تتعلق بأي فعل احتيالي مشتبه به. ويجب أن تتم التحقيقات من قبل الأشخاص المخولين من الشركة مع الحفاظ على السرية المناسبة طوال العملية.',
            },

            {
              heading: '10. الإجراءات الناتجة عن تحقيقات الاحتيال',
              body: 'يتم التعامل مع الأشخاص الذين تثبت إدانتهم بالاحتيال و/أو أي جريمة مالية أخرى وفقاً لسياسة الشركة الخاصة بالاحتيال. وقد يؤدي ثبوت ادعاء الاحتيال إلى الفصل من العمل واتخاذ أي إجراءات أخرى وفقاً للقوانين واللوائح المعمول بها.',
            },

            {
              heading: '11. حماية الموظفين الذين يبلغون عن الاحتيال',
              body: 'تقر الشركة بأهمية تمكين الموظفين من الإبلاغ عن الأنشطة الاحتيالية المشتبه بها أو العمل كشهود دون خوف من التعرض للإيذاء أو الانتقام. ولذلك توفر هذه السياسة الحماية للموظفين في الظروف التي قد يتعرضون فيها للإيذاء نتيجة الإبلاغ عن الأنشطة الاحتيالية أو الشهادة عليها، مع مراعاة إجراءات الشركة والقوانين المعمول بها.',
            },

            {
              heading: '12. مراجعة سياسة مكافحة الاحتيال والجرائم المالية',
              body: 'تلتزم NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، وعلى الأقل كل ستة أشهر، للتأكد من فعاليتها وتحديثها عند الضرورة.',
            },

            {
              heading: '13. دعم الإدارة وتوعية الموظفين',
              body: 'تحظى سياسة مكافحة الاحتيال والجرائم المالية هذه بدعم الإدارة. وتلتزم NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في مقر أعمالها والتعريف بها لدى العملاء.',
            },
          ],
        ),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 8. Conflicts of Interests Policy (from Conflicts-of-Interests-Policy.pdf)
    {
      pageType: 'conflicts-of-interest',
      en: {
        title: 'Conflicts of Interests Policy',
        slug: 'conflicts-of-interest',
        body: legalBody(
          'This Conflicts of Interests Policy (“the Policy”) is issued in accordance with the applicable Saint Lucia legislations including (but not limited to) International Business Companies Act and others, to which Newera Capital Markets Limited (“the Company”) is required to take all reasonable steps to detect and avoid conflicts of interest within the Company’s organization & operation. The Company is committed to act honestly, fairly and professionally and in the best interests of its Clients and to comply, in particular, with the principles set out in the above and other relevant legislations when providing services of Money Broking business. The purpose of this Policy is to set out the Company’s approach in identifying and managing conflicts of interest which may arise during the course of its normal business activities. In addition, this Policy identifies circumstances which may give rise to a conflict of interest. It is applied to all its directors, employees, any persons directly or indirectly linked to the Company (hereinafter called “Related Persons”) and refers to all interactions with all Clients.',
          [
            {
              heading: '1. Criteria of Identifying Conflicts of Interest',
              body: 'When the Company deals with or on behalf of the Client, the Company, an associate or some other person connected with the Company, may have an interest, relationship or arrangement that is material in relation to the transaction concerned or that conflicts with the Client’s interest. The Company identifies and discloses a range of situations and circumstances which may give rise to a conflict of interest and potentially, but not necessarily, be detrimental to the interests of one or more Clients. For the purpose of identifying the types of conflicts of interest that may arise in the course of providing investment services whose existence may damage the interest of a Client, the Company will take into account whether the Company or a relevant person: (i) is likely to make a financial gain, or avoid a financial loss, at the expense of the Clients; (ii) has an interest in the outcome of a service provided to the Clients or of a transaction carried out on behalf of the Client, which is distinct from the Client’s interest in that outcome; (iii) has a financial or other incentive to favor the interest of another Client or group of Clients over the interests of the Clients; (iv) carries on the same business as the Clients; or (v) receives or will receive from a person other than the Client an inducement in relation to a service provided to the Client, in the form of monies, goods or services, other than the standard commission or fee for that service.',
            },
            {
              heading: '2. Identification of Conflicts of Interest',
              body: 'While it is not feasible to define precisely or create an exhaustive list of all relevant conflicts of interest that may arise, having regard to the current nature, scale and complexity of the Company’s business, the following circumstances constitute or may give rise to a conflict of interest entailing a material risk of damage to the interests of one or more Clients as a result of Services: (i) the Company may be advising and providing other services to associates or other Clients of the Company who may have interests in Financial Instruments or Underlying Assets which are in conflict or in competition with the Clients’ interests; (ii) the Company may have an interest in maximizing trading volumes in order to increase its commission revenue, which is inconsistent with the Client’s personal objective of minimizing transaction costs; (iii) the Company may receive commissions and/or other inducements from its Liquidity Provider for the transmission of Clients’ Orders; (iv) the Company’s employee bonus scheme may award its employees based on the financial results of the Company which are linked or associated with the trading volume generated by Clients; (v) the Company or a Related Person has an interest in the outcome of a service provided to the Client or of a transaction carried out on behalf of the Client, which is distinct from the Client’s interest in that outcome; (vi) the Company or a Related Person has a financial or other incentive to favor the interest of another Client or group of Clients over the interests of the Client; (vii) the Company or a Related Person carries on the same business as the Client; (viii) the Company may have relationships with many third-party product providers or financial institutions who may remunerate the Company via inducements, commissions or fees and the Company may favor one over another in the recommendation process if higher inducements, commissions or fees are provided; and (ix) the Company may compensate providers of strategies which are copied by other Clients, based on the number of subscribers they have.',
            },
            {
              heading: '3. Procedures and Controls for Managing Conflicts of Interest',
              body: 'In general, the procedures and controls that the Company follows to manage the identified conflicts of interest include, but are not limited to, the following measures: (i) ongoing monitoring of business activities to ensure that internal controls are appropriate; (ii) effective procedures to prevent or control the exchange of information between Related Persons engaged in activities involving a risk of a conflict of interest where the exchange of that information may harm the interests of one or more Clients; (iii) separate supervision of Related Persons whose principal functions involve providing services to Clients whose interests may conflict, or who otherwise represent different interests that may conflict, including those of the Company; (iv) measures to prevent or limit any person from exercising inappropriate influence over the way in which the Related Person carries out investment services; (v) measures to prevent or control the simultaneous or sequential involvement of a Related Person in separate investment services where such involvement may impair the proper management of conflicts of interest; (vi) a policy designed to limit conflicts of interest arising from the giving and receiving of inducements; (vii) Chinese walls restricting the flow of confidential and inside information within the Company, and physical separation of departments; (viii) procedures governing access to electronic data; (ix) segregation of duties that may give rise to conflicts of interest if carried on by the same individual; (x) personal account dealing requirements applicable to Related Persons in relation to their own investments; (xi) establishment of a Compliance Department to monitor and report on the above to the Company’s Board of Directors; (xii) prohibition on officers and employees of the Company having external business interests conflicting with the interests of the Company without the prior approval of the Company’s Board of Directors; (xiii) a “need-to-know” policy governing the dissemination of confidential or inside information within the Company; (xiv) appointment of an Internal Auditor to ensure that appropriate systems and controls are maintained and to report to the Company’s Board of Directors; and (xv) establishment of the “four-eyes” principle in supervising the Company’s activities.',
            },
            {
              heading: '4. Client’s Consent',
              body: 'By entering into a Client Agreement with the Company for the provision of Services, the Client consents to the application of this Policy. Further, the Client consents to and authorizes the Company to deal with the Client in any manner which the Company considers appropriate, notwithstanding any conflict of interest or the existence of any material interest in a Transaction, without prior reference to the Client. In the event that the Company is unable to deal with a conflict-of-interest situation, it shall revert to the Client.',
            },
            {
              heading: '5. Disclosure of Information',
              body: 'If during the course of a business relationship with a Client or group of Clients, the organizational or administrative arrangements or measures in place are not sufficient to avoid or manage a conflict of interest relating to that Client or group of Clients, the Company will disclose the conflict of interest before undertaking further business with the Client or group of Clients.',
            },
            {
              heading: '6. Languages',
              body: 'The language of communication between the Company and the Client shall be English. All binding contractual documentation is available in English. Upon its sole discretion, the Company may communicate with the Client in a language other than English; however, in case of any discrepancy between the meanings of any communications and/or meanings, or any other communications forming part of this Policy or any other agreements, information or communication in any other language, the meaning of the English Language version shall prevail. The Company or third parties may have provided the Clients with translations of this Policy. The original English versions shall be the only legally binding version. In case of discrepancies between the English version and other translations in the Client’s possession, the original English version provided by the Company on the website shall prevail.',
            },
            {
              heading: '7. Review of Conflicts of Interests Policy',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this Policy and it will be reviewed regularly, at least every six months, for effectiveness and updated. This Conflicts of Interests Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this Policy to all employees and displaying it in its business with Clients.',
            },
          ],
        ),
      },

      ar: {
        title: 'سياسة تضارب المصالح',
        body: legalBody(
          'تم إصدار سياسة تضارب المصالح هذه ("السياسة") وفقاً للتشريعات المعمول بها في سانت لوسيا، بما في ذلك، على سبيل المثال لا الحصر، قانون الشركات التجارية الدولية وغيره من التشريعات ذات الصلة، والتي تلزم شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") باتخاذ جميع الخطوات المعقولة لاكتشاف وتجنب تضارب المصالح داخل تنظيم وعمليات الشركة. تلتزم الشركة بالتصرف بنزاهة وعدالة ومهنية وبما يخدم المصالح الفضلى لعملائها، والامتثال، على وجه الخصوص، للمبادئ المنصوص عليها في التشريعات المذكورة وغيرها من التشريعات ذات الصلة عند تقديم خدمات الوساطة المالية. تهدف هذه السياسة إلى تحديد نهج الشركة في التعرف على حالات تضارب المصالح التي قد تنشأ أثناء ممارسة أنشطتها التجارية المعتادة وإدارتها. كما تحدد هذه السياسة الظروف التي قد تؤدي إلى نشوء تضارب في المصالح. وتنطبق على جميع أعضاء مجلس الإدارة والموظفين وجميع الأشخاص المرتبطين بالشركة بشكل مباشر أو غير مباشر (ويشار إليهم فيما بعد باسم "الأشخاص المرتبطين")، كما تنطبق على جميع التعاملات مع كافة العملاء.',
          [
            {
              heading: '1. معايير تحديد تضارب المصالح',
              body: 'عندما تتعامل الشركة مع العميل أو نيابة عنه، قد تكون للشركة أو لأحد شركائها أو لأي شخص آخر مرتبط بها مصلحة أو علاقة أو ترتيب جوهري يتعلق بالمعاملة المعنية أو يتعارض مع مصلحة العميل. وتحدد الشركة وتفصح عن مجموعة من الحالات والظروف التي قد تؤدي إلى تضارب المصالح والتي قد تكون، ولكن ليس بالضرورة، ضارة بمصالح عميل واحد أو أكثر. ولأغراض تحديد أنواع تضارب المصالح التي قد تنشأ أثناء تقديم خدمات الاستثمار والتي قد يؤدي وجودها إلى الإضرار بمصلحة العميل، تأخذ الشركة في الاعتبار ما إذا كانت الشركة أو أي شخص ذي صلة: (1) من المحتمل أن يحقق مكسباً مالياً أو يتجنب خسارة مالية على حساب العملاء؛ (2) لديه مصلحة في نتيجة خدمة مقدمة للعملاء أو معاملة منفذة نيابة عن العميل تختلف عن مصلحة العميل في تلك النتيجة؛ (3) لديه حافز مالي أو غيره لتفضيل مصلحة عميل آخر أو مجموعة من العملاء على مصالح العميل؛ (4) يمارس نفس النشاط التجاري الذي يمارسه العملاء؛ أو (5) يتلقى أو سيحصل من شخص آخر غير العميل على حافز يتعلق بخدمة مقدمة للعميل، سواء في شكل أموال أو سلع أو خدمات، بخلاف العمولة أو الرسوم المعتادة لتلك الخدمة.',
            },
            {
              heading: '2. تحديد حالات تضارب المصالح',
              body: 'مع أنه لا يمكن تحديد أو إنشاء قائمة شاملة ودقيقة بجميع حالات تضارب المصالح ذات الصلة التي قد تنشأ، بالنظر إلى طبيعة وحجم وتعقيد أعمال الشركة الحالية، فإن الظروف التالية تشكل أو قد تؤدي إلى تضارب في المصالح ينطوي على مخاطر جوهرية للإضرار بمصالح عميل واحد أو أكثر نتيجة للخدمات: (1) قد تقدم الشركة المشورة أو خدمات أخرى إلى الشركات التابعة أو العملاء الآخرين الذين قد تكون لديهم مصالح في الأدوات المالية أو الأصول الأساسية التي تتعارض أو تتنافس مع مصالح العملاء؛ (2) قد تكون للشركة مصلحة في زيادة أحجام التداول بهدف زيادة إيرادات العمولات الخاصة بها، وهو ما قد يتعارض مع هدف العميل الشخصي المتمثل في تقليل تكاليف المعاملات؛ (3) قد تتلقى الشركة عمولات و/أو حوافز أخرى من مزود السيولة الخاص بها مقابل نقل أوامر العملاء؛ (4) قد يمنح نظام المكافآت الخاص بموظفي الشركة مكافآت بناءً على النتائج المالية للشركة المرتبطة أو المتصلة بحجم التداول الذي يولده العملاء؛ (5) قد تكون للشركة أو لشخص مرتبط بها مصلحة في نتيجة خدمة مقدمة للعميل أو معاملة منفذة نيابة عنه تختلف عن مصلحة العميل في تلك النتيجة؛ (6) قد تكون للشركة أو لشخص مرتبط بها حوافز مالية أو غيرها لتفضيل مصلحة عميل آخر أو مجموعة من العملاء على مصلحة العميل؛ (7) قد تمارس الشركة أو أي شخص مرتبط بها نفس النشاط التجاري الذي يمارسه العميل؛ (8) قد تكون للشركة علاقات مع العديد من مزودي المنتجات من الأطراف الثالثة أو المؤسسات المالية الذين قد يدفعون للشركة حوافز أو عمولات أو رسوماً، وقد تفضل الشركة أحدهم على الآخر في عملية التوصية إذا تم تقديم حوافز أو عمولات أو رسوم أعلى؛ و(9) قد تعوض الشركة مزودي الاستراتيجيات التي يتم نسخها من قبل عملاء آخرين بناءً على عدد المشتركين لديهم.',
            },
            {
              heading: '3. الإجراءات والضوابط لإدارة تضارب المصالح',
              body: 'بوجه عام، تشمل الإجراءات والضوابط التي تتبعها الشركة لإدارة حالات تضارب المصالح المحددة، على سبيل المثال لا الحصر، التدابير التالية: (1) المراقبة المستمرة للأنشطة التجارية للتأكد من ملاءمة الضوابط الداخلية؛ (2) تطبيق إجراءات فعالة لمنع أو التحكم في تبادل المعلومات بين الأشخاص المرتبطين المشاركين في أنشطة تنطوي على مخاطر تضارب المصالح، عندما يكون تبادل تلك المعلومات قد يضر بمصالح عميل واحد أو أكثر؛ (3) الإشراف المنفصل على الأشخاص المرتبطين الذين تتمثل وظائفهم الرئيسية في تقديم الخدمات للعملاء الذين قد تتعارض مصالحهم، أو الذين يمثلون مصالح مختلفة قد تتعارض، بما في ذلك مصالح الشركة؛ (4) اتخاذ تدابير لمنع أو الحد من أي شخص من ممارسة تأثير غير مناسب على الطريقة التي يؤدي بها الشخص المرتبط خدمات الاستثمار؛ (5) اتخاذ تدابير لمنع أو التحكم في المشاركة المتزامنة أو المتتابعة لشخص مرتبط في خدمات استثمارية منفصلة عندما قد تؤثر هذه المشاركة على الإدارة السليمة لتضارب المصالح؛ (6) تطبيق سياسة تهدف إلى الحد من تضارب المصالح الناشئ عن تقديم الحوافز وتلقيها؛ (7) إنشاء حواجز معلوماتية ("الجدران الصينية") لتقييد تدفق المعلومات السرية والمعلومات الداخلية داخل الشركة، مع الفصل المادي بين الأقسام؛ (8) وضع إجراءات تنظم الوصول إلى البيانات الإلكترونية؛ (9) فصل المهام التي قد تؤدي إلى تضارب المصالح إذا قام بها الشخص نفسه؛ (10) تطبيق متطلبات التعامل في الحسابات الشخصية على الأشخاص المرتبطين فيما يتعلق باستثماراتهم الخاصة؛ (11) إنشاء إدارة للامتثال لمراقبة ما سبق ورفع التقارير بشأنه إلى مجلس إدارة الشركة؛ (12) حظر قيام مسؤولي وموظفي الشركة بممارسة مصالح أو أنشطة تجارية خارجية تتعارض مع مصالح الشركة دون الحصول على موافقة مسبقة من مجلس إدارة الشركة؛ (13) تطبيق سياسة "الحاجة إلى المعرفة" التي تنظم نشر المعلومات السرية أو الداخلية داخل الشركة؛ (14) تعيين مدقق داخلي للتأكد من الحفاظ على الأنظمة والضوابط المناسبة ورفع التقارير إلى مجلس إدارة الشركة؛ و(15) تطبيق مبدأ "الأربع عيون" في الإشراف على أنشطة الشركة.',
            },
            {
              heading: '4. موافقة العميل',
              body: 'من خلال إبرام اتفاقية العميل مع الشركة لتقديم الخدمات، يوافق العميل على تطبيق هذه السياسة عليه. كما يوافق العميل ويفوض الشركة في التعامل معه بأي طريقة تراها الشركة مناسبة، بغض النظر عن وجود أي تضارب في المصالح أو وجود مصلحة جوهرية في أي معاملة، دون الرجوع مسبقاً إلى العميل. وفي حال عدم تمكن الشركة من معالجة حالة تضارب المصالح، فإنها ستعود إلى العميل وتبلغه بذلك.',
            },
            {
              heading: '5. الإفصاح عن المعلومات',
              body: 'إذا تبين خلال فترة العلاقة التجارية مع عميل أو مجموعة من العملاء أن الترتيبات التنظيمية أو الإدارية أو التدابير المعمول بها غير كافية لتجنب أو إدارة تضارب المصالح المتعلق بذلك العميل أو مجموعة العملاء، فسوف تقوم الشركة بالإفصاح عن تضارب المصالح قبل الدخول في أي أعمال إضافية مع العميل أو مجموعة العملاء.',
            },
            {
              heading: '6. اللغات',
              body: 'تكون لغة التواصل بين الشركة والعميل هي اللغة الإنجليزية. وجميع الوثائق التعاقدية الملزمة متاحة باللغة الإنجليزية. ويجوز للشركة، وفقاً لتقديرها الخاص، التواصل مع العميل بلغة أخرى غير الإنجليزية، إلا أنه في حال وجود أي اختلاف بين معاني أي مراسلات أو معاني أي اتصالات أخرى تشكل جزءاً من هذه السياسة أو أي اتفاقيات أو معلومات أو مراسلات أخرى بأي لغة أخرى، تكون النسخة الإنجليزية هي المرجع المعتمد. وقد توفر الشركة أو أطراف ثالثة للعميل ترجمات لهذه السياسة، إلا أن النسخ الأصلية باللغة الإنجليزية هي النسخ الوحيدة الملزمة قانوناً. وفي حال وجود أي تعارض بين النسخة الإنجليزية وأي ترجمات أخرى بحوزة العميل، تسود النسخة الإنجليزية الأصلية التي توفرها الشركة على موقعها الإلكتروني.',
            },
            {
              heading: '7. مراجعة سياسة تضارب المصالح',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، وبحد أدنى مرة كل ستة أشهر، للتأكد من فعاليتها وتحديثها عند الحاجة. وتحظى سياسة تضارب المصالح هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها ضمن أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 9. Customer Complaint Handling Policy (from Customer-Complaint-Handling-Policy.pdf)
    {
      pageType: 'complaint-handling',
      en: {
        title: 'Customer Complaint Handling Policy',
        slug: 'complaint-handling',
        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED values complaints received from its customers in order to improve and provide better customer services. This policy is intended to ensure that complaints and concerns are listened to and dealt with properly, and that all complaints or comments received from the Clients are taken seriously. NEWERA CAPITAL MARKETS LIMITED is committed to consistent, fair and confidential complaint handling and to resolving complaints as quickly as possible. NEWERA CAPITAL MARKETS LIMITED aims to make it easy for Clients to make a complaint if they are dissatisfied and will treat all Clients making complaints professionally.',
          [
            {
              heading: 'RECEIVING AND RECORDING COMPLAINTS',
              body:
                'An email account has been created as the Company’s complaint handling channel, to enable NEWERA CAPITAL MARKETS LIMITED to receive and respond to complaints from Clients. This feature ensures all complaints are directed to a specific email account, i.e. escalation@newera365.com, handled by the Complaint Handling Officers.\n\n' +
                'However, should staff continue to receive complaints sent directly to them, he/she will redirect the said email on the same day it was received to the designated complaint handling email account for further action by the Complaint Handling Officers.\n\n' +
                'Each email complaint received from a Client will be acknowledged by the Complaint Handling Officers as soon as the complaint email is received.\n\n' +
                'Details of all communication with the Client and any actions taken to resolve the complaint will be recorded and filed in NEWERA CAPITAL MARKETS LIMITED’s physical and cloud storage. These records can be made available for inspection by the Board of Directors.\n\n' +
                'Recorded complaints will also be monitored for any ongoing trends by management. This would enable the relevant efforts to be taken for resolving any ongoing issues.',
            },
            {
              heading: 'RESPONDING TO COMPLAINTS',
              body: 'Every Client making a complaint will be treated with courtesy. All communication with the complainant should be polite and courteous. Where possible, complaints will be resolved on the spot.',
            },
            {
              heading: 'ESCALATIONS OF COMPLAINTS',
              body: 'If the Complaint Handling Officer is unable to solve the complaint within a given timeframe, he/she will seek assistance from the Senior Manager, Manager or Trust Officer to deal with the complaint, and the Client will be informed and given a new timeframe for resolution.',
            },
            {
              heading: 'INFORMING CUSTOMERS OF PROGRESS',
              body:
                'NEWERA CAPITAL MARKETS LIMITED will strive to resolve all complaints within seven (7) working days. The Client will be given an approximate timeframe at the time they make their complaint. The Client will be informed regarding the progress of their complaint regularly, especially if there are any delays or changes to what has been agreed.\n\n' +
                'The Client will also be informed of any changes to services provided as a result of their complaint.\n\n' +
                'Where appropriate, Clients who have had their complaint resolved will be contacted at a later date. This is to assess their level of satisfaction regarding how the complaint was handled.',
            },
            {
              heading: 'REVIEW OF COMPLAINT HANDLING POLICY AND PROCEDURES',
              body:
                'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\n' +
                'This Complaint Handling Policy & Procedures is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },

      ar: {
        title: 'سياسة وإجراءات معالجة شكاوى العملاء',
        slug: 'complaint-handling',
        body: legalBody(
          'تولي شركة NEWERA CAPITAL MARKETS LIMITED أهمية للشكاوى التي ترد من عملائها بهدف تحسين وتقديم خدمات أفضل للعملاء. تهدف هذه السياسة إلى ضمان الاستماع إلى الشكاوى والمخاوف ومعالجتها بشكل مناسب، وأن يتم التعامل مع جميع الشكاوى أو الملاحظات الواردة من العملاء بجدية. تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بمعالجة الشكاوى بطريقة متسقة وعادلة وسرية، والعمل على حل الشكاوى في أسرع وقت ممكن. وتهدف الشركة إلى تسهيل تقديم الشكاوى للعملاء في حال عدم رضاهم، كما ستتعامل مع جميع العملاء الذين يقدمون شكاوى بطريقة مهنية.',
          [
            {
              heading: 'استلام الشكاوى وتسجيلها',
              body:
                'تم إنشاء حساب بريد إلكتروني ليكون قناة الشركة المخصصة لمعالجة الشكاوى، لتمكين شركة NEWERA CAPITAL MARKETS LIMITED من استلام الشكاوى والرد عليها من العملاء. وتضمن هذه الآلية توجيه جميع الشكاوى إلى حساب بريد إلكتروني محدد، وهو escalation@newera365.com، والذي تتم إدارته من قبل مسؤولي معالجة الشكاوى.\n\n' +
                'ومع ذلك، إذا استمر الموظفون في تلقي الشكاوى المرسلة إليهم مباشرة، فيجب عليهم إعادة توجيه البريد الإلكتروني المذكور في نفس يوم استلامه إلى حساب البريد الإلكتروني المخصص لمعالجة الشكاوى لاتخاذ الإجراءات اللازمة من قبل مسؤولي معالجة الشكاوى.\n\n' +
                'سيقوم مسؤولو معالجة الشكاوى بتأكيد استلام كل شكوى يتم تلقيها عبر البريد الإلكتروني من العميل بمجرد استلام رسالة الشكوى.\n\n' +
                'سيتم تسجيل وحفظ تفاصيل جميع المراسلات مع العميل وأي إجراءات تم اتخاذها لحل الشكوى في أنظمة التخزين المادية والسحابية الخاصة بشركة NEWERA CAPITAL MARKETS LIMITED. ويمكن إتاحة هذه السجلات للتفتيش من قبل مجلس الإدارة.\n\n' +
                'كما ستتم مراقبة الشكاوى المسجلة من قبل الإدارة لرصد أي اتجاهات أو مشكلات مستمرة، مما سيمكن من اتخاذ الجهود والإجراءات المناسبة لمعالجة أي مشكلات قائمة.',
            },
            {
              heading: 'الاستجابة للشكاوى',
              body: 'سيتم التعامل مع كل عميل يقدم شكوى بكل احترام ولباقة. يجب أن تكون جميع المراسلات مع مقدم الشكوى مهذبة ومحترمة. وحيثما أمكن، سيتم حل الشكاوى على الفور.',
            },
            {
              heading: 'تصعيد الشكاوى',
              body: 'إذا لم يتمكن مسؤول معالجة الشكاوى من حل الشكوى ضمن الإطار الزمني المحدد، فسوف يطلب المساعدة من المدير الأول أو المدير أو مسؤول الائتمان لمعالجة الشكوى، وسيتم إبلاغ العميل ومنحه إطاراً زمنياً جديداً للحل.',
            },
            {
              heading: 'إبلاغ العملاء بالتقدم المحرز',
              body:
                'ستسعى شركة NEWERA CAPITAL MARKETS LIMITED إلى حل جميع الشكاوى خلال سبعة (7) أيام عمل. وسيتم تزويد العميل بإطار زمني تقريبي عند تقديم شكواه. كما سيتم إبلاغ العميل بانتظام بالتقدم المحرز في شكواه، وخاصة في حال وجود أي تأخير أو تغييرات عما تم الاتفاق عليه.\n\n' +
                'كما سيتم إبلاغ العميل بأي تغييرات تطرأ على الخدمات المقدمة نتيجة لشكواه.\n\n' +
                'وحيثما كان ذلك مناسباً، سيتم التواصل مع العملاء الذين تم حل شكاواهم في وقت لاحق، وذلك لتقييم مستوى رضاهم عن كيفية معالجة الشكوى.',
            },
            {
              heading: 'مراجعة سياسة وإجراءات معالجة الشكاوى',
              body:
                'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) للتأكد من فعاليتها وتحديثها.\n\n' +
                'تحظى سياسة وإجراءات معالجة الشكاوى هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها مع العملاء.',
            },
          ],
        ),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 10. Deposit & Withdrawal Policy (from Deposit-Withdrawal-Policy.pdf)
    {
      pageType: 'deposit-withdrawal',
      en: {
        title: 'Deposit & Withdrawal Policy',
        slug: 'deposit-withdrawal',
        body: legalBody(
          'This Deposit & Withdrawal Policy (“the Policy”) is intended to provide the Clients with a summary of NEWERA CAPITAL MARKETS LIMITED (“the Company”) policies and terms with regards to deposit and withdrawal matters. This Policy applies to all Clients who have opened a trading account with the Company.',
          [
            {
              heading: 'THE POLICY',
              body:
                'i. The Client gives his/her consent and authorizes the Company to make deposits and withdrawals from the Client’s Bank Account on the Client’s behalf, including but not limited to, the settlement of Transactions performed by or on behalf of the Client, for payment of all amounts due by or on behalf of the Client to the Company or any other person.\n\n' +
                'ii. The Client has the right to withdraw the funds which are not used for margin covering, free from any obligations (i.e., Free Margin) from the Client’s Account without closing the said account.\n\n' +
                'iii. Unless the Parties otherwise agree, in writing, any amount payable by the Company to the Client shall be transferred directly to the Client’s personal account. Fund transfer requests are processed by the Company within the time period specified on the Company’s Main Website, and the time needed for crediting into the Client’s personal account will depend on the Client’s Bank Account provider.\n\n' +
                'iv. Client’s withdrawals should be made using the same method used by the Client to fund his Client Account and to the same remitter. The Company reserves the right to decline a withdrawal with a specific payment method and will suggest another payment method where the Client needs to proceed with a new withdrawal request or request further documentation while processing the withdrawal request. Where applicable, the Company reserves the right to send Client’s funds only in the currency in which these funds were deposited. Where applicable, if the Company is not satisfied with any documentation provided by the Client, then we will reverse the withdrawal transaction and deposit the amount back to the Client’s Account, net of any charges/fees charged by the Client’s Bank Account providers.\n\n' +
                'v. Clients’ fund transfer requests and withdrawals will be performed from the Company’s Client Portal located on its Main Website.\n\n' +
                'vi. The Client acknowledges that in case where a Client’s Bank Account is frozen for any given period and for any given reason, the Company assumes no responsibility. Furthermore, the Client acknowledges that he has read and understood the additional information provided on each payment method available on the Company’s Client Portal.',
            },
            {
              heading: 'REVIEW OF DEPOSIT & WITHDRAWAL POLICY',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated. This Deposit & Withdrawal Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },

      ar: {
        title: 'سياسة الإيداع والسحب',
        slug: 'deposit-withdrawal',
        body: legalBody(
          'تهدف سياسة الإيداع والسحب هذه ("السياسة") إلى تزويد العملاء بملخص عن سياسات وشروط شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") فيما يتعلق بمسائل الإيداع والسحب. تنطبق هذه السياسة على جميع العملاء الذين قاموا بفتح حساب تداول لدى الشركة.',
          [
            {
              heading: 'السياسة',
              body:
                '1. يوافق العميل ويفوض الشركة بإجراء عمليات الإيداع والسحب من الحساب المصرفي الخاص بالعميل نيابةً عنه، بما في ذلك، على سبيل المثال لا الحصر، تسوية المعاملات التي يتم تنفيذها من قبل العميل أو نيابةً عنه، وسداد جميع المبالغ المستحقة من العميل أو نيابةً عنه للشركة أو لأي شخص آخر.\n\n' +
                '2. يحق للعميل سحب الأموال التي لا يتم استخدامها لتغطية الهامش، والخالية من أي التزامات (أي الهامش الحر Free Margin)، من حساب العميل دون إغلاق الحساب المذكور.\n\n' +
                '3. ما لم يتفق الطرفان كتابةً على خلاف ذلك، يتم تحويل أي مبلغ مستحق الدفع من الشركة إلى العميل مباشرةً إلى الحساب الشخصي للعميل. تتم معالجة طلبات تحويل الأموال من قبل الشركة خلال الفترة الزمنية المحددة على الموقع الإلكتروني الرئيسي للشركة، بينما تعتمد المدة اللازمة لإيداع الأموال في الحساب الشخصي للعميل على مزود الحساب المصرفي الخاص بالعميل.\n\n' +
                '4. يجب أن تتم عمليات السحب الخاصة بالعميل باستخدام نفس الطريقة التي استخدمها العميل لتمويل حسابه لدى الشركة وإلى نفس المُرسِل. تحتفظ الشركة بالحق في رفض السحب باستخدام طريقة دفع محددة، وسوف تقترح طريقة دفع أخرى في حال احتاج العميل إلى تقديم طلب سحب جديد أو تقديم مستندات إضافية أثناء معالجة طلب السحب. وحيثما ينطبق ذلك، تحتفظ الشركة بالحق في إرسال أموال العميل فقط بالعملة التي تم بها إيداع هذه الأموال. وحيثما ينطبق ذلك، إذا لم تكن الشركة راضية عن أي مستندات قدمها العميل، فسوف تقوم بعكس معاملة السحب وإعادة المبلغ إلى حساب العميل، بعد خصم أي رسوم أو تكاليف يفرضها مزود الحساب المصرفي الخاص بالعميل.\n\n' +
                '5. سيتم تنفيذ طلبات تحويل الأموال وعمليات السحب الخاصة بالعملاء من خلال بوابة العميل التابعة للشركة والموجودة على موقعها الإلكتروني الرئيسي.\n\n' +
                '6. يقر العميل بأنه في حال تم تجميد حسابه المصرفي لأي فترة زمنية ولأي سبب كان، فإن الشركة لا تتحمل أي مسؤولية عن ذلك. كما يقر العميل بأنه قد قرأ وفهم المعلومات الإضافية المقدمة بشأن كل طريقة دفع متاحة على بوابة العميل التابعة للشركة.',
            },
            {
              heading: 'مراجعة سياسة الإيداع والسحب',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) للتأكد من فعاليتها وتحديثها. وتحظى سياسة الإيداع والسحب هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها مع العملاء.',
            },
          ],
        ),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },
    // 11. Order Execution Policy (from Order-Execution-Policy.pdf)
    {
      pageType: 'order-execution',
      en: {
        title: 'Order Execution Policy',
        slug: 'order-execution',
        body: legalBody(
          'POLICY OBJECTIVE\n\nThis Order Execution Policy (“the Policy”) is intended to provide you with a general overview as to how NEWERA CAPITAL MARKETS LIMITED (the “Company”) executes Orders on behalf of its clients, the factors which can affect the timing of execution and the way in which market volatility plays a part in Order handling. This Policy applies to all Clients who place Orders with the Company.',
          [
            {
              heading: '1. INTERPRETATION OF TERMS',
              body: 'In this Policy:\n\n“Base Currency” shall mean the first currency in the Currency Pair against which the Client buys or sells the Quote Currency.\n\n“Completed Transaction” in a Contract for Difference (CFD) shall mean two counter deals of the same size (opening a position and closing a position): buy then sell and vice versa.\n\n“Financial Instrument” shall mean the Financial Instruments under the Company’s license which can be found on the Company’s website. It is understood that the Company does not necessarily offer all the Financial Instruments which appear on its license but only those marketed on its website, from time to time.\n\n“Long Position” for CFD trading shall mean a buy position that appreciates in value if Underlying Market prices increase. For example, in respect of Currency Pairs: buying the Base Currency against the Quote Currency.\n\n“Margin” shall mean the necessary guarantee funds so as to open or maintain Open Positions in a CFD Transaction.\n\n“Margin Call” shall mean the situation when the Company informs the Client to deposit additional funds when the Client does not have enough Margin to open or maintain Open Positions.\n\n“Open Position” shall mean any Long Position or Short Position which is not a Completed Transaction.\n\n“Order” shall mean an instruction from the Client to trade in Financial Instruments.\n\n“Quote Currency” shall mean the second currency in the Currency Pair which can be bought or sold by the Client for the Base Currency.\n\n“Short Position” for CFD trading shall mean a sell position that appreciates in value if Underlying Market prices fall. For example, in respect of Currency Pairs: selling the Base Currency against the Quote Currency. Short Position is the opposite of a Long Position.\n\n“Slippage” shall mean the difference between the expected price of a Transaction in a CFD or any other Financial Instrument, and the price the Transaction is actually executed at. Slippage often occurs during periods of higher volatility (for example due to news events), making an Order at a specific price impossible to execute, when market Orders are used, and also when large Orders are executed when there may not be enough interest at the desired price level to maintain the expected price of trade.\n\n“Transaction” shall mean any CFD or other transaction arranged for execution on behalf of the Client under this Policy.\n\n“Underlying Asset” shall mean the object or underlying asset in a CFD or any other Financial Instrument, which may be Currency Pairs, Futures, Metals, Equity Indices, Stocks and Commodities. It is understood that the list is subject to change and Clients must refer each time to the Platform.\n\n“Underlying Market” shall mean the relevant market where the Underlying Asset of a CFD or any other Financial Instrument is traded.\n\n“Website” shall mean the Company’s website at <insert> and/or any other website as the Company may maintain from time to time.\n\nWords importing the singular shall import the plural and vice versa. Words importing the masculine shall import the feminine and vice versa. Words denoting persons include corporations, partnerships, other unincorporated bodies and all other legal entities and vice versa. Paragraph headings are for ease of reference only and shall not affect interpretation of this Policy.\n\nAny reference to any act or regulation or Law shall be that act or regulation or Law as amended, modified, supplemented, consolidated, re-enacted or replaced from time to time, all guidance noted, directives, statutory instruments, regulations or orders made pursuant to such and any statutory provision of which that statutory provision is a re-enactment, replacement or modification.',
            },
            {
              heading: '2. DISCLAIMER',
              body: 'You hereby acknowledge that there are inherent risks in trading in Financial Instruments. While this Policy is intended to inform you of the risks associated with trading in Financial Instruments, the Policy is not exhaustive of all risks related, or connected to, entering Orders and Transactions or trading using any trading platform offered by the Company.',
            },
            {
              heading: '3. NO GUARANTEES',
              body: 'The Company shall make all commercially reasonable efforts to obtain the best possible result for you, given the conditions relating to your Order. The Company may, but is not required to, take into account certain factors, such as prices, costs, speed, likelihood of execution and settlement, size, nature and/or any other information relevant to the execution of your Order.\n\nThere are no guarantees that your Order will be accepted or executed by us, nor are there guarantees regarding the speed, timing, or price at which your Order will be executed. Further, Order speed, timing, pricing and execution may vary between Clients trading the same Financial Instrument, due to several factors, including but not limited to Order type, market volatility and latency. This Policy does not form an obligation on our part to you.',
            },
            {
              heading: '4. MARGIN AND MARGIN REQUIREMENTS',
              body: 'The Company will generally decline any Order if your available Margin is less than the Margin Requirement necessary to place an Order or maintain an Open Position. The Company may liquidate, on a non-managerial basis by way of an auto-close functionality, all Open Positions and/or cancel any pending Orders without prior notice or your consent, if your Margin is less than your Margin Requirement.\n\nIn instances where your Open Position is liquidated, and your Trading Account realizes a negative balance, you are liable for all losses and must immediately make a payment to us for the full and total amount due.\n\nYou should be aware that the system(s) may automatically issue you a Margin Call warning and, further, that Margin Call warnings may vary based on certain limits configured in the system(s).',
            },
            {
              heading: '5. EXECUTION PRACTICES IN FINANCIAL INSTRUMENTS',
              body: 'You are warned that Slippage may occur when trading in Financial Instruments. This is the situation when, at the time that an Order is presented for execution, the specific price shown to the Client may not be available; therefore, the Order will be executed close to or a number of pips away from the Client’s requested price.\n\nSlippage is the difference between the expected price of an Order and the price the Order is actually executed at. If the execution price is better than the price requested by the Client, this is referred to as positive slippage. If the executed price is worse than the price requested by the Client, this is referred to as negative slippage.\n\nPlease be advised that Slippage is a normal element when trading in Financial Instruments. Slippage more often occurs during periods of illiquidity or higher volatility (for example due to news announcements, economic events, market openings and other factors), making an Order at a specific price impossible to execute.\n\nIn other words, your Orders may not be executed at declared prices. It is noted that Slippage can occur also during Stop Loss, Take Profit and other types of Orders. The Company does not guarantee the execution of your pending Orders at the price specified. However, it is confirmed that your Order will be executed at the next best available market price from the price you have specified under your pending Order.',
            },
            {
              heading: '6. TYPES OF ORDERS IN TRADING FINANCIAL INSTRUMENTS',
              body: 'The particular characteristics of an Order may affect the execution of the Client’s Order. Please see below the different types of Orders that a Client can place:',
            },
            {
              heading: '6(a). Market Orders',
              body: 'A market Order is an Order to buy or sell a Financial Instrument at the current price. Execution of this Order results in opening a trade position. Financial Instruments are bought at ASK price and sold at BID price. Stop Loss and Take Profit Orders can be attached to a market Order. All types of account Orders offered by the Company are executed as market Orders.',
            },
            {
              heading: '6(b). Pending Orders',
              body: 'The Company offers the following types of pending Orders: Buy Limit, Buy Stop, Sell Limit or Sell Stop Orders to accounts used to receive and transmit and execute Client Orders in Financial Instruments or to receive, transmit, execute and place Client Orders for execution with the Company’s liquidity providers.\n\nA Pending Order is an Order that allows the user to buy or sell a Financial Instrument at a pre-defined price in the future. These Pending Orders are executed once the price reaches the requested level.\n\nHowever, it is noted that under certain trading conditions it may not be possible to execute these Orders at the Client’s requested price. In this case, the Company has the right to execute the Order at the first available price.\n\nThis may occur, for example, at times of rapid price fluctuations, price rises or falls in one trading session to such an extent that, under the rules of the relevant exchange, trading is suspended or restricted, or there is a lack of liquidity, or this may occur at the opening of trading sessions.\n\nIt is noted that Stop Loss and Take Profit may be attached to a Pending Order. Also, Pending Orders are good till cancelled.',
            },
            {
              heading: '6(c). Take Profit',
              body: 'Take Profit Order is intended for gaining profit when the Financial Instrument price has reached a certain level. Execution of this Order results in complete closing of the whole position. It is always connected to an Open Position or a Pending Order.\n\nThe Order can be requested only together with a market or a Pending Order. Under this type of Order, the Company’s trading platform checks Long Positions with BID price for meeting the provisions of this Order (the Order is always set above the current BID price), and it does so with ASK price for Short Positions (the Order is always set below the current ASK price).\n\nTake Profit Orders are executed once the price reaches the requested level (stated prices).',
            },
            {
              heading: '6(d). Stop Loss',
              body: 'The Stop Order is used for minimizing losses if the Financial Instrument price has started to move in an unprofitable direction. If the Financial Instrument price reaches this level, the whole position will be closed automatically.\n\nSuch Orders are always connected to an Open Position or a Pending Order. They can be requested only together with a market or a Pending Order.\n\nUnder this type of Order, the Company’s trading platform checks Long Positions with BID price for meeting the provisions of this Order (the Order is always set below the current BID price), and it does so with ASK price for Short Positions (the Order is always set above the current ASK price).\n\nStop Loss Orders are executed at the first available price.',
            },
            {
              heading: '7. CLIENTS’ CONSENT',
              body: 'You hereby agree and consent to be bound by this Order Execution Policy. You further agree and consent that by placing trade(s) in any other Financial Instrument(s) than Financial Instrument(s) you will become a Client of the Company; however, the funds that you deposited might remain safeguarded with an intermediary broker.\n\nThis Policy may be amended from time to time. Any amendment to this Policy shall be deemed to be accepted by you when you signify your acceptance of this Policy and its amendments by executing an Order on the trading platform the Company may provide.\n\nBy executing the Order, you confirm that you have read, understood and agree to be bound by this Policy. It is your responsibility to ensure that you have the most updated version of this Policy.',
            },
            {
              heading: '8. LANGUAGES',
              body: 'The language of communication between the Company and the Client shall be English. All binding contractual documentation is available in English.\n\nUpon its sole discretion, the Company may communicate with the Client in a language other than English; however, in case of any discrepancy between the meanings of any communications and/or meanings, or any other communications forming part of this Policy or any other agreements, information or communication in any other language, the meaning of the English Language version shall prevail.\n\nThe Company or third parties may have provided the Client with translations of this Policy. The original English versions shall be the only legally binding version. In case of discrepancies between the English version and other translations in the Client’s possession, the original English version provided by the Company on the website shall prevail.',
            },
            {
              heading: '9. REVIEW OF ORDER EXECUTION POLICY',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Order Execution Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة تنفيذ الأوامر',
        slug: 'order-execution',
        body: legalBody(
          'هدف السياسة\n\nتهدف سياسة تنفيذ الأوامر هذه ("السياسة") إلى تزويدكم بنظرة عامة حول كيفية قيام شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بتنفيذ الأوامر نيابةً عن عملائها، والعوامل التي قد تؤثر على توقيت التنفيذ، وكيفية تأثير تقلبات السوق على معالجة الأوامر. تنطبق هذه السياسة على جميع العملاء الذين يضعون أوامر لدى الشركة.',
          [
            {
              heading: '1. تفسير المصطلحات',
              body: 'في هذه السياسة:\n\n"عملة الأساس" تعني العملة الأولى في زوج العملات التي يشتري العميل أو يبيع مقابلها عملة التسعير.\n\n"المعاملة المكتملة" في عقد الفروقات (CFD) تعني معاملتين متقابلتين بالحجم نفسه، تتمثلان في فتح مركز وإغلاق مركز: شراء ثم بيع والعكس صحيح.\n\n"الأداة المالية" تعني الأدوات المالية المشمولة ضمن ترخيص الشركة، والتي يمكن الاطلاع عليها على موقع الشركة الإلكتروني. ومن المفهوم أن الشركة لا تقدم بالضرورة جميع الأدوات المالية الواردة في ترخيصها، وإنما تقدم فقط الأدوات التي يتم تسويقها على موقعها الإلكتروني من وقت لآخر.\n\n"المركز الطويل" في تداول عقود الفروقات يعني مركز شراء تزداد قيمته إذا ارتفعت أسعار السوق الأساسية. وعلى سبيل المثال، فيما يتعلق بأزواج العملات: شراء عملة الأساس مقابل عملة التسعير.\n\n"الهامش" يعني الأموال الضامنة اللازمة لفتح أو الحفاظ على المراكز المفتوحة في معاملة عقود الفروقات.\n\n"نداء الهامش" يعني الحالة التي تقوم فيها الشركة بإبلاغ العميل بإيداع أموال إضافية عندما لا يكون لدى العميل هامش كافٍ لفتح أو الحفاظ على المراكز المفتوحة.\n\n"المركز المفتوح" يعني أي مركز طويل أو مركز قصير لم تتم معاملته كمعاملة مكتملة.\n\n"الأمر" يعني تعليمات صادرة من العميل للتداول في الأدوات المالية.\n\n"عملة التسعير" تعني العملة الثانية في زوج العملات التي يمكن للعميل شراؤها أو بيعها مقابل عملة الأساس.\n\n"المركز القصير" في تداول عقود الفروقات يعني مركز بيع تزداد قيمته إذا انخفضت أسعار السوق الأساسية. وعلى سبيل المثال، فيما يتعلق بأزواج العملات: بيع عملة الأساس مقابل عملة التسعير. والمركز القصير هو عكس المركز الطويل.\n\n"الانزلاق السعري" يعني الفرق بين السعر المتوقع للمعاملة في عقد الفروقات أو أي أداة مالية أخرى والسعر الذي يتم تنفيذ المعاملة به فعليًا. وغالبًا ما يحدث الانزلاق السعري خلال فترات التقلبات المرتفعة، على سبيل المثال بسبب الأحداث الإخبارية، مما يجعل تنفيذ الأمر بسعر محدد أمرًا غير ممكن، وكذلك عند استخدام أوامر السوق وعند تنفيذ أوامر كبيرة عندما قد لا يكون هناك اهتمام كافٍ عند مستوى السعر المطلوب للحفاظ على سعر التداول المتوقع.\n\n"المعاملة" تعني أي معاملة لعقد فروقات أو أي معاملة أخرى يتم ترتيبها للتنفيذ نيابةً عن العميل بموجب هذه السياسة.\n\n"الأصل الأساسي" يعني الأصل أو الشيء الأساسي في عقد الفروقات أو أي أداة مالية أخرى، والتي قد تشمل أزواج العملات والعقود الآجلة والمعادن ومؤشرات الأسهم والأسهم والسلع. ومن المفهوم أن القائمة قابلة للتغيير، ويجب على العملاء الرجوع في كل مرة إلى المنصة.\n\n"السوق الأساسي" يعني السوق المعني الذي يتم فيه تداول الأصل الأساسي لعقد الفروقات أو أي أداة مالية أخرى.\n\n"الموقع الإلكتروني" يعني موقع الشركة على الإنترنت على العنوان <insert> و/أو أي موقع إلكتروني آخر قد تديره الشركة من وقت لآخر.\n\nتشمل الكلمات التي تدل على المفرد الجمع والعكس صحيح. وتشمل الكلمات التي تدل على المذكر المؤنث والعكس صحيح. وتشمل الكلمات التي تدل على الأشخاص الشركات والشراكات والهيئات الأخرى غير المؤسسة وجميع الكيانات القانونية الأخرى والعكس صحيح. وتُستخدم عناوين الفقرات لتسهيل الرجوع إليها فقط ولا تؤثر على تفسير هذه السياسة.\n\nويُقصد بأي إشارة إلى أي قانون أو لائحة أو تشريع ذلك القانون أو اللائحة أو التشريع بصيغته المعدلة أو المضافة أو المكملة أو الموحدة أو المعاد سنها أو المستبدلة من وقت لآخر، بما في ذلك جميع الإرشادات والتوجيهات والأدوات التشريعية واللوائح أو الأوامر الصادرة بموجبها وأي حكم قانوني يمثل إعادة سن أو استبدال أو تعديلًا لذلك الحكم القانوني.',
            },
            {
              heading: '2. إخلاء المسؤولية',
              body: 'يقر العميل بموجب هذا بوجود مخاطر جوهرية متأصلة في التداول في الأدوات المالية. وعلى الرغم من أن هذه السياسة تهدف إلى إطلاع العميل على المخاطر المرتبطة بالتداول في الأدوات المالية، فإن هذه السياسة لا تشمل بشكل شامل جميع المخاطر المتعلقة أو المرتبطة بإدخال الأوامر والمعاملات أو التداول باستخدام أي منصة تداول تقدمها الشركة.',
            },
            {
              heading: '3. عدم وجود ضمانات',
              body: 'ستبذل الشركة جميع الجهود التجارية المعقولة للحصول على أفضل نتيجة ممكنة للعميل، بالنظر إلى الظروف المتعلقة بالأمر. ويجوز للشركة، ولكن ليس من واجبها، أن تأخذ في الاعتبار عوامل معينة مثل الأسعار والتكاليف والسرعة واحتمالية التنفيذ والتسوية والحجم والطبيعة و/أو أي معلومات أخرى ذات صلة بتنفيذ الأمر.\n\nلا توجد أي ضمانات بأن يتم قبول الأمر أو تنفيذه من قبل الشركة، كما لا توجد ضمانات بشأن سرعة أو توقيت أو السعر الذي سيتم تنفيذ الأمر به. وعلاوة على ذلك، قد تختلف سرعة الأمر وتوقيته وتسعيره وتنفيذه بين العملاء الذين يتداولون في الأداة المالية نفسها بسبب عدة عوامل، بما في ذلك على سبيل المثال لا الحصر نوع الأمر وتقلبات السوق وزمن الاستجابة. ولا تشكل هذه السياسة التزامًا من جانب الشركة تجاه العميل.',
            },
            {
              heading: '4. الهامش ومتطلبات الهامش',
              body: 'ترفض الشركة عمومًا أي أمر إذا كان الهامش المتاح لدى العميل أقل من متطلبات الهامش اللازمة لوضع أمر أو الحفاظ على مركز مفتوح. ويجوز للشركة تصفية جميع المراكز المفتوحة و/أو إلغاء أي أوامر معلقة دون إشعار مسبق أو موافقة العميل إذا كان الهامش أقل من متطلبات الهامش، وذلك من خلال وظيفة الإغلاق التلقائي.\n\nفي الحالات التي تتم فيها تصفية المركز المفتوح للعميل ويؤدي حساب التداول إلى رصيد سلبي، يكون العميل مسؤولاً عن جميع الخسائر ويجب عليه فورًا دفع كامل المبلغ المستحق للشركة.\n\nيجب على العميل أن يدرك أن النظام أو الأنظمة قد تصدر تلقائيًا تحذيرًا بشأن نداء الهامش، وأن تحذيرات نداء الهامش قد تختلف بناءً على حدود معينة تم تكوينها في النظام أو الأنظمة.',
            },
            {
              heading: '5. ممارسات تنفيذ الأوامر في الأدوات المالية',
              body: 'يُحذّر العميل من احتمال حدوث الانزلاق السعري عند التداول في الأدوات المالية. ويحدث ذلك عندما لا يكون السعر المحدد الذي يظهر للعميل متاحًا في الوقت الذي يتم فيه تقديم الأمر للتنفيذ؛ وبالتالي سيتم تنفيذ الأمر بسعر قريب من السعر المطلوب أو بفارق عدد من النقاط عنه.\n\nالانزلاق السعري هو الفرق بين السعر المتوقع للأمر والسعر الذي يتم تنفيذ الأمر به فعليًا. وإذا كان سعر التنفيذ أفضل من السعر الذي طلبه العميل، يُشار إلى ذلك باسم الانزلاق السعري الإيجابي. وإذا كان سعر التنفيذ أسوأ من السعر الذي طلبه العميل، يُشار إلى ذلك باسم الانزلاق السعري السلبي.\n\nيرجى العلم بأن الانزلاق السعري عنصر طبيعي في التداول في الأدوات المالية. ويحدث الانزلاق السعري بشكل أكثر تكرارًا خلال فترات انخفاض السيولة أو ارتفاع التقلبات، مثل إعلانات الأخبار والأحداث الاقتصادية وافتتاح الأسواق وعوامل أخرى، مما يجعل تنفيذ الأمر بسعر محدد أمرًا غير ممكن.\n\nوبعبارة أخرى، قد لا يتم تنفيذ أوامرك بالأسعار المعلنة. كما يمكن أن يحدث الانزلاق السعري أثناء أوامر وقف الخسارة وجني الأرباح وأنواع الأوامر الأخرى. ولا تضمن الشركة تنفيذ الأوامر المعلقة بالسعر المحدد من قبل العميل. ومع ذلك، يتم تنفيذ الأمر بأفضل سعر سوق متاح تالٍ للسعر الذي حدده العميل في الأمر المعلق.',
            },
            {
              heading: '6. أنواع الأوامر في تداول الأدوات المالية',
              body: 'قد تؤثر الخصائص المحددة للأمر على تنفيذ أمر العميل. وفيما يلي أنواع الأوامر المختلفة التي يمكن للعميل وضعها:',
            },
            {
              heading: '6(أ). أوامر السوق',
              body: 'أمر السوق هو أمر لشراء أو بيع أداة مالية بالسعر الحالي. ويؤدي تنفيذ هذا الأمر إلى فتح مركز تداول. ويتم شراء الأدوات المالية بسعر الطلب (ASK) وبيعها بسعر العرض (BID). ويمكن إرفاق أوامر وقف الخسارة وجني الأرباح بأمر السوق. ويتم تنفيذ جميع أنواع أوامر الحسابات التي تقدمها الشركة كأوامر سوق.',
            },
            {
              heading: '6(ب). الأوامر المعلقة',
              body: 'تقدم الشركة الأنواع التالية من الأوامر المعلقة: أمر شراء بحد (Buy Limit)، وأمر شراء عند التوقف (Buy Stop)، وأمر بيع بحد (Sell Limit)، وأمر بيع عند التوقف (Sell Stop)، وذلك للحسابات المستخدمة لاستقبال ونقل وتنفيذ أوامر العملاء في الأدوات المالية أو لاستقبال ونقل وتنفيذ ووضع أوامر العملاء للتنفيذ لدى مزودي السيولة التابعين للشركة.\n\nالأمر المعلق هو أمر يسمح للمستخدم بشراء أو بيع أداة مالية بسعر محدد مسبقًا في المستقبل. ويتم تنفيذ هذه الأوامر المعلقة بمجرد وصول السعر إلى المستوى المطلوب.\n\nومع ذلك، تجدر الإشارة إلى أنه في ظل ظروف تداول معينة قد لا يكون من الممكن تنفيذ هذه الأوامر بالسعر الذي طلبه العميل. وفي هذه الحالة، يحق للشركة تنفيذ الأمر بأول سعر متاح.\n\nوقد يحدث ذلك، على سبيل المثال، في أوقات التقلبات السريعة في الأسعار، أو عند ارتفاع أو انخفاض الأسعار خلال جلسة تداول واحدة إلى درجة يتم معها تعليق أو تقييد التداول وفقًا لقواعد البورصة المعنية، أو عند وجود نقص في السيولة، أو عند افتتاح جلسات التداول.\n\nيمكن إرفاق أوامر وقف الخسارة وجني الأرباح بالأوامر المعلقة. كما أن الأوامر المعلقة تظل سارية حتى إلغائها.',
            },
            {
              heading: '6(ج). جني الأرباح',
              body: 'يهدف أمر جني الأرباح إلى تحقيق الربح عندما يصل سعر الأداة المالية إلى مستوى معين. ويؤدي تنفيذ هذا الأمر إلى إغلاق المركز بالكامل. ويرتبط دائمًا بمركز مفتوح أو أمر معلق.\n\nلا يمكن طلب هذا الأمر إلا مع أمر سوق أو أمر معلق. وبموجب هذا النوع من الأوامر، تقوم منصة التداول الخاصة بالشركة بفحص المراكز الطويلة باستخدام سعر العرض (BID) للتحقق من استيفاء شروط هذا الأمر، حيث يتم وضع الأمر دائمًا فوق سعر العرض الحالي، كما تقوم بفحص المراكز القصيرة باستخدام سعر الطلب (ASK)، حيث يتم وضع الأمر دائمًا أسفل سعر الطلب الحالي.\n\nيتم تنفيذ أوامر جني الأرباح بمجرد وصول السعر إلى المستوى المطلوب (الأسعار المحددة).',
            },
            {
              heading: '6(د). وقف الخسارة',
              body: 'يُستخدم أمر التوقف لتقليل الخسائر إذا بدأ سعر الأداة المالية في التحرك في اتجاه غير مربح. وإذا وصل سعر الأداة المالية إلى هذا المستوى، فسيتم إغلاق المركز بالكامل تلقائيًا.\n\nترتبط هذه الأوامر دائمًا بمركز مفتوح أو أمر معلق. ولا يمكن طلبها إلا مع أمر سوق أو أمر معلق.\n\nوبموجب هذا النوع من الأوامر، تقوم منصة التداول الخاصة بالشركة بفحص المراكز الطويلة باستخدام سعر العرض (BID) للتحقق من استيفاء شروط الأمر، حيث يتم وضع الأمر دائمًا أسفل سعر العرض الحالي، كما تقوم بفحص المراكز القصيرة باستخدام سعر الطلب (ASK)، حيث يتم وضع الأمر دائمًا فوق سعر الطلب الحالي.\n\nيتم تنفيذ أوامر وقف الخسارة بأول سعر متاح.',
            },
            {
              heading: '7. موافقة العملاء',
              body: 'يوافق العميل ويقر بموجب هذا بأنه ملزم بسياسة تنفيذ الأوامر هذه. كما يوافق ويقر بأن وضع أي صفقة أو صفقات في أي أداة مالية أخرى سيجعل منه عميلاً للشركة؛ ومع ذلك، قد تظل الأموال التي قام بإيداعها محفوظة لدى وسيط وسيط.\n\nيجوز تعديل هذه السياسة من وقت لآخر. ويُعتبر أي تعديل على هذه السياسة مقبولاً من جانب العميل عندما يؤكد قبوله لهذه السياسة وتعديلاتها من خلال تنفيذ أمر على منصة التداول التي قد توفرها الشركة.\n\nمن خلال تنفيذ الأمر، يؤكد العميل أنه قرأ هذه السياسة وفهمها ووافق على الالتزام بها. وتقع على عاتق العميل مسؤولية التأكد من حصوله على أحدث نسخة من هذه السياسة.',
            },
            {
              heading: '8. اللغات',
              body: 'تكون لغة التواصل بين الشركة والعميل هي اللغة الإنجليزية. وجميع الوثائق التعاقدية الملزمة متاحة باللغة الإنجليزية.\n\nويجوز للشركة، وفقًا لتقديرها الخاص، التواصل مع العميل بلغة أخرى غير الإنجليزية؛ ومع ذلك، في حالة وجود أي تعارض بين معاني أي مراسلات و/أو معاني أو أي مراسلات أخرى تشكل جزءًا من هذه السياسة أو أي اتفاقيات أو معلومات أو اتصالات أخرى بأي لغة أخرى، تسود نسخة اللغة الإنجليزية.\n\nيجوز أن تكون الشركة أو أطراف ثالثة قد قدمت للعميل ترجمات لهذه السياسة. وتكون النسخ الإنجليزية الأصلية هي النسخ الوحيدة الملزمة قانونًا. وفي حالة وجود أي تعارض بين النسخة الإنجليزية وأي ترجمات أخرى بحوزة العميل، تسود النسخة الإنجليزية الأصلية التي تقدمها الشركة على موقعها الإلكتروني.',
            },
            {
              heading: '9. مراجعة سياسة تنفيذ الأوامر',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) للتأكد من فعاليتها وتحديثها.\n\nتحظى سياسة تنفيذ الأوامر هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 12. Suspicious Activity Reporting Policy (from Suspicious-Activity-Reporting-Policy-and-Procedures.pdf)
    {
      pageType: 'suspicious-activity-reporting',
      en: {
        title: 'Suspicious Activity Reporting (SAR) Policy & Procedures',
        slug: 'suspicious-activity-reporting',
        body: legalBody(
          'POLICY OBJECTIVE\n\nBased on the guidelines issued by the Financial Services Regulatory Authority on Anti-Money Laundering and Counter Financing of Terrorism (AML/CFT) for the Banking Sector, NEWERA CAPITAL MARKETS LIMITED (“the Company”) has implemented the following internal Suspicious Activity Report (“SAR”) policy and procedures to monitor suspicious transactions and to address its reporting obligations. The following policy and procedures are developed for identifying, evaluating and investigating, reporting, as well as record-keeping of potential suspicious situations/transactions (including attempted or proposed).',
          [
            {
              heading: '1. IDENTIFYING',
              body: 'The Company’s employees need to ensure that all potential/existing customers do not engage in criminal activity, money laundering or terrorist financing. They must carefully monitor all unusual transactions to see if there is anything suspicious about the customer.\n\nThere are many reasons why an employee might become suspicious about a transaction/activity. Often it is just because of something unusual for a business, maybe a customer behaved strangely, or perhaps a customer made unusual requests that did not seem to make sense.\n\nThe Company’s employees may be guided by the examples provided in the Company’s internal measures for “Mechanism or Red Flag to indicate occurrence of suspicious transaction”, to assist them in identifying any attempted or proposed suspicious transaction.',
            },
            {
              heading: '2. EVALUATING AND INVESTIGATING',
              body: 'Whenever a Company’s employee detects any “red flag” that fits the list indicated above or senses any unusual activity/transaction, he/she must directly inform the AML Compliance Officer (“CO”) without delay.\n\nUpon receiving any internal SAR from the Company’s employees, the CO will first evaluate the grounds for suspicion and will make an initial decision as to whether a customer/transaction is potentially suspicious.\n\nThe employee may be required to investigate the customer/transaction further under the direction of the CO. This may include gathering additional information from the customer or from third-party sources to assist in determining whether the customer/transaction is indeed suspicious and to eliminate “false positives”.\n\nThese procedures should reflect the principle of confidentiality, where employees are to ensure that the investigation is conducted swiftly and that reports contain relevant information and are produced and submitted to the CO in a secure and confidential manner, within five (5) working days from the commencement of the investigation.',
            },
            {
              heading: '3. REPORTING',
              body: 'Internal Suspicious Activity Report (“SAR”) prepared by the Company’s employee must be reviewed by the CO within three (3) working days from receiving such report.\n\nThe CO is to complete his/her review within five (5) working days. Under circumstances where a report requires further investigation, the timeframe can be exceeded up to a month.\n\nOnce the CO has finished reviewing the details, he/she should determine if that particular event rendered an attempted or proposed suspicious transaction.\n\nThe CO will consult with the Company’s Board of Directors to make the decision as to whether the customer/transaction is suspicious and whether a filing to the Authority(ies) is necessary.\n\nThe CO shall submit the STR using the specified reporting template to both of the following authorities:\n\nFinancial Services Regulatory Authority\n6th Floor Francis Compton Building\nWaterfront,\nCastries St. Lucia W.I\nTel: +758 468-2990\nFax: +758 451-7655\nEmail: finsersup@gosl.gov.lc\n\nFinancial Intelligence Authority\nP.O. Box GM959\nGablewoods North P.O.\nCastries LC02 501\nSaint Lucia\nTel: +758 451-7126\nFax: +758 453-6199\nEmail: slufia@candw.lc',
            },
            {
              heading: '4. CONFIDENTIALITY AND REPORTING DECISIONS',
              body: 'The CO will inform the Company’s Board of Directors of any report submitted. The fact that a report has been made is confidential.\n\nThe CO, as well as the Company’s employees, shall ensure that in the course of submitting the SAR, such reports are treated with the highest level of confidentiality. No one, other than those involved in the investigation and reporting, should be told about a SAR, except for law enforcement or other competent authorities.\n\nHowever, under circumstances where the CO decides that there are no reasonable grounds for suspicion and no SAR is necessary to be submitted to the relevant authorities, the CO must document and file the decision, supported by the relevant supporting documentary evidence, which will be made available to the relevant supervisory authorities upon request.',
            },
            {
              heading: '5. RECORD KEEPING',
              body: 'The DCO shall maintain a complete file on all internally generated reports and any supporting documentary evidence, regardless of whether such report has been submitted. In the case of a filed report, backup documentation is necessary.\n\nThe following are some of the information maintained for record-keeping, which includes but is not limited to:\n\ni. Maintain a record of identifying information provided by the Customer.\n\nii. Where the Company relies upon a document to verify identity, the Company must maintain a copy of the document with clear evidence that the Company relied on it and any identifying information it may contain.\n\niii. Record the methods and result of any additional measures undertaken to verify the identity of the Customer.\n\niv. Record the resolution of any discrepancy in the identifying information obtained.\n\nv. The nature or circumstances surrounding the transaction; and\n\nvi. Business background of the person conducting the transaction that is connected to the unlawful activity.\n\nAll transaction and identification records are to be retained for a minimum period of six (6) years following the completion of the transaction.',
            },
            {
              heading: '6. REVIEW OF SUSPICIOUS ACTIVITY REPORTING POLICY AND PROCEDURES',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Suspicious Activity Reporting Policy and Procedures is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة وإجراءات الإبلاغ عن الأنشطة المشبوهة (SAR)',
        slug: 'suspicious-activity-reporting',
        body: legalBody(
          'هدف السياسة\n\nاستنادًا إلى المبادئ التوجيهية الصادرة عن هيئة تنظيم الخدمات المالية بشأن مكافحة غسل الأموال ومكافحة تمويل الإرهاب (AML/CFT) للقطاع المصرفي، قامت شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بتطبيق سياسة وإجراءات داخلية للإبلاغ عن الأنشطة المشبوهة ("SAR") بهدف مراقبة المعاملات المشبوهة والوفاء بالتزاماتها المتعلقة بالإبلاغ. وقد تم وضع هذه السياسة والإجراءات لتحديد وتقييم والتحقيق والإبلاغ، بالإضافة إلى حفظ السجلات المتعلقة بالحالات والمعاملات المحتملة المشبوهة، بما في ذلك المعاملات التي تمت محاولة تنفيذها أو اقتراحها.',
          [
            {
              heading: '1. تحديد الأنشطة والمعاملات المشبوهة',
              body: 'يجب على موظفي الشركة التأكد من أن جميع العملاء المحتملين والحاليين لا يشاركون في أي نشاط إجرامي أو غسل أموال أو تمويل للإرهاب. كما يجب عليهم مراقبة جميع المعاملات غير المعتادة بعناية للتحقق مما إذا كان هناك أي أمر يثير الشكوك بشأن العميل.\n\nهناك العديد من الأسباب التي قد تجعل الموظف يشك في معاملة أو نشاط معين. وغالبًا ما يكون السبب هو وجود أمر غير معتاد بالنسبة لطبيعة العمل، أو أن العميل تصرف بطريقة غريبة، أو ربما قدم العميل طلبات غير معتادة لا تبدو منطقية.\n\nيجوز لموظفي الشركة الاسترشاد بالأمثلة الواردة في التدابير الداخلية للشركة تحت عنوان "الآلية أو المؤشرات الحمراء الدالة على حدوث معاملة مشبوهة"، وذلك لمساعدتهم في تحديد أي معاملة مشبوهة تمت محاولة تنفيذها أو تم اقتراحها.',
            },
            {
              heading: '2. التقييم والتحقيق',
              body: 'عندما يكتشف أي موظف في الشركة أي "مؤشر أحمر" يتوافق مع القائمة المشار إليها أعلاه، أو يشعر بوجود أي نشاط أو معاملة غير معتادة، يجب عليه إبلاغ مسؤول الامتثال لمكافحة غسل الأموال ("CO") مباشرة ودون تأخير.\n\nعند استلام أي بلاغ داخلي عن نشاط مشبوه (SAR) من موظفي الشركة، يقوم مسؤول الامتثال أولاً بتقييم أسباب الاشتباه واتخاذ قرار أولي بشأن ما إذا كان العميل أو المعاملة يحتمل أن تكون مشبوهة.\n\nقد يُطلب من الموظف إجراء مزيد من التحقيق في العميل أو المعاملة تحت توجيه مسؤول الامتثال. وقد يشمل ذلك جمع معلومات إضافية من العميل أو من مصادر تابعة لأطراف ثالثة للمساعدة في تحديد ما إذا كان العميل أو المعاملة مشبوهًا بالفعل واستبعاد الحالات الإيجابية الكاذبة.\n\nيجب أن تعكس هذه الإجراءات مبدأ السرية، حيث يتعين على الموظفين ضمان إجراء التحقيق بسرعة، وأن تحتوي التقارير على المعلومات ذات الصلة، وأن يتم إعدادها وتقديمها إلى مسؤول الامتثال بطريقة آمنة وسرية خلال خمسة (5) أيام عمل من بدء التحقيق.',
            },
            {
              heading: '3. الإبلاغ',
              body: 'يجب أن تتم مراجعة تقرير النشاط المشبوه الداخلي ("SAR") الذي يعده موظف الشركة من قبل مسؤول الامتثال خلال ثلاثة (3) أيام عمل من استلام التقرير.\n\nيجب على مسؤول الامتثال إكمال مراجعته خلال خمسة (5) أيام عمل. وفي الحالات التي يتطلب فيها التقرير إجراء مزيد من التحقيق، يجوز تمديد هذه المدة لتصل إلى شهر واحد.\n\nبعد أن ينتهي مسؤول الامتثال من مراجعة التفاصيل، يجب عليه تحديد ما إذا كان الحدث المعني يمثل معاملة مشبوهة تمت محاولة تنفيذها أو تم اقتراحها.\n\nيتشاور مسؤول الامتثال مع مجلس إدارة الشركة لاتخاذ القرار بشأن ما إذا كان العميل أو المعاملة مشبوهًا وما إذا كان من الضروري تقديم بلاغ إلى السلطة أو السلطات المختصة.\n\nيجب على مسؤول الامتثال تقديم تقرير المعاملة المشبوهة (STR) باستخدام نموذج الإبلاغ المحدد إلى كل من السلطتين التاليتين:\n\nهيئة تنظيم الخدمات المالية\nالطابق السادس، مبنى فرانسيس كومبتون\nواجهة Waterfront\nكاستريز، سانت لوسيا، جزر الهند الغربية\nهاتف: +758 468-2990\nفاكس: +758 451-7655\nالبريد الإلكتروني: finsersup@gosl.gov.lc\n\nهيئة الاستخبارات المالية\nصندوق بريد P.O. Box GM959\nGablewoods North P.O.\nCastries LC02 501\nسانت لوسيا\nهاتف: +758 451-7126\nفاكس: +758 453-6199\nالبريد الإلكتروني: slufia@candw.lc',
            },
            {
              heading: '4. السرية وقرارات الإبلاغ',
              body: 'يقوم مسؤول الامتثال بإبلاغ مجلس إدارة الشركة بأي تقرير تم تقديمه. وتُعد حقيقة تقديم التقرير مسألة سرية.\n\nيجب على مسؤول الامتثال، وكذلك موظفي الشركة، ضمان التعامل مع هذه التقارير بأعلى مستوى من السرية أثناء تقديم تقرير النشاط المشبوه (SAR). ولا يجوز إبلاغ أي شخص، باستثناء الأشخاص المشاركين في التحقيق والإبلاغ، بوجود تقرير SAR، باستثناء جهات إنفاذ القانون أو السلطات المختصة الأخرى.\n\nومع ذلك، في الحالات التي يقرر فيها مسؤول الامتثال عدم وجود أسباب معقولة للاشتباه وعدم ضرورة تقديم تقرير SAR إلى السلطات المختصة، يجب على مسؤول الامتثال توثيق القرار وحفظه، مدعومًا بالأدلة والمستندات ذات الصلة، على أن تكون هذه المستندات متاحة للجهات الرقابية المختصة عند الطلب.',
            },
            {
              heading: '5. حفظ السجلات',
              body: 'يجب على مسؤول الامتثال المعيّن (DCO) الاحتفاظ بملف كامل لجميع التقارير التي يتم إعدادها داخليًا وأي مستندات إثبات داعمة، بغض النظر عما إذا كان قد تم تقديم التقرير أم لا. وفي حالة تقديم التقرير، يجب الاحتفاظ بنسخة احتياطية من المستندات الداعمة.\n\nتشمل بعض المعلومات التي يتم الاحتفاظ بها لأغراض حفظ السجلات، على سبيل المثال لا الحصر، ما يلي:\n\n1. الاحتفاظ بسجل لمعلومات تحديد الهوية التي قدمها العميل.\n\n2. عندما تعتمد الشركة على مستند للتحقق من الهوية، يجب على الشركة الاحتفاظ بنسخة من المستند مع دليل واضح على أن الشركة اعتمدت عليه، بالإضافة إلى أي معلومات تعريفية قد يتضمنها المستند.\n\n3. تسجيل الأساليب والنتائج الخاصة بأي إجراءات إضافية تم اتخاذها للتحقق من هوية العميل.\n\n4. تسجيل كيفية حل أي تعارض في معلومات تحديد الهوية التي تم الحصول عليها.\n\n5. طبيعة أو ظروف المعاملة؛ و\n\n6. الخلفية التجارية للشخص الذي يقوم بالمعاملة والتي تكون مرتبطة بالنشاط غير القانوني.\n\nيجب الاحتفاظ بجميع سجلات المعاملات وتحديد الهوية لمدة لا تقل عن ست (6) سنوات بعد إتمام المعاملة.',
            },
            {
              heading: '6. مراجعة سياسة وإجراءات الإبلاغ عن الأنشطة المشبوهة',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) للتأكد من فعاليتها وتحديثها.\n\nتحظى سياسة وإجراءات الإبلاغ عن الأنشطة المشبوهة هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },
  ];

  console.log(`⚖️  Seeding ${pages.length} legal pages (English + Arabic)...`);

  for (const page of pages) {
    const created = await payload.create({
      collection: 'legal-pages',
      data: {
        title: page.en.title,
        slug: page.en.slug,
        pageType: page.pageType as any,
        body: page.en.body,
        effectiveDate: page.effectiveDate,
        version: page.version,
        status: 'published',
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: 'legal-pages',
      id: created.id,
      locale: 'ar',
      data: {
        title: page.ar.title,
        body: page.ar.body,
      },
      overrideAccess: true,
    });

    console.log(`   ✅ Seeded ${page.pageType} (${page.en.title})`);
  }

  console.log(
    `\n🎉 Successfully seeded all ${pages.length} legal pages into database (EN + AR)!\n`,
  );
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ Legal seed failed:', err);
  process.exit(1);
});
