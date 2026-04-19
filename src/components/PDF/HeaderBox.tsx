// src/components/PDF/HeaderBox.tsx
import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { pdfStyles } from './styles';

export default function HeaderBox({ doc }: { doc: CommonDoc }) {
  const width = Math.min(Math.max(doc.logoWidthPt || 100, 60), 200);

  return (
    <>
      {/* LOGO */}
      {doc.logoDataUrl && (
        <View style={pdfStyles.logoWrap}>
          <Image
            src={doc.logoDataUrl}
            style={[pdfStyles.logo, { width, height: width * 0.3 }]}
          />
        </View>
      )}

      {/* COMPANY NAME + ADDRESS + TITLE */}
      <Text style={pdfStyles.companyName}>{doc.seller.name?.toUpperCase()}</Text>
      <Text style={pdfStyles.companyAddr}>{doc.seller.address}</Text>
      <Text style={pdfStyles.bigTitle}>{doc.docType.toUpperCase()}</Text>

      {/* MAIN HEADER BOX */}
      <View style={[pdfStyles.box, pdfStyles.mb6]}>

        {/* 1) SELLER / DATE-PAGES-REF */}
        <View style={pdfStyles.row}>
          <View style={[pdfStyles.w60, pdfStyles.cell]}>
            <Text>
              <Text style={pdfStyles.bold}>SELLER : </Text>
              {doc.seller.name?.toUpperCase()}
            </Text>
            <Text>{doc.seller.address}</Text>
          </View>

          <View style={[pdfStyles.w40, pdfStyles.cellLast]}>
            <Text>
              <Text style={pdfStyles.bold}>DATE : </Text>{doc.docDate}
            </Text>
            <Text>
              <Text style={pdfStyles.bold}>PAGES : </Text>1 of 1
            </Text>
            <Text>
              <Text style={pdfStyles.bold}>
                {doc.docType === 'Quotation' ? 'OUR REF. : ' : 'INVOICE NO. : '}
              </Text>
              {doc.docNo || '-'}
            </Text>
          </View>
        </View>

        {/* 2) BUYER */}
        <View style={[pdfStyles.row, { borderTopWidth: 1, borderColor: "#000" }]}>
          <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
            <Text>
              <Text style={pdfStyles.bold}>BUYER : </Text>
              {doc.buyer.name?.toUpperCase()}
            </Text>
            <Text>{doc.buyer.address}</Text>
          </View>
        </View>

        {/* 3) ATTN */}
        <View style={[pdfStyles.row, { borderTopWidth: 1, borderColor: "#000" }]}>
          <View style={[pdfStyles.w25, pdfStyles.cell]}>
            <Text style={pdfStyles.bold}>ATTN :</Text>
          </View>
          <View style={[{ flex: 1 }, pdfStyles.cellLast]}>
            <Text>{doc.attn}</Text>
          </View>
        </View>

        {/* 4) FROM */}
        <View style={[pdfStyles.row, { borderTopWidth: 1, borderColor: "#000" }]}>
          <View style={[pdfStyles.w25, pdfStyles.cell]}>
            <Text style={pdfStyles.bold}>FROM :</Text>
          </View>
          <View style={[{ flex: 1 }, pdfStyles.cellLast]}>
            <Text>{doc.fromPerson}</Text>
          </View>
        </View>

        {/* 5) FAX */}
        <View style={[pdfStyles.row, { borderTopWidth: 1, borderColor: "#000" }]}>
          <View style={[pdfStyles.w25, pdfStyles.cell]}>
            <Text style={pdfStyles.bold}>FAX. :</Text>
          </View>
          <View style={[{ flex: 1 }, pdfStyles.cellLast]}>
            <Text>{doc.fax || "-"}</Text>
          </View>
        </View>

        {/* 6) SUBJECT */}
        <View style={[pdfStyles.row, { borderTopWidth: 1, borderColor: "#000" }]}>
          <View style={[pdfStyles.w25, pdfStyles.cell]}>
            <Text style={pdfStyles.bold}>SUBJECT :</Text>
          </View>
          <View style={[{ flex: 1 }, pdfStyles.cellLast]}>
            <Text>{doc.subject}</Text>
          </View>
        </View>

        {/* 7) TERM OF DELIVERY */}
        <View style={[pdfStyles.row, { borderTopWidth: 1, borderColor: "#000" }]}>
          <View style={[pdfStyles.w25, pdfStyles.cell]}>
            <Text style={pdfStyles.bold}>TERM OF DELIVE</Text>
          </View>
          <View style={[{ flex: 1 }, pdfStyles.cellLast]}>
            <Text>{doc.deliveryTerms}</Text>
            <Text style={pdfStyles.small}>
              PRICE QUOTATION FOR {doc.buyer.name?.toUpperCase() || "BUYER"}.
            </Text>
          </View>
        </View>

      </View>
    </>
  );
}
