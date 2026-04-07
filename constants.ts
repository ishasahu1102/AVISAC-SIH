// constants.ts

import type { Bank, Language } from './types';

// 🗣️ Supported Languages (used by Header + Awareness)
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

// 🔄 Translations: awareness (all langs) + upload/verify/bankGrid (en+hi)
// upload/verify/bankGrid are OPTIONAL so other languages can fall back to English
export const TRANSLATIONS: Record<
  string,
  {
    awareness: {
      title: string;
      subtitle: string;
      p1t: string;
      p1b: string;
      p2t: string;
      p2b: string;
      p3t: string;
      p3b: string;
      cta: string;
    };
    upload?: {
      title: string;
      subtitle: string;
      aadhaarFront: string;
      aadhaarFrontDesc: string;
      aadhaarBack: string;
      aadhaarBackDesc: string;
      passbook: string;
      passbookDesc: string;
      dbtForm: string;
      dbtFormDesc: string;
      signature: string;
      signatureDesc: string;
      upload: string;
      changeFile: string;
      view: string;
      optional: string;
      scanTitle: string;
      scanTips: string[];
      scanNow: string;
      scanning: string;
    };
    verify?: {
      title: string;
      subtitle: string;
      fullName: string;
      aadhaarNumber: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      branchName: string;
      mobileNumber: string;
      email: string;
      optionsTitle: string;
      options: { val: 'link_new' | 'change_account' | 'dbt_only'; label: string }[];
      confident: string;
      check: string;
      generate: string;
      generating: string;
    };
    bankGrid?: {
      formReady: string;
      successMessage: string;
      downloadPdf: string;
      findBankHelp: string;
      completionNote: string;
      chooseBank: string;
      tapToView: string;
      portalDescription: string;
      visitPortal: string;
      whenClicked: string;
      helpfulLinks: string;
      helpfulLinksText: string;
      linkCentralDbt: string;
      linkAadhaarStatus: string;
      approvalNote: string;
    };
  }
> = {
  // ========= ENGLISH =========
  en: {
    awareness: {
      title: 'Aadhaar-linked, DBT-enabled bank account for your scholarship',
      subtitle:
        'Your scholarship is paid only into an Aadhaar-seeded, DBT-enabled bank account in your name.',
      p1t: 'Non-DBT or non-Aadhaar seeded accounts get rejected',
      p1b:
        'If your scholarship account is not Aadhaar seeded or DBT-enabled, the payment may fail or get returned. This delays your scholarship or may even cancel the benefit.',
      p2t: 'DBT ensures money goes directly to YOU',
      p2b:
        'With a DBT-enabled, Aadhaar-seeded account, the scholarship is credited directly to your personal bank account—no middlemen, no manual transfers, full transparency.',
      p3t: 'Your goal: One correct, active DBT-enabled account',
      p3b:
        'Maintain one active bank account in your own name, link it with Aadhaar, enable DBT, and keep your mobile number updated so you get SMS alerts for each credit.',
      cta: 'Start Form Filling',
    },

    upload: {
      title: 'Upload Required Documents',
      subtitle:
        'Upload Aadhaar, Passbook, Signature, and optional DBT form PDF if you have it.',
      aadhaarFront: 'Aadhaar Front',
      aadhaarFrontDesc: 'Upload a clear photo of the front side of Aadhaar.',
      aadhaarBack: 'Aadhaar Back',
      aadhaarBackDesc: 'Upload Aadhaar back side showing address block.',
      passbook: 'Passbook / Bank First Page',
      passbookDesc: 'Upload first page that clearly shows IFSC, Name, and Account No.',
      dbtForm: 'Optional DBT Form (PDF)',
      dbtFormDesc: 'Upload a scholarship/DBT form PDF if already downloaded.',
      signature: 'Signature Image',
      signatureDesc: 'Upload a clear image of your handwritten signature.',
      upload: 'Upload',
      changeFile: 'Change File',
      view: 'View',
      optional: 'Optional Documents',
      scanTitle: 'Scan & Extract Details Automatically',
      scanTips: [
        'Use bright light and keep your document flat.',
        'Ensure Aadhaar number, name, IFSC and account number are clearly visible.',
        'You can still correct any mistakes in the next step.',
      ],
      scanNow: 'Scan Now',
      scanning: 'Scanning…',
    },

    verify: {
      title: 'Verify Your Details',
      subtitle:
        'These details were extracted from your documents. Please verify and correct if needed before generating the DBT form.',
      fullName: 'Full Name',
      aadhaarNumber: 'Aadhaar Number',
      accountNumber: 'Bank Account Number',
      ifscCode: 'IFSC Code',
      bankName: 'Bank Name',
      branchName: 'Branch Name',
      mobileNumber: 'Mobile Number',
      email: 'Email Address',
      optionsTitle: 'What do you want to do with this DBT request?',
      options: [
        { val: 'link_new', label: 'Link Aadhaar with a new bank account' },
        { val: 'change_account', label: 'Change my existing DBT account' },
        { val: 'dbt_only', label: 'Activate DBT on my existing Aadhaar-linked account' },
      ],
      confident: 'Looks correct',
      check: 'Please check',
      generate: 'Generate DBT Form PDF',
      generating: 'Generating form…',
    },

    bankGrid: {
      formReady: 'Form Ready! 🎉',
      successMessage:
        'Your DBT Application has been generated successfully. Download the filled PDF and visit your bank’s official portal or nearest branch for final submission. This tool does not auto-submit anything.',
      downloadPdf: 'Download Filled PDF',
      findBankHelp: 'Find Bank Portal & Help',
      completionNote: '100% form completed • Ready for printing & submission',
      chooseBank: 'Choose Your Bank',
      tapToView: 'Tap “Find Bank Portal & Help” to view banks',
      portalDescription:
        'Bank logos and official links help you quickly reach the correct portals for Aadhaar seeding, DBT activation, and scholarship support.',
      visitPortal: 'Visit Bank Help Portal',
      whenClicked: 'Bank options will appear here after you click the help button above.',
      helpfulLinks: 'Helpful Links for Scholarship & DBT',
      helpfulLinksText:
        'Use these official resources for Aadhaar linking, DBT tracking, and SC/ST scholarship information.',
      linkCentralDbt: 'Central DBT Portal – Pre & Post Matric Scholarships (SC/ST)',
      linkAadhaarStatus: 'Guide – Aadhaar Seeding & DBT Status Check',
      approvalNote:
        'Final approval and credit of scholarship/DBT depends on bank and government verification, not this tool.',
    },
  },

  // ========= HINDI =========
  hi: {
    awareness: {
      title: 'स्कॉलरशिप के लिए आधार लिंक्ड, DBT सक्षम बैंक खाता',
      subtitle:
        'आपकी स्कॉलरशिप केवल आधार-सीडेड, DBT सक्षम बैंक खाते में ही भेजी जाती है, जो आपके नाम पर हो।',
      p1t: 'नॉन-DBT या नॉन-आधार सीडेड खाता रिजेक्ट हो सकता है',
      p1b:
        'यदि आपका स्कॉलरशिप खाता आधार से लिंक या DBT सक्षम नहीं है, तो भुगतान फेल हो सकता है या वापस जा सकता है, जिससे स्कॉलरशिप में देरी या रद्द होने का खतरा रहता है।',
      p2t: 'DBT से पैसा सीधे आपके खाते में आता है',
      p2b:
        'DBT सक्षम, आधार-सीडेड खाते में स्कॉलरशिप सीधे आपके बैंक खाते में आती है – बीच में कोई बिचौलिया नहीं, पूरा ट्रैकिंग और पारदर्शिता।',
      p3t: 'लक्ष्य: एक सही, सक्रिय DBT सक्षम खाता',
      p3b:
        'अपने नाम पर एक सक्रिय बैंक खाता रखें, उसे आधार से लिंक करें, DBT सक्षम कराएं और बैंक में मोबाइल नंबर अपडेट रखें ताकि हर क्रेडिट की SMS सूचना मिल सके।',
      cta: 'फॉर्म भरना शुरू करें',
    },

    upload: {
      title: 'ज़रूरी दस्तावेज़ अपलोड करें',
      subtitle:
        'आधार, पासबुक, हस्ताक्षर और यदि हो तो DBT/स्कॉलरशिप फॉर्म PDF अपलोड करें।',
      aadhaarFront: 'आधार फ्रंट',
      aadhaarFrontDesc: 'आधार कार्ड के सामने वाले हिस्से की साफ़ फोटो अपलोड करें।',
      aadhaarBack: 'आधार बैक',
      aadhaarBackDesc: 'पते वाला पीछे का हिस्सा साफ़ दिखे ऐसी फोटो अपलोड करें।',
      passbook: 'पासबुक / बैंक की पहली पेज',
      passbookDesc: 'पहला पेज जिसमें IFSC, नाम और खाता नंबर साफ़ दिखें।',
      dbtForm: 'वैकल्पिक DBT फॉर्म (PDF)',
      dbtFormDesc: 'यदि आपके पास पहले से डाउनलोड किया हुआ फॉर्म है तो यहाँ अपलोड करें।',
      signature: 'हस्ताक्षर की इमेज',
      signatureDesc: 'कागज़ पर किए गए हस्ताक्षर की साफ़ स्कैन/फोटो अपलोड करें।',
      upload: 'अपलोड करें',
      changeFile: 'फ़ाइल बदलें',
      view: 'देखें',
      optional: 'वैकल्पिक दस्तावेज़',
      scanTitle: 'स्वचालित रूप से विवरण निकालें (OCR Scan)',
      scanTips: [
        'दस्तावेज़ को सपाट रखें और अच्छे प्रकाश में फोटो लें।',
        'आधार नंबर, खाता नंबर और IFSC साफ़ दिखाई देने चाहिए।',
        'अगले स्टेप में आप गलती होने पर जानकारी बदल सकते हैं।',
      ],
      scanNow: 'OCR स्कैन शुरू करें',
      scanning: 'स्कैन हो रहा है…',
    },

    verify: {
      title: 'निकाली गई जानकारी सत्यापित करें',
      subtitle:
        'ये जानकारी आपके दस्तावेज़ों से पढ़ी गई है। DBT फॉर्म बनाने से पहले इन्हें ध्यान से देख लें और गलती हो तो सुधार लें।',
      fullName: 'पूरा नाम',
      aadhaarNumber: 'आधार नंबर',
      accountNumber: 'बैंक खाता नंबर',
      ifscCode: 'IFSC कोड',
      bankName: 'बैंक का नाम',
      branchName: 'शाखा का नाम',
      mobileNumber: 'मोबाइल नंबर',
      email: 'ईमेल पता',
      optionsTitle: 'आप इस DBT रिक्वेस्ट से क्या करना चाहते हैं?',
      options: [
        { val: 'link_new', label: 'नए बैंक खाते से आधार लिंक करना' },
        { val: 'change_account', label: 'मौजूदा DBT खाता बदलना' },
        {
          val: 'dbt_only',
          label: 'पहले से आधार लिंक खाते पर केवल DBT सेवा सक्रिय करना',
        },
      ],
      confident: 'सही लग रहा है',
      check: 'कृपया जांचें',
      generate: 'DBT फॉर्म PDF बनाएं',
      generating: 'फॉर्म तैयार किया जा रहा है…',
    },

    bankGrid: {
      formReady: 'फॉर्म तैयार है! 🎉',
      successMessage:
        'आपका DBT आवेदन सफलतापूर्वक तैयार हो चुका है। भरा हुआ PDF डाउनलोड करें और अपने बैंक की आधिकारिक वेबसाइट या नज़दीकी शाखा में जमा करें। यह टूल केवल फॉर्म भरने में मदद करता है, सबमिट नहीं करता।',
      downloadPdf: 'भरा हुआ PDF डाउनलोड करें',
      findBankHelp: 'बैंक पोर्टल और सहायता देखें',
      completionNote: '100% फॉर्म पूरा • प्रिंट और सबमिशन के लिए तैयार',
      chooseBank: 'अपना बैंक चुनें',
      tapToView: 'बैंक देखने के लिए “बैंक पोर्टल और सहायता देखें” पर क्लिक करें',
      portalDescription:
        'बैंक के लोगो और आधिकारिक लिंक आपको आधार सीडिंग, DBT और स्कॉलरशिप के सही पोर्टल तक पहुंचाने में मदद करते हैं।',
      visitPortal: 'बैंक सहायता पोर्टल खोलें',
      whenClicked: 'ऊपर दिए गए बटन पर क्लिक करने के बाद बैंक विकल्प यहाँ दिखेंगे।',
      helpfulLinks: 'स्कॉलरशिप और DBT के लिए उपयोगी लिंक',
      helpfulLinksText:
        'आधार लिंकिंग, DBT स्थिति और SC/ST स्कॉलरशिप जानकारी के लिए इन आधिकारिक लिंक का उपयोग करें।',
      linkCentralDbt: 'केंद्रीय DBT पोर्टल – प्री/पोस्ट मैट्रिक SC/ST छात्रवृत्ति',
      linkAadhaarStatus: 'गाइड – आधार सीडिंग और DBT स्थिति जांचें',
      approvalNote:
        'अंतिम स्वीकृति और राशि आपके बैंक और सरकारी सत्यापन पर निर्भर करती है, इस टूल पर नहीं।',
    },
  },

  // ========= MARATHI ========= (only awareness for now; others fall back to English)
  mr: {
    awareness: {
      title: 'शिष्यवृत्तीसाठी आधार-संलग्न, DBT सक्षम बँक खाते',
      subtitle:
        'तुमची शिष्यवृत्ती फक्त आधार-सीडेड आणि DBT सक्षम, तुमच्या नावाच्या खात्यात जमा होते.',
      p1t: 'DBT नसलेली किंवा आधार-लिंक नसलेली खाती नाकारली जातात',
      p1b:
        'स्कॉलरशिप खाते आधार लिंक किंवा DBT सक्षम नसेल तर पेमेंट फेल होऊ शकते किंवा बँकेकडे परत जाऊ शकते आणि लाभ उशिरा मिळू शकतो.',
      p2t: 'DBT मुळे पैसे थेट तुमच्या खात्यात',
      p2b:
        'DBT सक्षम खात्यात शिष्यवृत्ती थेट तुमच्या बँक खात्यात जमा होते — कोणतेही मध्यस्थ नाहीत, पूर्ण पारदर्शकता.',
      p3t: 'तुमचे लक्ष्य: एक योग्य, सक्रिय DBT सक्षम खाते',
      p3b:
        'तुमच्या नावाने एक सक्रिय खाते ठेवा, आधार लिंक करा, DBT सक्षम करा आणि SMS अलर्टसाठी मोबाइल क्रमांक अपडेट ठेवा.',
      cta: 'फॉर्म भरणे सुरू करा',
    },
  },

  // ========= TAMIL =========
  ta: {
    awareness: {
      title:
        'உங்கள் உதவித்தொகைக்கான ஆதார் இணைக்கப்பட்ட, DBT செயலில் உள்ள வங்கி கணக்கு',
      subtitle:
        'உதவித்தொகை உங்கள் பெயரில் உள்ள ஆதார்-சீடு செய்யப்பட்ட, DBT செயல்படுத்தப்பட்ட வங்கி கணக்கிற்கே செலுத்தப்படும்.',
      p1t: 'DBT இல்லை அல்லது ஆதார் இணைக்காத கணக்குகள் நிராகரிக்கப்படும்',
      p1b:
        'உங்கள் கணக்கு ஆதாருடன் இணைக்கப்படாமல் அல்லது DBT இயலுமைப்படுத்தப்படாமல் இருந்தால், பணம் திரும்பிவிடலாம் அல்லது தாமதமாகலாம்.',
      p2t: 'DBT மூலம் பணம் நேராக உங்களுக்கு வருகிறது',
      p2b:
        'DBT செயல்படுத்தப்பட்ட கணக்கில் உதவித்தொகை நேராக உங்கள் வங்கி கணக்கில் வருகின்றது — நடுவில் யாரும் இல்லை, முழு வெளிப்படைத் தன்மை.',
      p3t: 'உங்கள் இலக்கு: ஒரு சரியான, செயலில் உள்ள DBT கணக்கு',
      p3b:
        'உங்கள் பெயரில் ஒரு செயல்படும் கணக்கை வைத்திருங்கள், ஆதாருடன் இணைக்கவும், DBT ஐ இயக்கவும், SMS எச்சரிக்கைகளுக்காக உங்கள் மொபைல் எண்ணை புதுப்பித்து வையுங்கள்.',
      cta: 'படிவத்தை நிரப்பத் தொடங்குங்கள்',
    },
  },

  // ========= TELUGU =========
  te: {
    awareness: {
      title: 'స్కాలర్‌షిప్ కోసం ఆధార్ లింక్ అయిన DBT ఖాతా',
      subtitle:
        'మీ స్కాలర్‌షిప్ మొత్తం మీ పేరుమీద ఉన్న ఆధార్-సీడ్‌డ్, DBT ఎనేబుల్‌డ్ బ్యాంకు ఖాతాలోకే జమ అవుతుంది.',
      p1t: 'DBT కాదు లేదా ఆధార్ లింక్ కాని ఖాతాలు తిరస్కరించబడవచ్చు',
      p1b:
        'ఆధార్ లింక్ లేదా DBT ఎనేబుల్ చేయని ఖాతాలో స్కాలర్‌షిప్ జమ కాకపోవచ్చు లేదా తిరిగి వెళ్ళిపోవచ్చు.',
      p2t: 'DBT వల్ల డబ్బు నేరుగా మీకే వస్తుంది',
      p2b:
        'DBT ఖాతాలో స్కాలర్‌షిప్ నేరుగా మీ బ్యాంకు ఖాతాలోకి వస్తుంది — మధ్యవర్తులు లేరు, స్పష్టమైన ట్రాకింగ్.',
      p3t: 'మీ లక్ష్యం: ఒక సరైన, యాక్టివ్ DBT ఖాతా',
      p3b:
        'మీ పేరుమీద ఒకే ఖాతాను యాక్టివ్‌గా ఉంచి, ఆధార్ లింక్ చేసి, DBT ఎనేబుల్ చేసి, SMS అలర్ట్‌ల కోసం మొబైల్ నంబర్‌ను అప్డేట్ చేయండి.',
      cta: 'ఫారమ్ నింపడం ప్రారంభించండి',
    },
  },

  // ========= GUJARATI =========
  gu: {
    awareness: {
      title: 'તમારી સ્કોલરશીપ માટે આધાર-લિંકડ, DBT સક્ષમ બેંક ખાતું',
      subtitle:
        'તમારી સ્કોલરશીપ માત્ર તમારા નામે આધાર સીડેડ અને DBT સક્ષમ બેંક ખાતામાં જ જમા થાય છે.',
      p1t: 'DBT વગર અથવા આધાર સીડેડ ન હોય તેવા ખાતા રિજેક્ટ થઈ શકે છે',
      p1b:
        'જો સ્કોલરશીપ ખાતું આધાર સાથે લિંક ન હોય અથવા DBT સક્ષમ ન હોય, તો પેમેન્ટ ફેઈલ થઈ શકે અથવા લેટ થઈ શકે છે.',
      p2t: 'DBTથી પૈસા સીધા તમારા ખાતામાં આવે છે',
      p2b:
        'DBT સક્ષમ खातામાં સ્કોલરશીપ સીધા તમારા ખાતામાં ક્રેડિટ થાય છે — કોઈ દલાલ નહીં, સંપૂર્ણ પારદર્શિતા.',
      p3t: 'તમારું લક્ષ્ય: એક યોગ્ય, એક્ટિવ DBT સક્ષમ ખાતું',
      p3b:
        'તમારા નામે એક સક્રિય બેંક ખાતું રાખો, તેને આધાર સાથે લિંક કરો, DBT સક્ષમ કરો અને SMS એલર્ટ માટે મોબાઇલ નંબર અપડેટ રાખો.',
      cta: 'ફોર્મ ભરવાનું શરૂ કરો',
    },
  },

  // ========= BENGALI =========
  bn: {
    awareness: {
      title:
        'আপনার স্কলারশিপের জন্য আধার-লিঙ্কড, DBT সক্রিয় ব্যাংক অ্যাকাউন্ট',
      subtitle:
        'স্কলারশিপ শুধুমাত্র আপনার নামে আধার-সীডেড, DBT সক্রিয় ব্যাংক অ্যাকাউন্টে পাঠানো হয়।',
      p1t: 'DBT নয় বা আধার লিঙ্ক না থাকা অ্যাকাউন্ট বাতিল হতে পারে',
      p1b:
        'যদি আপনার স্কলারশিপ অ্যাকাউন্ট আধারের সাথে লিঙ্ক ও DBT সক্রিয় না হয়, পেমেন্ট ব্যর্থ বা ফেরত যেতে পারে।',
      p2t: 'DBT টাকা সরাসরি আপনার কাছে পৌঁছে দেয়',
      p2b:
        'DBT সক্রিয় অ্যাকাউন্টে স্কলারশিপ সরাসরি আপনার ব্যাংক অ্যাকাউন্টে জমা হয় — কোনো মধ্যবর্তী নেই, সম্পূর্ণ স্বচ্ছতা।',
      p3t: 'লক্ষ্য: একটি সঠিক, সক্রিয় DBT অ্যাকাউন্ট',
      p3b:
        'নিজের নামে একটি সক্রিয় অ্যাকাউন্ট রাখুন, আধার লিঙ্ক করুন, DBT চালু করুন এবং SMS এলার্টের জন্য মোবাইল নম্বর আপডেট রাখুন।',
      cta: 'ফর্ম পূরণ শুরু করুন',
    },
  },

  // ========= KANNADA =========
  kn: {
    awareness: {
      title: 'ನಿಮ್ಮ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕೆ ಆಧಾರ್ ಲಿಂಕ್‌ ಮಾಡಿದ DBT ಬ್ಯಾಂಕ್ ಖಾತೆ',
      subtitle:
        'ವಿದ್ಯಾರ್ಥಿವೇತನವನ್ನು ನಿಮ್ಮ ಹೆಸರಿನ ಆಧಾರ್-ಸೀಡಾಯಿಸಿದ, DBT ಸಕ್ರಿಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಮಾತ್ರ ಜಮೆ ಮಾಡಲಾಗುತ್ತದೆ.',
      p1t: 'DBT ಇಲ್ಲದ ಅಥವಾ ಆಧಾರ್ ಲಿಂಕ್ ಇಲ್ಲದ ಖಾತೆ ತಿರಸ್ಕೃತವಾಗಬಹುದು',
      p1b:
        'ಖಾತೆ ಆಧಾರ್‌ ಗೆ ಲಿಂಕ್ ಆಗಿಲ್ಲದಿದ್ದರೆ ಅಥವಾ DBT ಸಕ್ರಿಯವಾಗದಿದ್ದರೆ ಪಾವತಿ ವಿಫಲವಾಗಬಹುದು ಅಥವಾ ಹಿಂದಿರುಗಬಹುದು.',
      p2t: 'DBT ಮೂಲಕ ಹಣ ನೇರವಾಗಿ ನಿಮ್ಮ ಖಾತೆಗೆ',
      p2b:
        'DBT ಸಕ್ರಿಯ ಖಾತೆಯಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿವೇತನ ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಆಗುತ್ತದೆ — ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ, ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆ.',
      p3t: 'ನಿಮ್ಮ ಗುರಿ: ಒಂದು ಸರಿಯಾದ, ಸಕ್ರಿಯ DBT ಖಾತೆ',
      p3b:
        'ನಿಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಒಂದು ಸಕ್ರಿಯ ಖಾತೆ ಇಟ್ಟುಕೊಳ್ಳಿ, ಆಧಾರ್ ಲಿಂಕ್ ಮಾಡಿ, DBT ಸಕ್ರಿಯ ಮಾಡಿ ಮತ್ತು SMS ಸೂಚನೆಗಾಗಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನವೀಕರಿಸಿ.',
      cta: 'ಫಾರ್ಮ್ ಭರ್ತಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ',
    },
  },

  // ========= MALAYALAM =========
  ml: {
    awareness: {
      title:
        'നിങ്ങളുടെ സ്കോളർഷിപ്പിനായി ആധാർ-ലിങ്ക് ചെയ്ത DBT സജീവ ബാങ്ക് അക്കൗണ്ട്',
      subtitle:
        'നിങ്ങളുടെ പേരിലുള്ള ആധാർ സീഡഡ്, DBT സജ്ജീകരിച്ച ബാങ്ക് അക്കൗണ്ടിലേക്കാണ് സ്കോളർഷിപ്പ് തുക എത്തുന്നത്.',
      p1t: 'DBT ഇല്ലാത്ത / ആധാർ ലിങ്ക് ചെയ്യാത്ത അക്കൗണ്ടുകൾ നിരസിക്കാം',
      p1b:
        'അക്കൗണ്ട് ആധാറുമായി ലിങ്ക് ചെയ്തിട്ടില്ലെങ്കിൽ അല്ലെങ്കിൽ DBT സജീവമല്ലെങ്കിൽ, പണമടയ്ക്കൽ പരാജയപ്പെടാനോ മടങ്ങിപ്പോകാനോ സാധ്യതയുണ്ട്.',
      p2t: 'DBT വഴി പണം നേരിട്ട് നിങ്ങളിലേക്കാണ് എത്തുന്നത്',
      p2b:
        'DBT പ്രവർത്തിക്കുന്ന അക്കൗണ്ടിൽ സ്കോളർഷിപ്പ് നേരിട്ട് നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ടിൽ ക്രെഡിറ്റ് ചെയ്യും — ഇടനിലക്കാരില്ല, പൂർണ്ണ സുതാര്യത.',
      p3t: 'നിങ്ങളുടെ ലക്ഷ്യം: സ്ഥിരമായി പ്രവർത്തിക്കുന്ന DBT അക്കൗണ്ട്',
      p3b:
        'നിങ്ങളുടെ പേരിൽ ഒരു സജീവ അക്കൗണ്ട് നിലനിർത്തുക, ആധാർ ലിങ്ക് ചെയ്യുക, DBT സജീവമാക്കുക, SMS അലർട്ടിനായി മൊബൈൽ നമ്പർ അപ്‌ഡേറ്റ് ചെയ്‌തു വെക്കുക.',
      cta: 'ഫോം പൂരിപ്പിക്കൽ ആരംഭിക്കുക',
    },
  },

  // ========= PUNJABI =========
  pa: {
    awareness: {
      title:
        'ਤੁਹਾਡੇ ਸਕਾਲਰਸ਼ਿਪ ਲਈ ਆਧਾਰ-ਲਿੰਕਡ, DBT ਸਮਰੱਥ ਬੈਂਕ ਖਾਤਾ',
      subtitle:
        'ਤੁਹਾਡੀ ਸਕਾਲਰਸ਼ਿਪ ਸਿਰਫ਼ ਤੁਹਾਡੇ ਨਾਮ ਵਾਲੇ ਆਧਾਰ-ਸੀਡਡ, DBT ਖਾਤੇ ਵਿੱਚ ਹੀ ਆਉਂਦੀ ਹੈ।',
      p1t: 'DBT ਨਾ ਹੋਣ ਜਾਂ ਆਧਾਰ ਨਾ ਲਿੰਕ ਹੋਣ ’ਤੇ ਖਾਤਾ ਰੱਦ ਹੋ ਸਕਦਾ ਹੈ',
      p1b:
        'ਜੇ ਸਕਾਲਰਸ਼ਿਪ ਵਾਲਾ ਖਾਤਾ ਆਧਾਰ ਨਾਲ ਲਿੰਕ ਨਹੀਂ ਜਾਂ DBT ਸਮਰੱਥ ਨਹੀਂ, ਤਾਂ ਭੁਗਤਾਨ ਫੇਲ ਹੋ ਸਕਦਾ ਜਾਂ ਵਾਪਸ ਜਾ ਸਕਦਾ ਹੈ।',
      p2t: 'DBT ਨਾਲ ਪੈਸਾ ਸਿੱਧਾ ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ',
      p2b:
        'DBT ਖਾਤੇ ਵਿੱਚ ਸਕਾਲਰਸ਼ਿਪ ਸਿੱਧਾ ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਆਉਂਦੀ ਹੈ — ਕੋਈ ਦਲਾਲ ਨਹੀਂ, ਪੂਰੀ ਪਾਰਦਰਸ਼ਤਾ।',
      p3t: 'ਲੱਖ: ਇੱਕ ਸਹੀ, ਸਰਗਰਮ DBT ਖਾਤਾ',
      p3b:
        'ਆਪਣੇ ਨਾਮ ’ਤੇ ਇੱਕ ਐਕਟਿਵ ਖਾਤਾ ਰੱਖੋ, ਆਧਾਰ ਲਿੰਕ ਕਰੋ, DBT ਚਾਲੂ ਕਰੋ ਅਤੇ SMS ਅਲਰਟ ਲਈ ਮੋਬਾਈਲ ਨੰਬਰ ਅਪਡੇਟ ਰੱਖੋ।',
      cta: 'ਫਾਰਮ ਭਰਨਾ ਸ਼ੁਰੂ ਕਰੋ',
    },
  },
};

// 🔗 External links for DBT & Aadhaar info
export const EXTERNAL_LINKS = {
  centralDbtSchemes:
    'https://dbtbharat.gov.in/beneficiary-category/schemes?bci=MQ%3D%3D',
  aadhaarDbtStatus: 'https://cleartax.in/s/aadhaar-dbt-status-check',
};

// 🏦 Bank list used by BankGrid.tsx
export const BANKS: Bank[] = [
  {
    id: 'sbi',
    name: 'State Bank of India',
    logo:
      'https://static.vecteezy.com/system/resources/previews/017/110/038/original/sbi-logo-on-white-background-free-vector.jpg',
    caption: 'SBI – Aadhaar linking, DBT & scholarship help.',
    redirect:
      'https://sbi.bank.in/web/personal-banking/misc/bharat-aadhaar-seeding-enabler',
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    logo:
      'https://static.vecteezy.com/system/resources/previews/019/909/433/large_2x/punjab-national-bank-transparent-pnb-free-free-png.png',
    caption: 'PNB – OTP based Aadhaar seeding & DBT linking.',
    redirect: 'https://pnbgateway.pnbibanking.in/Aadhaar/',
  },
  {
    id: 'boi',
    name: 'Bank of India',
    logo:'https://vectorseek.com/wp-content/uploads/2023/11/BOI-Bank-of-India-Logo-Vector.svg-.png',
    caption: 'Bank of India – Aadhaar linking / DBT related info.',
    redirect:
      'https://bankofindia.bank.in/public-financial-management-system-pfms',
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    logo:
      'https://tse3.mm.bing.net/th/id/OIP.yRgj8MO5AEWOBMJnS3QPPwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
    caption: 'Canara Bank – Aadhaar seeding & DBT support.',
    redirect:
      'https://epayment.canarabank.bank.in/BASE_aadhaarseeding/Home.aspx',
  },
  {
    id: 'unionbank',
    name: 'Union Bank of India',
    logo:
      'https://bl-i.thgim.com/public/companies/w87qj4/article29099446.ece/alternates/FREE_1200/Union-Bank-of-India-Logojpg',
    caption: 'Union Bank – DBT-enabled accounts for government schemes.',
    redirect:
      'https://www.unionbankofindia.bank.in/en/listing/check-your-aadhaar-linked-status#main_content',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    logo:
      'https://static.vecteezy.com/system/resources/previews/026/555/515/original/hdfc-bank-logo-free-vector.jpg',
    caption: 'HDFC – Aadhaar seeding to receive DBT/subsidies directly.',
    redirect:
      'https://instaservices.hdfcbank.com/?journey=103&LG=&LC=&source_type=103',
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    logo:
      'https://images.squarespace-cdn.com/content/v1/615d49381039bd7c9ae9626b/e18becc9-ae54-4ca6-a684-df4208860082/axis.jpeg',
    caption: 'Axis Bank – Aadhaar linking for DBT/subsidy credit.',
    redirect: 'https://www.axis.bank.in/bharat-aadhaar-seeding-enabler',
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    logo:
      'https://static.vecteezy.com/system/resources/previews/020/336/263/original/icici-logo-icici-icon-free-free-vector.jpg',
    caption: 'ICICI – Aadhaar/UID linking to receive DBT payments.',
    redirect:
      'https://www.icici.bank.in/personal-banking/steps-to-update-aadhaar/aadhar-reseeding',
  },
];
