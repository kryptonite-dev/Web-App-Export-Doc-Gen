import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Card, Input, Label, Select, Textarea } from './ui';
import LogoUploader from './LogoUploader';
import MiniPriceCalculator from './MiniPriceCalculator';
import { buildClassicOrderTierRows, formatClassicTierPrice } from '../classicQuotationScale';
import { DEFAULT_FX_RATE, useSharedFxRate } from '../sharedFxRate';
import { fmt, todayISO } from '../utils';
import {
  buildClassicSubjectFromDescriptions,
  GOODS_DESCRIPTION_CUSTOM_LABEL,
  GOODS_DESCRIPTION_PRESETS,
  joinGoodsDescriptionLines,
  splitGoodsDescriptionLines,
  COMPANY_LOGO_PRESETS,
  INCOTERMS_PRESETS,
  LINE_ITEM_UNIT_PRESETS,
  MIN_QTY_UNIT_PRESETS,
  PAYMENT_PRESETS,
  UNIT_CUSTOM_LABEL,
} from '../constants';

export type ClassicQuotationItem = {
  description: string;
  note: string;
  shippingMark: string;
  priceValue: number;
  priceUnit: string;
  quantityValue: number;
  quantityUnit: string;
};

export type ClassicQuotation = {
  logoDataUrl?: string;
  logoWidth: number;
  inquiryType: 'MOQ' | 'QUOTE';
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
  quoteQtyValue: number;
  quoteQtyUnit: string;
  paymentTerms: string;
  paymentNote: string;
  sellerBank: string;
  bankAddress: string;
  swiftCode: string;
  fxRate: number;
  closingLine1: string;
  closingLine2: string;
  signName: string;
  signTitle: string;
  items: ClassicQuotationItem[];
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
export const CLASSIC_QUOTATION_STORAGE_KEY = 'classic-export-quotation-draft-v2';
export const CLASSIC_PRICE_CALCULATOR_STORAGE_KEY = 'classic-mini-price-calculator-v1';
const QUOTATION_VALIDITY_DAYS = 14;
const REQUESTED_DELIVERY_TERM = 'FOB Bangkok Port, Thailand (Incoterms 2020)';
const REQUESTED_PAYMENT_TERM = '100% T/T in advance before shipment';
const REQUESTED_CLOSING_TEXT =
  'We hope the above quotation is acceptable to you. If you need further information, please do not hesitate to contact us. We look forward to your favourable reply.';
const BANK_DETAILS_AFTER_CONFIRMATION = 'To be provided in the Proforma Invoice after order confirmation.';
const FOB_TRIAL_SHIPMENT_NOTE =
  "For trial pallet order, shipment shall be coordinated with buyer's nominated forwarder.\nOcean freight, insurance, destination charges, import duties, and taxes are excluded.";
const EXCHANGE_VALIDITY_NOTE = 'Prices are valid within the validity period.';
const isPreset = (value: string, presets: string[]) => presets.includes(value);
const CURRENCY_OPTIONS = ['USD', 'THB', 'EUR', 'AED'];
const INQUIRY_TYPE_OPTIONS = ['MOQ', 'QUOTE'];
const THAI_BANK_PRESETS = [
  {
    name: 'EXPORT IMPORT BANK OF THAILAND',
    swift: 'EXTHTHBKXXX',
    address: 'EXIM BLDG., 14TH FLOOR, 1193 PHAHOLYOTHIN RD, PHAYATHAI, BANGKOK 10400',
  },
  {
    name: 'BANGKOK BANK PUBLIC COMPANY LIMITED',
    swift: 'BKKBTHBKXXX',
    address: '333 SILOM ROAD, SILOM, BANG RAK, BANGKOK 10500',
  },
  {
    name: 'KASIKORNBANK PUBLIC COMPANY LIMITED',
    swift: 'KASITHBKXXX',
    address: '1 SOI KASIKORNTHAI, RATBURANA ROAD, RATBURANA, BANGKOK 10140',
  },
  {
    name: 'SIAM COMMERCIAL BANK PUBLIC COMPANY LIMITED',
    swift: 'SICOTHBKXXX',
    address: '9 RATCHADAPHISEK ROAD, CHATUCHAK, BANGKOK 10900',
  },
  {
    name: 'KRUNG THAI BANK PUBLIC COMPANY LIMITED',
    swift: 'KRTHTHBKXXX',
    address: '35 SUKHUMVIT ROAD, KHLONG TOEI NUEA, WATTHANA, BANGKOK 10110',
  },
  {
    name: 'BANK OF AYUDHYA PUBLIC COMPANY LIMITED',
    swift: 'AYUDTHBKXXX',
    address: '1222 RAMA III ROAD, BANG PHONGPHANG, YAN NAWA, BANGKOK 10120',
  },
  {
    name: 'TMBTHANACHART BANK PUBLIC COMPANY LIMITED',
    swift: 'TMBKTHBKXXX',
    address: '3000 PHAHONYOTHIN ROAD, CHOMPHON, CHATUCHAK, BANGKOK 10900',
  },
  {
    name: 'UNITED OVERSEAS BANK (THAI) PUBLIC COMPANY LIMITED',
    swift: 'UOVBTHBKXXX',
    address: '690 UOB PLAZA, SUKHUMVIT ROAD, KHLONG TAN, BANGKOK 10110',
  },
  {
    name: 'GOVERNMENT SAVINGS BANK',
    swift: 'GSBATHBKXXX',
    address: '470 PHAHOLYOTHIN ROAD, SAMSEN NAI, PHAYA THAI, BANGKOK 10400',
  },
];

type ClassicStatus = {
  lead: string;
  filename: string;
  tail: string;
  copied?: boolean;
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

function buildClassicRefPrefix(dateIso = todayISO()) {
  const [year, month] = dateIso.split('-');
  return `QUO${year || new Date().getFullYear()}${month || String(new Date().getMonth() + 1).padStart(2, '0')}`;
}

function buildDefaultClassicRef(dateIso = todayISO()) {
  return `${buildClassicRefPrefix(dateIso)}-001`;
}

function normalizeClassicRef(refNo: string, dateIso = todayISO()) {
  const prefix = buildClassicRefPrefix(dateIso);
  const value = refNo.trim();
  if (!value || value === 'FAHLADDA/TFX-2026-001') return buildDefaultClassicRef(dateIso);
  if (value.startsWith(prefix)) return value;
  if (/^QUO\d{6}/.test(value)) return value.replace(/^QUO\d{6}/, prefix);
  return `${prefix}-${value}`;
}

function formatQuantityFilenameValue(value: number) {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/\.?0+$/, '').replace('.', '-');
}

function buildClassicPdfBaseName(quote: ClassicQuotation, date = new Date()) {
  const buyer = quote.buyerName || quote.attention || quote.refNo || 'classic-quotation';
  const activeQuantity = getClassicQuantityDisplay(quote);
  const qty = `${formatQuantityFilenameValue(activeQuantity.value)}${activeQuantity.unit || 'unit'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `Quotation_${sanitizeFilename(buyer)}_${qty}_${formatFilenameTimestamp(date)}`;
}

function isThbQuote(currency: string) {
  return currency.trim().toUpperCase() === 'THB';
}

function defaultClassicQuotationItem(
  description = GOODS_DESCRIPTION_PRESETS[0],
  quantityValue = 2,
  quantityUnit = 'PALLET',
): ClassicQuotationItem {
  return {
    description,
    note: description.toLowerCase().includes('watermelon')
      ? 'Special production item, subject to production confirmation.'
      : '',
    shippingMark: 'HUQ KHUUN',
    priceValue: 0,
    priceUnit: 'CTN',
    quantityValue,
    quantityUnit,
  };
}

export function getClassicQuantityDisplay(quote: ClassicQuotation) {
  if (quote.items?.length) {
    const total = quote.items.reduce((sum, item) => sum + (Number(item.quantityValue) || 0), 0);
    const units = Array.from(
      new Set(
        quote.items
          .map((item) => item.quantityUnit.trim())
          .filter(Boolean),
      ),
    );

    return {
      label: quote.inquiryType === 'QUOTE' ? 'Requested Qty' : 'Min. Qty / Order',
      value: total,
      unit: units.length === 1 ? units[0] : 'ITEMS',
    };
  }

  if (quote.inquiryType === 'QUOTE') {
    return {
      label: 'Requested Qty',
      value: quote.quoteQtyValue,
      unit: quote.quoteQtyUnit,
    };
  }

  return {
    label: 'Min. Qty / Order',
    value: quote.minQtyValue,
    unit: quote.minQtyUnit,
  };
}

function defaultClassicQuotation(): ClassicQuotation {
  const defaultDescription = GOODS_DESCRIPTION_PRESETS[0];
  const defaultItem = defaultClassicQuotationItem(defaultDescription);
  return {
    logoDataUrl: undefined,
    logoWidth: 160,
    inquiryType: 'MOQ',
    sellerName: 'FAH LADDA CO., LTD.',
    sellerAddress: '79/1 Moo1, Klongtan, Ban Phaeo, Samut Sakhon, 74120, Thailand',
    buyerName: 'PROSPECTIVE BUYER',
    buyerAddress: 'Company / Country\nUpdate after the booth conversation',
    attention: 'Procurement Team',
    fromPerson: 'Taninnuth Warittarasith',
    subject: buildClassicSubjectFromDescriptions([defaultDescription]),
    deliveryTerm: REQUESTED_DELIVERY_TERM,
    date: todayISO(),
    pages: '1 of 1',
    refNo: buildDefaultClassicRef(),
    description: defaultItem.description,
    shippingMark: defaultItem.shippingMark,
    priceCurrency: 'USD',
    priceValue: defaultItem.priceValue,
    priceUnit: defaultItem.priceUnit,
    minQtyValue: defaultItem.quantityValue,
    minQtyUnit: defaultItem.quantityUnit,
    quoteQtyValue: defaultItem.quantityValue,
    quoteQtyUnit: defaultItem.quantityUnit,
    paymentTerms: REQUESTED_PAYMENT_TERM,
    paymentNote: FOB_TRIAL_SHIPMENT_NOTE,
    sellerBank: 'EXPORT IMPORT BANK OF THAILAND',
    bankAddress: 'EXIM BLDG., 14TH FLOOR, 1193 PHAHOLYOTHIN RD, PHAYATHAI, BANGKOK 10400',
    swiftCode: 'EXTHTHBKXXX',
    fxRate: DEFAULT_FX_RATE,
    closingLine1: REQUESTED_CLOSING_TEXT,
    closingLine2: '',
    signName: 'Taninnuth Warittarasith',
    signTitle: 'Co-Founder',
    items: [defaultItem],
  };
}

function hydrateClassicQuotation(source?: Partial<ClassicQuotation> | null): ClassicQuotation {
  const base = defaultClassicQuotation();
  const legacyQuantityValue =
    source?.inquiryType === 'QUOTE'
      ? source.quoteQtyValue ?? base.quoteQtyValue
      : source?.minQtyValue ?? base.minQtyValue;
  const legacyQuantityUnit =
    source?.inquiryType === 'QUOTE'
      ? source.quoteQtyUnit ?? base.quoteQtyUnit
      : source?.minQtyUnit ?? base.minQtyUnit;

  const normalizedItems =
    source?.items?.length
      ? source.items.map((item) => {
          const defaultItem = defaultClassicQuotationItem(
            item.description || base.description,
            item.quantityValue ?? legacyQuantityValue,
            item.quantityUnit || legacyQuantityUnit,
          );
          return {
            ...defaultItem,
            ...item,
            note: item.note || defaultItem.note,
          };
        })
      : [
          {
            ...defaultClassicQuotationItem(
              source?.description || base.description,
              legacyQuantityValue,
              legacyQuantityUnit,
            ),
            shippingMark: source?.shippingMark || base.shippingMark,
            priceValue: source?.priceValue ?? base.priceValue,
            priceUnit: source?.priceUnit || base.priceUnit,
          },
        ];

  const firstItem = normalizedItems[0] || base.items[0];

  const merged = {
    ...defaultClassicQuotation(),
    ...(source || {}),
    items: normalizedItems,
    description: joinGoodsDescriptionLines(normalizedItems.map((item) => item.description)),
    shippingMark: firstItem.shippingMark,
    priceValue: firstItem.priceValue,
    priceUnit: firstItem.priceUnit,
    minQtyValue: firstItem.quantityValue,
    minQtyUnit: firstItem.quantityUnit,
    quoteQtyValue: firstItem.quantityValue,
    quoteQtyUnit: firstItem.quantityUnit,
    paymentNote: source?.paymentNote ?? base.paymentNote,
    date: todayISO(),
    refNo: normalizeClassicRef(source?.refNo || base.refNo, todayISO()),
  };

  if (!source?.subject || source.subject === defaultClassicQuotation().subject) {
    merged.subject = buildClassicSubjectFromDescriptions(normalizedItems.map((item) => item.description));
  }

  if (
    !source?.deliveryTerm ||
    source.deliveryTerm === 'FOB BANGKOK, THAILAND (Incoterms 2020)' ||
    source.deliveryTerm === 'FCA BANGKOK / KHLONG TOEI, THAILAND INCOTERMS 2020'
  ) {
    merged.deliveryTerm = REQUESTED_DELIVERY_TERM;
  }

  if (!source?.paymentTerms || source.paymentTerms === '100% Advance Payment') {
    merged.paymentTerms = REQUESTED_PAYMENT_TERM;
  }

  if (!source?.paymentNote || source.paymentNote === 'All banking fees outside Thailand are borne by the buyer.') {
    merged.paymentNote = FOB_TRIAL_SHIPMENT_NOTE;
  }

  if (
    !source?.closingLine1 ||
    source.closingLine1 ===
      'Hoping the above is acceptable to you. If you need further information, Please do not hesitate to' ||
    source.closingLine1 ===
      'We hope the above quotation is acceptable to you. If you need further information, please do not hesitate to contact us.'
  ) {
    merged.closingLine1 = REQUESTED_CLOSING_TEXT;
  }

  if (
    !source?.closingLine2 ||
    source.closingLine2 === 'contact us, we look forward for your favourable reply.' ||
    source.closingLine2 === 'We look forward to your favourable reply.'
  ) {
    merged.closingLine2 = '';
  }

  return merged;
}

function readClassicDraft() {
  try {
    return hydrateClassicQuotation(JSON.parse(localStorage.getItem(CLASSIC_QUOTATION_STORAGE_KEY) || 'null'));
  } catch {
    return defaultClassicQuotation();
  }
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

function blockLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitContactValue(value: string) {
  const cleanValue = value.trim();
  if (!cleanValue) return { name: '-', title: '' };
  const [name, ...titleParts] = cleanValue.split(/\s+[-–—]\s+/);
  return {
    name: name.trim() || '-',
    title: titleParts.join(' - ').trim(),
  };
}

export default function ClassicQuotationPage() {
  const [quote, setQuote] = useState<ClassicQuotation>(() => readClassicDraft());
  const [sharedFxRate, setSharedFxRate] = useSharedFxRate(quote.fxRate || DEFAULT_FX_RATE);
  const [currentDate, setCurrentDate] = useState(todayISO());
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [status, setStatus] = useState<ClassicStatus | null>(null);
  const [goodsPickerValue, setGoodsPickerValue] = useState('');
  const [classicCalculatorResetKey, setClassicCalculatorResetKey] = useState(0);

  const update = <K extends keyof ClassicQuotation>(key: K, value: ClassicQuotation[K]) => {
    setQuote((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setQuote((current) =>
      current.fxRate === sharedFxRate ? current : { ...current, fxRate: sharedFxRate },
    );
  }, [sharedFxRate]);

  useEffect(() => {
    const updateLiveDate = () => setCurrentDate(todayISO());
    updateLiveDate();
    const interval = window.setInterval(updateLiveDate, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuote((current) => {
      const nextRefNo = normalizeClassicRef(current.refNo, currentDate);
      if (current.date === currentDate && current.refNo === nextRefNo) return current;
      return {
        ...current,
        date: currentDate,
        refNo: nextRefNo,
      };
    });
  }, [currentDate]);

  const syncItemsAndSubject = (items: ClassicQuotationItem[]) => {
    const normalizedItems = items.filter(
      (item) =>
        (item.description || '').trim() ||
        (item.note || '').trim() ||
        (item.shippingMark || '').trim() ||
        item.priceValue > 0 ||
        item.quantityValue > 0,
    ).map((item) => ({ ...defaultClassicQuotationItem(), ...item, note: item.note || '' }));
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

  const updateItem = (index: number, patch: Partial<ClassicQuotationItem>) => {
    const next = quote.items.slice();
    next[index] = { ...defaultClassicQuotationItem(), ...next[index], ...patch };
    syncItemsAndSubject(next);
  };

  const addGoodsDescriptionPreset = (description?: string) => {
    const next = [
      ...quote.items,
      defaultClassicQuotationItem(
        description || '',
        quote.inquiryType === 'QUOTE' ? quote.quoteQtyValue : quote.minQtyValue,
        quote.inquiryType === 'QUOTE' ? quote.quoteQtyUnit : quote.minQtyUnit,
      ),
    ];
    syncItemsAndSubject(next);
  };

  const removeItem = (index: number) => {
    syncItemsAndSubject(quote.items.filter((_, itemIndex) => itemIndex !== index));
  };

  useEffect(() => {
    localStorage.setItem(CLASSIC_QUOTATION_STORAGE_KEY, JSON.stringify(quote));
  }, [quote]);

  const deliverySelectValue = isPreset(quote.deliveryTerm, INCOTERMS_PRESETS)
    ? quote.deliveryTerm
    : UNIT_CUSTOM_LABEL;
  const paymentSelectValue = isPreset(quote.paymentTerms, PAYMENT_PRESETS)
    ? quote.paymentTerms
    : UNIT_CUSTOM_LABEL;
  const sellerBankSelectValue = THAI_BANK_PRESETS.some((bank) => bank.name === quote.sellerBank)
    ? quote.sellerBank
    : UNIT_CUSTOM_LABEL;
  const thbQuote = isThbQuote(quote.priceCurrency);
  const priceCurrencyLabel = quote.priceCurrency.trim().toUpperCase() || 'USD';
  const liveQuote: ClassicQuotation = {
    ...quote,
    items: quote.items.map((item) => ({ ...defaultClassicQuotationItem(), ...item, note: item.note || '' })),
    paymentNote: quote.paymentNote || '',
    date: currentDate,
    refNo: normalizeClassicRef(quote.refNo, currentDate),
  };
  const validUntilDate = formatDisplayDate(addDaysIso(liveQuote.date, QUOTATION_VALIDITY_DAYS));
  const attentionContact = splitContactValue(quote.attention);
  const fromContact = splitContactValue(quote.fromPerson);

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

  const handleSaveClassicQuotation = () => {
    const savedAt = new Date();
    const fileBaseName = buildClassicPdfBaseName(liveQuote, savedAt);
    const filename = `${fileBaseName}.json`;
    triggerDownload(
      new Blob(
        [
          JSON.stringify(
            {
              savedAt: savedAt.toISOString(),
              quote: liveQuote,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
      filename,
    );
    setStatus({
      lead: 'Quotation data saved as',
      filename: fileBaseName,
      tail: '.json.',
      copied: false,
    });
  };

  const handleResetClassicQuotation = () => {
    const nextQuote = defaultClassicQuotation();
    localStorage.removeItem(CLASSIC_QUOTATION_STORAGE_KEY);
    localStorage.removeItem(CLASSIC_PRICE_CALCULATOR_STORAGE_KEY);
    setQuote(nextQuote);
    setSharedFxRate(nextQuote.fxRate || DEFAULT_FX_RATE);
    setCurrentDate(nextQuote.date);
    setGoodsPickerValue('');
    setClassicCalculatorResetKey((current) => current + 1);
    setStatus({
      lead: 'Classic quotation reset.',
      filename: '',
      tail: '',
    });
  };

  const handleOpenClassicPdf = async () => {
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.title = 'Preparing PDF...';
      popup.document.body.innerHTML =
        '<div style="font-family: Avenir Next, Segoe UI, sans-serif; padding: 24px; color: #5b4532;">Preparing PDF...</div>';
    }

    try {
      setIsOpeningPdf(true);
      setStatus(null);
      const [{ pdf }, { default: ClassicQuotationPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PDF/ClassicQuotationPDF'),
      ]);
      const fileBaseName = buildClassicPdfBaseName(liveQuote);
      const blob = await pdf(
        <ClassicQuotationPDF
          quote={liveQuote}
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
              presets={COMPANY_LOGO_PRESETS.map((preset) => ({
                id: preset.id,
                label: preset.label,
              }))}
              selectedPresetId={
                COMPANY_LOGO_PRESETS.find((preset) => preset.logoSrc === quote.logoDataUrl)?.id
              }
              onSelectPreset={applyCompanyLogoPreset}
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
                  value={currentDate}
                  readOnly
                />
                <span className="muted">Auto current date</span>
              </div>
              <div className="grid">
                <Label>Our ref.</Label>
                <Input
                  value={quote.refNo}
                  onChange={(event) => update('refNo', event.target.value)}
                  onBlur={(event) => update('refNo', normalizeClassicRef(event.target.value, currentDate))}
                />
                <span className="muted">Prefix: {buildClassicRefPrefix(currentDate)}</span>
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
                <Label>{thbQuote ? 'Shared FX rate' : `Shared FX rate (1 ${priceCurrencyLabel} = THB)`}</Label>
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
                {thbQuote ? (
                  <span className="muted">
                    THB quote: ไม่ต้องใช้ FX ในใบเสนอราคา exporter สามารถแปลงด้วย bank rate
                    ของตัวเอง
                  </span>
                ) : (
                  <span className="muted">
                    ใช้แปลงราคาอ้างอิง THB ใน price map เป็น {priceCurrencyLabel}
                  </span>
                )}
              </div>
              <div className="grid">
                <Label>Inquiry type</Label>
                <Select
                  value={quote.inquiryType}
                  onChange={(value) =>
                    update('inquiryType', value === 'QUOTE' ? 'QUOTE' : 'MOQ')
                  }
                  options={INQUIRY_TYPE_OPTIONS}
                  placeholder="Select inquiry type"
                />
                <span className="muted">
                  MOQ = แจ้งขั้นต่ำ, QUOTE = ระบุจำนวนที่ลูกค้าขอราคา โดย quantity จะแยกอยู่ในแต่ละสินค้า
                </span>
              </div>
            </div>
          </Card>

          <Card title="Products and buyer-facing proof">
            <div className="grid" style={{ gap: 16 }}>
              <MiniPriceCalculator
                key={classicCalculatorResetKey}
                fxRate={quote.fxRate}
                storageKey={CLASSIC_PRICE_CALCULATOR_STORAGE_KEY}
              />

              <div className="grid two-col">
                <div className="grid full-span">
                  <Label>Description template</Label>
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
                  <span className="muted">
                    เลือก preset เพื่อเพิ่มสินค้าแต่ละรายการ หรือเลือก Custom เพื่อเพิ่มรายการเปล่าแล้วกรอกเอง
                  </span>
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
                <div className="grid full-span" style={{ gap: 12 }}>
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
                      <div
                        key={`${item.description}-${index}`}
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
                            <div className="label">Product line {index + 1}</div>
                            <div className="muted" style={{ fontSize: 12 }}>
                              แยก Shipping mark, Price และ {quote.inquiryType === 'QUOTE' ? 'Requested Qty' : 'MOQ'} ต่อรายการสินค้า
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => removeItem(index)}
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
                                  updateItem(index, { description: '' });
                                  return;
                                }
                                updateItem(index, { description: value });
                              }}
                              options={[...GOODS_DESCRIPTION_PRESETS, GOODS_DESCRIPTION_CUSTOM_LABEL]}
                              placeholder="Choose a product"
                            />
                          </div>

                          <div className="grid" style={{ gap: 6 }}>
                            <Label>Description of goods</Label>
                            <Textarea
                              rows={3}
                              value={item.description}
                              onChange={(event) => updateItem(index, { description: event.target.value })}
                            />
                          </div>

                          <div className="grid" style={{ gap: 6 }}>
                            <Label>Note</Label>
                            <Textarea
                              rows={2}
                              value={item.note || ''}
                              onChange={(event) => updateItem(index, { note: event.target.value })}
                              placeholder="Optional buyer-facing note for this product"
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
                              <Label>Price / unit</Label>
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
              </div>
            </div>
          </Card>

          <Card title="Closing and signature">
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
              <span className="muted">Selecting a Thai bank updates bank address and Swift code automatically.</span>
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
              <Label>Payment and bank note</Label>
              <Textarea
                rows={2}
                value={quote.paymentNote || ''}
                onChange={(event) => update('paymentNote', event.target.value)}
                placeholder="Optional note shown under Payment and bank details"
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
                className="btn classic-save-btn"
                onClick={handleSaveClassicQuotation}
              >
                Save quotation
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleResetClassicQuotation}
              >
                Reset quotation
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleOpenClassicPdf}
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
                <div className="quote-v2-party quote-v2-party-wide quote-v2-seller-panel">
                  <div className="quote-v2-seller-main">
                    <div className="quote-v2-label">Seller</div>
                    <strong>{quote.sellerName}</strong>
                    {blockLines(quote.sellerAddress).map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                  <div className="quote-v2-seller-contact">
                    <span>From</span>
                    <strong>{fromContact.name}</strong>
                    {fromContact.title ? <em>{fromContact.title}</em> : null}
                  </div>
                </div>
                <dl className="quote-v2-meta">
                  <div>
                    <dt>Date</dt>
                    <dd>{formatDisplayDate(liveQuote.date)}</dd>
                  </div>
                  <div>
                    <dt>Our Ref.</dt>
                    <dd>{liveQuote.refNo}</dd>
                  </div>
                </dl>
                <div className="quote-v2-party quote-v2-party-full quote-v2-buyer-panel">
                  <div className="quote-v2-buyer-main">
                    <div className="quote-v2-label">Buyer</div>
                    <strong>{quote.buyerName}</strong>
                    {blockLines(quote.buyerAddress).map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                  <div className="quote-v2-buyer-contact">
                    <div>
                      <span>Attn</span>
                      <strong>{attentionContact.name}</strong>
                      {attentionContact.title ? (
                        <em>{attentionContact.title}</em>
                      ) : null}
                    </div>
                  </div>
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
                <div className="quote-v2-goods-list">
                  {quote.items.map((item, index) => {
                    const tierRows = buildClassicOrderTierRows(item, {
                      currency: quote.priceCurrency,
                      deliveryTerm: quote.deliveryTerm,
                      fxRate: quote.fxRate,
                    });
                    const priceColumnLabel = tierRows[0]?.priceBasisLabel
                      ? `Price / CTN (${tierRows[0].priceBasisLabel})`
                      : 'Price / CTN';

                    return (
                      <div
                        key={`${item.description}-${index}`}
                        className={`quote-v2-goods-item ${index === 0 ? 'is-first' : ''}`}
                      >
                        <div className="quote-v2-goods-head">
                          <strong className="quote-v2-goods-name">
                            {item.description || '-'}
                          </strong>
                          <div className="quote-v2-shipping-mark">
                            <span>Shipping mark</span>
                            <strong>{item.shippingMark || '-'}</strong>
                          </div>
                        </div>
                        {(item.note || '').trim() ? (
                          <p className="quote-v2-goods-note">{item.note || ''}</p>
                        ) : null}
                        {tierRows.length ? (
                          <table className="quote-v2-tier-table">
                            <thead>
                              <tr>
                                <th>Order Tier</th>
                                <th>Loading Basis</th>
                                <th>Total CTN</th>
                                <th>{priceColumnLabel}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tierRows.map((row) => (
                                <tr key={row.tier}>
                                  <td>{row.tier}</td>
                                  <td>{row.loadingBasis}</td>
                                  <td>{fmt(row.totalCtn, 0)} CTN</td>
                                  <td>{formatClassicTierPrice(row)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="quote-v2-scale-note">
                            Add a known carton preset product to show automatic Trial / MOQ / FCL price tiers.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="quote-v2-payment">
                <div className="quote-v2-payment-main">
                  <div className="quote-v2-section-title">Payment terms</div>
                  <dl>
                    <div>
                      <dt>Payment Term</dt>
                      <dd>{quote.paymentTerms}</dd>
                    </div>
                    <div>
                      <dt>Bank Details</dt>
                      <dd>{BANK_DETAILS_AFTER_CONFIRMATION}</dd>
                    </div>
                    <div>
                      <dt>Quotation Validity</dt>
                      <dd>{QUOTATION_VALIDITY_DAYS} days from quotation date</dd>
                    </div>
                    <div>
                      <dt>Valid until</dt>
                      <dd>{validUntilDate}</dd>
                    </div>
                  </dl>
              </div>
              <div className="quote-v2-exchange">
                <span>{thbQuote ? 'Currency basis' : 'Exchange rate'}</span>
                <strong>
                  {thbQuote
                    ? 'THB quote - no FX applied'
                    : `1 ${priceCurrencyLabel} = ${fmt(quote.fxRate, 2)} THB`}
                </strong>
                <small>{thbQuote ? 'Exporter may convert using own bank rate' : EXCHANGE_VALIDITY_NOTE}</small>
              </div>
            </section>

              <section className="quote-v2-closing">
                <div className="quote-v2-message">
                  {blockLines(`${quote.closingLine1}\n${quote.closingLine2}`).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
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
