import React, { useState } from 'react';
import { Card, Input, Label, Textarea } from './ui';
import { fmt, todayISO } from '../utils';

type ClassicQuotation = {
  logoDataUrl?: string;
  logoWidth: number;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  attention: string;
  fromPerson: string;
  fax: string;
  subject: string;
  deliveryTerm: string;
  date: string;
  pages: string;
  refNo: string;
  brand: string;
  description: string;
  shippingMark: string;
  priceCurrency: string;
  priceValue: number;
  priceUnit: string;
  minQtyValue: number;
  minQtyUnit: string;
  paymentTerms: string;
  sellerBank: string;
  bankAddress: string;
  swiftCode: string;
  fxRate: number;
  closingLine1: string;
  closingLine2: string;
  signName: string;
  signTitle: string;
};

const FIELD_GUIDE = [
  'ชื่อและที่อยู่ของผู้ส่งออก',
  'ชื่อและที่อยู่ของผู้ซื้อ',
  'ATTN : ชื่อผู้ที่จะส่งใบเสนอราคาให้ เช่น ฝ่ายจัดซื้อ นำเข้า หรือผู้บริหาร',
  'FROM : ชื่อผู้เสนอราคา',
  'SUBJECT : หัวข้อที่จะเสนอราคา ส่วนใหญ่เป็นชื่อสินค้า',
  'OUR REF. : รหัสอ้างอิงของใบเสนอราคา',
  'ข้อตกลงหรือเงื่อนไขในการส่งมอบสินค้า',
  'ชื่อตราสินค้า / Shipping mark',
  'ราคา',
  'ยอดสั่งซื้อขั้นต่ำ',
  'เงื่อนไขการชำระเงิน',
  'ธนาคารของผู้ขาย',
  'อัตราแลกเปลี่ยน',
  'คำลงท้าย',
  'ประทับตราบริษัท และเซ็นชื่อผู้เสนอราคา',
];

const DEFAULT_CLASSIC_LOGO_SRC = '/huqkhuun-gold-logo.png';

function defaultClassicQuotation(): ClassicQuotation {
  return {
    logoDataUrl: undefined,
    logoWidth: 160,
    sellerName: 'FAH LADDA CO., LTD.',
    sellerAddress: '79/1 Moo1, Klongtan, Ban Phaeo, Samut Sakhon, 74120, Thailand',
    buyerName: 'PROSPECTIVE BUYER',
    buyerAddress: 'Company / Country\nUpdate after the booth conversation',
    attention: 'Procurement Team',
    fromPerson: 'Taninnuth Warittarasith',
    fax: '',
    subject: 'QUOTATION FOR COCONUT BLOSSOM JUICE 150 ML',
    deliveryTerm: 'FCA BANGKOK / KHLONG TOEI, THAILAND INCOTERMS 2020',
    date: todayISO(),
    pages: '1 of 1',
    refNo: 'FAHLADDA/TFX-2026-001',
    brand: 'HUQ KHUUN',
    description: 'Coconut Blossom Juice 150 ml (24 bottles / carton)',
    shippingMark: 'HUQ KHUUN',
    priceCurrency: 'USD',
    priceValue: 0,
    priceUnit: 'CTN',
    minQtyValue: 2,
    minQtyUnit: 'PALLET',
    paymentTerms: '100% Advance Payment',
    sellerBank: 'EXPORT IMPORT BANK OF THAILAND',
    bankAddress: 'EXIM BLDG., 14TH FLOOR, 1193 PHAHOLYOTHIN RD, PHAYATHAI, BANGKOK 10400',
    swiftCode: 'EXTHTHBKXXX',
    fxRate: 32,
    closingLine1:
      'Hoping the above is acceptable to you. If you need further information, Please do not hesitate to',
    closingLine2: 'contact us, we look forward for your favourable reply.',
    signName: 'Taninnuth Warittarasith',
    signTitle: 'Co-Founder',
  };
}

function formatDisplayDate(value: string) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return value;
  const month = date.toLocaleString('en-US', { month: 'long' });
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

function blockLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ClassicQuotationPage() {
  const [quote, setQuote] = useState<ClassicQuotation>(() => defaultClassicQuotation());

  const update = <K extends keyof ClassicQuotation>(key: K, value: ClassicQuotation[K]) => {
    setQuote((current) => ({ ...current, [key]: value }));
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) {
      alert('ไฟล์ใหญ่เกินไป (เกิน 2MB) — กรุณาลดขนาดรูป');
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    update('logoDataUrl', dataUrl);
    event.currentTarget.value = '';
  };

  const subtotal = quote.priceValue * quote.minQtyValue;
  const quantityLabel = `${fmt(quote.minQtyValue, 0)} ${quote.minQtyUnit}`;
  const totalLabel = `${quote.priceCurrency} ${fmt(subtotal, 2)}`;

  return (
    <div className="classic-page">
      <div className="classic-layout">
        <div className="classic-editor">
          <Card title="Document logo">
            <div className="grid">
              <Label>Upload logo</Label>
              <input className="input" type="file" accept="image/*" onChange={handleLogoChange} />
              {quote.logoDataUrl ? (
                <div className="classic-logo-control">
                  <img src={quote.logoDataUrl} alt="Uploaded logo preview" />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => update('logoDataUrl', undefined)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="muted">
                  ถ้ายังไม่ upload ระบบจะใช้ HuqKhuun Gold Logo เป็น default
                </span>
              )}
              <div className="grid">
                <Label>Logo width</Label>
                <Input
                  type="number"
                  min={56}
                  max={260}
                  value={quote.logoWidth}
                  onChange={(event) =>
                    update(
                      'logoWidth',
                      Math.max(56, Math.min(260, Number(event.target.value) || 160)),
                    )
                  }
                />
              </div>
            </div>
          </Card>

          <Card title="Classic quotation inputs">
            <div className="grid two-col">
              <div className="grid">
                <Label>Seller company</Label>
                <Input
                  value={quote.sellerName}
                  onChange={(event) => update('sellerName', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Buyer company</Label>
                <Input
                  value={quote.buyerName}
                  onChange={(event) => update('buyerName', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Seller address</Label>
                <Textarea
                  rows={3}
                  value={quote.sellerAddress}
                  onChange={(event) => update('sellerAddress', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Buyer address</Label>
                <Textarea
                  rows={3}
                  value={quote.buyerAddress}
                  onChange={(event) => update('buyerAddress', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Attention</Label>
                <Input
                  value={quote.attention}
                  onChange={(event) => update('attention', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>From</Label>
                <Input
                  value={quote.fromPerson}
                  onChange={(event) => update('fromPerson', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={quote.date}
                  onChange={(event) => update('date', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Our ref.</Label>
                <Input
                  value={quote.refNo}
                  onChange={(event) => update('refNo', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Subject</Label>
                <Input
                  value={quote.subject}
                  onChange={(event) => update('subject', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Term of delivery</Label>
                <Input
                  value={quote.deliveryTerm}
                  onChange={(event) => update('deliveryTerm', event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Goods and commercial terms">
            <div className="grid two-col">
              <div className="grid full-span">
                <Label>Description of goods</Label>
                <Textarea
                  rows={3}
                  value={quote.description}
                  onChange={(event) => update('description', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Shipping mark</Label>
                <Input
                  value={quote.shippingMark}
                  onChange={(event) => update('shippingMark', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Brand</Label>
                <Input
                  value={quote.brand}
                  onChange={(event) => update('brand', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Price currency</Label>
                <Input
                  value={quote.priceCurrency}
                  onChange={(event) => update('priceCurrency', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Price / unit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quote.priceValue}
                  onChange={(event) => update('priceValue', Number(event.target.value) || 0)}
                />
              </div>
              <div className="grid">
                <Label>Price unit</Label>
                <Input
                  value={quote.priceUnit}
                  onChange={(event) => update('priceUnit', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>MOQ value</Label>
                <Input
                  type="number"
                  value={quote.minQtyValue}
                  onChange={(event) => update('minQtyValue', Number(event.target.value) || 0)}
                />
              </div>
              <div className="grid">
                <Label>MOQ unit</Label>
                <Input
                  value={quote.minQtyUnit}
                  onChange={(event) => update('minQtyUnit', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Exchange rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quote.fxRate}
                  onChange={(event) => update('fxRate', Number(event.target.value) || 0)}
                />
              </div>
              <div className="grid">
                <Label>Payment terms</Label>
                <Input
                  value={quote.paymentTerms}
                  onChange={(event) => update('paymentTerms', event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Bank and signature">
            <div className="grid">
              <Label>Seller bank</Label>
              <Input
                value={quote.sellerBank}
                onChange={(event) => update('sellerBank', event.target.value)}
              />
              <Label>Bank address</Label>
              <Textarea
                rows={3}
                value={quote.bankAddress}
                onChange={(event) => update('bankAddress', event.target.value)}
              />
              <Label>Swift code</Label>
              <Input
                value={quote.swiftCode}
                onChange={(event) => update('swiftCode', event.target.value)}
              />
              <div className="grid two-col">
                <div className="grid">
                  <Label>Signature name</Label>
                  <Input
                    value={quote.signName}
                    onChange={(event) => update('signName', event.target.value)}
                  />
                </div>
                <div className="grid">
                  <Label>Signature title</Label>
                  <Input
                    value={quote.signTitle}
                    onChange={(event) => update('signTitle', event.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="classic-preview-column">
          <div className="classic-toolbar">
            <span>New isolated quotation layout. Existing proposal/PDF is untouched.</span>
            <button type="button" className="btn" onClick={() => window.print()}>
              Print
            </button>
          </div>

          <section className="classic-sheet" aria-label="Classic quotation preview">
            <header className="classic-invoice-header">
              <div className="classic-header-main">
                <div className="classic-logo-slot">
                  <img
                    src={quote.logoDataUrl || DEFAULT_CLASSIC_LOGO_SRC}
                    alt="Company logo"
                    className="classic-logo-image"
                    style={{ maxWidth: quote.logoWidth }}
                  />
                </div>
                <div>
                  <h2>QUOTATION</h2>
                  <p>{quote.sellerName}</p>
                  <span>{quote.subject}</span>
                </div>
              </div>

              <div className="classic-document-meta">
                <p>
                  <strong>Quotation No:</strong>
                  <span>{quote.refNo}</span>
                </p>
                <p>
                  <strong>Date:</strong>
                  <span>{formatDisplayDate(quote.date)}</span>
                </p>
                <p>
                  <strong>Validity:</strong>
                  <span>30 Days</span>
                </p>
                <p>
                  <strong>Currency:</strong>
                  <span>{quote.priceCurrency}</span>
                </p>
              </div>
            </header>

            <div className="classic-address-grid">
              <section className="classic-address-card">
                <h3>From (Exporter)</h3>
                <strong>{quote.sellerName}</strong>
                {blockLines(quote.sellerAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>Email: huqkhuun@gmail.com</p>
                <p>Web: huqkhuun.com</p>
              </section>

              <section className="classic-address-card">
                <h3>To (Importer)</h3>
                <strong>{quote.buyerName}</strong>
                {blockLines(quote.buyerAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>Attn: {quote.attention || '-'}</p>
              </section>
            </div>

            <div className="classic-logistics-grid">
              <div>
                <span>Incoterms 2020</span>
                <strong>{quote.deliveryTerm}</strong>
              </div>
              <div>
                <span>Payment Terms</span>
                <strong>{quote.paymentTerms}</strong>
              </div>
              <div>
                <span>Port of Loading</span>
                <strong>Bangkok, Thailand</strong>
              </div>
              <div>
                <span>Shipping Mark</span>
                <strong>{quote.shippingMark}</strong>
              </div>
            </div>

            <div className="classic-table-wrap">
              <table className="classic-items-table">
                <thead>
                  <tr>
                    <th>Description of Goods</th>
                    <th>Brand</th>
                    <th className="center">Qty</th>
                    <th className="right">Unit Price ({quote.priceCurrency})</th>
                    <th className="right">Total ({quote.priceCurrency})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{quote.description}</strong>
                      <span>Price basis: {quote.priceUnit}</span>
                    </td>
                    <td>{quote.brand}</td>
                    <td className="center">{quantityLabel}</td>
                    <td className="right">
                      {quote.priceCurrency} {fmt(quote.priceValue, 2)}
                    </td>
                    <td className="right strong">{fmt(subtotal, 2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} />
                    <td>Subtotal</td>
                    <td>{fmt(subtotal, 2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} />
                    <td>Tax / VAT (0%)</td>
                    <td>{fmt(0, 2)}</td>
                  </tr>
                  <tr className="classic-grand-total">
                    <td colSpan={3} />
                    <td>Grand Total</td>
                    <td>{totalLabel}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="classic-payment-grid">
              <section className="classic-bank-card">
                <h4>Bank Account Information (International Transfer)</h4>
                <p>
                  <strong>Beneficiary:</strong>
                  <span>{quote.sellerName}</span>
                </p>
                <p>
                  <strong>Bank Name:</strong>
                  <span>{quote.sellerBank}</span>
                </p>
                <p>
                  <strong>Bank Address:</strong>
                  <span>{quote.bankAddress}</span>
                </p>
                <p>
                  <strong>SWIFT Code:</strong>
                  <span>{quote.swiftCode}</span>
                </p>
              </section>

              <section className="classic-remarks-card">
                <h4>Remarks</h4>
                <ul>
                  <li>All banking fees outside Thailand are borne by the buyer.</li>
                  <li>
                    Exchange rate reference: 1 USD = {fmt(quote.fxRate, 2)} THB.
                  </li>
                  <li>{quote.closingLine1} {quote.closingLine2}</li>
                </ul>
                <div className="classic-signature-pair">
                  <div className="classic-sign-box">
                    <span>Authorized Signature</span>
                    <strong>{quote.signName}</strong>
                    <p>{quote.signTitle}</p>
                  </div>
                  <div className="classic-sign-box muted-sign">
                    <span>Customer Acceptance</span>
                    <strong>Date & Stamp</strong>
                    <p>&nbsp;</p>
                  </div>
                </div>
              </section>
            </div>

            <footer className="classic-invoice-footer">
              Prepared by {quote.fromPerson} | {quote.sellerName}
            </footer>
          </section>

          <section className="classic-guide">
            <h3>รายละเอียดในใบเสนอราคาเพื่อการส่งออกเบื้องต้น (Quotation)</h3>
            <div className="classic-guide-grid">
              {FIELD_GUIDE.map((item, index) => (
                <React.Fragment key={item}>
                  <div>{index + 1}</div>
                  <div>{item}</div>
                </React.Fragment>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
