import React from 'react';
import { Currency, LineItem } from '../types';
import { Input, Label, Select, Textarea } from './ui';
import {
  GOODS_DESCRIPTION_CUSTOM_LABEL,
  GOODS_DESCRIPTION_PRESETS,
  LINE_ITEM_UNIT_PRESETS,
  UNIT_CUSTOM_LABEL,
} from '../constants';

const CURRENCY_OPTIONS = ['USD', 'THB', 'EUR', 'AED'];

const isPresetDescription = (description: string) =>
  GOODS_DESCRIPTION_PRESETS.includes(description);

const isPresetUnit = (unit: string) => LINE_ITEM_UNIT_PRESETS.includes(unit);

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
        description: GOODS_DESCRIPTION_PRESETS[0],
        unit: 'CTN',
        qty: 0,
        unitPrice: { currency, value: 0 },
      },
    ]);

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <div className="grid" style={{ gap: 4 }}>
          <Label>รายการสินค้า / Line Items</Label>
          <div className="muted" style={{ fontSize: 12 }}>
            Choose a preset to move faster, then fine-tune the exact wording below.
          </div>
        </div>

        <div className="grid" style={{ gap: 6, minWidth: 120 }}>
          <Label>Currency</Label>
          <select
            value={currency}
            onChange={(event) => onCurrency(event.target.value)}
            className="input"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid" style={{ gap: 12 }}>
        {items.map((item, index) => {
          const description = item.description || '';
          const unit = item.unit || '';
          const descriptionSelectValue = isPresetDescription(description)
            ? description
            : GOODS_DESCRIPTION_CUSTOM_LABEL;
          const unitSelectValue = isPresetUnit(unit) ? unit : UNIT_CUSTOM_LABEL;

          return (
            <div
              key={index}
              style={{
                border: '1px solid rgba(21, 37, 56, 0.1)',
                borderRadius: 22,
                padding: 16,
                background: 'rgba(255, 255, 255, 0.78)',
                boxShadow: '0 14px 28px rgba(17, 31, 47, 0.06)',
              }}
            >
              <div
                className="row"
                style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}
              >
                <div className="grid" style={{ gap: 4 }}>
                  <div className="label">Line {index + 1}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Product description stays editable even after choosing a preset.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn"
                  onClick={() => remove(index)}
                  aria-label={`Remove line ${index + 1}`}
                  style={{
                    color: '#9a4c3f',
                    borderColor: 'rgba(178, 75, 61, 0.18)',
                    background: 'rgba(178, 75, 61, 0.06)',
                  }}
                >
                  Remove
                </button>
              </div>

              <div className="grid" style={{ gap: 12, marginTop: 14 }}>
                <div className="grid" style={{ gap: 6 }}>
                  <Label>Description template</Label>
                  <Select
                    value={descriptionSelectValue}
                    onChange={(value) => {
                      if (value === GOODS_DESCRIPTION_CUSTOM_LABEL) {
                        update(index, {
                          description: isPresetDescription(description) ? '' : description,
                        });
                        return;
                      }
                      update(index, { description: value });
                    }}
                    options={[...GOODS_DESCRIPTION_PRESETS, GOODS_DESCRIPTION_CUSTOM_LABEL]}
                    placeholder="Choose a common product"
                  />
                </div>

                <div className="grid" style={{ gap: 6 }}>
                  <Label>Description of goods</Label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(event) => update(index, { description: event.target.value })}
                    placeholder="Type the exact product description to show in the proposal and PDF"
                    style={{ minHeight: 84 }}
                  />
                  <div className="muted" style={{ fontSize: 12 }}>
                    This is the final customer-facing product name.
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: 10,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    alignItems: 'start',
                  }}
                >
                  <div className="grid" style={{ gap: 6 }}>
                    <Label>Unit</Label>
                    <Select
                      value={unitSelectValue}
                      onChange={(value) => {
                        if (value === UNIT_CUSTOM_LABEL) {
                          update(index, {
                            unit: isPresetUnit(unit) ? '' : unit,
                          });
                          return;
                        }
                        update(index, { unit: value });
                      }}
                      options={[...LINE_ITEM_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                      placeholder="Choose unit"
                    />
                    {unitSelectValue === UNIT_CUSTOM_LABEL ? (
                      <Input
                        value={unit}
                        onChange={(event) => update(index, { unit: event.target.value })}
                        placeholder="Custom unit"
                      />
                    ) : null}
                  </div>

                  <div className="grid" style={{ gap: 6 }}>
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={Number.isFinite(item.qty) ? item.qty : 0}
                      onChange={(event) =>
                        update(index, {
                          qty: Number(event.target.value ?? 0) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="grid" style={{ gap: 6 }}>
                    <Label>Unit price</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={Number.isFinite(item.unitPrice?.value) ? item.unitPrice.value : 0}
                      onChange={(event) =>
                        update(index, {
                          unitPrice: {
                            currency,
                            value: Number(event.target.value ?? 0) || 0,
                          },
                        })
                      }
                      right={<span style={{ fontSize: 12 }}>{currency}</span>}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <div className="muted" style={{ fontSize: 12 }}>
          Use one card per offer line so the proposal stays readable during live sales meetings.
        </div>
        <button type="button" className="btn primary" onClick={add}>
          + Add line
        </button>
      </div>
    </div>
  );
}
