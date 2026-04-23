import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Card, Input, Label } from './ui';
import { CARTON_PRESETS, CUSTOM_CARTON_PRESET_ID, type QuickQuoteScenarioKey } from '../constants';
import { fmt } from '../utils';

type ScenarioKey = QuickQuoteScenarioKey;

type Scenario = {
  label: string;
  short: string;
  exwPrice: number;
  fxRate: number;
  bottlesPerCarton: number;
  cartonsPerPallet: number;
  pallets: number;
  totalBottles: number;
  shipmentNote: string;
  recommended: string;
  fcaMin: number;
  fcaMax: number;
  fobMin: number;
  fobMax: number;
  cartonPresetId: string;
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
  cartonWeight: number;
};

type QuoteForm = Omit<Scenario, 'label' | 'short'>;

const DEFAULT_QUICK_CARTON_PRESET = CARTON_PRESETS[0];
const QUICK_QUOTE_PALLET_LENGTH = 1200;
const QUICK_QUOTE_PALLET_WIDTH = 1000;
const QUICK_QUOTE_SAFE_LAYERS = 8;

function estimateCartonsPerPallet(cartonLength: number, cartonWidth: number) {
  if (!cartonLength || !cartonWidth) return 0;

  const orientationA =
    Math.floor(QUICK_QUOTE_PALLET_LENGTH / cartonWidth) *
    Math.floor(QUICK_QUOTE_PALLET_WIDTH / cartonLength);
  const orientationB =
    Math.floor(QUICK_QUOTE_PALLET_LENGTH / cartonLength) *
    Math.floor(QUICK_QUOTE_PALLET_WIDTH / cartonWidth);

  return Math.max(orientationA, orientationB) * QUICK_QUOTE_SAFE_LAYERS;
}

function cartonFieldsFromPreset(preset = DEFAULT_QUICK_CARTON_PRESET) {
  return {
    cartonPresetId: preset.id,
    bottlesPerCarton: preset.piecesPerCarton,
    cartonsPerPallet: estimateCartonsPerPallet(preset.length, preset.width),
    cartonLength: preset.length,
    cartonWidth: preset.width,
    cartonHeight: preset.height,
    cartonWeight: preset.grossWeight,
  };
}

function exwPriceForPreset(presetId: string, scenarioKey: ScenarioKey, fallback: number) {
  const preset = CARTON_PRESETS.find((item) => item.id === presetId);
  return preset?.quickQuoteExwPrices[scenarioKey] ?? fallback;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  trial: {
    label: 'Trial 1 pallet',
    short: '39 THB EXW',
    exwPrice: DEFAULT_QUICK_CARTON_PRESET.quickQuoteExwPrices.trial,
    fxRate: 32,
    ...cartonFieldsFromPreset(),
    pallets: 1,
    totalBottles: 2880,
    shipmentNote: 'Trial shipment',
    recommended: 'FCA Bangkok / Khlong Toei',
    fcaMin: 7000,
    fcaMax: 9000,
    fobMin: 10000,
    fobMax: 13000,
  },
  moq2: {
    label: 'MOQ 2 pallets',
    short: '35 THB EXW',
    exwPrice: DEFAULT_QUICK_CARTON_PRESET.quickQuoteExwPrices.moq2,
    fxRate: 32,
    ...cartonFieldsFromPreset(),
    pallets: 2,
    totalBottles: 5760,
    shipmentNote: 'Standard MOQ shipment',
    recommended: 'FCA Bangkok / Khlong Toei',
    fcaMin: 9000,
    fcaMax: 11000,
    fobMin: 11000,
    fobMax: 13000,
  },
  thaifex4: {
    label: 'ThaiFex 4 pallets',
    short: '33 THB EXW',
    exwPrice: DEFAULT_QUICK_CARTON_PRESET.quickQuoteExwPrices.thaifex4,
    fxRate: 32,
    ...cartonFieldsFromPreset(),
    pallets: 4,
    totalBottles: 11520,
    shipmentNote: 'ThaiFex closing deal',
    recommended: 'FCA Bangkok / Khlong Toei',
    fcaMin: 11000,
    fcaMax: 14000,
    fobMin: 13000,
    fobMax: 17000,
  },
  fcl20: {
    label: '20FCL',
    short: '29 THB EXW',
    exwPrice: DEFAULT_QUICK_CARTON_PRESET.quickQuoteExwPrices.fcl20,
    fxRate: 32,
    ...cartonFieldsFromPreset(),
    pallets: 0,
    totalBottles: 25000,
    shipmentNote: 'Editable default bottle count for 20FCL',
    recommended: 'FOB Bangkok Port',
    fcaMin: 8000,
    fcaMax: 11000,
    fobMin: 12000,
    fobMax: 15000,
  },
};

const SCENARIO_ORDER: ScenarioKey[] = ['trial', 'moq2', 'thaifex4', 'fcl20'];

function scenarioToForm(key: ScenarioKey): QuoteForm {
  const { label: _label, short: _short, ...form } = SCENARIOS[key];
  return form;
}

function roundHalf(value: number) {
  return Math.round((value || 0) * 2) / 2;
}

function usd(thb: number, fxRate: number) {
  return fxRate > 0 ? thb / fxRate : 0;
}

function copyNumber(value: number, digits = 2) {
  return value.toFixed(digits).replace(/\.?0+$/, '');
}

function buildQuoteCalculation(form: QuoteForm, isFcl: boolean) {
  const totalBottles = isFcl
    ? Number(form.totalBottles) || 0
    : (Number(form.bottlesPerCarton) || 0) *
      (Number(form.cartonsPerPallet) || 0) *
      (Number(form.pallets) || 0);
  const bottlesPerCarton = Number(form.bottlesPerCarton) || 0;
  const totalCartons = bottlesPerCarton ? totalBottles / bottlesPerCarton : 0;
  const cartonLength = Number(form.cartonLength) || 0;
  const cartonWidth = Number(form.cartonWidth) || 0;
  const cartonHeight = Number(form.cartonHeight) || 0;
  const cartonWeight = Number(form.cartonWeight) || 0;
  const cartonCbm = (cartonLength * cartonWidth * cartonHeight) / 1_000_000_000;
  const totalCbm = totalCartons * cartonCbm;
  const totalGrossWeight = totalCartons * cartonWeight;
  const fxRate = Number(form.fxRate) || 0;
  const exwPrice = Number(form.exwPrice) || 0;
  const fcaMin = Number(form.fcaMin) || 0;
  const fcaMax = Number(form.fcaMax) || 0;
  const fobMin = Number(form.fobMin) || 0;
  const fobMax = Number(form.fobMax) || 0;

  const exwShipment = exwPrice * totalBottles;
  const fcaUpliftMinPb = totalBottles ? fcaMin / totalBottles : 0;
  const fcaUpliftMaxPb = totalBottles ? fcaMax / totalBottles : 0;
  const fcaUpliftMidPb = (fcaUpliftMinPb + fcaUpliftMaxPb) / 2;
  const fobUpliftMinPb = totalBottles ? fobMin / totalBottles : 0;
  const fobUpliftMaxPb = totalBottles ? fobMax / totalBottles : 0;
  const fobUpliftMidPb = (fobUpliftMinPb + fobUpliftMaxPb) / 2;

  const fcaPriceMin = exwPrice + fcaUpliftMinPb;
  const fcaPriceMid = exwPrice + fcaUpliftMidPb;
  const fcaPriceMax = exwPrice + fcaUpliftMaxPb;
  const fobPriceMin = exwPrice + fobUpliftMinPb;
  const fobPriceMid = exwPrice + fobUpliftMidPb;
  const fobPriceMax = exwPrice + fobUpliftMaxPb;

  const fcaShipmentMin = exwShipment + fcaMin;
  const fcaShipmentMid = exwShipment + (fcaMin + fcaMax) / 2;
  const fcaShipmentMax = exwShipment + fcaMax;
  const fobShipmentMin = exwShipment + fobMin;
  const fobShipmentMid = exwShipment + (fobMin + fobMax) / 2;
  const fobShipmentMax = exwShipment + fobMax;

  const exwRounded = exwPrice;
  const fcaRounded = roundHalf(fcaPriceMid);
  const fobRounded = roundHalf(fobPriceMid);

  return {
    totalBottles,
    totalCartons,
    cartonCbm,
    totalCbm,
    totalGrossWeight,
    fxRate,
    exwShipment,
    exwRounded,
    fcaRounded,
    fobRounded,
    fcaPriceMin,
    fcaPriceMax,
    fobPriceMin,
    fobPriceMax,
    fcaShipmentMin,
    fcaShipmentMid,
    fcaShipmentMax,
    fobShipmentMin,
    fobShipmentMid,
    fobShipmentMax,
    fcaUpliftMinPb,
    fcaUpliftMaxPb,
    fobUpliftMinPb,
    fobUpliftMaxPb,
    exwUsdBottle: usd(exwRounded, fxRate),
    fcaUsdBottle: usd(fcaRounded, fxRate),
    fobUsdBottle: usd(fobRounded, fxRate),
    exwUsdCarton: usd(exwRounded * bottlesPerCarton, fxRate),
    fcaUsdCarton: usd(fcaRounded * bottlesPerCarton, fxRate),
    fobUsdCarton: usd(fobRounded * bottlesPerCarton, fxRate),
  };
}

function recommendedUseForScenario(key: ScenarioKey) {
  if (key === 'fcl20') {
    return 'FOB Bangkok Port for full-container planning. FCA is possible but should be checked with the forwarder.';
  }
  if (key === 'trial') {
    return 'FCA Bangkok / Khlong Toei for a low-volume trial shipment.';
  }
  return 'FCA Bangkok / Khlong Toei for mixed-container discussions. Confirm FOB after booking details are clear.';
}

function ScenarioPriceCell({
  thbBottle,
  usdCarton,
}: {
  thbBottle: number;
  usdCarton: number;
}) {
  return (
    <div className="quick-price-cell">
      <strong>{fmt(thbBottle)} THB / PCS</strong>
      <span>USD {fmt(usdCarton, 2)} / CTN</span>
    </div>
  );
}

function PriceBox({
  tone,
  title,
  description,
  priceThb,
  priceUsd,
  cartonUsd,
  rangeThb,
  rangeUsd,
  shipmentThb,
  shipmentUsd,
  copied,
  onCopyCartonUsd,
}: {
  tone: 'exw' | 'fca' | 'fob';
  title: string;
  description: string;
  priceThb: number;
  priceUsd: number;
  cartonUsd: number;
  rangeThb?: string;
  rangeUsd?: string;
  shipmentThb: string;
  shipmentUsd: string;
  copied: boolean;
  onCopyCartonUsd: () => void;
}) {
  return (
    <section className={`quick-price-box ${tone}`}>
      <span className="quick-tag">{title}</span>
      <div className="small">{description}</div>
      <div className="quick-price-big">{fmt(priceThb)} THB</div>
      <div className="quick-price-sub">USD {fmt(priceUsd, 3)} / PCS</div>
      <div className="quick-copy-row">
        <div>
          <div className="calc-kpi-label">Quotation bridge</div>
          <strong>USD {fmt(cartonUsd, 2)} / CTN</strong>
        </div>
        <button
          type="button"
          className={`btn icon-btn ${copied ? 'copied' : ''}`}
          onClick={onCopyCartonUsd}
          title={`Copy ${title} USD / CTN`}
          aria-label={`Copy ${title} USD / CTN`}
        >
          {copied ? <Check size={16} strokeWidth={2.4} /> : <Copy size={16} strokeWidth={2.1} />}
        </button>
      </div>
      {rangeThb ? <div className="small">{rangeThb}</div> : null}
      {rangeUsd ? <div className="small">{rangeUsd}</div> : null}
      <div className="small">{shipmentThb}</div>
      <div className="small">{shipmentUsd}</div>
    </section>
  );
}

export default function QuickQuotePage() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('moq2');
  const [form, setForm] = useState<QuoteForm>(() => scenarioToForm('moq2'));
  const [copyStatus, setCopyStatus] = useState('');

  const isFcl = scenarioKey === 'fcl20';
  const selectedCartonPreset = CARTON_PRESETS.find((item) => item.id === form.cartonPresetId);

  const calculation = useMemo(() => buildQuoteCalculation(form, isFcl), [form, isFcl]);
  const scenarioComparison = useMemo(
    () =>
      SCENARIO_ORDER.map((key) => {
        const scenario = SCENARIOS[key];
        const scenarioBase = scenarioToForm(key);
        const scenarioForm = {
          ...scenarioBase,
          cartonPresetId: form.cartonPresetId,
          exwPrice: exwPriceForPreset(form.cartonPresetId, key, scenarioBase.exwPrice),
          bottlesPerCarton: form.bottlesPerCarton,
          cartonsPerPallet: form.cartonsPerPallet,
          cartonLength: form.cartonLength,
          cartonWidth: form.cartonWidth,
          cartonHeight: form.cartonHeight,
          cartonWeight: form.cartonWeight,
        };
        return {
          key,
          scenario,
          calculation: buildQuoteCalculation(scenarioForm, key === 'fcl20'),
          recommendedUse: recommendedUseForScenario(key),
        };
      }),
    [
      form.bottlesPerCarton,
      form.cartonsPerPallet,
      form.cartonHeight,
      form.cartonLength,
      form.cartonPresetId,
      form.cartonWeight,
      form.cartonWidth,
    ]
  );

  const loadScenario = (next: ScenarioKey) => {
    const nextScenario = scenarioToForm(next);
    const currentCarton = {
      cartonPresetId: form.cartonPresetId,
      bottlesPerCarton: form.bottlesPerCarton,
      cartonsPerPallet: form.cartonsPerPallet,
      cartonLength: form.cartonLength,
      cartonWidth: form.cartonWidth,
      cartonHeight: form.cartonHeight,
      cartonWeight: form.cartonWeight,
    };
    setScenarioKey(next);
    setForm({
      ...nextScenario,
      ...currentCarton,
      exwPrice: exwPriceForPreset(form.cartonPresetId, next, nextScenario.exwPrice),
    });
    setCopyStatus('');
  };

  const updateNumber = (key: keyof QuoteForm, value: string) => {
    setForm((current) => ({ ...current, [key]: Number(value) || 0 }));
    setCopyStatus('');
  };

  const updateCartonNumber = (key: keyof QuoteForm, value: string) => {
    const nextValue = Number(value) || 0;
    setForm((current) => ({
      ...current,
      [key]: nextValue,
      cartonPresetId: CUSTOM_CARTON_PRESET_ID,
      cartonsPerPallet:
        key === 'cartonLength' || key === 'cartonWidth'
          ? estimateCartonsPerPallet(
              key === 'cartonLength' ? nextValue : current.cartonLength,
              key === 'cartonWidth' ? nextValue : current.cartonWidth,
            )
          : current.cartonsPerPallet,
    }));
    setCopyStatus('');
  };

  const updateText = (key: keyof QuoteForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopyStatus('');
  };

  const applyCartonPreset = (presetId: string) => {
    if (presetId === CUSTOM_CARTON_PRESET_ID) {
      setForm((current) => ({ ...current, cartonPresetId: CUSTOM_CARTON_PRESET_ID }));
      setCopyStatus('');
      return;
    }

    const preset = CARTON_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setForm((current) => ({
      ...current,
      cartonPresetId: preset.id,
      bottlesPerCarton: preset.piecesPerCarton,
      cartonLength: preset.length,
      cartonWidth: preset.width,
      cartonHeight: preset.height,
      cartonWeight: preset.grossWeight,
      cartonsPerPallet: estimateCartonsPerPallet(preset.length, preset.width),
      exwPrice: preset.quickQuoteExwPrices[scenarioKey],
    }));
    setCopyStatus('');
  };

  const copyCartonUsd = async (label: string, value: number) => {
    const text = copyNumber(value, 2);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        window.prompt(`Copy ${label} USD / CTN`, text);
      }
      setCopyStatus(`${label} USD / CTN copied: ${text}`);
    } catch (error) {
      console.error(error);
      setCopyStatus(`Unable to copy ${label} USD / CTN automatically.`);
      window.prompt(`Copy ${label} USD / CTN`, text);
    }
  };

  return (
    <div className="quick-page">
      <div className="quick-scenarios">
        {SCENARIO_ORDER.map((key) => {
          const scenario = SCENARIOS[key];
          const scenarioPrice = exwPriceForPreset(form.cartonPresetId, key, scenario.exwPrice);
          return (
            <button
              type="button"
              key={key}
              className={`quick-scenario ${scenarioKey === key ? 'active' : ''}`}
              onClick={() => loadScenario(key)}
            >
              <span>{scenario.label}</span>
              <small>{scenarioPrice} THB EXW / PCS</small>
            </button>
          );
        })}
      </div>

      <div className="quick-grid">
        <Card className="quick-form-card">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Quick Quote Input</div>
              <h2>FCA / FOB trade-show setup</h2>
            </div>
            <div className="calc-badge">{SCENARIOS[scenarioKey].label}</div>
          </div>
          <p className="muted">
            Defaults come from the source quick-quote file, adjusted to the current project FX flow.
            Non-20FCL scenarios auto-calculate bottles from pallet data.
          </p>

          <div className="quick-form-grid">
            <div className="grid">
              <Label>Scenario</Label>
              <select
                className="input"
                value={scenarioKey}
                onChange={(event) => loadScenario(event.target.value as ScenarioKey)}
              >
                {SCENARIO_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {SCENARIOS[key].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid">
              <Label>Recommended Incoterm</Label>
              <Input
                value={form.recommended}
                onChange={(event) => updateText('recommended', event.target.value)}
              />
            </div>
            <div className="grid full-span">
              <Label>Carton preset</Label>
              <select
                className="input"
                value={form.cartonPresetId}
                onChange={(event) => applyCartonPreset(event.target.value)}
              >
                {CARTON_PRESETS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} · {item.length}×{item.width}×{item.height} mm · {item.piecesPerCarton} PCS/CTN · {item.grossWeight} kg/CTN
                  </option>
                ))}
                <option value={CUSTOM_CARTON_PRESET_ID}>Custom</option>
              </select>
              <div className="muted">
                {selectedCartonPreset
                  ? `${selectedCartonPreset.label}: ${selectedCartonPreset.length}×${selectedCartonPreset.width}×${selectedCartonPreset.height} mm · ${selectedCartonPreset.piecesPerCarton} PCS/CTN · ${selectedCartonPreset.grossWeight} kg/CTN`
                  : 'Custom carton: edit dimensions, weight, and PCS/CTN below.'}
              </div>
            </div>
            <div className="grid">
              <Label>EXW price / PCS (THB)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.exwPrice}
                onChange={(event) => updateNumber('exwPrice', event.target.value)}
              />
              <div className="muted">
                Auto from selected carton preset and scenario. Edit here only for a special quote.
              </div>
            </div>
            <div className="grid">
              <Label>Fixed rate THB to USD</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.fxRate}
                onChange={(event) => updateNumber('fxRate', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>PCS per carton</Label>
              <Input
                type="number"
                step="1"
                value={form.bottlesPerCarton}
                onChange={(event) => updateCartonNumber('bottlesPerCarton', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>Carton length (mm)</Label>
              <Input
                type="number"
                step="1"
                value={form.cartonLength}
                onChange={(event) => updateCartonNumber('cartonLength', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>Carton width (mm)</Label>
              <Input
                type="number"
                step="1"
                value={form.cartonWidth}
                onChange={(event) => updateCartonNumber('cartonWidth', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>Carton height (mm)</Label>
              <Input
                type="number"
                step="1"
                value={form.cartonHeight}
                onChange={(event) => updateCartonNumber('cartonHeight', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>Carton gross weight (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cartonWeight}
                onChange={(event) => updateCartonNumber('cartonWeight', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>Cartons per pallet (auto/editable)</Label>
              <Input
                type="number"
                step="1"
                value={form.cartonsPerPallet}
                onChange={(event) => updateNumber('cartonsPerPallet', event.target.value)}
              />
              <div className="muted">
                Auto basis: 1200×1000 mm pallet · column stacking · 8 layers.
              </div>
            </div>
            <div className="grid">
              <Label>Pallets per shipment</Label>
              <Input
                type="number"
                step="1"
                value={form.pallets}
                onChange={(event) => updateNumber('pallets', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>Total bottles {isFcl ? '(editable)' : '(auto)'}</Label>
              <Input
                type="number"
                step="1"
                value={isFcl ? form.totalBottles : calculation.totalBottles}
                readOnly={!isFcl}
                onChange={(event) => updateNumber('totalBottles', event.target.value)}
              />
            </div>
            <div className="grid full-span">
              <Label>Shipment note</Label>
              <Input
                value={form.shipmentNote}
                onChange={(event) => updateText('shipmentNote', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>FCA uplift / shipment min (THB)</Label>
              <Input
                type="number"
                step="1"
                value={form.fcaMin}
                onChange={(event) => updateNumber('fcaMin', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>FCA uplift / shipment max (THB)</Label>
              <Input
                type="number"
                step="1"
                value={form.fcaMax}
                onChange={(event) => updateNumber('fcaMax', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>FOB uplift / shipment min (THB)</Label>
              <Input
                type="number"
                step="1"
                value={form.fobMin}
                onChange={(event) => updateNumber('fobMin', event.target.value)}
              />
            </div>
            <div className="grid">
              <Label>FOB uplift / shipment max (THB)</Label>
              <Input
                type="number"
                step="1"
                value={form.fobMax}
                onChange={(event) => updateNumber('fobMax', event.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="quick-summary-card">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Summary</div>
              <h2>Quick talking points</h2>
            </div>
          </div>

          <div className="quick-stat-grid">
            <div className="calc-kpi">
              <div className="calc-kpi-label">Total PCS</div>
              <div className="calc-kpi-value">{fmt(calculation.totalBottles, 0)}</div>
              <div className="muted">{fmt(calculation.totalCartons, 0)} CTN</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">Total gross wt</div>
              <div className="calc-kpi-value">{fmt(calculation.totalGrossWeight, 1)} kg</div>
              <div className="muted">{fmt(form.cartonWeight, 2)} kg / CTN</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">Estimated CBM</div>
              <div className="calc-kpi-value">{fmt(calculation.totalCbm, 3)}</div>
              <div className="muted">{fmt(calculation.cartonCbm, 4)} CBM / CTN</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">EXW shipment</div>
              <div className="calc-kpi-value">{fmt(calculation.exwShipment, 0)}</div>
              <div className="muted">USD {fmt(usd(calculation.exwShipment, calculation.fxRate), 2)}</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">FCA uplift / PCS</div>
              <div className="calc-kpi-value">{fmt(calculation.fcaUpliftMinPb)} - {fmt(calculation.fcaUpliftMaxPb)}</div>
              <div className="muted">THB range</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">FOB uplift / PCS</div>
              <div className="calc-kpi-value">{fmt(calculation.fobUpliftMinPb)} - {fmt(calculation.fobUpliftMaxPb)}</div>
              <div className="muted">THB range</div>
            </div>
          </div>

          <div className="quick-ok">
            <strong>Fast booth logic:</strong> start with <strong>FCA Bangkok / Khlong Toei</strong>
            {' '}for mixed-container discussions. Use <strong>FOB Bangkok Port</strong> when the buyer is closer to full-container planning.
          </div>

          <div className="quick-warn">
            Indicative quick quote only. Final price still depends on booking, documents, forwarder,
            stuffing/CFS policy, and the actual shipment condition.
          </div>
          {copyStatus ? <div className="calc-inline-status">{copyStatus}</div> : null}
        </Card>
      </div>

      <div className="quick-price-grid">
        <PriceBox
          tone="exw"
          title="EXW"
          description="Factory / origin price"
          priceThb={calculation.exwRounded}
          priceUsd={calculation.exwUsdBottle}
          cartonUsd={calculation.exwUsdCarton}
          shipmentThb={`Shipment total: ${fmt(calculation.exwShipment, 0)} THB`}
          shipmentUsd={`Shipment total USD: ${fmt(usd(calculation.exwShipment, calculation.fxRate), 2)}`}
          copied={copyStatus.startsWith('EXW')}
          onCopyCartonUsd={() => copyCartonUsd('EXW', calculation.exwUsdCarton)}
        />
        <PriceBox
          tone="fca"
          title="FCA Bangkok / Khlong Toei"
          description="Recommended for mixed-container / containerised cargo"
          priceThb={calculation.fcaRounded}
          priceUsd={calculation.fcaUsdBottle}
          cartonUsd={calculation.fcaUsdCarton}
          rangeThb={`Range: ${fmt(calculation.fcaPriceMin)} - ${fmt(calculation.fcaPriceMax)} THB / PCS`}
          rangeUsd={`USD Range: ${fmt(usd(calculation.fcaPriceMin, calculation.fxRate), 3)} - ${fmt(usd(calculation.fcaPriceMax, calculation.fxRate), 3)} / PCS`}
          shipmentThb={`Shipment total: ${fmt(calculation.fcaShipmentMin, 0)} - ${fmt(calculation.fcaShipmentMax, 0)} THB`}
          shipmentUsd={`Shipment total USD: ${fmt(usd(calculation.fcaShipmentMin, calculation.fxRate), 2)} - ${fmt(usd(calculation.fcaShipmentMax, calculation.fxRate), 2)}`}
          copied={copyStatus.startsWith('FCA')}
          onCopyCartonUsd={() => copyCartonUsd('FCA', calculation.fcaUsdCarton)}
        />
        <PriceBox
          tone="fob"
          title="FOB Bangkok Port"
          description="Usually better for full-container planning"
          priceThb={calculation.fobRounded}
          priceUsd={calculation.fobUsdBottle}
          cartonUsd={calculation.fobUsdCarton}
          rangeThb={`Range: ${fmt(calculation.fobPriceMin)} - ${fmt(calculation.fobPriceMax)} THB / PCS`}
          rangeUsd={`USD Range: ${fmt(usd(calculation.fobPriceMin, calculation.fxRate), 3)} - ${fmt(usd(calculation.fobPriceMax, calculation.fxRate), 3)} / PCS`}
          shipmentThb={`Shipment total: ${fmt(calculation.fobShipmentMin, 0)} - ${fmt(calculation.fobShipmentMax, 0)} THB`}
          shipmentUsd={`Shipment total USD: ${fmt(usd(calculation.fobShipmentMin, calculation.fxRate), 2)} - ${fmt(usd(calculation.fobShipmentMax, calculation.fxRate), 2)}`}
          copied={copyStatus.startsWith('FOB')}
          onCopyCartonUsd={() => copyCartonUsd('FOB', calculation.fobUsdCarton)}
        />
      </div>

      <Card className="quick-table-card">
        <div className="calc-section-head">
          <div>
            <div className="preview-eyebrow">Detail Table</div>
            <h2>EXW / FCA / FOB comparison</h2>
          </div>
        </div>
        <div className="calc-table-wrap">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>EXW</th>
                <th>FCA</th>
                <th>FOB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price / PCS (THB)</td>
                <td>{fmt(form.exwPrice)} THB</td>
                <td>{fmt(calculation.fcaPriceMin)} - {fmt(calculation.fcaPriceMax)} THB</td>
                <td>{fmt(calculation.fobPriceMin)} - {fmt(calculation.fobPriceMax)} THB</td>
              </tr>
              <tr>
                <td>Price / PCS (USD)</td>
                <td>USD {fmt(calculation.exwUsdBottle, 3)}</td>
                <td>USD {fmt(usd(calculation.fcaPriceMin, calculation.fxRate), 3)} - {fmt(usd(calculation.fcaPriceMax, calculation.fxRate), 3)}</td>
                <td>USD {fmt(usd(calculation.fobPriceMin, calculation.fxRate), 3)} - {fmt(usd(calculation.fobPriceMax, calculation.fxRate), 3)}</td>
              </tr>
              <tr>
                <td>Bridge price / CTN (USD)</td>
                <td>USD {fmt(calculation.exwUsdCarton, 2)}</td>
                <td>USD {fmt(calculation.fcaUsdCarton, 2)}</td>
                <td>USD {fmt(calculation.fobUsdCarton, 2)}</td>
              </tr>
              <tr>
                <td>Shipment value mid (THB)</td>
                <td>{fmt(calculation.exwShipment, 0)} THB</td>
                <td>{fmt(calculation.fcaShipmentMid, 0)} THB</td>
                <td>{fmt(calculation.fobShipmentMid, 0)} THB</td>
              </tr>
              <tr>
                <td>Shipment value mid (USD)</td>
                <td>USD {fmt(usd(calculation.exwShipment, calculation.fxRate), 2)}</td>
                <td>USD {fmt(usd(calculation.fcaShipmentMid, calculation.fxRate), 2)}</td>
                <td>USD {fmt(usd(calculation.fobShipmentMid, calculation.fxRate), 2)}</td>
              </tr>
              <tr>
                <td>Package basis</td>
                <td colSpan={3}>
                  {form.cartonLength}×{form.cartonWidth}×{form.cartonHeight} mm · {fmt(form.bottlesPerCarton, 0)} PCS/CTN · {fmt(form.cartonWeight, 2)} kg/CTN
                </td>
              </tr>
              <tr>
                <td>Shipment weight / CBM</td>
                <td colSpan={3}>
                  {fmt(calculation.totalGrossWeight, 1)} kg · {fmt(calculation.totalCbm, 3)} CBM
                </td>
              </tr>
              <tr>
                <td>Recommended use</td>
                <td>Factory / EXW discussion</td>
                <td>{isFcl ? 'Possible, but FOB usually preferred' : 'Recommended for mixed-container'}</td>
                <td>{isFcl ? 'Recommended for full-container' : 'Available after final booking confirmation'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="calc-note">
          Working assumptions: 1 carton = {fmt(form.bottlesPerCarton, 0)} PCS,
          1 pallet = {fmt(form.cartonsPerPallet, 0)} cartons. USD values use the fixed FX rate entered above.
        </div>
      </Card>

      <Card className="quick-table-card">
        <div className="calc-section-head">
          <div>
            <div className="preview-eyebrow">Scenario Comparison</div>
            <h2>Trial / MOQ / ThaiFex / 20FCL price map</h2>
          </div>
        </div>
        <div className="calc-table-wrap">
          <table className="calc-table quick-compare-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>EXW</th>
                <th>FCA</th>
                <th>FOB</th>
                <th>Recommended use</th>
              </tr>
            </thead>
            <tbody>
              {scenarioComparison.map(({ key, scenario, calculation: row, recommendedUse }) => (
                <tr key={key}>
                  <td>
                    <strong>{scenario.label}</strong>
                    <div className="quick-table-sub">
                      {fmt(row.totalCartons, 0)} CTN / {fmt(row.totalBottles, 0)} PCS
                    </div>
                  </td>
                  <td>
                    <ScenarioPriceCell
                      thbBottle={row.exwRounded}
                      usdCarton={row.exwUsdCarton}
                    />
                  </td>
                  <td>
                    <ScenarioPriceCell
                      thbBottle={row.fcaRounded}
                      usdCarton={row.fcaUsdCarton}
                    />
                  </td>
                  <td>
                    <ScenarioPriceCell
                      thbBottle={row.fobRounded}
                      usdCarton={row.fobUsdCarton}
                    />
                  </td>
                  <td>{recommendedUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="calc-note">
          This table is a fast scenario map using the selected carton preset. Use the cards above when
          the buyer wants a live edited quote for one selected shipment.
        </div>
      </Card>
    </div>
  );
}
