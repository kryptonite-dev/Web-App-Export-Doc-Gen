import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ClassicQuotation } from '../ClassicQuotationPage';
import { fmt } from '../../utils';

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
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 8.4,
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
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomStyle: 'solid',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 56,
    maxHeight: 56,
    objectFit: 'contain',
    marginRight: 18,
    borderRadius: 12,
  },
  sellerName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  sellerAddress: {
    color: colors.soft,
    fontSize: 7.4,
    lineHeight: 1.35,
  },
  title: {
    marginTop: 9,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: 700,
    letterSpacing: 6,
  },
  topGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 9,
  },
  sellerCard: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 58,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  metaCard: {
    width: 166,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.sand,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderBottomStyle: 'solid',
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  label: {
    color: colors.gold,
    fontSize: 6.7,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelSoft: {
    color: colors.soft,
    fontSize: 6.7,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 8.8,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  bodyText: {
    color: colors.soft,
    fontSize: 7.5,
    lineHeight: 1.35,
  },
  buyerCard: {
    marginTop: 8,
    minHeight: 56,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  strip: {
    flexDirection: 'row',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.sand,
  },
  stripCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    borderRightStyle: 'solid',
  },
  stripCellWide: {
    flexGrow: 2,
    flexBasis: 0,
    padding: 8,
  },
  delivery: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
    padding: 9,
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
    width: 166,
    color: colors.gold,
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 0.7,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  goods: {
    marginTop: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  goodsTitle: {
    marginTop: 5,
    fontSize: 10.6,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  goodsGrid: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 8,
  },
  goodsCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 11,
    backgroundColor: colors.sand,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  payment: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 3,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  paymentLabel: {
    width: 100,
  },
  paymentValue: {
    flexGrow: 1,
    flexBasis: 0,
  },
  exchange: {
    width: 138,
    justifyContent: 'center',
    padding: 9,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderColor: colors.line,
    borderLeftColor: colors.gold,
    borderRadius: 14,
    backgroundColor: colors.goldSoft,
  },
  exchangeValue: {
    marginTop: 7,
    fontSize: 10.6,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  exchangeNote: {
    marginTop: 5,
    color: colors.soft,
    fontSize: 7.2,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  closing: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-end',
    marginTop: 9,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderTopStyle: 'solid',
  },
  message: {
    flexGrow: 1,
    flexBasis: 0,
    fontSize: 7.8,
    fontWeight: 700,
    lineHeight: 1.6,
  },
  signature: {
    width: 158,
    textAlign: 'center',
  },
  signatureSpace: {
    height: 42,
  },
  signatureName: {
    fontSize: 8.8,
    fontWeight: 700,
  },
  signatureTitle: {
    marginTop: 4,
    color: colors.soft,
    fontSize: 7.8,
  },
});

type Props = {
  quote: ClassicQuotation;
  defaultLogoSrc: string;
};

export default function ClassicQuotationPDF({ quote, defaultLogoSrc }: Props) {
  const activeQuantity = getQuantityDisplay(quote);
  const quantityLabel = `${fmt(activeQuantity.value, 0)} ${activeQuantity.unit}`;
  const thbQuote = isThbQuote(quote.priceCurrency);

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
            <Text style={styles.label}>Seller</Text>
            <Text style={[styles.value, { marginTop: 6 }]}>{quote.sellerName}</Text>
            {blockLines(quote.sellerAddress).map((line) => (
              <Text key={line} style={styles.bodyText}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.metaCard}>
            {[
              ['Date', formatDisplayDate(quote.date)],
              ['Pages', quote.pages],
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
          <Text style={styles.label}>Buyer</Text>
          <Text style={[styles.value, { marginTop: 6 }]}>{quote.buyerName}</Text>
          {blockLines(quote.buyerAddress).map((line) => (
            <Text key={line} style={styles.bodyText}>
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.strip} wrap={false}>
          <View style={styles.stripCell}>
            <Text style={styles.label}>Attn</Text>
            <Text style={[styles.value, { marginTop: 5 }]}>{quote.attention || '-'}</Text>
          </View>
          <View style={styles.stripCell}>
            <Text style={styles.label}>From</Text>
            <Text style={[styles.value, { marginTop: 5 }]}>{quote.fromPerson || '-'}</Text>
          </View>
          <View style={styles.stripCellWide}>
            <Text style={styles.label}>Subject</Text>
            <Text style={[styles.value, { marginTop: 5 }]}>{quote.subject}</Text>
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
          {blockLines(quote.description || '').map((line, index) => (
            <Text
              key={`${line}-${index}`}
              style={index === 0 ? styles.goodsTitle : [styles.goodsTitle, { marginTop: 3 }]}
            >
              {line}
            </Text>
          ))}
          <View style={styles.goodsGrid}>
            <View style={styles.goodsCell}>
              <Text style={styles.labelSoft}>Shipping mark</Text>
              <Text style={[styles.value, { marginTop: 6 }]}>{quote.shippingMark}</Text>
            </View>
            <View style={styles.goodsCell}>
              <Text style={styles.labelSoft}>Price / {quote.priceUnit}</Text>
              <Text style={[styles.value, { marginTop: 6 }]}>
                {quote.priceCurrency} {fmt(quote.priceValue, 2)}
              </Text>
            </View>
            <View style={styles.goodsCell}>
              <Text style={styles.labelSoft}>{activeQuantity.label}</Text>
              <Text style={[styles.value, { marginTop: 6 }]}>{quantityLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentGrid} wrap={false}>
          <View style={styles.payment}>
            <Text style={styles.label}>Payment and bank details</Text>
            {[
              ['Term of payment', quote.paymentTerms],
              ["Seller's bank", quote.sellerBank],
              ['Address', quote.bankAddress],
              ['Swift code', quote.swiftCode],
            ].map(([label, value]) => (
              <View key={label} style={styles.paymentRow}>
                <Text style={[styles.labelSoft, styles.paymentLabel]}>{label}</Text>
                <Text style={[styles.value, styles.paymentValue]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.exchange}>
            <Text style={styles.labelSoft}>{thbQuote ? 'Currency basis' : 'Exchange rate'}</Text>
            <Text style={styles.exchangeValue}>
              {thbQuote ? 'THB quote - no FX applied' : `1 USD = ${fmt(quote.fxRate, 2)} THB`}
            </Text>
            {thbQuote ? (
              <Text style={styles.exchangeNote}>Exporter may convert using own bank rate</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.closing} wrap={false}>
          <View style={styles.message}>
            <Text>{quote.closingLine1}</Text>
            <Text>{quote.closingLine2}</Text>
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
