import { prisma } from "../lib/prismaClient";
import { HttpError } from "../middleware/errorHandler";
import { toIsoDateOnly, todayIsoDate } from "../utils/dateUtils";

export function listTrips(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getTripOrThrow(userId: string, tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) {
    throw new HttpError(404, "TRIP_NOT_FOUND");
  }
  return trip;
}

export interface TripInput {
  name: string;
  startDate: string;
  endDate: string;
  baseCurrency: string;
  homeCurrency: string;
  totalBudget?: number | null;
  dailyBudget?: number | null;
  notes?: string | null;
}

export function createTrip(userId: string, data: TripInput) {
  return prisma.trip.create({
    data: {
      userId,
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      baseCurrency: data.baseCurrency.toUpperCase(),
      homeCurrency: data.homeCurrency.toUpperCase(),
      totalBudget: data.totalBudget ?? null,
      dailyBudget: data.dailyBudget ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function updateTrip(userId: string, tripId: string, data: Partial<TripInput>) {
  await getTripOrThrow(userId, tripId);
  return prisma.trip.update({
    where: { id: tripId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.baseCurrency !== undefined && { baseCurrency: data.baseCurrency.toUpperCase() }),
      ...(data.homeCurrency !== undefined && { homeCurrency: data.homeCurrency.toUpperCase() }),
      ...(data.totalBudget !== undefined && { totalBudget: data.totalBudget }),
      ...(data.dailyBudget !== undefined && { dailyBudget: data.dailyBudget }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

export async function deleteTrip(userId: string, tripId: string) {
  await getTripOrThrow(userId, tripId);
  await prisma.trip.delete({ where: { id: tripId } });
}

export async function getTripSummary(userId: string, tripId: string) {
  const trip = await getTripOrThrow(userId, tripId);
  const expenses = await prisma.expense.findMany({
    where: { tripId },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  const totalHomeMinor = expenses.reduce((sum, e) => sum + e.amountInHomeCurrencyMinor, 0);

  const byCategoryMap = new Map<string, { categoryId: string; name: string; color: string; totalMinor: number }>();
  for (const e of expenses) {
    const key = e.categoryId;
    const existing = byCategoryMap.get(key);
    if (existing) {
      existing.totalMinor += e.amountInHomeCurrencyMinor;
    } else {
      byCategoryMap.set(key, {
        categoryId: e.categoryId,
        name: e.category.name,
        color: e.category.color,
        totalMinor: e.amountInHomeCurrencyMinor,
      });
    }
  }

  const byDateMap = new Map<string, number>();
  for (const e of expenses) {
    const day = toIsoDateOnly(e.date);
    byDateMap.set(day, (byDateMap.get(day) ?? 0) + e.amountInHomeCurrencyMinor);
  }

  return {
    trip,
    totalHomeMinor,
    byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.totalMinor - a.totalMinor),
    byDate: Array.from(byDateMap.entries())
      .map(([date, totalMinor]) => ({ date, totalMinor }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    expenseCount: expenses.length,
  };
}

export async function getBudgetStatus(userId: string, tripId: string) {
  const trip = await getTripOrThrow(userId, tripId);
  const expenses = await prisma.expense.findMany({ where: { tripId } });

  const totalSpentMinor = expenses.reduce((sum, e) => sum + e.amountInHomeCurrencyMinor, 0);
  const today = todayIsoDate();
  const todaySpentMinor = expenses
    .filter((e) => toIsoDateOnly(e.date) === today)
    .reduce((sum, e) => sum + e.amountInHomeCurrencyMinor, 0);

  return {
    homeCurrency: trip.homeCurrency,
    totalBudget: trip.totalBudget,
    totalSpentMinor,
    totalRemainingMinor: trip.totalBudget !== null ? trip.totalBudget - totalSpentMinor : null,
    isOverTotalBudget: trip.totalBudget !== null ? totalSpentMinor > trip.totalBudget : false,
    dailyBudget: trip.dailyBudget,
    todaySpentMinor,
    isOverDailyBudget: trip.dailyBudget !== null ? todaySpentMinor > trip.dailyBudget : false,
  };
}

export async function compareTrips(userId: string, tripIds: string[]) {
  const trips = await prisma.trip.findMany({
    where: { id: { in: tripIds }, userId },
  });
  const results = await Promise.all(
    trips.map(async (trip) => {
      const expenses = await prisma.expense.findMany({ where: { tripId: trip.id } });
      const totalHomeMinor = expenses.reduce((sum, e) => sum + e.amountInHomeCurrencyMinor, 0);
      return {
        tripId: trip.id,
        name: trip.name,
        homeCurrency: trip.homeCurrency,
        startDate: trip.startDate,
        endDate: trip.endDate,
        totalHomeMinor,
        expenseCount: expenses.length,
      };
    })
  );
  return results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
