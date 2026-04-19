// src/components/LineItemsEditor.tsx
import React from 'react';
import { LineItem, Currency } from '../types';
import { Label, Input, Select } from './ui';
import { LINE_ITEM_UNIT_PRESETS, UNIT_CUSTOM_LABEL } from '../constants';

export default function LineItemsEditor({
  items,
  onChange,
  currency,
  onCurrency,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency: Currency;
  onCurrency: (c: Currency) => void;
}) {
  const update = (idx: number, patch: Partial<LineItem>) => {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const add = () =>
    onChange([
      ...items,
      {
        description: '',
        unit: 'CTN',
        qty: 0,
        unitPrice: { currency, value: 0 },
      },
    ]);

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Label>รายการสินค้า / Line Items</Label>
        <div className="row" style={{ fontSize: 12 }}>
          <span>Currency:&nbsp;</span>
          <select
            value={currency}
            onChange={(e) => onCurrency(e.target.value)}
            className="input"
            style={{ width: 100 }}
          >
            {['USD', 'THB', 'EUR', 'AED'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* header */}
      <div className="row muted" style={{ fontWeight: 600 }}>
        <div style={{ flex: 5 }}>DESCRIPTION OF GOODS</div>
        <div style={{ flex: 2 }}>UNIT</div>
        <div style={{ flex: 2, textAlign: 'right' }}>QTY</div>
        <div style={{ flex: 2, textAlign: 'right' }}>UNIT PRICE</div>
        <div style={{ width: 28 }} />
      </div>

      {items.map((it, i) => {
        const unit = it.unit || 'CTN';
        const isPreset = LINE_ITEM_UNIT_PRESETS.includes(unit);
        const selectValue = isPreset ? unit : UNIT_CUSTOM_LABEL;

        return (
          <div key={i} className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
            {/* DESCRIPTION */}
            <Input
              style={{ flex: 5 }}
              placeholder="e.g., Coconut Blossom Juice 250 ml (24 bottles/ctn)"
              value={it.description}
              onChange={(e) => update(i, { description: e.target.value })}
            />

            {/* UNIT: dropdown + (custom เมื่อเลือก Custom) */}
            <div
              style={{
                flex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <Select
                value={selectValue}
                onChange={(v) => {
                  if (v === UNIT_CUSTOM_LABEL) {
                    // สลับไปโหมด custom → unit เก็บเป็น string ของเราเอง
                    update(i, {
                      unit: isPreset ? '' : unit,
                    });
                  } else {
                    update(i, { unit: v });
                  }
                }}
                options={[...LINE_ITEM_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                placeholder="Unit"
              />

              {/* แสดงช่องให้พิมพ์เองเฉพาะตอนเป็น custom */}
              {(!isPreset || selectValue === UNIT_CUSTOM_LABEL) && (
                <Input
                  placeholder="พิมพ์หน่วยเอง เช่น TRAY"
                  value={it.unit || ''}
                  onChange={(e) => update(i, { unit: e.target.value })}
                />
              )}
            </div>

            {/* QTY */}
            <Input
              className="right"
              style={{ flex: 2 }}
              type="number"
              value={Number.isFinite(it.qty) ? it.qty : 0}
              onChange={(e) =>
                update(i, {
                  qty: Number(e.target.value ?? 0) || 0,
                })
              }
            />

            {/* UNIT PRICE */}
            <Input
              className="right"
              style={{ flex: 2 }}
              type="number"
              value={Number.isFinite(it.unitPrice?.value) ? it.unitPrice.value : 0}
              onChange={(e) =>
                update(i, {
                  unitPrice: {
                    currency,
                    value: Number(e.target.value ?? 0) || 0,
                  },
                })
              }
              right={<span style={{ fontSize: 12 }}>{currency}</span>}
            />

            {/* REMOVE */}
            <button className="btn" onClick={() => remove(i)} aria-label="Remove line">
              ✕
            </button>
          </div>
        );
      })}

      <div>
        <button className="btn primary" onClick={add}>
          + Add line
        </button>
      </div>
    </div>
  );
}
