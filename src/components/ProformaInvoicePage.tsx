import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  buildClassicPdfBaseName,
  CLASSIC_QUOTATION_STORAGE_KEY,
  CURRENCY_OPTIONS,
  defaultClassicQuotationItem,
  type ClassicQuotation,
  type ClassicQuotationItem,
  readClassicDraft,
  THAI_BANK_PRESETS,
} from './ClassicQuotationPage';
import { Card, Input, Label, Select, Textarea } from './ui';
import LogoUploader from './LogoUploader';
import {
  buildClassicOrderTierRows,
  findClassicCartonPreset,
  formatClassicTierPrice,
  type ClassicOrderTierRow,
} from '../classicQuotationScale';
import { DEFAULT_FX_RATE, useSharedFxRate } from '../sharedFxRate';
import {
  buildClassicSubjectFromDescriptions,
  COMPANY_LOGO_PRESETS,
  GOODS_DESCRIPTION_CUSTOM_LABEL,
  GOODS_DESCRIPTION_PRESETS,
  INCOTERMS_PRESETS,
  LINE_ITEM_UNIT_PRESETS,
  MIN_QTY_UNIT_PRESETS,
  PAYMENT_PRESETS,
  UNIT_CUSTOM_LABEL,
  joinGoodsDescriptionLines,
} from '../constants';
import { fmt } from '../utils';

const DEFAULT_CLASSIC_LOGO_SRC = '/huqkhuun-gold-logo.png';
const QUOTATION_VALIDITY_DAYS = 14;
const EXCHANGE_VALIDITY_NOTE = 'Prices are valid within the validity period.';
const INQUIRY_TYPE_OPTIONS = ['MOQ', 'QUOTE'];

type ProformaStatus = {
  lead: string;
  filename: string;
  tail: string;
  copied?: boolean;
};

export type ProformaInvoiceLine = {
  description: string;
  note: string;
  shippingMark: string;
  tier: string;
  loadingBasis: string;
  quantityCtn: number;
  pieces: number;
  grossWeight: number;
  unitPrice: number;
  amount: number;
  priceCurrency: string;
  priceBasisLabel: string;
};

function blockLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDisplayDate(value: string) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return value;
  const month = date.toLocaleString('en-US', { month: 'long' });
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

function addDaysIso(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number);
  const date =
    year && month && day
      ? new Date(year, month - 1, day)
      : new Date();
  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function isThbQuote(currency: string) {
  return currency.trim().toUpperCase() === 'THB';
}

function normalizeCurrency(currency: string) {
  return currency.trim().toUpperCase() || 'USD';
}

function isPreset(value: string, presets: string[]) {
  return presets.includes(value);
}

function formatMoney(currency: string, value: number) {
  const normalizedCurrency = normalizeCurrency(currency);
  return `${normalizedCurrency} ${fmt(value, normalizedCurrency === 'THB' ? 0 : 2)}`;
}

const SMALL_NUMBERS = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function integerToWords(value: number): string {
  const rounded = Math.floor(Math.abs(value));
  if (rounded < 20) return SMALL_NUMBERS[rounded];
  if (rounded < 100) {
    const ten = Math.floor(rounded / 10);
    const rest = rounded % 10;
    return rest ? `${TENS[ten]} ${SMALL_NUMBERS[rest]}` : TENS[ten];
  }
  if (rounded < 1000) {
    const hundred = Math.floor(rounded / 100);
    const rest = rounded % 100;
    return rest ? `${SMALL_NUMBERS[hundred]} Hundred ${integerToWords(rest)}` : `${SMALL_NUMBERS[hundred]} Hundred`;
  }

  const units: Array<[number, string]> = [
    [1_000_000_000, 'Billion'],
    [1_000_000, 'Million'],
    [1_000, 'Thousand'],
  ];
  for (const [unitValue, unitName] of units) {
    if (rounded >= unitValue) {
      const major = Math.floor(rounded / unitValue);
      const rest = rounded % unitValue;
      return rest
        ? `${integerToWords(major)} ${unitName} ${integerToWords(rest)}`
        : `${integerToWords(major)} ${unitName}`;
    }
  }

  return String(rounded);
}

function amountInWords(currency: string, amount: number) {
  const normalizedCurrency = normalizeCurrency(currency);
  const major = Math.floor(Math.abs(amount));
  const minor = Math.round((Math.abs(amount) - major) * 100);
  const currencyLabel =
    normalizedCurrency === 'USD'
      ? 'U.S. Dollars'
      : normalizedCurrency === 'THB'
        ? 'Thai Baht'
        : normalizedCurrency;
  const minorLabel = normalizedCurrency === 'THB' ? 'Satang' : 'Cents';
  const minorText = minor ? ` and ${integerToWords(minor)} ${minorLabel}` : '';
  return `${currencyLabel} ${integerToWords(major)}${minorText} Only`;
}

function buildProformaPdfBaseName(quote: ClassicQuotation, date = new Date()) {
  return buildClassicPdfBaseName(quote, date).replace(/^Quotation_/, 'Proforma_Invoice_');
}

function buildProformaNo(refNo: string) {
  const cleanRef = refNo.trim() || 'QUO';
  return cleanRef.toUpperCase().startsWith('PI-') ? cleanRef : `PI-${cleanRef}`;
}

function derivePortOfLoading(deliveryTerm: string) {
  const value = deliveryTerm.toUpperCase();
  if (value.includes('BANGKOK PORT')) return 'Bangkok Port, Thailand';
  if (value.includes('KHLONG TOEI')) return 'Khlong Toei, Bangkok, Thailand';
  if (value.includes('BANGKOK')) return 'Bangkok, Thailand';
  return 'Thailand';
}

function getTradeTermLabel(deliveryTerm: string) {
  return deliveryTerm
    .replace(/\s*\((?:Incoterms|INCOTERMS)\s*2020\)\s*/g, '')
    .replace(/\s*INCOTERMS\s*2020\s*/gi, '')
    .trim() || deliveryTerm;
}

function deriveDestination(quote: ClassicQuotation) {
  if (quote.proformaDestination?.trim()) return quote.proformaDestination.trim();
  const buyerLines = blockLines(quote.buyerAddress)
    .filter((line) => !/^(tel|phone|email|fax)\s*:/i.test(line));
  return buyerLines[buyerLines.length - 1] || 'To be advised';
}

function getProformaShipmentDate(quote: ClassicQuotation) {
  return quote.proformaShipmentDate?.trim() || 'To be confirmed after order confirmation';
}

function pickTierRow(item: ClassicQuotationItem, tierRows: ClassicOrderTierRow[]) {
  const trialRow = tierRows.find((row) => row.tier === 'Trial Order') || tierRows[0];
  const moqRow = tierRows.find((row) => row.tier === 'MOQ Order') || trialRow;
  const fclRow = tierRows.find((row) => row.tier === 'FCL') || moqRow;
  const unit = item.quantityUnit.trim().toUpperCase();
  const quantityValue = Number(item.quantityValue) || 0;

  if (!tierRows.length) {
    return {
      row: undefined,
      quantityCtn: quantityValue,
      loadingBasis: item.quantityUnit ? `${fmt(quantityValue, 0)} ${item.quantityUnit}` : '-',
      tier: 'Quoted Quantity',
    };
  }

  if (unit.includes('FCL') || unit.includes('CONTAINER')) {
    return {
      row: fclRow,
      quantityCtn: Math.max(1, quantityValue || 1) * fclRow.totalCtn,
      loadingBasis: quantityValue > 1 ? `${fmt(quantityValue, 0)} x 20' FCL` : fclRow.loadingBasis,
      tier: fclRow.tier,
    };
  }

  if (unit.includes('PALLET')) {
    const palletCount = Math.max(1, quantityValue || 1);
    const cartonsPerPallet = trialRow.totalCtn || 0;
    const selectedRow = palletCount <= 1 ? trialRow : moqRow;
    return {
      row: selectedRow,
      quantityCtn: palletCount * cartonsPerPallet,
      loadingBasis: `${fmt(palletCount, 0)} PALLET`,
      tier: palletCount <= 1 ? trialRow.tier : moqRow.tier,
    };
  }

  if (unit.includes('CTN') || unit.includes('CARTON')) {
    const quantityCtn = Math.max(0, quantityValue);
    const selectedRow =
      quantityCtn >= fclRow.totalCtn
        ? fclRow
        : quantityCtn <= trialRow.totalCtn
          ? trialRow
          : moqRow;
    return {
      row: selectedRow,
      quantityCtn,
      loadingBasis: `${fmt(quantityCtn, 0)} CTN`,
      tier: 'Quoted Quantity',
    };
  }

  return {
    row: moqRow,
    quantityCtn: moqRow.totalCtn,
    loadingBasis: moqRow.loadingBasis,
    tier: moqRow.tier,
  };
}

export function buildProformaInvoiceLines(quote: ClassicQuotation): ProformaInvoiceLine[] {
  const currency = normalizeCurrency(quote.priceCurrency);

  return quote.items.map((item) => {
    const tierRows = buildClassicOrderTierRows(item, {
      currency,
      deliveryTerm: quote.deliveryTerm,
      fxRate: quote.fxRate,
    });
    const selectedTier = pickTierRow(item, tierRows);
    const preset = findClassicCartonPreset(item.description);
    const unitPrice = selectedTier.row?.pricePerCtn ?? item.priceValue ?? 0;
    const quantityCtn = selectedTier.quantityCtn || selectedTier.row?.totalCtn || 0;
    const pieces = preset ? quantityCtn * preset.piecesPerCarton : 0;
    const grossWeight = preset ? quantityCtn * preset.grossWeight : 0;

    return {
      description: item.description || '-',
      note: item.note || '',
      shippingMark: item.shippingMark || '-',
      tier: selectedTier.tier,
      loadingBasis: selectedTier.loadingBasis,
      quantityCtn,
      pieces,
      grossWeight,
      unitPrice,
      amount: quantityCtn * unitPrice,
      priceCurrency: currency,
      priceBasisLabel: selectedTier.row?.priceBasisLabel || '',
    };
  });
}

function totalBy(lines: ProformaInvoiceLine[], key: 'quantityCtn' | 'pieces' | 'grossWeight' | 'amount') {
  return lines.reduce((sum, line) => sum + line[key], 0);
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

export default function ProformaInvoicePage() {
  const [quote, setQuote] = useState<ClassicQuotation>(() => readClassicDraft());
  const [sharedFxRate, setSharedFxRate] = useSharedFxRate(quote.fxRate || DEFAULT_FX_RATE);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [status, setStatus] = useState<ProformaStatus | null>(null);
  const [goodsPickerValue, setGoodsPickerValue] = useState('');

  const lines = useMemo(() => buildProformaInvoiceLines(quote), [quote]);
  const currency = normalizeCurrency(quote.priceCurrency);
  const thbQuote = isThbQuote(currency);
  const validUntilDate = formatDisplayDate(addDaysIso(quote.date, QUOTATION_VALIDITY_DAYS));
  const proformaNo = buildProformaNo(quote.refNo);
  const totalAmount = totalBy(lines, 'amount');
  const totalCtn = totalBy(lines, 'quantityCtn');
  const totalPieces = totalBy(lines, 'pieces');
  const totalGrossWeight = totalBy(lines, 'grossWeight');
  const tradeTermLabel = getTradeTermLabel(quote.deliveryTerm);
  const unitPriceHeader = `${currency}/CTN`;
  const amountHeader = `TOTAL ${currency}`;
  const deliverySelectValue = isPreset(quote.deliveryTerm, INCOTERMS_PRESETS)
    ? quote.deliveryTerm
    : UNIT_CUSTOM_LABEL;
  const paymentSelectValue = isPreset(quote.paymentTerms, PAYMENT_PRESETS)
    ? quote.paymentTerms
    : UNIT_CUSTOM_LABEL;
  const sellerBankSelectValue = THAI_BANK_PRESETS.some((bank) => bank.name === quote.sellerBank)
    ? quote.sellerBank
    : UNIT_CUSTOM_LABEL;

  const update = <K extends keyof ClassicQuotation>(key: K, value: ClassicQuotation[K]) => {
    setQuote((current) => ({ ...current, [key]: value }));
  };

  const syncItemsAndSubject = (items: ClassicQuotationItem[]) => {
    const normalizedItems = items
      .filter(
        (item) =>
          (item.description || '').trim() ||
          (item.note || '').trim() ||
          (item.shippingMark || '').trim() ||
          item.priceValue > 0 ||
          item.quantityValue > 0,
      )
      .map((item) => ({ ...defaultClassicQuotationItem(), ...item, note: item.note || '' }));
    const safeItems = normalizedItems.length ? normalizedItems : [defaultClassicQuotationItem()];
    const firstItem = safeItems[0];
    setQuote((current) => ({
      ...current,
      items: safeItems,
      description: joinGoodsDescriptionLines(safeItems.map((item) => item.description)),
      shippingMark: firstItem.shippingMark,
      priceValue: firstItem.priceValue,
      priceUnit: firstItem.priceUnit,
      minQtyValue: firstItem.quantityValue,
      minQtyUnit: firstItem.quantityUnit,
      quoteQtyValue: firstItem.quantityValue,
      quoteQtyUnit: firstItem.quantityUnit,
      subject: buildClassicSubjectFromDescriptions(safeItems.map((item) => item.description)),
    }));
  };

  const updateItem = (index: number, patch: Partial<ClassicQuotationItem>) => {
    const next = quote.items.slice();
    next[index] = { ...defaultClassicQuotationItem(), ...next[index], ...patch };
    syncItemsAndSubject(next);
  };

  const addGoodsDescriptionPreset = (description?: string) => {
    syncItemsAndSubject([
      ...quote.items,
      defaultClassicQuotationItem(
        description || '',
        quote.inquiryType === 'QUOTE' ? quote.quoteQtyValue : quote.minQtyValue,
        quote.inquiryType === 'QUOTE' ? quote.quoteQtyUnit : quote.minQtyUnit,
      ),
    ]);
  };

  const removeItem = (index: number) => {
    syncItemsAndSubject(quote.items.filter((_, itemIndex) => itemIndex !== index));
  };

  const applyCompanyLogoPreset = (presetId: string) => {
    const preset = COMPANY_LOGO_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setQuote((current) => ({
      ...current,
      logoDataUrl: preset.logoSrc,
      sellerName: preset.sellerName,
      sellerAddress: preset.sellerAddress,
    }));
  };

  useEffect(() => {
    setQuote((current) =>
      current.fxRate === sharedFxRate ? current : { ...current, fxRate: sharedFxRate },
    );
  }, [sharedFxRate]);

  useEffect(() => {
    localStorage.setItem(CLASSIC_QUOTATION_STORAGE_KEY, JSON.stringify(quote));
  }, [quote]);

  const handleRefreshFromQuotation = () => {
    const nextQuote = readClassicDraft();
    setQuote(nextQuote);
    setSharedFxRate(nextQuote.fxRate || DEFAULT_FX_RATE);
    setStatus({
      lead: 'Proforma invoice refreshed from Classic quotation.',
      filename: '',
      tail: '',
    });
  };

  const handleCopyStatusFilename = async () => {
    if (!status?.filename) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(status.filename);
      } else {
        window.prompt('Copy filename', status.filename);
      }
      setStatus((current) => (current ? { ...current, copied: true } : current));
    } catch (error) {
      console.error(error);
      window.prompt('Copy filename', status.filename);
    }
  };

  const handleSaveProformaData = () => {
    const savedAt = new Date();
    const fileBaseName = buildProformaPdfBaseName(quote, savedAt);
    triggerDownload(
      new Blob(
        [
          JSON.stringify(
            {
              savedAt: savedAt.toISOString(),
              quote,
              proformaNo,
              lines,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
      `${fileBaseName}.json`,
    );
    setStatus({
      lead: 'Proforma data saved as',
      filename: fileBaseName,
      tail: '.json.',
      copied: false,
    });
  };

  const handleOpenProformaPdf = async () => {
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.title = 'Preparing PDF...';
      popup.document.body.innerHTML =
        '<div style="font-family: Avenir Next, Segoe UI, sans-serif; padding: 24px; color: #5b4532;">Preparing PDF...</div>';
    }

    try {
      setIsOpeningPdf(true);
      setStatus(null);
      const [{ pdf }, { default: ProformaInvoicePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PDF/ProformaInvoicePDF'),
      ]);
      const fileBaseName = buildProformaPdfBaseName(quote);
      const blob = await pdf(
        <ProformaInvoicePDF
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

      setStatus({
        lead: 'PDF opened in a new tab as',
        filename: fileBaseName,
        tail: '.pdf. Use the browser PDF viewer to download if needed.',
        copied: false,
      });
    } catch (error) {
      if (popup) popup.close();
      console.error(error);
      setStatus({
        lead: 'PDF export failed.',
        filename: '',
        tail: ' Check the console for details.',
      });
    } finally {
      setIsOpeningPdf(false);
    }
  };

  return (
    <div className="classic-page proforma-page">
      <div className="classic-layout proforma-layout workspace classic-workspace">
        <div className="classic-editor proforma-editor editor-column">
          <Card title="Shared invoice data">
            <div className="score-row">
              <div>
                <div className="score-label">Input mode</div>
                <div className="score-value">PI</div>
              </div>
              <div className="muted">
                แก้ข้อมูลตรงนี้แล้วระบบบันทึกลง draft เดียวกับ Classic quotation ทันที
              </div>
            </div>

            <LogoUploader
              value={quote.logoDataUrl}
              widthPt={quote.logoWidth}
              onChange={(value) => update('logoDataUrl', value)}
              onWidthChange={(value) => update('logoWidth', value)}
              presets={COMPANY_LOGO_PRESETS.map((preset) => ({
                id: preset.id,
                label: preset.label,
              }))}
              selectedPresetId={
                COMPANY_LOGO_PRESETS.find((preset) => preset.logoSrc === quote.logoDataUrl)?.id
              }
              onSelectPreset={applyCompanyLogoPreset}
            />

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

          <Card title="Buyer and invoice setup">
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
                <Label>Proforma date</Label>
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
            </div>
          </Card>

          <Card title="Commercial and logistics terms">
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
                    placeholder="Or type custom delivery term"
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
                <Label>Destination</Label>
                <Input
                  value={quote.proformaDestination}
                  onChange={(event) => update('proformaDestination', event.target.value)}
                  placeholder="Osaka, Japan / To be advised"
                />
              </div>
              <div className="grid">
                <Label>Carrier / Voyage</Label>
                <Input
                  value={quote.proformaCarrierVoyage}
                  onChange={(event) => update('proformaCarrierVoyage', event.target.value)}
                  placeholder="To be advised"
                />
              </div>
              <div className="grid">
                <Label>Collecting bank</Label>
                <Input
                  value={quote.proformaCollectingBank}
                  onChange={(event) => update('proformaCollectingBank', event.target.value)}
                  placeholder="Buyer's nominated bank / To be advised"
                />
              </div>
              <div className="grid">
                <Label>Shipment date</Label>
                <Input
                  value={quote.proformaShipmentDate}
                  onChange={(event) => update('proformaShipmentDate', event.target.value)}
                  placeholder="To be confirmed after order confirmation"
                />
              </div>
              <div className="grid">
                <Label>Price currency</Label>
                <Select
                  value={quote.priceCurrency}
                  onChange={(value) => update('priceCurrency', value)}
                  options={CURRENCY_OPTIONS}
                  placeholder="Select currency"
                />
              </div>
              <div className="grid">
                <Label>{thbQuote ? 'Shared FX rate' : `Shared FX rate (1 ${currency} = THB)`}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quote.fxRate}
                  onChange={(event) => {
                    const nextFxRate = Number(event.target.value) || DEFAULT_FX_RATE;
                    setSharedFxRate(nextFxRate);
                    update('fxRate', nextFxRate);
                  }}
                />
              </div>
              <div className="grid">
                <Label>Inquiry type</Label>
                <Select
                  value={quote.inquiryType}
                  onChange={(value) => update('inquiryType', value === 'QUOTE' ? 'QUOTE' : 'MOQ')}
                  options={INQUIRY_TYPE_OPTIONS}
                  placeholder="Select inquiry type"
                />
              </div>
            </div>
          </Card>

          <Card title="Products">
            <div className="grid" style={{ gap: 14 }}>
              <div className="grid">
                <Label>Add product</Label>
                <Select
                  value={goodsPickerValue}
                  onChange={(value) => {
                    if (value === GOODS_DESCRIPTION_CUSTOM_LABEL) {
                      addGoodsDescriptionPreset('');
                      setGoodsPickerValue('');
                      return;
                    }
                    addGoodsDescriptionPreset(value);
                    setGoodsPickerValue('');
                  }}
                  options={[...GOODS_DESCRIPTION_PRESETS, GOODS_DESCRIPTION_CUSTOM_LABEL]}
                  placeholder="Add product description"
                />
              </div>

              {quote.items.map((item, index) => {
                const descriptionSelectValue = GOODS_DESCRIPTION_PRESETS.includes(item.description)
                  ? item.description
                  : GOODS_DESCRIPTION_CUSTOM_LABEL;
                const itemPriceUnitSelectValue = isPreset(item.priceUnit, LINE_ITEM_UNIT_PRESETS)
                  ? item.priceUnit
                  : UNIT_CUSTOM_LABEL;
                const itemQuantityUnitSelectValue = isPreset(item.quantityUnit, MIN_QTY_UNIT_PRESETS)
                  ? item.quantityUnit
                  : UNIT_CUSTOM_LABEL;

                return (
                  <div key={`${item.description}-${index}`} className="proforma-product-editor">
                    <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div className="label">Product line {index + 1}</div>
                        <div className="muted">
                          Quantity นี้ใช้คำนวณ CTN, PCS, amount ใน proforma invoice
                        </div>
                      </div>
                      <button type="button" className="btn" onClick={() => removeItem(index)}>
                        Remove
                      </button>
                    </div>

                    <div className="grid" style={{ gap: 10, marginTop: 12 }}>
                      <div className="grid">
                        <Label>Description template</Label>
                        <Select
                          value={descriptionSelectValue}
                          onChange={(value) => {
                            if (value === GOODS_DESCRIPTION_CUSTOM_LABEL) {
                              updateItem(index, { description: '' });
                              return;
                            }
                            updateItem(index, { description: value });
                          }}
                          options={[...GOODS_DESCRIPTION_PRESETS, GOODS_DESCRIPTION_CUSTOM_LABEL]}
                          placeholder="Choose a product"
                        />
                      </div>
                      <div className="grid">
                        <Label>Description of goods</Label>
                        <Textarea
                          rows={3}
                          value={item.description}
                          onChange={(event) => updateItem(index, { description: event.target.value })}
                        />
                      </div>
                      <div className="grid">
                        <Label>Note</Label>
                        <Textarea
                          rows={2}
                          value={item.note || ''}
                          onChange={(event) => updateItem(index, { note: event.target.value })}
                          placeholder="Optional product note"
                        />
                      </div>
                      <div className="grid two-col">
                        <div className="grid">
                          <Label>Shipping mark</Label>
                          <Input
                            value={item.shippingMark}
                            onChange={(event) => updateItem(index, { shippingMark: event.target.value })}
                          />
                        </div>
                        <div className="grid">
                          <Label>Price / unit fallback</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.priceValue}
                            onChange={(event) => updateItem(index, { priceValue: Number(event.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid">
                          <Label>Price unit</Label>
                          <Select
                            value={itemPriceUnitSelectValue}
                            onChange={(value) => {
                              if (value === UNIT_CUSTOM_LABEL) {
                                updateItem(index, { priceUnit: '' });
                                return;
                              }
                              updateItem(index, { priceUnit: value });
                            }}
                            options={[...LINE_ITEM_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                            placeholder="Choose unit"
                          />
                          {itemPriceUnitSelectValue === UNIT_CUSTOM_LABEL ? (
                            <Input
                              value={item.priceUnit}
                              onChange={(event) => updateItem(index, { priceUnit: event.target.value })}
                              placeholder="Custom price unit"
                            />
                          ) : null}
                        </div>
                        <div className="grid">
                          <Label>{quote.inquiryType === 'QUOTE' ? 'Requested Qty' : 'MOQ value'}</Label>
                          <Input
                            type="number"
                            step="1"
                            value={item.quantityValue}
                            onChange={(event) => updateItem(index, { quantityValue: Number(event.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid">
                          <Label>{quote.inquiryType === 'QUOTE' ? 'Requested unit' : 'MOQ unit'}</Label>
                          <Select
                            value={itemQuantityUnitSelectValue}
                            onChange={(value) => {
                              if (value === UNIT_CUSTOM_LABEL) {
                                updateItem(index, { quantityUnit: '' });
                                return;
                              }
                              updateItem(index, { quantityUnit: value });
                            }}
                            options={[...MIN_QTY_UNIT_PRESETS, UNIT_CUSTOM_LABEL]}
                            placeholder="Choose unit"
                          />
                          {itemQuantityUnitSelectValue === UNIT_CUSTOM_LABEL ? (
                            <Input
                              value={item.quantityUnit}
                              onChange={(event) => updateItem(index, { quantityUnit: event.target.value })}
                              placeholder="Custom quantity unit"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Bank, note, and signature">
            <div className="grid">
              <Label>Seller bank</Label>
              <Select
                value={sellerBankSelectValue}
                onChange={(value) => {
                  if (value === UNIT_CUSTOM_LABEL) {
                    setQuote((current) => ({ ...current, sellerBank: '' }));
                    return;
                  }
                  const selectedBank = THAI_BANK_PRESETS.find((bank) => bank.name === value);
                  if (!selectedBank) return;
                  setQuote((current) => ({
                    ...current,
                    sellerBank: selectedBank.name,
                    bankAddress: selectedBank.address,
                    swiftCode: selectedBank.swift,
                  }));
                }}
                options={[...THAI_BANK_PRESETS.map((bank) => bank.name), UNIT_CUSTOM_LABEL]}
                placeholder="Choose Thai bank"
              />
              {sellerBankSelectValue === UNIT_CUSTOM_LABEL ? (
                <Input
                  value={quote.sellerBank}
                  onChange={(event) => update('sellerBank', event.target.value)}
                  placeholder="Custom seller bank name"
                />
              ) : null}
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
              <Label>Additional notes</Label>
              <Textarea
                rows={3}
                value={quote.paymentNote || ''}
                onChange={(event) => update('paymentNote', event.target.value)}
              />
              <Label>Closing sentence</Label>
              <Textarea
                rows={3}
                value={quote.closingLine1}
                onChange={(event) => update('closingLine1', event.target.value)}
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

        <div className="classic-preview-column proforma-preview-column preview-column">
          <div className="preview-shell classic-preview-shell">
            <div className="preview-head classic-toolbar classic-preview-head">
              <div>
                <div className="preview-eyebrow">Proforma invoice</div>
                <h2>Proforma invoice preview</h2>
                <p>ใช้สินค้า ราคา ผู้ขาย และ FX rate ชุดเดียวกับหน้า Classic quotation</p>
              </div>
              <button type="button" className="btn" onClick={handleRefreshFromQuotation}>
                Refresh from quotation
              </button>
              <button type="button" className="btn classic-save-btn" onClick={handleSaveProformaData}>
                Save proforma
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleOpenProformaPdf}
                disabled={isOpeningPdf}
              >
                {isOpeningPdf ? 'Preparing PDF...' : 'Open PDF'}
              </button>
            </div>

            {status ? (
              <div className="classic-pdf-status">
                <span>{status.lead}</span>
                {status.filename ? (
                  <button
                    type="button"
                    className={`status-copy-chip ${status.copied ? 'copied' : ''}`}
                    onClick={handleCopyStatusFilename}
                    title="Copy filename"
                  >
                    <span>{status.filename}</span>
                    {status.copied ? (
                      <Check size={14} strokeWidth={2.4} />
                    ) : (
                      <Copy size={14} strokeWidth={2.1} />
                    )}
                  </button>
                ) : null}
                <span>{status.tail}</span>
              </div>
            ) : null}

            <section className="quote-sheet-v2 proforma-sheet pi-sheet" aria-label="Proforma invoice preview">
              <header className="pi-header">
                <img
                  src={quote.logoDataUrl || DEFAULT_CLASSIC_LOGO_SRC}
                  alt="Company logo"
                  className="quote-v2-logo proforma-logo pi-logo"
                  style={{ maxWidth: quote.logoWidth }}
                />
                <div className="pi-seller-heading">
                  <h2>{quote.sellerName}</h2>
                  {blockLines(quote.sellerAddress).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="pi-title">PROFORMA INVOICE</div>
              </header>

              <section className="pi-consignee-grid">
                <article className="pi-box pi-consignee">
                  <span>Consignee</span>
                  <strong>{quote.buyerName}</strong>
                  {blockLines(quote.buyerAddress).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p>Attn: {quote.attention || '-'}</p>
                </article>
                <article className="pi-box pi-doc-meta">
                  <div>
                    <span>Proforma No.</span>
                    <strong>{proformaNo}</strong>
                  </div>
                  <div>
                    <span>Proforma Date</span>
                    <strong>{formatDisplayDate(quote.date)}</strong>
                  </div>
                  <div>
                    <span>Currency</span>
                    <strong>{currency}</strong>
                  </div>
                  <div>
                    <span>Valid until</span>
                    <strong>{validUntilDate}</strong>
                  </div>
                </article>
              </section>

              <section className="pi-terms-grid">
                <article className="pi-box">
                  <span>Terms of payment</span>
                  <strong>{quote.paymentTerms}</strong>
                  <span>Collecting bank</span>
                  <strong>{quote.proformaCollectingBank || "Buyer's nominated bank / To be advised"}</strong>
                </article>
                <article className="pi-box">
                  <p><b>Port of loading:</b> {derivePortOfLoading(quote.deliveryTerm)}</p>
                  <p><b>Destination:</b> {deriveDestination(quote)}</p>
                  <p><b>Carrier / Voyage No.:</b> {quote.proformaCarrierVoyage || 'To be advised'}</p>
                  <p><b>On board date:</b> {getProformaShipmentDate(quote)}</p>
                </article>
              </section>

              <section className="pi-bank-block">
                <p><b>Payment through:</b> {quote.sellerBank || 'To be advised'}</p>
                {blockLines(quote.bankAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p><b>Swift code:</b> {quote.swiftCode || '-'}</p>
              </section>

              <section className="proforma-table-card pi-table-card">
                <table className="proforma-items-table pi-items-table">
                  <thead>
                    <tr>
                      <th>Shipping Marks</th>
                      <th>Description of Goods</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                    <tr>
                      <th></th>
                      <th>Country of Origin: Thailand</th>
                      <th>CTN</th>
                      <th>{unitPriceHeader}<br />{tradeTermLabel}</th>
                      <th>{amountHeader}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={`${line.description}-${index}`}>
                        <td>{line.shippingMark}</td>
                        <td>
                          <strong>{line.description}</strong>
                        </td>
                        <td className="num">{fmt(line.quantityCtn, 0)}</td>
                        <td className="num">{formatMoney(line.priceCurrency, line.unitPrice)}</td>
                        <td className="num">{formatMoney(line.priceCurrency, line.amount)}</td>
                      </tr>
                    ))}
                    <tr className="proforma-term-row">
                      <td>Total {tradeTermLabel}</td>
                      <td colSpan={3}></td>
                      <td className="num">{formatMoney(currency, totalAmount)}</td>
                    </tr>
                    <tr className="proforma-total-row">
                      <td>Incoterms 2020</td>
                      <td colSpan={3}>Total amount: {amountInWords(currency, totalAmount)}</td>
                      <td className="num">{formatMoney(currency, totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="pi-summary-grid">
                <article className="pi-summary-copy">
                  <p><b>Packer's name:</b> {quote.sellerName}</p>
                  <p><b>Total packages:</b> {fmt(totalCtn, 0)} CTN</p>
                  <p><b>Total quantity:</b> {fmt(totalCtn, 0)} CTN / {fmt(totalPieces, 0)} PCS</p>
                  <p><b>Total gross weight:</b> {totalGrossWeight ? `${fmt(totalGrossWeight, 1)} KGS` : 'To be confirmed'}</p>
                  <p><b>Total net weight:</b> As per final packing list</p>
                  <p>
                    <b>Exchange rate reference:</b>{' '}
                    {thbQuote
                      ? 'THB quote - no FX applied'
                      : `1 ${currency} = ${fmt(quote.fxRate, 2)} THB`}
                  </p>
                  {quote.paymentNote ? <p><b>Note:</b> {quote.paymentNote}</p> : null}
                </article>
                <article className="pi-signature-block">
                  <div className="pi-sign-space" />
                  <p>(Authorized Signature)</p>
                  <strong>{quote.signName}</strong>
                  <span>{quote.signTitle}</span>
                  <small>For and on behalf of {quote.sellerName}</small>
                </article>
              </section>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
