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
