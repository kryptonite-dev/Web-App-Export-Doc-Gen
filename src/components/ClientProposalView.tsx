import React from 'react';
import { CommonDoc, LineItem } from '../types';
import { computeTotals, fmt, fmtMoney } from '../utils';

function formatLongDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function firstMeaningfulLine(items?: string[]) {
  return items?.find((item) => item.trim().length > 0) || '';
}

function lineAmount(item: LineItem) {
  return (item.qty || 0) * (item.unitPrice?.value || 0);
}

function InfoTile({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="proposal-metric">
      <div className="proposal-eyebrow">{label}</div>
      <div className="proposal-metric-value">{value || '-'}</div>
    </div>
  );
}

function cleanList(items?: string[]) {
  return (items || []).map((item) => item.trim()).filter(Boolean);
}

export default function ClientProposalView({
  doc,
  embedded = false,
}: {
  doc: CommonDoc;
  embedded?: boolean;
}) {
  const items = doc.items || [];
  const currency =
    doc.exchangeCurrency || items[0]?.unitPrice?.currency || doc.price?.currency || 'USD';
  const totals = computeTotals(items, currency);
  const highlights = cleanList(doc.productHighlights);
  const certifications = cleanList(doc.certifications);
  const notes = cleanList(doc.notes);
  const summaryLine =
    doc.introNote ||
    firstMeaningfulLine(notes) ||
    'Commercial proposal prepared for buyer review and post-meeting follow-up.';

  return (
    <div className={`proposal-page ${embedded ? 'embedded' : 'full'}`}>
      <section className="proposal-hero">
        <div className="proposal-hero-copy">
          <div className="proposal-chip-row">
            <span className="proposal-chip proposal-chip-accent">{doc.docType}</span>
            {doc.eventName ? <span className="proposal-chip">{doc.eventName}</span> : null}
            {doc.boothNo ? <span className="proposal-chip">{doc.boothNo}</span> : null}
            {doc.buyer.name ? <span className="proposal-chip">Prepared for {doc.buyer.name}</span> : null}
          </div>
          <h1>{doc.subject || 'Trade-show commercial proposal'}</h1>
          <p>{summaryLine}</p>
          <div className="proposal-chip-row">
            {doc.eventDates ? <span className="proposal-chip">{doc.eventDates}</span> : null}
            {doc.validUntil ? (
              <span className="proposal-chip">Valid until {formatLongDate(doc.validUntil)}</span>
            ) : null}
          </div>
        </div>

        <div className="proposal-company-panel">
          <div className="proposal-company-head">
            {doc.logoDataUrl ? (
              <img src={doc.logoDataUrl} alt="Company logo" className="proposal-logo" />
            ) : null}
            <div>
              <div className="proposal-eyebrow">Presented by</div>
              <div className="proposal-company-name">{doc.seller.name || 'Your company'}</div>
            </div>
          </div>

          <div className="proposal-company-meta">
            {doc.fromPerson ? <div>{doc.fromPerson}</div> : null}
            {doc.fromTitle ? <div>{doc.fromTitle}</div> : null}
            {doc.contactEmail ? <div>{doc.contactEmail}</div> : null}
            {doc.contactPhone ? <div>{doc.contactPhone}</div> : null}
            {doc.website ? <div>{doc.website}</div> : null}
          </div>
        </div>
      </section>

      <section className="proposal-card proposal-table-card">
        <div className="proposal-card-head">
          <div>
            <div className="proposal-eyebrow">Offer lines</div>
            <h2>Products and quoted values</h2>
          </div>
          <div className="proposal-total-pill">
            Estimated value {fmtMoney(totals.grandTotal)}
          </div>
        </div>

        <div className="proposal-table-wrap">
          <table className="proposal-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Unit</th>
                <th className="right">Qty</th>
                <th className="right">Unit price</th>
                <th className="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={`${item.description}-${index}`}>
                    <td>{item.description || '-'}</td>
                    <td>{item.unit || '-'}</td>
                    <td className="right">{fmt(item.qty || 0, 0)}</td>
                    <td className="right">
                      {item.unitPrice ? fmtMoney(item.unitPrice) : '-'}
                    </td>
                    <td className="right">
                      {item.unitPrice
                        ? `${item.unitPrice.currency} ${fmt(lineAmount(item))}`
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="proposal-empty-row">
                    Add at least one product line to complete the quotation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="proposal-card">
        <div className="proposal-card-head">
          <div>
            <div className="proposal-eyebrow">Commercial terms</div>
            <h2>Decision-ready terms</h2>
          </div>
        </div>
        <div className="proposal-metric-grid">
          <InfoTile label="Delivery terms" value={doc.deliveryTerms || '-'} />
          <InfoTile label="Payment" value={doc.paymentTerms || '-'} />
          <InfoTile
            label="MOQ"
            value={
              doc.minOrderQty ? `${fmt(doc.minOrderQty.value, 0)} ${doc.minOrderQty.unit}` : '-'
            }
          />
          <InfoTile label="Lead time" value={doc.leadTime || '-'} />
        </div>
        {notes.length > 0 ? (
          <div className="proposal-note-box">
            {notes.map((note) => (
              <div key={note}>{note}</div>
            ))}
          </div>
        ) : null}
      </section>

      {highlights.length > 0 && certifications.length > 0 ? (
        <section className="proposal-grid">
          <article className="proposal-card">
            <div className="proposal-card-head">
              <div>
                <div className="proposal-eyebrow">Buyer hooks</div>
                <h2>Why this offer stands out</h2>
              </div>
            </div>
            <div className="proposal-bullet-list">
              {highlights.map((item) => (
                <div className="proposal-bullet-item" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="proposal-card">
            <div className="proposal-card-head">
              <div>
                <div className="proposal-eyebrow">Proof points</div>
                <h2>Certifications and readiness</h2>
              </div>
            </div>
            <div className="proposal-pill-wrap">
              {certifications.map((item) => (
                <span className="proposal-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {highlights.length > 0 && certifications.length === 0 ? (
        <section className="proposal-card">
          <div className="proposal-card-head">
            <div>
              <div className="proposal-eyebrow">Buyer hooks</div>
              <h2>Why this offer stands out</h2>
            </div>
          </div>
          <div className="proposal-bullet-list">
            {highlights.map((item) => (
              <div className="proposal-bullet-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {certifications.length > 0 && highlights.length === 0 ? (
        <section className="proposal-card">
          <div className="proposal-card-head">
            <div>
              <div className="proposal-eyebrow">Proof points</div>
              <h2>Certifications and readiness</h2>
            </div>
          </div>
          <div className="proposal-pill-wrap">
            {certifications.map((item) => (
              <span className="proposal-pill" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="proposal-card proposal-signoff">
        <div className="proposal-card-head">
          <div>
            <div className="proposal-eyebrow">Next step</div>
            <h2>Follow-up after the conversation</h2>
          </div>
        </div>

        <div className="proposal-signoff-grid">
          <div>
            <p className="proposal-closing">
              {doc.closing ||
                'Thank you for your time. We will follow up with samples, specifications, and final commercial confirmation immediately after the meeting.'}
            </p>
            <div className="proposal-contact-strip">
              <span>{doc.fromPerson || doc.seller.name}</span>
              {doc.contactEmail ? <span>{doc.contactEmail}</span> : null}
              {doc.contactPhone ? <span>{doc.contactPhone}</span> : null}
              {doc.website ? <span>{doc.website}</span> : null}
            </div>
          </div>

          <div className="proposal-signature-block">
            {doc.signatureImageDataUrl ? (
              <img
                src={doc.signatureImageDataUrl}
                alt="Signature"
                className="proposal-signature-image"
              />
            ) : null}
            <div className="proposal-signature-line" />
            <div className="proposal-signature-name">
              {doc.signatureName || doc.fromPerson || doc.seller.name}
            </div>
            <div className="proposal-signature-title">
              {doc.signTitle || doc.fromTitle || 'Sales Representative'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
