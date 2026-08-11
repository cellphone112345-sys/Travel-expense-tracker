import { prisma } from "../lib/prismaClient";
import { HttpError } from "../middleware/errorHandler";
import { getRate } from "./exchangeRateService";
import { convertMinor, toMajorUnits, toMinorUnits } from "../utils/currencyMath";
import { getTripOrThrow } from "./tripService";

export interface ExpenseInput {
  categoryId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  merchant?: string | null;
  paymentMethod?: "CASH" | "CARD" | "OTHER";
  notes?: string | null;
}

async function computeConvertedAmounts(
  amountMinor: number,
  currency: string,
  date: string,
  baseCurrency: string,
  homeCurrency: string
) {
  const rateToHome = await getRate(currency, homeCurrency, date);
  const amountInHomeCurrencyMinor = convertMinor(amountMinor, currency, homeCurrency, rateToHome);

  const amountInBaseCurrencyMinor =
    baseCurrency === homeCurrency
      ? amountInHomeCurrencyMinor
      : convertMinor(amountMinor, currency, baseCurrency, await getRate(currency, baseCurrency, date));

  return { amountInHomeCurrencyMinor, amountInBaseCurrencyMinor, exchangeRateUsed: rateToHome };
}

export async function listExpenses(
  userId: string,
  tripId: string,
  filters: { categoryId?: string; dateFrom?: string; dateTo?: string; search?: string }
) {
  await getTripOrThrow(userId, tripId);
  return prisma.expense.findMany({
    where: {
      tripId,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            date: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
      ...(filters.search && {
        OR: [
          { description: { contains: filters.search } },
          { merchant: { contains: filters.search } },
        ],
      }),
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

export async function getExpenseOrThrow(userId: string, expenseId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { trip: true },
  });
  if (!expense || expense.trip.userId !== userId) {
    throw new HttpError(404, "EXPENSE_NOT_FOUND");
  }
  return expense;
}

export async function createExpense(userId: string, tripId: string, input: ExpenseInput) {
  const trip = await getTripOrThrow(userId, tripId);
  const currency = input.currency.toUpperCase();
  const amountMinor = toMinorUnits(input.amount, currency);
  const converted = await computeConvertedAmounts(
    amountMinor,
    currency,
    input.date,
    trip.baseCurrency,
    trip.homeCurrency
  );

  return prisma.expense.create({
    data: {
      tripId,
      categoryId: input.categoryId,
      amountMinor,
      currency,
      description: input.description,
      date: new Date(input.date),
      merchant: input.merchant ?? null,
      paymentMethod: input.paymentMethod ?? "OTHER",
      notes: input.notes ?? null,
      ...converted,
    },
    include: { category: true },
  });
}

export async function updateExpense(userId: string, expenseId: string, input: Partial<ExpenseInput>) {
  const existing = await getExpenseOrThrow(userId, expenseId);
  const trip = await getTripOrThrow(userId, existing.tripId);

  const currency = (input.currency ?? existing.currency).toUpperCase();
  const amount = input.amount ?? undefined;
  const date = input.date ?? existing.date.toISOString();

  let amountMinor: number;
  if (amount !== undefined) {
    amountMinor = toMinorUnits(amount, currency);
  } else if (currency === existing.currency) {
    amountMinor = existing.amountMinor;
  } else {
    // Currency changed but amount didn't: preserve the numeric value, reinterpreted in the new currency.
    const sameNumberInNewCurrency = toMajorUnits(existing.amountMinor, existing.currency);
    amountMinor = toMinorUnits(sameNumberInNewCurrency, currency);
  }

  const converted = await computeConvertedAmounts(amountMinor, currency, date, trip.baseCurrency, trip.homeCurrency);

  return prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      amountMinor,
      currency,
      date: new Date(date),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.merchant !== undefined && { merchant: input.merchant }),
      ...(input.paymentMethod !== undefined && { paymentMethod: input.paymentMethod }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...converted,
    },
    include: { category: true },
  });
}

export async function deleteExpense(userId: string, expenseId: string) {
  await getExpenseOrThrow(userId, expenseId);
  await prisma.expense.delete({ where: { id: expenseId } });
}
