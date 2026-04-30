import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ClassicQuotation } from '../ClassicQuotationPage';
import {
  buildProformaInvoiceLines,
  getInvoiceDocumentConfig,
  type InvoiceDocumentType,
} from '../ProformaInvoicePage';
import { fmt } from '../../utils';

const QUOTATION_VALIDITY_DAYS = 14;
const EXCHANGE_VALIDITY_NOTE = 'Prices are valid within the validity period.';

const colors = {
  ink: '#4f3d2c',
  soft: '#80674d',
  line: '#e2cda4',
  paper: '#fff8ec',
  white: '#fffdf9',
  sand: '#f4e7ce',
  gold: '#b6842c',
  goldSoft: '#efd9a6',
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

function normalizeCurrency(currency: string) {
  return currency.trim().toUpperCase() || 'USD';
}

function isThbQuote(currency: string) {
  return normalizeCurrency(currency) === 'THB';
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

function buildInvoiceNo(refNo: string, documentType: InvoiceDocumentType = 'proforma') {
  const cleanRef = refNo.trim() || 'QUO';
  const prefix = documentType === 'commercial' ? 'CI-' : 'PI-';
  return cleanRef.toUpperCase().startsWith(prefix) ? cleanRef : `${prefix}${cleanRef}`;
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

function totalBy(
  lines: ReturnType<typeof buildProformaInvoiceLines>,
  key: 'quantityCtn' | 'pieces' | 'grossWeight' | 'amount',
) {
  return lines.reduce((sum, line) => sum + line[key], 0);
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: colors.gold,
  },
  hero: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 3,
    paddingTop: 4,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomStyle: 'solid',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  logo: {
    width: 60,
    maxHeight: 48,
    objectFit: 'contain',
  },
  sellerName: {
    fontSize: 12.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  sellerAddress: {
    color: colors.soft,
    fontSize: 7.3,
    lineHeight: 1.25,
  },
  docCard: {
    width: 170,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.sand,
  },
  label: {
    color: colors.gold,
    fontSize: 6.8,
    fontWeight: 700,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  docTitle: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 4,
    textAlign: 'center',
  },
  docMeta: {
    marginTop: 5,
    color: colors.soft,
    fontSize: 6.8,
    lineHeight: 1.4,
  },
  partyGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  partyCard: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 52,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  value: {
    marginTop: 4,
    fontSize: 9.3,
    fontWeight: 700,
    lineHeight: 1.18,
  },
  text: {
    color: colors.soft,
    fontSize: 7.5,
    lineHeight: 1.28,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  invoiceGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  invoiceMain: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  invoiceMeta: {
    width: 176,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.sand,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  infoBox: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  bankBlock: {
    marginTop: 8,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.sand,
  },
  metaBox: {
    width: '24.1%',
    minHeight: 34,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.sand,
  },
  metaValue: {
    marginTop: 4,
    fontSize: 7.2,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  tableHeader: {
    borderTopWidth: 0,
    backgroundColor: colors.sand,
  },
  cell: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    borderRightStyle: 'solid',
  },
  cellLast: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  th: {
    color: colors.gold,
    fontSize: 6.4,
    fontWeight: 700,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 7.4,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  tdSoft: {
    marginTop: 2,
    color: colors.soft,
    fontSize: 6.8,
    lineHeight: 1.2,
  },
  num: {
    textAlign: 'right',
  },
  totalGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  amountCard: {
    flexGrow: 1.1,
    flexBasis: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.goldSoft,
  },
  amount: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 700,
  },
  summaryCard: {
    flexGrow: 0.9,
    flexBasis: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  summaryRow: {
    marginTop: 5,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  termGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  termCard: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  termText: {
    marginTop: 4,
    fontSize: 7.7,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  summaryBlock: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  closing: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  closingText: {
    flexGrow: 1,
    flexBasis: 0,
    fontSize: 7.2,
    fontWeight: 700,
    lineHeight: 1.45,
  },
  signature: {
    width: 170,
    textAlign: 'center',
  },
  signSpace: {
    height: 34,
  },
  signName: {
    fontSize: 8.8,
    fontWeight: 700,
  },
  footnote: {
    marginTop: 5,
    color: colors.soft,
    fontSize: 6.1,
    textAlign: 'center',
  },
});

type Props = {
  quote: ClassicQuotation;
  defaultLogoSrc: string;
  documentType?: InvoiceDocumentType;
};

export default function ProformaInvoicePDF({
  quote,
  defaultLogoSrc,
  documentType = 'proforma',
}: Props) {
  const documentConfig = getInvoiceDocumentConfig(documentType);
  const lines = buildProformaInvoiceLines(quote);
  const currency = normalizeCurrency(quote.priceCurrency);
  const validUntilDate = formatDisplayDate(addDaysIso(quote.date, QUOTATION_VALIDITY_DAYS));
  const totalAmount = totalBy(lines, 'amount');
  const totalCtn = totalBy(lines, 'quantityCtn');
  const totalPieces = totalBy(lines, 'pieces');
  const totalGrossWeight = totalBy(lines, 'grossWeight');
  const thbQuote = isThbQuote(currency);
  const tradeTermLabel = getTradeTermLabel(quote.deliveryTerm);
  const unitPriceHeader = `${currency}/CTN`;
  const amountHeader = `TOTAL ${currency}`;

  return (
    <Document title={`${quote.buyerName || 'Buyer'} ${documentConfig.pdfTitle}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />

        <View style={styles.hero}>
          <View style={styles.brand}>
            <Image src={quote.logoDataUrl || defaultLogoSrc} style={styles.logo} />
            <View>
              <Text style={styles.sellerName}>{quote.sellerName}</Text>
              {blockLines(quote.sellerAddress).map((line) => (
                <Text key={line} style={styles.sellerAddress}>
                  {line}
                </Text>
              ))}
            </View>
          </View>
          <Text style={styles.docTitle}>{documentConfig.documentTitle}</Text>
        </View>

        <View style={styles.invoiceGrid} wrap={false}>
          <View style={styles.invoiceMain}>
            <Text style={styles.label}>Consignee</Text>
            <Text style={styles.value}>{quote.buyerName}</Text>
            {blockLines(quote.buyerAddress).map((line) => (
              <Text key={line} style={styles.text}>
                {line}
              </Text>
            ))}
            <Text style={styles.text}>Attn: {quote.attention || '-'}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.label}>{documentConfig.numberLabel}</Text>
            <Text style={styles.value}>{buildInvoiceNo(quote.refNo, documentType)}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>{documentConfig.dateLabel}</Text>
            <Text style={styles.value}>{formatDisplayDate(quote.date)}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Currency</Text>
            <Text style={styles.value}>{currency}</Text>
            {documentConfig.showValidity ? (
              <>
                <Text style={[styles.label, { marginTop: 6 }]}>Valid until</Text>
                <Text style={styles.value}>{validUntilDate}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.infoGrid} wrap={false}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Terms of payment</Text>
            <Text style={styles.value}>{quote.paymentTerms}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Collecting bank</Text>
            <Text style={styles.value}>
              {quote.proformaCollectingBank || "Buyer's nominated bank / To be advised"}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.termText}>Port of loading: {derivePortOfLoading(quote.deliveryTerm)}</Text>
            <Text style={styles.termText}>Destination: {deriveDestination(quote)}</Text>
            <Text style={styles.termText}>
              Carrier / Voyage No.: {quote.proformaCarrierVoyage || 'To be advised'}
            </Text>
            <Text style={styles.termText}>On board date: {getProformaShipmentDate(quote)}</Text>
          </View>
        </View>

        <View style={styles.bankBlock} wrap={false}>
          <Text style={styles.termText}>Payment through: {quote.sellerBank || 'To be advised'}</Text>
          {blockLines(quote.bankAddress).map((line) => (
            <Text key={line} style={styles.termText}>
              {line}
            </Text>
          ))}
          <Text style={styles.termText}>SWIFT CODE: {quote.swiftCode || '-'}</Text>
        </View>

        <View style={styles.table} wrap={false}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.cell, { width: '17%' }]}>
              <Text style={styles.th}>Shipping Marks</Text>
            </View>
            <View style={[styles.cell, { width: '37%' }]}>
              <Text style={styles.th}>Description of Goods</Text>
            </View>
            <View style={[styles.cell, { width: '12%' }]}>
              <Text style={[styles.th, styles.num]}>Quantity</Text>
            </View>
            <View style={[styles.cell, { width: '17%' }]}>
              <Text style={[styles.th, styles.num]}>Unit Price</Text>
            </View>
            <View style={[styles.cellLast, { width: '17%' }]}>
              <Text style={[styles.th, styles.num]}>Amount</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: '17%' }]} />
            <View style={[styles.cell, { width: '37%' }]}>
              <Text style={styles.th}>Country of Origin: Thailand</Text>
            </View>
            <View style={[styles.cell, { width: '12%' }]}>
              <Text style={[styles.th, styles.num]}>CTN</Text>
            </View>
            <View style={[styles.cell, { width: '17%' }]}>
              <Text style={[styles.th, styles.num]}>{unitPriceHeader}</Text>
              <Text style={[styles.th, styles.num]}>{tradeTermLabel}</Text>
            </View>
            <View style={[styles.cellLast, { width: '17%' }]}>
              <Text style={[styles.th, styles.num]}>{amountHeader}</Text>
            </View>
          </View>

          {lines.map((line, index) => (
            <View key={`${line.description}-${index}`} style={styles.tableRow}>
              <View style={[styles.cell, { width: '17%' }]}>
                <Text style={styles.td}>{line.shippingMark}</Text>
              </View>
              <View style={[styles.cell, { width: '37%' }]}>
                <Text style={styles.td}>{line.description}</Text>
              </View>
              <View style={[styles.cell, { width: '12%' }]}>
                <Text style={[styles.td, styles.num]}>{fmt(line.quantityCtn, 0)}</Text>
              </View>
              <View style={[styles.cell, { width: '17%' }]}>
                <Text style={[styles.td, styles.num]}>{formatMoney(line.priceCurrency, line.unitPrice)}</Text>
              </View>
              <View style={[styles.cellLast, { width: '17%' }]}>
                <Text style={[styles.td, styles.num]}>{formatMoney(line.priceCurrency, line.amount)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: '17%' }]}>
              <Text style={styles.td}>Total {tradeTermLabel}</Text>
            </View>
            <View style={[styles.cell, { width: '66%' }]} />
            <View style={[styles.cellLast, { width: '17%' }]}>
              <Text style={[styles.td, styles.num]}>{formatMoney(currency, totalAmount)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: '17%' }]}>
              <Text style={styles.td}>Incoterms 2020</Text>
            </View>
            <View style={[styles.cell, { width: '66%' }]}>
              <Text style={styles.td}>Total amount: {amountInWords(currency, totalAmount)}</Text>
            </View>
            <View style={[styles.cellLast, { width: '17%' }]}>
              <Text style={[styles.td, styles.num]}>{formatMoney(currency, totalAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.totalGrid} wrap={false}>
          <View style={styles.summaryBlock}>
            <Text style={styles.termText}>Packer's Name: {quote.sellerName}</Text>
            <Text style={styles.termText}>Total Packages: {fmt(totalCtn, 0)} CTN</Text>
            <Text style={styles.termText}>
              Total Quantity = {fmt(totalCtn, 0)} CTN / {fmt(totalPieces, 0)} PCS
            </Text>
            <Text style={styles.termText}>
              Total Gross Weight: {totalGrossWeight ? `${fmt(totalGrossWeight, 1)} KGS` : 'To be confirmed'}
            </Text>
            <Text style={styles.termText}>Total Net Weight: As per final packing list</Text>
            <Text style={styles.termText}>
              Exchange Rate Reference:{' '}
              {thbQuote
                ? 'THB quote - no FX applied'
                : `1 ${currency} = ${fmt(quote.fxRate, 2)} THB`}
            </Text>
            <Text style={styles.termText}>{EXCHANGE_VALIDITY_NOTE}</Text>
            {quote.paymentNote ? <Text style={styles.termText}>Note: {quote.paymentNote}</Text> : null}
          </View>
          <View style={styles.signature}>
            <View style={[styles.signSpace, { borderBottomWidth: 1, borderBottomColor: colors.line }]} />
            <Text style={styles.termText}>(Authorized Signature)</Text>
            <Text style={styles.signName}>{quote.signName}</Text>
            <Text style={styles.text}>{quote.signTitle}</Text>
            <Text style={styles.text}>For and on behalf of {quote.sellerName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
