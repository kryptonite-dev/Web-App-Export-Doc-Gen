// src/components/PDF/GoodsSection.tsx
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { pdfStyles } from './styles';
import { fmt } from '../../utils';

type Props = {
  doc: CommonDoc;
};

export default function GoodsSection({ doc }: Props) {
  const firstItem = doc.items?.[0];

  const currency =
    firstItem?.unitPrice?.currency || doc.exchangeCurrency || 'USD';
  const priceValue =
    firstItem?.unitPrice?.value !== undefined ? firstItem.unitPrice.value : undefined;
  const unit =
    firstItem?.unit || doc.minOrderQty?.unit || 'UNIT';

  const minQtyValue = doc.minOrderQty?.value;
  const minQtyUnit = doc.minOrderQty?.unit || unit;

  const termOfPayment = doc.paymentTerms || '-';

  const fxLine =
    typeof doc.fxRate === 'number'
      ? `*** EXCHANGE RATE IS 1 ${currency.toUpperCase()} = ${fmt(
          doc.fxRate
        )} BAHT ***`
      : '';

  return (
    <View style={[pdfStyles.box, pdfStyles.mt4]}>
      {/* Description of goods (หัวข้อ) */}
      <View style={pdfStyles.row}>
        <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
          <Text style={pdfStyles.bold}>Description of goods</Text>
        </View>
      </View>

      {/* บรรทัดชื่อสินค้า */}
      {firstItem && (
        <View
          style={[
            pdfStyles.row,
            { borderTopWidth: 1, borderColor: '#000' },
          ]}
        >
          <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
            <Text>{firstItem.description}</Text>
          </View>
        </View>
      )}

      {/* PRICE / UNIT */}
      <View
        style={[
          pdfStyles.row,
          { borderTopWidth: 1, borderColor: '#000' },
        ]}
      >
        <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
          <Text>
            <Text style={pdfStyles.bold}>
              Price/ {unit.toUpperCase()}{' '}
            </Text>
            {priceValue != null
              ? `${currency.toUpperCase()} ${fmt(priceValue)}`
              : '-'}
          </Text>
        </View>
      </View>

      {/* MIN. QTY/ ORDER */}
      <View
        style={[
          pdfStyles.row,
          { borderTopWidth: 1, borderColor: '#000' },
        ]}
      >
        <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
          <Text>
            <Text style={pdfStyles.bold}>Min. Qty/ Order </Text>
            {minQtyValue != null
              ? `${minQtyUnit.toUpperCase()}  ${fmt(minQtyValue)}`
              : '-'}
          </Text>
        </View>
      </View>

      {/* TERM OF PAYMENT */}
      <View
        style={[
          pdfStyles.row,
          { borderTopWidth: 1, borderColor: '#000' },
        ]}
      >
        <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
          <Text>
            <Text style={pdfStyles.bold}>Term of Payment : </Text>
            {termOfPayment}
          </Text>
        </View>
      </View>

      {/* EXCHANGE RATE */}
      {fxLine && (
        <View
          style={[
            pdfStyles.row,
            { borderTopWidth: 1, borderColor: '#000' },
          ]}
        >
          <View style={[pdfStyles.w100, pdfStyles.cellLast]}>
            <Text>{fxLine}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
