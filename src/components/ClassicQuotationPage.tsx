import React, { useState } from 'react';
import { Card, Input, Label, Select, Textarea } from './ui';
import LogoUploader from './LogoUploader';
import { fmt, todayISO } from '../utils';
import {
  INCOTERMS_PRESETS,
  LINE_ITEM_UNIT_PRESETS,
  MIN_QTY_UNIT_PRESETS,
  PAYMENT_PRESETS,
  UNIT_CUSTOM_LABEL,
} from '../constants';

export type ClassicQuotation = {
  logoDataUrl?: string;
  logoWidth: number;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  attention: string;
  fromPerson: string;
  subject: string;
  deliveryTerm: string;
  date: string;
  pages: string;
  refNo: string;
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
const isPreset = (value: string, presets: string[]) => presets.includes(value);

type PdfStatus = {
  lead: string;
  filename: string;
  tail: string;
};

function sanitizeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'classic-quotation';
}

function formatFilenameTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function buildClassicPdfBaseName(quote: ClassicQuotation, date = new Date()) {
  const buyer = quote.buyerName || quote.attention || quote.refNo || 'classic-quotation';
  const qty = `${fmt(quote.minQtyValue, 0)}${quote.minQtyUnit || 'unit'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `${sanitizeFilename(buyer)}_${qty}_${formatFilenameTimestamp(date)}`;
}

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
    subject: 'QUOTATION FOR COCONUT BLOSSOM JUICE 150 ML',
    deliveryTerm: 'FCA BANGKOK / KHLONG TOEI, THAILAND INCOTERMS 2020',
    date: todayISO(),
    pages: '1 of 1',
    refNo: 'FAHLADDA/TFX-2026-001',
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

export default function ClassicQuotationPage() {
  const [quote, setQuote] = useState<ClassicQuotation>(() => defaultClassicQuotation());
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<PdfStatus | null>(null);

  const update = <K extends keyof ClassicQuotation>(key: K, value: ClassicQuotation[K]) => {
    setQuote((current) => ({ ...current, [key]: value }));
  };

  const quantityLabel = `${fmt(quote.minQtyValue, 0)} ${quote.minQtyUnit}`;
  const deliverySelectValue = isPreset(quote.deliveryTerm, INCOTERMS_PRESETS)
    ? quote.deliveryTerm
    : UNIT_CUSTOM_LABEL;
  const paymentSelectValue = isPreset(quote.paymentTerms, PAYMENT_PRESETS)
    ? quote.paymentTerms
    : UNIT_CUSTOM_LABEL;
  const moqUnitSelectValue = isPreset(quote.minQtyUnit, MIN_QTY_UNIT_PRESETS)
    ? quote.minQtyUnit
    : UNIT_CUSTOM_LABEL;
  const priceUnitSelectValue = isPreset(quote.priceUnit, LINE_ITEM_UNIT_PRESETS)
    ? quote.priceUnit
    : UNIT_CUSTOM_LABEL;

  const handleOpenClassicPdf = async () => {
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.title = 'Preparing PDF...';
      popup.document.body.innerHTML =
        '<div style="font-family: Avenir Next, Segoe UI, sans-serif; padding: 24px; color: #5b4532;">Preparing PDF...</div>';
    }

    try {
      setIsOpeningPdf(true);
      setPdfStatus(null);
      const [{ pdf }, { default: ClassicQuotationPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PDF/ClassicQuotationPDF'),
      ]);
      const fileBaseName = buildClassicPdfBaseName(quote);
      const blob = await pdf(
        <ClassicQuotationPDF
          quote={quote}
          defaultLogoSrc={new URL(DEFAULT_CLASSIC_LOGO_SRC, window.location.origin).toString()}
        />,
      ).toBlob();
      const file =
        typeof File === 'function'
          ? new File([blob], `${fileBaseName}.pdf`, { type: 'application/pdf' })
          : blob;
      const url = URL.createObjectURL(file);

      if (popup) {
        popup.location.replace(url);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10 * 60_000);

      setPdfStatus({
        lead: 'PDF opened in a new tab as',
        filename: fileBaseName,
        tail: '.pdf. Use the browser PDF viewer to download if needed.',
      });
    } catch (error) {
      if (popup) popup.close();
      console.error(error);
      setPdfStatus({
        lead: 'PDF export failed.',
        filename: '',
        tail: ' Check the console for details.',
      });
    } finally {
      setIsOpeningPdf(false);
    }
  };

  return (
    <div className="classic-page">
      <div className="classic-layout workspace classic-workspace">
        <div className="classic-editor editor-column">
          <Card title="Classic quotation readiness">
            <div className="score-row">
              <div>
                <div className="score-label">Input mode</div>
                <div className="score-value">A4</div>
              </div>
              <div className="muted">
                ใช้ field และ card pattern เดียวกับ Proposal Studio ส่วน preview และ PDF
                ด้านขวายังใช้ layout เอกสารเดิม
              </div>
            </div>
            <div className="checklist">
              {['Brand and seller profile', 'Buyer and document setup', 'Commercial terms'].map(
                (item) => (
                  <div key={item} className="checklist-item ok">
                    <span className="checklist-dot" />
                    <span>{item}</span>
                  </div>
                ),
              )}
            </div>
          </Card>

          <Card title="Event and seller profile">
            <LogoUploader
              value={quote.logoDataUrl}
              widthPt={quote.logoWidth}
              onChange={(value) => update('logoDataUrl', value)}
              onWidthChange={(value) => update('logoWidth', value)}
            />
            <span className="muted">
              ถ้ายังไม่ upload ระบบจะใช้ HuqKhuun Gold Logo เป็น default ใน preview และ PDF
            </span>

            <div className="section-gap" />

            <div className="grid two-col">
              <div className="grid">
                <Label>Seller company</Label>
                <Input
                  value={quote.sellerName}
                  onChange={(event) => update('sellerName', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>From</Label>
                <Input
                  value={quote.fromPerson}
                  onChange={(event) => update('fromPerson', event.target.value)}
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
            </div>
          </Card>

          <Card title="Buyer and document setup">
            <div className="grid two-col">
              <div className="grid">
                <Label>Buyer company</Label>
                <Input
                  value={quote.buyerName}
                  onChange={(event) => update('buyerName', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Attention</Label>
                <Input
                  value={quote.attention}
                  onChange={(event) => update('attention', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Buyer address</Label>
                <Textarea
                  rows={4}
                  value={quote.buyerAddress}
                  onChange={(event) => update('buyerAddress', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Issued date</Label>
                <Input
                  type="date"
                  value={quote.date}
                  onChange={(event) => update('date', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Pages</Label>
                <Input
                  value={quote.pages}
                  onChange={(event) => update('pages', event.target.value)}
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
                <Label>Subject line</Label>
                <Input
                  value={quote.subject}
                  onChange={(event) => update('subject', event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Commercial terms">
            <div className="grid two-col">
              <div className="grid full-span">
                <Label>Term of delivery</Label>
                <Select
                  value={deliverySelectValue}
                  onChange={(value) => {
                    if (value === UNIT_CUSTOM_LABEL) {
                      update(
                        'deliveryTerm',
                        isPreset(quote.deliveryTerm, INCOTERMS_PRESETS) ? '' : quote.deliveryTerm,
                      );
                      return;
                    }
                    update('deliveryTerm', value);
                  }}
                  options={[...INCOTERMS_PRESETS, UNIT_CUSTOM_LABEL]}
                  placeholder="Select delivery preset"
                />
                {deliverySelectValue === UNIT_CUSTOM_LABEL ? (
                  <Input
                    value={quote.deliveryTerm}
                    onChange={(event) => update('deliveryTerm', event.target.value)}
                    placeholder="Or type a custom delivery term"
                  />
                ) : null}
              </div>
              <div className="grid full-span">
                <Label>Payment terms</Label>
                <Select
                  value={paymentSelectValue}
                  onChange={(value) => {
                    if (value === UNIT_CUSTOM_LABEL) {
                      update(
                        'paymentTerms',
                        isPreset(quote.paymentTerms, PAYMENT_PRESETS) ? '' : quote.paymentTerms,
                      );
                      return;
                    }
                    update('paymentTerms', value);
                  }}
                  options={[...PAYMENT_PRESETS, UNIT_CUSTOM_LABEL]}
                  placeholder="Select payment preset"
                />
                {paymentSelectValue === UNIT_CUSTOM_LABEL ? (
                  <Input
                    value={quote.paymentTerms}
                    onChange={(event) => update('paymentTerms', event.target.value)}
                    placeholder="Or type custom payment terms"
                  />
                ) : null}
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
                <Label>MOQ value</Label>
                <Input
                  type="number"
                  value={quote.minQtyValue}
                  onChange={(event) => update('minQtyValue', Number(event.target.value) || 0)}
                />
              </div>
              <div className="grid">
                <Label>MOQ unit</Label>
                <Select
                  value={moqUnitSelectValue}
                  onChange={(value) => {
                    if (value === UNIT_CUSTOM_LABEL) {
                      update(
                        'minQtyUnit',
                        isPreset(quote.minQtyUnit, MIN_QTY_UNIT_PRESETS) ? '' : quote.minQtyUnit,
                      );
                      return;
                    }
                    update('minQtyUnit', value);
                  }}
                  options={[...MIN_QTY_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                  placeholder="Select unit"
                />
                {moqUnitSelectValue === UNIT_CUSTOM_LABEL ? (
                  <Input
                    value={quote.minQtyUnit}
                    onChange={(event) => update('minQtyUnit', event.target.value)}
                    placeholder="Custom MOQ unit"
                  />
                ) : null}
              </div>
            </div>
          </Card>

          <Card title="Products and buyer-facing proof">
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
                <Select
                  value={priceUnitSelectValue}
                  onChange={(value) => {
                    if (value === UNIT_CUSTOM_LABEL) {
                      update(
                        'priceUnit',
                        isPreset(quote.priceUnit, LINE_ITEM_UNIT_PRESETS) ? '' : quote.priceUnit,
                      );
                      return;
                    }
                    update('priceUnit', value);
                  }}
                  options={[...LINE_ITEM_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                  placeholder="Choose unit"
                />
                {priceUnitSelectValue === UNIT_CUSTOM_LABEL ? (
                  <Input
                    value={quote.priceUnit}
                    onChange={(event) => update('priceUnit', event.target.value)}
                    placeholder="Custom price unit"
                  />
                ) : null}
              </div>
            </div>
          </Card>

          <Card title="Closing and signature">
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
                  <Label>Closing line 1</Label>
                  <Textarea
                    rows={3}
                    value={quote.closingLine1}
                    onChange={(event) => update('closingLine1', event.target.value)}
                  />
                </div>
                <div className="grid">
                  <Label>Closing line 2</Label>
                  <Textarea
                    rows={3}
                    value={quote.closingLine2}
                    onChange={(event) => update('closingLine2', event.target.value)}
                  />
                </div>
              </div>
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

          <Card title="Field guide">
            <div className="classic-guide-grid">
              {FIELD_GUIDE.map((item, index) => (
                <React.Fragment key={item}>
                  <div>{index + 1}</div>
                  <div>{item}</div>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        <div className="classic-preview-column preview-column">
          <div className="preview-shell classic-preview-shell">
            <div className="preview-head classic-toolbar classic-preview-head">
              <div>
                <div className="preview-eyebrow">Online preview</div>
                <h2>Classic quotation</h2>
                <p>เอกสารด้านล่างจะเปิดเป็น PDF ในแท็บใหม่เหมือนหน้า Proposal</p>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={handleOpenClassicPdf}
                disabled={isOpeningPdf}
              >
                {isOpeningPdf ? 'Preparing PDF...' : 'Open PDF'}
              </button>
            </div>
            {pdfStatus ? (
              <div className="classic-pdf-status">
                <span>{pdfStatus.lead}</span>
                {pdfStatus.filename ? <strong>{pdfStatus.filename}</strong> : null}
                <span>{pdfStatus.tail}</span>
              </div>
            ) : null}

            <section className="classic-sheet quote-sheet-v2" aria-label="Classic quotation preview">
              <header className="quote-v2-header">
                <div className="quote-v2-brand">
                  <img
                    src={quote.logoDataUrl || DEFAULT_CLASSIC_LOGO_SRC}
                    alt="Company logo"
                    className="quote-v2-logo"
                    style={{ maxWidth: quote.logoWidth }}
                  />
                  <div>
                    <h2>{quote.sellerName}</h2>
                    {blockLines(quote.sellerAddress).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
                <div className="quote-v2-title">QUOTATION</div>
              </header>

              <section className="quote-v2-top">
                <div className="quote-v2-party quote-v2-party-wide">
                  <div className="quote-v2-label">Seller</div>
                  <strong>{quote.sellerName}</strong>
                  {blockLines(quote.sellerAddress).map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
                <dl className="quote-v2-meta">
                  <div>
                    <dt>Date</dt>
                    <dd>{formatDisplayDate(quote.date)}</dd>
                  </div>
                  <div>
                    <dt>Pages</dt>
                    <dd>{quote.pages}</dd>
                  </div>
                  <div>
                    <dt>Our Ref.</dt>
                    <dd>{quote.refNo}</dd>
                  </div>
                </dl>
                <div className="quote-v2-party quote-v2-party-full">
                  <div className="quote-v2-label">Buyer</div>
                  <strong>{quote.buyerName}</strong>
                  {blockLines(quote.buyerAddress).map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </section>

              <section className="quote-v2-strip">
                <div>
                  <span>Attn</span>
                  <strong>{quote.attention || '-'}</strong>
                </div>
                <div>
                  <span>From</span>
                  <strong>{quote.fromPerson || '-'}</strong>
                </div>
                <div className="quote-v2-strip-wide">
                  <span>Subject</span>
                  <strong>{quote.subject}</strong>
                </div>
              </section>

              <section className="quote-v2-delivery">
                <div>
                  <span>Term of delivery</span>
                  <strong>{quote.deliveryTerm}</strong>
                </div>
                <p>Price quotation for {quote.buyerName}</p>
              </section>

              <section className="quote-v2-goods">
                <div className="quote-v2-section-title">Description of goods</div>
                <strong>{quote.description}</strong>
                <div className="quote-v2-goods-grid">
                  <div>
                    <span>Shipping mark</span>
                    <strong>{quote.shippingMark}</strong>
                  </div>
                  <div>
                    <span>{`Price / ${quote.priceUnit}`}</span>
                    <strong>
                      {quote.priceCurrency} {fmt(quote.priceValue, 2)}
                    </strong>
                  </div>
                  <div>
                    <span>Min. Qty / Order</span>
                    <strong>{quantityLabel}</strong>
                  </div>
                </div>
              </section>

              <section className="quote-v2-payment">
                <div className="quote-v2-payment-main">
                  <div className="quote-v2-section-title">Payment and bank details</div>
                  <dl>
                    <div>
                      <dt>Term of payment</dt>
                      <dd>{quote.paymentTerms}</dd>
                    </div>
                    <div>
                      <dt>Seller's bank</dt>
                      <dd>{quote.sellerBank}</dd>
                    </div>
                    <div>
                      <dt>Address</dt>
                      <dd>{quote.bankAddress}</dd>
                    </div>
                    <div>
                      <dt>Swift code</dt>
                      <dd>{quote.swiftCode}</dd>
                    </div>
                  </dl>
                </div>
                <div className="quote-v2-exchange">
                  <span>Exchange rate</span>
                  <strong>1 USD = {fmt(quote.fxRate, 2)} THB</strong>
                </div>
              </section>

              <section className="quote-v2-closing">
                <div className="quote-v2-message">
                  <p>{quote.closingLine1}</p>
                  <p>{quote.closingLine2}</p>
                </div>
                <div className="quote-v2-signature">
                  <p>Sincerely yours,</p>
                  <div className="quote-v2-sign-space" />
                  <strong>{quote.signName}</strong>
                  <span>{quote.signTitle}</span>
                </div>
              </section>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
