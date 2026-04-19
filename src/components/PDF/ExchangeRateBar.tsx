import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { pdfStyles } from './styles';
import { computeTotals, fmt } from '../../utils';

export default function ExchangeRateBar({ doc }: { doc: CommonDoc }) {
  if (typeof doc.fxRate !== 'number') return null;
  const totals = computeTotals(doc.items, doc.exchangeCurrency || doc.items[0]?.unitPrice?.currency || 'USD');
  const currency = totals.grandTotal.currency || 'USD';
  return (
    <View style={[pdfStyles.box, pdfStyles.mt4, pdfStyles.mb6]}>
      <Text style={[{ padding: 6 }, pdfStyles.center]}>
        *** EXCHANGE RATE IS 1 {currency} = {fmt(doc.fxRate)} BAHT ***
      </Text>
    </View>
  );
}
