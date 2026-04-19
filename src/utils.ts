import { Currency, LineItem, Money } from './types';

export function fmt(n: number, digits = 2, locale = 'en-US') {
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}
export function fmtMoney(m: Money, locale = 'en-US') {
  return `${m.currency} ${fmt(m.value, 2, locale)}`;
}
export function wordsAmount(m: Money) {
  return `${m.currency} ${fmt(m.value)} only`;
}
export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}
export function computeTotals(items: LineItem[], currency: Currency = 'USD') {
  const sub = items.reduce((a, it) => a + (it.qty || 0) * (it.unitPrice?.value || 0), 0);
  return { subTotal: { currency, value: sub }, grandTotal: { currency, value: sub } };
}

export const NAVY = '#0A0F1A';
export const GOLD = '#D4AF37';
export const IVORY = '#F7F7F2';
