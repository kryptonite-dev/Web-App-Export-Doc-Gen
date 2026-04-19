import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: { padding: 22, fontSize: 10 },
  companyName: { fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  companyAddr: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  bigTitle: { fontSize: 22, textAlign: 'center', marginVertical: 8, fontWeight: 'bold' },

  bold: { fontWeight: 'bold' },
  small: { fontSize: 9 },
  center: { textAlign: 'center' },

  box: { borderWidth: 1, borderColor: '#000' },
  row: { flexDirection: 'row' },
  cell: { padding: 4, borderRightWidth: 1, borderColor: '#000' },
  cellLast: { padding: 4 },

  sectionTitle: { fontWeight: 'bold', padding: 4, borderBottomWidth: 1, borderColor: '#000' },

  w60: { width: '60%' }, w40: { width: '40%' }, w25: { width: '25%' }, w100: { width: '100%' },

  mt4: { marginTop: 4 }, mt6: { marginTop: 6 }, mt8: { marginTop: 8 }, mb6: { marginBottom: 6 },

  signBlock: { marginTop: 22 },

  /** NEW: โลโก้ส่วนหัว */
  logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  logo: { objectFit: 'contain' },
});
