import { api } from "./client";
import type {
  BudgetStatus,
  Category,
  Expense,
  PaymentMethod,
  Trip,
  TripCompareRow,
  TripSummary,
  User,
} from "../types";

// --- Auth ---
export const authApi = {
  register: (data: { email: string; password: string; name?: string; homeCurrency?: string }) =>
    api.post<{ user: User }>("/auth/register", data).then((r) => r.data.user),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User }>("/auth/login", data).then((r) => r.data.user),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
};

// --- Trips ---
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

export const tripsApi = {
  list: () => api.get<{ trips: Trip[] }>("/trips").then((r) => r.data.trips),
  get: (id: string) => api.get<{ trip: Trip }>(`/trips/${id}`).then((r) => r.data.trip),
  create: (data: TripInput) => api.post<{ trip: Trip }>("/trips", data).then((r) => r.data.trip),
  update: (id: string, data: Partial<TripInput>) =>
    api.put<{ trip: Trip }>(`/trips/${id}`, data).then((r) => r.data.trip),
  remove: (id: string) => api.delete(`/trips/${id}`),
  summary: (id: string) => api.get<TripSummary>(`/trips/${id}/summary`).then((r) => r.data),
  budgetStatus: (id: string) => api.get<BudgetStatus>(`/trips/${id}/budget-status`).then((r) => r.data),
  compare: (ids: string[]) =>
    api.get<{ trips: TripCompareRow[] }>(`/trips/compare`, { params: { ids: ids.join(",") } }).then((r) => r.data.trips),
};

// --- Categories ---
export interface CategoryInput {
  name: string;
  icon?: string;
  color?: string;
}

export const categoriesApi = {
  list: () => api.get<{ categories: Category[] }>("/categories").then((r) => r.data.categories),
  create: (data: CategoryInput) => api.post<{ category: Category }>("/categories", data).then((r) => r.data.category),
  update: (id: string, data: Partial<CategoryInput>) =>
    api.put<{ category: Category }>(`/categories/${id}`, data).then((r) => r.data.category),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

// --- Expenses ---
export interface ExpenseInput {
  categoryId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  merchant?: string | null;
  paymentMethod?: PaymentMethod;
  notes?: string | null;
}

export const expensesApi = {
  list: (tripId: string, filters?: { category?: string; dateFrom?: string; dateTo?: string; search?: string }) =>
    api.get<{ expenses: Expense[] }>(`/trips/${tripId}/expenses`, { params: filters }).then((r) => r.data.expenses),
  create: (tripId: string, data: ExpenseInput) =>
    api.post<{ expense: Expense }>(`/trips/${tripId}/expenses`, data).then((r) => r.data.expense),
  update: (id: string, data: Partial<ExpenseInput>) =>
    api.put<{ expense: Expense }>(`/expenses/${id}`, data).then((r) => r.data.expense),
  remove: (id: string) => api.delete(`/expenses/${id}`),
};

// --- Exchange rates ---
export const exchangeRatesApi = {
  latest: (base: string, symbols?: string[]) =>
    api
      .get<{ base: string; date: string; rates: Record<string, number> }>("/exchange-rates/latest", {
        params: { base, symbols: symbols?.join(",") },
      })
      .then((r) => r.data),
  convert: (amount: number, from: string, to: string, date?: string) =>
    api
      .get<{ amount: number; from: string; to: string; rate: number; result: number }>("/exchange-rates/convert", {
        params: { amount, from, to, date },
      })
      .then((r) => r.data),
  history: (base: string, target: string, start: string, end: string) =>
    api
      .get<{ base: string; target: string; points: Array<{ date: string; rate: number }>; available: boolean }>(
        "/exchange-rates/history",
        { params: { base, target, start, end } }
      )
      .then((r) => r.data),
};

// --- Export ---
export const exportApi = {
  csvUrl: (tripId: string) => `/api/trips/${tripId}/export/csv`,
  pdfUrl: (tripId: string) => `/api/trips/${tripId}/export/pdf`,
};
