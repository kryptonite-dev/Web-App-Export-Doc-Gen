import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ClassicQuotation } from '../ClassicQuotationPage';
import { buildClassicOrderTierRows, formatClassicTierPrice } from '../../classicQuotationScale';
import { fmt } from '../../utils';

const QUOTATION_VALIDITY_DAYS = 14;
const BANK_DETAILS_AFTER_CONFIRMATION = 'To be provided in the Proforma Invoice after order confirmation.';
const EXCHANGE_VALIDITY_NOTE = 'Prices are valid within the validity period.';

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

function getQuantityDisplay(quote: ClassicQuotation) {
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
  header: {
    paddingTop: 3,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomStyle: 'solid',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    maxHeight: 46,
    objectFit: 'contain',
    marginRight: 14,
    borderRadius: 10,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 3,
  },
  sellerAddress: {
    color: colors.soft,
    fontSize: 7,
    lineHeight: 1.25,
  },
  title: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 5,
  },
  topGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  sellerCard: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 46,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  sellerMain: {
    flexGrow: 1,
    flexBasis: 0,
  },
  sellerContact: {
    width: 124,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.sand,
  },
  metaCard: {
    width: 154,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.sand,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomStyle: 'solid',
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  label: {
    color: colors.gold,
    fontSize: 6.3,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelSoft: {
    color: colors.soft,
    fontSize: 6.3,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 8.3,
    fontWeight: 700,
    lineHeight: 1.18,
  },
  bodyText: {
    color: colors.soft,
    fontSize: 7,
    lineHeight: 1.25,
  },
  buyerCard: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
    marginTop: 6,
    minHeight: 42,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  buyerMain: {
    flexGrow: 1,
    flexBasis: 0,
  },
  buyerContact: {
    width: 154,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.sand,
  },
  buyerContactBlock: {
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomStyle: 'solid',
  },
  buyerContactBlockLast: {
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  contactTitle: {
    marginTop: 2,
    color: colors.soft,
    fontSize: 6.6,
    fontWeight: 700,
    lineHeight: 1.15,
  },
  strip: {
    flexDirection: 'row',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.sand,
  },
  stripCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    borderRightStyle: 'solid',
  },
  stripCellLast: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 6,
  },
  stripFullCell: {
    padding: 6,
  },
  stripCellWide: {
    flexGrow: 2,
    flexBasis: 0,
    padding: 6,
  },
  delivery: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    marginTop: 6,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.sand,
  },
  deliveryMain: {
    flexGrow: 1,
    flexBasis: 0,
  },
  deliveryAside: {
    width: 230,
    color: colors.gold,
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 0.7,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  goods: {
    marginTop: 6,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  goodsTitle: {
    flexGrow: 1,
    flexBasis: 0,
    fontSize: 9.6,
    fontWeight: 700,
    lineHeight: 1.14,
  },
  goodsHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  shippingMark: {
    width: 104,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.sand,
  },
  goodsItem: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  goodsItemFirst: {
    marginTop: 5,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  goodsGrid: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
  },
  goodsCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 11,
    backgroundColor: colors.sand,
  },
  tierTable: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tierRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  tierHeader: {
    borderTopWidth: 0,
    backgroundColor: colors.sand,
  },
  tierCell: {
    paddingVertical: 3.4,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    borderRightStyle: 'solid',
  },
  tierCellLast: {
    paddingVertical: 3.4,
    paddingHorizontal: 5,
  },
  tierOrder: {
    width: 118,
  },
  tierBasis: {
    width: 104,
  },
  tierCtn: {
    width: 92,
  },
  tierPrice: {
    flexGrow: 1,
    flexBasis: 0,
    textAlign: 'right',
  },
  tierHeaderText: {
    color: colors.gold,
    fontSize: 6.1,
    fontWeight: 700,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  tierText: {
    color: colors.ink,
    fontSize: 7,
    fontWeight: 700,
    lineHeight: 1.15,
  },
  scaleNote: {
    marginTop: 4,
    color: colors.soft,
    fontSize: 6.4,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  goodsNote: {
    marginTop: 3,
    color: colors.soft,
    fontSize: 6.7,
    fontWeight: 700,
    lineHeight: 1.22,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  payment: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2.2,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  paymentLabel: {
    width: 92,
  },
  paymentValue: {
    flexGrow: 1,
    flexBasis: 0,
  },
  exchange: {
    width: 126,
    justifyContent: 'center',
    padding: 7,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderColor: colors.line,
    borderLeftColor: colors.gold,
    borderRadius: 14,
    backgroundColor: colors.goldSoft,
  },
  exchangeValue: {
    marginTop: 5,
    fontSize: 9.8,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  exchangeNote: {
    marginTop: 4,
    color: colors.soft,
    fontSize: 6.8,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  closing: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    marginTop: 7,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  message: {
    flexGrow: 1,
    flexBasis: 0,
    fontSize: 7.3,
    fontWeight: 700,
    lineHeight: 1.45,
  },
  signature: {
    width: 150,
    textAlign: 'center',
  },
  signatureSpace: {
    height: 34,
  },
  signatureName: {
    fontSize: 8.2,
    fontWeight: 700,
  },
  signatureTitle: {
    marginTop: 3,
    color: colors.soft,
    fontSize: 7.2,
  },
});

type Props = {
  quote: ClassicQuotation;
  defaultLogoSrc: string;
};

export default function ClassicQuotationPDF({ quote, defaultLogoSrc }: Props) {
  const thbQuote = isThbQuote(quote.priceCurrency);
  const priceCurrencyLabel = quote.priceCurrency.trim().toUpperCase() || 'USD';
  const attentionContact = splitContactValue(quote.attention);
  const fromContact = splitContactValue(quote.fromPerson);
  const validUntilDate = formatDisplayDate(addDaysIso(quote.date, QUOTATION_VALIDITY_DAYS));
  const paymentRows = [
    ['Payment Term', quote.paymentTerms],
    ['Bank Details', BANK_DETAILS_AFTER_CONFIRMATION],
    ['Quotation Validity', `${QUOTATION_VALIDITY_DAYS} days from quotation date`],
    ['Valid until', validUntilDate],
  ];

  return (
    <Document title={`${quote.buyerName || 'Classic quotation'} quotation`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />

        <View style={styles.header}>
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
          <Text style={styles.title}>QUOTATION</Text>
        </View>

        <View style={styles.topGrid} wrap={false}>
          <View style={styles.sellerCard}>
            <View style={styles.sellerMain}>
              <Text style={styles.label}>Seller</Text>
              <Text style={[styles.value, { marginTop: 5 }]}>{quote.sellerName}</Text>
              {blockLines(quote.sellerAddress).map((line) => (
                <Text key={line} style={styles.bodyText}>
                  {line}
                </Text>
              ))}
            </View>
            <View style={styles.sellerContact}>
              <Text style={styles.label}>From</Text>
              <Text style={[styles.value, { marginTop: 3 }]}>{fromContact.name}</Text>
              {fromContact.title ? <Text style={styles.contactTitle}>{fromContact.title}</Text> : null}
            </View>
          </View>
          <View style={styles.metaCard}>
            {[
              ['Date', formatDisplayDate(quote.date)],
              ['Our Ref.', quote.refNo],
            ].map(([label, value], index, rows) => (
              <View
                key={label}
                style={index === rows.length - 1 ? [styles.metaRow, styles.metaRowLast] : styles.metaRow}
              >
                <Text style={styles.labelSoft}>{label}</Text>
                <Text style={[styles.value, { maxWidth: 96, textAlign: 'right' }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buyerCard} wrap={false}>
          <View style={styles.buyerMain}>
            <Text style={styles.label}>Buyer</Text>
            <Text style={[styles.value, { marginTop: 5 }]}>{quote.buyerName}</Text>
            {blockLines(quote.buyerAddress).map((line) => (
              <Text key={line} style={styles.bodyText}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.buyerContact}>
            <View style={styles.buyerContactBlockLast}>
              <Text style={styles.label}>Attn</Text>
              <Text style={[styles.value, { marginTop: 3 }]}>{attentionContact.name}</Text>
              {attentionContact.title ? (
                <Text style={styles.contactTitle}>{attentionContact.title}</Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.delivery} wrap={false}>
          <View style={styles.deliveryMain}>
            <Text style={styles.label}>Term of delivery</Text>
            <Text style={[styles.value, { marginTop: 5 }]}>{quote.deliveryTerm}</Text>
          </View>
          <Text style={styles.deliveryAside}>Price quotation for {quote.buyerName}</Text>
        </View>

        <View style={styles.goods} wrap={false}>
          <Text style={styles.label}>Description of goods</Text>
          {quote.items.map((item, index) => {
            const tierRows = buildClassicOrderTierRows(item, {
              currency: quote.priceCurrency,
              deliveryTerm: quote.deliveryTerm,
              fxRate: quote.fxRate,
            });
            const priceColumnLabel = tierRows[0]?.priceBasisLabel
              ? `Price / CTN (${tierRows[0].priceBasisLabel})`
              : 'Price / CTN';
            const itemNote = item.note || '';

            return (
              <View
                key={`${item.description}-${index}`}
                style={index === 0 ? styles.goodsItemFirst : styles.goodsItem}
              >
                <View style={styles.goodsHead}>
                  <Text style={styles.goodsTitle}>{item.description || '-'}</Text>
                  <View style={styles.shippingMark}>
                    <Text style={styles.labelSoft}>Shipping mark</Text>
                    <Text style={[styles.value, { marginTop: 3 }]}>{item.shippingMark || '-'}</Text>
                  </View>
                </View>
                {itemNote.trim() ? <Text style={styles.goodsNote}>{itemNote}</Text> : null}
                {tierRows.length ? (
                  <View style={styles.tierTable}>
                    <View style={[styles.tierRow, styles.tierHeader]}>
                      <Text style={[styles.tierCell, styles.tierOrder, styles.tierHeaderText]}>Order Tier</Text>
                      <Text style={[styles.tierCell, styles.tierBasis, styles.tierHeaderText]}>Loading Basis</Text>
                      <Text style={[styles.tierCell, styles.tierCtn, styles.tierHeaderText]}>Total CTN</Text>
                      <Text style={[styles.tierCellLast, styles.tierPrice, styles.tierHeaderText]}>
                        {priceColumnLabel}
                      </Text>
                    </View>
                    {tierRows.map((row) => (
                      <View key={row.tier} style={styles.tierRow}>
                        <Text style={[styles.tierCell, styles.tierOrder, styles.tierText]}>{row.tier}</Text>
                        <Text style={[styles.tierCell, styles.tierBasis, styles.tierText]}>{row.loadingBasis}</Text>
                        <Text style={[styles.tierCell, styles.tierCtn, styles.tierText]}>{fmt(row.totalCtn, 0)} CTN</Text>
                        <Text style={[styles.tierCellLast, styles.tierPrice, styles.tierText]}>
                          {formatClassicTierPrice(row)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.scaleNote}>
                    Add a known carton preset product to show automatic Trial / MOQ / FCL price tiers.
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.paymentGrid} wrap={false}>
          <View style={styles.payment}>
            <Text style={styles.label}>Payment terms</Text>
            {paymentRows.map(([label, value]) => (
              <View key={label} style={styles.paymentRow}>
                <Text style={[styles.labelSoft, styles.paymentLabel]}>{label}</Text>
                <Text style={[styles.value, styles.paymentValue]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.exchange}>
            <Text style={styles.labelSoft}>{thbQuote ? 'Currency basis' : 'Exchange rate'}</Text>
            <Text style={styles.exchangeValue}>
              {thbQuote ? 'THB quote - no FX applied' : `1 ${priceCurrencyLabel} = ${fmt(quote.fxRate, 2)} THB`}
            </Text>
            <Text style={styles.exchangeNote}>
              {thbQuote ? 'Exporter may convert using own bank rate' : EXCHANGE_VALIDITY_NOTE}
            </Text>
          </View>
        </View>

        <View style={styles.closing} wrap={false}>
          <View style={styles.message}>
            {blockLines(`${quote.closingLine1}\n${quote.closingLine2}`).map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
          <View style={styles.signature}>
            <Text style={styles.value}>Sincerely yours,</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureName}>{quote.signName}</Text>
            <Text style={styles.signatureTitle}>{quote.signTitle}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
