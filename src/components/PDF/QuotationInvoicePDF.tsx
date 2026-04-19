import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { computeTotals, fmt } from '../../utils';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: '#fffdf8',
    color: '#152538',
    fontSize: 10,
    lineHeight: 1.45,
  },
  hero: {
    backgroundColor: '#11263d',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitleWrap: {
    flexGrow: 1,
    paddingRight: 16,
  },
  heroLabel: {
    fontSize: 9,
    color: '#c9d5e0',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    color: '#fdf7ea',
    fontWeight: 700,
    marginTop: 8,
    lineHeight: 1.15,
  },
  heroText: {
    color: '#dce6ef',
    marginTop: 10,
  },
  heroMeta: {
    width: 180,
    borderRadius: 12,
    backgroundColor: '#173855',
    padding: 12,
  },
  heroMetaRow: {
    marginBottom: 8,
  },
  heroMetaLabel: {
    color: '#9fb6c8',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  heroMetaValue: {
    color: '#fdf7ea',
    fontSize: 10,
    marginTop: 2,
  },
  heroFooter: {
    flexDirection: 'row',
    marginTop: 14,
  },
  chip: {
    color: '#fdf7ea',
    fontSize: 9,
    marginRight: 12,
  },
  logoBox: {
    marginBottom: 10,
  },
  logo: {
    height: 40,
    objectFit: 'contain',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48.6%',
    borderWidth: 1,
    borderColor: '#d6dde5',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  fullCard: {
    borderWidth: 1,
    borderColor: '#d6dde5',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 8,
    color: '#5d738b',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f5',
    paddingBottom: 8,
    marginBottom: 8,
  },
  detailLabel: {
    width: 86,
    color: '#60758b',
  },
  detailValue: {
    flexGrow: 1,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  metricBox: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  metricInner: {
    borderRadius: 12,
    backgroundColor: '#f7f4ee',
    borderWidth: 1,
    borderColor: '#e7ecef',
    padding: 10,
  },
  metricLabel: {
    fontSize: 8,
    color: '#64798e',
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.45,
  },
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe2e8',
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f5',
    paddingVertical: 8,
  },
  cellDescription: {
    width: '40%',
    paddingRight: 8,
  },
  cellUnit: {
    width: '12%',
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
    width: '18%',
    textAlign: 'right',
  },
  tableHeadText: {
    fontSize: 8,
    color: '#60758b',
    textTransform: 'uppercase',
  },
  totalPill: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    borderRadius: 999,
    backgroundColor: '#f5e3c4',
    color: '#8a5918',
    paddingVertical: 7,
    paddingHorizontal: 12,
    fontSize: 9,
    fontWeight: 700,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#c78622',
    marginTop: 5,
    marginRight: 8,
  },
  bulletText: {
    flexGrow: 1,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  pillBox: {
    paddingHorizontal: 3,
    marginBottom: 6,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dce3e8',
    backgroundColor: '#f7f9fb',
    paddingVertical: 6,
    paddingHorizontal: 9,
    fontSize: 9,
  },
  noteBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#f7f4ee',
    padding: 10,
    color: '#596f86',
  },
  signGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signCopy: {
    width: '62%',
    paddingRight: 10,
  },
  signBlock: {
    width: '30%',
    alignItems: 'center',
  },
  signImage: {
    width: 110,
    height: 44,
    objectFit: 'contain',
    marginBottom: 6,
  },
  signLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#99a8b8',
    marginBottom: 7,
  },
  signName: {
    fontWeight: 700,
  },
  signTitle: {
    marginTop: 4,
    color: '#5d738b',
  },
  footer: {
    marginTop: 10,
    fontSize: 8,
    color: '#6b8094',
    textAlign: 'center',
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

function detailRow(label: string, value?: string) {
  return (
    <View style={styles.detailRow} key={`${label}-${value || 'empty'}`}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

export default function QuotationInvoicePDF({ doc }: { doc: CommonDoc }) {
  const currency =
    doc.exchangeCurrency || doc.items[0]?.unitPrice?.currency || doc.price?.currency || 'USD';
  const totals = computeTotals(doc.items, currency);
  const highlights =
    doc.productHighlights && doc.productHighlights.length > 0
      ? doc.productHighlights
      : [
          'Buyer-facing summary prepared for fast review during trade-show meetings.',
          'Use one source for tablet presentation, shared online view, and PDF handover.',
        ];
  const proofPoints =
    doc.certifications && doc.certifications.length > 0
      ? doc.certifications
      : ['Add certifications or market proof points before sending this proposal.'];
  const heroSummary =
    doc.introNote ||
    firstLine(doc.notes) ||
    'Commercial proposal prepared for buyer discussion and immediate post-meeting follow-up.';

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.hero}>
          {doc.logoDataUrl ? (
            <View style={styles.logoBox}>
              <Image src={doc.logoDataUrl} style={styles.logo} />
            </View>
          ) : null}

          <View style={styles.heroTop}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroLabel}>{doc.docType}</Text>
              <Text style={styles.heroTitle}>{doc.subject || 'Client proposal'}</Text>
              <Text style={styles.heroText}>{heroSummary}</Text>
            </View>

            <View style={styles.heroMeta}>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMetaLabel}>Document no.</Text>
                <Text style={styles.heroMetaValue}>{doc.docNo || '-'}</Text>
              </View>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMetaLabel}>Issued</Text>
                <Text style={styles.heroMetaValue}>{formatDate(doc.docDate)}</Text>
              </View>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMetaLabel}>Valid until</Text>
                <Text style={styles.heroMetaValue}>{formatDate(doc.validUntil)}</Text>
              </View>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMetaLabel}>Booth</Text>
                <Text style={styles.heroMetaValue}>{doc.boothNo || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroFooter}>
            {doc.eventName ? <Text style={styles.chip}>{doc.eventName}</Text> : null}
            {doc.eventDates ? <Text style={styles.chip}>{doc.eventDates}</Text> : null}
            {doc.eventLocation ? <Text style={styles.chip}>{doc.eventLocation}</Text> : null}
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Customer</Text>
            <Text style={styles.sectionTitle}>Meeting summary</Text>
            {detailRow('Buyer', doc.buyer.name || 'Prospective buyer')}
            {detailRow('Attn.', doc.attn || 'Procurement Team')}
            {detailRow('Buyer address', doc.buyer.address || '-')}
            {detailRow('Presented by', doc.fromPerson || doc.seller.name)}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Presented by</Text>
            <Text style={styles.sectionTitle}>{doc.seller.name || 'Your company'}</Text>
            {detailRow('Address', doc.seller.address || '-')}
            {detailRow('Title', doc.fromTitle || doc.signTitle || '-')}
            {detailRow('Email', doc.contactEmail || '-')}
            {detailRow('Phone', doc.contactPhone || '-')}
            {detailRow('Website', doc.website || '-')}
          </View>
        </View>

        <View style={styles.fullCard}>
          <Text style={styles.totalPill}>Estimated value {moneyLine(currency, totals.grandTotal.value)}</Text>
          <Text style={styles.sectionLabel}>Offer lines</Text>
          <Text style={styles.sectionTitle}>Products and quoted values</Text>

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
                <View style={styles.tableRow} key={`${item.description}-${index}`}>
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
            <Text>Add at least one line item to complete the quotation.</Text>
          )}
        </View>

        <View style={styles.fullCard}>
          <Text style={styles.sectionLabel}>Commercial terms</Text>
          <Text style={styles.sectionTitle}>Quick-read terms</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <View style={styles.metricInner}>
                <Text style={styles.metricLabel}>Delivery terms</Text>
                <Text style={styles.metricValue}>{doc.deliveryTerms || '-'}</Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <View style={styles.metricInner}>
                <Text style={styles.metricLabel}>Payment</Text>
                <Text style={styles.metricValue}>{doc.paymentTerms || '-'}</Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <View style={styles.metricInner}>
                <Text style={styles.metricLabel}>MOQ</Text>
                <Text style={styles.metricValue}>
                  {doc.minOrderQty
                    ? `${fmt(doc.minOrderQty.value, 0)} ${doc.minOrderQty.unit}`
                    : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <View style={styles.metricInner}>
                <Text style={styles.metricLabel}>Lead time</Text>
                <Text style={styles.metricValue}>{doc.leadTime || '-'}</Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <View style={styles.metricInner}>
                <Text style={styles.metricLabel}>FX rate</Text>
                <Text style={styles.metricValue}>
                  {typeof doc.fxRate === 'number'
                    ? `1 ${currency.toUpperCase()} = ${fmt(doc.fxRate)} THB`
                    : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <View style={styles.metricInner}>
                <Text style={styles.metricLabel}>Brand</Text>
                <Text style={styles.metricValue}>{doc.brand || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Buyer hooks</Text>
            <Text style={styles.sectionTitle}>Why this offer stands out</Text>
            {highlights.map((item) => (
              <View style={styles.bulletRow} key={item}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Proof points</Text>
            <Text style={styles.sectionTitle}>Certifications and readiness</Text>
            <View style={styles.pillWrap}>
              {proofPoints.map((item) => (
                <View style={styles.pillBox} key={item}>
                  <Text style={styles.pill}>{item}</Text>
                </View>
              ))}
            </View>
            {doc.notes && doc.notes.length > 0 ? (
              <View style={styles.noteBox}>
                {doc.notes.map((note) => (
                  <Text key={note}>{note}</Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.fullCard}>
          <Text style={styles.sectionLabel}>Next step</Text>
          <Text style={styles.sectionTitle}>Follow-up after the conversation</Text>
          <View style={styles.signGrid}>
            <View style={styles.signCopy}>
              <Text>
                {doc.closing ||
                  'Thank you for your time. We are ready to follow up with samples, specifications, and final commercial confirmation immediately after the meeting.'}
              </Text>
              <Text style={{ marginTop: 10 }}>
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
              <Text style={styles.signTitle}>
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
