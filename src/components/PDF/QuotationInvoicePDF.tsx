import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { computeTotals, fmt } from '../../utils';

const NAVY = '#11263d';
const NAVY_SOFT = '#1c3a59';
const GOLD = '#c78622';
const GOLD_SOFT = '#f5e2be';
const PAPER = '#fffdf8';
const PAPER_ALT = '#f8f4eb';
const BORDER = '#dde4ea';
const MUTED = '#60758b';
const TEXT = '#152538';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: PAPER,
    color: TEXT,
    fontSize: 10,
    lineHeight: 1.45,
  },
  hero: {
    backgroundColor: NAVY,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: {
    width: '62%',
    paddingRight: 18,
  },
  heroRight: {
    width: '38%',
    paddingLeft: 8,
  },
  logo: {
    height: 34,
    objectFit: 'contain',
    marginBottom: 8,
  },
  kicker: {
    color: '#c7d6e3',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: '#fbf7ef',
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.15,
    marginTop: 8,
  },
  heroText: {
    color: '#dce6ef',
    marginTop: 10,
    fontSize: 10,
    lineHeight: 1.55,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  chip: {
    color: '#fbf7ef',
    fontSize: 8.5,
    backgroundColor: NAVY_SOFT,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipAccent: {
    backgroundColor: '#6e4b12',
  },
  presenterPanel: {
    backgroundColor: NAVY_SOFT,
    borderRadius: 14,
    padding: 14,
  },
  panelLabel: {
    color: '#a6bbcd',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  panelName: {
    color: '#fbf7ef',
    fontSize: 15,
    fontWeight: 700,
    marginTop: 6,
    lineHeight: 1.25,
  },
  panelValue: {
    color: '#fbf7ef',
    marginTop: 4,
    lineHeight: 1.55,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  splitCell: {
    width: '48.5%',
  },
  metaRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#36546f',
  },
  metaLabel: {
    color: '#a6bbcd',
    fontSize: 7.5,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#fbf7ef',
    fontSize: 10,
    marginTop: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoCard: {
    width: '32%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 14,
  },
  cardLabel: {
    color: MUTED,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 10,
  },
  detailRow: {
    marginBottom: 7,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f5',
  },
  detailRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  detailKey: {
    color: MUTED,
    fontSize: 8.5,
    marginBottom: 2,
  },
  detailValue: {
    color: TEXT,
    fontSize: 10,
    lineHeight: 1.5,
  },
  fullCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    marginTop: 5,
  },
  totalPill: {
    color: '#8a5918',
    backgroundColor: GOLD_SOFT,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    fontSize: 8.5,
    fontWeight: 700,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: PAPER_ALT,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  tableHeadText: {
    color: MUTED,
    fontSize: 7.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f6',
  },
  tableRowAlt: {
    backgroundColor: '#fcfbf7',
  },
  cellDescription: {
    width: '39%',
    paddingRight: 8,
  },
  cellUnit: {
    width: '11%',
    paddingRight: 8,
  },
  cellQty: {
    width: '12%',
    textAlign: 'right',
    paddingRight: 8,
  },
  cellPrice: {
    width: '18%',
    textAlign: 'right',
    paddingRight: 8,
  },
  cellAmount: {
    width: '20%',
    textAlign: 'right',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricCard: {
    width: '31.5%',
    borderWidth: 1,
    borderColor: '#ebeef2',
    borderRadius: 12,
    backgroundColor: PAPER_ALT,
    padding: 10,
    marginBottom: 8,
  },
  metricLabel: {
    color: MUTED,
    fontSize: 7.5,
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 5,
    fontSize: 10.5,
    fontWeight: 700,
    lineHeight: 1.45,
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48.8%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: GOLD,
    marginTop: 5,
    marginRight: 8,
  },
  bulletText: {
    flexGrow: 1,
    lineHeight: 1.55,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    fontSize: 8.5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dfe6ec',
    backgroundColor: '#f8fafb',
    marginRight: 6,
    marginBottom: 6,
  },
  noteBox: {
    backgroundColor: PAPER_ALT,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    color: MUTED,
    lineHeight: 1.55,
  },
  signCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 14,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signCopy: {
    width: '64%',
    paddingRight: 14,
  },
  signTitleText: {
    fontSize: 17,
    fontWeight: 700,
    marginTop: 5,
    marginBottom: 10,
  },
  signText: {
    lineHeight: 1.7,
  },
  signMeta: {
    color: MUTED,
    marginTop: 10,
  },
  signBlock: {
    width: '28%',
    alignItems: 'center',
  },
  signImage: {
    width: 120,
    height: 42,
    objectFit: 'contain',
    marginBottom: 8,
  },
  signLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#9babb9',
    marginBottom: 7,
  },
  signName: {
    fontSize: 10.5,
    fontWeight: 700,
  },
  signRole: {
    marginTop: 4,
    color: MUTED,
    textAlign: 'center',
  },
  footer: {
    marginTop: 10,
    textAlign: 'center',
    color: MUTED,
    fontSize: 8,
  },
});

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

function moneyLine(currency: string, value: number) {
  return `${currency.toUpperCase()} ${fmt(value)}`;
}

function firstLine(items?: string[]) {
  return items?.find((item) => item.trim().length > 0) || '';
}

function cleanList(items?: string[]) {
  return (items || []).map((item) => item.trim()).filter(Boolean);
}

export default function QuotationInvoicePDF({ doc }: { doc: CommonDoc }) {
  const currency =
    doc.exchangeCurrency || doc.items[0]?.unitPrice?.currency || doc.price?.currency || 'USD';
  const totals = computeTotals(doc.items, currency);
  const notes = cleanList(doc.notes);
  const summary =
    doc.introNote ||
    firstLine(notes) ||
    'Commercial proposal prepared for fast buyer review and post-meeting follow-up.';
  const highlights = cleanList(doc.productHighlights);
  const certifications = cleanList(doc.certifications);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              {doc.logoDataUrl ? <Image src={doc.logoDataUrl} style={styles.logo} /> : null}
              <Text style={styles.kicker}>{doc.docType}</Text>
              <Text style={styles.heroTitle}>{doc.subject || 'Client quotation'}</Text>
              <Text style={styles.heroText}>{summary}</Text>

              <View style={styles.chipRow}>
                <Text style={[styles.chip, styles.chipAccent]}>{doc.docNo || 'Draft quotation'}</Text>
                {doc.eventName ? <Text style={styles.chip}>{doc.eventName}</Text> : null}
                {doc.eventDates ? <Text style={styles.chip}>{doc.eventDates}</Text> : null}
                {doc.eventLocation ? <Text style={styles.chip}>{doc.eventLocation}</Text> : null}
              </View>
            </View>

            <View style={styles.heroRight}>
              <View style={styles.presenterPanel}>
                <Text style={styles.panelLabel}>Presented by</Text>
                <Text style={styles.panelName}>{doc.seller.name || 'Your company'}</Text>
                {doc.fromPerson ? <Text style={styles.panelValue}>{doc.fromPerson}</Text> : null}
                {doc.fromTitle ? <Text style={styles.panelValue}>{doc.fromTitle}</Text> : null}
                {doc.contactEmail ? <Text style={styles.panelValue}>{doc.contactEmail}</Text> : null}
                {doc.contactPhone ? <Text style={styles.panelValue}>{doc.contactPhone}</Text> : null}
                {doc.website ? <Text style={styles.panelValue}>{doc.website}</Text> : null}

                <View style={styles.splitRow}>
                  <View style={styles.splitCell}>
                    <Text style={styles.metaLabel}>Valid until</Text>
                    <Text style={styles.metaValue}>{formatDate(doc.validUntil)}</Text>
                  </View>
                  <View style={styles.splitCell}>
                    <Text style={styles.metaLabel}>Buyer</Text>
                    <Text style={styles.metaValue}>{doc.buyer.name || 'Prospective Buyer'}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Hall / Booth</Text>
                  <Text style={styles.metaValue}>{doc.boothNo || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.fullCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardLabel}>Offer lines</Text>
              <Text style={styles.sectionTitle}>Products and quoted values</Text>
            </View>
            <Text style={styles.totalPill}>
              Estimated value {moneyLine(currency, totals.grandTotal.value)}
            </Text>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, styles.cellDescription]}>Description</Text>
            <Text style={[styles.tableHeadText, styles.cellUnit]}>Unit</Text>
            <Text style={[styles.tableHeadText, styles.cellQty]}>Qty</Text>
            <Text style={[styles.tableHeadText, styles.cellPrice]}>Unit price</Text>
            <Text style={[styles.tableHeadText, styles.cellAmount]}>Amount</Text>
          </View>

          {doc.items.length > 0 ? (
            doc.items.map((item, index) => {
              const amount = (item.qty || 0) * (item.unitPrice?.value || 0);
              return (
                <View
                  key={`${item.description}-${index}`}
                  style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                >
                  <Text style={styles.cellDescription}>{item.description || '-'}</Text>
                  <Text style={styles.cellUnit}>{item.unit || '-'}</Text>
                  <Text style={styles.cellQty}>{fmt(item.qty || 0, 0)}</Text>
                  <Text style={styles.cellPrice}>
                    {item.unitPrice
                      ? moneyLine(item.unitPrice.currency, item.unitPrice.value)
                      : '-'}
                  </Text>
                  <Text style={styles.cellAmount}>{moneyLine(currency, amount)}</Text>
                </View>
              );
            })
          ) : (
            <Text>No line items yet.</Text>
          )}
        </View>

        <View style={styles.fullCard}>
          <Text style={styles.cardLabel}>Commercial terms</Text>
          <Text style={styles.sectionTitle}>Decision-ready terms</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Delivery terms</Text>
              <Text style={styles.metricValue}>{doc.deliveryTerms || '-'}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Payment</Text>
              <Text style={styles.metricValue}>{doc.paymentTerms || '-'}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>MOQ</Text>
              <Text style={styles.metricValue}>
                {doc.minOrderQty
                  ? `${fmt(doc.minOrderQty.value, 0)} ${doc.minOrderQty.unit}`
                  : '-'}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Lead time</Text>
              <Text style={styles.metricValue}>{doc.leadTime || '-'}</Text>
            </View>
          </View>
          {notes.length > 0 ? (
            <View style={styles.noteBox}>
              {notes.map((note) => (
                <Text key={note}>{note}</Text>
              ))}
            </View>
          ) : null}
        </View>

        {highlights.length > 0 && certifications.length > 0 ? (
          <View style={styles.twoCol}>
            <View style={styles.halfCard}>
              <Text style={styles.cardLabel}>Buyer hooks</Text>
              <Text style={styles.sectionTitle}>Why this offer stands out</Text>
              {highlights.map((item) => (
                <View style={styles.bulletRow} key={item}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.halfCard}>
              <Text style={styles.cardLabel}>Proof points</Text>
              <Text style={styles.sectionTitle}>Certifications and readiness</Text>
              <View style={styles.pillWrap}>
                {certifications.map((item) => (
                  <Text key={item} style={styles.pill}>
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {highlights.length > 0 && certifications.length === 0 ? (
          <View style={styles.fullCard}>
            <Text style={styles.cardLabel}>Buyer hooks</Text>
            <Text style={styles.sectionTitle}>Why this offer stands out</Text>
            {highlights.map((item) => (
              <View style={styles.bulletRow} key={item}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {certifications.length > 0 && highlights.length === 0 ? (
          <View style={styles.fullCard}>
            <Text style={styles.cardLabel}>Proof points</Text>
            <Text style={styles.sectionTitle}>Certifications and readiness</Text>
            <View style={styles.pillWrap}>
              {certifications.map((item) => (
                <Text key={item} style={styles.pill}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.signCard}>
          <Text style={styles.cardLabel}>Next step</Text>
          <Text style={styles.signTitleText}>Follow-up after the conversation</Text>
          <View style={styles.signRow}>
            <View style={styles.signCopy}>
              <Text style={styles.signText}>
                {doc.closing ||
                  'Thank you for your time. We are ready to follow up with samples, specifications, and final commercial confirmation immediately after the meeting.'}
              </Text>
              <Text style={styles.signMeta}>
                {doc.fromPerson || doc.seller.name}
                {doc.contactEmail ? ` | ${doc.contactEmail}` : ''}
                {doc.contactPhone ? ` | ${doc.contactPhone}` : ''}
              </Text>
            </View>

            <View style={styles.signBlock}>
              {doc.signatureImageDataUrl ? (
                <Image src={doc.signatureImageDataUrl} style={styles.signImage} />
              ) : null}
              <View style={styles.signLine} />
              <Text style={styles.signName}>
                {doc.signatureName || doc.fromPerson || doc.seller.name}
              </Text>
              <Text style={styles.signRole}>
                {doc.signTitle || doc.fromTitle || 'Sales Representative'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated from ThaiFex Sales Proposal Studio for online sharing and PDF handover.
        </Text>
      </Page>
    </Document>
  );
}
