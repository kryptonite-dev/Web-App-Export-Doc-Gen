import type { CartonPreset, QuickQuoteScenarioKey } from './constants';

export type TradeIncoterm = 'EXW' | 'FCA' | 'FOB' | 'CIF' | 'CNF';

export const TRADE_QUOTE_PALLET_LENGTH = 1200;
export const TRADE_QUOTE_PALLET_WIDTH = 1000;
export const TRADE_QUOTE_SAFE_LAYERS = 8;
export const TRADE_QUOTE_20FCL = {
  length: 5896,
  width: 2350,
  height: 2393,
  payload: 28300,
};

export const TRADE_QUOTE_SCENARIO_UPLIFTS: Record<
  QuickQuoteScenarioKey,
  {
    fca: [number, number];
    fob: [number, number];
  }
> = {
  trial: {
    fca: [7000, 9000],
    fob: [10000, 13000],
  },
  moq2: {
    fca: [9000, 11000],
    fob: [11000, 13000],
  },
  thaifex4: {
    fca: [11000, 14000],
    fob: [13000, 17000],
  },
  fcl20: {
    fca: [8000, 11000],
    fob: [12000, 15000],
  },
};

export function estimateTradeCartonsPerPallet(cartonLength: number, cartonWidth: number) {
  if (!cartonLength || !cartonWidth) return 0;

  const orientationA =
    Math.floor(TRADE_QUOTE_PALLET_LENGTH / cartonWidth) *
    Math.floor(TRADE_QUOTE_PALLET_WIDTH / cartonLength);
  const orientationB =
    Math.floor(TRADE_QUOTE_PALLET_LENGTH / cartonLength) *
    Math.floor(TRADE_QUOTE_PALLET_WIDTH / cartonWidth);

  return Math.max(orientationA, orientationB) * TRADE_QUOTE_SAFE_LAYERS;
}

export function estimateTrade20FclLoose({
  cartonLength,
  cartonWidth,
  cartonHeight,
  cartonWeight,
}: {
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
  cartonWeight: number;
}) {
  if (!cartonLength || !cartonWidth || !cartonHeight || !cartonWeight) {
    return 0;
  }

  const permutations = [
    [cartonLength, cartonWidth, cartonHeight],
    [cartonLength, cartonHeight, cartonWidth],
    [cartonWidth, cartonLength, cartonHeight],
    [cartonWidth, cartonHeight, cartonLength],
    [cartonHeight, cartonLength, cartonWidth],
    [cartonHeight, cartonWidth, cartonLength],
  ];

  const dimensional = Math.max(
    ...permutations.map(
      ([length, width, height]) =>
        Math.floor(TRADE_QUOTE_20FCL.length / length) *
        Math.floor(TRADE_QUOTE_20FCL.width / width) *
        Math.floor(TRADE_QUOTE_20FCL.height / height),
    ),
  );
  const weightLimited = Math.floor(TRADE_QUOTE_20FCL.payload / cartonWeight);

  return Math.min(dimensional, weightLimited);
}

export function roundHalf(value: number) {
  return Math.round((value || 0) * 2) / 2;
}

export function thbToCurrency(thb: number, fxRate: number, currency: string) {
  return currency.trim().toUpperCase() === 'THB' ? thb : fxRate > 0 ? thb / fxRate : 0;
}

export function usd(thb: number, fxRate: number) {
  return fxRate > 0 ? thb / fxRate : 0;
}

function midpoint([min, max]: [number, number]) {
  return (min + max) / 2;
}

export function quotePricePerPcsThb({
  preset,
  scenario,
  totalCartons,
  incoterm,
}: {
  preset: CartonPreset;
  scenario: QuickQuoteScenarioKey;
  totalCartons: number;
  incoterm: TradeIncoterm;
}) {
  const totalPcs = totalCartons * preset.piecesPerCarton;
  const exwPrice = preset.quickQuoteExwPrices[scenario];
  const effectiveIncoterm = incoterm === 'CIF' || incoterm === 'CNF' ? 'FOB' : incoterm;

  if (effectiveIncoterm === 'EXW' || totalPcs <= 0) return exwPrice;

  const uplifts = TRADE_QUOTE_SCENARIO_UPLIFTS[scenario];
  const uplift =
    effectiveIncoterm === 'FCA'
      ? midpoint(uplifts.fca) / totalPcs
      : midpoint(uplifts.fob) / totalPcs;

  return roundHalf(exwPrice + uplift);
}

export function quotePricePerCtn({
  preset,
  scenario,
  totalCartons,
  incoterm,
  currency,
  fxRate,
}: {
  preset: CartonPreset;
  scenario: QuickQuoteScenarioKey;
  totalCartons: number;
  incoterm: TradeIncoterm;
  currency: string;
  fxRate: number;
}) {
  const thbPerCtn =
    quotePricePerPcsThb({ preset, scenario, totalCartons, incoterm }) * preset.piecesPerCarton;
  return thbToCurrency(thbPerCtn, fxRate, currency);
}
