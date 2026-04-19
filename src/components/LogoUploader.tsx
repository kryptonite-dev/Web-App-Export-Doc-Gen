import React from 'react';
import { Card, Input, Label } from './ui';

type Props = {
  value?: string;
  widthPt?: number;
  onChange: (dataUrl?: string) => void;
  onWidthChange: (w: number) => void;
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function LogoUploader({ value, widthPt, onChange, onWidthChange }: Props) {
  return (
    <Card title="Company Logo">
      <div className="grid" style={{ gap: 8 }}>
        <Label>Upload logo (PNG/JPG, &lt; 400KB แนะนำ)</Label>
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.currentTarget.files?.[0];
            if (!f) return;
            if (f.size > 1024 * 1024 * 2) { // 2MB guard
              alert('ไฟล์ใหญ่เกินไป (เกิน 2MB) — กรุณาลดขนาดรูป');
              return;
            }
            const dataUrl = await readAsDataUrl(f);
            onChange(dataUrl);
          }}
        />
        {value ? (
          <>
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <img src={value} alt="logo preview" style={{ height: 40, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(212,175,55,.45)', background: 'rgba(255,255,255,.06)', padding: 4 }} />
              <button className="btn" onClick={() => onChange(undefined)}>Remove</button>
            </div>
            <div className="grid">
              <Label>Logo width in PDF (pt)</Label>
              <Input
                type="number"
                min={60}
                max={200}
                value={widthPt ?? 100}
                onChange={(e) => onWidthChange(Math.max(60, Math.min(200, Number(e.target.value) || 100)))}
              />
              <span className="muted">* 1 pt ≈ 1/72 inch • แนะนำ 80–140 pt</span>
            </div>
          </>
        ) : (
          <span className="muted">ยังไม่ได้เลือกไฟล์</span>
        )}
      </div>
    </Card>
  );
}
