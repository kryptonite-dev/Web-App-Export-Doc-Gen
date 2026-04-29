import { CARTON_PRESETS, type CartonPreset } from './constants';
import {
  estimateTrade20FclLoose,
  estimateTradeCartonsPerPallet,
  quotePricePerCtn,
  type TradeIncoterm,
} from './tradeQuotePricing';
import { DEFAULT_FX_RATE } from './sharedFxRate';
import { fmt } from './utils';

type ClassicScaleItem = {
  description: string;
};

type ClassicTierScenario = 'trial' | 'moq2' | 'fcl20';

export type ClassicOrderTierRow = {
  tier: string;
  loadingBasis: string;
  totalCtn: number;
  pricePerCtn: number;
  priceCurrency: string;
  priceBasisLabel: string;
};

export type ClassicPriceOptions = {
  currency: string;
  deliveryTerm: string;
  fxRate: number;
};

const DEFAULT_MOQ_PALLETS = 2;
const DEFAULT_PRICE_OPTIONS: ClassicPriceOptions = {
  currency: 'THB',
  deliveryTerm: 'EXW',
  fxRate: DEFAULT_FX_RATE,
};

function findPresetById(id: string) {
  return CARTON_PRESETS.find((preset) => preset.id === id);
}

export function findClassicCartonPreset(description: string) {
  const value = description.toLowerCase();

  if (value.includes('250 ml') || value.includes('250ml')) return findPresetById('250ml24pcs5ly');
  if (value.includes('150 ml') || value.includes('150ml')) return findPresetById('150ml24pcs5ly');
  if (value.includes('35 bags') || value.includes('35pcs') || value.includes('35 pcs')) {
    return findPresetById('30g35pcs3ly');
  }
  if (value.includes('30g') || value.includes('30 g') || value.includes('rice chips') || value.includes('rice cracker')) {
    return findPresetById('30g20pcs3ly');
  }

  return undefined;
}

function estimateCartonsPerPallet(preset: CartonPreset) {
  return estimateTradeCartonsPerPallet(preset.length, preset.width);
}

function estimate20FclLoose(preset: CartonPreset) {
  return estimateTrade20FclLoose({
    cartonLength: preset.length,
    cartonWidth: preset.width,
    cartonHeight: preset.height,
    cartonWeight: preset.grossWeight,
  });
}

export function detectClassicIncoterm(deliveryTerm: string): TradeIncoterm {
  const value = deliveryTerm.toUpperCase();
  if (/\bCIF\b/.test(value)) return 'CIF';
  if (/\b(CNF|CFR|C&F)\b/.test(value)) return 'CNF';
  if (/\bFOB\b/.test(value)) return 'FOB';
  if (/\bFCA\b/.test(value)) return 'FCA';
  if (/\bEXW\b/.test(value)) return 'EXW';
  return 'EXW';
}

function priceBasisLabel(incoterm: TradeIncoterm) {
  if (incoterm === 'CIF' || incoterm === 'CNF') return `${incoterm} FOB REF`;
  return incoterm;
}

function pricePerCtnForScenario({
  preset,
  scenario,
  totalCtn,
  incoterm,
  currency,
  fxRate,
}: {
  preset: CartonPreset;
  scenario: ClassicTierScenario;
  totalCtn: number;
  incoterm: TradeIncoterm;
  currency: string;
  fxRate: number;
}) {
  return quotePricePerCtn({
    preset,
    scenario,
    totalCartons: totalCtn,
    incoterm,
    currency,
    fxRate,
  });
}

export function formatClassicTierPrice(row: Pick<ClassicOrderTierRow, 'priceCurrency' | 'pricePerCtn'>) {
  const currency = row.priceCurrency.trim().toUpperCase() || 'THB';
  return `${currency} ${fmt(row.pricePerCtn, currency === 'THB' ? 0 : 2)}`;
}

export function buildClassicOrderTierRows(
  item: Pick<ClassicScaleItem, 'description'>,
  options: Partial<ClassicPriceOptions> = {},
): ClassicOrderTierRow[] {
  const preset = findClassicCartonPreset(item.description);
  if (!preset) return [];

  const priceOptions = { ...DEFAULT_PRICE_OPTIONS, ...options };
  const currency = priceOptions.currency.trim().toUpperCase() || 'THB';
  const fxRate = Number(priceOptions.fxRate) || DEFAULT_PRICE_OPTIONS.fxRate;
  const incoterm = detectClassicIncoterm(priceOptions.deliveryTerm);
  const basisLabel = priceBasisLabel(incoterm);
  const cartonsPerPallet = estimateCartonsPerPallet(preset);
  const loose20Fcl = estimate20FclLoose(preset);
  const pricePerCtn = (scenario: ClassicTierScenario, totalCtn: number) =>
    pricePerCtnForScenario({
      preset,
      scenario,
      totalCtn,
      incoterm,
      currency,
      fxRate,
    });

  return [
    {
      tier: 'Trial Order',
      loadingBasis: '1 PALLET',
      totalCtn: cartonsPerPallet,
      pricePerCtn: pricePerCtn('trial', cartonsPerPallet),
      priceCurrency: currency,
      priceBasisLabel: basisLabel,
    },
    {
      tier: 'MOQ Order',
      loadingBasis: `${DEFAULT_MOQ_PALLETS} PALLET`,
      totalCtn: DEFAULT_MOQ_PALLETS * cartonsPerPallet,
      pricePerCtn: pricePerCtn('moq2', DEFAULT_MOQ_PALLETS * cartonsPerPallet),
      priceCurrency: currency,
      priceBasisLabel: basisLabel,
    },
    {
      tier: 'FCL',
      loadingBasis: "20' FCL",
      totalCtn: loose20Fcl,
      pricePerCtn: pricePerCtn('fcl20', loose20Fcl),
      priceCurrency: currency,
      priceBasisLabel: basisLabel,
    },
  ];
}
