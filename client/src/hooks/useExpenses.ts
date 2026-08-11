import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expensesApi, type ExpenseInput } from "../api/endpoints";

export function useExpenses(
  tripId: string | undefined,
  filters?: { category?: string; dateFrom?: string; dateTo?: string; search?: string }
) {
  return useQuery({
    queryKey: ["trips", tripId, "expenses", filters],
    queryFn: () => expensesApi.list(tripId!, filters),
    enabled: !!tripId,
  });
}

function invalidateTripData(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  qc.invalidateQueries({ queryKey: ["trips", tripId, "expenses"] });
  qc.invalidateQueries({ queryKey: ["trips", tripId, "summary"] });
  qc.invalidateQueries({ queryKey: ["trips", tripId, "budget-status"] });
}

export function useCreateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseInput) => expensesApi.create(tripId, data),
    onSuccess: () => invalidateTripData(qc, tripId),
  });
}

export function useUpdateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseInput> }) => expensesApi.update(id, data),
    onSuccess: () => invalidateTripData(qc, tripId),
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => invalidateTripData(qc, tripId),
  });
}
