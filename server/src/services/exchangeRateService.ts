import { prisma } from "../lib/prismaClient";
import { toIsoDateOnly, todayIsoDate, isPastDate } from "../utils/dateUtils";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const FALLBACK_BASE_URL = "https://open.er-api.com/v6/latest";

type RatesTable = Record<string, number>;

// Frankfurter sources rates from the ECB, which only publishes reference rates for these
// ~30 currencies (notably missing TWD, VND, and most others). For any pair outside this set
// we fall back to open.er-api.com, a free/no-key provider with much broader currency coverage
// but no historical-date endpoint on its free tier.
const FRANKFURTER_CURRENCIES = new Set([
  "AUD", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD",
  "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK",
  "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR",
]);

function isFrankfurterCurrency(code: string): boolean {
  return FRANKFURTER_CURRENCIES.has(code.toUpperCase());
}

/** Frankfurter has no rates for today (published with a delay) or future dates, so both use "latest". */
function effectiveRateDate(date: string): string {
  return isPastDate(date) ? date : todayIsoDate();
}

async function fetchFrankfurterRates(effectiveDate: string, base: string): Promise<RatesTable> {
  const path = effectiveDate === todayIsoDate() ? "latest" : effectiveDate;
  const url = `${FRANKFURTER_BASE_URL}/${path}?base=${encodeURIComponent(base)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Frankfurter request failed (${res.status}) for ${url}`);
  }
  const body = (await res.json()) as { rates: RatesTable };
  return body.rates;
}

async function fetchFallbackRates(base: string): Promise<RatesTable> {
  const url = `${FALLBACK_BASE_URL}/${encodeURIComponent(base)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fallback exchange rate request failed (${res.status}) for ${url}`);
  }
  const body = (await res.json()) as { result: string; rates: RatesTable };
  if (body.result !== "success") {
    throw new Error(`Fallback exchange rate provider returned an error for base ${base}`);
  }
  return body.rates;
}

async function getCachedRatesTable(
  cacheDate: string,
  cacheBase: string,
  fetcher: () => Promise<RatesTable>
): Promise<RatesTable> {
  const cached = await prisma.exchangeRateCache.findUnique({
    where: { date_base: { date: cacheDate, base: cacheBase } },
  });
  if (cached) {
    return JSON.parse(cached.ratesJson) as RatesTable;
  }

  const rates = await fetcher();
  await prisma.exchangeRateCache.upsert({
    where: { date_base: { date: cacheDate, base: cacheBase } },
    create: { date: cacheDate, base: cacheBase, ratesJson: JSON.stringify(rates) },
    update: { ratesJson: JSON.stringify(rates), fetchedAt: new Date() },
  });
  return rates;
}

/** Returns the Frankfurter rates table for `base` on `date`, using the DB cache when available. */
export async function getRatesTable(date: string, base: string): Promise<RatesTable> {
  const effectiveDate = effectiveRateDate(date);
  const baseCode = base.toUpperCase();
  return getCachedRatesTable(effectiveDate, baseCode, () => fetchFrankfurterRates(effectiveDate, baseCode));
}

/** Fallback provider's rates table for `base`, cached under today's date (no historical data available). */
async function getFallbackRatesTable(base: string): Promise<RatesTable> {
  const baseCode = base.toUpperCase();
  return getCachedRatesTable(todayIsoDate(), `ERAPI:${baseCode}`, () => fetchFallbackRates(baseCode));
}

/** Full rates table for `base` on `date`, picking Frankfurter or the fallback provider as appropriate. */
export async function getRatesTableSmart(date: string, base: string): Promise<RatesTable> {
  const baseCode = base.toUpperCase();
  if (isFrankfurterCurrency(baseCode)) {
    return getRatesTable(date, baseCode);
  }
  return getFallbackRatesTable(baseCode);
}

/** Resolves a single from->to rate for a given date (defaults to today). Returns 1 if from === to. */
export async function getRate(from: string, to: string, date?: string): Promise<number> {
  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();
  if (fromCode === toCode) return 1;

  const rateDate = date ? toIsoDateOnly(date) : todayIsoDate();

  if (isFrankfurterCurrency(fromCode) && isFrankfurterCurrency(toCode)) {
    const table = await getRatesTable(rateDate, fromCode);
    const rate = table[toCode];
    if (rate !== undefined) return rate;
  }

  const fallbackTable = await getFallbackRatesTable(fromCode);
  const fallbackRate = fallbackTable[toCode];
  if (fallbackRate === undefined) {
    throw new Error(`No exchange rate available for ${fromCode} -> ${toCode}`);
  }
  return fallbackRate;
}

/** Historical trend data. Only available for currency pairs Frankfurter/ECB covers. */
export async function getHistory(base: string, target: string, start: string, end: string) {
  if (!isFrankfurterCurrency(base) || !isFrankfurterCurrency(target)) {
    throw new Error("HISTORY_UNSUPPORTED_CURRENCY");
  }
  const url = `${FRANKFURTER_BASE_URL}/${start}..${end}?base=${encodeURIComponent(
    base
  )}&symbols=${encodeURIComponent(target)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Frankfurter history request failed (${res.status})`);
  }
  const body = (await res.json()) as { rates: Record<string, RatesTable> };
  return Object.entries(body.rates)
    .map(([date, rates]) => ({ date, rate: rates[target.toUpperCase()] }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export { isFrankfurterCurrency };
