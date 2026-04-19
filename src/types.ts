export type Currency = 'USD' | 'THB' | 'EUR' | 'AED' | string;
export type Money = { currency: Currency; value: number };
export type Party = { name: string; address: string };

export type LineItem = { description: string; unit: string; qty: number; unitPrice: Money };

export type CommonDoc = {
  docType: 'Quotation' | 'Invoice';
  docNo?: string;
  subject: string;
  docDate: string;
  pages?: string;
  seller: Party;
  buyer: Party;
  attn: string;
  buyerContactEmail?: string;
  buyerContactPhone?: string;
  fromPerson: string;
  fromTitle?: string;
  fax?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  validUntil?: string;
  leadTime?: string;
  introNote?: string;
  deliveryTerms: string;
  brand?: string;
  price?: Money;
  minOrderQty?: { value: number; unit: string };
  paymentTerms: string;
  sellerBank?: string;
  sellerBankAddress?: string;
  swiftCode?: string;
  fxRate?: number;
  closing?: string;
  shippingMark?: string;
  items: LineItem[];
  subTotal?: Money;
  grandTotal?: Money;
  notes?: string[];
  productHighlights?: string[];
  certifications?: string[];
  drivePdfUrl?: string;
  sheetRowId?: string;
  exchangeCurrency?: Currency;
  signTitle?: string;
  signatureName?: string;
  signatureImageDataUrl?: string;
  boothNo?: string;
  eventName?: string;
  eventDates?: string;
  eventLocation?: string;

  /** NEW: โลโก้บริษัทสำหรับหัวเอกสาร (Data URL ของรูปภาพ) */
  logoDataUrl?: string;
  /** NEW: ความกว้างโลโก้ใน PDF (พอยต์) ค่าแนะนำ 80–140 pt */
  logoWidthPt?: number;
};
