import React, { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { Input, Label } from './ui';
import { fmt } from '../utils';

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function ResultTile({
  label,
  value,
  unit,
  onCopy,
  copyLabel,
  disabled = false,
  emphasis = false,
}: {
  label: string;
  value: number;
  unit: string;
  onCopy: () => void;
  copyLabel: string;
  disabled?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        border: emphasis
          ? '1px solid rgba(199, 134, 34, 0.34)'
          : '1px solid rgba(21, 37, 56, 0.08)',
        background: emphasis ? 'rgba(199, 134, 34, 0.08)' : 'rgba(255, 255, 255, 0.72)',
      }}
    >
      <div className="label" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: emphasis ? 24 : 20, fontWeight: 800, lineHeight: 1.1 }}>
          {disabled ? '-' : `${unit} ${fmt(value)}`}
        </div>
        <button
          type="button"
          className="btn icon-btn"
          disabled={disabled}
          onClick={onCopy}
          title={copyLabel}
          aria-label={copyLabel}
          style={
            disabled
              ? undefined
              : {
                  background: 'rgba(21, 37, 56, 0.06)',
                  borderColor: 'rgba(21, 37, 56, 0.08)',
                }
          }
        >
          <Copy size={16} strokeWidth={2.1} />
        </button>
      </div>
    </div>
  );
}

export default function MiniPriceCalculator({ fxRate }: { fxRate?: number }) {
  const [pricePerBottleThb, setPricePerBottleThb] = useState('0');
  const [bottlesPerCarton, setBottlesPerCarton] = useState('24');
  const [status, setStatus] = useState('');

  const bottlePrice = Number(pricePerBottleThb) || 0;
  const bottleCount = Number(bottlesPerCarton) || 0;
  const usableFxRate = typeof fxRate === 'number' && fxRate > 0 ? fxRate : 0;

  const calculations = useMemo(() => {
    const cartonThb = roundToTwo(bottlePrice * bottleCount);
    const bottleUsd = usableFxRate ? roundToTwo(bottlePrice / usableFxRate) : 0;
    const cartonUsd = usableFxRate ? roundToTwo(cartonThb / usableFxRate) : 0;

    return {
      bottleThb: roundToTwo(bottlePrice),
      cartonThb,
      bottleUsd,
      cartonUsd,
    };
  }, [bottlePrice, bottleCount, usableFxRate]);

  const copyValue = async (value: number, label: string) => {
    const text = value.toFixed(2);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        window.prompt(`Copy ${label}`, text);
      }
      setStatus(`${label} copied: ${text}`);
    } catch (error) {
      console.error(error);
      setStatus(`Unable to copy ${label} automatically.`);
      window.prompt(`Copy ${label}`, text);
    }
  };

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 22,
        border: '1px solid rgba(199, 134, 34, 0.18)',
        background:
          'linear-gradient(180deg, rgba(255, 250, 243, 0.96), rgba(255, 255, 255, 0.82))',
        boxShadow: '0 16px 28px rgba(17, 31, 47, 0.06)',
      }}
    >
      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}
      >
        <div className="grid" style={{ gap: 4 }}>
          <div className="label">Mini Price Calculator</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Enter the Thai baht price per bottle and get the CTN price ready for quotation.
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>
          {usableFxRate ? `Using FX: 1 USD = ${fmt(usableFxRate)} THB` : 'Set FX rate first'}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          marginTop: 14,
        }}
      >
        <div className="grid" style={{ gap: 6 }}>
          <Label>Price per bottle (THB)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={pricePerBottleThb}
            onChange={(event) => setPricePerBottleThb(event.target.value)}
            placeholder="e.g. 12.50"
            right={<span style={{ fontSize: 12 }}>THB</span>}
          />
        </div>

        <div className="grid" style={{ gap: 6 }}>
          <Label>Bottles per carton</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={bottlesPerCarton}
            onChange={(event) => setBottlesPerCarton(event.target.value)}
            placeholder="24"
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginTop: 14,
        }}
      >
        <ResultTile
          label="THB / bottle"
          value={calculations.bottleThb}
          unit="THB"
          copyLabel="Copy THB / bottle"
          onCopy={() => copyValue(calculations.bottleThb, 'THB / bottle')}
        />
        <ResultTile
          label="THB / CTN"
          value={calculations.cartonThb}
          unit="THB"
          copyLabel="Copy THB / CTN"
          onCopy={() => copyValue(calculations.cartonThb, 'THB / CTN')}
        />
        <ResultTile
          label="USD / bottle"
          value={calculations.bottleUsd}
          unit="USD"
          copyLabel="Copy USD / bottle"
          onCopy={() => copyValue(calculations.bottleUsd, 'USD / bottle')}
          disabled={!usableFxRate}
        />
        <ResultTile
          label="Suggested quote price (USD / CTN)"
          value={calculations.cartonUsd}
          unit="USD"
          copyLabel="Copy USD / CTN"
          onCopy={() => copyValue(calculations.cartonUsd, 'USD / CTN')}
          disabled={!usableFxRate}
          emphasis
        />
      </div>

      <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
        Formula: THB/CTN = THB per bottle × bottles per carton. USD values use the FX rate above.
      </div>
      {status ? (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            borderRadius: 14,
            background: 'rgba(21, 37, 56, 0.05)',
            color: '#45617c',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {status}
        </div>
      ) : null}
    </div>
  );
}
