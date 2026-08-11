import currency from "currency.js";

// ISO 4217 currencies with 0 minor decimal digits.
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function decimalsFor(currencyCode: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase()) ? 0 : 2;
}

/** Convert a user-entered major-unit amount (e.g. 12.50) to an integer minor-unit amount (e.g. 1250). */
export function toMinorUnits(amountMajor: number, currencyCode: string): number {
  const decimals = decimalsFor(currencyCode);
  const factor = 10 ** decimals;
  return Math.round(currency(amountMajor, { precision: decimals }).value * factor);
}

/** Convert an integer minor-unit amount back to a major-unit number for display/export. */
export function toMajorUnits(amountMinor: number, currencyCode: string): number {
  const decimals = decimalsFor(currencyCode);
  const factor = 10 ** decimals;
  return currency(amountMinor / factor, { precision: decimals }).value;
}

export function convertMinor(amountMinor: number, fromCurrency: string, toCurrency: string, rate: number): number {
  const majorFrom = toMajorUnits(amountMinor, fromCurrency);
  const majorTo = currency(majorFrom).multiply(rate).value;
  return toMinorUnits(majorTo, toCurrency);
}

export function formatMoney(amountMinor: number, currencyCode: string): string {
  const decimals = decimalsFor(currencyCode);
  const major = toMajorUnits(amountMinor, currencyCode);
  return currency(major, { symbol: "", precision: decimals }).format();
}
