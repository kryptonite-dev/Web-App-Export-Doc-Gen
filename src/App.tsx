import React, { useEffect, useMemo, useState } from 'react';
import LineItemsEditor from './components/LineItemsEditor';
import MiniPriceCalculator from './components/MiniPriceCalculator';
import LogoUploader from './components/LogoUploader';
import ClientProposalView from './components/ClientProposalView';
import { Card, Input, Label, Select, Textarea } from './components/ui';
import {
  INCOTERMS_PRESETS,
  MIN_QTY_UNIT_PRESETS,
  PAYMENT_PRESETS,
  UNIT_CUSTOM_LABEL,
} from './constants';
import { CommonDoc, Currency, Party } from './types';
import { todayISO } from './utils';

const STORAGE_KEY = 'thaifex-sales-proposal-draft-v3';

function plusDaysISO(days: number) {
  const current = new Date();
  current.setDate(current.getDate() + days);
  const offset = current.getTimezoneOffset();
  const local = new Date(current.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function createInitialDoc(): CommonDoc {
  return {
    docType: 'Quotation',
    docNo: 'TFX-2026-001',
    subject: 'Buyer-ready quotation for Coconut Blossom Juice 250 ml',
    docDate: todayISO(),
    validUntil: plusDaysISO(45),
    seller: {
      name: 'FAH LADDA CO., LTD.',
      address: '79/1 Moo1, Klongtan, Ban Phaeo, Samut Sakhon, 74120, Thailand',
    },
    buyer: {
      name: 'Prospective Buyer',
      address: 'Company / Country\nUpdate after the booth conversation',
    },
    attn: 'Procurement Team',
    fromPerson: 'Taninnuth Warittarasith (TANIN)',
    fromTitle: 'Co-Founder',
    website: 'https://huqkhuun.com/',
    contactEmail: 'huqkhuun@gmail.com',
    contactPhone: '',
    eventName: 'THAIFEX - ANUGA ASIA 2026',
    eventDates: '26 - 30 May 2026',
    eventLocation: 'IMPACT Muang Thong Thani, Bangkok',
    boothNo: 'Hall 9 / Booth CC01',
    introNote:
      'This proposal is prepared for fast review during buyer meetings and clean follow-up after the show.',
    deliveryTerms: INCOTERMS_PRESETS[0],
    brand: 'Coconut Blossom Collection',
    minOrderQty: {
      value: 400,
      unit: 'CTN',
    },
    paymentTerms: PAYMENT_PRESETS[0],
    leadTime: '30-45 days after artwork confirmation',
    fxRate: 34,
    items: [
      {
        description: 'Coconut Blossom Juice 250 ml (24 bottles / carton)',
        unit: 'CTN',
        qty: 400,
        unitPrice: { currency: 'USD', value: 9.8 },
      },
      {
        description: 'Private label option with bilingual packaging support',
        unit: 'CTN',
        qty: 400,
        unitPrice: { currency: 'USD', value: 10.6 },
      },
    ],
    notes: [
      'Quoted prices are indicative for THAIFEX meetings and subject to final packaging and destination review.',
    ],
    productHighlights: [
      'Retail-ready pack size suitable for modern trade, gift, and specialty channels.',
      'OEM and private-label discussion can continue immediately after the meeting.',
      'Samples, specifications, and export document support can be prepared for shortlisted buyers.',
    ],
    certifications: [],
    closing:
      'Thank you for meeting with us at THAIFEX - ANUGA ASIA 2026. We would be pleased to follow up with samples, specifications, and final commercial confirmation for your market.',
    signTitle: 'Co-Founder',
    signatureName: 'Taninnuth Warittarasith (TANIN)',
    exchangeCurrency: 'USD',
    logoWidthPt: 110,
  };
}

function safeParseDraft(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as CommonDoc;
  } catch {
    return null;
  }
}

function hydrateDoc(source?: Partial<CommonDoc> | null): CommonDoc {
  const base = createInitialDoc();
  if (!source) return base;
  return {
    ...base,
    ...source,
    seller: {
      ...base.seller,
      ...(source.seller || {}),
    },
    buyer: {
      ...base.buyer,
      ...(source.buyer || {}),
    },
    website: source.website?.trim() ? source.website : base.website,
    contactEmail: source.contactEmail?.trim() ? source.contactEmail : base.contactEmail,
    items:
      source.items && source.items.length > 0
        ? source.items.map((item) => ({
            description: item.description || '',
            unit: item.unit || 'CTN',
            qty: item.qty || 0,
            unitPrice: {
              currency: item.unitPrice?.currency || base.exchangeCurrency || 'USD',
              value: item.unitPrice?.value || 0,
            },
          }))
        : base.items,
    notes: source.notes || base.notes,
    productHighlights: source.productHighlights || base.productHighlights,
    certifications: source.certifications || base.certifications,
    minOrderQty: source.minOrderQty || base.minOrderQty,
  };
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(`${padded}${'='.repeat(padLength)}`);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeSharePayload(doc: CommonDoc) {
  const shareable: CommonDoc = {
    ...doc,
    logoDataUrl: undefined,
    signatureImageDataUrl: undefined,
  };
  return toBase64Url(JSON.stringify(shareable));
}

function decodeSharePayload(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(fromBase64Url(value)) as CommonDoc;
  } catch {
    return null;
  }
}

function getRouteContext() {
  const params = new URLSearchParams(window.location.search);
  return {
    isClientView: params.get('view') === 'client',
    sharedDoc: decodeSharePayload(params.get('payload')),
  };
}

function buildClientUrl(doc: CommonDoc, withPayload: boolean) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('view', 'client');
  if (withPayload) {
    url.searchParams.set('payload', encodeSharePayload(doc));
  }
  return url.toString();
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatInputLines(lines?: string[]) {
  return (lines || []).join('\n');
}

function parseInputLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function sanitizeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'quotation'
  );
}

function App() {
  const route = getRouteContext();
  const [doc, setDoc] = useState<CommonDoc>(() => {
    if (route.sharedDoc) return hydrateDoc(route.sharedDoc);
    return hydrateDoc(safeParseDraft(localStorage.getItem(STORAGE_KEY)));
  });
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; filename: string } | null>(null);

  useEffect(() => {
    if (route.isClientView) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  }, [doc, route.isClientView]);

  useEffect(() => {
    document.title = route.isClientView
      ? `${doc.subject || 'Client Proposal'} | Client View`
      : 'ThaiFex Sales Proposal Studio';
  }, [doc.subject, route.isClientView]);

  useEffect(() => {
    return () => {
      if (pdfPreview?.url) {
        URL.revokeObjectURL(pdfPreview.url);
      }
    };
  }, [pdfPreview]);

  const deliveryPresetSelected = INCOTERMS_PRESETS.includes(doc.deliveryTerms);
  const paymentPresetSelected = PAYMENT_PRESETS.includes(doc.paymentTerms);
  const minQtyUnit = doc.minOrderQty?.unit || '';
  const minQtyPresetSelected = MIN_QTY_UNIT_PRESETS.includes(minQtyUnit);

  const readiness = useMemo(
    () => [
      {
        ok: Boolean(doc.buyer.name.trim() && doc.attn.trim()),
        label: 'Buyer and contact person are identified',
      },
      {
        ok: Boolean(doc.contactEmail?.trim() || doc.contactPhone?.trim()),
        label: 'Direct contact details are ready for follow-up',
      },
      {
        ok: Boolean(doc.boothNo?.trim()),
        label: 'Booth reference is visible for the event meeting',
      },
      {
        ok: Boolean(doc.validUntil?.trim()),
        label: 'Commercial validity is stated clearly',
      },
      {
        ok:
          doc.items.length > 0 &&
          doc.items.every(
            (item) => item.description.trim() && item.unit.trim() && item.unitPrice.value > 0
          ),
        label: 'Product lines include description, unit, and price',
      },
      {
        ok: (doc.productHighlights?.length || 0) >= 2,
        label: 'Buyer-facing selling points are filled in',
      },
      {
        ok: (doc.certifications?.length || 0) >= 1,
        label: 'Certifications or proof points are visible',
      },
      {
        ok: Boolean((doc.signatureName || doc.fromPerson).trim()),
        label: 'Signature block is ready for a formal send-out',
      },
    ],
    [doc]
  );

  const readinessScore = readiness.filter((item) => item.ok).length;

  const updateDoc = <K extends keyof CommonDoc>(key: K, value: CommonDoc[K]) => {
    setDoc((current) => ({ ...current, [key]: value }));
  };

  const updateParty = (partyKey: 'seller' | 'buyer', key: keyof Party, value: string) => {
    setDoc((current) => ({
      ...current,
      [partyKey]: {
        ...current[partyKey],
        [key]: value,
      },
    }));
  };

  const updateMinOrder = (value: number, unit = doc.minOrderQty?.unit || 'CTN') => {
    setDoc((current) => ({
      ...current,
      minOrderQty: {
        value,
        unit,
      },
    }));
  };

  const updateCurrency = (currency: Currency) => {
    setDoc((current) => ({
      ...current,
      exchangeCurrency: currency,
      items: current.items.map((item) => ({
        ...item,
        unitPrice: {
          ...item.unitPrice,
          currency,
        },
      })),
    }));
  };

  const handleSignatureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateDoc('signatureImageDataUrl', dataUrl);
  };

  const replacePdfPreview = (next: { url: string; filename: string } | null) => {
    setPdfPreview((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }
      return next;
    });
  };

  const buildPdfPreview = async () => {
    const [{ pdf }, { default: QuotationInvoicePDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./components/PDF/QuotationInvoicePDF'),
    ]);
    const blob = await pdf(<QuotationInvoicePDF doc={doc} />).toBlob();

    return {
      url: URL.createObjectURL(blob),
      filename: `${sanitizeFilename(doc.docNo || doc.subject || 'quotation')}.pdf`,
    };
  };

  const handlePreviewPdf = async () => {
    try {
      setIsExporting(true);
      setStatus('');
      replacePdfPreview(await buildPdfPreview());
      setStatus('PDF preview is ready. Review it first, then download from the preview panel.');
    } catch (error) {
      console.error(error);
      setStatus('PDF export failed. Check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfPreview) return;
    const link = document.createElement('a');
    link.href = pdfPreview.url;
    link.download = pdfPreview.filename;
    link.click();
    setStatus('PDF downloaded successfully.');
  };

  const handleOpenPdfInNewTab = () => {
    if (!pdfPreview) return;
    const link = document.createElement('a');
    link.href = pdfPreview.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    setStatus('PDF preview opened in a new tab.');
  };

  const handleClosePdfPreview = () => {
    replacePdfPreview(null);
  };

  const handleOpenClientView = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    window.open(buildClientUrl(doc, false), '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    const shareUrl = buildClientUrl(doc, true);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt('Copy this online link', shareUrl);
      }
      setStatus('Online link copied. Embedded images are omitted to keep the URL shareable.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to copy automatically. Use the browser prompt to copy the link.');
      window.prompt('Copy this online link', shareUrl);
    }
  };

  const handleReset = () => {
    const next = createInitialDoc();
    setDoc(next);
    setStatus('Sample content restored.');
  };

  if (route.isClientView) {
    return (
      <div className="client-shell">
        <ClientProposalView doc={doc} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-hero">
        <div>
          <div className="app-kicker">ThaiFex sales workflow</div>
          <h1>ThaiFex Sales Proposal Studio</h1>
          <p>
            Prepare one buyer-ready quotation, open it as an online proposal on a second
            screen, and export the same content to PDF without reformatting.
          </p>
        </div>

        <div className="hero-actions">
          <button className="btn" onClick={handleOpenClientView}>
            Open client view
          </button>
          <button className="btn" onClick={handleCopyLink}>
            Copy online link
          </button>
          <button className="btn primary" onClick={handlePreviewPdf} disabled={isExporting}>
            {isExporting ? 'Preparing PDF...' : 'Preview PDF'}
          </button>
          <button className="btn" onClick={handleReset}>
            Reset sample
          </button>
        </div>
      </header>

      {status ? <div className="status-banner">{status}</div> : null}

      <div className="workspace">
        <div className="editor-column">
          <Card title="ThaiFex readiness">
            <div className="score-row">
              <div>
                <div className="score-label">Readiness score</div>
                <div className="score-value">
                  {readinessScore}/{readiness.length}
                </div>
              </div>
              <div className="muted">
                Fill the missing items before using this proposal with buyers at the booth.
              </div>
            </div>
            <div className="checklist">
              {readiness.map((item) => (
                <div
                  key={item.label}
                  className={`checklist-item ${item.ok ? 'ok' : 'todo'}`}
                >
                  <span className="checklist-dot" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Event and seller profile">
            <div className="grid two-col">
              <div className="grid">
                <Label>Event name</Label>
                <Input
                  value={doc.eventName || ''}
                  onChange={(event) => updateDoc('eventName', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Booth / hall</Label>
                <Input
                  value={doc.boothNo || ''}
                  onChange={(event) => updateDoc('boothNo', event.target.value)}
                  placeholder="Hall 4 / Booth XX"
                />
              </div>
              <div className="grid">
                <Label>Event dates</Label>
                <Input
                  value={doc.eventDates || ''}
                  onChange={(event) => updateDoc('eventDates', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Event location</Label>
                <Input
                  value={doc.eventLocation || ''}
                  onChange={(event) => updateDoc('eventLocation', event.target.value)}
                />
              </div>
            </div>

            <div className="section-gap" />

            <LogoUploader
              value={doc.logoDataUrl}
              widthPt={doc.logoWidthPt}
              onChange={(value) => updateDoc('logoDataUrl', value)}
              onWidthChange={(value) => updateDoc('logoWidthPt', value)}
            />

            <div className="section-gap" />

            <div className="grid two-col">
              <div className="grid">
                <Label>Seller company</Label>
                <Input
                  value={doc.seller.name}
                  onChange={(event) => updateParty('seller', 'name', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Website</Label>
                <Input
                  value={doc.website || ''}
                  onChange={(event) => updateDoc('website', event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid full-span">
                <Label>Seller address</Label>
                <Textarea
                  rows={4}
                  value={doc.seller.address}
                  onChange={(event) => updateParty('seller', 'address', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Presenter name</Label>
                <Input
                  value={doc.fromPerson}
                  onChange={(event) => updateDoc('fromPerson', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Presenter title</Label>
                <Input
                  value={doc.fromTitle || ''}
                  onChange={(event) => updateDoc('fromTitle', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Contact email</Label>
                <Input
                  value={doc.contactEmail || ''}
                  onChange={(event) => updateDoc('contactEmail', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Contact phone</Label>
                <Input
                  value={doc.contactPhone || ''}
                  onChange={(event) => updateDoc('contactPhone', event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Buyer and document setup">
            <div className="grid two-col">
              <div className="grid">
                <Label>Buyer company</Label>
                <Input
                  value={doc.buyer.name}
                  onChange={(event) => updateParty('buyer', 'name', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Attention</Label>
                <Input
                  value={doc.attn}
                  onChange={(event) => updateDoc('attn', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Buyer address</Label>
                <Textarea
                  rows={4}
                  value={doc.buyer.address}
                  onChange={(event) => updateParty('buyer', 'address', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Quotation no.</Label>
                <Input
                  value={doc.docNo || ''}
                  onChange={(event) => updateDoc('docNo', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Issued date</Label>
                <Input
                  type="date"
                  value={doc.docDate}
                  onChange={(event) => updateDoc('docDate', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Valid until</Label>
                <Input
                  type="date"
                  value={doc.validUntil || ''}
                  onChange={(event) => updateDoc('validUntil', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Brand / collection</Label>
                <Input
                  value={doc.brand || ''}
                  onChange={(event) => updateDoc('brand', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Subject line</Label>
                <Input
                  value={doc.subject}
                  onChange={(event) => updateDoc('subject', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Intro note</Label>
                <Textarea
                  rows={4}
                  value={doc.introNote || ''}
                  onChange={(event) => updateDoc('introNote', event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Commercial terms">
            <div className="grid two-col">
              <div className="grid full-span">
                <Label>Delivery terms</Label>
                <Select
                  value={deliveryPresetSelected ? doc.deliveryTerms : ''}
                  onChange={(value) => updateDoc('deliveryTerms', value)}
                  options={INCOTERMS_PRESETS}
                  placeholder="Select delivery preset"
                />
                {!deliveryPresetSelected ? (
                  <Input
                    value={doc.deliveryTerms}
                    onChange={(event) => updateDoc('deliveryTerms', event.target.value)}
                    placeholder="Or type a custom delivery term"
                  />
                ) : null}
              </div>
              <div className="grid full-span">
                <Label>Payment terms</Label>
                <Select
                  value={paymentPresetSelected ? doc.paymentTerms : ''}
                  onChange={(value) => updateDoc('paymentTerms', value)}
                  options={PAYMENT_PRESETS}
                  placeholder="Select payment preset"
                />
                {!paymentPresetSelected ? (
                  <Input
                    value={doc.paymentTerms}
                    onChange={(event) => updateDoc('paymentTerms', event.target.value)}
                    placeholder="Or type custom payment terms"
                  />
                ) : null}
              </div>
              <div className="grid">
                <Label>Lead time</Label>
                <Input
                  value={doc.leadTime || ''}
                  onChange={(event) => updateDoc('leadTime', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>FX rate to THB</Label>
                <Input
                  type="number"
                  value={doc.fxRate ?? ''}
                  onChange={(event) =>
                    updateDoc('fxRate', Number(event.target.value) || undefined)
                  }
                  placeholder="34.00"
                />
              </div>
              <div className="grid">
                <Label>MOQ value</Label>
                <Input
                  type="number"
                  value={doc.minOrderQty?.value ?? ''}
                  onChange={(event) =>
                    updateMinOrder(Number(event.target.value) || 0, minQtyUnit || 'CTN')
                  }
                />
              </div>
              <div className="grid">
                <Label>MOQ unit</Label>
                <Select
                  value={minQtyPresetSelected ? minQtyUnit : UNIT_CUSTOM_LABEL}
                  onChange={(value) => {
                    if (value === UNIT_CUSTOM_LABEL) {
                      updateMinOrder(doc.minOrderQty?.value || 0, minQtyPresetSelected ? '' : minQtyUnit);
                      return;
                    }
                    updateMinOrder(doc.minOrderQty?.value || 0, value);
                  }}
                  options={[...MIN_QTY_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                  placeholder="Select unit"
                />
                {!minQtyPresetSelected ? (
                  <Input
                    value={minQtyUnit}
                    onChange={(event) =>
                      updateMinOrder(doc.minOrderQty?.value || 0, event.target.value)
                    }
                    placeholder="Custom MOQ unit"
                  />
                ) : null}
              </div>
            </div>
          </Card>

          <Card title="Products and buyer-facing proof">
            <div className="grid" style={{ gap: 16 }}>
              <MiniPriceCalculator fxRate={doc.fxRate} />

              <LineItemsEditor
                items={doc.items}
                onChange={(items) => updateDoc('items', items)}
                currency={doc.exchangeCurrency || 'USD'}
                onCurrency={updateCurrency}
              />

              <div className="grid two-col">
                <div className="grid">
                  <Label>Product highlights</Label>
                  <Textarea
                    rows={6}
                    value={formatInputLines(doc.productHighlights)}
                    onChange={(event) =>
                      updateDoc('productHighlights', parseInputLines(event.target.value))
                    }
                    placeholder="One point per line"
                  />
                </div>
                <div className="grid">
                  <Label>Certifications / proof points</Label>
                  <Textarea
                    rows={6}
                    value={formatInputLines(doc.certifications)}
                    onChange={(event) =>
                      updateDoc('certifications', parseInputLines(event.target.value))
                    }
                    placeholder="One proof point per line"
                  />
                </div>
                <div className="grid full-span">
                  <Label>Notes / conditions</Label>
                  <Textarea
                    rows={4}
                    value={formatInputLines(doc.notes)}
                    onChange={(event) => updateDoc('notes', parseInputLines(event.target.value))}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Closing and signature">
            <div className="grid two-col">
              <div className="grid full-span">
                <Label>Closing paragraph</Label>
                <Textarea
                  rows={5}
                  value={doc.closing || ''}
                  onChange={(event) => updateDoc('closing', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Signature name</Label>
                <Input
                  value={doc.signatureName || ''}
                  onChange={(event) => updateDoc('signatureName', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Signature title</Label>
                <Input
                  value={doc.signTitle || ''}
                  onChange={(event) => updateDoc('signTitle', event.target.value)}
                />
              </div>
              <div className="grid full-span">
                <Label>Signature image</Label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                />
                {doc.signatureImageDataUrl ? (
                  <div className="signature-preview-row">
                    <img
                      src={doc.signatureImageDataUrl}
                      alt="Signature preview"
                      className="signature-preview"
                    />
                    <button
                      className="btn"
                      onClick={() => updateDoc('signatureImageDataUrl', undefined)}
                    >
                      Remove signature
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>

        <div className="preview-column">
          <div className="preview-shell">
            <div className="preview-head">
              <div>
                <div className="preview-eyebrow">Live client view</div>
                <h2>Online proposal preview</h2>
              </div>
              <button className="btn" onClick={handleOpenClientView}>
                Pop out
              </button>
            </div>
            <ClientProposalView doc={doc} embedded />
          </div>
        </div>
      </div>

      {pdfPreview ? (
        <div className="pdf-preview-overlay">
          <div className="pdf-preview-dialog">
            <div className="pdf-preview-bar">
              <div>
                <div className="preview-eyebrow">PDF handover file</div>
                <h2>Preview before download</h2>
              </div>
              <div className="hero-actions" style={{ maxWidth: 'none' }}>
                <button className="btn" onClick={handleClosePdfPreview}>
                  Close
                </button>
                <button className="btn" onClick={handleOpenPdfInNewTab}>
                  Open in new tab
                </button>
                <button className="btn primary" onClick={handleDownloadPdf}>
                  Download PDF
                </button>
              </div>
            </div>
            <iframe
              title="PDF preview"
              src={pdfPreview.url}
              className="pdf-preview-frame"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
