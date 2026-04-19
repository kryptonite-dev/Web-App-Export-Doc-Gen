import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { CommonDoc, LineItem } from '../../types';
import { computeTotals, fmt, fmtMoney } from '../../utils';

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function cleanList(items?: string[]) {
  return (items || []).map((item) => item.trim()).filter(Boolean);
}

function lineAmount(item: LineItem) {
  return (item.qty || 0) * (item.unitPrice?.value || 0);
}

function splitLines(value?: string) {
  return (value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

const colors = {
  ink: '#5b4532',
  inkSoft: '#8f7358',
  stroke: '#dcc7a1',
  sand: '#fffaf2',
  sandStrong: '#f7ecd4',
  gold: '#a97828',
  white: '#fffdf9',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 22,
    fontSize: 9.2,
    fontFamily: 'Helvetica',
    color: colors.ink,
    backgroundColor: colors.white,
  },
  hero: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  heroMain: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: colors.sand,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 18,
    padding: 18,
    marginRight: 10,
  },
  heroEyebrow: {
    fontSize: 8.2,
    textTransform: 'uppercase',
    color: colors.gold,
    letterSpacing: 0.7,
    marginBottom: 6,
    fontWeight: 700,
  },
  subject: {
    fontSize: 18,
    lineHeight: 1.16,
    fontWeight: 700,
    marginBottom: 7,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: -6,
  },
  chip: {
    fontSize: 8.1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.white,
    marginRight: 6,
    marginBottom: 6,
    color: colors.ink,
  },
  chipAccent: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    color: colors.white,
  },
  buyerPanel: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 10,
  },
  buyerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -4,
    marginRight: -4,
    marginTop: 4,
  },
  buyerCellWrap: {
    width: '50%',
    paddingLeft: 4,
    paddingRight: 4,
    marginBottom: 8,
  },
  buyerCellWrapFull: {
    width: '100%',
  },
  buyerLabel: {
    fontSize: 7.4,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    letterSpacing: 0.55,
    marginBottom: 3,
    fontWeight: 700,
  },
  buyerValue: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: colors.ink,
    fontWeight: 700,
  },
  contactCard: {
    width: 188,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 18,
    backgroundColor: colors.sandStrong,
    padding: 14,
  },
  logoWrap: {
    minHeight: 44,
    marginBottom: 8,
    justifyContent: 'center',
  },
  logo: {
    width: 98,
    objectFit: 'contain',
  },
  sellerName: {
    fontSize: 12.4,
    fontWeight: 700,
    marginBottom: 4,
  },
  sellerLine: {
    fontSize: 8.4,
    lineHeight: 1.35,
    color: colors.inkSoft,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    marginTop: 9,
    marginBottom: 9,
  },
  presenterName: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  presenterTitle: {
    fontSize: 8.7,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 8.5,
    color: colors.ink,
    marginBottom: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionHeadTight: {
    marginBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: colors.gold,
    letterSpacing: 0.7,
    marginBottom: 3,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  totalPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.sandStrong,
    fontSize: 8.6,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.stroke,
    textAlign: 'center',
    maxWidth: 184,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee2c8',
  },
  colDescription: {
    width: '45%',
    paddingRight: 10,
  },
  colUnit: {
    width: '12%',
    paddingRight: 8,
  },
  colQty: {
    width: '11%',
    paddingRight: 8,
  },
  colPrice: {
    width: '16%',
    paddingRight: 8,
  },
  colAmount: {
    width: '16%',
  },
  th: {
    fontSize: 7.8,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    letterSpacing: 0.6,
    fontWeight: 700,
  },
  td: {
    fontSize: 8.9,
    lineHeight: 1.35,
    color: colors.ink,
  },
  tdStrong: {
    fontWeight: 700,
  },
  alignRight: {
    textAlign: 'right',
  },
  emptyRow: {
    paddingVertical: 10,
    fontSize: 8.7,
    color: colors.inkSoft,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  leftColumn: {
    width: '70%',
    paddingRight: 8,
  },
  rightColumn: {
    width: '30%',
  },
  rowCard: {
    marginBottom: 8,
  },
  signatoryCard: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    borderColor: colors.white,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -4,
    marginRight: -4,
  },
  metricCellWrap: {
    width: '50%',
    paddingLeft: 4,
    paddingRight: 4,
    marginBottom: 8,
  },
  metricCell: {
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.sand,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 8,
    minHeight: 50,
  },
  metricLabel: {
    fontSize: 7.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    letterSpacing: 0.6,
    marginBottom: 4,
    fontWeight: 700,
  },
  metricValue: {
    fontSize: 9.8,
    lineHeight: 1.28,
    fontWeight: 700,
    color: colors.ink,
  },
  noteBox: {
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.sand,
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 7,
    fontSize: 8.1,
    lineHeight: 1.3,
    color: colors.inkSoft,
  },
  proofTitle: {
    fontSize: 12.2,
    lineHeight: 1.2,
    fontWeight: 700,
    marginBottom: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletDot: {
    width: 10,
    fontSize: 11,
    color: colors.gold,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  bulletText: {
    flexGrow: 1,
    flexBasis: 0,
    fontSize: 8.8,
    lineHeight: 1.42,
    color: colors.ink,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: -6,
  },
  pill: {
    fontSize: 7.8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.sandStrong,
    borderWidth: 1,
    borderColor: colors.stroke,
    color: colors.ink,
    marginRight: 6,
    marginBottom: 6,
  },
  closingText: {
    fontSize: 8.9,
    lineHeight: 1.32,
    color: colors.ink,
    marginBottom: 0,
  },
  signatureArea: {
    width: '100%',
    alignItems: 'center',
  },
  signatureSlot: {
    width: '100%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  signatureImage: {
    width: 120,
    height: 28,
    objectFit: 'contain',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: colors.white,
    marginTop: 6,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 1,
  },
  signatureTitle: {
    fontSize: 8.2,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return <Text style={accent ? [styles.chip, styles.chipAccent] : styles.chip}>{children}</Text>;
}

function BuyerCell({
  label,
  value,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <View style={full ? [styles.buyerCellWrap, styles.buyerCellWrapFull] : styles.buyerCellWrap}>
      <Text style={styles.buyerLabel}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={styles.buyerValue}>{value || '-'}</Text>
      ) : (
        value
      )}
    </View>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.metricCellWrap}>
      <View style={styles.metricCell}>
        <Text style={styles.metricLabel}>{label}</Text>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text style={styles.metricValue}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

export default function QuotationInvoicePDF({ doc }: { doc: CommonDoc }) {
  const items = doc.items || [];
  const currency =
    doc.exchangeCurrency || items[0]?.unitPrice?.currency || doc.price?.currency || 'USD';
  const totals = computeTotals(items, currency);
  const notes = cleanList(doc.notes);
  const summaryLine = doc.introNote?.trim() || '';
  const sellerAddress = splitLines(doc.seller.address).slice(0, 2);
  const buyerAddress = splitLines(doc.buyer.address);
  const followUpText =
    doc.closing ||
    `Thank you for meeting with us at ${doc.eventName || 'THAIFEX - ANUGA ASIA 2026'}. We would be pleased to follow up with samples, specifications, and final commercial confirmation for your market.`;
  const signatureName = doc.signatureName || doc.fromPerson || doc.seller.name || 'Authorized signatory';
  const signatureTitle = doc.signTitle || doc.fromTitle || '';

  return (
    <Document
      title={doc.subject || 'Commercial quotation'}
      author={doc.seller.name || 'Sales Proposal Studio'}
      subject={doc.subject || 'Commercial quotation'}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.hero} wrap={false}>
          <View style={styles.heroMain}>
            <Text style={styles.heroEyebrow}>Quotation</Text>
            <Text style={styles.subject}>{doc.subject || 'Commercial proposal'}</Text>
            {summaryLine ? <Text style={styles.summary}>{summaryLine}</Text> : null}

            <View style={styles.chipRow}>
              <Chip accent>{doc.docType || 'Quotation'}</Chip>
              {doc.docNo ? <Chip>Doc {doc.docNo}</Chip> : null}
              {doc.eventName ? <Chip>{doc.eventName}</Chip> : null}
              {doc.eventDates ? <Chip>{doc.eventDates}</Chip> : null}
              {doc.boothNo ? <Chip>{doc.boothNo}</Chip> : null}
              {doc.docDate ? <Chip>Issued {formatDate(doc.docDate)}</Chip> : null}
              {doc.validUntil ? <Chip>Valid until {formatDate(doc.validUntil)}</Chip> : null}
            </View>

            <View style={styles.buyerPanel}>
              <Text style={styles.heroEyebrow}>Buyer details</Text>
              <View style={styles.buyerGrid}>
                <BuyerCell label="Buyer company" value={doc.buyer.name || '-'} />
                <BuyerCell label="Attention" value={doc.attn || '-'} />
                <BuyerCell
                  label="Buyer address"
                  full
                  value={
                    buyerAddress.length > 0 ? (
                      <View>
                        {buyerAddress.map((line) => (
                          <Text key={line} style={styles.buyerValue}>
                            {line}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      '-'
                    )
                  }
                />
                <BuyerCell label="Contact email" value={doc.buyerContactEmail || '-'} />
                <BuyerCell label="Contact phone" value={doc.buyerContactPhone || '-'} />
              </View>
            </View>
          </View>

          <View style={styles.contactCard}>
            {doc.logoDataUrl ? (
              <View style={styles.logoWrap}>
                <Image
                  src={doc.logoDataUrl}
                  style={doc.logoWidthPt ? [styles.logo, { width: doc.logoWidthPt }] : styles.logo}
                />
              </View>
            ) : null}

            <Text style={styles.sellerName}>{doc.seller.name || 'Your company'}</Text>
            {sellerAddress.map((line) => (
              <Text key={line} style={styles.sellerLine}>
                {line}
              </Text>
            ))}

            <View style={styles.divider} />

            {doc.fromPerson ? <Text style={styles.presenterName}>{doc.fromPerson}</Text> : null}
            {doc.fromTitle ? <Text style={styles.presenterTitle}>{doc.fromTitle}</Text> : null}
            {doc.contactEmail ? <Text style={styles.contactLine}>{doc.contactEmail}</Text> : null}
            {doc.contactPhone ? <Text style={styles.contactLine}>{doc.contactPhone}</Text> : null}
            {doc.website ? <Text style={styles.contactLine}>{doc.website}</Text> : null}
          </View>
        </View>

        <View style={styles.card} wrap={false}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionEyebrow}>Offer lines</Text>
              <Text style={styles.sectionTitle}>Products and quoted values</Text>
            </View>
            <Text style={styles.totalPill}>Estimated value {fmtMoney(totals.grandTotal)}</Text>
          </View>

          <View style={styles.tableHeader}>
            <View style={styles.colDescription}>
              <Text style={styles.th}>Description</Text>
            </View>
            <View style={styles.colUnit}>
              <Text style={styles.th}>Unit</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={[styles.th, styles.alignRight]}>Qty</Text>
            </View>
            <View style={styles.colPrice}>
              <Text style={[styles.th, styles.alignRight]}>Unit price</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={[styles.th, styles.alignRight]}>Amount</Text>
            </View>
          </View>

          {items.length > 0 ? (
            items.map((item, index) => (
              <View
                key={`${item.description}-${index}`}
                style={
                  index === items.length - 1
                    ? [styles.tableRow, { borderBottomWidth: 0 }]
                    : styles.tableRow
                }
              >
                <View style={styles.colDescription}>
                  <Text style={[styles.td, styles.tdStrong]}>{item.description || '-'}</Text>
                </View>
                <View style={styles.colUnit}>
                  <Text style={styles.td}>{item.unit || '-'}</Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={[styles.td, styles.alignRight]}>{fmt(item.qty || 0, 0)}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={[styles.td, styles.alignRight]}>
                    {item.unitPrice ? fmtMoney(item.unitPrice) : '-'}
                  </Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={[styles.td, styles.alignRight]}>
                    {item.unitPrice ? `${item.unitPrice.currency} ${fmt(lineAmount(item))}` : '-'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyRow}>Add at least one product line to complete the quotation.</Text>
          )}
        </View>

        <View style={styles.bottomRow} wrap={false}>
          <View style={styles.leftColumn}>
            <View style={[styles.card, styles.rowCard]}>
              <View style={[styles.sectionHead, styles.sectionHeadTight]}>
                <View>
                  <Text style={styles.sectionEyebrow}>Commercial terms</Text>
                  <Text style={styles.proofTitle}>Commercial terms</Text>
                </View>
              </View>

              <View style={styles.metricGrid}>
                <Metric label="Delivery terms" value={doc.deliveryTerms || '-'} />
                <Metric label="Payment" value={doc.paymentTerms || '-'} />
                <Metric
                  label="MOQ"
                  value={
                    doc.minOrderQty
                      ? `${fmt(doc.minOrderQty.value, 0)} ${doc.minOrderQty.unit}`
                      : '-'
                  }
                />
                <Metric label="Lead time" value={doc.leadTime || '-'} />
              </View>

              {notes.length > 0 ? <Text style={styles.noteBox}>{notes[0]}</Text> : null}
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={[styles.card, styles.rowCard]}>
              <View style={[styles.sectionHead, styles.sectionHeadTight]}>
                <View>
                  <Text style={styles.sectionEyebrow}>Next step</Text>
                  <Text style={styles.proofTitle}>Follow-up after the conversation</Text>
                </View>
              </View>

              <Text style={styles.closingText}>{followUpText}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.signatoryCard]} wrap={false}>
          <View style={styles.signatureArea}>
            <View style={styles.signatureSlot}>
              {doc.signatureImageDataUrl ? (
                <Image src={doc.signatureImageDataUrl} style={styles.signatureImage} />
              ) : null}
            </View>
            <Text style={styles.signatureName}>{signatureName}</Text>
            {signatureTitle ? <Text style={styles.signatureTitle}>{signatureTitle}</Text> : null}
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
