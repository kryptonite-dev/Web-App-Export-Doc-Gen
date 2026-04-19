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

// หน่วยมาตรฐานทั้งระบบ
export const UNIT_PRESETS_BASE = ['CTN', 'BAG', 'PCS', 'FCL 20ft', 'FCL 40ft'];
export const UNIT_CUSTOM_LABEL = 'Custom';

export const MIN_QTY_UNIT_PRESETS = UNIT_PRESETS_BASE;
export const LINE_ITEM_UNIT_PRESETS = UNIT_PRESETS_BASE;
