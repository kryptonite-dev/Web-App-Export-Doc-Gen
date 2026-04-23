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
];
export const GOODS_DESCRIPTION_CUSTOM_LABEL = 'Custom';

// หน่วยมาตรฐานทั้งระบบ
export const UNIT_PRESETS_BASE = ['CTN', 'PALLET', '20FCL', '40FCL', 'BAG', 'PCS'];
export const UNIT_CUSTOM_LABEL = 'Custom';

export const MIN_QTY_UNIT_PRESETS = UNIT_PRESETS_BASE;
export const LINE_ITEM_UNIT_PRESETS = UNIT_PRESETS_BASE;

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
