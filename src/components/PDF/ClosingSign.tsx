import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { CommonDoc } from '../../types';
import { pdfStyles } from './styles';

export default function ClosingSign({ doc }: { doc: CommonDoc }) {
  return (
    <>
      <View style={pdfStyles.mt6}>
        <Text>
          We hope the above quotation is acceptable to you. If you need further information, please do not hesitate to contact us. We look forward to your favourable reply.
        </Text>
      </View>
      <View style={pdfStyles.signBlock}>
        <Text>Sincerely yours,</Text>
        <Text style={[pdfStyles.mt8]}>{' '}</Text>
        <Text style={pdfStyles.bold}>{doc.signTitle || 'Marketing Manager'}</Text>
      </View>
    </>
  );
}
