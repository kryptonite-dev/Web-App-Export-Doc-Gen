import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import LineItemsEditor from './components/LineItemsEditor';
import MiniPriceCalculator from './components/MiniPriceCalculator';
import LogoUploader from './components/LogoUploader';
import ClientProposalView from './components/ClientProposalView';
import LoadingCalculatorPage from './components/LoadingCalculatorPage';
import QuickQuotePage from './components/QuickQuotePage';
import ClassicQuotationPage, {
  CLASSIC_PRICE_CALCULATOR_STORAGE_KEY,
  CLASSIC_QUOTATION_STORAGE_KEY,
} from './components/ClassicQuotationPage';
import { Card, Input, Label, Select, Textarea } from './components/ui';
import {
  COMPANY_LOGO_PRESETS,
  GOODS_DESCRIPTION_PRESETS,
  INCOTERMS_PRESETS,
  MIN_QTY_UNIT_PRESETS,
  PAYMENT_PRESETS,
  UNIT_CUSTOM_LABEL,
} from './constants';
import { CommonDoc, Currency, Party } from './types';
import { todayISO } from './utils';

type AppPage = 'proposal' | 'loading' | 'quote' | 'classic';
type StatusState =
  | {
      text: string;
    }
  | {
      lead: string;
      copyValue: string;
      tail: string;
      copied?: boolean;
    };

const STORAGE_KEY = 'thaifex-sales-proposal-draft-v3';
const DEFAULT_SUBJECT = 'Quotation for Coconut Blossom Juice 150 ml';
const LEGACY_SUBJECTS = [
  'Buyer-ready quotation for Coconut Blossom Juice 250 ml',
  'Quotation for Coconut Blossom Juice 250 ml',
];
const DEFAULT_PRESENTER = 'Taninnuth Warittarasith';
const LEGACY_PRESENTERS = [
  'Taninnuth Warittarasith (Tanin)',
  'Taninnuth Warittarasith (TANIN)',
];
const LEGACY_INTRO_NOTE =
  'This proposal is prepared for fast review during buyer meetings and clean follow-up after the show.';

function createDefaultItems(): CommonDoc['items'] {
  return [
    {
      description: GOODS_DESCRIPTION_PRESETS[0],
      unit: 'CTN',
      qty: 256,
      unitPrice: { currency: 'USD', value: 0 },
    },
  ];
}

function isLegacyDefaultItems(items?: CommonDoc['items']) {
  if (!items || items.length !== 2) return false;
  return (
    items[0]?.description === 'Coconut Blossom Juice 250 ml (24 bottles / carton)' &&
    items[0]?.unit === 'CTN' &&
    items[0]?.qty === 400 &&
    items[0]?.unitPrice?.currency === 'USD' &&
    items[0]?.unitPrice?.value === 9.8 &&
    items[1]?.description === 'Private label option with bilingual packaging support' &&
    items[1]?.unit === 'CTN' &&
    items[1]?.qty === 400 &&
    items[1]?.unitPrice?.currency === 'USD' &&
    items[1]?.unitPrice?.value === 10.6
  );
}

function isPreviousDefaultItems(items?: CommonDoc['items']) {
  if (!items || items.length !== 1) return false;
  return (
    items[0]?.description === GOODS_DESCRIPTION_PRESETS[0] &&
    items[0]?.unit === 'CTN' &&
    items[0]?.qty === 256 &&
    items[0]?.unitPrice?.currency === 'USD' &&
    items[0]?.unitPrice?.value === 9.8
  );
}

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
    subject: DEFAULT_SUBJECT,
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
    buyerContactEmail: '',
    buyerContactPhone: '',
    fromPerson: DEFAULT_PRESENTER,
    fromTitle: 'Co-Founder',
    website: 'https://huqkhuun.com/',
    contactEmail: 'huqkhuun@gmail.com',
    contactPhone: '',
    eventName: 'THAIFEX - ANUGA ASIA 2026',
    eventDates: '26 - 30 May 2026',
    eventLocation: 'IMPACT Muang Thong Thani, Bangkok',
    boothNo: 'Hall 9 / Booth CC01',
    introNote: '',
    deliveryTerms: INCOTERMS_PRESETS[0],
    brand: 'Coconut Blossom Collection',
    minOrderQty: {
      value: 2,
      unit: 'PALLET',
    },
    paymentTerms: PAYMENT_PRESETS[0],
    leadTime: '30-45 days after artwork confirmation',
    fxRate: 32,
    items: createDefaultItems(),
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
    signatureName: DEFAULT_PRESENTER,
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

  const normalizedSubject =
    source.subject && LEGACY_SUBJECTS.includes(source.subject)
      ? DEFAULT_SUBJECT
      : source.subject;
  const normalizedPresenter =
    source.fromPerson && LEGACY_PRESENTERS.includes(source.fromPerson)
      ? DEFAULT_PRESENTER
      : source.fromPerson;
  const normalizedSignatureName =
    source.signatureName && LEGACY_PRESENTERS.includes(source.signatureName)
      ? DEFAULT_PRESENTER
      : source.signatureName;
  const normalizedIntroNote =
    source.introNote === LEGACY_INTRO_NOTE ? '' : source.introNote;

  const normalizedMinOrderQty =
    ((source.minOrderQty?.value === 400 && source.minOrderQty?.unit === 'CTN') ||
      (source.minOrderQty?.value === 256 && source.minOrderQty?.unit === 'CTN'))
      ? base.minOrderQty
      : source.minOrderQty;
  const shouldResetToCurrentDefaults =
    isLegacyDefaultItems(source.items) || isPreviousDefaultItems(source.items);
  const normalizedItems = shouldResetToCurrentDefaults ? base.items : source.items;
  const normalizedFxRate =
    source.fxRate === 34 && shouldResetToCurrentDefaults ? base.fxRate : source.fxRate;

  return {
    ...base,
    ...source,
    subject: normalizedSubject?.trim() ? normalizedSubject : base.subject,
    fromPerson: normalizedPresenter?.trim() ? normalizedPresenter : base.fromPerson,
    signatureName: normalizedSignatureName?.trim()
      ? normalizedSignatureName
      : base.signatureName,
    introNote: normalizedIntroNote?.trim() ? normalizedIntroNote : base.introNote,
    seller: {
      ...base.seller,
      ...(source.seller || {}),
    },
    buyer: {
      ...base.buyer,
      ...(source.buyer || {}),
    },
    buyerContactEmail: source.buyerContactEmail?.trim()
      ? source.buyerContactEmail
      : base.buyerContactEmail,
    buyerContactPhone: source.buyerContactPhone?.trim()
      ? source.buyerContactPhone
      : base.buyerContactPhone,
    website: source.website?.trim() ? source.website : base.website,
    contactEmail: source.contactEmail?.trim() ? source.contactEmail : base.contactEmail,
    fxRate: normalizedFxRate ?? base.fxRate,
    items:
      normalizedItems && normalizedItems.length > 0
        ? normalizedItems.map((item) => ({
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
    minOrderQty: normalizedMinOrderQty || base.minOrderQty,
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
  const pageParam = params.get('page');
  const page: AppPage =
    pageParam === 'loading'
      ? 'loading'
      : pageParam === 'quote'
        ? 'quote'
        : pageParam === 'classic'
          ? 'classic'
          : 'proposal';
  return {
    isClientView: params.get('view') === 'client',
    sharedDoc: decodeSharePayload(params.get('payload')),
    page,
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

function loadImageElement(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image for PDF export.'));
    image.src = dataUrl;
  });
}

async function rasterizeImageForPdf(
  dataUrl?: string,
  options?: {
    backgroundColor?: string;
    padding?: number;
    maxDimension?: number;
  }
) {
  if (!dataUrl) return undefined;
  const image = await loadImageElement(dataUrl);
  const padding = options?.padding ?? 20;
  const backgroundColor = options?.backgroundColor ?? '#fffaf0';
  const maxDimension = options?.maxDimension ?? 1600;
  const sourceWidth = image.naturalWidth || image.width || 1;
  const sourceHeight = image.naturalHeight || image.height || 1;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width + padding * 2;
  canvas.height = height + padding * 2;
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, padding, padding, width, height);
  return canvas.toDataURL('image/png');
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

function formatFilenameTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function buildFilenameCtnLabel(doc: CommonDoc) {
  const totalCtn = doc.items.reduce((sum, item) => {
    const unit = item.unit?.trim().toUpperCase();
    return unit === 'CTN' ? sum + (Number(item.qty) || 0) : sum;
  }, 0);

  if (totalCtn > 0) {
    const formatted = Number.isInteger(totalCtn)
      ? String(totalCtn)
      : totalCtn.toFixed(2).replace(/\.?0+$/, '').replace('.', '-');
    return `${formatted}ctn`;
  }

  const fallbackUnit = doc.minOrderQty?.unit?.trim().toUpperCase();
  if (fallbackUnit === 'CTN' && (doc.minOrderQty?.value || 0) > 0) {
    const fallbackValue = doc.minOrderQty?.value || 0;
    const formatted = Number.isInteger(fallbackValue)
      ? String(fallbackValue)
      : fallbackValue.toFixed(2).replace(/\.?0+$/, '').replace('.', '-');
    return `${formatted}ctn`;
  }

  return 'ctn-unspecified';
}

function buildFileBaseName(doc: CommonDoc, date = new Date()) {
  const buyerName = doc.buyer.name?.trim() || doc.attn?.trim() || doc.docNo?.trim() || 'proposal';
  return `${sanitizeFilename(buyerName)}_${buildFilenameCtnLabel(doc)}_${formatFilenameTimestamp(date)}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

function App() {
  const route = getRouteContext();
  const [page, setPage] = useState<AppPage>(route.page);
  const [loadingCalculatorKey, setLoadingCalculatorKey] = useState(0);
  const [quickQuoteKey, setQuickQuoteKey] = useState(0);
  const [classicQuotationKey, setClassicQuotationKey] = useState(0);
  const [doc, setDoc] = useState<CommonDoc>(() => {
    if (route.sharedDoc) return hydrateDoc(route.sharedDoc);
    return hydrateDoc(safeParseDraft(localStorage.getItem(STORAGE_KEY)));
  });
  const [status, setStatus] = useState<StatusState | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (route.isClientView) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  }, [doc, route.isClientView]);

  useEffect(() => {
    document.title = route.isClientView
      ? `${doc.subject || 'Client Proposal'} | Client View`
      : page === 'loading'
        ? 'Export Loading Calculator'
        : page === 'quote'
          ? 'FCA / FOB Quick Quote'
          : page === 'classic'
            ? 'Classic Export Quotation'
          : 'ThaiFex Sales Proposal Studio';
  }, [doc.subject, page, route.isClientView]);

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

  const applyCompanyLogoPreset = (presetId: string) => {
    const preset = COMPANY_LOGO_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setDoc((current) => ({
      ...current,
      logoDataUrl: preset.logoSrc,
      seller: {
        ...current.seller,
        name: preset.sellerName,
        address: preset.sellerAddress,
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

  const showStatus = (text: string) => {
    setStatus({ text });
  };

  const handleCopyStatusValue = async () => {
    if (!status || !('copyValue' in status)) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(status.copyValue);
      } else {
        window.prompt('Copy filename', status.copyValue);
      }
      setStatus((current) =>
        current && 'copyValue' in current ? { ...current, copied: true } : current
      );
    } catch (error) {
      console.error(error);
      window.prompt('Copy filename', status.copyValue);
    }
  };

  const handleSignatureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateDoc('signatureImageDataUrl', dataUrl);
  };

  const buildPdfFile = async (filename: string) => {
    const [{ pdf }, { default: QuotationInvoicePDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./components/PDF/QuotationInvoicePDF'),
    ]);
    const preparedDoc: CommonDoc = {
      ...doc,
      logoDataUrl: await rasterizeImageForPdf(doc.logoDataUrl, {
        backgroundColor: '#fff8ec',
        padding: 32,
        maxDimension: 1400,
      }),
      signatureImageDataUrl: await rasterizeImageForPdf(doc.signatureImageDataUrl, {
        backgroundColor: '#fffdf8',
        padding: 18,
        maxDimension: 1400,
      }),
    };
    const blob = await pdf(<QuotationInvoicePDF doc={preparedDoc} />).toBlob();
    const file =
      typeof File === 'function'
        ? new File([blob], filename, { type: 'application/pdf' })
        : blob;

    return {
      url: URL.createObjectURL(file),
      filename,
    };
  };

  const handleSaveProposal = () => {
    const savedAt = new Date();
    const filename = `${buildFileBaseName(doc, savedAt)}.json`;
    const payload = {
      savedAt: savedAt.toISOString(),
      doc,
    };
    triggerDownload(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      filename
    );
    showStatus(`Proposal data saved as ${filename}.`);
  };

  const handleOpenPdf = async () => {
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.title = 'Preparing PDF...';
      popup.document.body.innerHTML =
        '<div style="font-family: Avenir Next, Segoe UI, sans-serif; padding: 24px; color: #5b4532;">Preparing PDF...</div>';
    }

    try {
      setIsExporting(true);
      setStatus(null);
      const savedAt = new Date();
      const fileBaseName = buildFileBaseName(doc, savedAt);
      const pdfFile = await buildPdfFile(`${fileBaseName}.pdf`);

      if (popup) {
        popup.location.replace(pdfFile.url);
      } else {
        const link = document.createElement('a');
        link.href = pdfFile.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(pdfFile.url);
      }, 10 * 60_000);

      setStatus({
        lead: 'PDF opened in a new tab as',
        copyValue: fileBaseName,
        tail: '.pdf. Use the browser PDF viewer to download if needed.',
        copied: false,
      });
    } catch (error) {
      if (popup) popup.close();
      console.error(error);
      showStatus('PDF export failed. Check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenClientView = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    window.open(buildClientUrl(doc, false), '_blank', 'noopener,noreferrer');
  };

  const handlePageChange = (next: AppPage) => {
    setPage(next);
    const url = new URL(window.location.href);
    if (next === 'loading') {
      url.searchParams.set('page', 'loading');
    } else if (next === 'quote') {
      url.searchParams.set('page', 'quote');
    } else if (next === 'classic') {
      url.searchParams.set('page', 'classic');
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleCopyLink = async () => {
    const shareUrl = buildClientUrl(doc, true);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt('Copy this online link', shareUrl);
      }
      showStatus('Online link copied. Embedded images are omitted to keep the URL shareable.');
    } catch (error) {
      console.error(error);
      showStatus('Unable to copy automatically. Use the browser prompt to copy the link.');
      window.prompt('Copy this online link', shareUrl);
    }
  };

  const handleReset = () => {
    const next = createInitialDoc();
    setDoc(next);
    showStatus('Sample content restored.');
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
          <div className="page-switch">
            <button
              className={`btn ${page === 'proposal' ? 'primary' : ''}`}
              onClick={() => handlePageChange('proposal')}
            >
              Proposal studio
            </button>
            <button
              className={`btn ${page === 'loading' ? 'primary' : ''}`}
              onClick={() => handlePageChange('loading')}
            >
              Loading calculator
            </button>
            <button
              className={`btn ${page === 'quote' ? 'primary' : ''}`}
              onClick={() => handlePageChange('quote')}
            >
              FCA / FOB quote
            </button>
            <button
              className={`btn ${page === 'classic' ? 'primary' : ''}`}
              onClick={() => handlePageChange('classic')}
            >
              Classic quotation
            </button>
          </div>
          <div className="app-kicker">
            {page === 'loading'
              ? 'Export loading reference'
              : page === 'quote'
                ? 'Trade-show quick quote'
                : page === 'classic'
                  ? 'Excel-style export quotation'
                : 'ThaiFex sales workflow'}
          </div>
          <h1>
            {page === 'loading'
              ? 'Coconut Blossom Export Loading Calculator'
              : page === 'quote'
                ? 'FCA / FOB Quick Quote'
                : page === 'classic'
                  ? 'Classic Export Quotation'
                : 'ThaiFex Sales Proposal Studio'}
          </h1>
          <p>
            {page === 'loading'
              ? 'Check cartons per pallet, palletized loading, and loose-load capacity in a separate customer-facing calculator during container discussions.'
              : page === 'quote'
                ? 'Answer EXW, FCA, and FOB price questions quickly, convert trade-show THB assumptions into USD, and copy USD / CTN values back into the quotation.'
                : page === 'classic'
                  ? 'Create a separate Excel-style export quotation that follows the attached workbook layout without touching the existing buyer proposal flow.'
                : 'Prepare one buyer-ready quotation, open it as an online proposal on a second screen, and export the same content to PDF without reformatting.'}
          </p>
        </div>

        <div className="hero-actions">
          {page === 'proposal' ? (
            <>
              <button className="btn" onClick={handleSaveProposal}>
                Save proposal
              </button>
              <button className="btn" onClick={handleOpenClientView}>
                Open client view
              </button>
              <button
                className="btn icon-btn"
                onClick={handleCopyLink}
                title="Copy online link"
                aria-label="Copy online link"
              >
                <Copy size={16} strokeWidth={2.1} />
              </button>
              <button className="btn primary" onClick={handleOpenPdf} disabled={isExporting}>
                {isExporting ? 'Preparing PDF...' : 'Open PDF'}
              </button>
              <button className="btn" onClick={handleReset}>
                Reset sample
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => handlePageChange('proposal')}>
                Back to proposal
              </button>
              <button
                className="btn"
                onClick={() =>
                  page === 'loading'
                    ? setLoadingCalculatorKey((current) => current + 1)
                    : page === 'quote'
                      ? setQuickQuoteKey((current) => current + 1)
                      : (localStorage.removeItem(CLASSIC_QUOTATION_STORAGE_KEY),
                        localStorage.removeItem(CLASSIC_PRICE_CALCULATOR_STORAGE_KEY),
                        setClassicQuotationKey((current) => current + 1))
                }
              >
                {page === 'loading'
                  ? 'Reset calculator'
                  : page === 'quote'
                    ? 'Reset quote'
                    : 'Reset classic quotation'}
              </button>
            </>
          )}
        </div>
      </header>

      {status ? (
        <div className="status-banner">
          {'copyValue' in status ? (
            <>
              <span>{status.lead} </span>
              <button
                type="button"
                className={`status-copy-chip ${status.copied ? 'copied' : ''}`}
                onClick={handleCopyStatusValue}
                title="Copy filename"
              >
                <span>{status.copyValue}</span>
                {status.copied ? <Check size={14} strokeWidth={2.4} /> : <Copy size={14} strokeWidth={2.1} />}
              </button>
              <span>{status.tail}</span>
            </>
          ) : (
            status.text
          )}
        </div>
      ) : null}

      {page === 'proposal' ? (
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
              presets={COMPANY_LOGO_PRESETS.map((preset) => ({
                id: preset.id,
                label: preset.label,
              }))}
              selectedPresetId={
                COMPANY_LOGO_PRESETS.find((preset) => preset.logoSrc === doc.logoDataUrl)?.id
              }
              onSelectPreset={applyCompanyLogoPreset}
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
                <Label>Buyer contact email</Label>
                <Input
                  value={doc.buyerContactEmail || ''}
                  onChange={(event) => updateDoc('buyerContactEmail', event.target.value)}
                />
              </div>
              <div className="grid">
                <Label>Buyer contact phone</Label>
                <Input
                  value={doc.buyerContactPhone || ''}
                  onChange={(event) => updateDoc('buyerContactPhone', event.target.value)}
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
                  placeholder="32.00"
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
      ) : page === 'loading' ? (
        <LoadingCalculatorPage key={loadingCalculatorKey} />
      ) : page === 'quote' ? (
        <QuickQuotePage key={quickQuoteKey} />
      ) : (
        <ClassicQuotationPage key={classicQuotationKey} />
      )}
    </div>
  );
}

export default App;
