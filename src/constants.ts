// src/constants.ts

// Incoterms presets
export const INCOTERMS_PRESETS = [
  'FOB BANGKOK, THAILAND (Incoterms 2020)',
  'FOB CHIANG RAI, THAILAND (Incoterms 2020)',
  'FOB LEAM CHABANG, THAILAND (Incoterms 2020)',
  'FOB RANONG, THAILAND (Incoterms 2020)',
  'CFR MUMBAI, INDIA (Incoterms 2020)',
  'CIF DUBAI, UAE (Incoterms 2020)',
  'EXW SAMUT SAKHON, THAILAND (Incoterms 2020)',
];

// Payment presets
export const PAYMENT_PRESETS = [
  '100% Advance Payment',
  'TT within 30 days',
  'LC at sight',
];

export const GOODS_DESCRIPTION_PRESETS = [
  'Coconut Blossom Juice 150 ml (24 bottles / carton)',
  'Coconut Blossom Juice 250 ml (24 bottles / carton)',
  'HuqKhuun Watermelon Rice Cracker 30g (20 bags / carton)',
  'Kin Aroi Rice Chips Tomato Flavor 30g (20 bags / carton)',
  'Kin Aroi Rice Chips Sour Cream and Onion Flavor 30g (20 bags / carton)',
];
export const GOODS_DESCRIPTION_CUSTOM_LABEL = 'Custom';

function uniqueGoodsDescriptions(descriptions: string[]) {
  const seen = new Set<string>();
  return descriptions
    .map((description) => description.trim())
    .filter(Boolean)
    .filter((description) => {
      if (seen.has(description)) return false;
      seen.add(description);
      return true;
    });
}

function goodsDescriptionSubjectName(description: string) {
  return description.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function splitGoodsDescriptionLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function joinGoodsDescriptionLines(descriptions: string[]) {
  return uniqueGoodsDescriptions(descriptions).join('\n');
}

export function buildProposalSubjectFromDescriptions(descriptions: string[]) {
  const names = uniqueGoodsDescriptions(descriptions).map(goodsDescriptionSubjectName);
  return names.length ? `Quotation for ${names.join(' / ')}` : 'Quotation for Selected Products';
}

export function buildClassicSubjectFromDescriptions(descriptions: string[]) {
  const names = uniqueGoodsDescriptions(descriptions).map((description) =>
    goodsDescriptionSubjectName(description).toUpperCase(),
  );
  return names.length ? `QUOTATION FOR ${names.join(' / ')}` : 'QUOTATION FOR SELECTED PRODUCTS';
}

// หน่วยมาตรฐานทั้งระบบ
export const UNIT_PRESETS_BASE = ['CTN', 'PALLET', '20FCL', '40FCL', 'BAG', 'PCS'];
export const UNIT_CUSTOM_LABEL = 'Custom';

export const MIN_QTY_UNIT_PRESETS = UNIT_PRESETS_BASE;
export const LINE_ITEM_UNIT_PRESETS = UNIT_PRESETS_BASE;

export type CompanyLogoPreset = {
  id: string;
  label: string;
  logoSrc: string;
  sellerName: string;
  sellerAddress: string;
};

export const COMPANY_LOGO_PRESETS: CompanyLogoPreset[] = [
  {
    id: 'huqkhuun',
    label: 'Huq Khuun',
    logoSrc: '/huqkhuun-gold-logo.png',
    sellerName: 'FAH LADDA CO., LTD.',
    sellerAddress: '79/1 Moo1, Klongtan, Ban Phaeo, Samut Sakhon, 74120, Thailand',
  },
  {
    id: 'kin-aroi',
    label: 'Kin Aroi',
    logoSrc: '/kin-aroi-logo.png',
    sellerName: 'GOLDERA LTD., PART.',
    sellerAddress: '32 Moo2 Banpout, Mueang, Lampang, 52100, Thailand',
  },
];

export type CartonPreset = {
  id: string;
  label: string;
  length: number;
  width: number;
  height: number;
  grossWeight: number;
  piecesPerCarton: number;
  quickQuoteExwPrices: Record<QuickQuoteScenarioKey, number>;
};

export type QuickQuoteScenarioKey = 'trial' | 'moq2' | 'thaifex4' | 'fcl20';

export const CUSTOM_CARTON_PRESET_ID = 'custom';

export const CARTON_PRESETS: CartonPreset[] = [
  {
    id: '150ml24pcs5ly',
    label: '150ml24pcs5ly',
    length: 306,
    width: 215,
    height: 195,
    grossWeight: 8.5,
    piecesPerCarton: 24,
    quickQuoteExwPrices: {
      trial: 39,
      moq2: 35,
      thaifex4: 33,
      fcl20: 29,
    },
  },
  {
    id: '250ml24pcs5ly',
    label: '250ml24pcs5ly',
    length: 368,
    width: 248,
    height: 170,
    grossWeight: 12,
    piecesPerCarton: 24,
    quickQuoteExwPrices: {
      trial: 55,
      moq2: 51,
      thaifex4: 48,
      fcl20: 42,
    },
  },
  {
    id: '30g20pcs3ly',
    label: '30g20pcs3ly',
    length: 310,
    width: 360,
    height: 140,
    grossWeight: 1.5,
    piecesPerCarton: 20,
    quickQuoteExwPrices: {
      trial: 19,
      moq2: 17,
      thaifex4: 16,
      fcl20: 15,
    },
  },
  {
    id: '30g35pcs3ly',
    label: '30g35pcs3ly',
    length: 320,
    width: 480,
    height: 300,
    grossWeight: 3,
    piecesPerCarton: 35,
    quickQuoteExwPrices: {
      trial: 19,
      moq2: 17,
      thaifex4: 16,
      fcl20: 15,
    },
  },
];
