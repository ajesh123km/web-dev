import { ChitScheme } from '../types';

export const CHIT_SCHEMES: ChitScheme[] = [
  {
    id: 'scheme-1-lakh',
    nameEn: '₹1,00,000 Chit Scheme',
    nameTa: '₹1,00,000 சீட்டு திட்டம் (1 லக்)',
    chitValue: 100000,
    chitValueFormatted: '₹1,00,000',
    chitValueFormattedTa: '₹1,00,000',
    durationMonths: 20,
    firstMonthInstalment: 5000,
    minInstalment: 4150,
    maxInstalment: 5000,
    totalInstalmentsPaid: 90375,
    dividendBenefit: 9625,
    promptBonus: 2000,
    lastMonthBonus: 400,
    totalBonus: 2400,
    taglineEn: 'Ideal for disciplined individual savings, household planning, and festival preparedness.',
    taglineTa: 'தனிநபர் சேமிப்பு, குடும்ப திட்டமிடல் மற்றும் திருவிழா செலவுகளுக்கு ஏற்ற சிறந்த திட்டம்.',
    documentImage: '/images/1-lakh-scheme.jpeg',
    rulesEn: [
      'Instalment Payment: Monthly instalments can be paid directly or via bank transfer on or before the 10th of every month. Bank transfer is preferred; account details shared separately.',
      'Late Fee: If the instalment is not paid on or before the 10th, a late fee of ₹20 per delayed day will be added.',
      'Draw / Auction: Conducted on the 11th of every month. If a member voluntarily requests on or before the 10th, the amount will be disbursed to them. If 2 or more members request, selection will be conducted by lucky draw (குலுக்கல்).',
      'Disbursement: The prize amount is disbursed to the selected member on or before the 25th of the month.',
      'Guarantors & Documents: The recipient must provide 2 persons as co-signers/guarantors to sign, submit 2 blank cheques, and furnish all required KYC documents and collateral documents as per government rules.',
      'Mode of Payment: Disbursed via Cheque or direct Bank Transfer to the selected member.',
      'Statutory Compliance: Any changes or amendments issued by the government or the company must be strictly complied with by members.',
      'Prompt Payment Bonus: All members who regularly pay their instalments on or before the 10th of every month receive a special BONUS of ₹2,000 at chit conclusion.',
      'Last Month Special Benefit: For the member taking the chit in the final (20th) month, if all previous monthly instalments were paid on time, an additional ₹400 is given (Total: ₹2,000 + ₹400 = ₹2,400).'
    ],
    rulesTa: [
      'தவணை தொகை செலுத்துதல்: தவணை தொகையை ஒவ்வொரு மாதமும் 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ நேரடியாகவோ அல்லது வங்கி பரிமாற்றம் மூலமாகவோ செலுத்தலாம். உறுப்பினர்கள் வங்கி பரிமாற்றம் மூலம் பணம் செலுத்த முன்னுரிமை வழங்க வேண்டும். வங்கி கணக்கு விவரங்கள் தனியாக பகிரப்படும்.',
      'தாமத கட்டணம்: 10-ஆம் தேதிக்கு அல்லது அதற்கு முன் தவணை தொகை செலுத்தப்படாடல், தாமதமான ஒவ்வொரு நாளுக்கும் ₹20 வீதம் தாமத கட்டணம் சேர்த்து செலுத்த வேண்டும்.',
      'குலுக்கல் / ஏலம்: ஒவ்வொரு மாதமும் 11-ஆம் தேதி குலுக்கல்/ஏலம் நடைபெறும். ஒருவர் தானாக முன்வந்து 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ கேட்டால் அவருக்கு தொகை வழங்கப்படும். இரண்டு அல்லது அதற்கு மேற்பட்டவர்கள் கேட்டால் குலுக்கல் முறையில் ஒருவர் தேர்வு செய்யப்படுவார்.',
      'தொகை வழங்குதல்: குலுக்கல்/ஏலம் முறையில் தேர்வு செய்யப்பட்ட நபருக்கு ஒவ்வொரு மாதமும் 25-ஆம் தேதிக்குள் (அல்லது அதற்கு முன்) தொகை வழங்கப்படும்.',
      'உத்தரவாதம், ஆவணங்கள் மற்றும் காசோலைகள்: பணம் பெறுபவர் 2 பேரை உத்தரவாத கையொப்பம் இட கொண்டு வர வேண்டும். 2 வெற்று காசோலைகள் (BLANK CHEQUES) வழங்கப்பட வேண்டும். மேலும், அரசாங்க விதிகளின்படி தேவையான அனைத்து ஆவணங்களும் (KYC ஆவணங்கள் மற்றும் தேவையானால் கொலாட்டரல் ஆவணங்கள்) கட்டாயமாக வழங்கப்பட வேண்டும்.',
      'பணம் வழங்கும் முறை: குலுக்கலில் தேர்வு செய்யப்பட்ட நபருக்கு தொகை காசோலை அல்லது வங்கி பரிமாற்றம் மூலமாகவோ வழங்கப்படும்.',
      'அரசாங்க விதிமுறைகள்: அரசாங்கம் அல்லது நிறுவனத்திலிருந்து ஏதேனும் மாற்றங்கள், திருத்தங்கள் அல்லது புதிய விதிமுறைகள் அறிவிக்கப்பட்டால், அவற்றை உறுப்பினர்கள் கட்டாயமாக பின்பற்ற வேண்டும்.',
      'சிறப்பு ஊக்கத்தொகை (BONUS): ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணை தொகையை முறையாக செலுத்திய அனைத்து உறுப்பினர்களுக்கும், சீட்டு முடிவடைந்த பின் ₹2,000 வழங்கப்படும்.',
      'கடைசி மாத சிறப்பு நன்மை: கடைசி மாதத்தில் சீட்டு பெறுபவருக்கு மட்டும், அனைத்து மாதங்களிலும் தவணை தொகையை கடைசி தேதிக்குள் செலுத்தியிருந்தால், கூடுதலாக ₹400 வழங்கப்படும். (மொத்தம்: ₹2,000 + ₹400 = ₹2,400).'
    ],
    schedule: [
      { month: 1, instalment: 5000, chitAmount: 95000 },
      { month: 2, instalment: 4150, chitAmount: 78000 },
      { month: 3, instalment: 4170, chitAmount: 78400 },
      { month: 4, instalment: 4200, chitAmount: 79000 },
      { month: 5, instalment: 4220, chitAmount: 79400 },
      { month: 6, instalment: 4250, chitAmount: 80000 },
      { month: 7, instalment: 4280, chitAmount: 80600 },
      { month: 8, instalment: 4310, chitAmount: 81200 },
      { month: 9, instalment: 4350, chitAmount: 82000 },
      { month: 10, instalment: 4400, chitAmount: 83000 },
      { month: 11, instalment: 4420, chitAmount: 83400 },
      { month: 12, instalment: 4450, chitAmount: 84000 },
      { month: 13, instalment: 4500, chitAmount: 85000 },
      { month: 14, instalment: 4575, chitAmount: 86500 },
      { month: 15, instalment: 4650, chitAmount: 88000 },
      { month: 16, instalment: 4750, chitAmount: 90000 },
      { month: 17, instalment: 4850, chitAmount: 92000 },
      { month: 18, instalment: 4900, chitAmount: 93000 },
      { month: 19, instalment: 4950, chitAmount: 94000 },
      { month: 20, instalment: 5000, chitAmount: 95000 }
    ]
  },
  {
    id: 'scheme-2-lakh',
    nameEn: '₹2,00,000 Chit Scheme',
    nameTa: '₹2,00,000 சீட்டு திட்டம் (2 லக்)',
    chitValue: 200000,
    chitValueFormatted: '₹2,00,000',
    chitValueFormattedTa: '₹2,00,000',
    durationMonths: 20,
    firstMonthInstalment: 10000,
    minInstalment: 8300,
    maxInstalment: 10000,
    totalInstalmentsPaid: 180750,
    dividendBenefit: 19250,
    promptBonus: 4000,
    lastMonthBonus: 800,
    totalBonus: 4800,
    taglineEn: 'Our most popular scheme for family milestones, medical contingencies, and education funds.',
    taglineTa: 'குடும்ப நிகழ்வுகள், கல்விச் செலவுகள் மற்றும் அவசர நிதிக்கான வாடிக்கையாளர்களின் விருப்பத் திட்டம்.',
    documentImage: '/images/2-lakh-scheme.jpeg',
    rulesEn: [
      'Instalment Payment: Monthly instalments can be paid directly or via bank transfer on or before the 10th of every month. Bank transfer is preferred; account details shared separately.',
      'Late Fee: If the instalment is not paid on or before the 10th, a late fee of ₹20 per delayed day will be added.',
      'Draw / Auction: Conducted on the 11th of every month. If a member voluntarily requests on or before the 10th, the amount will be disbursed to them. If 2 or more members request, selection will be conducted by lucky draw (குலுக்கல்).',
      'Disbursement: The prize amount is disbursed to the selected member on or before the 25th of the month.',
      'Guarantors & Documents: The recipient must provide 2 persons as co-signers/guarantors to sign, submit 2 blank cheques, and furnish all required KYC documents and collateral documents as per government rules.',
      'Mode of Payment: Disbursed via Cheque or direct Bank Transfer to the selected member.',
      'Statutory Compliance: Any changes or amendments issued by the government or the company must be strictly complied with by members.',
      'Prompt Payment Bonus: All members who regularly pay their instalments on or before the 10th of every month receive a special BONUS of ₹4,000 at chit conclusion.',
      'Last Month Special Benefit: For the member taking the chit in the final (20th) month, if all previous monthly instalments were paid on time, an additional ₹800 is given (Total: ₹4,000 + ₹800 = ₹4,800).'
    ],
    rulesTa: [
      'தவணை தொகை செலுத்துதல்: தவணை தொகையை ஒவ்வொரு மாதமும் 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ நேரடியாகவோ அல்லது வங்கி பரிமாற்றம் மூலமாகவோ செலுத்தலாம். உறுப்பினர்கள் வங்கி பரிமாற்றம் மூலம் பணம் செலுத்த முன்னுரிமை வழங்க வேண்டும். வங்கி கணக்கு விவரங்கள் தனியாக பகிரப்படும்.',
      'தாமத கட்டணம்: 10-ஆம் தேதிக்கு அல்லது அதற்கு முன் தவணை தொகை செலுத்தப்படாடல், தாமதமான ஒவ்வொரு நாளுக்கும் ₹20 வீதம் தாமத கட்டணம் சேர்த்து செலுத்த வேண்டும்.',
      'குலுக்கல் / ஏலம்: ஒவ்வொரு மாதமும் 11-ஆம் தேதி குலுக்கல்/ஏலம் நடைபெறும். ஒருவர் தானாக முன்வந்து 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ கேட்டால் அவருக்கு தொகை வழங்கப்படும். இரண்டு அல்லது அதற்கு மேற்பட்டவர்கள் கேட்டால் குலுக்கல் முறையில் ஒருவர் தேர்வு செய்யப்படுவார்.',
      'தொகை வழங்குதல்: குலுக்கல்/ஏலம் முறையில் தேர்வு செய்யப்பட்ட நபருக்கு ஒவ்வொரு மாதமும் 25-ஆம் தேதிக்குள் (அல்லது அதற்கு முன்) தொகை வழங்கப்படும்.',
      'உத்தரவாதம், ஆவணங்கள் மற்றும் காசோலைகள்: பணம் பெறுபவர் 2 பேரை உத்தரவாத கையொப்பம் இட கொண்டு வர வேண்டும். 2 வெற்று காசோலைகள் (BLANK CHEQUES) வழங்கப்பட வேண்டும். மேலும், அரசாங்க விதிகளின்படி தேவையான அனைத்து ஆவணங்களும் (KYC ஆவணங்கள் மற்றும் தேவையானால் கொலாட்டரல் ஆவணங்கள்) கட்டாயமாக வழங்கப்பட வேண்டும்.',
      'பணம் வழங்கும் முறை: குலுக்கலில் தேர்வு செய்யப்பட்ட நபருக்கு தொகை காசோலை அல்லது வங்கி பரிமாற்றம் மூலமாகவோ வழங்கப்படும்.',
      'அரசாங்க விதிமுறைகள்: அரசாங்கம் அல்லது நிறுவனத்திலிருந்து ஏதேனும் மாற்றங்கள், திருத்தங்கள் அல்லது புதிய விதிமுறைகள் அறிவிக்கப்பட்டால், அவற்றை உறுப்பினர்கள் கட்டாயமாக பின்பற்ற வேண்டும்.',
      'சிறப்பு ஊக்கத்தொகை (BONUS): ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணை தொகையை முறையாக செலுத்திய அனைத்து உறுப்பினர்களுக்கும், சீட்டு முடிவடைந்த பின் ₹4,000 வழங்கப்படும்.',
      'கடைசி மாத சிறப்பு நன்மை: கடைசி மாதத்தில் சீட்டு பெறுபவருக்கு மட்டும், அனைத்து மாதங்களிலும் தவணை தொகையை கடைசி தேதிக்குள் செலுத்தியிருந்தால், கூடுதலாக ₹800 வழங்கப்படும். (மொத்தம்: ₹4,000 + ₹800 = ₹4,800).'
    ],
    schedule: [
      { month: 1, instalment: 10000, chitAmount: 190000 },
      { month: 2, instalment: 8300, chitAmount: 156000 },
      { month: 3, instalment: 8340, chitAmount: 156800 },
      { month: 4, instalment: 8400, chitAmount: 158000 },
      { month: 5, instalment: 8440, chitAmount: 158800 },
      { month: 6, instalment: 8500, chitAmount: 160000 },
      { month: 7, instalment: 8560, chitAmount: 161200 },
      { month: 8, instalment: 8620, chitAmount: 162400 },
      { month: 9, instalment: 8700, chitAmount: 164000 },
      { month: 10, instalment: 8800, chitAmount: 166000 },
      { month: 11, instalment: 8840, chitAmount: 166800 },
      { month: 12, instalment: 8900, chitAmount: 168000 },
      { month: 13, instalment: 9000, chitAmount: 170000 },
      { month: 14, instalment: 9150, chitAmount: 173000 },
      { month: 15, instalment: 9300, chitAmount: 176000 },
      { month: 16, instalment: 9500, chitAmount: 180000 },
      { month: 17, instalment: 9700, chitAmount: 184000 },
      { month: 18, instalment: 9800, chitAmount: 186000 },
      { month: 19, instalment: 9900, chitAmount: 188000 },
      { month: 20, instalment: 10000, chitAmount: 190000 }
    ]
  },
  {
    id: 'scheme-5-lakh',
    nameEn: '₹5,00,000 Chit Scheme',
    nameTa: '₹5,00,000 சீட்டு திட்டம் (5 லக்)',
    chitValue: 500000,
    chitValueFormatted: '₹5,00,000',
    chitValueFormattedTa: '₹5,00,000',
    durationMonths: 20,
    firstMonthInstalment: 25000,
    minInstalment: 20750,
    maxInstalment: 25000,
    totalInstalmentsPaid: 451875,
    dividendBenefit: 48125,
    promptBonus: 10000,
    lastMonthBonus: 2000,
    totalBonus: 12000,
    taglineEn: 'High-value scheme engineered for small business working capital, asset purchase, and property development.',
    taglineTa: 'சிறு தொழில் மூலதனம், சொத்து உருவாக்கம் மற்றும் வணிக விரிவாக்கத்திற்கான பிரீமியம் திட்டம்.',
    documentImage: '/images/5-lakh-scheme.jpeg',
    rulesEn: [
      'Instalment Payment: Monthly instalments can be paid directly or via bank transfer on or before the 10th of every month. Bank transfer is preferred; account details shared separately.',
      'Late Fee: If the instalment is not paid on or before the 10th, a late fee of ₹20 per delayed day will be added.',
      'Draw / Auction: Conducted on the 11th of every month. If a member voluntarily requests on or before the 10th, the amount will be disbursed to them. If 2 or more members request, selection will be conducted by lucky draw (குலுக்கல்).',
      'Disbursement: The prize amount is disbursed to the selected member on or before the 25th of the month.',
      'Guarantors & Documents: The recipient must provide 2 persons as co-signers/guarantors to sign, submit 2 blank cheques, and furnish all required KYC documents and collateral documents as per government rules.',
      'Mode of Payment: Disbursed via Cheque or direct Bank Transfer to the selected member.',
      'Statutory Compliance: Any changes or amendments issued by the government or the company must be strictly complied with by members.',
      'Prompt Payment Bonus: All members who regularly pay their instalments on or before the 10th of every month receive a special BONUS of ₹10,000 at chit conclusion.',
      'Last Month Special Benefit: For the member taking the chit in the final (20th) month, if all previous monthly instalments were paid on time, an additional ₹2,000 is given (Total: ₹10,000 + ₹2,000 = ₹12,000).'
    ],
    rulesTa: [
      'தவணை தொகை செலுத்துதல்: தவணை தொகையை ஒவ்வொரு மாதமும் 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ நேரடியாகவோ அல்லது வங்கி பரிமாற்றம் மூலமாகவோ செலுத்தலாம். உறுப்பினர்கள் வங்கி பரிமாற்றம் மூலம் பணம் செலுத்த முன்னுரிமை வழங்க வேண்டும். வங்கி கணக்கு விவரங்கள் தனியாக பகிரப்படும்.',
      'தாமத கட்டணம்: 10-ஆம் தேதிக்கு அல்லது அதற்கு முன் தவணை தொகை செலுத்தப்படாடல், தாமதமான ஒவ்வொரு நாளுக்கும் ₹20 வீதம் தாமத கட்டணம் சேர்த்து செலுத்த வேண்டும்.',
      'குலுக்கல் / ஏலம்: ஒவ்வொரு மாதமும் 11-ஆம் தேதி குலுக்கல்/ஏலம் நடைபெறும். ஒருவர் தானாக முன்வந்து 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ கேட்டால் அவருக்கு தொகை வழங்கப்படும். இரண்டு அல்லது அதற்கு மேற்பட்டவர்கள் கேட்டால் குலுக்கல் முறையில் ஒருவர் தேர்வு செய்யப்படுவார்.',
      'தொகை வழங்குதல்: குலுக்கல்/ஏலம் முறையில் தேர்வு செய்யப்பட்ட நபருக்கு ஒவ்வொரு மாதமும் 25-ஆம் தேதிக்குள் (அல்லது அதற்கு முன்) தொகை வழங்கப்படும்.',
      'உத்தரவாதம், ஆவணங்கள் மற்றும் காசோலைகள்: பணம் பெறுபவர் 2 பேரை உத்தரவாத கையொப்பம் இட கொண்டு வர வேண்டும். 2 வெற்று காசோலைகள் (BLANK CHEQUES) வழங்கப்பட வேண்டும். மேலும், அரசாங்க விதிகளின்படி தேவையான அனைத்து ஆவணங்களும் (KYC ஆவணங்கள் மற்றும் தேவையானால் கொலாட்டரல் ஆவணங்கள்) கட்டாயமாக வழங்கப்பட வேண்டும்.',
      'பணம் வழங்கும் முறை: குலுக்கலில் தேர்வு செய்யப்பட்ட நபருக்கு தொகை காசோலை அல்லது வங்கி பரிமாற்றம் மூலமாகவோ வழங்கப்படும்.',
      'அரசாங்க விதிமுறைகள்: அரசாங்கம் அல்லது நிறுவனத்திலிருந்து ஏதேனும் மாற்றங்கள், திருத்தங்கள் அல்லது புதிய விதிமுறைகள் அறிவிக்கப்பட்டால், அவற்றை உறுப்பினர்கள் கட்டாயமாக பின்பற்ற வேண்டும்.',
      'சிறப்பு ஊக்கத்தொகை (BONUS): ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணை தொகையை முறையாக செலுத்திய அனைத்து உறுப்பினர்களுக்கும், சீட்டு முடிவடைந்த பின் ₹10,000 வழங்கப்படும்.',
      'கடைசி மாத சிறப்பு நன்மை: கடைசி மாதத்தில் சீட்டு பெறுபவருக்கு மட்டும், அனைத்து மாதங்களிலும் தவணை தொகையை கடைசி தேதிக்குள் செலுத்தியிருந்தால், கூடுதலாக ₹2,000 வழங்கப்படும். (மொத்தம்: ₹10,000 + ₹2,000 = ₹12,000).'
    ],
    schedule: [
      { month: 1, instalment: 25000, chitAmount: 475000 },
      { month: 2, instalment: 20750, chitAmount: 390000 },
      { month: 3, instalment: 20850, chitAmount: 392000 },
      { month: 4, instalment: 21000, chitAmount: 395000 },
      { month: 5, instalment: 21100, chitAmount: 397000 },
      { month: 6, instalment: 21250, chitAmount: 400000 },
      { month: 7, instalment: 21400, chitAmount: 403000 },
      { month: 8, instalment: 21550, chitAmount: 406000 },
      { month: 9, instalment: 21750, chitAmount: 410000 },
      { month: 10, instalment: 22000, chitAmount: 415000 },
      { month: 11, instalment: 22100, chitAmount: 417000 },
      { month: 12, instalment: 22250, chitAmount: 420000 },
      { month: 13, instalment: 22500, chitAmount: 425000 },
      { month: 14, instalment: 22875, chitAmount: 432500 },
      { month: 15, instalment: 23250, chitAmount: 440000 },
      { month: 16, instalment: 23750, chitAmount: 450000 },
      { month: 17, instalment: 24250, chitAmount: 460000 },
      { month: 18, instalment: 24500, chitAmount: 465000 },
      { month: 19, instalment: 24750, chitAmount: 470000 },
      { month: 20, instalment: 25000, chitAmount: 475000 }
    ]
  },
  {
    id: 'scheme-10-lakh',
    schemeCode: 'TSC-10L-20M',
    nameEn: '₹10,00,000 Chit Scheme',
    nameTa: '₹10,00,000 சீட்டு திட்டம் (10 லக்)',
    chitValue: 1000000,
    chitValueFormatted: '₹10,00,000',
    chitValueFormattedTa: '₹10,00,000',
    durationMonths: 20,
    availableDurations: [20],
    firstMonthInstalment: 50000,
    minInstalment: 41500,
    maxInstalment: 50000,
    totalInstalmentsPaid: 903750,
    dividendBenefit: 96250,
    promptBonus: 20000,
    lastMonthBonus: 4000,
    totalBonus: 24000,
    taglineEn: 'Enterprise-scale 20-month chit plan built for commercial expansion, real estate milestones, and major capital needs.',
    taglineTa: 'பெரிய வணிக விரிவாக்கம், சொத்து வாங்குதல் மற்றும் பெருந்தொகை மூலதனத் தேவைகளுக்கான 20 மாத பிரத்யேக திட்டம்.',
    documentImage: '/images/5-lakh-scheme.jpeg',
    status: 'active',
    version: 1,
    rulesEn: [
      'Instalment Payment: Monthly instalments can be paid directly or via bank transfer on or before the 10th of every month. Bank transfer is preferred; account details shared separately.',
      'Late Fee: If the instalment is not paid on or before the 10th, a late fee of ₹20 per delayed day will be added.',
      'Draw / Auction: Conducted on the 11th of every month. If a member voluntarily requests on or before the 10th, the amount will be disbursed to them. If 2 or more members request, selection will be conducted by lucky draw (குலுக்கல்).',
      'Disbursement: The prize amount is disbursed to the selected member on or before the 25th of the month.',
      'Guarantors & Documents: The recipient must provide 2 persons as co-signers/guarantors to sign, submit 2 blank cheques, and furnish all required KYC documents and collateral documents as per government rules.',
      'Mode of Payment: Disbursed via Cheque or direct Bank Transfer to the selected member.',
      'Statutory Compliance: Any changes or amendments issued by the government or the company must be strictly complied with by members.',
      'Prompt Payment Bonus: All members who regularly pay their instalments on or before the 10th of every month receive a special BONUS of ₹20,000 at chit conclusion.',
      'Last Month Special Benefit: For the member taking the chit in the final (20th) month, if all previous monthly instalments were paid on time, an additional ₹4,000 is given (Total: ₹20,000 + ₹4,000 = ₹24,000).'
    ],
    rulesTa: [
      'தவணை தொகை செலுத்துதல்: தவணை தொகையை ஒவ்வொரு மாதமும் 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ நேரடியாகவோ அல்லது வங்கி பரிமாற்றம் மூலமாகவோ செலுத்தலாம். உறுப்பினர்கள் வங்கி பரிமாற்றம் மூலம் பணம் செலுத்த முன்னுரிமை வழங்க வேண்டும். வங்கி கணக்கு விவரங்கள் தனியாக பகிரப்படும்.',
      'தாமத கட்டணம்: 10-ஆம் தேதிக்கு அல்லது அதற்கு முன் தவணை தொகை செலுத்தப்படாவிட்டால், தாமதமான ஒவ்வொரு நாளுக்கும் ₹20 வீதம் தாமத கட்டணம் சேர்த்து செலுத்த வேண்டும்.',
      'குலுக்கல் / ஏலம்: ஒவ்வொரு மாதமும் 11-ஆம் தேதி குலுக்கல்/ஏலம் நடைபெறும். ஒருவர் தானாக முன்வந்து 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ கேட்டால் அவருக்கு தொகை வழங்கப்படும். இரண்டு அல்லது அதற்கு மேற்பட்டவர்கள் கேட்டால் குலுக்கல் முறையில் ஒருவர் தேர்வு செய்யப்படுவார்.',
      'தொகை வழங்குதல்: குலுக்கல்/ஏலம் முறையில் தேர்வு செய்யப்பட்ட நபருக்கு ஒவ்வொரு மாதமும் 25-ஆம் தேதிக்குள் (அல்லது அதற்கு முன்) தொகை வழங்கப்படும்.',
      'உத்தரவாதம், ஆவணங்கள் மற்றும் காசோலைகள்: பணம் பெறுபவர் 2 பேரை உத்தரவாத கையொப்பம் இட கொண்டு வர வேண்டும். 2 வெற்று காசோலைகள் (BLANK CHEQUES) வழங்கப்பட வேண்டும். மேலும், அரசாங்க விதிகளின்படி தேவையான அனைத்து ஆவணங்களும் (KYC ஆவணங்கள் மற்றும் தேவையானால் கொலாட்டரல் ஆவணங்கள்) கட்டாயமாக வழங்கப்பட வேண்டும்.',
      'பணம் வழங்கும் முறை: குலுக்கலில் தேர்வு செய்யப்பட்ட நபருக்கு தொகை காசோலை அல்லது வங்கி பரிமாற்றம் மூலமாகவோ வழங்கப்படும்.',
      'அரசாங்க விதிமுறைகள்: அரசாங்கம் அல்லது நிறுவனத்திலிருந்து ஏதேனும் மாற்றங்கள், திருத்தங்கள் அல்லது புதிய விதிமுறைகள் அறிவிக்கப்பட்டால், அவற்றை உறுப்பினர்கள் கட்டாயமாக பின்பற்ற வேண்டும்.',
      'சிறப்பு ஊக்கத்தொகை (BONUS): ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணை தொகையை முறையாக செலுத்திய அனைத்து உறுப்பினர்களுக்கும், சீட்டு முடிவடைந்த பின் ₹20,000 வழங்கப்படும்.',
      'கடைசி மாத சிறப்பு நன்மை: கடைசி மாதத்தில் சீட்டு பெறுபவருக்கு மட்டும், அனைத்து மாதங்களிலும் தவணை தொகையை கடைசி தேதிக்குள் செலுத்தியிருந்தால், கூடுதலாக ₹4,000 வழங்கப்படும். (மொத்தம்: ₹20,000 + ₹4,000 = ₹24,000).'
    ],
    schedule: [
      { month: 1, instalment: 50000, chitAmount: 950000 },
      { month: 2, instalment: 41500, chitAmount: 780000 },
      { month: 3, instalment: 41700, chitAmount: 784000 },
      { month: 4, instalment: 42000, chitAmount: 790000 },
      { month: 5, instalment: 42200, chitAmount: 794000 },
      { month: 6, instalment: 42500, chitAmount: 800000 },
      { month: 7, instalment: 42800, chitAmount: 806000 },
      { month: 8, instalment: 43100, chitAmount: 812000 },
      { month: 9, instalment: 43500, chitAmount: 820000 },
      { month: 10, instalment: 44000, chitAmount: 830000 },
      { month: 11, instalment: 44200, chitAmount: 834000 },
      { month: 12, instalment: 44500, chitAmount: 840000 },
      { month: 13, instalment: 45000, chitAmount: 850000 },
      { month: 14, instalment: 45750, chitAmount: 865000 },
      { month: 15, instalment: 46500, chitAmount: 880000 },
      { month: 16, instalment: 47500, chitAmount: 900000 },
      { month: 17, instalment: 48500, chitAmount: 920000 },
      { month: 18, instalment: 49000, chitAmount: 930000 },
      { month: 19, instalment: 49500, chitAmount: 940000 },
      { month: 20, instalment: 50000, chitAmount: 950000 }
    ]
  }
];

export function generateProportionalSchedule(chitValue: number, durationMonths: number) {
  const safeMonths = Math.max(2, Math.min(60, Math.round(durationMonths) || 20));
  const baseInstalment = Math.round(chitValue / safeMonths);
  const schedule = [];
  for (let m = 1; m <= safeMonths; m++) {
    const progress = safeMonths > 1 ? (m - 1) / (safeMonths - 1) : 1;
    // Month 1 & Final Month pay 100% of baseInstalment, middle months scale from 83% up to 100% matching 20-month rate cards
    const factor = m === 1 || m === safeMonths ? 1 : 0.83 + 0.17 * ((m - 1) / (safeMonths - 1));
    const instalment = Math.round((baseInstalment * factor) / 10) * 10;
    const prizeFactor = m === 1 || m === safeMonths ? 0.95 : 0.78 + 0.17 * progress;
    const chitAmount = Math.round((chitValue * prizeFactor) / 100) * 100;
    schedule.push({ month: m, instalment, chitAmount });
  }
  const totalInstalmentsPaid = schedule.reduce((acc, r) => acc + r.instalment, 0);
  const minInstalment = Math.min(...schedule.map((r) => r.instalment));
  const maxInstalment = Math.max(...schedule.map((r) => r.instalment));
  const dividendBenefit = Math.max(0, chitValue - totalInstalmentsPaid);
  return {
    schedule,
    firstMonthInstalment: schedule[0]?.instalment || baseInstalment,
    minInstalment,
    maxInstalment,
    totalInstalmentsPaid,
    dividendBenefit
  };
}

export const COMPANY_INFO = {
  name: "TEAM STARS CHITS PRIVATE LIMITED",
  nameTa: "டீம் ஸ்டார்ஸ் சிட்ஸ் பிரைவேட் லிமிடெட்",
  cin: "U64990TN2025PTC181717",
  address: "41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180, Tamil Nadu, India.",
  addressTa: "41/5E, மடத்தட்டுவிளை, விள்ளுக்குறி, கல்குளம், கன்னியாகுமரி மாவட்டம் – 629180, தமிழ்நாடு, இந்தியா.",
  email: "teamstarschitsprivatelimited@gmail.com",
  phone: "9789825684",
  phoneFormatted: "+91 9789825684",
  notificationEmail: "ajesh321km2@gmail.com",
  duration: "20 Months",
  drawDate: "11th of Every Month",
  paymentDueDate: "10th of Every Month",
  disbursementDate: "25th of Every Month",
  lateFeePerDay: "₹20/day",
  registrationNoteEn: "Chit registration is available. Participation is strictly governed by the formal chit agreement, KYC documentation, and applicable statutory guidelines.",
  registrationNoteTa: "சீட்டு பதிவு உறுதிசெய்யப்பட்டுள்ளது. பங்கேற்பு முறையான சீட்டு ஒப்பந்தம், KYC ஆவணங்கள் மற்றும் சட்ட வழிகாட்டுதல்களுக்கு உட்பட்டது."
};
