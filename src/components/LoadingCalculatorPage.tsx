import React, { useMemo, useState } from 'react';
import { Card, Input, Label } from './ui';
import { fmt } from '../utils';

type PalletSpec = {
  id: string;
  label: string;
  length: number;
  width: number;
  height: number;
  tare: number;
  count20: number;
  count40: number;
  count40hc: number;
};

type PatternSpec = {
  id: string;
  label: string;
  safeLayers: number;
  explain: string;
};

type ContainerSpec = {
  id: '20FCL' | '40FCL' | 'HC40FCL';
  length: number;
  width: number;
  height: number;
  payload: number;
};

const PALLETS: PalletSpec[] = [
  {
    id: 'upr_wood_1000x1200',
    label: 'UPR Wooden 1000×1200×144 mm',
    length: 1000,
    width: 1200,
    height: 144,
    tare: 30,
    count20: 10,
    count40: 21,
    count40hc: 21,
  },
  {
    id: 'upr_plastic_1100',
    label: 'UPR Plastic 1100×1100×150 mm',
    length: 1100,
    width: 1100,
    height: 150,
    tare: 18,
    count20: 10,
    count40: 20,
    count40hc: 20,
  },
  {
    id: 'chep_perimeter_1200x1000',
    label: 'CHEP Perimeter Wood 1200×1000×154 mm',
    length: 1200,
    width: 1000,
    height: 154,
    tare: 28,
    count20: 10,
    count40: 21,
    count40hc: 21,
  },
  {
    id: 'chep_ecr_1200x1000',
    label: 'CHEP ECR Wood 1200×1000×159 mm',
    length: 1200,
    width: 1000,
    height: 159,
    tare: 38,
    count20: 10,
    count40: 21,
    count40hc: 21,
  },
];

const PATTERNS: PatternSpec[] = [
  {
    id: 'column',
    label: 'Column stacking (BCT Minimum)',
    safeLayers: 8,
    explain: 'Layer 8 remains within the BCT minimum table, so 8 layers are the guaranteed safe stack.',
  },
  {
    id: 'interlocking',
    label: 'Interlocking stacking (BCT Minimum)',
    safeLayers: 5,
    explain: 'Layer 5 remains within the BCT minimum table, so 5 layers are the guaranteed safe stack.',
  },
];

const CONTAINERS: ContainerSpec[] = [
  { id: '20FCL', length: 5896, width: 2350, height: 2393, payload: 28300 },
  { id: '40FCL', length: 12032, width: 2350, height: 2393, payload: 28870 },
  { id: 'HC40FCL', length: 12032, width: 2350, height: 2697, payload: 28690 },
];

function cartonsPerLayer(pallet: PalletSpec, cartonLength: number, cartonWidth: number) {
  const orientationA =
    Math.floor(pallet.length / cartonWidth) * Math.floor(pallet.width / cartonLength);
  const orientationB =
    Math.floor(pallet.length / cartonLength) * Math.floor(pallet.width / cartonWidth);
  return Math.max(orientationA, orientationB);
}

function dimensionalMax(
  container: ContainerSpec,
  dims: { length: number; width: number; height: number }
) {
  const permutations = [
    [dims.length, dims.width, dims.height],
    [dims.length, dims.height, dims.width],
    [dims.width, dims.length, dims.height],
    [dims.width, dims.height, dims.length],
    [dims.height, dims.length, dims.width],
    [dims.height, dims.width, dims.length],
  ];

  return Math.max(
    ...permutations.map(
      ([length, width, height]) =>
        Math.floor(container.length / length) *
        Math.floor(container.width / width) *
        Math.floor(container.height / height)
    )
  );
}

export default function LoadingCalculatorPage() {
  const [cartonLength, setCartonLength] = useState(306);
  const [cartonWidth, setCartonWidth] = useState(215);
  const [cartonHeight, setCartonHeight] = useState(195);
  const [cartonWeight, setCartonWeight] = useState(8.5);
  const [bottlesPerCarton, setBottlesPerCarton] = useState(24);
  const [palletId, setPalletId] = useState('chep_perimeter_1200x1000');
  const [patternId, setPatternId] = useState('column');

  const pallet = PALLETS.find((item) => item.id === palletId) || PALLETS[0];
  const pattern = PATTERNS.find((item) => item.id === patternId) || PATTERNS[0];

  const calculation = useMemo(() => {
    const layerCount = cartonsPerLayer(pallet, cartonLength, cartonWidth);
    const safeLayers = pattern.safeLayers;
    const cartonsPerPallet = layerCount * safeLayers;
    const palletHeightLoaded = pallet.height + safeLayers * cartonHeight;
    const palletGrossWeight = cartonsPerPallet * cartonWeight + pallet.tare;

    const palletized = CONTAINERS.map((container) => {
      const palletsPerContainer =
        container.id === '20FCL'
          ? pallet.count20
          : container.id === '40FCL'
            ? pallet.count40
            : pallet.count40hc;
      const cartonsPerContainer = palletsPerContainer * cartonsPerPallet;
      const bottlesPerContainer = cartonsPerContainer * bottlesPerCarton;
      const grossWeight = palletsPerContainer * palletGrossWeight;

      return {
        container: container.id,
        palletsPerContainer,
        cartonsPerPallet,
        cartonsPerContainer,
        bottlesPerContainer,
        grossWeight,
        status: grossWeight <= container.payload ? 'OK by payload' : 'Exceeds payload',
      };
    });

    const loose = CONTAINERS.map((container) => {
      const dimensional = dimensionalMax(container, {
        length: cartonLength,
        width: cartonWidth,
        height: cartonHeight,
      });
      const weightLimited = Math.floor(container.payload / cartonWeight);
      const usable = Math.min(dimensional, weightLimited);
      return {
        container: container.id,
        dimensional,
        weightLimited,
        usable,
        bottles: usable * bottlesPerCarton,
        limiting:
          dimensional < weightLimited
            ? 'Volume / dimensions'
            : dimensional > weightLimited
              ? 'Payload weight'
              : 'Equal',
      };
    });

    return {
      layerCount,
      safeLayers,
      cartonsPerPallet,
      palletHeightLoaded,
      palletGrossWeight,
      palletized,
      loose,
    };
  }, [
    bottlesPerCarton,
    cartonHeight,
    cartonLength,
    cartonWeight,
    cartonWidth,
    pallet,
    pattern,
  ]);

  const loose20 = calculation.loose.find((item) => item.container === '20FCL');
  const loose40 = calculation.loose.find((item) => item.container === '40FCL');

  return (
    <div className="calc-page">
      <div className="calc-grid">
        <Card className="calc-input-card">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Calculator Input</div>
              <h2>Container loading setup</h2>
            </div>
            <div className="calc-badge">150 ml default</div>
          </div>

          <div className="grid two-col">
            <div className="grid">
              <Label>Carton length (mm)</Label>
              <Input
                type="number"
                value={cartonLength}
                onChange={(event) => setCartonLength(Number(event.target.value) || 0)}
              />
            </div>
            <div className="grid">
              <Label>Carton width (mm)</Label>
              <Input
                type="number"
                value={cartonWidth}
                onChange={(event) => setCartonWidth(Number(event.target.value) || 0)}
              />
            </div>
            <div className="grid">
              <Label>Carton height (mm)</Label>
              <Input
                type="number"
                value={cartonHeight}
                onChange={(event) => setCartonHeight(Number(event.target.value) || 0)}
              />
            </div>
            <div className="grid">
              <Label>Carton gross weight (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={cartonWeight}
                onChange={(event) => setCartonWeight(Number(event.target.value) || 0)}
              />
            </div>
            <div className="grid">
              <Label>Bottles per carton</Label>
              <Input
                type="number"
                value={bottlesPerCarton}
                onChange={(event) => setBottlesPerCarton(Number(event.target.value) || 0)}
              />
            </div>
            <div className="grid">
              <Label>Pallet spec</Label>
              <select className="input" value={pallet.id} onChange={(event) => setPalletId(event.target.value)}>
                {PALLETS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="muted">{pallet.label}</div>
            </div>
            <div className="grid full-span">
              <Label>Stacking pattern</Label>
              <select className="input" value={pattern.id} onChange={(event) => setPatternId(event.target.value)}>
                {PATTERNS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="muted">{pattern.label}</div>
            </div>
          </div>
        </Card>

        <Card className="calc-summary-card">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Summary</div>
              <h2>Export talking points</h2>
            </div>
          </div>

          <div className="calc-kpis">
            <div className="calc-kpi">
              <div className="calc-kpi-label">CTN / layer</div>
              <div className="calc-kpi-value">{fmt(calculation.layerCount, 0)}</div>
              <div className="muted">{fmt(pallet.length)} × {fmt(pallet.width)} mm pallet</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">Safe max layers</div>
              <div className="calc-kpi-value">{fmt(calculation.safeLayers, 0)}</div>
              <div className="muted">{pattern.label}</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">CTN / pallet</div>
              <div className="calc-kpi-value">{fmt(calculation.cartonsPerPallet, 0)}</div>
              <div className="muted">Loaded height ≈ {fmt(calculation.palletHeightLoaded, 0)} mm</div>
            </div>
            <div className="calc-kpi">
              <div className="calc-kpi-label">Pallet gross wt</div>
              <div className="calc-kpi-value">{fmt(calculation.palletGrossWeight, 2)} kg</div>
              <div className="muted">Including pallet tare</div>
            </div>
          </div>

          <div className="calc-note calc-note-accent">
            Current quick answer: 1 pallet = <strong>{fmt(calculation.cartonsPerPallet, 0)} CTN</strong>
            {' / '}
            <strong>{fmt(calculation.cartonsPerPallet * bottlesPerCarton, 0)} PCS</strong>
            {' · '}
            20FCL loose = <strong>{fmt(loose20?.usable || 0, 0)} CTN</strong>
            {' / '}
            <strong>{fmt((loose20?.usable || 0) * bottlesPerCarton, 0)} PCS</strong>
            {' · '}
            40FCL loose = <strong>{fmt(loose40?.usable || 0, 0)} CTN</strong>
            {' / '}
            <strong>{fmt((loose40?.usable || 0) * bottlesPerCarton, 0)} PCS</strong>
          </div>

          <div className="calc-note">
            {pattern.explain}
          </div>
        </Card>

        <Card className="full-span">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Palletized</div>
              <h2>Palletized loading result</h2>
            </div>
          </div>
          <div className="calc-table-wrap">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Container</th>
                  <th>Pallets / container</th>
                  <th>CTN / pallet</th>
                  <th>CTN / container</th>
                  <th>Bottles / container</th>
                  <th>Est. gross wt (kg)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {calculation.palletized.map((row) => (
                  <tr key={row.container}>
                    <td><strong>{row.container}</strong></td>
                    <td>{fmt(row.palletsPerContainer, 0)}</td>
                    <td>{fmt(row.cartonsPerPallet, 0)}</td>
                    <td>{fmt(row.cartonsPerContainer, 0)}</td>
                    <td>{fmt(row.bottlesPerContainer, 0)}</td>
                    <td>{fmt(row.grossWeight, 2)}</td>
                    <td>
                      <span className={`calc-status ${row.status === 'OK by payload' ? 'ok' : 'warn'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="full-span">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Loose Load</div>
              <h2>Loose-load result</h2>
            </div>
          </div>
          <div className="calc-table-wrap">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Container</th>
                  <th>Dimensional max CTN</th>
                  <th>Weight max CTN</th>
                  <th>Usable CTN</th>
                  <th>Bottles</th>
                  <th>Limiting factor</th>
                </tr>
              </thead>
              <tbody>
                {calculation.loose.map((row) => (
                  <tr key={row.container}>
                    <td><strong>{row.container}</strong></td>
                    <td>{fmt(row.dimensional, 0)}</td>
                    <td>{fmt(row.weightLimited, 0)}</td>
                    <td>{fmt(row.usable, 0)}</td>
                    <td>{fmt(row.bottles, 0)}</td>
                    <td>{row.limiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="calc-detail-card">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Actual Spec</div>
              <h2>Certificate data used</h2>
            </div>
          </div>
          <div className="calc-detail-list">
            <div><strong>Customer:</strong> บริษัท ฟ้าลัดดา จำกัด</div>
            <div><strong>Product:</strong> กล่องใส่ขวดแก้ว 24 ขวด</div>
            <div><strong>Doc No.:</strong> FM-LAB-006</div>
            <div><strong>Box dimensions:</strong> W 21.50 × L 30.60 × H 19.50 cm</div>
            <div><strong>Board / flute:</strong> KA125/CS120/CS120/CS120/KA125 / BC</div>
            <div><strong>Empty carton weight:</strong> 275.85 ± 5% g/carton</div>
          </div>
        </Card>

        <Card className="calc-detail-card">
          <div className="calc-section-head">
            <div>
              <div className="preview-eyebrow">Method Note</div>
              <h2>How to use this with buyers</h2>
            </div>
          </div>
          <div className="calc-note">
            Use <strong>palletized result</strong> when the buyer asks about pallet shipments and
            use <strong>loose-load result</strong> when the buyer asks for the maximum carton count
            per container. This page is tuned for the Coconut Blossom Juice 150 ml export spec by default.
          </div>
        </Card>
      </div>
    </div>
  );
}
