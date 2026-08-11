const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function decimalsFor(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;
}

export function minorToMajor(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** decimalsFor(currency);
}

export function majorToMinor(amountMajor: number, currency: string): number {
  return Math.round(amountMajor * 10 ** decimalsFor(currency));
}

export function formatMoney(amountMinor: number, currency: string): string {
  const value = minorToMajor(amountMinor, currency);
  try {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency,
      minimumFractionDigits: decimalsFor(currency),
      maximumFractionDigits: decimalsFor(currency),
    }).format(value);
  } catch {
    return `${value.toFixed(decimalsFor(currency))} ${currency}`;
  }
}

export interface CurrencyMeta {
  code: string;
  nameZh: string;
  countries: string[];
}

// Common ISO-4217 codes for the currency picker; covers Frankfurter's set plus common
// Asia-Pacific currencies (like TWD) that fall back to the secondary rate provider.
// nameZh/countries power the searchable currency picker (search by code, Chinese name, or country).
export const CURRENCIES: CurrencyMeta[] = [
  { code: "TWD", nameZh: "新台幣", countries: ["台灣"] },
  { code: "USD", nameZh: "美元", countries: ["美國"] },
  { code: "EUR", nameZh: "歐元", countries: ["歐盟", "德國", "法國", "義大利", "西班牙", "荷蘭"] },
  { code: "JPY", nameZh: "日圓", countries: ["日本"] },
  { code: "GBP", nameZh: "英鎊", countries: ["英國"] },
  { code: "CNY", nameZh: "人民幣", countries: ["中國"] },
  { code: "HKD", nameZh: "港幣", countries: ["香港"] },
  { code: "KRW", nameZh: "韓元", countries: ["韓國"] },
  { code: "THB", nameZh: "泰銖", countries: ["泰國"] },
  { code: "SGD", nameZh: "新加坡幣", countries: ["新加坡"] },
  { code: "MYR", nameZh: "馬來西亞令吉", countries: ["馬來西亞"] },
  { code: "VND", nameZh: "越南盾", countries: ["越南"] },
  { code: "IDR", nameZh: "印尼盾", countries: ["印尼"] },
  { code: "PHP", nameZh: "菲律賓披索", countries: ["菲律賓"] },
  { code: "INR", nameZh: "印度盧比", countries: ["印度"] },
  { code: "AUD", nameZh: "澳幣", countries: ["澳洲"] },
  { code: "CAD", nameZh: "加拿大幣", countries: ["加拿大"] },
  { code: "CHF", nameZh: "瑞士法郎", countries: ["瑞士"] },
  { code: "NZD", nameZh: "紐西蘭幣", countries: ["紐西蘭"] },
  { code: "TRY", nameZh: "土耳其里拉", countries: ["土耳其"] },
  { code: "CZK", nameZh: "捷克克朗", countries: ["捷克"] },
  { code: "DKK", nameZh: "丹麥克朗", countries: ["丹麥"] },
  { code: "HUF", nameZh: "匈牙利福林", countries: ["匈牙利"] },
  { code: "ILS", nameZh: "以色列新謝克爾", countries: ["以色列"] },
  { code: "MXN", nameZh: "墨西哥披索", countries: ["墨西哥"] },
  { code: "NOK", nameZh: "挪威克朗", countries: ["挪威"] },
  { code: "PLN", nameZh: "波蘭茲羅提", countries: ["波蘭"] },
  { code: "RON", nameZh: "羅馬尼亞列伊", countries: ["羅馬尼亞"] },
  { code: "SEK", nameZh: "瑞典克朗", countries: ["瑞典"] },
  { code: "ZAR", nameZh: "南非蘭特", countries: ["南非"] },
  { code: "BRL", nameZh: "巴西雷亞爾", countries: ["巴西"] },
];

export const CURRENCY_OPTIONS = CURRENCIES.map((c) => c.code);

export function currencyLabel(code: string): string {
  const meta = CURRENCIES.find((c) => c.code === code.toUpperCase());
  return meta ? `${meta.code}（${meta.nameZh}）` : code.toUpperCase();
}

export function searchCurrencies(query: string): CurrencyMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return CURRENCIES;
  return CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.nameZh.includes(query.trim()) ||
      c.countries.some((country) => country.includes(query.trim()))
  );
}
