import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { pdfStyles } from './styles';

export default function PaymentSection({ doc }: { doc: CommonDoc }) {
  return (
    <View style={[pdfStyles.box, pdfStyles.mb6]}>
      <View style={[pdfStyles.row]}>
        <View style={[{ flex: 1 }, pdfStyles.cellLast]}>
          <Text><Text style={pdfStyles.bold}>TERM OF PAYMENT </Text>{doc.paymentTerms}</Text>
          {doc.sellerBank ? (<Text style={pdfStyles.small}><Text style={pdfStyles.bold}>SELLER'S BANK : </Text>{doc.sellerBank}</Text>) : null}
          {doc.sellerBankAddress ? (<Text style={pdfStyles.small}><Text style={pdfStyles.bold}>ADDRESS : </Text>{doc.sellerBankAddress}</Text>) : null}
          {doc.swiftCode ? (<Text style={pdfStyles.small}><Text style={pdfStyles.bold}>SWIFT CODE : </Text>{doc.swiftCode}</Text>) : null}
        </View>
      </View>
    </View>
  );
}
