export interface User {
  id: string;
  email: string;
  name: string | null;
  homeCurrency: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  baseCurrency: string;
  homeCurrency: string;
  totalBudget: number | null;
  dailyBudget: number | null;
  notes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export type PaymentMethod = "CASH" | "CARD" | "OTHER";

export interface Expense {
  id: string;
  tripId: string;
  categoryId: string;
  amountMinor: number;
  currency: string;
  amountInHomeCurrencyMinor: number;
  amountInBaseCurrencyMinor: number;
  exchangeRateUsed: number;
  description: string;
  date: string;
  merchant: string | null;
  paymentMethod: PaymentMethod;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface TripSummary {
  trip: Trip;
  totalHomeMinor: number;
  byCategory: Array<{ categoryId: string; name: string; color: string; totalMinor: number }>;
  byDate: Array<{ date: string; totalMinor: number }>;
  expenseCount: number;
}

export interface BudgetStatus {
  homeCurrency: string;
  totalBudget: number | null;
  totalSpentMinor: number;
  totalRemainingMinor: number | null;
  isOverTotalBudget: boolean;
  dailyBudget: number | null;
  todaySpentMinor: number;
  isOverDailyBudget: boolean;
}

export interface TripCompareRow {
  tripId: string;
  name: string;
  homeCurrency: string;
  startDate: string;
  endDate: string;
  totalHomeMinor: number;
  expenseCount: number;
}
